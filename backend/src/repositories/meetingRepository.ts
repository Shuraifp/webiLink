import { Model } from "mongoose";
import { BaseRepository } from "./baseRepository";
import { IMeetingRepository } from "../interfaces/repositories/IMeetingRepository";
import { IMeeting } from "../types/models";

export class MeetingRepository
  extends BaseRepository<IMeeting>
  implements IMeetingRepository
{
  constructor(private _meetingModel: Model<IMeeting>) {
    super(_meetingModel);
  }

  async findByRoomId(roomId: string): Promise<IMeeting[]> {
    return await this._meetingModel
      .find({ roomId })
      .populate("hostId")
      .populate("participants.userId");
  }

  async findByUserId(userId: string): Promise<IMeeting[]> {
    return await this._meetingModel
      .find({
        $or: [{ hostId: userId }, { "participants.userId": userId }],
      })
      .populate("hostId")
      .populate("participants.userId")
      .sort({ createdAt: -1 });
  }

  async listByUserId(
    userId: string,
    page: number,
    limit: number
  ): Promise<{ meetings: IMeeting[]; totalPages: number }> {
    if (page < 1 || limit < 1) {
      throw new Error("Page and limit must be positive numbers");
    }
    const skip = (page - 1) * limit;
    const [data, totalItems] = await Promise.all([
      this._meetingModel
        .find({
          $or: [{ hostId: userId }, { "participants.userId": userId }],
        })
        .skip(skip)
        .limit(limit)
        .populate("hostId")
        .populate("participants.userId")
        .sort({ createdAt: -1 }),
      this._meetingModel.countDocuments({}),
    ]);
    return {
      meetings: data,
      totalPages: Math.ceil(totalItems / limit),
    };
  }

  async findOngoingByRoomId(roomId: string): Promise<IMeeting | null> {
    return await this._meetingModel
      .findOne({ roomId, status: "ongoing" })
      .populate("hostId")
      .populate("participants.userId");
  }

  async getUniqueParticipantsCountAndDuration(): Promise<{
    totalMeetings: number;
    totalParticipants: number;
    totalDuration: number;
  }> {
    const result = await this._meetingModel
      .aggregate([
        {
          $project: {
            participants: 1,
            duration: {
              $cond: {
                if: { $gt: ["$duration", null] },
                then: "$duration",
                else: {
                  $divide: [{ $subtract: ["$endTime", "$startTime"] }, 60000],
                },
              },
            },
          },
        },
        { $unwind: "$participants" },
        {
          $group: {
            _id: null,
            totalMeetings: { $sum: 1 },
            totalParticipants: { $addToSet: "$participants.userId" },
            totalDuration: { $sum: "$duration" },
          },
        },
        {
          $project: {
            _id: 0,
            totalMeetings: "$totalMeetings",
            totalParticipants: { $size: "$totalParticipants" },
            totalDuration: "$totalDuration",
          },
        },
      ])
      .exec();
    
    return result.length > 0
      ? {
          totalMeetings: result[0].totalMeetings || 0,
          totalParticipants: result[0].totalParticipants || 0,
          totalDuration: Math.round(result[0].totalDuration || 0),
        }
      : { totalMeetings: 0, totalParticipants: 0, totalDuration: 0 };
  }
}
