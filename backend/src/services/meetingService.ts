import { Types } from "mongoose";
import { IMeeting } from "../models/MeetingModel";
import { IMeetingRepository } from "../interfaces/repositories/IMeetingRepository";
import { IRoomRepository } from "../interfaces/repositories/IRoomRepository";
import { IUserRepository } from "../interfaces/repositories/IUserRepository";
import { IMeetingService } from "../interfaces/services/IMeetingService";
import { BadRequestError, NotFoundError, InternalServerError } from "../utils/errors";
import { Role } from "../types/chatRoom";
import { MeetingHistoryDTO } from "../dto/meetingDTO";
import { MeetingMapper } from "../mappers/meetingMapper";

export class MeetingService implements IMeetingService {
  constructor(
    private _meetingRepository: IMeetingRepository,
    private _roomRepository: IRoomRepository,
    private _userRepository: IUserRepository
  ) {}

  async createMeeting(
    roomId: string,
    hostId: string,
    roomName: string,
    slug: string,
    userData: { userId: string; username: string; avatar?: string }
  ): Promise<IMeeting> {
    try {
      if (!Types.ObjectId.isValid(roomId) || !Types.ObjectId.isValid(hostId)) {
        throw new BadRequestError("Invalid room or host ID");
      }

      const room = await this._roomRepository.findById(roomId);
      if (!room) {
        throw new NotFoundError("Room not found");
      }

      const user = await this._userRepository.findById(hostId);
      if (!user) {
        throw new NotFoundError("User not found");
      }

      const meetingData: Partial<IMeeting> = {
        roomId: new Types.ObjectId(roomId),
        hostId: new Types.ObjectId(hostId),
        roomName,
        slug,
        startTime: new Date(),
        status: "ongoing",
        participants: [
          {
            userId: new Types.ObjectId(hostId),
            username: userData.username,
            avatar: userData.avatar,
            role: Role.HOST,
            joinTime: new Date(),
          },
        ],
      };

      const meeting = await this._meetingRepository.create(meetingData);
      if (!meeting) {
        throw new InternalServerError("Failed to create meeting");
      }

      return meeting;
    } catch (error) {
      throw error instanceof BadRequestError || error instanceof NotFoundError
        ? error
        : new InternalServerError("An error occurred while creating the meeting");
    }
  }

  async addParticipant(
    meetingId: string,
    userData: { userId: string; username: string; avatar?: string }
  ): Promise<IMeeting> {
    try {
      const meeting = await this._meetingRepository.findById(meetingId);
      if (!meeting) {
        throw new NotFoundError("Meeting not found");
      }

      const user = await this._userRepository.findById(userData.userId);
      if (!user) {
        throw new NotFoundError("User not found");
      }

      const participantExists = meeting.participants.some(
        (p) => p.userId.toString() === userData.userId
      );
      if (participantExists) {
        throw new BadRequestError("User already in meeting");
      }

      meeting.participants.push({
        userId: new Types.ObjectId(userData.userId),
        username: userData.username,
        avatar: userData.avatar,
        role: Role.JOINEE,
        joinTime: new Date(),
      });

      const updatedMeeting = await this._meetingRepository.update(meetingId, meeting);
      if (!updatedMeeting) {
        throw new InternalServerError("Failed to add participant");
      }

      return updatedMeeting;
    } catch (error) {
      throw error instanceof BadRequestError || error instanceof NotFoundError
        ? error
        : new InternalServerError("An error occurred while adding participant");
    }
  }

  async endMeeting(meetingId: string): Promise<IMeeting> {
    try {
      const meeting = await this._meetingRepository.findById(meetingId);
      if (!meeting) {
        throw new NotFoundError("Meeting not found");
      }

      meeting.status = "completed";
      meeting.endTime = new Date();
      const start = new Date(meeting.startTime);
      const end = new Date(meeting.endTime);
      meeting.duration = Math.round((end.getTime() - start.getTime()) / 60000);

      const updatedMeeting = await this._meetingRepository.update(meetingId, meeting);
      if (!updatedMeeting) {
        throw new InternalServerError("Failed to end meeting");
      }

      return updatedMeeting;
    } catch (error) {
      throw error instanceof NotFoundError
        ? error
        : new InternalServerError("An error occurred while ending the meeting");
    }
  }

  async getUserMeetings(userId: string,page:number,limit:number): Promise<{meetings: MeetingHistoryDTO[],totalPages:number}> {
    try {
      if (!Types.ObjectId.isValid(userId)) {
        throw new BadRequestError("Invalid user ID");
      }

      const {meetings, totalPages} = await this._meetingRepository.listByUserId(userId,page,limit);
      return {meetings: MeetingMapper.toMeetingHistoryDTOList(meetings, userId), totalPages};
    } catch (error) {
      throw error instanceof BadRequestError
        ? error
        : new InternalServerError("An error occurred while fetching meetings");
    }
  }

  async getMeetingById(meetingId: string): Promise<IMeeting> {
    try {
      const meeting = await this._meetingRepository.findById(meetingId);
      if (!meeting) {
        throw new NotFoundError("Meeting not found");
      }
      return meeting;
    } catch (error) {
      throw error instanceof NotFoundError
        ? error
        : new InternalServerError("An error occurred while fetching meeting");
    }
  }
}