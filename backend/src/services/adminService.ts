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

export class AdminService implements IAdminService {
  constructor(
    private _userRepository: IUserRepository,
    private _planRepository: IPlanRepository,
    private _userPlanRepository: IUserPlanRepository
  ) {}

  async listUsers(): Promise<IUser[]> {
    let users = await this._userRepository.findAll();
    if (!users) throw new NotFoundError("No users found");
    return users;
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

    const userPlans = await this._userPlanRepository.listUserPlans(query, page, limit);
    const data = await Promise.all(
      userPlans.data.map(async (userPlan) => {
        const plan = await this._planRepository.findById(userPlan.planId.toString());
        const user = await this._userRepository.findById(userPlan.userId.toString());
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

async getDashboardStats(): Promise<{
  users: number;
  subscriptions: number;
}> {
  try {
    const [users, subscriptions] = await Promise.all([
      this._userRepository.countDocuments({ isArchived: false }),
      this._userPlanRepository.countDocuments({ status: PlanStatus.ACTIVE }),
    ]);

    return {
      users,
      subscriptions,
    };
  } catch {
    throw new InternalServerError("Failed to fetch dashboard stats");
  }
}
}
