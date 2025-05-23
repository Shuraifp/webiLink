import { Router } from "express";
import { UserController } from "../controllers/userController";
import { UserService } from "../services/userService";
import { UserRepository } from "../repositories/userRepository";
import userModel from "../models/userModel";
import { authenticateJWT } from "../middlewares/authMiddleware";
import { AuthService } from "../services/authService";
import { JwtService } from "../utils/jwt";
import { MailService } from "../utils/mail";
import { MeetingRepository } from "../repositories/meetingRepository";
import MeetingModel from "../models/MeetingModel";

const isValidUser = authenticateJWT('user')

const userRepository = new UserRepository(userModel)
const meetingRepository = new MeetingRepository(MeetingModel)
const userService = new UserService(userRepository, meetingRepository)
const jwtService = new JwtService;
const mailServide = new MailService;
const authService = new AuthService(userRepository, jwtService, mailServide)
const userController = new UserController(userService, authService)

const router = Router()

router.get('/me', isValidUser, userController.getUser.bind(userController))
router.patch('/profile', isValidUser, userController.updateProfile.bind(userController))
router.patch('/change-password', isValidUser, userController.changePassword.bind(userController))
router.get('/isPremium', isValidUser, userController.checkPremium.bind(userController))
router.get('/dashboard-stats', isValidUser, userController.getDashboardStats.bind(userController))


export default router;

