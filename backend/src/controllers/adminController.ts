import { NextFunction, Request, Response } from "express";
import { successResponse } from "../types/type";
import { IAdminController } from "../interfaces/controllers/IAdminController";
import { IAdminService } from "../interfaces/services/IAdminService";
import { HttpStatus } from "../types/type";

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
}