import Plan, { IPlan, PlanInput } from "../models/PlanModel";
import { Types } from "mongoose";

export class PlanRepository {
  constructor(private _planModel: typeof Plan) {}

  async createPlan(data: PlanInput): Promise<IPlan> {
    const plan = new Plan(data);
    return await plan.save();
  }

  async listActivePlans(): Promise<IPlan[]> {
    return await Plan.find({ isArchived: false });
  }
  
  async listArchivedPlans(): Promise<IPlan[]> {
    return await Plan.find({ isArchived: true });
  }

  async findById(planId: Types.ObjectId): Promise<IPlan | null> {
    return await Plan.findOne({ _id: planId, isArchived: false });
  }

  async updatePlan(planId: Types.ObjectId, data: Partial<IPlan>): Promise<IPlan | null> {
    return await Plan.findByIdAndUpdate(planId, data, { new: true });
  }

  async archivePlan(planId: Types.ObjectId): Promise<IPlan | null> {
    return await Plan.findByIdAndUpdate(planId, { isArchived: true }, { new: true });
  }

  async restorePlan(planId: Types.ObjectId): Promise<IPlan | null> {
    return await Plan.findByIdAndUpdate(planId, { isArchived: false }, { new: true });
  }
}
