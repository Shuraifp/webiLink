import { Server, Socket } from "socket.io";
import { IRoomService } from "../interfaces/services/IRoomService";
import {
  UserData,
  ChatMessageData,
  Role,
  BreakoutRoom,
  DrawEvent,
  Poll,
  PollStatus,
  Question,
  QuestionStatus,
  RoomState,
  TimerState,
  SocketEvent,
  Caption,
} from "../types/chatRoom";
import logger from "../utils/logger";
import { IMeetingService } from "../interfaces/services/IMeetingService";
import { IMeetingRepository } from "../interfaces/repositories/IMeetingRepository";

export class SocketService {
  private users: Map<string, UserData> = new Map();
  private hosts: Map<string, string> = new Map();
  private breakoutRooms: Map<string, BreakoutRoom[]> = new Map();
  private polls: Map<string, Poll[]> = new Map();
  private questions: Map<string, Question[]> = new Map();
  private roomState: Map<string, RoomState> = new Map();
  private timers: Map<
    string,
    { intervalId: NodeJS.Timeout | null; state: TimerState }
  > = new Map();
  private raisedHands: Map<string, Set<string>> = new Map();
  private meetingIds: Map<string, string> = new Map();

  constructor(
    private io: Server,
    private roomService: IRoomService,
    private meetingService: IMeetingService,
    private meetingRepository: IMeetingRepository
  ) {
    this.setupSocket();
  }

  private setupSocket() {
    this.io.on("connection", (socket: Socket) => {
      logger.info(`User connected: ${socket.id}`);

      socket.on("register-user", ({ userId }: { userId: string }) => {
        socket.join(`notification-${userId}`);
        logger.info(`User ${userId} joined notification room: notification-${userId}`);
      });

      socket.onAny((event, args) => {
        logger.info(`socketId: ${socket.id}`);
        logger.info(`Received event: ${event} ${args}`);
      });

      socket.on("join-room", async (data) => this.handleJoin(socket, data));
      socket.on("chat-message", (data) => this.handleChatMessage(socket, data));
      socket.on("get-roomState", ({ roomId }) =>
        this.fetchRoomState(socket, roomId)
      );
      socket.on("create-breakout-rooms", (data) =>
        this.handleCreateBreakoutRooms(socket, data)
      );
      socket.on("assign-breakout-room", (data) =>
        this.handleAssignBreakoutRoom(socket, data)
      );
      socket.on("end-breakout-rooms", (data) =>
        this.handleEndBreakoutRooms(socket, data)
      );
      socket.on("leave-room", (data: { roomId: string; userId: string }) =>
        this.handleLeave(socket, data)
      );
      socket.on("whiteboard-draw", (data: DrawEvent) =>
        this.handleWhiteboardDraw(socket, data)
      );

      // Caption

      socket.on("caption", ({ roomId, caption }) =>
        this.handleCaption(socket, { roomId, caption })
      );

      // Polls

      socket.on("fetch-polls", ({ roomId }) =>
        this.handleFetchPolls(socket, { roomId })
      );
      socket.on("create-poll", ({ roomId, poll }) =>
        this.handleCreatePoll(socket, { roomId, poll })
      );
      socket.on("launch-poll", ({ roomId, pollId }) =>
        this.handleLaunchPoll(socket, { roomId, pollId })
      );
      socket.on(
        "submit-poll-response",
        ({ roomId, pollId, userId, response }) =>
          this.handleSubmitPollResponse(socket, {
            roomId,
            pollId,
            userId,
            response,
          })
      );
      socket.on("end-poll", ({ roomId, pollId }) =>
        this.handleEndPoll(socket, { roomId, pollId })
      );
      socket.on("delete-poll", ({ roomId, pollId }) =>
        this.handleDeletePoll(socket, { roomId, pollId })
      );

      // QA
      socket.on("enable-QA", ({ roomId }) =>
        this.handleEnableQA(socket, { roomId })
      );
      socket.on("disable-QA", ({ roomId }) =>
        this.handleDisableQA(socket, { roomId })
      );
      socket.on("fetch-questions", ({ roomId }) =>
        this.handleFetchQuestions(socket, { roomId })
      );
      socket.on("ask-question", ({ roomId, question }) =>
        this.handleAskQuestion(socket, { roomId, question })
      );
      socket.on("delete-question", ({ roomId, questionId }) =>
        this.handleDeleteQuestion(socket, { roomId, questionId })
      );
      socket.on("upvote-question", ({ roomId, questionId, userId }) =>
        this.handleUpvoteQuestion(socket, { roomId, questionId, userId })
      );
      socket.on("publish-question", ({ roomId, questionId }) =>
        this.handlePublishQuestion(socket, { roomId, questionId })
      );
      socket.on("dismiss-question", ({ roomId, questionId }) =>
        this.handleDismissQuestion(socket, { roomId, questionId })
      );
      socket.on(
        "answer-question",
        ({ roomId, questionId, answer, answeredBy }) =>
          this.handleAnswerQuestion(socket, {
            roomId,
            questionId,
            answer,
            answeredBy,
          })
      );
      socket.on("close-question", ({ roomId, questionId }) =>
        this.handleCloseQuestion(socket, { roomId, questionId })
      );

      // Timer handlers
      socket.on(SocketEvent.TIMER_START, ({ roomId, duration }) =>
        this.handleTimerStart(socket, { roomId, duration })
      );
      socket.on(SocketEvent.TIMER_PAUSE, ({ roomId }) =>
        this.handleTimerPause(socket, { roomId })
      );
      socket.on(SocketEvent.TIMER_RESET, ({ roomId, duration }) =>
        this.handleTimerReset(socket, { roomId, duration })
      );
      socket.on("fetch-timer", ({ roomId }) =>
        this.handleFetchTimer(socket, { roomId })
      );

      // Rise hand
      socket.on("raise-hand", ({ roomId, userId }) =>
        this.handleRaiseHand(socket, { roomId, userId })
      );
      socket.on("lower-hand", ({ roomId, userId }) =>
        this.handleLowerHand(socket, { roomId, userId })
      );
      socket.on("fetch-raised-hands", ({ roomId }) =>
        this.handleFetchRaisedHands(socket, { roomId })
      );

      socket.on("disconnect", () => this.handleDisconnect(socket));
    });
  }

