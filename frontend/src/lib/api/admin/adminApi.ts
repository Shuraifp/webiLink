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


// Dashboard

export const fetchDashboardStats = async () => {
  try {
    const res = await adminApiWithAuth.get(`/admin/dashboard`);
    console.log(res)
    return res.data;
  } catch (err) {
    throw err;
  }
};

export const fetchRevenueData = async (timeframe: string,customStart: string,customEnd: string) => {
  try {
    const res = await adminApiWithAuth.get("/admin/revenue", { params: { timeframe, customStart, customEnd } });
    return res.data; // Expect: { monthly: [{ month: string, revenue: number }], transmount: number, date: string }] }
  } catch (err) {
    throw err;
  }
};

export const fetchTrendingUsers = async () => {
  try {
    const res = await adminApiWithAuth.get("/admin/users/trending");
    return res.data; // Expect: [{ username: string, joinDate: string, activityCount: number }]
  } catch (err) {
    throw err;
  }
};

