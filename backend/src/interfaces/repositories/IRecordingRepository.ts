import { IRecording } from "../../models/RecordingModel";

export interface IRecordingRepository {
  create(recording: Partial<IRecording>): Promise<IRecording>;
  findByUserId(userId: string): Promise<IRecording[]>;
}