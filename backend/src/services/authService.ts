import bcrypt from "bcryptjs";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";
import { IUserRepository } from "../interfaces/repositories/IUserRepository";
import { IAuthService } from "../interfaces/services/IAuthService";
import { IJwtService } from "../utils/jwt";
import { IMailService } from "../utils/mail";
import { IUser } from "../models/userModel";
import { LoginResponse, UserRole } from "../types/type";
import {
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  InternalServerError,
} from "../utils/errors";

export class AuthService implements IAuthService {
  constructor(
    private _userRepository: IUserRepository,
    private _jwtService: IJwtService,
    private _mailService: IMailService
  ) {}

  async signUp(
    username: string,
    email: string,
    password: string
  ): Promise<IUser> {
    const existingUser = await this._userRepository.findByEmail(email);
    if (existingUser && existingUser.isVerified)
      throw new BadRequestError("User already exists");

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");
    const otpExpires = new Date(Date.now() + 90 * 1000); // 90 seconds

    try {
      await this._mailService.sendOtp(email, otp);
    } catch {
      throw new InternalServerError("Failed to send OTP");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    if (existingUser && !existingUser.isVerified) {
      const success = await this._userRepository.update(
        String(existingUser._id),
        {
          otp: hashedOtp,
          otpExpires,
        }
      );
      if (!success) throw new InternalServerError("Failed to update user OTP");
      return existingUser;
    }

    const newUser = await this._userRepository.create({
      username,
      email,
      password: hashedPassword,
      otp: hashedOtp,
      otpExpires,
      isBlocked: false,
      isVerified: false,
    });

    if (!newUser) throw new InternalServerError("Failed to create user");
    return newUser;
  }

  async googleSignIn(
    username: string,
    email: string,
    avatar: string,
    googleId: string
  ): Promise<LoginResponse> {
    let user = await this._userRepository.findByEmail(email);

    if (!user) {
      user = await this._userRepository.create({
        username,
        email,
        googleId,
        profile: { avatar },
        isVerified: true,
        isBlocked: false,
      });
      if (!user) throw new InternalServerError("Failed to create user");
    }

    if (user.isBlocked) throw new ForbiddenError("User is blocked");

    const accessToken = this._jwtService.generateAccessToken(user);
    const refreshToken = this._jwtService.generateRefreshToken(user);

    return { accessToken, refreshToken, user };
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    const user = await this._userRepository.findByEmail(email);
    if (!user || user.role !== UserRole.USER)
      throw new NotFoundError("User not found");
    if (user.isBlocked) throw new ForbiddenError("User is blocked");

    if (!user.password || !(await bcrypt.compare(password, user.password)))
      throw new UnauthorizedError("Invalid credentials");

    const accessToken = this._jwtService.generateAccessToken(user);
    const refreshToken = this._jwtService.generateRefreshToken(user);

    return { accessToken, refreshToken, user };
  }

  async adminLogin(email: string, password: string): Promise<LoginResponse> {
    const user = await this._userRepository.findByEmail(email);
    if (!user || user.role !== UserRole.ADMIN)
      throw new NotFoundError("Admin not found");
    if (user.isBlocked) throw new ForbiddenError("Admin is blocked");

    if (!user.password || !(await bcrypt.compare(password, user.password)))
      throw new UnauthorizedError("Invalid credentials");

    const accessToken = this._jwtService.generateAccessToken(user);
    const refreshToken = this._jwtService.generateRefreshToken(user);

    return { accessToken, refreshToken, user };
  }

  async verifyOtp(email: string, otp: string): Promise<LoginResponse> {
    const user = await this._userRepository.findByEmail(email);
    if (!user) throw new NotFoundError("User not found");

    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    if (user.otp !== hashedOtp) throw new BadRequestError("Invalid OTP");
    if (user.otpExpires && new Date() > user.otpExpires)
      throw new BadRequestError("OTP expired");

    const success = await this._userRepository.update(String(user._id), {
      isVerified: true,
      otp: undefined,
      otpExpires: undefined,
    });

    if (!success) throw new InternalServerError("Failed to verify user");

    const updatedUser = await this._userRepository.findById(String(user._id));
    if (!updatedUser) throw new NotFoundError("User not found after verification");

    const accessToken = this._jwtService.generateAccessToken(updatedUser);
    const refreshToken = this._jwtService.generateRefreshToken(updatedUser);

    return { accessToken, refreshToken, user: updatedUser };
  }

  async verifyAccessToken(token: string): Promise<IUser> {
    const { decoded, error } = this._jwtService.verifyAccessToken(token);

    if (error || !decoded || !decoded._id)
      throw new UnauthorizedError(error || "Invalid token");

    const user = await this._userRepository.findById(decoded._id);
    if (!user) throw new NotFoundError("User not found");
    if (user.isBlocked) throw new ForbiddenError("User is blocked");

    return user;
  }

  async refreshToken(refreshToken: string): Promise<{
    accessToken: string;
    user: IUser;
  }> {
    const { decoded, error } = this._jwtService.verifyRefreshToken(refreshToken);
    if (error || !decoded || !decoded._id)
      throw new UnauthorizedError(error || "Invalid refresh token");

    const user = await this._userRepository.findById(decoded._id);
    if (!user) throw new NotFoundError("User not found");
    if (user.isBlocked) throw new ForbiddenError("User is blocked");

    const accessToken = this._jwtService.generateAccessToken(user);

    return { accessToken, user };
  }

  async requestPasswordReset(email: string): Promise<void> {
    const user = await this._userRepository.findByEmail(email);
    if (!user) throw new NotFoundError("User not found");
    if (user.googleId && !user.password)
      throw new BadRequestError(
        "Use Google authentication to log in; no password to reset"
      );

    const resetToken = uuidv4();
    const resetExpiry = new Date(Date.now() + 15 * 60 * 1000); 

    const success = await this._userRepository.saveResetToken(
      String(user._id),
      resetToken,
      resetExpiry
    );
    if (!success) throw new InternalServerError("Failed to save reset token");

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    const emailBody = `
      To reset your password, click the link below:\n
      ${resetUrl}\n
      This link expires in 15 minutes. If you didn’t request this, ignore this email.
    `;

    try {
      await this._mailService.sendOtpEmail(
        email,
        emailBody,
        "Password Reset Request"
      );
    } catch {
      throw new InternalServerError("Failed to send password reset email");
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await this._userRepository.findByResetToken(token);
    if (!user || !user.resetPasswordToken)
      throw new BadRequestError("Invalid token");
    if (token !== user.resetPasswordToken)
      throw new BadRequestError("Invalid token");
    if (user.resetPasswordExpiry && new Date() > user.resetPasswordExpiry)
      throw new BadRequestError("Reset token has expired");

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const success = await this._userRepository.update(String(user._id), {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpiry: null,
    });

    if (!success) throw new InternalServerError("Failed to reset password");
  }
}