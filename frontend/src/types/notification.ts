export interface INotification {
  _id: string;
  userId: string;
  type: "recording_upload" | "subscription_expiring" | "subscription_welcome";
  message: string;
  data?: {
    recordingId?: string;
    planId?: string;
  };
  isRead: boolean;
  createdAt: Date;
}