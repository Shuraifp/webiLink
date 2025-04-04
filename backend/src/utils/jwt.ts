import  Jwt from "jsonwebtoken";
import { TokenExpiredError, JsonWebTokenError } from "jsonwebtoken";
import { inject, injectable } from "inversify";
import { IUser } from "../models/userModel";


export interface IJwtService {
  generateAccessToken(user:IUser):string;
  generateRefreshToken(user:IUser):string;
  verifyAccessToken(token:string): { decoded: IUser | null; error?: string }
  verifyRefreshToken(token:string): { decoded: IUser | null; error?: string }
}

@injectable()
export class JwtService implements IJwtService {
  constructor() {}

  generateAccessToken(user:IUser):string {
    return Jwt.sign({ _id:user._id,username:user.username,email:user.email }, process.env.ACCESS_TOKEN_SECRET!, { expiresIn: "15m" });
  }

  generateRefreshToken(user:IUser):string {
    return Jwt.sign({ _id:user._id,username:user.username,email:user.email }, process.env.REFRESH_TOKEN_SECRET!, { expiresIn: "7d" });
  }

  verifyAccessToken(token: string): { decoded: IUser | null; error?: string } {
    try {
      const decoded = Jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as { user: IUser };
      return { decoded:decoded.user };
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

  verifyRefreshToken(token: string): { decoded: IUser | null; error?: string } {
    try {
      const decoded = Jwt.verify(token, process.env.REFRESH_TOKEN_SECRET!) as { user: IUser };
      return { decoded:decoded.user };
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