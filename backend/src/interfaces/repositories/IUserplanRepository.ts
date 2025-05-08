import { IUserPlan } from "../../models/UserPlanModel";
import { IBaseRepository } from "./IBaseRepository";

export interface IUserPlanRepository extends IBaseRepository<IUserPlan> {
  findUserPlan(userId: string): Promise<IUserPlan | null>;
}