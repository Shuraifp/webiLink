import { apiWithoutAuth } from "../axios";


export const getPlans = async () => {
  try {
    const res = await apiWithoutAuth.get(`/user/plans`);
    return res.data;
  } catch (err) {
    throw err;
  }
};