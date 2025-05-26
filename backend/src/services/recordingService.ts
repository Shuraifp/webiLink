import AWS from "aws-sdk";
import { IRecordingRepository } from "../interfaces/repositories/IRecordingRepository";
import { IRecordingService } from "../interfaces/services/IRecordingService";
import { ResponseRecording } from "../types/responses";
import logger from "../utils/logger";


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

  async getDashboardStats(): Promise<DashboardRecordingStats> {
    try {
      const allRecordings = await this._recordingRepository.findAll();
      
      let totalStorageUsed = 0;
      const userRecordingCount = new Map<string, { username: string; count: number }>();

      for (const recording of allRecordings) {
        try {
          const size = await this.getS3ObjectSize(recording.s3Key);
          totalStorageUsed += size;
          
          const userKey = recording.userId;
          if (userRecordingCount.has(userKey)) {
            userRecordingCount.get(userKey)!.count += 1;
          } else {
            const username = await this.getUsernameFromS3Metadata(recording.s3Key) || 'Unknown User';
            userRecordingCount.set(userKey, { username, count: 1 });
          }
        } catch (error) {
          logger.warn(`Failed to process recording ${recording.recordingId}:`, error);
        }
      }

      const recordingsPerUser = Array.from(userRecordingCount.entries())
        .map(([userId, data]) => ({
          userId,
          username: data.username,
          count: data.count
        }))
        .sort((a, b) => b.count - a.count);

      return {
        totalRecordings: allRecordings.length,
        totalStorageUsed,
        recordingsPerUser
      };

    } catch (error) {
      logger.error('Error getting dashboard stats:', error);
      throw new Error('Failed to retrieve dashboard statistics');
    }
  }

  private async getS3ObjectSize(s3Key: string): Promise<number> {
    try {
      const params = {
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: s3Key
      };
      
      const headObject = await this.s3.headObject(params).promise();
      return headObject.ContentLength || 0;
    } catch (error) {
      logger.warn(`Failed to get S3 object size for ${s3Key}:`, error);
      return 0;
    }
  }

  private async getUsernameFromS3Metadata(s3Key: string): Promise<string | null> {
    try {
      const params = {
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: s3Key
      };
      
      const headObject = await this.s3.headObject(params).promise();
      return headObject.Metadata?.username || null;
    } catch (error) {
      logger.warn(`Failed to get S3 metadata for ${s3Key}:`, error);
      return null;
    }
  }
}