  public sendNotification(userId: string, notification: { type: string; message: string; data?: any }) {
    this.io.to(`notification-${userId}`).emit("notification", notification);
    logger.info(`Notification sent to user ${userId}: ${JSON.stringify(notification)}`);
  }

  private async fetchRoomState(socket: Socket, roomId: string) {
    const user = this.users.get(socket.id);
    if (!user) return;
    let roomState = this.roomState.get(roomId);
    if (!roomState) {
      roomState = { isQAEnabled: false, isDrawing: false, captions: [] };
      this.roomState.set(roomId, roomState);
    }
    socket.emit("room-state-fetched", roomState);
  }

  private async handleJoin(
    socket: Socket,
    { roomId, userId, username, avatar }: UserData
  ) {
    if (!roomId) {
      logger.error("Room ID is missing");
      return;
    }
    try {
      const room = await this.roomService.getRoom(roomId!);
      if (!room) {
        socket.emit("error", { message: "Room not found" });
        return;
      }
      const isHost = room.userId.toString() === userId;
      let meeting;
      if (this.meetingIds.get(roomId)) {
        meeting = await this.meetingService.getMeetingById(
          this.meetingIds.get(roomId)!
        );
      }
      if (!meeting && isHost) {
        meeting = await this.meetingService.createMeeting(
          room._id!.toString(),
          userId,
          room.name,
          room.slug,
          { userId, username, avatar }
        );
        this.meetingIds.set(roomId, meeting._id!.toString());
      } else if (!isHost && meeting) {
        await this.meetingService.addParticipant(meeting._id!.toString(), {
          userId,
          username,
          avatar,
        });
      } else if (!isHost && !this.hosts.has(roomId)) {
        socket.emit("waiting-for-host");
        logger.info("Waiting for host:", roomId, username);
        return;
      }

      socket.join(roomId!);

      logger.info("User joined room:", username);

      if (isHost) {
        this.hosts.set(roomId!, socket.id);
        this.users.set(socket.id, {
          userId,
          username,
          avatar,
          role: Role.HOST,
          roomId,
        });
        socket.to(roomId!).emit("host-joined");
        logger.info("Host joined", socket.id, roomId);
      } else {
        this.users.set(socket.id, {
          userId,
          username,
          avatar,
          role: Role.JOINEE,
          roomId,
        });
        socket.to(roomId!).emit("user-connected", {
          userId,
          username,
          avatar,
          role: Role.JOINEE,
        });
      }

      socket.emit("set-current-user", {
        userId,
        username,
        avatar,
        role: isHost ? Role.HOST : Role.JOINEE,
      });

      this.fetchRoomState(socket, roomId);
      this.handleFetchTimer(socket, { roomId });
      this.handleFetchRaisedHands(socket, { roomId });

      this.io.to(roomId).emit("user-list", this.getRoomUsers(roomId));
      this.emitBreakoutRoomUpdate(roomId);
    } catch (err) {
      logger.error("Error joining room:", err);
      socket.emit("error", { message: "Failed to join room" });
    }
  }

