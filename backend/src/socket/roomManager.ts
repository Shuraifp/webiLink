import { Server, Socket } from "socket.io";
import { RoomService } from "../services/roomService";
import { SignalingData, UserConnectingData, Role, ChatMessage } from "../types/chatRoom";

interface ToggleMuteData {
  roomId: string;
  userId: string;
  isMuted: boolean;
}

export class RoomManager {
  private io: Server;
  private roomService: RoomService;
  private hostSockets: Map<string, string>;
  private userMetadata: Map<
    string,
    { userId: string; avatar: string; username: string, isMuted: boolean }
  >;


  constructor(io: Server, roomService: RoomService) {
    this.io = io;
    this.roomService = roomService;
    this.hostSockets = new Map();
    this.userMetadata = new Map();
  }

  async handleJoin(
    socket: Socket,
    { roomId, userId, username, avatar, isMuted }: UserConnectingData
  ) {
    try {
      console.log(`handleJoin: userId=${userId}, roomId=${roomId}`);
      socket.join(roomId);
      const room = await this.roomService.getRoom(roomId);
      if (!room) {
        socket.emit("error", { message: "Room not found" });
        return;
      }

      this.userMetadata.set(socket.id, { userId, username, avatar, isMuted });
      const isHost = room.userId == userId;
      if (isHost) {
        this.hostSockets.set(roomId, socket.id);
        socket.to(roomId).emit("host-joined");
        socket.emit("host-status", socket.id);
      } else {
        const hostSocketId = this.isHostPresent(roomId);
        if (hostSocketId) {
          socket.emit("room-status", { hostPresent: true });
          socket.to(roomId).emit("user-connected", {
            userId,
            socketId: socket.id,
            username,
            avatar,
            role: Role.JOINEE,
            isMuted
          });
        } else {
          socket.emit("waiting-for-host");
        }
      }
    } catch (err: any) {
      console.error("Join error:", err);
      socket.emit("error", { message: err.message || "Failed to join room" });
    }
  }

  handleSignaling(socket: Socket, event: string, data: SignalingData) {
    console.log(event);
    const { roomId, target, userId } = data;
    if (!this.isHostPresent(roomId)) return;
    const metadata = this.userMetadata.get(socket.id);
    const isHost = this.hostSockets.get(roomId) === socket.id;

    socket.to(target!).emit(event, {
      ...data,
      socketId: socket.id,
      userId: metadata?.userId,
      avatar: metadata?.avatar,
      username: metadata?.username,
      role: isHost ? Role.HOST : Role.JOINEE,
    });
  }

  handleToggleMute(
    socket: Socket,
    { roomId, userId, isMuted }: ToggleMuteData
  ) {
    console.log(`handleToggleMute: userId=${userId}, isMuted=${isMuted}, roomId=${roomId}`);
    const meta = this.userMetadata.get(socket.id);
    if (meta && meta.userId === userId) {
      this.userMetadata.set(socket.id, { ...meta, isMuted });
    } else {
      console.warn(`Invalid toggle-mute request: userId=${userId}, socketId=${socket.id}`);
      return;
    }

    this.io.to(roomId).emit("mute-status", { userId, isMuted });
  }

  handleDisconnect(socket: Socket) {
    const socketId = socket.id;
    for (const [roomId, hostSocketId] of this.hostSockets) {
      if (hostSocketId === socketId) {
        this.hostSockets.delete(roomId);
        this.io.to(roomId).emit("host-left");
      }
    }
    const metadata = this.userMetadata.get(socketId);
    if (metadata) {
      socket.to([...socket.rooms]).emit("user-disconnected", metadata.userId);
      this.userMetadata.delete(socketId);
    }
  }

  isHostPresent(roomId: string): boolean {
    const hostSocketId = this.hostSockets.get(roomId);
    return !!hostSocketId && !!this.io.sockets.sockets.get(hostSocketId);
  }

  handleLeave(
    socket: Socket,
    { userId, roomId }: { userId: string; roomId: string }
  ) {
    console.log("user " + userId + " leaving room");
    socket.leave(roomId);
    socket.to(roomId).emit("user-disconnected", userId);
  }

  handleReadyForStream(socket: Socket, data: SignalingData) {
    const { roomId } = data;
    console.log(`${data.username} is ready to share their stream`);

    socket.to(roomId).emit("ready-for-stream", {
      ...data,
    });
  }
}
