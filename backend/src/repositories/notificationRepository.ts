import NotificationModel, { INotification } from "../models/notificationModel";
import { INotificationRepository } from "../interfaces/repositories/INotificationRepository";
import { NotFoundError } from "../utils/errors";
import { BaseRepository } from "./baseRepository";

export class NotificationRepository extends BaseRepository<INotification> implements INotificationRepository {
  async create(data: Partial<INotification>): Promise<INotification> {
    return await NotificationModel.create(data);
  }

  async findByUserId(
    userId: string,
    page: number,
    limit: number
  ): Promise<INotification[]> {
    return await NotificationModel.find({ userId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
  }

  async countUnread(userId: string): Promise<number> {
    return await NotificationModel.countDocuments({ userId, isRead: false });
  }

  async markAsRead(notificationId: string): Promise<INotification> {
    const notification = await NotificationModel.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true }
    );
    if (!notification) throw new NotFoundError("Notification not found");
    return notification;
  }

  async markAllAsRead(userId: string): Promise<void> {
    await NotificationModel.updateMany(
      { userId, isRead: false },
      { isRead: true }
    );
  }
}