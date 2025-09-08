import mongoose, { Schema } from "mongoose";
import { UserRole } from "../types/type";
import { IUser } from "../types/models";

const userSchema = new Schema<IUser>(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
    },
    googleId: { type: String },
    profile: {
      firstName: { type: String },
      lastName: { type: String },
      avatar: { type: String },
      backgroundImage: { type: String },
      bio: { type: String },
      jobTitle: { type: String },
      company: { type: String },
    },
    otp: { type: String },
    otpExpires: { type: Date },
    resetPasswordToken: { type: String },
    resetPasswordExpiry: { type: Date },
    isPremium: { type: Boolean, default: false },
    planId: { type: Schema.Types.ObjectId, ref: "Plan", default: null },
    stripeCustomerId: { type: String, default: "" },
    isBlocked: { type: Boolean, default: false },
    isArchived: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", userSchema);
