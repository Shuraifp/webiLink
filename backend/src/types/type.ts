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

export const TOKEN_EXPIRY = {
  ACCESS_TOKEN: 15 * 60 * 1000,
  REFRESH_TOKEN: 7 * 24 * 60 * 60 * 1000,
} as const;

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: IUser;
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
  role: UserRole;
  avatar: string;
}

export interface UserDataForCookies {
    id: string | null;
    username: string | null;
    email: string | null;
    avatar?: string;
    role: string | null;
}

