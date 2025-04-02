import { IUser } from "../models/userModel";
import { IPlan, PlanInput } from "../models/PlanModel";

export interface IAdminService {
  listUsers(): Promise<IUser[]>;
  blockUser(userId: string): Promise<IUser>;
  unblockUser(userId: string): Promise<IUser>;
  softDeleteUser(userId: string): Promise<IUser>;
  restoreUser(userId: string): Promise<IUser>;
  createPlan(data: PlanInput): Promise<IPlan>;
  listActivePlans(): Promise<IPlan[]>;
  listArchivedPlans(): Promise<IPlan[]>;
  findById(planId: string): Promise<IPlan | null>;
  updatePlan(planId: string, data: Partial<IPlan>): Promise<IPlan | null>;
  archivePlan(planId: string): Promise<IPlan | null>;
  restorePlan(planId: string): Promise<IPlan | null>;
}
