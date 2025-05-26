import { Model } from "mongoose";
import { IMeeting } from "../models/MeetingModel";
import { BaseRepository } from "./baseRepository";
import { IMeetingRepository } from "../interfaces/repositories/IMeetingRepository";

export class MeetingRepository extends BaseRepository<IMeeting> implements IMeetingRepository {
  constructor(private _meetingModel: Model<IMeeting>) {
    super(_meetingModel);
  }

  async findByRoomId(roomId: string): Promise<IMeeting[]> {
    return await this._meetingModel.find({ roomId }).populate("hostId").populate("participants.userId");
  }

  async findByUserId(userId: string): Promise<IMeeting[]> {
    return await this._meetingModel
      .find({
        $or: [
          { hostId: userId },
          { "participants.userId": userId },
        ],
      })
      .populate("hostId")
      .populate("participants.userId")
      .sort({ createdAt: -1 });
  }

  async findOngoingByRoomId(roomId: string): Promise<IMeeting | null> {
    return await this._meetingModel.findOne({ roomId, status: "ongoing" }).populate("hostId").populate("participants.userId");
  }
}