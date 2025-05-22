import { adminApiWithAuth } from "../axios";

export const fetchDashboardStats = async () => {
  try {
    const res = await adminApiWithAuth.get(`/recordings/stats`);
    console.log(res)
    return res.data;
  } catch (err) {
    throw err;
  }
};
