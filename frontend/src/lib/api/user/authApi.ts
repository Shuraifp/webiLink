import { apiWithoutAuth, userApiWithAuth } from "../axios";
import { AuthGoogleInput } from "@/types/type";

export const login = async (email: string, password: string) => {
  try {
    const res = await apiWithoutAuth.post("/auth/login", { email, password });
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const signup = async (
  username: string,
  email: string,
  password: string
) => {
  try {
    const res = await apiWithoutAuth.post("/auth/signup", {
      username,
      email,
      password,
    });
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const googleSignIn = async (data: AuthGoogleInput) => {
  try {
    const res = await apiWithoutAuth.post("/auth/google-signin", { ...data });
    console.log("hii");
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const resendOtp = async (
  username: string,
  email: string,
  password: string
) => {
  try {
    const res = await apiWithoutAuth.post("/auth/signup", {
      username,
      email,
      password,
    });
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const verifyOtp = async (email: string, otp: string) => {
  try {
    const res = await apiWithoutAuth.post("/auth/verifyOtp", { email, otp });
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const logout = async () => {
  try {
    const res = await userApiWithAuth.post("/auth/user-logout");
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const forgotPassword = async (email:string) => {
  try {
    const res = await apiWithoutAuth.post("/auth/forgot-password", { email });
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const resetPassword = async (token: string, newPassword: string) => {
    try {
      const res = await apiWithoutAuth.post("/auth/reset-password", { token, newPassword });
      return res.data;
    } catch (error) {
      throw error;
    }
  };
  
