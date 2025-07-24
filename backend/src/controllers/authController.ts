import { NextFunction, Request, Response } from "express";
import { IAuthService } from "../interfaces/services/IAuthService";
import { JWTPayload, successResponse, TOKEN_EXPIRY, UserDataForCookies } from "../types/type";

export class AuthController {
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
      const authData = this.getAuthData(
        {
          _id: user.id,
          username: user.username,
          email: user.email,
          avatar: user.profile?.avatar ?? "",
          role: user.role!,
        },
        accessToken,
        refreshToken
      );
      this.setAuthCookies(res, accessToken, refreshToken);
      res
        .status(200)
        .json({ username: user.username, email: user.email, ...authData });
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
      const authData = this.getAuthData(
        {
          _id: user.id,
          username: user.username,
          email: user.email,
          avatar: user.profile?.avatar ?? "",
          role: user.role!,
        },
        accessToken,
        refreshToken
      );
      this.setAuthCookies(res, accessToken, refreshToken);
      res
        .status(200)
        .json({ username: user.username, email: user.email, ...authData });
    } catch (error) {
      next(error);
    }
  }

  async adminLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const { accessToken, refreshToken, user } =
        await this._authService.adminLogin(email, password);
      const adminAuthData = this.getAdminAuthData(
        {
          _id: user.id,
          username: user.username,
          email: user.email,
          avatar: user.profile?.avatar ?? "",
          role: user.role!,
        },
        accessToken,
        refreshToken
      );
      this.setAdminAuthCookies(res, accessToken, refreshToken);
      res.status(200).json({
        username: user.username,
        email: user.email,
        ...adminAuthData,
      });
    } catch (error) {
      next(error);
    }
  }

  async verifyOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, otp } = req.body;
      const { accessToken, refreshToken, user } =
        await this._authService.verifyOtp(email, otp);
      const authData = this.getAuthData(
        {
          _id: user.id,
          username: user.username,
          email: user.email,
          avatar: user.profile?.avatar ?? "",
          role: user.role!,
        },
        accessToken,
        refreshToken
      );
      this.setAuthCookies(res, accessToken, refreshToken);
      res
        .status(200)
        .json({ username: user.username, email: user.email, ...authData });
    } catch (error) {
      next(error);
    }
  }

  async verifyAccessToken(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies.accessToken;

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

      const { accessToken, user } = await this._authService.refreshToken(
        refreshToken
      );
      const authData = this.getAuthData(
        {
          _id: user._id,
          username: user.username,
          email: user.email,
          avatar: user.profile?.avatar ?? "",
          role: user.role!,
        },
        accessToken
      );
      this.setAuthCookies(res, accessToken);
      res.status(200).json({...authData });
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

      const { accessToken, user } = await this._authService.refreshToken(
        refreshToken
      );
      const authData = this.getAdminAuthData(
        {
          _id: user._id,
          username: user.username,
          email: user.email,
          avatar: user.profile?.avatar ?? "",
          role: user.role!,
        },
        accessToken
      );
      this.setAdminAuthCookies(res, accessToken);
      res.status(200).json({...authData });
    } catch (error) {
      next(error);
    }
  }

  private getAuthData(
    user: JWTPayload,
    accessToken: string,
    refreshToken?: string
  ) {
    const authStatus = {
      isAuthenticated: true,
      userId: user._id,
      role: user.role,
      expiresAt: Date.now() + TOKEN_EXPIRY.ACCESS_TOKEN,
    };
    const safeUserData: UserDataForCookies = {
      id: user._id || null,
      username: user.username || null,
      email: user.email || null,
      avatar: user.avatar,
      role: user.role || null,
    };
    return {
      webiAuthStatus: authStatus,
      webiUser: safeUserData,
      webiRefreshToken: refreshToken || null,
    };
  }

  private getAdminAuthData(
    user: JWTPayload,
    accessToken: string,
    refreshToken?: string
  ) {
    const adminAuthStatus = {
      isAuthenticated: true,
      userId: user._id,
      role: user.role,
      expiresAt: Date.now() + TOKEN_EXPIRY.ACCESS_TOKEN,
      isAdmin: true,
    };
    const safeUserData: UserDataForCookies = {
      id: user._id || null,
      username: user.username || null,
      email: user.email || null,
      avatar: user.avatar,
      role: user.role || null,
    };
    return {
      webiAdminStatus: adminAuthStatus,
      webiAdmin: safeUserData,
      webiAdminRefreshToken: refreshToken || null,
    };
  }

  private setAuthCookies(
    res: Response,
    accessToken: string,
    refreshToken?: string
  ) {
    const cookieOptions: import("express").CookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
    };

    if (refreshToken) {
      res.cookie("refreshToken", refreshToken, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
    }

    res.cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    });
  }

  private setAdminAuthCookies(
    res: Response,
    accessToken: string,
    refreshToken?: string
  ) {
    const cookieOptions: import("express").CookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
    };

    if (refreshToken) {
      res.cookie("adminRefreshToken", refreshToken, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
    }

    res.cookie("adminAccessToken", accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    });
  }

  async userLogout(req: Request, res: Response, next: NextFunction) {
    try {
      const cookieOptions: import("express").CookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        path: "/",
      };

      res.clearCookie("accessToken", cookieOptions);
      res.clearCookie("refreshToken", cookieOptions);

      res.status(200).json(successResponse("Logout successful"));
    } catch (error) {
      next(error);
    }
  }

  async adminLogout(req: Request, res: Response, next: NextFunction) {
    try {
      const cookieOptions: import("express").CookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        path: "/",
      };

      res.clearCookie("adminAccessToken", cookieOptions);
      res.clearCookie("adminRefreshToken", cookieOptions);

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
