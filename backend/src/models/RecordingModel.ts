import { Schema, model, Document } from "mongoose";

export interface IRecording extends Document {
  recordingId: string;
  userId: string;
  roomId: string;
  s3Key: string;
  createdAt: Date;
}

const recordingSchema = new Schema<IRecording>({
  recordingId: { type: String, required: true },
  userId: { type: String, required: true },
  roomId: { type: String, required: true },
  s3Key: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default model<IRecording>("Recording", recordingSchema);