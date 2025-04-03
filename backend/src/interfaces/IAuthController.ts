import { Request, Response } from "express";

export interface IAuthController {
  signUp(req: Request, res: Response): Promise<void>;
  googleSignIn(req:Request, res: Response): Promise<void>;
  login(req: Request, res: Response): Promise<void>;
  adminLogin(req: Request, res: Response): Promise<void>;
  verifyOtp(req: Request, res: Response): Promise<void>;
  verifyAccessToken(req: Request, res: Response): Promise<void>;
  refreshUserToken(req: Request, res: Response): Promise<void>;
  refreshAdminToken(req: Request, res: Response): Promise<void>;
  requestResetPassword(req: Request, res: Response): Promise<void>;
  userLogout(req: Request, res: Response): Promise<void>;
  adminLogout(req: Request, res: Response): Promise<void>;
}
