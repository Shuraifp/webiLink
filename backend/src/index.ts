import dotenv from 'dotenv';
import { server, io } from './app';
import connectDB from './config/db';
import { RoomService } from './services/roomService';
import { RoomRepository } from './repositories/RoomRepository';
import { SocketService } from './services/socketService';
import mainRoomModel from './models/mainRoomModel';
import "./utils/cron";
import logger from './utils/logger';
import { MeetingRepository } from './repositories/meetingRepository';
import MeetingModel from './models/MeetingModel';
import { MeetingService } from './services/meetingService';
import { UserRepository } from './repositories/userRepository';
import userModel from './models/userModel';

dotenv.config();

async function startServer() {
  await connectDB();

  const userRepository = new UserRepository(userModel)
  const roomRepository = new RoomRepository(mainRoomModel);
  const roomService = new RoomService(roomRepository);
  const meetingRepository = new MeetingRepository(MeetingModel)
  const meetingService = new MeetingService(meetingRepository, roomRepository, userRepository);
  new SocketService(io, roomService, meetingService, meetingRepository);
  
  const PORT = process.env.PORT || 8000;
  server.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
}

startServer();