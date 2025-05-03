import { Request, Response, NextFunction } from "express";

export default interface ISubscriptionController {
  createSubscription(req: Request, res: Response, next: NextFunction): Promise<void>;
  getSubscriptions(req: Request, res: Response, next: NextFunction): Promise<void>;
  editSubscription(req: Request, res: Response, next: NextFunction): Promise<void>;
  getActiveSubscriptions(req: Request, res: Response, next: NextFunction): Promise<void>;
  makeSubscription(req: Request, res: Response, next: NextFunction): Promise<void>;
  handleWebhook(req: Request, res: Response, next: NextFunction): Promise<void>;
  getUserSubscription(req: Request, res: Response, next: NextFunction): Promise<void>;
  getUsersSubscriptions(req: Request, res: Response, next: NextFunction): Promise<void>;
  changeUserSubscriptionStatus(req: Request, res: Response, next: NextFunction): Promise<void>;
};