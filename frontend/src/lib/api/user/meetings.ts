import { userApiWithAuth } from "../axios";

export const getMeetings = async () => {
  try {
    const res = await userApiWithAuth.get(`/meetings`);
    return res.data;
  } catch (err) {
    throw err;
  }
};