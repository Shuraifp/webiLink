import { Schema, model } from "mongoose";
import { IRecording } from "../types/models";


const recordingSchema = new Schema<IRecording>({
  recordingId: { type: String, required: true },
  userId: { type: String, required: true },
  roomId: { type: String, required: true },
  s3Key: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default model<IRecording>("Recording", recordingSchema);