  private getRoomUsers(roomId: string): Partial<UserData>[] {
    const list = Array.from(this.users.entries())
      .filter(([, user]) => user.roomId === roomId)
      .map(([, user]) => user);
    return list;
  }

  private handleCaption(
    socket: Socket,
    { roomId, caption }: { roomId: string; caption: Caption }
  ) {
    const user = this.users.get(socket.id);
    if (!user || !user.username) {
      logger.warn(`No user or username found for socket: ${socket.id}`);
      return;
    }
     let roomState = this.roomState.get(roomId);
    if (!roomState) {
      roomState = { isQAEnabled: false, isDrawing: false, captions: [caption] };
      this.roomState.set(roomId, roomState);
    } else {
      roomState.captions.push(caption);
      this.roomState.set(roomId, roomState);
    }

    logger.info(`Caption by ${user.username}: ${caption.text}`);

    this.io.to(roomId).emit("caption", caption);
  }

  private handleCreateBreakoutRooms(
    socket: Socket,
    { roomId, rooms }: { roomId: string; rooms: { id: string; name: string }[] }
  ) {
    const user = this.users.get(socket.id);
    if (!user || this.hosts.get(roomId) !== socket.id) return;

    const breakoutRooms = rooms.map((room) => ({
      id: room.id,
      name: room.name,
      participants: [],
    }));
    this.breakoutRooms.set(roomId, breakoutRooms);
    this.emitBreakoutRoomUpdate(roomId);
  }

  private handleAssignBreakoutRoom(
    socket: Socket,
    {
      roomId,
      userId,
      breakoutRoomId,
    }: { roomId: string; userId: string; breakoutRoomId: string }
  ) {
    const user = this.users.get(socket.id);
    if (!user || this.hosts.get(roomId) !== socket.id) return;

    const breakoutRooms = this.breakoutRooms.get(roomId) || [];
    const updatedRooms = breakoutRooms.map((room) => ({
      ...room,
      participants: room.participants.filter((id) => id !== userId),
    }));

    const targetRoom = updatedRooms.find((room) => room.id === breakoutRoomId);
    if (targetRoom) {
      targetRoom.participants.push(userId);
    }

    this.breakoutRooms.set(roomId, updatedRooms);
    this.emitBreakoutRoomUpdate(roomId);
  }

  private handleEndBreakoutRooms(
    socket: Socket,
    { roomId }: { roomId: string }
  ) {
    const user = this.users.get(socket.id);
    if (!user || this.hosts.get(roomId) !== socket.id) return;

    this.breakoutRooms.delete(roomId);
    this.emitBreakoutRoomUpdate(roomId);
  }

  private emitBreakoutRoomUpdate(roomId: string, socket?: Socket) {
    const breakoutRooms = this.breakoutRooms.get(roomId) || [];
    const payload = {
      breakoutRooms,
      mainRoomParticipants: this.getRoomUsers(roomId)
        .filter(
          (user) =>
            !breakoutRooms.some((room) =>
              room.participants.includes(user.userId!)
            )
        )
        .map((user) => user.userId!),
    };
    if (socket) {
      socket.emit("breakout-room-update", payload);
    } else {
      this.io.to(roomId).emit("breakout-room-update", payload);
    }
  }

  private handleWhiteboardDraw(socket: Socket, data: DrawEvent) {
    const user = this.users.get(socket.id);
    if (!user || !user.username) {
      logger.warn(`No user or username found for socket: ${socket.id}`);
      return;
    }

    logger.info(`Drawing by ${user.username}`);
    const drawEventWithUsername: DrawEvent = {
      ...data,
      username: user.username,
    };

    this.io.to(data.roomId).emit("whiteboard-draw", drawEventWithUsername);
  }

