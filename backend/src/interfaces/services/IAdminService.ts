import { IUser } from "../../models/userModel";
import { IPlan, PlanInput } from "../../models/PlanModel";

export interface IAdminService {
  listUsers(): Promise<IUser[]>;
  blockUser(userId: string): Promise<IUser>;
  unblockUser(userId: string): Promise<IUser>;
  softDeleteUser(userId: string): Promise<IUser>;
  restoreUser(userId: string): Promise<IUser>;
}
