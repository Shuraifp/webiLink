import { IPlan } from "../../models/PlanModel";
import { IUser } from "../../models/userModel";
import { IUserPlan, PlanStatus } from "../../models/UserPlanModel";


export interface IAdminService {
  listUsers(): Promise<IUser[]>;
  blockUser(userId: string): Promise<IUser>;
  unblockUser(userId: string): Promise<IUser>;
  softDeleteUser(userId: string): Promise<IUser>;
  restoreUser(userId: string): Promise<IUser>;
  listSubscriptions({
    page,
    limit,
    search,
    status,
  }: {
    page: number;
    limit: number;
    search?: string;
    status?: PlanStatus;
  }): Promise<{
    data: { userPlan: IUserPlan; plan: IPlan; user: IUser }[];
    totalItems: number;
    totalPages: number;
  }> 
  getDashboardStats: () => Promise<{
    users: number;
    subscriptions: number;
  }>;
}

