import { Router } from "express";
import container from "../di/container";
import { AuthController } from "../controllers/authController";

const router = Router();
const authController = container.get<AuthController>(AuthController);


// user
router.post("/signup", authController.signUp.bind(authController));
router.post("/google-signin", authController.googleSignIn.bind(authController))
router.post("/login", authController.login.bind(authController));
router.post('/verifyOtp', authController.verifyOtp.bind(authController));
router.post('/verify-token', authController.verifyAccessToken.bind(authController))
router.post('/refresh-userToken', authController.refreshUserToken.bind(authController))
router.post('/user-logout', authController.userLogout.bind(authController))
router.post('/forgot-password', authController.requestResetPassword.bind(authController))
router.post('/reset-password', authController.resetPassword.bind(authController))

// admin
router.post('/admin-login', authController.adminLogin.bind(authController))
router.post('/refresh-adminToken', authController.refreshAdminToken.bind(authController))
router.post('/admin-logout', authController.adminLogout.bind(authController))

export default router;