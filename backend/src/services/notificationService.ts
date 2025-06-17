import { getSocketService } from "..";
import { INotificationRepository } from "../interfaces/repositories/INotificationRepository";
import { INotificationService } from "../interfaces/services/INotificationService";
import { INotification } from "../models/notificationModel";
import { UnauthorizedError } from "../utils/errors";
import { SocketService } from "./socketService";

export class NotificationService implements INotificationService {
  private socketService: SocketService | null = null;
  constructor(private notificationRepository: INotificationRepository) {}

  private getSocketServiceInstance(): SocketService {
    if (!this.socketService) {
      this.socketService = getSocketService();
    }
    return this.socketService;
  }

  async createNotification(
    userId: string,
    type: INotification["type"],
    message: string,
    data?: any
  ): Promise<void> {
    await this.notificationRepository.create({
      userId,
      type,
      message,
      data,
    });

    this.getSocketServiceInstance().sendNotification(userId, {
      type,
      message,
      data,
    });
  }

  async getNotifications(
    userId: string,
    page: number,
    limit: number
  ): Promise<INotification[]> {
    return await this.notificationRepository.findByUserId(userId, page, limit);
  }

  async countUnread(userId: string): Promise<number> {
    return await this.notificationRepository.countUnread(userId);
  }

  async markAsRead(
    notificationId: string,
    userId: string
  ): Promise<INotification> {
    const notification = await this.notificationRepository.markAsRead(
      notificationId
    );
    if (notification.userId.toString() !== userId) {
      throw new UnauthorizedError(
        "Not authorized to mark this notification as read"
      );
    }
    return notification;
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository.markAllAsRead(userId);
  }
}
