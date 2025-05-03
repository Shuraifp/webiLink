// import { injectable, inject } from "inversify";
import { IUser } from "../models/userModel";
import { IUserRepository } from "../interfaces/repositories/IUserRepository";
import { Model, Types } from "mongoose";
import { BaseRepository } from "./baseRepository";

// @injectable()
export class UserRepository extends BaseRepository<IUser> implements IUserRepository {
  constructor(private _userModel: Model<IUser>) {
    super(_userModel)
  }


  async findByEmail(email: string): Promise<IUser | null> {
    return this._userModel.findOne({ email });
  }

  async saveResetToken(
    userId: Types.ObjectId,
    token: string,
    expiresAt: Date
  ): Promise<void> {
    await this._userModel.findByIdAndUpdate(userId, {
      resetPasswordToken: token,
      resetPasswordExpiry: expiresAt,
    });
  }

  async findByResetToken(token: string): Promise<IUser | null> {
    return await this._userModel.findOne({ resetPasswordToken: token });
  }

  async blockUser(userId: string): Promise<boolean> {
    const updatedUser = await this._userModel
      .findByIdAndUpdate(userId, { isBlocked: true }, { new: true })
    return updatedUser !== null;
  }

  async unblockUser(userId: string): Promise<boolean> {
    const updatedUser = await this._userModel
      .findByIdAndUpdate(userId, { isBlocked: false }, { new: true })
    return updatedUser !== null;
  }
}
