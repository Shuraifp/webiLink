import { userApiWithAuth } from "../axios";

export const getMeetings = async (page:number,limit:number) => {
  try {
    const res = await userApiWithAuth.get(`/meetings`, {params:{page,limit}});
    return res.data;
  } catch (err) {
    throw err;
  }
};