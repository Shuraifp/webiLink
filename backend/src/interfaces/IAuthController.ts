import { Request, Response } from "express";

export interface IAuthController {
  signUp(req: Request, res: Response): Promise<void>;
  googleSignIn(req:Request, res: Response): Promise<void>;
  login(req: Request, res: Response): Promise<void>;
  verifyOtp(req: Request, res: Response): Promise<void>;
  verifyAccessToken(req: Request, res: Response): Promise<void>;
  refreshToken(req: Request, res: Response): Promise<void>;
}
