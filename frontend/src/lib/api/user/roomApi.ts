import { userApiWithAuth } from "../axios";

export const createRoom = async (data:{name:string, }) => {
  try {
    const res = await userApiWithAuth.post('/rooms/create',data)
    return res.data
  } catch (err) {
    throw err
  }
}

export const fetchRooms = async () => {
  try {
    const res = await userApiWithAuth.get('/rooms')
    return res.data.data
  } catch (err) {
    throw err
  }
}