// import { injectable, inject } from "inversify";
// import TYPES from "../di/types";
import { IAdminService } from "../interfaces/services/IAdminService";
import { IUser } from "../models/userModel";
import { IUserRepository } from "../interfaces/repositories/IUserRepository";
import { Types } from "mongoose";
import { UserRole } from "../types/type";
import {
  InternalServerError,
  ForbiddenError,
  NotFoundError,
} from "../utils/errors";
import { IPlanRepository } from "../interfaces/repositories/IPlanRepository";
import { PlanInput, IPlan } from "../models/PlanModel";


// @injectable
export class AdminService implements IAdminService {
  constructor(
    private _userRepository: IUserRepository,
    private _planRepository: IPlanRepository
  ) {}

  async listUsers(): Promise<IUser[]> {
    let users = await this._userRepository.listUsers();
    if (!users) throw new NotFoundError("No users found");
    return users;
  }

  async blockUser(userId: string): Promise<IUser> {
    const user = await this._userRepository.findById(
      new Types.ObjectId(userId)
    );
    if (!user) throw new NotFoundError("User not found");
    if (user.role === UserRole.ADMIN)
      throw new ForbiddenError("Cannot block an admin");

    const success = await this._userRepository.blockUser(userId);
    if (!success) throw new InternalServerError("Failed to block user");

    const updatedUser = await this._userRepository.findById(
      new Types.ObjectId(userId)
    );
    if (!updatedUser) throw new NotFoundError("User not found after update");
    return updatedUser;
  }

  async unblockUser(userId: string): Promise<IUser> {
    const user = await this._userRepository.findById(
      new Types.ObjectId(userId)
    );
    if (!user) throw new NotFoundError("User not found");

    const success = await this._userRepository.unblockUser(userId);
    if (!success) throw new InternalServerError("Failed to unblock user");

    const updatedUser = await this._userRepository.findById(
      new Types.ObjectId(userId)
    );
    if (!updatedUser) throw new NotFoundError("User not found after update");
    return updatedUser;
  }

  async softDeleteUser(userId: string): Promise<IUser> {
    const user = await this._userRepository.findById(
      new Types.ObjectId(userId)
    );
    if (!user) throw new NotFoundError("User not found");

    const success = await this._userRepository.softDeleteUser(userId);
    if (!success) throw new InternalServerError("Failed to archive user");

    const updatedUser = await this._userRepository.findById(
      new Types.ObjectId(userId)
    );
    if (!updatedUser) throw new NotFoundError("User not found after update");
    return updatedUser;
  }

  async restoreUser(userId: string): Promise<IUser> {
    const user = await this._userRepository.findById(
      new Types.ObjectId(userId)
    );
    if (!user) throw new NotFoundError("User not found");

    if (!user.isArchived)
      throw new InternalServerError("User is already active");

    const success = await this._userRepository.restoreUser(userId);
    if (!success) throw new InternalServerError("Failed to restore user");

    const updatedUser = await this._userRepository.findById(
      new Types.ObjectId(userId)
    );
    if (!updatedUser) throw new NotFoundError("User not found after update");
    return updatedUser;
  }

  async createPlan(data: PlanInput): Promise<IPlan> {
    try {
      const plan = await this._planRepository.createPlan(data);
      if (!plan) throw new InternalServerError("Failed to create plan");
      return plan;
    } catch (error) {
      console.log(error)
      throw new InternalServerError("An error occurred while creating the plan");
    }
  }
  
  async listActivePlans(): Promise<IPlan[]> {
    try {
      const plans = await this._planRepository.listActivePlans();
      if (!plans || plans.length === 0) throw new NotFoundError("No active plans found");
      return plans;
    } catch (error) {
      throw new InternalServerError("An error occurred while fetching plans");
    }
  }
  
  async listArchivedPlans(): Promise<IPlan[]> {
    try {
      const plans = await this._planRepository.listArchivedPlans();
      if (!plans || plans.length === 0) throw new NotFoundError("No active plans found");
      return plans;
    } catch (error) {
      throw new InternalServerError("An error occurred while fetching plans");
    }
  }
  
  async findById(planId: string): Promise<IPlan | null> {
    try {
      const plan = await this._planRepository.findById(new Types.ObjectId(planId));
      if (!plan) throw new NotFoundError("Plan not found");
      return plan;
    } catch (error) {
      throw new InternalServerError("An error occurred while retrieving the plan");
    }
  }
  
  async updatePlan(planId: string, data: Partial<IPlan>): Promise<IPlan | null> {
    try {
      const updatedPlan = await this._planRepository.updatePlan(new Types.ObjectId(planId), data);
      if (!updatedPlan) throw new InternalServerError("Failed to update plan");
      return updatedPlan;
    } catch (error) {
      throw new InternalServerError("An error occurred while updating the plan");
    }
  }
  
  async archivePlan(planId: string): Promise<IPlan | null> {
    try {
      const archivedPlan = await this._planRepository.archivePlan(new Types.ObjectId(planId));
      console.log(archivedPlan)
      if (!archivedPlan) throw new InternalServerError("Failed to archive plan");
      return archivedPlan;
    } catch (error) {
      throw new InternalServerError("An error occurred while archiving the plan");
    }
  }
  
  async restorePlan(planId: string): Promise<IPlan | null> {
    try {
      const restoredPlan = await this._planRepository.restorePlan(new Types.ObjectId(planId));
      if (!restoredPlan) throw new InternalServerError("Failed to restore plan");
      return restoredPlan;
    } catch (error) {
      throw new InternalServerError("An error occurred while restoring the plan");
    }
  }
  
}
