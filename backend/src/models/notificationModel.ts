import { Schema, model } from "mongoose";
import { INotification } from "../types/models";


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
