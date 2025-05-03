import { IRoomRepository } from "../interfaces/repositories/IRoomRepository";
import { IRoom } from "../models/mainRoomModel";
import { BaseRepository } from "./baseRepository";
import { Model } from "mongoose";

export class RoomRepository extends BaseRepository<IRoom> implements IRoomRepository {
  constructor(
    private _roomModal: Model<IRoom>
  ) {
    super(_roomModal)
  }

  async findByUserId(userId:string): Promise<IRoom[]> {
    return await this._roomModal.find({ userId });
  }  

  async findBySlug(slug: string): Promise<IRoom | null> {
    return await this._roomModal.findOne({ slug });
  }
}