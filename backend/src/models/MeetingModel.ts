import mongoose, { Schema, Document, Types } from "mongoose";

export interface IMeeting extends Document {
  userId: Types.ObjectId;
  title: string;
  startTime: Date;
  endTime: Date;
  participants: Types.ObjectId[];
  status: "scheduled" | "completed" | "canceled";
}

const MeetingSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  participants: [{ type: Schema.Types.ObjectId, ref: "User" }],
  status: { type: String, enum: ["scheduled", "completed", "canceled"], default: "scheduled" },
});

export default mongoose.model<IMeeting>("Meeting", MeetingSchema);