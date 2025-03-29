import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import TYPES from "../di/types";
import { IAuthService } from "../interfaces/IAuthService";
import { IAuthController } from "../interfaces/IAuthController";
import { ResponseUser } from "../types/type";

@injectable()
export class AuthController implements IAuthController {
  constructor(@inject(TYPES.IAuthService) private _authService: IAuthService) {}

  async signUp(req: Request, res: Response) {
    try {
      const { username, email, password } = req.body;
      const user = await this._authService.signUp(username, email, password); //as ResponseUser
      res.status(201).json(user);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async googleSignIn(req: Request, res: Response) {
    try {
      const { username, email, avatar, googleId } = req.body;

      if (!email) {
        res.status(400).json({ message: "Email is required" });
        return
      }

      const { accessToken, refreshToken, user } =
        await this._authService.googleSignIn(username, email, avatar, googleId);

      this.setAuthCookies(res, accessToken, refreshToken);
      res.status(200).json({username:user.username,email:user.email});
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const { accessToken, refreshToken, user } = await this._authService.login(
        email,
        password
      );

      this.setAuthCookies(res, accessToken, refreshToken);
      res.status(200).json({username:user.username,email:user.email});
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async verifyOtp(req: Request, res: Response) {
    try {
      const { email, otp } = req.body;
      const { accessToken, refreshToken, user } =
        await this._authService.verifyOtp(email, otp);

      this.setAuthCookies(res, accessToken, refreshToken);
      res.status(200).json({username:user.username,email:user.email});
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async verifyAccessToken(req: Request, res: Response) {
    try {
      const token = req.cookies.accessToken;

      if (!token) {
        res.status(401).json({ message: "Access token is required" });
      }

      const user = await this._authService.verifyAccessToken(token);
      res.status(200).json({username:user.username,email:user.email});
    } catch (error) {
      this.handleError(res, error, 401);
    }
  }

  async refreshToken(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        res.status(401).json({ message: "Refresh token is required" });
        return;
      }

      const { accessToken, user } =
        this._authService.refreshToken(refreshToken);

      this.setAuthCookies(res, accessToken);
      res.status(200).json({ user,tokenNew:accessToken });
    } catch (error) {
      this.handleError(res, error, 401);
    }
  }

  private setAuthCookies(
    res: Response,
    accessToken: string,
    refreshToken?: string
  ) {
    refreshToken
      ? res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 7 * 24 * 60 * 60 * 1000,
        })
      : null;
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge:  30 * 1000,
    });
  }

  private handleError(res: Response, error: unknown, statusCode: number = 400) {
    if (error instanceof Error) {
      res.status(statusCode).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async logout(req: Request, res: Response) {
    try {
      res.clearCookie("accessToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });
  
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });
  
      res.status(200).json({ message: "Logout successful" });
    } catch (error) {
      this.handleError(res, error, 500);
    }
  }
  
}
