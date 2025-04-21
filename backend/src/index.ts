import dotenv from 'dotenv';
import { server, io } from './app';
import connectDB from './config/db';
import { MediasoupService } from './services/mediasoupService';
import { SfuService } from './services/SFUService';
import { SocketService } from './services/socketService';
import { RoomService } from './services/roomService';
import { RoomRepository } from './repositories/RoomRepository';
import mainRoomModel from './models/mainRoomModel';

dotenv.config();

async function startServer() {
  await connectDB();

  const mediasoupService = new MediasoupService();
  const router = await mediasoupService.init();
  const sfuService = new SfuService(router)
  const roomRepository = new RoomRepository(mainRoomModel)
  const roomService = new RoomService(roomRepository)
  new SocketService(io, sfuService, roomService)
  
  const PORT = process.env.PORT || 8000;
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

startServer();