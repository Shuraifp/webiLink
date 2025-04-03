import { apiWithoutAuth } from "../axios";


export const getPlans = async () => {
  try {
    const res = await apiWithoutAuth.get(`/plans`);
    return res.data;
  } catch (err) {
    throw err;
  }
};