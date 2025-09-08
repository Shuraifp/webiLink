import { IUserRepository } from "../interfaces/repositories/IUserRepository";
import { Model } from "mongoose";
import { BaseRepository } from "./baseRepository";
import { IUser } from "../types/models";

export class UserRepository
  extends BaseRepository<IUser>
  implements IUserRepository
{
  constructor(private _userModel: Model<IUser>) {
    super(_userModel);
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return this._userModel.findOne({ email });
  }

  async archive(id: string): Promise<IUser | null> {
    return await this._userModel.findByIdAndUpdate(
      id,
      { isArchived: true },
      { new: true }
    );
  }

  async restore(id: string): Promise<IUser | null> {
    return await this._userModel.findByIdAndUpdate(
      id,
      { isArchived: false },
      { new: true }
    );
  }

  async saveResetToken(
    userId: string,
    token: string,
    expiresAt: Date
  ): Promise<boolean> {
    const updatedUser = await this._userModel.findByIdAndUpdate(
      userId,
      {
        resetPasswordToken: token,
        resetPasswordExpiry: expiresAt,
      },
      { new: true }
    );

    return !!updatedUser;
  }

  async findByResetToken(token: string): Promise<IUser | null> {
    return await this._userModel.findOne({ resetPasswordToken: token });
  }

  async blockUser(userId: string): Promise<boolean> {
    const updatedUser = await this._userModel.findByIdAndUpdate(
      userId,
      { isBlocked: true },
      { new: true }
    );
    return updatedUser !== null;
  }

  async unblockUser(userId: string): Promise<boolean> {
    const updatedUser = await this._userModel.findByIdAndUpdate(
      userId,
      { isBlocked: false },
      { new: true }
    );
    return updatedUser !== null;
  }

  async searchUsers(search: string): Promise<string[]> {
    const users = await this._userModel
      .find({
        $or: [
          { username: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      })
      .select("_id");
    return users.map((user) => user._id.toString());
  }

  async countDocuments(query: any): Promise<number> {
    return await this._userModel.countDocuments(query);
  }

  async listUsers(page: number = 1, limit: number = 10): Promise<{
    data: IUser[];
    totalItems: number;
    totalPages: number;
  }> {
    try {
      if (page < 1 || limit < 1) {
        throw new Error("Page and limit must be positive numbers");
      }

      const skip = (page - 1) * limit;
      const [data, totalItems] = await Promise.all([
        this._userModel
          .find({})
          .skip(skip)
          .limit(limit)
          .lean()
          .exec(),
        this._userModel.countDocuments({}),
      ]);

      return {
        data,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
      };
    } catch (error) {
      throw new Error(`Failed to fetch users: ${(error as Error).message}`);
    }
  }
}
