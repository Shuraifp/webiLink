import { NextFunction, Request, Response } from "express";
import { IAuthService } from "../interfaces/services/IAuthService";
import { JWTPayload, successResponse, UserDataForCookies } from "../types/type";

export class AuthController {
  constructor(private _authService: IAuthService) {}

  private readonly domains = ["webilink.duckdns.org", "webi-link.vercel.app"];

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

      this.setAuthCookies(
        res,
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

      this.setAuthCookies(
        res,
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

      this.setAdminAuthCookies(
        res,
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

      this.setAuthCookies(
        res,
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
      res.status(200).json({ username: user.username, email: user.email });
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

      this.setAuthCookies(
        res,
        {
          _id: user.id,
          username: user.username,
          email: user.email,
          avatar: user.profile?.avatar ?? "",
          role: user.role!,
        },
        accessToken
      );
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

      const { accessToken, user } = await this._authService.refreshToken(
        refreshToken
      );

      this.setAdminAuthCookies(
        res,
        {
          _id: user.id,
          username: user.username,
          email: user.email,
          avatar: user.profile?.avatar ?? "",
          role: user.role!,
        },
        accessToken
      );
      res.status(200).json({ user, tokenNew: accessToken });
    } catch (error) {
      next(error);
    }
  }

  private setAuthCookies(
    res: Response,
    user: JWTPayload,
    accessToken: string,
    refreshToken?: string
  ) {
    const cookieOptions: import("express").CookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
    };

    const clientCookieOptions: import("express").CookieOptions = {
      httpOnly: false,
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

    if (refreshToken) {
      res.cookie("webiRefreshToken", refreshToken, {
        ...clientCookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000, 
        domain: this.domains[1],
      });
    }

    const authStatus = {
      isAuthenticated: true,
      userId: user._id,
      role: user.role,
      expiresAt: Date.now() + 15 * 60 * 1000,
    };

    res.cookie("webiAuthStatus", JSON.stringify(authStatus), {
      ...clientCookieOptions,
      maxAge: 15 * 60 * 1000,
      domain: this.domains[1],
    });

    const safeUserData: UserDataForCookies = {
      id: user._id || null,
      username: user.username || null,
      email: user.email || null,
      avatar: user.avatar,
      role: user.role || null,
    };

    res.cookie("webiUser", JSON.stringify(safeUserData), {
      ...clientCookieOptions,
      maxAge: 15 * 60 * 1000,
      domain: this.domains[1],
    });
  }

  private setAdminAuthCookies(
    res: Response,
    user: JWTPayload,
    accessToken: string,
    refreshToken?: string
  ) {
    const cookieOptions: import("express").CookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
    };

    const clientCookieOptions: import("express").CookieOptions = {
      httpOnly: false,
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

    if (refreshToken) {
      res.cookie("webiAdminRefreshToken", refreshToken, {
        ...clientCookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        domain: this.domains[1],
      });
    }

    const adminAuthStatus = {
      isAuthenticated: true,
      userId: user._id,
      role: user.role,
      expiresAt: Date.now() + 15 * 60 * 1000,
      isAdmin: true,
    };

    res.cookie("webiAdminStatus", JSON.stringify(adminAuthStatus), {
      ...clientCookieOptions,
      maxAge: 15 * 60 * 1000,
      domain: this.domains[1],
    });

    const safeUserData: UserDataForCookies = {
      id: user._id || null,
      username: user.username || null,
      email: user.email || null,
      avatar: user.avatar,
      role: user.role || null,
    };

    res.cookie("webiUser", JSON.stringify(safeUserData), {
      ...clientCookieOptions,
      maxAge: 15 * 60 * 1000,
      domain: this.domains[1],
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

      const clientCookieOptions: import("express").CookieOptions = {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        path: "/",
      };

      res.clearCookie("accessToken", cookieOptions);
      res.clearCookie("refreshToken", cookieOptions);

      res.clearCookie("webiRefreshToken", clientCookieOptions);
      res.clearCookie("webiAuthStatus", clientCookieOptions);
      res.clearCookie("webiUser", clientCookieOptions);

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

      const clientCookieOptions: import("express").CookieOptions = {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        path: "/",
      };

      res.clearCookie("adminAccessToken", cookieOptions);
      res.clearCookie("adminRefreshToken", cookieOptions);

      res.clearCookie("webiAdminRefreshToken", clientCookieOptions);
      res.clearCookie("webiAdminStatus", clientCookieOptions);
      res.clearCookie("webiUser", clientCookieOptions);

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
