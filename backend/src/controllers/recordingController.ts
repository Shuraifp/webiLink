import { Request, Response, NextFunction } from "express";
import { IRecordingService } from "../interfaces/services/IRecordingService";
import { HttpStatus, successResponse } from "../types/type";

export class RecordingController {
  constructor(private _recordingService: IRecordingService) {}

  async uploadRecording(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { roomId, userId, username, recordingDate } = req.body;
      const file = req.file;

      if (!file) {
        res.status(HttpStatus.BAD_REQUEST).json({ message: "No recording file provided" });
        return;
      }

      const url = await this._recordingService.uploadRecording(
        file,
        roomId,
        userId,
        username,
        recordingDate
      );

      res.status(HttpStatus.OK).json(successResponse("Recording uploaded successfully", { url }));
    } catch (error) {
      next(error);
    }
  }

  async getUserRecordings(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user?._id as string;
      const recordings = await this._recordingService.getUserRecordings(userId);
      res.status(HttpStatus.OK).json(successResponse("Recordings fetched successfully", recordings));
    } catch (error) {
      next(error);
    }
  }
}