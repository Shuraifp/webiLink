import { Router } from "express";
import { PlanController } from "../controllers/planController";
import { PlanService } from "../services/planService";
import { PlanRepository } from "../repositories/planRepository";
import { UserPlanRepository } from "../repositories/userPlanRepository";
import { UserRepository } from "../repositories/userRepository";
import PlanModel from "../models/PlanModel";
import UserPlanModel from "../models/UserPlanModel";
import UserModel from "../models/userModel";
import { authenticateJWT } from "../middlewares/authMiddleware";
import { UserRole } from "../types/type";

const planRepository = new PlanRepository(PlanModel);
const userPlanRepository = new UserPlanRepository(UserPlanModel);
const userRepository = new UserRepository(UserModel);
const planService = new PlanService(planRepository, userPlanRepository, userRepository);
const planController = new PlanController(planService);

const router = Router();

router.get("/", planController.fetchActivePlans.bind(planController));
router.post("/create-subscription", authenticateJWT(UserRole.USER), planController.makeSubscription.bind(planController));
router.post("/webhook", planController.handleWebhook.bind(planController));
router.get("/user-plan", authenticateJWT(UserRole.USER), planController.getUserPlan.bind(planController));

export default router;