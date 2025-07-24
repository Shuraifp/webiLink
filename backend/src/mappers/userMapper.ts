import { IUser } from "../models/userModel";
import { UserDTO } from "../dto/userDTO";
import { UserRole } from "../types/type";

export class UserMapper {
  static toUserDTO(user: IUser): UserDTO {
    return {
      _id: user._id.toString(),
      username: user.username,
      email: user.email,
      role: user.role || UserRole.USER,
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
      isBlocked: user.isBlocked,
      isArchived: user.isArchived,
      isPremium: user.isPremium,
      planId: user.planId ? user.planId.toString() : null,
      createdAt: user.createdAt?.toISOString(),
      updatedAt: user.updatedAt?.toISOString(),
    };
  }

  static toUserDTOList(users: IUser[]): UserDTO[] {
    return users.map(user => this.toUserDTO(user));
  }
}