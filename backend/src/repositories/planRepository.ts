import { IPlanRepository } from "../interfaces/repositories/IPlanRepository";
import { IPlan } from "../models/PlanModel";
import { BaseRepository } from "./baseRepository";
import { Model, Types } from "mongoose";

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

  async archive(id: Types.ObjectId): Promise<IPlan | null> {
    return await this._planModel.findByIdAndUpdate(id, { isArchived: true }, { new: true });
  }

  async restore(id: Types.ObjectId): Promise<IPlan | null> {
    return await this._planModel.findByIdAndUpdate(id, { isArchived: false }, { new: true });
  }
}
