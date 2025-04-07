import mongoose, { Schema, Document } from "mongoose";

export interface IRoom extends Document {
  userId: mongoose.Types.ObjectId; 
  name: string;
  slug: string;
  isPremiumUser: boolean;
  isActive: boolean; 
  settings?: {
    background?: string;
    logo?: string; 
    theme?: string; 
  };
  createdAt: Date;
  deletedAt?: Date; 
}

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
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: false },
  }
);

export default mongoose.model<IRoom>("Room", roomSchema);