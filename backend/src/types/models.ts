import { Document, Types } from "mongoose";
import { Role } from "./chatRoom";
import { UserRole } from "./type";

export interface IMeeting extends Document {
  roomId: Types.ObjectId;
  hostId: Types.ObjectId;
  roomName: string;
  slug: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  participants: {
    userId: Types.ObjectId;
    username: string;
    avatar?: string;
    joinTime: Date;
    leaveTime?: Date;
    role: Role;
  }[];
  status: "ongoing" | "completed";
  createdAt: Date;
  updatedAt: Date;
}

export interface INotification extends Document {
  userId: string;
  type: "recording_upload" | "subscription_expiring" | "subscription_welcome";
  message: string;
  data?: {
    recordingId?: string;
    planId?: string;
  };
  isRead: boolean;
  createdAt: Date;
}

export interface IPayment extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  planId: Types.ObjectId;
  serialNumber: number;
  amount: number;
  currency: string;
  status: "succeeded" | "pending" | "failed" | "refunded";
  stripePaymentIntentId?: string;
  stripeInvoiceId?: string;
  refundId?: string;
  refundedAt?: Date;
  createdAt: Date;
}

export interface IPlan extends PlanInput, Document {
  stripePriceId?: string;
  stripeProductId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export enum BillingInterval {
  DAY = "day",
  WEEK = "week",
  MONTH = "month",
  YEAR = "year",
}

export interface PlanInput {
  name: string;
  description?: string;
  price: number;
  billingCycle?: {
    interval: BillingInterval;
    frequency: number;
  };
  features: string[];
  isArchived: boolean;
}

export interface IRecording extends Document {
  recordingId: string;
  userId: string;
  roomId: string;
  s3Key: string;
  createdAt: Date;
}

export interface IRoom extends Document {
  userId: Types.ObjectId;
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
}

// user
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
    backgroundImage?: string;
    bio?: string;
    jobTitle?: string;
    company?: string;
  };
  otp?: string;
  otpExpires?: Date;
  isBlocked: boolean;
  isArchived: boolean;
  isPremium: boolean;
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
  profile?: {
    firstName?: string;
    lastName?: string;
    avatar?: string;
    bio?: string;
    jobTitle?: string;
    company?: string;
  };
  role?: UserRole;
  googleId?: string;
  otp?: string;
  otpExpires?: Date;
  isBlocked: boolean;
  isVerified: boolean;
}

// user plan
export enum PlanStatus {
  ACTIVE = "active",
  CANCELED = "canceled",
  PAST_DUE = "past_due",
  PENDING = "pending",
}

export interface IUserPlan extends Document {
  _id: Types.ObjectId | string;
  userId: Types.ObjectId;
  planId: Types.ObjectId;
  stripeSubscriptionId?: string;
  stripeInvoiceId?: string;
  status: PlanStatus;
  currentPeriodStart: Date;
  currentPeriodEnd?: Date | null;
  cancelAtPeriodEnd?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
