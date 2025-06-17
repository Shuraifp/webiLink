import { INotification } from "../../models/notificationModel";

export interface INotificationService {
  createNotification(
    userId: string,
    type: INotification["type"],
    message: string,
    data?: any
  ): Promise<void>;
  getNotifications(
    userId: string,
    page: number,
    limit: number
  ): Promise<INotification[]>;
  countUnread(userId: string): Promise<number>;
  markAsRead(notificationId: string, userId: string): Promise<INotification>;
  markAllAsRead(userId: string): Promise<void>;
}