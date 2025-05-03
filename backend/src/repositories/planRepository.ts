import { IPlanRepository } from "../interfaces/repositories/IPlanRepository";
import { IPlan } from "../models/PlanModel";
import { BaseRepository } from "./baseRepository";
import { Model } from "mongoose";

export class PlanRepository extends BaseRepository<IPlan> implements IPlanRepository {
  constructor(private _planModel: Model<IPlan>) {
    super(_planModel)
  }

  async listActivePlans(): Promise<IPlan[]> {
    return await this._planModel.find({ isArchived: false });
  }
  
  async listArchivedPlans(): Promise<IPlan[]> {
    return await this._planModel.find({ isArchived: true });
  }
}
