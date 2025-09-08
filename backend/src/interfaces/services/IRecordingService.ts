import { ResponseRecording } from "../../types/responses";
import { DashboardRecordingStats } from "../../types/type";

export interface IRecordingService {
  uploadRecording(
    file: Express.Multer.File,
    roomId: string,
    userId: string,
    username: string,
    recordingDate: string
  ): Promise<string>;
  getUserRecordings(userId: string): Promise<ResponseRecording[]>;
  getDashboardStats(): Promise<DashboardRecordingStats>;
}