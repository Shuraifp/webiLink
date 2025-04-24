import { Server, Socket } from "socket.io";
import { IRoomService } from "../interfaces/services/IRoomService";
import { UserData, ChatMessageData, Role, BreakoutRoom } from "../types/chatRoom";

export class SocketService {
  private io: Server;
  private roomService: IRoomService;
  private users: Map<string, Partial<UserData>> = new Map();
  private hosts: Map<string, string> = new Map();
  private breakoutRooms: Map<string, BreakoutRoom[]> = new Map();

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

      socket.on("join-room", async (data) => this.handleJoin(socket, data));
      socket.on("chat-message", (data) => this.handleChatMessage(socket, data));
      socket.on("request-users", (data) => this.handleRequestUsers(socket, data));
      socket.on("create-breakout-rooms", (data) => this.handleCreateBreakoutRooms(socket, data));
      socket.on("assign-breakout-room", (data) => this.handleAssignBreakoutRoom(socket, data));
      socket.on("end-breakout-rooms", (data) => this.handleEndBreakoutRooms(socket, data));
      socket.on("leave-room", (data: { roomId: string; userId: string }) => this.handleLeave(socket, data));
      socket.on("disconnect", () => this.handleDisconnect(socket));
    });
  }

  private async handleJoin(socket: Socket, { roomId, userId, username, avatar, isMuted }: UserData) {
    try {
      const room = await this.roomService.getRoom(roomId);
      if (!room) {
        socket.emit("error", { message: "Room not found" });
        return;
      }
      const isHost = room.userId.toString() === userId;
      if (!isHost && !this.hosts.has(roomId)) {
        socket.emit("waiting-for-host");
        return;
      }

      socket.join(roomId);
      this.users.set(socket.id, { userId, username, avatar, isMuted });

      if (isHost) {
        this.hosts.set(roomId, socket.id);
        socket.to(roomId).emit("host-joined");
        console.log("Host joined", socket.id, roomId);
      } else {
        socket.to(roomId).emit("user-connected", { userId, username, avatar, isMuted, role: Role.JOINEE});
        socket.emit("room-status", { hostPresent: true });
      }

      socket.emit("set-current-user", {
        userId,
        username,
        avatar,
        role: isHost ? Role.HOST : Role.JOINEE,
      });

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

  private handleRequestUsers(socket: Socket, { roomId }: { roomId: string }) {
    socket.emit("user-list", this.getRoomUsers(roomId));
  }

  
  private handleCreateBreakoutRooms(socket: Socket, { roomId, rooms }: { roomId: string; rooms: { id: string; name: string }[] }) {
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

  
  private handleAssignBreakoutRoom(socket: Socket, { roomId, userId, breakoutRoomId }: { roomId: string; userId: string; breakoutRoomId: string }) {
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

  
  private handleEndBreakoutRooms(socket: Socket, { roomId }: { roomId: string }) {
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
        .filter((user) => !breakoutRooms.some((room) => room.participants.includes(user.userId!)))
        .map((user) => user.userId!),
    };
    if (socket) {
      socket.emit("breakout-room-update", payload);
    } else {
      this.io.to(roomId).emit("breakout-room-update", payload);
    }
  }


  private handleChatMessage(socket: Socket, { roomId, userId, content, targetUserId }: ChatMessageData & { targetUserId?: string }) {
    const user = this.users.get(socket.id);
    if (!user || user.userId !== userId) return;

    
    const breakoutRooms = this.breakoutRooms.get(roomId) || [];
    const userBreakoutRoom = breakoutRooms.find((room) => room.participants.includes(userId));

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
      const targetSocketId = Array.from(this.users.entries()).find(([_, u]) => u.userId === targetUserId)?.[0];
      if (targetSocketId) {
        this.io.to(targetSocketId).emit("chat-message", message);
        socket.emit("chat-message", message);
      }
    } else if (userBreakoutRoom) {
      userBreakoutRoom.participants.forEach((participantId) => {
        const participantSocketId = Array.from(this.users.entries()).find(([_, u]) => u.userId === participantId)?.[0];
        if (participantSocketId) {
          this.io.to(participantSocketId).emit("chat-message", message);
        }
      });
    } else {
      const mainRoomParticipants = this.getRoomUsers(roomId)
        .filter((u) => !breakoutRooms.some((room) => room.participants.includes(u.userId!)))
        .map((u) => u.userId!);
      mainRoomParticipants.forEach((participantId) => {
        const participantSocketId = Array.from(this.users.entries()).find(([_, u]) => u.userId === participantId)?.[0];
        if (participantSocketId) {
          this.io.to(participantSocketId).emit("chat-message", message);
        }
      });
    }
  }

  private handleLeave(socket: Socket, { roomId, userId }: { roomId: string; userId: string }) {
    socket.to(roomId).emit("user-disconnected", userId);
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
    }
    this.users.delete(socket.id);
  }
}