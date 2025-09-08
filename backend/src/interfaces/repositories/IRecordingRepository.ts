import { IRecording } from "../../types/models";


export interface IRecordingRepository {
  create(recording: Partial<IRecording>): Promise<IRecording>;
  findByUserId(userId: string): Promise<IRecording[]>;
  findAll(): Promise<IRecording[]>;
  getAllStats(): Promise<{
    totalRecordings: number;
    userStats: { _id: string; count: number }[];
  }>;
}