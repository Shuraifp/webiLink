import mongoose, { Schema, Types,Document } from "mongoose";
import { UserRole } from "../types/type";


export interface IUser extends Document {
  username: string;
  email: string;
  password?: string; 
  role?: UserRole;
  googleId?: string;
  profile?: {
    firstName?: string;
    lastName?: string;
    avatar?: string;
    bio?: string;
    jobTitle?: string;
    company?: string;
  };
  otp?: string;
  otpExpires?: Date;
  isBlocked: boolean;
  isArchived:boolean;
  isPremium:boolean;
  planId?: Types.ObjectId | null;
  stripeCustomerId: string;
  isVerified: boolean;
  resetPasswordToken?: string | null;
  resetPasswordExpiry?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
  _id: Types.ObjectId;
}
export interface UserInput {
  username: string;
  email: string;
  password?: string; 
  profile?:{
    firstName?:string;
    lastName?:string;
    avatar?:string;
    bio?:string;
    jobTitle?:string;
    company?:string;
  }
  role?: UserRole;
  googleId?: string;
  otp?: string;
  otpExpires?: Date;
  isBlocked: boolean;
  isVerified: boolean;
}

const userSchema = new Schema<IUser>({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  role: { type: String, enum: Object.values(UserRole), default: UserRole.USER },
  googleId: { type: String },
  profile: {
    firstName: { type: String },
    lastName: { type: String },
    avatar: { type: String },
    bio: { type: String },  
    jobTitle: { type: String },
    company: { type: String },
  },
  otp: { type: String },
  otpExpires: { type: Date },
  resetPasswordToken: { type: String },
  resetPasswordExpiry: { type:Date},
  isPremium: {type: Boolean, default: false},
  planId: { type: Schema.Types.ObjectId, ref: "Plan", default: null },
  stripeCustomerId: { type: String , default: '' },
  isBlocked: { type: Boolean, default: false },
  isArchived: { type: Boolean, default:false},
  isVerified: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model<IUser>("User", userSchema);