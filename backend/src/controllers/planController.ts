import { Request, Response } from "express";
import { IPlanController } from "../interfaces/IPlanController";
import { IPlanService } from "../interfaces/IPlanService";
import { NotFoundError, InternalServerError, ForbiddenError } from "../utils/errors";
import { HttpStatus, successResponse, errorResponse } from "../types/type";


export class PlanController implements IPlanController {
  constructor(
    private __planService: IPlanService
  ) {}
  
  async fetchActivePlans(req: Request, res: Response): Promise<void> {
      try {
        const plans = await this.__planService.listActivePlans();
        if (!plans || plans.length === 0) throw new NotFoundError("No active plans found");
        res.status(HttpStatus.OK).json(successResponse("Active plans fetched successfully", plans));
      } catch (error) {
        this.handleError(res, error);
      }
    }

    private handleError(res: Response, error: unknown) {
        if (error instanceof InternalServerError || error instanceof ForbiddenError || error instanceof NotFoundError) {
          res.status(error.statusCode).json(errorResponse(error.message));
        } else {
          res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errorResponse("Internal server error"));
        }
      }
}