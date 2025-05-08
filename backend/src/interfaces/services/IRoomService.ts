import { Types } from "mongoose";
import { IRoom } from "../../models/mainRoomModel"; 

export interface IRoomService {
  getAllRooms(userId: string): Promise<IRoom[]>;
  createRoom(userId: string, name: string, isPremiumUser?: boolean): Promise<IRoom>;
  generateId(): Promise<string>;
  getRoom(roomId: string): Promise<IRoom>;
}