import { Types } from "mongoose";

export interface ResponseRecording {
  recordingId: string;
  roomId: string;
  createdAt: Date;
  url: string;
}

export interface ResponseUser {
  username: string;
  email: string;
  profile?: {
    firstName?: string;
    lastName?: string;
    avatar?: string;
    backgroundImage?: string;
    bio?: string;
    jobTitle?: string;
    company?: string;
  };
  isPremium:boolean;
  planId?: Types.ObjectId | null;
  createdAt?: Date;
  updatedAt?: Date;
  _id: Types.ObjectId;
}
