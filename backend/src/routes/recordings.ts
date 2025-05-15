import { Router } from "express";
import { RecordingController } from "../controllers/recordingController";
import { RecordingService } from "../services/recordingService";
import { RecordingRepository } from "../repositories/recordingRepository";
import recordingModel from "../models/RecordingModel";
import { restrictToPremium } from "../middlewares/premiumMiddleware";
import { authenticateJWT } from "../middlewares/authMiddleware";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });
const isValidUser = authenticateJWT("user");
const isPremiumUser = restrictToPremium
const recordingRepository = new RecordingRepository(recordingModel);
const recordingService = new RecordingService(recordingRepository);
const recordingController = new RecordingController(recordingService);

const router = Router();

router.post("/upload", isValidUser, isPremiumUser, upload.single("recording"), recordingController.uploadRecording.bind(recordingController));
router.get("/", isValidUser, recordingController.getUserRecordings.bind(recordingController));

export default router;