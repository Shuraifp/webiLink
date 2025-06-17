import { Schema, model, Document } from "mongoose";

export interface INotification extends Document {
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

const notificationSchema = new Schema<INotification>({
  userId: { type: String, ref: "User", required: true },
  type: {
    type: String,
    enum: ["recording_upload", "subscription_expiring", "subscription_welcome"],
    required: true,
  },
  message: { type: String, required: true },
  data: { recordingId: { type: String }, planId: { type: String } },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default model<INotification>("Notification", notificationSchema);
