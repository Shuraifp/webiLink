import { Server, Socket } from "socket.io";
import { SfuService } from "./SFUService";
import { IRoomService } from "../interfaces/services/IRoomService";
import type {
  DtlsParameters,
  RtpParameters,
  RtpCapabilities,
} from "mediasoup/node/lib/types";
import {
  UserData,
  JoinRoomData,
  ChatMessageData,
  ToggleMuteData,
  TransportDetails,
  ConsumerDetails,
  Status,
  Role,
} from "../types/chatRoom";

export class SocketService {
  private io: Server;
  private sfuService: SfuService;
  private roomService: IRoomService;
  private users: Map<string, UserData> = new Map();
  private hosts: Map<string, string> = new Map();

  constructor(io: Server, sfuService: SfuService, roomService: IRoomService) {
    this.io = io;
    this.sfuService = sfuService;
    this.roomService = roomService;
    this.setupSocket();
  }

  private disconnectAllSockets() {
    console.log("Disconnecting all socket connections...");
    for (const [socketId, socket] of this.io.sockets.sockets) {
      console.log(`Disconnecting socket ${socketId} (userId: ${socket.data.userId || "unknown"})`);
      socket.emit("server-disconnect", { message: "Server resetting connections" });
      socket.disconnect(true);
    }
    this.users.clear();
    this.hosts.clear();
    console.log("All sockets disconnected, maps cleared");
    this.logConnectedUsers("After Disconnect All");
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
      // this.disconnectAllSockets();
      // this.logConnectedUsers("User Connected");

      socket.on("join-room", async (data: JoinRoomData) =>
        this.handleJoin(socket, data)
      );
      socket.on("chat-message", (data: ChatMessageData) =>
        this.handleChatMessage(socket, data)
      );
      socket.on("toggle-mute", (data: ToggleMuteData) =>
        this.handleToggleMute(socket, data)
      );
      socket.on(
        "connect-transport",
        async (data: {
          dtlsParameters: DtlsParameters;
          type: "send" | "recv";
        }) => {
          const { dtlsParameters, type } = data;
          this.handleConnectTransport(socket, { dtlsParameters }, type);
        }
      );
      socket.on(
        "produce",
        async (
          data: { kind: "audio" | "video"; rtpParameters: RtpParameters },
          callback
        ) => this.handleProduce(socket, data, callback)
      );
      socket.on(
        "consume",
        async (
          data: { producerId: string; rtpCapabilities: RtpCapabilities },
          callback
        ) => this.handleConsume(socket, data, callback)
      );
      socket.on("disconnect", () => this.handleDisconnect(socket));
    });
  }

  private async handleJoin(
    socket: Socket,
    { roomId, userId, username, avatar, isMuted }: JoinRoomData
  ) {
    try {
      const room = await this.roomService.getRoomBySlug(roomId);
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
        socket.emit("host-status", socket.id);
        console.log('host joined', socket.id, roomId);
      } else {
        socket
          .to(roomId)
          .emit("user-connected", { userId, username, avatar, isMuted });
        socket.emit("room-status", { hostPresent: true });
      }

      const { sendTransport, recvTransport } =
        await this.sfuService.createTransports(roomId, userId);
        console.log('sendTransport');
      socket.emit("sfu-transports", {
        sendTransportDetails: sendTransport,
        recvTransportDetails: recvTransport,
      });
      socket.emit("set-status", isHost ? Status.ACTIVE : Status.WAITING);
      socket.emit("set-current-user", {
        userId,
        username,
        avatar,
        role: isHost ? Role.HOST : Role.JOINEE,
      });
    } catch (err) {
      console.error("Join error:", err);
      socket.emit("error", { message: "Failed to join room" });
    }
  }

  private handleChatMessage(
    socket: Socket,
    { roomId, userId, content }: ChatMessageData
  ) {
    const user = this.users.get(socket.id);
    if (!user || user.userId !== userId) return;

    const message = {
      messageId: `${socket.id}-${Date.now()}`,
      userId,
      username: user.username,
      avatar: user.avatar,
      content,
      timestamp: Date.now(),
    };

    this.io.to(roomId).emit("chat-message", message);
  }

  private handleToggleMute(
    socket: Socket,
    { roomId, userId, isMuted }: ToggleMuteData
  ) {
    const user = this.users.get(socket.id);
    if (!user || user.userId !== userId) return;

    user.isMuted = isMuted;
    this.users.set(socket.id, user);
    this.io.to(roomId).emit("mute-status", { userId, isMuted });
  }

  private async handleConnectTransport(
    socket: Socket,
    { dtlsParameters }: { dtlsParameters: DtlsParameters },
    type: "send" | "recv"
  ) {
    const user = this.users.get(socket.id);
    if (!user) return;

    try {
      const roomId = socket.rooms.values().next().value;
      if (!roomId) throw new Error("room not found: handle produce");
      await this.sfuService.connectTransport(
        roomId,
        user.userId,
        type,
        dtlsParameters
      );
    } catch (err) {
      socket.emit("error", { message: "Failed to connect transport" });
    }
  }

  private async handleProduce(
    socket: Socket,
    {
      kind,
      rtpParameters,
    }: { kind: "audio" | "video"; rtpParameters: RtpParameters },
    callback: (data: { id: string }) => void
  ) {
    const user = this.users.get(socket.id);
    if (!user) return;

    try {
      const roomId = socket.rooms.values().next().value;
      if (!roomId) throw new Error("room not found: handle produce");
      const producerId = await this.sfuService.produce(
        roomId,
        user.userId,
        kind,
        rtpParameters
      );
      this.io
        .to(roomId)
        .emit("new-producer", { producerId, userId: user.userId });
      callback({ id: producerId });
    } catch (err) {
      socket.emit("error", { message: "Failed to produce stream" });
    }
  }

  private async handleConsume(
    socket: Socket,
    {
      producerId,
      rtpCapabilities,
    }: { producerId: string; rtpCapabilities: RtpCapabilities },
    callback: (data: ConsumerDetails) => void
  ) {
    const user = this.users.get(socket.id);
    if (!user) return;

    try {
      const roomId = socket.rooms.values().next().value;
      if (!roomId) throw new Error("room not found: handle consume");
      const consumerDetails = await this.sfuService.consume(
        roomId,
        user.userId,
        producerId,
        rtpCapabilities
      );
      callback(consumerDetails);
    } catch (err) {
      socket.emit("error", { message: "Failed to consume stream" });
    }
  }

  private handleDisconnect(socket: Socket) {
    const user = this.users.get(socket.id);
    if (!user) return;
console.log("User disconnected: not current", socket.id, user.userId);
    const roomId = socket.rooms.values().next().value;
    if (roomId) {
      socket.to(roomId).emit("user-disconnected", user.userId);
      this.sfuService.cleanupUser(roomId, user.userId);
      if (this.hosts.get(roomId) === socket.id) {
        this.hosts.delete(roomId);
        this.io.to(roomId).emit("host-left");
        this.sfuService.cleanupRoom(roomId);
        console.log("Host left, cleaning up room:", roomId);
      }
    }
    this.users.delete(socket.id);
  }
}
