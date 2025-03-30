import { IUser,UserInput } from "../models/userModel";
import { Types } from "mongoose";

export interface IUserRepository {
  createUser(user: UserInput): Promise<IUser>;
  findByEmail(email: string): Promise<IUser | null>;
  updateUser(userId:Types.ObjectId,updateData: Partial<IUser>): Promise<IUser | null>
  findById(userId:Types.ObjectId): Promise<IUser | null>
  saveResetToken(userId:Types.ObjectId,hashedToken:string,expiresAt:Date): Promise<void>;
  findByResetToken(token:string):Promise<IUser | null>;
}