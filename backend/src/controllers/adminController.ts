import { NextFunction, Request, Response } from "express";
import { inject, injectable } from "inversify";
import { successResponse, errorResponse } from "../types/type";
import { IAdminController } from "../interfaces/IAdminController";
import { IAdminService } from "../interfaces/IAdminService";
import { HttpStatus } from "../types/type";
import { InternalServerError, ForbiddenError, NotFoundError } from "../utils/errors";

export class AdminController implements IAdminController {
  constructor(private _adminService : IAdminService) {}

  async listUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        const users = await this._adminService.listUsers()
        res.status(HttpStatus.OK).json(successResponse("Users fetched successfully", users))
      } catch (err) {
        next(err);
      }
  }

  async blockUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;
      const updatedUser = await this._adminService.blockUser(userId);
      res.status(HttpStatus.OK).json(successResponse("User blocked successfully", updatedUser));
    } catch (error) {
      next(error);
    }
  }

  async unblockUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;
      const updatedUser = await this._adminService.unblockUser(userId);
      res.status(HttpStatus.OK).json(successResponse("User unblocked successfully", updatedUser));
    } catch (error) {
      next(error);
    }
  }

  async softDeleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;
      const updatedUser = await this._adminService.softDeleteUser(userId);
      res.status(HttpStatus.OK).json(successResponse("User archived successfully", updatedUser));
    } catch (error) {
      next(error);
    }
  }

  async restoreUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;
      const updatedUser = await this._adminService.restoreUser(userId);
      res.status(HttpStatus.OK).json(successResponse("User restored successfully", updatedUser));
    } catch (error) {
      next(error);
    }
  }

  //      Plans

  async createPlan(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const planData = req.body; 
      const createdPlan = await this._adminService.createPlan(planData);
      res.status(HttpStatus.CREATED).json(successResponse("Plan created successfully", createdPlan));
    } catch (error) {
      next(error);
    }
  }

  async getAllActivePlans(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const plans = await this._adminService.listActivePlans();
      if (!plans || plans.length === 0) throw new NotFoundError("No active plans found");
      res.status(HttpStatus.OK).json(successResponse("Active plans fetched successfully", plans));
    } catch (error) {
      next(error);
    }
  }
  
  async getAllArchivedPlans(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const plans = await this._adminService.listArchivedPlans();
      if (!plans || plans.length === 0) throw new NotFoundError("No active plans found");
      res.status(HttpStatus.OK).json(successResponse("Active plans fetched successfully", plans));
    } catch (error) {
      next(error);
    }
  }

  async updatePlan(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { planId } = req.params;
      const planData = req.body; 
      const updatedPlan = await this._adminService.updatePlan(planId, planData);
      if (!updatedPlan) throw new InternalServerError("Failed to update plan");
      res.status(HttpStatus.OK).json(successResponse("Plan updated successfully", updatedPlan));
    } catch (error) {
      next(error);
    }
  }

  async archivePlan(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { planId } = req.params;
      const archivedPlan = await this._adminService.archivePlan(planId);
      if (!archivedPlan) throw new InternalServerError("Failed to archive plan");
      res.status(HttpStatus.OK).json(successResponse("Plan archived successfully", archivedPlan));
    } catch (error) {
      next(error);
    }
  }

  async restorePlan(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { planId } = req.params;
      const restoredPlan = await this._adminService.restorePlan(planId);
      if (!restoredPlan) throw new InternalServerError("Failed to restore plan");
      res.status(HttpStatus.OK).json(successResponse("Plan restored successfully", restoredPlan));
    } catch (error) {
      next(error);
    }
  }
}