  private handleChatMessage(
    socket: Socket,
    {
      roomId,
      userId,
      content,
      targetUserId,
    }: ChatMessageData & { targetUserId?: string }
  ) {
    const user = this.users.get(socket.id);
    if (!user || user.userId !== userId) return;
    const breakoutRooms = this.breakoutRooms.get(roomId) || [];
    const userBreakoutRoom = breakoutRooms.find((room) =>
      room.participants.includes(userId)
    );

    const message = {
      messageId: `${socket.id}-${Date.now()}`,
      userId,
      username: user.username,
      avatar: user.avatar,
      content,
      timestamp: Date.now(),
      isDM: !!targetUserId,
      targetUserId,
      breakoutRoomId: userBreakoutRoom?.id || null,
    };

    if (targetUserId) {
      const targetSocketId = Array.from(this.users.entries()).find(
        ([, u]) => u.userId === targetUserId
      )?.[0];
      if (targetSocketId) {
        this.io.to(targetSocketId).emit("chat-message", message);
        socket.emit("chat-message", message);
      }
    } else if (userBreakoutRoom) {
      userBreakoutRoom.participants.forEach((participantId) => {
        const participantSocketId = Array.from(this.users.entries()).find(
          ([, u]) => u.userId === participantId
        )?.[0];
        if (participantSocketId) {
          this.io.to(participantSocketId).emit("chat-message", message);
        }
      });
    } else {
      const mainRoomParticipants = this.getRoomUsers(roomId)
        .filter(
          (u) =>
            !breakoutRooms.some((room) => room.participants.includes(u.userId!))
        )
        .map((u) => u.userId!);
      mainRoomParticipants.forEach((participantId) => {
        const participantSocketId = Array.from(this.users.entries()).find(
          ([, u]) => u.userId === participantId
        )?.[0];
        if (participantSocketId) {
          this.io.to(participantSocketId).emit("chat-message", message);
        }
      });
    }
  }

  private async handleLeave(
    socket: Socket,
    { roomId, userId }: { roomId: string; userId: string }
  ) {
    logger.info(`User is leaving: ${socket.id}`);
    const meetingId = this.meetingIds.get(roomId);
    if (meetingId) {
      const meeting = await this.meetingService.getMeetingById(meetingId);
      if (meeting) {
        const participant = meeting.participants.find(
          (p) => p.userId.toString() === userId
        );
        if (participant) {
          participant.leaveTime = new Date();
          await this.meetingRepository.update(meetingId, meeting);
        }
        if (this.hosts.get(roomId) === socket.id) {
          await this.meetingService.endMeeting(meetingId);
        }
      }
    }
    socket.to(roomId).emit("user-left", userId);
    socket.leave(roomId);
    this.users.delete(socket.id);
    if (this.hosts.get(roomId) === socket.id) {
      this.hosts.delete(roomId);
      this.io.to(roomId).emit("host-left");
    }

    const breakoutRooms = this.breakoutRooms.get(roomId) || [];
    const updatedRooms = breakoutRooms.map((room) => ({
      ...room,
      participants: room.participants.filter((id) => id !== userId),
    }));
    this.breakoutRooms.set(roomId, updatedRooms);

    const roomRaisedHands = this.raisedHands.get(roomId);
    if (roomRaisedHands) {
      roomRaisedHands.delete(userId);
      this.raisedHands.set(roomId, roomRaisedHands);
      const username = this.users.get(socket.id)?.username;
      this.io.to(roomId).emit("hand-lowered", { userId, username });
    }

    this.io.to(roomId).emit("user-list", this.getRoomUsers(roomId));
    this.emitBreakoutRoomUpdate(roomId);

    if (this.isRoomEmpty(roomId)) {
      this.cleanupRoom(roomId);
    }
  }

  private async handleDisconnect(socket: Socket) {
    const user = this.users.get(socket.id);
    if (!user) return;
    logger.info(`User disconnected: ${socket.id} ${user.userId}`);
    const roomId = user.roomId;
    if (roomId) {
      const meetingId = this.meetingIds.get(roomId);
      if (meetingId) {
        const meeting = await this.meetingService.getMeetingById(meetingId);
        if (meeting) {
          const participant = meeting.participants.find(
            (p) => p.userId.toString() === user.userId
          );
          if (participant) {
            participant.leaveTime = new Date();
            await this.meetingRepository.update(meetingId, meeting);
          }
          if (this.hosts.get(roomId) === socket.id) {
            await this.meetingService.endMeeting(meetingId);
          }
        }
      }
      socket.to(roomId).emit("user-disconnected", user.userId);
      if (this.hosts.get(roomId) === socket.id) {
        this.hosts.delete(roomId);
        this.io.to(roomId).emit("host-left");
      }

      const breakoutRooms = this.breakoutRooms.get(roomId) || [];
      const updatedRooms = breakoutRooms.map((room) => ({
        ...room,
        participants: room.participants.filter((id) => id !== user.userId),
      }));
      this.breakoutRooms.set(roomId, updatedRooms);

      const roomRaisedHands = this.raisedHands.get(roomId);
      if (roomRaisedHands) {
        roomRaisedHands.delete(user.userId!);
        this.raisedHands.set(roomId, roomRaisedHands);
        this.io.to(roomId).emit("hand-lowered", {
          userId: user.userId,
          username: user.username,
        });
      }

      this.users.delete(socket.id);

      this.io.to(roomId).emit("user-list", this.getRoomUsers(roomId));
      this.emitBreakoutRoomUpdate(roomId);

      if (this.isRoomEmpty(roomId)) {
        this.cleanupRoom(roomId);
      }
    }
    this.users.delete(socket.id);
  }

