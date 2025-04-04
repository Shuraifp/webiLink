import { NextFunction, Request, Response } from "express";

export interface IAuthController {
  signUp(req: Request, res: Response, next: NextFunction): Promise<void>;
  googleSignIn(req: Request, res: Response, next: NextFunction): Promise<void>;
  login(req: Request, res: Response, next: NextFunction): Promise<void>;
  adminLogin(req: Request, res: Response, next: NextFunction): Promise<void>;
  verifyOtp(req: Request, res: Response, next: NextFunction): Promise<void>;
  verifyAccessToken(req: Request, res: Response, next: NextFunction): Promise<void>;
  refreshUserToken(req: Request, res: Response, next: NextFunction): Promise<void>;
  refreshAdminToken(req: Request, res: Response, next: NextFunction): Promise<void>;
  requestResetPassword(req: Request, res: Response, next: NextFunction): Promise<void>;
  userLogout(req: Request, res: Response, next: NextFunction): Promise<void>;
  adminLogout(req: Request, res: Response, next: NextFunction): Promise<void>;
}
