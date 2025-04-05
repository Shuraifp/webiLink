import { IUser } from "../../models/userModel";
import { LoginResponse } from "../../types/type";

export interface IAuthService {
  signUp(username: string, email: string, password: string): Promise<IUser>;
  googleSignIn(username:string,email:string,avatar:string,googleId:string) :Promise<LoginResponse>;
  login(email: string, password: string): Promise<LoginResponse>;
  adminLogin(email: string, password: string): Promise<LoginResponse>;
  verifyOtp(email: string, otp:string): Promise<LoginResponse>;
  verifyAccessToken(token:string): Promise<IUser>;
  refreshToken(refreshToken:string): {accessToken: string, user: Promise<IUser>};
  requestPasswordReset(email:string): Promise<void>;
  resetPassword(token:string, newPassword:string): Promise<void>;
}