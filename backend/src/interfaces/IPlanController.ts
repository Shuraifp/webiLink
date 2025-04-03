import { Request, Response } from "express";


export interface IPlanController {
  fetchActivePlans(req: Request, res: Response): Promise<void>;
}