import { adminApiWithAuth } from "../axios";

export const fetchUsers = async (page:number,limit:number) => {
  try {
    const res = await adminApiWithAuth.get("/admin/users", {params:{page,limit}});
    return res.data
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

export const fetchDashboardStats = async () => {
  try {
    const res = await adminApiWithAuth.put(`/admin/dashboard`);
    console.log(res)
    return res.data;
  } catch (err) {
    throw err;
  }
};
