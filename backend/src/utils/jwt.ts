import  Jwt from "jsonwebtoken";
import { TokenExpiredError, JsonWebTokenError } from "jsonwebtoken";
import { inject, injectable } from "inversify";
import { IUser } from "../models/userModel";
import { JWTPayload } from "../types/type";


export interface IJwtService {
  generateAccessToken(user:IUser | JWTPayload):string;
  generateRefreshToken(user:IUser | JWTPayload):string;
  verifyAccessToken(token:string): { decoded: JWTPayload | null; error?: string }
  verifyRefreshToken(token:string): { decoded: JWTPayload | null; error?: string }
}

@injectable()
export class JwtService implements IJwtService {
  constructor() {}

  generateAccessToken(user:IUser | JWTPayload):string {
    return Jwt.sign({ _id:user._id,username:user.username,email:user.email,role:user.role }, process.env.ACCESS_TOKEN_SECRET!, { expiresIn: "15m" });
  }

  generateRefreshToken(user:IUser | JWTPayload):string {
    return Jwt.sign({ _id:user._id,username:user.username,email:user.email,role:user.role }, process.env.REFRESH_TOKEN_SECRET!, { expiresIn: "7d" });
  }

  verifyAccessToken(token: string): { decoded: JWTPayload | null; error?: string } {
    try {
      const decoded = Jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as JWTPayload;
      return { decoded };
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        return { decoded: null, error: "Token expired" };
      }
      if (error instanceof JsonWebTokenError) {
        return { decoded: null, error: "Invalid token" };
      }
      return { decoded: null, error: "Token verification failed" };
    }
  }

  verifyRefreshToken(token: string): { decoded: JWTPayload | null; error?: string } {
    try {
      const decoded = Jwt.verify(token, process.env.REFRESH_TOKEN_SECRET!) as JWTPayload;
      return { decoded };
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        return { decoded: null, error: "Refresh token expired" };
      }
      if (error instanceof JsonWebTokenError) {
        return { decoded: null, error: "Invalid refresh token" };
      }
      return { decoded: null, error: "Refresh token verification failed" };
    }
  }
}