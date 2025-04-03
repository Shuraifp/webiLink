import { apiWithoutAuth } from "../axios";

export const login = async (email: string, password: string) => {
  try {
    const res = await apiWithoutAuth.post("/auth/admin-login", { email, password });
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const logout = async () => {
  try {
    const res = await apiWithoutAuth.post("/auth/admin-logout");
    return res.data;
  } catch (error) {
    throw error;
  }
};