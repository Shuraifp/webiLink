import { IUser } from "../../types/models";
import { IBaseRepository } from "./IBaseRepository";

export interface IUserRepository extends IBaseRepository<IUser> {
  findByEmail(id: string): Promise<IUser | null>;
  archive(id: string): Promise<IUser | null>;
  restore(id: string): Promise<IUser | null>;
  saveResetToken(id:string,hashedToken:string,expiresAt:Date): Promise<boolean>;
  findByResetToken(token:string):Promise<IUser | null>;
  blockUser(id:string): Promise<boolean>;
  unblockUser(id:string): Promise<boolean>;
  searchUsers(search: string): Promise<string[]>;
  countDocuments(query: any): Promise<number>;
  listUsers(page: number, limit: number): Promise<{
    data: IUser[];
    totalItems: number;
    totalPages: number;
  }>;
}