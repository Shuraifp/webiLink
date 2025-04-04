import mongoose, { Schema, Document } from "mongoose";

interface IMainRoom extends Document {
  name: string;
  type: "public" | "business";
  isActive: boolean;
  currentSession?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const mainRoomSchema = new Schema<IMainRoom>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["public", "business"],
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    currentSession: {
      type: Schema.Types.ObjectId,
      ref: "Session",
      default: null, 
    },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: false },
  }
);

export default mongoose.model<IMainRoom>("MainRoom", mainRoomSchema);