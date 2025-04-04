import { NextFunction, Request, Response } from "express";
import { IPlanController } from "../interfaces/controllers/IPlanController";
import { IPlanService } from "../interfaces/services/IPlanService";
import { NotFoundError, InternalServerError, ForbiddenError } from "../utils/errors";
import { HttpStatus, successResponse, errorResponse } from "../types/type";


export class PlanController implements IPlanController {
  constructor(
    private __planService: IPlanService
  ) {}
  
  async fetchActivePlans(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        const plans = await this.__planService.listActivePlans();
        if (!plans || plans.length === 0) throw new NotFoundError("No active plans found");
        res.status(HttpStatus.OK).json(successResponse("Active plans fetched successfully", plans));
      } catch (error) {
        next(error);
      }
    }
}