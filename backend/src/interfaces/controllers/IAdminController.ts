import { Request, Response, NextFunction } from "express";

export interface IAdminController {
  // users
  listUsers(req: Request, res: Response, next: NextFunction): Promise<void>;
  blockUser(req: Request, res: Response, next: NextFunction): Promise<void>;
  unblockUser(req: Request, res: Response, next: NextFunction): Promise<void>;
  softDeleteUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void>;
  restoreUser(req: Request, res: Response, next: NextFunction): Promise<void>;
  // plans
  createPlan(req: Request, res: Response, next: NextFunction): Promise<void>;
  getAllActivePlans(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void>;
  getAllArchivedPlans(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void>;
  updatePlan(req: Request, res: Response, next: NextFunction): Promise<void>;
  archivePlan(req: Request, res: Response, next: NextFunction): Promise<void>;
  restorePlan(req: Request, res: Response, next: NextFunction): Promise<void>;
}
