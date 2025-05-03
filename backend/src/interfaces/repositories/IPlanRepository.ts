import { IPlan } from "../../models/PlanModel";
import { IBaseRepository } from "./IBaseRepository";

export interface IPlanRepository extends IBaseRepository<IPlan> {
  listActivePlans(): Promise<IPlan[]>;
  listArchivedPlans(): Promise<IPlan[]>;
}
