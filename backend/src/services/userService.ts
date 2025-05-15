import { IUserService } from "../interfaces/services/IUserService";
import { ResponseUser } from "../types/responses";
import { IUserRepository } from "../interfaces/repositories/IUserRepository";
import { NotFoundError, InternalServerError } from "../utils/errors";
import { IUser } from "../models/userModel";

export class UserService implements IUserService {
  constructor(private _userRepository: IUserRepository) {}

  private toResponseUser(user: IUser): ResponseUser {
    return {
      _id: user._id,
      username: user.username,
      email: user.email,
      profile: user.profile
        ? {
            firstName: user.profile.firstName,
            lastName: user.profile.lastName,
            avatar: user.profile.avatar,
            backgroundImage: user.profile.backgroundImage,
            bio: user.profile.bio,
            jobTitle: user.profile.jobTitle,
            company: user.profile.company,
          }
        : undefined,
      isPremium: user.isPremium,
      planId: user.planId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async getUserById(userId: string): Promise<ResponseUser> {
    const user = await this._userRepository.findById(userId);
    if (!user) throw new NotFoundError("User not found");
    return this.toResponseUser(user);
  }

  async updateUserProfile(userId: string, profileData: Partial<ResponseUser['profile']>): Promise<ResponseUser> {
    const user = await this._userRepository.findById(userId);
    if (!user) throw new NotFoundError("User not found");

    const updatedUser = await this._userRepository.update(userId, { profile: { ...user.profile, ...profileData } });
    if (!updatedUser) throw new InternalServerError("Failed to update user profile");

    return this.toResponseUser(updatedUser);
  }

  async getUserByEmail(email: string): Promise<ResponseUser | null> {
    const user = await this._userRepository.findByEmail(email);
    if (!user) throw new NotFoundError("User not found");
    return this.toResponseUser(user);
  }

  async isPremiumUser(userId: string): Promise<boolean> {
    const user = await this._userRepository.findById(userId);
    if (!user) throw new NotFoundError("User not found");
    return user.isPremium
  }
}