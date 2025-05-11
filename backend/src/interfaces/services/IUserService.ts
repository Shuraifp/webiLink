import { ResponseUser } from "../../types/type";

export interface IUserService {
  getUserById(userId: string): Promise<ResponseUser>;
  updateUserProfile(userId: string, profileData: Partial<ResponseUser['profile']>): Promise<ResponseUser>;
  getUserByEmail(email: string): Promise<ResponseUser | null>;
}