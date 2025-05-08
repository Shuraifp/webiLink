import { Types } from "mongoose";
import { IPlan } from "../../models/PlanModel";
import { IBaseRepository } from "./IBaseRepository";

export interface IPlanRepository extends IBaseRepository<IPlan> {
  create(data: Partial<IPlan>): Promise<IPlan>;
  listActivePlans(): Promise<IPlan[]>;
  listArchivedPlans(): Promise<IPlan[]>;
  archive(id: Types.ObjectId): Promise<IPlan | null>;
  restore(id: Types.ObjectId): Promise<IPlan | null>;
}