import { ResponseRecording } from "../../types/responses";

export interface IRecordingService {
  uploadRecording(
    file: Express.Multer.File,
    roomId: string,
    userId: string,
    username: string,
    recordingDate: string
  ): Promise<string>;
  getUserRecordings(userId: string): Promise<ResponseRecording[]>;
}