  private isRoomEmpty(roomId: string): boolean {
    const room = this.io.sockets.adapter.rooms.get(roomId);
    return !room || room.size === 0;
  }

  private cleanupRoom(roomId: string) {
    this.roomState.delete(roomId);
    this.questions.delete(roomId);
    this.polls.delete(roomId);
    this.breakoutRooms.delete(roomId);
    this.hosts.delete(roomId);
    this.raisedHands.delete(roomId);
    this.meetingIds.delete(roomId);
    const timer = this.timers.get(roomId);
    if (timer?.intervalId) {
      clearInterval(timer.intervalId);
    }
    this.timers.delete(roomId);
    logger.info(`Cleaned up data for empty room: ${roomId}`);
  }

  // Polls
  private async handleFetchPolls(
    socket: Socket,
    { roomId }: { roomId: string }
  ) {
    const user = this.users.get(socket.id);
    if (!user) return;

    const roomPolls = this.polls.get(roomId) || [];
    socket.emit("polls-fetched", roomPolls);
  }

  private async handleCreatePoll(
    socket: Socket,
    { roomId, poll }: { roomId: string; poll: Poll }
  ) {
    const user = this.users.get(socket.id);
    if (!user || this.hosts.get(roomId) !== socket.id) {
      socket.emit("error", { message: "Only the host can create polls" });
      return;
    }

    if (!this.polls.has(roomId)) {
      this.polls.set(roomId, []);
    }

    const roomPolls = this.polls.get(roomId)!;
    roomPolls.push({ ...poll, responses: {} });
    this.polls.set(roomId, roomPolls);

    this.io.to(roomId).emit("poll-created", poll);
  }

  private handleLaunchPoll(
    socket: Socket,
    { roomId, pollId }: { roomId: string; pollId: string }
  ) {
    const user = this.users.get(socket.id);
    if (!user || this.hosts.get(roomId) !== socket.id) {
      socket.emit("error", { message: "Only the host can launch polls" });
      return;
    }

    const roomPolls = this.polls.get(roomId);
    if (!roomPolls) {
      socket.emit("error", { message: "No polls found for this room" });
      return;
    }

    const poll = roomPolls.find((p) => p.id === Number(pollId));
    if (!poll) {
      socket.emit("error", { message: "Poll not found" });
      return;
    }

    poll.status = PollStatus.ACTIVE;
    this.polls.set(roomId, roomPolls);

    this.io.to(roomId).emit("poll-launched", pollId);
  }

  private async handleSubmitPollResponse(
    socket: Socket,
    {
      roomId,
      pollId,
      userId,
      response,
    }: { roomId: string; pollId: number; userId: string; response: string[] }
  ) {
    const user = this.users.get(socket.id);
    if (!user || user.userId !== userId) {
      socket.emit("error", { message: "Invalid user" });
      return;
    }

    const roomPolls = this.polls.get(roomId);
    if (!roomPolls) {
      socket.emit("error", { message: "No polls found for this room" });
      return;
    }

    const poll = roomPolls.find((p) => p.id === pollId);
    if (!poll || poll.status !== PollStatus.ACTIVE) {
      socket.emit("error", { message: "Poll not found or not active" });
      return;
    }

    poll.responses[userId] = response;
    this.polls.set(roomId, roomPolls);

    this.io
      .to(roomId)
      .emit("poll-updated", { pollId, responses: poll.responses });
  }

