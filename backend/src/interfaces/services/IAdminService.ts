import { PlanDTO } from "../../dto/planDTO";
import { TransactionDTO } from "../../dto/transactionDTO";
import { UserDTO } from "../../dto/userDTO";
import { IUserPlan, PlanStatus } from "../../models/UserPlanModel";
import { DashboardStats, MeetingStats } from "../../services/adminService";

export interface IAdminService {
  listUsers(
    page: number,
    limit: number
  ): Promise<{
    data: UserDTO[];
    totalItems: number;
    totalPages: number;
  }>;
  blockUser(userId: string): Promise<UserDTO>;
  unblockUser(userId: string): Promise<UserDTO>;
  softDeleteUser(userId: string): Promise<UserDTO>;
  restoreUser(userId: string): Promise<UserDTO>;
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
    data: { userPlan: IUserPlan; plan: PlanDTO; user: UserDTO }[];
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
