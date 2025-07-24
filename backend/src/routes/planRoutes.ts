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
import { AdminService } from "../services/adminService";
import { AdminController } from "../controllers/adminController";
import { PaymentRepository } from "../repositories/paymentRepository";
import PaymentModel from "../models/PaymentModel";
import { RoomRepository } from "../repositories/RoomRepository";
import RoomModel from "../models/RoomModel";
import MeetingModel from "../models/MeetingModel";
import RecordingModel from "../models/RecordingModel";
import { MeetingRepository } from "../repositories/meetingRepository";
import { RecordingRepository } from "../repositories/recordingRepository";
import { NotificationRepository } from "../repositories/notificationRepository";
import notificationModel from "../models/notificationModel";
import { NotificationService } from "../services/notificationService";

const planRepository = new PlanRepository(PlanModel);
const userPlanRepository = new UserPlanRepository(UserPlanModel);
const userRepository = new UserRepository(UserModel);
const paymentRepository = new PaymentRepository(PaymentModel);
const notificationRepository = new NotificationRepository(notificationModel);
const roomRepository = new RoomRepository(RoomModel);
const meetingRepository = new MeetingRepository(MeetingModel);
const recordingRepository = new RecordingRepository(RecordingModel);
const notificationService = new NotificationService(notificationRepository);
const planService = new PlanService(
  planRepository,
  userPlanRepository,
  userRepository,
  paymentRepository,
  roomRepository,
  notificationService
);
const planController = new PlanController(planService);

const adminService = new AdminService(
  userRepository,
  planRepository,
  userPlanRepository,
  paymentRepository,
  meetingRepository,
  recordingRepository
);
const adminController = new AdminController(adminService);

const router = Router();

router.get("/", planController.fetchActivePlans.bind(planController));
router.get(
  "/user-plan",
  authenticateJWT(UserRole.USER),
  planController.getUserPlan.bind(planController)
);
router.get(
  "/pending-plan",
  authenticateJWT(UserRole.USER),
  planController.getPendingPlan.bind(planController)
);
router.get(
  "/history",
  authenticateJWT(UserRole.USER),
  planController.getHistory.bind(planController)
);
router.post(
  "/create-subscription",
  authenticateJWT(UserRole.USER),
  planController.makeSubscription.bind(planController)
);
router.post(
  "/cancel-subscription",
  authenticateJWT(UserRole.USER),
  planController.cancelActiveSubscription.bind(planController)
);
router.post(
  "/retry-payment",
  authenticateJWT(UserRole.USER),
  planController.retryPayment.bind(planController)
);

// Refund-related routes
router.post(
  "/cancel-pending",
  authenticateJWT(UserRole.USER),
  planController.cancelPendingSubscription.bind(planController)
);

// Admin
router.post(
  "/",
  authenticateJWT(UserRole.ADMIN),
  planController.createPlan.bind(planController)
);
router.get(
  "/active-plans",
  authenticateJWT(UserRole.ADMIN),
  planController.fetchActivePlans.bind(planController)
);
router.get(
  "/archived-plans",
  authenticateJWT(UserRole.ADMIN),
  planController.fetchArchivedPlans.bind(planController)
);
router.put(
  "/:planId",
  authenticateJWT(UserRole.ADMIN),
  planController.updatePlan.bind(planController)
);
router.patch(
  "/:planId/archive",
  authenticateJWT(UserRole.ADMIN),
  planController.archivePlan.bind(planController)
);
router.patch(
  "/:planId/restore",
  authenticateJWT(UserRole.ADMIN),
  planController.restorePlan.bind(planController)
);
router.get(
  "/subscriptions",
  authenticateJWT(UserRole.ADMIN),
  adminController.listSubscriptions.bind(adminController)
);

export default router;
