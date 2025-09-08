import mongoose, { Schema } from "mongoose";
import { IRoom } from "../types/models";


const roomSchema = new Schema<IRoom>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    isPremiumUser: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    settings: {
      background: { type: String, default: null },
      logo: { type: String, default: null },
      theme: { type: String, enum: ["light", "dark"], default: "light" },
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IRoom>("Room", roomSchema);