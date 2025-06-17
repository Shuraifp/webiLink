import { INotification } from "../../models/notificationModel";

export interface INotificationRepository {
  create(data: Partial<INotification>): Promise<INotification>;
  findByUserId(
    userId: string,
    page: number,
    limit: number
  ): Promise<INotification[]>;
  countUnread(userId: string): Promise<number>;
  markAsRead(notificationId: string): Promise<INotification>;
  markAllAsRead(userId: string): Promise<void>;
}
