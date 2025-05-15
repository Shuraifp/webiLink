import AWS from "aws-sdk";
import { IRecordingRepository } from "../interfaces/repositories/IRecordingRepository";
import { IRecordingService } from "../interfaces/services/IRecordingService";
import { ResponseRecording } from "../types/responses";

export class RecordingService implements IRecordingService {
  private s3: AWS.S3;

  constructor(private _recordingRepository: IRecordingRepository) {
    AWS.config.update({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: "ap-south-1",
    });
    this.s3 = new AWS.S3({ apiVersion: "2006-03-01" });
  }

  async uploadRecording(
    file: Express.Multer.File,
    roomId: string,
    userId: string,
    username: string,
    recordingDate: string
  ): Promise<string> {
    const recordingId = file.originalname.split(".")[0];
    const key = `recordings/${roomId}/${userId}/${recordingId}.webm`;

    const params: AWS.S3.PutObjectRequest = {
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: key,
      Body: file.buffer,
      ContentType: "video/webm",
      Metadata: {
        roomId,
        userId,
        username,
        recordingDate,
      },
    };

    await this.s3.upload(params).promise();

    await this._recordingRepository.create({
      recordingId,
      userId,
      roomId,
      s3Key: key,
      createdAt: new Date(recordingDate),
    });

    return this.s3.getSignedUrl("getObject", {
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: key,
      Expires: 3600,
    });
  }

  async getUserRecordings(userId: string): Promise<ResponseRecording[]> {
    const recordings = await this._recordingRepository.findByUserId(userId);
    return recordings.map((recording) => ({
      recordingId: recording.recordingId,
      roomId: recording.roomId,
      createdAt: recording.createdAt,
      url: this.s3.getSignedUrl("getObject", {
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: recording.s3Key,
        Expires: 3600,
      }),
    }));
  }
}