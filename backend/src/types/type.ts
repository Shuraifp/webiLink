import { Types } from "mongoose";
import { IUser } from "../models/userModel";

export enum UserRole {
  ADMIN = "admin",
  USER = "user",
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: IUser;
} 

// export interface DecodedToken {
//   userId:string;
//   userRole:string;
// }

export interface ResponseUser {
  _id:Types.ObjectId;
  username:string;
  email:string;
  role:string;
}