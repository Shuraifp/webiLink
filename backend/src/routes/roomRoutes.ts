import { Router } from "express";
import { RoomController } from "../controllers/roomController";
import { RoomService } from "../services/roomService";
import { RoomRepository } from "../repositories/RoomRepository";
import MainRoomModel from "../models/mainRoomModel";
import { authenticateJWT } from "../middlewares/authMiddleware";

const isValidUser = authenticateJWT('user')

const mainRoomModel = MainRoomModel
const roomRepository = new RoomRepository(mainRoomModel)
const roomService = new RoomService(roomRepository)
const roomController = new RoomController(roomService)

const router = Router()

router.get('/', isValidUser, roomController.getAllRooms.bind(roomController))
router.post('/create', isValidUser, roomController.createRoom.bind(roomController))


export default router;

