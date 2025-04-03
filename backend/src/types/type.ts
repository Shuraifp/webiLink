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

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string | object;
}

export const successResponse = <T>(message: string, data?: T): ApiResponse<T> => ({
  success: true,
  message,
  data,
});

export const errorResponse = (message: string, error?: string | object): ApiResponse<never> => ({
  success: false,
  message,
  error,
});