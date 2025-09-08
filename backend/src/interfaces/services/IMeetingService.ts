import { MeetingHistoryDTO } from "../../dto/meetingDTO";
import { IMeeting } from "../../types/models";

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
  getUserMeetings(userId: string,page:number,limit:number): Promise<{meetings: MeetingHistoryDTO[],totalPages:number}>;
  getMeetingById(meetingId: string): Promise<IMeeting>;
}