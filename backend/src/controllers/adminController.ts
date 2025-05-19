import { NextFunction, Request, Response } from "express";
import { successResponse } from "../types/type";
import { IAdminService } from "../interfaces/services/IAdminService";
import { HttpStatus } from "../types/type";
import { PlanStatus } from "../models/UserPlanModel";

export class AdminController {
  constructor(private _adminService: IAdminService) {}

  async listUsers(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const users = await this._adminService.listUsers(page, limit);
      res
        .status(HttpStatus.OK)
        .json(successResponse("Users fetched successfully", users));
    } catch (err) {
      next(err);
    }
  }

  async blockUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { userId } = req.params;
      const updatedUser = await this._adminService.blockUser(userId);
      res
        .status(HttpStatus.OK)
        .json(successResponse("User blocked successfully", updatedUser));
    } catch (error) {
      next(error);
    }
  }

  async unblockUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { userId } = req.params;
      const updatedUser = await this._adminService.unblockUser(userId);
      res
        .status(HttpStatus.OK)
        .json(successResponse("User unblocked successfully", updatedUser));
    } catch (error) {
      next(error);
    }
  }

  async softDeleteUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { userId } = req.params;
      const updatedUser = await this._adminService.softDeleteUser(userId);
      res
        .status(HttpStatus.OK)
        .json(successResponse("User archived successfully", updatedUser));
    } catch (error) {
      next(error);
    }
  }

  async restoreUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { userId } = req.params;
      const updatedUser = await this._adminService.restoreUser(userId);
      res
        .status(HttpStatus.OK)
        .json(successResponse("User restored successfully", updatedUser));
    } catch (error) {
      next(error);
    }
  }

  async listSubscriptions(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { page = 1, limit = 10, search, status } = req.query;
      const subscriptions = await this._adminService.listSubscriptions({
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        search: search as string,
        status: status as PlanStatus,
      });
      res
        .status(HttpStatus.OK)
        .json(
          successResponse("Subscriptions fetched successfully", subscriptions)
        );
    } catch (error) {
      next(error);
    }
  }

 async getDashboardStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await this._adminService.getDashboardStats();
      res
        .status(HttpStatus.OK)
        .json(successResponse("Dashboard stats fetched successfully", stats));
    } catch (err) {
      next(err);
    }
  }
}
