import { Request, Response, NextFunction } from "express";

export interface IUserController {
  getUser(req: Request, res: Response, next: NextFunction): Promise<void>;
  updateProfile(req: Request, res: Response, next: NextFunction): Promise<void>;
  getUserByEmail(req: Request, res: Response, next: NextFunction): Promise<void>;
}