import { IRoomRepository } from "../interfaces/repositories/IRoomRepository";
import Room, { IRoom } from "../models/mainRoomModel";

export class RoomRepository implements IRoomRepository {
  constructor(
    private _roomModal: typeof Room
  ) {}

  async create(roomData: Partial<IRoom>): Promise<IRoom> {
    const room = new this._roomModal(roomData);
    return await room.save();
  }

  async findBySlug(slug: string): Promise<IRoom | null> {
    return await Room.findOne({ slug });
  }
}