  private async handleEndPoll(
    socket: Socket,
    { roomId, pollId }: { roomId: string; pollId: number }
  ) {
    const user = this.users.get(socket.id);
    if (!user || this.hosts.get(roomId) !== socket.id) {
      socket.emit("error", { message: "Only the host can end polls" });
      return;
    }

    const roomPolls = this.polls.get(roomId);
    if (!roomPolls) {
      socket.emit("error", { message: "No polls found for this room" });
      return;
    }

    const poll = roomPolls.find((p) => p.id === pollId);
    if (!poll) {
      socket.emit("error", { message: "Poll not found" });
      return;
    }

    poll.status = PollStatus.ENDED;
    this.polls.set(roomId, roomPolls);

    this.io.to(roomId).emit("poll-ended", pollId);
  }

  private async handleDeletePoll(
    socket: Socket,
    { roomId, pollId }: { roomId: string; pollId: number }
  ) {
    const user = this.users.get(socket.id);
    if (!user || this.hosts.get(roomId) !== socket.id) {
      socket.emit("error", { message: "Only the host can delete polls" });
      return;
    }

    const roomPolls = this.polls.get(roomId);
    if (!roomPolls) {
      socket.emit("error", { message: "No polls found for this room" });
      return;
    }

    const pollIndex = roomPolls.findIndex((p) => p.id === pollId);
    if (pollIndex === -1) {
      socket.emit("error", { message: "Poll not found" });
      return;
    }

    roomPolls.splice(pollIndex, 1);
    this.polls.set(roomId, roomPolls);

    this.io.to(roomId).emit("poll-deleted", pollId);
  }

  // QA

  private handleEnableQA(socket: Socket, { roomId }: { roomId: string }) {
    const user = this.users.get(socket.id);
    if (!user) return;

    const roomstate = this.roomState.get(roomId)!;

    roomstate.isQAEnabled = true;

    this.io.to(roomId).emit("QA-Enabled", { isEnabled: true });
  }

  private handleDisableQA(socket: Socket, { roomId }: { roomId: string }) {
    const user = this.users.get(socket.id);
    if (!user) return;

    const roomstate = this.roomState.get(roomId)!;

    roomstate.isQAEnabled = false;

    this.io.to(roomId).emit("QA-Disabled", { isEnabled: false });
  }

  private async handleFetchQuestions(
    socket: Socket,
    { roomId }: { roomId: string }
  ) {
    const user = this.users.get(socket.id);
    if (!user) return;

    const roomQuestions = this.questions.get(roomId) || [];
    socket.emit("questions-fetched", roomQuestions);
  }

  private async handleAskQuestion(
    socket: Socket,
    { roomId, question }: { roomId: string; question: Question }
  ) {
    const user = this.users.get(socket.id);
    if (!user || user.userId !== question.userId) {
      socket.emit("error", { message: "Invalid user" });
      return;
    }

    if (!this.questions.has(roomId)) {
      this.questions.set(roomId, []);
    }

    const roomQuestions = this.questions.get(roomId)!;
    roomQuestions.push({
      ...question,
      upvotes: [],
      isVisible: false,
      isAnswered: false,
    });
    this.questions.set(roomId, roomQuestions);

    this.io.to(roomId).emit("question-asked", question);
  }

  private async handleDeleteQuestion(
    socket: Socket,
    { roomId, questionId }: { roomId: string; questionId: string }
  ) {
    const user = this.users.get(socket.id);
    if (!user) {
      socket.emit("error", { message: "Invalid user" });
      return;
    }

    const roomQuestions = this.questions.get(roomId);
    if (!roomQuestions) {
      socket.emit("error", { message: "No questions found for this room" });
      return;
    }

    const questionIndex = roomQuestions.findIndex(
      (q) => q.id === Number(questionId)
    );
    if (questionIndex === -1) {
      socket.emit("error", { message: "Question not found" });
      return;
    }

    roomQuestions.splice(questionIndex, 1);
    this.questions.set(roomId, roomQuestions);

    this.io.to(roomId).emit("question-dismissed", questionId);
  }

  private async handleUpvoteQuestion(
    socket: Socket,
    {
      roomId,
      questionId,
      userId,
    }: { roomId: string; questionId: number; userId: string }
  ) {
    const user = this.users.get(socket.id);
    if (!user || user.userId !== userId) {
      socket.emit("error", { message: "Invalid user" });
      return;
    }

    const roomQuestions = this.questions.get(roomId);
    if (!roomQuestions) {
      socket.emit("error", { message: "No questions found for this room" });
      return;
    }

    const question = roomQuestions.find((q) => q.id === questionId);
    if (
      !question ||
      !question.isVisible ||
      question.isAnswered ||
      question.status === QuestionStatus.CLOSED
    ) {
      socket.emit("error", { message: "Cannot upvote this question" });
      return;
    }

    if (question.upvotes.includes(userId)) {
      question.upvotes = question.upvotes.filter((id) => id !== userId);
    } else {
      question.upvotes.push(userId);
    }
    this.questions.set(roomId, roomQuestions);

    this.io
      .to(roomId)
      .emit("question-upvoted", { questionId, votes: question.upvotes });
  }

