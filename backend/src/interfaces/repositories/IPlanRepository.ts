import { Types } from "mongoose";
import { IBaseRepository } from "./IBaseRepository";
import { IPlan } from "../../types/models";

export interface IPlanRepository extends IBaseRepository<IPlan> {
  create(data: Partial<IPlan>): Promise<IPlan>;
  listActivePlans(): Promise<IPlan[]>;
  listArchivedPlans(): Promise<IPlan[]>;
  archive(id: Types.ObjectId): Promise<IPlan | null>;
  restore(id: Types.ObjectId): Promise<IPlan | null>;
}