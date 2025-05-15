import { Model } from "mongoose";
import { IRecording } from "../models/RecordingModel";
import { IRecordingRepository } from "../interfaces/repositories/IRecordingRepository";

export class RecordingRepository implements IRecordingRepository {
  constructor(private _recordingModel: Model<IRecording>) {}

  async create(recording: Partial<IRecording>): Promise<IRecording> {
    return this._recordingModel.create(recording);
  }

  async findByUserId(userId: string): Promise<IRecording[]> {
    return this._recordingModel.find({ userId }).sort({ createdAt: -1 });
  }
}