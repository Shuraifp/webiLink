import { UserDTO } from "../../dto/userDTO";
import { LoginResponse } from "../../types/type";

export interface IAuthService {
  signUp(username: string, email: string, password: string): Promise<UserDTO>;
  googleSignIn(username:string,email:string,avatar:string,googleId:string) :Promise<LoginResponse>;
  login(email: string, password: string): Promise<LoginResponse>;
  adminLogin(email: string, password: string): Promise<LoginResponse>;
  verifyOtp(email: string, otp:string): Promise<LoginResponse>;
  verifyAccessToken(token:string): Promise<UserDTO>;
  refreshToken(refreshToken:string): Promise<{accessToken: string, user: UserDTO}>;
  requestPasswordReset(email:string): Promise<void>;
  resetPassword(token:string, newPassword:string): Promise<void>;
  changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void>;
}