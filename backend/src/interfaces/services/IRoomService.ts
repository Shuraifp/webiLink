import { IRoom } from "../../models/RoomModel"; 

export interface IRoomService {
  getAllRooms(userId: string): Promise<IRoom[]>;
  createRoom(userId: string, name: string, isPremiumUser?: boolean): Promise<IRoom>;
  generateId(): Promise<string>;
  getRoom(roomId: string): Promise<IRoom>;
  deleteRoom(userId: string, roomId: string): Promise<void>;
}