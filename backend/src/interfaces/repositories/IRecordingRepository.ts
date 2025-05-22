import { IRecording } from "../../models/RecordingModel";

export interface IRecordingRepository {
  create(recording: Partial<IRecording>): Promise<IRecording>;
  findByUserId(userId: string): Promise<IRecording[]>;
  findAll(): Promise<IRecording[]>;
  getAllStats(): Promise<{
    totalRecordings: number;
    userStats: { _id: string; count: number }[];
  }>;
}