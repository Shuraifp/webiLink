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
} from "../types/chatRoom";

export class SocketService {
  private io: Server;
  private roomService: IRoomService;
  private users: Map<string, Partial<UserData>> = new Map();
  private hosts: Map<string, string> = new Map();
  private breakoutRooms: Map<string, BreakoutRoom[]> = new Map();
  private polls: Map<string, Poll[]> = new Map();
  private questions: Map<string, Question[]> = new Map();
  private roomState: Map<string, RoomState> = new Map();

  constructor(io: Server, roomService: IRoomService) {
    this.io = io;
    this.roomService = roomService;
    this.setupSocket();
  }

  private logConnectedUsers(event: string = "State Update") {
    const connectedUsers = Array.from(this.io.sockets.sockets.entries()).map(
      ([socketId, socket]) => ({
        socketId,
        userId: socket.data.userId || "unknown",
        username: this.users.get(socketId)?.username || "unknown",
        avatar: this.users.get(socketId)?.avatar || "unknown",
        isMuted: this.users.get(socketId)?.isMuted ?? false,
        rooms: Array.from(socket.rooms).toString(),
        connected: socket.connected,
      })
    );
    console.log(`Connected Users (${event}):`, {
      count: connectedUsers.length,
      users: connectedUsers,
    });
  }

  private setupSocket() {
    this.io.on("connection", (socket: Socket) => {
      console.log("User connected:", socket.id);

      socket.onAny((event, args) => {
        console.log("socketId:", socket.id);
        console.log(`Received event: ${event}`, args);
      });

      socket.on("join-room", async (data) => this.handleJoin(socket, data));
      socket.on("chat-message", (data) => this.handleChatMessage(socket, data));
      socket.on("get-roomState", ({ roomId }) =>
        this.fetchRoomState(socket, roomId)
      );
      // socket.on("request-users", (data) =>
      //   this.handleRequestUsers(socket, data)
      // );
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
      socket.on("disconnect", () => this.handleDisconnect(socket));

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
    });
  }

  private async fetchRoomState(socket: Socket, roomId: string) {
    const user = this.users.get(socket.id);
    if (!user) return;
    let roomState = this.roomState.get(roomId);
    if (!roomState) {
      roomState = { isQAEnabled: false, isWhiteboardVisible: false };
      this.roomState.set(roomId, roomState);
    }
    socket.emit("room-state-fetched", roomState);
  }

  private async handleJoin(
    socket: Socket,
    { roomId, userId, username, avatar, isMuted }: UserData
  ) {
    try {
      const room = await this.roomService.getRoom(roomId);
      if (!room) {
        socket.emit("error", { message: "Room not found" });
        return;
      }
      const isHost = room.userId.toString() === userId;
      socket.join(roomId);

      if (!isHost && !this.hosts.has(roomId)) {
        socket.emit("waiting-for-host");
        console.log("Waiting for host:", roomId, username);
        return;
      }

      this.users.set(socket.id, { userId, username, avatar, isMuted });
      console.log("User joined room:", username);
      // this.logConnectedUsers(username);
      if (isHost) {
        this.hosts.set(roomId, socket.id);
        socket.to(roomId).emit("host-joined");
        console.log("Host joined", socket.id, roomId);
      } else {
        socket.to(roomId).emit("user-connected", {
          userId,
          username,
          avatar,
          isMuted,
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

      this.io.to(roomId).emit("user-list", this.getRoomUsers(roomId));
      this.emitBreakoutRoomUpdate(roomId);
    } catch (err) {
      console.error("Join error:", err);
      socket.emit("error", { message: "Failed to join room" });
    }
  }

  private getRoomUsers(roomId: string): Partial<UserData>[] {
    return Array.from(this.users.entries())
      .filter(([socketId]) => {
        const socket = this.io.sockets.sockets.get(socketId);
        return socket?.rooms.has(roomId);
      })
      .map(([_, user]) => user);
  }

  // private handleRequestUsers(socket: Socket, { roomId }: { roomId: string }) {
  //   socket.emit("user-list", this.getRoomUsers(roomId));
  // }

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
    console.log("user", user);
    console.log("socket.id", socket.id);
    console.log("users", this.users);
    // if (!user) return;
    socket.to(data.roomId).emit("whiteboard-draw", data);
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
        ([_, u]) => u.userId === targetUserId
      )?.[0];
      if (targetSocketId) {
        this.io.to(targetSocketId).emit("chat-message", message);
        socket.emit("chat-message", message);
      }
    } else if (userBreakoutRoom) {
      userBreakoutRoom.participants.forEach((participantId) => {
        const participantSocketId = Array.from(this.users.entries()).find(
          ([_, u]) => u.userId === participantId
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
          ([_, u]) => u.userId === participantId
        )?.[0];
        if (participantSocketId) {
          this.io.to(participantSocketId).emit("chat-message", message);
        }
      });
    }
  }

  private handleLeave(
    socket: Socket,
    { roomId, userId }: { roomId: string; userId: string }
  ) {
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

    this.io.to(roomId).emit("user-list", this.getRoomUsers(roomId));
    this.emitBreakoutRoomUpdate(roomId);

    if (this.isRoomEmpty(roomId)) {
      this.cleanupRoom(roomId);
    }
  }

  private handleDisconnect(socket: Socket) {
    const user = this.users.get(socket.id);
    if (!user) return;
    console.log("User disconnected:", socket.id, user.userId);
    const roomId = socket.rooms.values().next().value;
    if (roomId) {
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
    console.log(`Cleaned up data for empty room: ${roomId}`);
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
}
