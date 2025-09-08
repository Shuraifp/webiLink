import { Request, Response, NextFunction } from "express";
import { successResponse } from "../types/type";
import { IUserService } from "../interfaces/services/IUserService";
import { HttpStatus } from "../types/type";
import { IAuthService } from "../interfaces/services/IAuthService";
import { IMailService } from "../utils/mail";

export class UserController {
  constructor(
    private _userService: IUserService,
    private _authService: IAuthService,
    private _mailService: IMailService
  ) {}

  async getUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user?._id as string;
      const user = await this._userService.getUserById(userId);
      res
        .status(HttpStatus.OK)
        .json(successResponse("User fetched successfully", user));
    } catch (error) {
      next(error);
    }
  }

  async checkPremium(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user?._id as string;
      const isPremiumUser = await this._userService.isPremiumUser(userId);
      res.status(HttpStatus.OK).json(
        successResponse("checked for user subscription status", {
          isPremiumUser,
        })
      );
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user?._id as string;
      const profileData = req.body;
      const updatedUser = await this._userService.updateUserProfile(
        userId,
        profileData
      );
      res
        .status(HttpStatus.OK)
        .json(
          successResponse("User profile updated successfully", updatedUser)
        );
    } catch (error) {
      next(error);
    }
  }

  async getUserByEmail(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email } = req.query;
      const user = await this._userService.getUserByEmail(email as string);
      res
        .status(HttpStatus.OK)
        .json(successResponse("User fetched successfully", user));
    } catch (error) {
      next(error);
    }
  }

  async requestSupport(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { name, email, message } = req.body;

      if (!name || !email || !message) {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: "Name, email, and message are required",
        });
        return;
      }
      const subject = `${String(name)
        .split(" ")
        .map((n) => n.split("")[0].toUpperCase() + n.slice(1))
        .join(" ")} requesting for support`;
      const text = `
        Name: ${name}
        Email: ${email}
        Message: ${message}
      `;

      await this._mailService.sendOtpEmail(
        "msharraf258@gmail.com",
        text,
        subject
      );

      res
        .status(HttpStatus.OK)
        .json(successResponse("Support request sent successfully"));
    } catch (error) {
      next(error);
    }
  }

  async changePassword(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user?._id as string;
      const { currentPassword, newPassword } = req.body;
      await this._authService.changePassword(
        userId,
        currentPassword,
        newPassword
      );
      res
        .status(HttpStatus.OK)
        .json(successResponse("Password updated successfully", null));
    } catch (error) {
      next(error);
    }
  }

  async getDashboardStats(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user?._id as string;
      const stats = await this._userService.getDashboardStats(userId);
      res
        .status(HttpStatus.OK)
        .json(successResponse("Dashboard stats fetched successfully", stats));
    } catch (error) {
      next(error);
    }
  }
}
