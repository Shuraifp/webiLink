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


const userRepository = new UserRepository(UserModel)
const planRepository = new PlanRepository(PlanModel)
const adminService = new AdminService(userRepository, planRepository)
const adminController = new AdminController(adminService)

const router = Router();

router.use(authenticateJWT(UserRole.ADMIN));

// users
router.get('/users' , adminController.listUsers.bind(adminController))
router.put('/users/:userId/block' , adminController.blockUser.bind(adminController))
router.put('/users/:userId/unblock' , adminController.unblockUser.bind(adminController))
router.put('/users/:userId/archive' , adminController.softDeleteUser.bind(adminController))
router.put('/users/:userId/restore' , adminController.restoreUser.bind(adminController))

// plans
router.post('/plans', adminController.createPlan.bind(adminController));
router.get('/plans', adminController.getAllActivePlans.bind(adminController));
router.get('/archived-plans', adminController.getAllArchivedPlans.bind(adminController));
router.put('/plans/:planId', adminController.updatePlan.bind(adminController));
router.patch('/plans/:planId/archive', adminController.archivePlan.bind(adminController));
router.patch('/plans/:planId/restore', adminController.restorePlan.bind(adminController));

export default router;