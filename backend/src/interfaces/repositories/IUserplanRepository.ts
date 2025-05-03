import { IUserPlan } from "../../models/UserPlanModel";

export interface IUserPlanRepository {
  create(data: Partial<IUserPlan>): Promise<IUserPlan>;
  findUserPlan(userId: string): Promise<IUserPlan | null>;
}