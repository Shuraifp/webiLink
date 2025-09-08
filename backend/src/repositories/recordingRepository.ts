import { Model } from "mongoose";
import { IRecordingRepository } from "../interfaces/repositories/IRecordingRepository";
import logger from "../utils/logger";
import { IRecording } from "../types/models";

export class RecordingRepository implements IRecordingRepository {
  constructor(private _recordingModel: Model<IRecording>) {}

  async create(recording: Partial<IRecording>): Promise<IRecording> {
    return this._recordingModel.create(recording);
  }

  async findByUserId(userId: string): Promise<IRecording[]> {
    return this._recordingModel.find({ userId }).sort({ createdAt: -1 });
  }

  async findAll(): Promise<IRecording[]> {
    return this._recordingModel.find({}).sort({ createdAt: -1 });
  }

  async getAllStats(): Promise<{
    totalRecordings: number;
    userStats: { _id: string; count: number }[];
  }> {
    try {
      const totalRecordings = await this._recordingModel.countDocuments();

      const userStats = await this._recordingModel.aggregate([
        {
          $group: {
            _id: "$userId",
            count: { $sum: 1 },
          },
        },
        {
          $sort: { count: -1 },
        },
      ]);

      return {
        totalRecordings,
        userStats,
      };
    } catch (error) {
      logger.error("Error fetching recording statistics:", error);
      throw new Error("Failed to retrieve recording statistics from database");
    }
  }
}
