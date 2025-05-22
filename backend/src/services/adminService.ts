import { IAdminService } from "../interfaces/services/IAdminService";
import { IUser } from "../models/userModel";
import { IUserRepository } from "../interfaces/repositories/IUserRepository";
import { UserRole } from "../types/type";
import {
  InternalServerError,
  ForbiddenError,
  NotFoundError,
} from "../utils/errors";
import { IPlanRepository } from "../interfaces/repositories/IPlanRepository";
import { IUserPlan, PlanStatus } from "../models/UserPlanModel";
import { IPlan } from "../models/PlanModel";
import { IUserPlanRepository } from "../interfaces/repositories/IUserplanRepository";
import { IPaymentRepository } from "../interfaces/repositories/IPaymentRepository";

export interface DashboardStats {
  users: number;
  subscriptions: { planId: string; planName: string; count: number }[];
  totalRevenue: number;
  planTrends: { planId: string; planName: string; count: number }[];
  // meetings: number;
}

export class AdminService implements IAdminService {
  constructor(
    private _userRepository: IUserRepository,
    private _planRepository: IPlanRepository,
    private _userPlanRepository: IUserPlanRepository,
    private _paymentRepository: IPaymentRepository
  ) {}

  async listUsers(
    page: number = 1,
    limit: number = 10
  ): Promise<{
    data: IUser[];
    totalItems: number;
    totalPages: number;
  }> {
    try {
      if (page < 1 || limit < 1) {
        throw new InternalServerError(
          "Page and limit must be positive numbers"
        );
      }

      const result = await this._userRepository.listUsers(page, limit);
      if (!result.data || result.data.length === 0) {
        return { data: [], totalItems: 0, totalPages: 0 };
      }
      return result;
    } catch (error) {
      throw error instanceof InternalServerError
        ? error
        : new InternalServerError("Failed to fetch users");
    }
  }

  async blockUser(userId: string): Promise<IUser> {
    const user = await this._userRepository.findById(userId);
    if (!user) throw new NotFoundError("User not found");
    if (user.role === UserRole.ADMIN)
      throw new ForbiddenError("Cannot block an admin");

    const success = await this._userRepository.blockUser(userId);
    if (!success) throw new InternalServerError("Failed to block user");

    const updatedUser = await this._userRepository.findById(userId);
    if (!updatedUser) throw new NotFoundError("User not found after update");
    return updatedUser;
  }

  async unblockUser(userId: string): Promise<IUser> {
    const user = await this._userRepository.findById(userId);
    if (!user) throw new NotFoundError("User not found");

    const success = await this._userRepository.unblockUser(userId);
    if (!success) throw new InternalServerError("Failed to unblock user");

    const updatedUser = await this._userRepository.findById(userId);
    if (!updatedUser) throw new NotFoundError("User not found after update");
    return updatedUser;
  }

  async softDeleteUser(userId: string): Promise<IUser> {
    const user = await this._userRepository.findById(userId);
    if (!user) throw new NotFoundError("User not found");

    const success = await this._userRepository.archive(userId);
    if (!success) throw new InternalServerError("Failed to archive user");

    const updatedUser = await this._userRepository.findById(userId);
    if (!updatedUser) throw new NotFoundError("User not found after update");
    return updatedUser;
  }

  async restoreUser(userId: string): Promise<IUser> {
    const user = await this._userRepository.findById(userId);
    if (!user) throw new NotFoundError("User not found");

    if (!user.isArchived)
      throw new InternalServerError("User is already active");

    const success = await this._userRepository.restore(userId);
    if (!success) throw new InternalServerError("Failed to restore user");

    const updatedUser = await this._userRepository.findById(userId);
    if (!updatedUser) throw new NotFoundError("User not found after update");
    return updatedUser;
  }

  async listSubscriptions({
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
  }> {
    try {
      const query: any = {};
      if (status) query.status = status;
      if (search) {
        const userIds = await this._userRepository.searchUsers(search);
        query.userId = { $in: userIds };
      }

      const userPlans = await this._userPlanRepository.listUserPlans(
        query,
        page,
        limit
      );
      const data = await Promise.all(
        userPlans.data.map(async (userPlan) => {
          const plan = await this._planRepository.findById(
            userPlan.planId.toString()
          );
          const user = await this._userRepository.findById(
            userPlan.userId.toString()
          );
          if (!plan || !user) throw new NotFoundError("Plan or User not found");
          return { userPlan, plan, user };
        })
      );

      return {
        data,
        totalItems: userPlans.totalItems,
        totalPages: userPlans.totalPages,
      };
    } catch (error) {
      throw error instanceof NotFoundError
        ? error
        : new InternalServerError("Failed to fetch subscriptions");
    }
  }

  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const [userCount, subscriptionCounts, totalRevenue, activePlans] = await Promise.all([
        this._userRepository.countDocuments({
          isArchived: false,
          isBlocked: false,
        }),
        this._userPlanRepository.getSubscriptionCounts(),
        this._paymentRepository.getTotalRevenue(),
        this._planRepository.listActivePlans()
      ]);

      return {
        users: userCount,
        subscriptions: subscriptionCounts,
        totalRevenue,
        planTrends : activePlans.map((plan) => ({
          planId: plan._id!.toString(),
          planName: plan.name,
          count: subscriptionCounts.filter((sub) => sub.planId.toString() === plan._id!.toString()).reduce((acc, sub) => acc + sub.count, 0),
        })),
      };
    } catch {
      throw new InternalServerError("Failed to fetch dashboard stats");
    }
  }

  async getRevenueData(
    timeframe?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<{ labels: (string | number)[]; totalPrices: number[] }> {
    try {
      const [{ labels, totalPrices }] = await Promise.all([
        this._paymentRepository.getRevenueData(timeframe),
      ]);

      return {
        labels,
        totalPrices,
      };
    } catch {
      throw new InternalServerError("Failed to fetch dashboard stats");
    }
  }
}
