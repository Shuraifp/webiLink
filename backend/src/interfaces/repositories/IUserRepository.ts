import { IUser,UserInput } from "../../models/userModel";
import { Types } from "mongoose";
import { IBaseRepository } from "./IBaseRepository";

export interface IUserRepository extends IBaseRepository<IUser> {
  findByEmail(email: string): Promise<IUser | null>;
  saveResetToken(userId:Types.ObjectId,hashedToken:string,expiresAt:Date): Promise<void>;
  findByResetToken(token:string):Promise<IUser | null>;
  blockUser(userId:string): Promise<boolean>;
  unblockUser(userId:string): Promise<boolean>;
}