import { IUserPlan } from "../../models/UserPlanModel";
import { IBaseRepository } from "./IBaseRepository";

export interface IUserPlanRepository extends IBaseRepository<IUserPlan> {
  findAllByQuery(query: any): Promise<IUserPlan[]>;
  findUserPlan(userId: string): Promise<IUserPlan | null>;
  listUserPlans(
    query: any,
    page: number,
    limit: number
  ): Promise<{
    data: IUserPlan[];
    totalItems: number;
    totalPages: number;
  }>;
  countDocuments(query: any): Promise<number>;
  getHistory(
    userId: string,
    page: number,
    limit: number
  ): Promise<{
    data: IUserPlan[];
    totalItems: number;
    totalPages: number;
  }>;
  getSubscriptionCounts(): Promise<
    { planId: string; planName: string; count: number }[]
  >;
}
