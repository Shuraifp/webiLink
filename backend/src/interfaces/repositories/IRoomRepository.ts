import { Types } from "mongoose";
import { IRoom } from "../../models/mainRoomModel"; 
import { IBaseRepository } from "./IBaseRepository";

export interface IRoomRepository extends IBaseRepository<IRoom> {
  findByUserId(userId:string): Promise<IRoom[]>;
  findBySlug(slug: string): Promise<IRoom | null>;
}