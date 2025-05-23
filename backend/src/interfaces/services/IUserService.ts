import { DashboardStatsDTO } from "../../dto/userDTO";
import { ResponseUser } from "../../types/responses";

export interface IUserService {
  getUserById(userId: string): Promise<ResponseUser>;
  updateUserProfile(userId: string, profileData: Partial<ResponseUser['profile']>): Promise<ResponseUser>;
  getUserByEmail(email: string): Promise<ResponseUser | null>;
  isPremiumUser(userId: string): Promise<boolean>;
  getDashboardStats(userId: string): Promise<DashboardStatsDTO>;
}