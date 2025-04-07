import mongoose, { Schema, Document } from "mongoose";

interface IRoom extends Document {
  userId: mongoose.Types.ObjectId; 
  name: string;
  slug: string;
  type: "public" | "business";
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
    type: {
      type: String,
      enum: ["public", "business"],
      required: true,
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

roomSchema.index({ slug: 1 }, { unique: true });

export default mongoose.model<IRoom>("Room", roomSchema);