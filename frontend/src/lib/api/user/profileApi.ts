import { userApiWithAuth } from "../axios";
import { UserProfile } from "../../../types/type";

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

export const getUser = async (): Promise<ApiResponse<UserProfile>> => {
  try {
    const response = await userApiWithAuth.get("/users/me");
    return response.data;
  } catch (err) {
    throw err;
  }
};

export const updateProfile = async (
  profileData: Partial<UserProfile["profile"]>
): Promise<ApiResponse<UserProfile>> => {
  try {
    const response = await userApiWithAuth.patch("/users/profile", profileData);
    return response.data;
  } catch (err) {
    throw err;
  }
};

export const getUserByEmail = async (
  email: string
): Promise<ApiResponse<UserProfile | null>> => {
  try {
    const response = await userApiWithAuth.get("/users", {
      params: { email },
    });
    return response.data;
  } catch (err) {
    throw err;
  }
};

export const changePassword = async (data: {
  currentPassword: string;
  newPassword: string;
}): Promise<ApiResponse<UserProfile | null>> => {
  try {
    console.log(data)
    const response = await userApiWithAuth.patch("/users/change-password", {
      ...data,
    });
    return response.data;
  } catch (err) {
    throw err;
  }
};
