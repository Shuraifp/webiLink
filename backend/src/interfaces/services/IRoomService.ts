import { Types } from "mongoose";
import { IRoom } from "../../models/mainRoomModel"; 

export interface IRoomService {
  getAllRooms(userId: string): Promise<IRoom[]>;
  createRoom(userId: Types.ObjectId, name: string, isPremiumUser?: boolean): Promise<IRoom>;
  generateId(): Promise<string>;
  // findBySlug(slug: string): Promise<IRoom | null>;
}