import { injectable, inject } from "inversify";
import UserModel, { IUser, UserInput } from "../models/userModel";
import { IUserRepository } from "../interfaces/IUserRepository";
import { Document, Types } from "mongoose";
import TYPES from "../di/types";

@injectable()
export class UserRepository implements IUserRepository {
  // constructor(
  //   @inject(TYPES.IUser) private _userModel:IUser
  // ) {}

  async createUser(user: UserInput): Promise<IUser & Document> {
    try {
      return await UserModel.create(user);
    } catch (error) {
      console.error("Error creating user:", error);
      throw new Error("Database error while creating user");
    }
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return UserModel.findOne({ email });
  }

  async findById(userId: Types.ObjectId): Promise<IUser | null> {
    return UserModel.findOne({ _id: userId });
  }

  async updateUser(
    userId: Types.ObjectId,
    updateData: Partial<IUser>
  ): Promise<IUser | null> {
    const updatedUser = await UserModel.findByIdAndUpdate(userId, updateData, {
      new: true,
    });
    if (!updatedUser) {
      throw new Error("User not found");
    }
    return updatedUser;
  }
}
