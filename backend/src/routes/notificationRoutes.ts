import { Router } from "express";
import { NotificationController } from "../controllers/notificationController";
import { NotificationService } from "../services/notificationService";
import { NotificationRepository } from "../repositories/notificationRepository";
import NotificationModel from "../models/notificationModel";
import { authenticateJWT } from "../middlewares/authMiddleware";
import { UserRole } from "../types/type";

const isValidUser = authenticateJWT(UserRole.USER);

const getNotificationController = () => {
  const notificationRepository = new NotificationRepository(NotificationModel);
  const notificationService = new NotificationService(notificationRepository);
  return new NotificationController(notificationService);
};

const router = Router();

router.get("/", isValidUser, (req, res, next) => {
  const notificationController = getNotificationController();
  notificationController.getNotifications(req, res, next);
});
router.get("/unread-count", isValidUser, (req, res, next) => {
  const notificationController = getNotificationController();
  notificationController.getUnreadCount(req, res, next);
});

router.patch("/:notificationId/read", isValidUser, (req, res, next) => {
  const notificationController = getNotificationController();
  notificationController.markAsRead(req, res, next);
});

router.patch("/read-all", isValidUser, (req, res, next) => {
  const notificationController = getNotificationController();
  notificationController.markAllAsRead(req, res, next);
});

export default router;