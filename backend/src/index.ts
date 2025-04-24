import dotenv from 'dotenv';
import { server, io } from './app';
import connectDB from './config/db';
import { RoomService } from './services/roomService';
import { RoomRepository } from './repositories/RoomRepository';
import { SocketService } from './services/socketService';
import mainRoomModel from './models/mainRoomModel';

dotenv.config();

async function startServer() {
  await connectDB();

  const roomRepository = new RoomRepository(mainRoomModel);
  const roomService = new RoomService(roomRepository);
  new SocketService(io, roomService);
  
  const PORT = process.env.PORT || 8000;
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

startServer();