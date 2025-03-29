import { Router } from "express";
import container from "../di/container";
import { AuthController } from "../controllers/authController";

const router = Router();
const authController = container.get<AuthController>(AuthController);

router.post("/signup", authController.signUp.bind(authController));
router.post("/google-signin", authController.googleSignIn.bind(authController))
router.post("/login", authController.login.bind(authController));
router.post('/verifyOtp', authController.verifyOtp.bind(authController));
router.post('/verify-token', authController.verifyAccessToken.bind(authController))
router.post('/refresh-token', authController.refreshToken.bind(authController))
router.post('/logout', authController.logout.bind(authController))

export default router;