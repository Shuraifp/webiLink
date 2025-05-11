import { Types } from "mongoose";
import { IUser } from "../models/userModel";



export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500
}

export enum UserRole {
  ADMIN = "admin",
  USER = "user",
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: IUser;
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

export interface JWTPayload {
  _id: string;
  username: string;
  email: string;
  role: string;
  avatar: string;
}

