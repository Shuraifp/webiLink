import { userApiWithAuth } from "../axios";

export const createRoom = async (data:{name:string, }) => {
  try {
    const res = await userApiWithAuth.post('/rooms/create',data)
    return res.data
  } catch (err) {
    throw err
  }
}