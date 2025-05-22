import { userApiWithAuth } from "../axios";

export const getRecordings = async () => {
  try {
    const res = await userApiWithAuth.get(`/recordings`);
    return res.data;
  } catch (err) {
    throw err;
  }
};
