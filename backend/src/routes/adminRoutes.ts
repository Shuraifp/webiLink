import { Router } from "express";
// import container from "../di/container";
import { AdminController } from "../controllers/adminController";
import { AdminService } from "../services/adminService";
import { UserRepository } from "../repositories/userRepository";
import { PlanRepository } from "../repositories/planRepository";
import UserModel from "../models/userModel";
import PlanModel from "../models/PlanModel";
import { authenticateJWT } from "../middlewares/authMiddleware";
import { UserRole } from "../types/type";
import { UserPlanRepository } from "../repositories/userPlanRepository";
import UserPlanModel from "../models/UserPlanModel";


const userRepository = new UserRepository(UserModel)
const planRepository = new PlanRepository(PlanModel)
const userPlanRepository = new UserPlanRepository(UserPlanModel)
const adminService = new AdminService(userRepository, planRepository, userPlanRepository)
const adminController = new AdminController(adminService)

const router = Router();

router.use(authenticateJWT(UserRole.ADMIN));

// users
router.get('/users' , adminController.listUsers.bind(adminController))
router.get('/dashboard' , adminController.getDashboardStats.bind(adminController))
router.put('/users/:userId/block' , adminController.blockUser.bind(adminController))
router.put('/users/:userId/unblock' , adminController.unblockUser.bind(adminController))
router.put('/users/:userId/archive' , adminController.softDeleteUser.bind(adminController))
router.put('/users/:userId/restore' , adminController.restoreUser.bind(adminController))



export default router;