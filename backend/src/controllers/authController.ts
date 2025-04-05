import { NextFunction, Request, Response } from "express";
import { inject, injectable } from "inversify";
import TYPES from "../di/types";
import { IAuthService } from "../interfaces/services/IAuthService";
import { IAuthController } from "../interfaces/controllers/IAuthController";
import { successResponse, errorResponse } from "../types/type";

// @injectable()
export class AuthController implements IAuthController {
  constructor(private _authService: IAuthService) {}

  async signUp(req: Request, res: Response, next: NextFunction) {
    try {
      const { username, email, password } = req.body;
      const user = await this._authService.signUp(username, email, password); //as ResponseUser
      res
        .status(201)
        .json(successResponse("User registered successfully", user));
    } catch (error) {
      next(error);
    }
  }

  async googleSignIn(req: Request, res: Response, next: NextFunction) {
    try {
      const { username, email, avatar, googleId } = req.body;

      if (!email) {
        res.status(400).json({ message: "Email is required" });
        return;
      }

      const { accessToken, refreshToken, user } =
        await this._authService.googleSignIn(username, email, avatar, googleId);

      this.setAuthCookies(res, accessToken, refreshToken);
      res.status(200).json({ username: user.username, email: user.email });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const { accessToken, refreshToken, user } = await this._authService.login(
        email,
        password
      );

      this.setAuthCookies(res, accessToken, refreshToken);
      res.status(200).json({ username: user.username, email: user.email });
    } catch (error) {
      next(error);
    }
  }

  async adminLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const { accessToken, refreshToken, user } =
        await this._authService.adminLogin(email, password);

      this.setAdminAuthCookies(res, accessToken, refreshToken);
      res.status(200).json({ username: user.username, email: user.email });
    } catch (error) {
      next(error);
    }
  }

  async verifyOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, otp } = req.body;
      const { accessToken, refreshToken, user } =
        await this._authService.verifyOtp(email, otp);

      this.setAuthCookies(res, accessToken, refreshToken);
      res.status(200).json({ username: user.username, email: user.email });
    } catch (error) {
      next(error);
    }
  }

  async verifyAccessToken(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies.accessToken;
      console.log(token);

      if (!token) {
        res.status(401).json({ message: "Access token is required" });
        return;
      }

      const user = await this._authService.verifyAccessToken(token);
      res
        .status(200)
        .json({ id: user._id, username: user.username, email: user.email });
    } catch (error) {
      next(error);
    }
  }

  async refreshUserToken(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        res.status(401).json({ message: "Refresh token is required" });
        return;
      }

      const { accessToken, user } =
        this._authService.refreshToken(refreshToken);

      this.setAuthCookies(res, accessToken);
      res.status(200).json({ user, tokenNew: accessToken });
    } catch (error) {
      next(error);
    }
  }

  async refreshAdminToken(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies.adminRefreshToken;

      if (!refreshToken) {
        res.status(401).json({ message: "Refresh token is required" });
        return;
      }

      const { accessToken, user } =
        this._authService.refreshToken(refreshToken);

      this.setAdminAuthCookies(res, accessToken);
      res.status(200).json({ user, tokenNew: accessToken });
    } catch (error) {
      next(error);
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
      maxAge: 15 * 60 * 1000,
    });
  }

  private setAdminAuthCookies(
    res: Response,
    accessToken: string,
    refreshToken?: string
  ) {
    refreshToken
      ? res.cookie("adminRefreshToken", refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 7 * 24 * 60 * 60 * 1000,
        })
      : null;
    res.cookie("adminAccessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
    });
    console.log("donee");
  }

  async userLogout(req: Request, res: Response, next: NextFunction) {
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

      res.status(200).json(successResponse("Logout successful"));
    } catch (error) {
      next(error);
    }
  }

  async adminLogout(req: Request, res: Response, next: NextFunction) {
    try {
      res.clearCookie("adminAccessToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });

      res.clearCookie("adminRefreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });

      res.status(200).json(successResponse("Logout successful"));
    } catch (error) {
      next(error);
    }
  }

  async requestResetPassword(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email } = req.body;
      if (!email) throw new Error("Email is required");
      await this._authService.requestPasswordReset(email);
      res
        .status(200)
        .json(
          successResponse(
            "Link has been sent to your email address. check it out now and get a link to reset your password"
          )
        );
    } catch (err) {
      next(err);
    }
  }

  async resetPassword(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { token, newPassword } = req.body;
      if (!token || !newPassword) {
        throw new Error("Token and new password are required");
      }

      await this._authService.resetPassword(token, newPassword);
      res.status(200).json(successResponse("Password reset successfully"));
    } catch (error) {
      next(error);
    }
  }
}
