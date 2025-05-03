import { Types } from "mongoose";
import { IPlan } from "../../models/PlanModel";

export interface IPlanRepository {
  create(data: Partial<IPlan>): Promise<IPlan>;
  findById(id: Types.ObjectId): Promise<IPlan | null>;
  findOne(query: object): Promise<IPlan | null>;
  listActivePlans(): Promise<IPlan[]>;
  listArchivedPlans(): Promise<IPlan[]>;
  update(id: Types.ObjectId, data: Partial<IPlan>): Promise<IPlan | null>;
  archive(id: Types.ObjectId): Promise<IPlan | null>;
  restore(id: Types.ObjectId): Promise<IPlan | null>;
}