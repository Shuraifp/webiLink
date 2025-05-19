import { Router } from "express";
import { RoomController } from "../controllers/roomController";
import { RoomService } from "../services/roomService";
import { RoomRepository } from "../repositories/RoomRepository";
import MainRoomModel from "../models/mainRoomModel";
import { authenticateJWT } from "../middlewares/authMiddleware";
import { UserRepository } from "../repositories/userRepository";
import userModel from "../models/userModel";

const isValidUser = authenticateJWT('user')

const mainRoomModel = MainRoomModel
const User = userModel;
const roomRepository = new RoomRepository(mainRoomModel)
const userRepository = new UserRepository(User)
const roomService = new RoomService(roomRepository, userRepository)
const roomController = new RoomController(roomService)

const router = Router()

router.get('/', isValidUser, roomController.getAllRooms.bind(roomController))
router.post('/create', isValidUser, roomController.createRoom.bind(roomController))


export default router;

