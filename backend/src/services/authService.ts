import bcrypt from "bcryptjs";
import { inject, injectable } from "inversify";
import { IUserRepository } from "../interfaces/IUserRepository";
import { IAuthService } from "../interfaces/IAuthService";
import { IUser } from "../models/userModel";
import TYPES from "../di/types";
import { Types } from "mongoose";
import { LoginResponse, UserRole } from "../types/type";
import { IJwtService } from "../utils/jwt";
import { IMailService } from "../utils/mail";
import crypto from "crypto";
import { Document } from "mongoose";

@injectable()
export class AuthService implements IAuthService {
  constructor(
    @inject(TYPES.IUserRepository) private _userRepository: IUserRepository,
    @inject(TYPES.IJwtService) private _jwtService: IJwtService,
    @inject(TYPES.IMailService) private _mailService: IMailService
  ) {}

  async signUp(
    username: string,
    email: string,
    password: string
  ): Promise<IUser & Document> {
    const existingUser = await this._userRepository.findByEmail(email);
    if (existingUser && existingUser.isVerified)
      throw new Error("User already exists");

    let otp = Math.floor(100000 + Math.random() * 900000);
    console.log(otp);
    let hashedOtp = crypto
      .createHash("sha256")
      .update(otp.toString())
      .digest("hex");
    await this._mailService.sendOtp(email, String(otp));

    const hashedPassword = await bcrypt.hash(password, 10);
    const otpExpires = new Date(Date.now() + 90 * 1000);
    if (existingUser && !existingUser.isVerified) {
      await this._userRepository.updateUser(existingUser._id, {
        otp: hashedOtp,
        otpExpires,
      });
      return existingUser;
    }
    return await this._userRepository.createUser({
      username,
      email,
      password: hashedPassword,
      otp: hashedOtp,
      otpExpires,
      isBlocked: false,
      isVerified: false,
    });
  }

  async googleSignIn(
    username: string,
    email: string,
    avatar: string,
    googleId: string
  ): Promise<LoginResponse> {
    let user = await this._userRepository.findByEmail(email);

    if (!user) {
      user = await this._userRepository.createUser({
        username,
        email,
        googleId,
        profile: { avatar: avatar },
        isVerified: true,
        isBlocked: false,
      });
    }

    if (user.isBlocked) throw new Error("User is blocked");

    const accessToken = this._jwtService.generateAccessToken(user);
    const refreshToken = this._jwtService.generateRefreshToken(user);

    return { accessToken, refreshToken, user };
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    const user = await this._userRepository.findByEmail(email);
    if (!user) throw new Error("User not found");
    if (user.isBlocked) throw new Error("User is blocked");
    if (!user.password || !(await bcrypt.compare(password, user.password)))
      throw new Error("Invalid credentials");

    const accessToken = this._jwtService.generateAccessToken(user);
    const refreshToken = this._jwtService.generateRefreshToken(user);
    return { accessToken, refreshToken, user };
  }

  async verifyOtp(email: string, otp: string): Promise<LoginResponse> {
    let user = await this._userRepository.findByEmail(email);

    if (!user) throw new Error("User not found");

    const hashedOtp = crypto
      .createHash("sha256")
      .update(otp.toString())
      .digest("hex");

    if (user.otp !== hashedOtp) throw new Error("Invalid OTP");
    if (user.otpExpires && new Date() > user.otpExpires)
      throw new Error("OTP expired");
    user._id
      ? await this._userRepository.updateUser(user?._id, {
          isVerified: true,
          otp: undefined,
          otpExpires: undefined,
        })
      : null;

    const accessToken = this._jwtService.generateAccessToken(user);
    const refreshToken = this._jwtService.generateRefreshToken(user);

    return { accessToken, refreshToken, user };
  }

  async verifyAccessToken(token: string): Promise<IUser> {
    const { decoded, error }: { decoded: IUser | null; error?: string } =
      this._jwtService.verifyAccessToken(token);

    if (error) throw new Error(error);
    if (!decoded || !decoded._id) throw new Error("Invalid token");

    const user = await this._userRepository.findById(
      new Types.ObjectId(decoded._id)
    );
    if (!user) throw new Error("User not found");
    if (user.isBlocked) throw new Error("User is blocked");

    return user;
  }

  refreshToken(refreshToken: string): {
    accessToken: string;
    user: Promise<IUser>;
  } {
    try {
      const { decoded, error }: { decoded: IUser | null; error?: string } =
        this._jwtService.verifyRefreshToken(refreshToken);
      if (error) throw new Error(error);
      if (!decoded || !decoded._id) throw new Error("Invalid token");
      const newAccessToken = this._jwtService.generateAccessToken(decoded);
      const validUser = this.verifyAccessToken(newAccessToken);
      return { accessToken: newAccessToken, user: validUser };
    } catch (error) {
      throw new Error("Invalid refresh token");
    }
  }
}
