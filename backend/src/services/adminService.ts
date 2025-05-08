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

export class AdminService implements IAdminService {
  constructor(
    private _userRepository: IUserRepository,
    private _planRepository: IPlanRepository
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
}
