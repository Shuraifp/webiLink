import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Upload } from "@aws-sdk/lib-storage";
import {
  GetObjectCommand,
  PutObjectCommandInput,
  S3Client,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { IRecordingRepository } from "../interfaces/repositories/IRecordingRepository";
import { IRecordingService } from "../interfaces/services/IRecordingService";
import { ResponseRecording } from "../types/responses";
import logger from "../utils/logger";
import { INotificationService } from "../interfaces/services/INotificationService";

export interface DashboardRecordingStats {
  totalRecordings: number;
  totalStorageUsed: number;
  recordingsPerUser: Array<{
    userId: string;
    username: string;
    count: number;
  }>;
}

export class RecordingService implements IRecordingService {
  private s3: S3Client;

  constructor(
    private _recordingRepository: IRecordingRepository,
    private _notificationService: INotificationService
  ) {
    this.s3 = new S3Client({
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
      region: "ap-south-1",
    });
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

    const params: PutObjectCommandInput = {
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

    await new Upload({
      client: this.s3,
      params,
    }).done();

    const recording = await this._recordingRepository.create({
      recordingId,
      userId,
      roomId,
      s3Key: key,
      createdAt: new Date(recordingDate),
    });

    await this._notificationService.createNotification(
      userId,
      "recording_upload",
      `Your recording for room ${roomId} has been uploaded to the cloud`,
      { recordingId: recording._id!.toString() }
    );

    return await getSignedUrl(
      this.s3,
      new GetObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: key,
      }),
      {
        expiresIn: 3600,
      }
    );
  }

  async getUserRecordings(userId: string): Promise<ResponseRecording[]> {
    const recordings = await this._recordingRepository.findByUserId(userId);
    return await Promise.all(
      recordings.map(async (recording) => ({
        recordingId: recording.recordingId,
        roomId: recording.roomId,
        createdAt: recording.createdAt,
        url: await getSignedUrl(
          this.s3,
          new GetObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET!,
            Key: recording.s3Key,
          }),
          {
            expiresIn: 3600,
          }
        ),
      }))
    );
  }

  async getDashboardStats(): Promise<DashboardRecordingStats> {
    try {
      const allRecordings = await this._recordingRepository.findAll();

      let totalStorageUsed = 0;
      const userRecordingCount = new Map<
        string,
        { username: string; count: number }
      >();

      for (const recording of allRecordings) {
        try {
          const size = await this.getS3ObjectSize(recording.s3Key);
          totalStorageUsed += size;

          const userKey = recording.userId;
          if (userRecordingCount.has(userKey)) {
            userRecordingCount.get(userKey)!.count += 1;
          } else {
            const username =
              (await this.getUsernameFromS3Metadata(recording.s3Key)) ||
              "Unknown User";
            userRecordingCount.set(userKey, { username, count: 1 });
          }
        } catch (error) {
          logger.warn(
            `Failed to process recording ${recording.recordingId}:`,
            error
          );
        }
      }

      const recordingsPerUser = Array.from(userRecordingCount.entries())
        .map(([userId, data]) => ({
          userId,
          username: data.username,
          count: data.count,
        }))
        .sort((a, b) => b.count - a.count);

      return {
        totalRecordings: allRecordings.length,
        totalStorageUsed,
        recordingsPerUser,
      };
    } catch (error) {
      logger.error("Error getting dashboard stats:", error);
      throw new Error("Failed to retrieve dashboard statistics");
    }
  }

  private async getS3ObjectSize(s3Key: string): Promise<number> {
    try {
      const command = new HeadObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: s3Key,
      });

      const headObject = await this.s3.send(command);
      return headObject.ContentLength || 0;
    } catch (error) {
      logger.warn(`Failed to get S3 object size for ${s3Key}:`, error);
      return 0;
    }
  }

  private async getUsernameFromS3Metadata(
    s3Key: string
  ): Promise<string | null> {
    try {
      const command = new HeadObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: s3Key,
      });

      const response = await this.s3.send(command);
      return response.Metadata?.username || null;
    } catch (error) {
      logger.warn(`Failed to get S3 metadata for ${s3Key}:`, error);
      return null;
    }
  }
}
