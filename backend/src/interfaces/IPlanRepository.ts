import { IPlan, PlanInput } from "../models/PlanModel";
import { Types } from "mongoose";

export interface IPlanRepository {
  createPlan(data: PlanInput): Promise<IPlan>;
  listActivePlans(): Promise<IPlan[]>;
  listArchivedPlans(): Promise<IPlan[]>;
  findById(planId: Types.ObjectId): Promise<IPlan | null>;
  updatePlan(planId: Types.ObjectId, data: Partial<IPlan>): Promise<IPlan | null>;
  archivePlan(planId: Types.ObjectId): Promise<IPlan | null>;
  restorePlan(planId: Types.ObjectId): Promise<IPlan | null>;
}
