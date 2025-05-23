import { MeetingHistoryDTO } from "../../dto/meetingDTO";
import { IMeeting } from "../../models/MeetingModel";

export interface IMeetingService {
  createMeeting(
    roomId: string,
    hostId: string,
    roomName: string,
    slug: string,
    userData: { userId: string; username: string; avatar?: string }
  ): Promise<IMeeting>;
  addParticipant(
    meetingId: string,
    userData: { userId: string; username: string; avatar?: string }
  ): Promise<IMeeting>;
  endMeeting(meetingId: string): Promise<IMeeting>;
  getUserMeetings(userId: string): Promise<MeetingHistoryDTO[]>;
  getMeetingById(meetingId: string): Promise<IMeeting>;
}