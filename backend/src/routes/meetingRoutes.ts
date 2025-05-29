import { Router } from "express";
import { MeetingController } from "../controllers/meetingController";
import { MeetingService } from "../services/meetingService";
import { MeetingRepository } from "../repositories/meetingRepository";
import { RoomRepository } from "../repositories/RoomRepository";
import { UserRepository } from "../repositories/userRepository";
import MeetingModel from "../models/MeetingModel";
import MainRoomModel from "../models/RoomModel";
import UserModel from "../models/userModel";
import { authenticateJWT } from "../middlewares/authMiddleware";
import { UserRole } from "../types/type";

const isValidUser = authenticateJWT(UserRole.USER);

const meetingRepository = new MeetingRepository(MeetingModel);
const roomRepository = new RoomRepository(MainRoomModel);
const userRepository = new UserRepository(UserModel);
const meetingService = new MeetingService(meetingRepository, roomRepository, userRepository);
const meetingController = new MeetingController(meetingService);

const router = Router();

router.get("/", isValidUser, meetingController.getUserMeetings.bind(meetingController));
router.get("/:meetingId", isValidUser, meetingController.getMeetingById.bind(meetingController));

export default router;