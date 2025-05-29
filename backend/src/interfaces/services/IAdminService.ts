import { TransactionDTO } from "../../dto/transactionDTO";
import { IPlan } from "../../models/PlanModel";
import { IUser } from "../../models/userModel";
import { IUserPlan, PlanStatus } from "../../models/UserPlanModel";
import { DashboardStats, MeetingStats } from "../../services/adminService";

export interface IAdminService {
  listUsers(
    page: number,
    limit: number
  ): Promise<{
    data: IUser[];
    totalItems: number;
    totalPages: number;
  }>;
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
  }>;
  getDashboardStats(): Promise<DashboardStats>;
  getMeetingStats(): Promise<MeetingStats>;
  getRevenueData(
    timeframe?: string,
    startDate?: string,
    endDate?: string
  ): Promise<{ labels: (string | number)[]; totalPrices: number[] }>;
  getTransactions(
    page: number,
    limit: number
  ): Promise<{
    data: TransactionDTO[];
    totalItems: number;
    totalPages: number;
  }>;
}
