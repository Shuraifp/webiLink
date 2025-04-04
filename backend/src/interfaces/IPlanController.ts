import { NextFunction, Request, Response } from "express";


export interface IPlanController {
  fetchActivePlans(req: Request, res: Response, next: NextFunction): Promise<void>;
}