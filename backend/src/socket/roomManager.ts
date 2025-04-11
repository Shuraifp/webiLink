import { Server, Socket } from 'socket.io';
import { RoomService } from '../services/roomService.js';

interface JoinData {
  roomId: string;
  userId: string;
}

interface SignalingData {
  roomId: string;
  target: string;
  [key: string]: any;
}

export class RoomManager {
  private io: Server;
  private roomService: RoomService;
  private hostSockets: Map<string, string>;

  constructor(io: Server, roomService: RoomService) {
    this.io = io; 
    this.roomService = roomService;
    this.hostSockets = new Map();
  }

  async handleJoin(socket: Socket, { roomId, userId }: JoinData) {
    try {
      console.log('started in socket')
      const room = await this.roomService.getRoom(roomId);
      socket.join(roomId);
      console.log(`User ${socket.id} joined room ${roomId}`);

      const isHost = room.userId == userId;
      if (isHost) {
        console.log('host joined')
        this.hostSockets.set(roomId, socket.id);
        socket.to(roomId).emit('host-joined');
        socket.emit('host-status', true);
      } else if (!this.isHostPresent(roomId)) {
        socket.emit('waiting-for-host');
      } else {
        socket.to(roomId).emit('user-connected', socket.id);
      }
    } catch (err: any) {
      console.log(err)
      socket.emit('error', { message: err.message || 'Failed to join room' });
    }
  }

  handleSignaling(socket: Socket, event: string, data: SignalingData) {
    console.log('event : ',event)
    const { roomId, target } = data;
    if (!this.isHostPresent(roomId)) return;
    console.log(event)
    socket.to(target).emit(event, { ...data, userId: socket.id });
  }

  handleDisconnect(socket: Socket) {
    for (const [roomId, hostSocketId] of this.hostSockets) {
      if (hostSocketId === socket.id) {
        this.hostSockets.delete(roomId);
        this.io.to(roomId).emit('host-left');
      }
    }
    console.log('user-disconnected')
    this.io.emit('user-disconnected', socket.id);
  }

  isHostPresent(roomId: string): boolean {
    const hostSocketId = this.hostSockets.get(roomId);
    return !!hostSocketId && !!this.io.sockets.sockets.get(hostSocketId);
  }
}