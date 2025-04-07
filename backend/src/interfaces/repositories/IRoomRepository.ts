import { Types } from "mongoose";
import { IRoom } from "../../models/mainRoomModel"; 

export interface IRoomRepository {
  findAll(userId:string): Promise<IRoom[]>;
  create(roomData: Partial<IRoom>): Promise<IRoom>;
  findBySlug(slug: string): Promise<IRoom | null>;
}