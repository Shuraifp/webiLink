import { userApiWithAuth } from "../axios";

export const getStats = async () => {
  try {
    const res = await userApiWithAuth.get(`/users/dashboard-stats`);
    console.log(res.data);
    return res.data;
  } catch (err) {
    throw err;
  }
};