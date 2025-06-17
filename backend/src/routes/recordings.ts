import { Router } from "express";
import { RecordingController } from "../controllers/recordingController";
import { RecordingService } from "../services/recordingService";
import { RecordingRepository } from "../repositories/recordingRepository";
import recordingModel from "../models/RecordingModel";
import { restrictToPremium } from "../middlewares/premiumMiddleware";
import { authenticateJWT } from "../middlewares/authMiddleware";
import multer from "multer";
import { UserRole } from "../types/type";
import { NotificationRepository } from "../repositories/notificationRepository";
import notificationModel from "../models/notificationModel";
import { NotificationService } from "../services/notificationService";

const upload = multer({ storage: multer.memoryStorage() });
const isPremiumUser = restrictToPremium
const recordingRepository = new RecordingRepository(recordingModel);
const notificationRepository = new NotificationRepository(notificationModel);
const notificationService = new NotificationService(notificationRepository);
const recordingService = new RecordingService(recordingRepository, notificationService);
const recordingController = new RecordingController(recordingService);

const router = Router();

router.post("/upload", authenticateJWT(UserRole.USER), isPremiumUser, upload.single("recording"), recordingController.uploadRecording.bind(recordingController));
router.get("/", authenticateJWT(UserRole.USER), recordingController.getUserRecordings.bind(recordingController));

// Admin
router.get("/stats", authenticateJWT(UserRole.ADMIN), recordingController.getDashboardStats.bind(recordingController));

export default router;