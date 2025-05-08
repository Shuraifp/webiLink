import { adminApiWithAuth } from "../axios";
import { UserStatus } from "@/types/type";

export const fetchUsers = async () => {
  try {
    const res = await adminApiWithAuth.get("/admin/users");
    return res.data.data.map(
      (user: {
        _id: string;
        username: string;
        email: string;
        isBlocked: boolean;
        isArchived: boolean;
      }) => ({
        ...user,
        status: user.isBlocked
          ? UserStatus.Blocked
          : user.isArchived
          ? UserStatus.Archived
          : UserStatus.Active,
      })
    );
  } catch (err) {
    throw err;
  }
};

export const blockUser = async (id: string) => {
  try {
    const res = await adminApiWithAuth.put(`/admin/users/${id}/block`);
    return res.data;
  } catch (err) {
    throw err;
  }
};

export const unblockUser = async (id: string) => {
  try {
    const res = await adminApiWithAuth.put(`/admin/users/${id}/unblock`);
    return res.data;
  } catch (err) {
    throw err;
  }
};

export const softDeleteUser = async (id: string) => {
  try {
    const res = await adminApiWithAuth.put(`/admin/users/${id}/archive`);
    return res.data;
  } catch (err) {
    throw err;
  }
};

export const restoreUser = async (id: string) => {
  try {
    const res = await adminApiWithAuth.put(`/admin/users/${id}/restore`);
    return res.data;
  } catch (err) {
    throw err;
  }
};