  private async handlePublishQuestion(
    socket: Socket,
    { roomId, questionId }: { roomId: string; questionId: number }
  ) {
    const user = this.users.get(socket.id);
    if (!user || this.hosts.get(roomId) !== socket.id) {
      socket.emit("error", { message: "Only the host can publish questions" });
      return;
    }

    const roomQuestions = this.questions.get(roomId);
    if (!roomQuestions) {
      socket.emit("error", { message: "No questions found for this room" });
      return;
    }

    const question = roomQuestions.find((q) => q.id === questionId);
    if (!question) {
      socket.emit("error", { message: "Question not found" });
      return;
    }

    question.isVisible = true;
    this.questions.set(roomId, roomQuestions);

    this.io.to(roomId).emit("question-published", questionId);
  }

  private async handleDismissQuestion(
    socket: Socket,
    { roomId, questionId }: { roomId: string; questionId: number }
  ) {
    const user = this.users.get(socket.id);
    if (!user || this.hosts.get(roomId) !== socket.id) {
      socket.emit("error", { message: "Only the host can dismiss questions" });
      return;
    }

    const roomQuestions = this.questions.get(roomId);
    if (!roomQuestions) {
      socket.emit("error", { message: "No questions found for this room" });
      return;
    }

    const questionIndex = roomQuestions.findIndex((q) => q.id === questionId);
    if (questionIndex === -1) {
      socket.emit("error", { message: "Question not found" });
      return;
    }

    roomQuestions.splice(questionIndex, 1);
    this.questions.set(roomId, roomQuestions);

    this.io.to(roomId).emit("question-dismissed", questionId);
  }

  private async handleAnswerQuestion(
    socket: Socket,
    {
      roomId,
      questionId,
      answer,
      answeredBy,
    }: {
      roomId: string;
      questionId: number;
      answer?: string;
      answeredBy: string;
    }
  ) {
    const user = this.users.get(socket.id);
    if (!user || this.hosts.get(roomId) !== socket.id) {
      socket.emit("error", { message: "Only the host can answer questions" });
      return;
    }

    const roomQuestions = this.questions.get(roomId);
    if (!roomQuestions) {
      socket.emit("error", { message: "No questions found for this room" });
      return;
    }

    const question = roomQuestions.find((q) => q.id === questionId);
    if (!question) {
      socket.emit("error", { message: "Question not found" });
      return;
    }

    question.answer = answer;
    question.answeredBy = answeredBy;
    question.isAnswered = true;
    this.questions.set(roomId, roomQuestions);

    this.io
      .to(roomId)
      .emit("question-answered", { questionId, answer, answeredBy });
  }

  private async handleCloseQuestion(
    socket: Socket,
    { roomId, questionId }: { roomId: string; questionId: number }
  ) {
    const user = this.users.get(socket.id);
    if (!user || this.hosts.get(roomId) !== socket.id) {
      socket.emit("error", { message: "Only the host can close questions" });
      return;
    }

    const roomQuestions = this.questions.get(roomId);
    if (!roomQuestions) {
      socket.emit("error", { message: "No questions found for this room" });
      return;
    }

    const question = roomQuestions.find((q) => q.id === questionId);
    if (!question) {
      socket.emit("error", { message: "Question not found" });
      return;
    }

    question.status = QuestionStatus.CLOSED;
    this.questions.set(roomId, roomQuestions);

    this.io.to(roomId).emit("question-closed", questionId);
  }

