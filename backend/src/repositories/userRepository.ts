import { IUser } from "../models/userModel";
import { IUserRepository } from "../interfaces/repositories/IUserRepository";
import { Model } from "mongoose";
import { BaseRepository } from "./baseRepository";


export class UserRepository extends BaseRepository<IUser> implements IUserRepository {
  constructor(private _userModel: Model<IUser>) {
    super(_userModel)
  }


  async findByEmail(email: string): Promise<IUser | null> {
    return this._userModel.findOne({ email });
  }

  async archive(id: string): Promise<IUser | null> {
      return await this._userModel.findByIdAndUpdate(id, { isArchived: true }, { new: true });
    }
  
    async restore(id: string): Promise<IUser | null> {
      return await this._userModel.findByIdAndUpdate(id, { isArchived: false }, { new: true });
    }

  async saveResetToken(
    userId: string,
    token: string,
    expiresAt: Date
  ): Promise<boolean> {
    const updatedUser = await this._userModel.findByIdAndUpdate(userId, {
      resetPasswordToken: token,
      resetPasswordExpiry: expiresAt,
    }, {new:true});

    return !!updatedUser
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
