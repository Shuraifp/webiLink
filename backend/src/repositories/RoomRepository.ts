import { IRoomRepository } from "../interfaces/repositories/IRoomRepository";
import { IRoom } from "../types/models";
import { BaseRepository } from "./baseRepository";
import { Model } from "mongoose";

export class RoomRepository
  extends BaseRepository<IRoom>
  implements IRoomRepository
{
  constructor(private _roomModel: Model<IRoom>) {
    super(_roomModel);
  }

  async findAllByUserId(userId: string): Promise<IRoom[]> {
    return await this._roomModel.find({ userId }).sort({ createdAt: -1 });
  }

  async findBySlug(slug: string): Promise<IRoom | null> {
    return await this._roomModel.findOne({ slug });
  }

  async archiveRoom(slug: string): Promise<IRoom | null> {
    return await this._roomModel
      .findOneAndUpdate(
        { slug, isActive: true },
        { isActive: false },
        { new: true }
      )
      .lean();
  }

  async archiveExcessRooms(userId: string, keepRoomId?: string): Promise<void> {
    const rooms = await this._roomModel
      .find({ userId, isActive: true })
      .sort({ createdAt: -1 });
    if (rooms.length <= 1) return;

    const roomsToArchive = keepRoomId
      ? rooms.filter((room) => room._id!.toString() !== keepRoomId)
      : rooms.slice(1);

    await this._roomModel.updateMany(
      { _id: { $in: roomsToArchive.map((room: IRoom) => room._id) } },
      { isActive: false }
    );
  }

  async restoreArchivedRooms(userId: string): Promise<void> {
    await this._roomModel.updateMany(
      { userId, isActive: false },
      { isActive: true }
    );
  }

  async delete(id: string): Promise<IRoom | null> {
    return await this._roomModel.findByIdAndDelete(id);
  }
}