  private handleTimerStart(
    socket: Socket,
    { roomId, duration }: { roomId: string; duration: number }
  ) {
    const user = this.users.get(socket.id);
    if (!user || this.hosts.get(roomId) !== socket.id) {
      socket.emit("error", { message: "Only the host can start the timer" });
      return;
    }

    let timer = this.timers.get(roomId);
    if (!timer) {
      timer = {
        intervalId: null,
        state: { isRunning: false, duration, timeLeft: duration },
      };
    } else {
      timer.state.duration = duration;
      timer.state.timeLeft = duration;
    }

    if (timer.intervalId) {
      clearInterval(timer.intervalId);
    }

    timer.state.isRunning = true;
    timer.intervalId = setInterval(() => {
      if (timer!.state.timeLeft <= 0) {
        clearInterval(timer!.intervalId!);
        timer!.state.isRunning = false;
        timer!.intervalId = null;
      } else {
        timer!.state.timeLeft -= 1;
      }
      this.io.to(roomId).emit(SocketEvent.TIMER_UPDATE, timer!.state);
    }, 1000);

    this.timers.set(roomId, timer);
    this.io.to(roomId).emit(SocketEvent.TIMER_UPDATE, timer.state);
  }

  private handleTimerPause(socket: Socket, { roomId }: { roomId: string }) {
    const user = this.users.get(socket.id);
    if (!user || this.hosts.get(roomId) !== socket.id) {
      socket.emit("error", { message: "Only the host can pause the timer" });
      return;
    }

    const timer = this.timers.get(roomId);
    if (!timer || !timer.intervalId) return;

    clearInterval(timer.intervalId);
    timer.intervalId = null;
    timer.state.isRunning = false;

    this.timers.set(roomId, timer);
    this.io.to(roomId).emit(SocketEvent.TIMER_UPDATE, timer.state);
  }

  private handleTimerReset(
    socket: Socket,
    { roomId, duration }: { roomId: string; duration: number }
  ) {
    const user = this.users.get(socket.id);
    if (!user || this.hosts.get(roomId) !== socket.id) {
      socket.emit("error", { message: "Only the host can reset the timer" });
      return;
    }

    let timer = this.timers.get(roomId);
    if (!timer) {
      timer = {
        intervalId: null,
        state: { isRunning: false, duration, timeLeft: duration },
      };
    } else {
      if (timer.intervalId) {
        clearInterval(timer.intervalId);
      }
      timer.intervalId = null;
      timer.state = { isRunning: false, duration, timeLeft: duration };
    }

    this.timers.set(roomId, timer);
    this.io.to(roomId).emit(SocketEvent.TIMER_UPDATE, timer.state);
  }

  private handleFetchTimer(socket: Socket, { roomId }: { roomId: string }) {
    const timer = this.timers.get(roomId);
    if (timer) {
      socket.emit(SocketEvent.TIMER_UPDATE, timer.state);
    } else {
      socket.emit(SocketEvent.TIMER_UPDATE, {
        isRunning: false,
        duration: 0,
        timeLeft: 0,
      });
    }
  }

  private handleRaiseHand(
    socket: Socket,
    { roomId, userId }: { roomId: string; userId: string }
  ) {
    const user = this.users.get(socket.id);
    if (!user || user.userId !== userId) {
      socket.emit("error", { message: "Invalid user" });
      return;
    }

    if (!this.raisedHands.has(roomId)) {
      this.raisedHands.set(roomId, new Set());
    }

    const roomRaisedHands = this.raisedHands.get(roomId)!;
    if (!roomRaisedHands.has(userId)) {
      roomRaisedHands.add(userId);
      this.raisedHands.set(roomId, roomRaisedHands);
      this.io
        .to(roomId)
        .emit("hand-raised", { userId, username: user.username });
    }
  }

  private handleLowerHand(
    socket: Socket,
    { roomId, userId }: { roomId: string; userId: string }
  ) {
    const user = this.users.get(socket.id);
    if (!user || user.userId !== userId) {
      socket.emit("error", { message: "Invalid user" });
      return;
    }

    const roomRaisedHands = this.raisedHands.get(roomId);
    if (roomRaisedHands && roomRaisedHands.has(userId)) {
      roomRaisedHands.delete(userId);
      this.raisedHands.set(roomId, roomRaisedHands);
      this.io
        .to(roomId)
        .emit("hand-lowered", { userId, username: user.username });
    }
  }

  private handleFetchRaisedHands(
    socket: Socket,
    { roomId }: { roomId: string }
  ) {
    const user = this.users.get(socket.id);
    if (!user) return;

    const roomRaisedHands = this.raisedHands.get(roomId) || new Set();
    const raisedHandsWithUsernames = Array.from(roomRaisedHands).map(
      (userId) => {
        const user = Array.from(this.users.entries()).find(
          ([, u]) => u.userId === userId
        )?.[1];
        return { userId, username: user?.username || "Unknown" };
      }
    );
    socket.emit("raised-hands-fetched", raisedHandsWithUsernames);
  }
}
