import { NextFunction, Request, Response } from "express";

export interface IPlanController {
  fetchActivePlans(req: Request, res: Response, next: NextFunction): Promise<void>;
  createPlan(req: Request, res: Response, next: NextFunction): Promise<void>;
  updatePlan(req: Request, res: Response, next: NextFunction): Promise<void>;
  makeSubscription(req: Request, res: Response, next: NextFunction): Promise<void>;
  handleWebhook(req: Request, res: Response, next: NextFunction): Promise<void>;
  // getUserPlan(req: Request, res: Response, next: NextFunction): Promise<void>;
}