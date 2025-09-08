import { AdminDashboardRecentMeetingDTO, MeetingHistoryDTO } from "../dto/meetingDTO";
import { Role } from "../types/chatRoom";
import { IMeeting } from "../types/models";

export class MeetingMapper {

  static toMeetingHistoryDTO(meeting: IMeeting, currentUserId: string): MeetingHistoryDTO {
    const isHost = meeting.hostId._id.toString() === currentUserId;
    const hostParticipant = meeting.participants.find(p => p.role === Role.HOST);
    
    let duration = 0;
    if (meeting.duration) {
      duration = meeting.duration;
    } else if (meeting.endTime && meeting.startTime) {
      const start = new Date(meeting.startTime);
      const end = new Date(meeting.endTime);
      duration = Math.round((end.getTime() - start.getTime()) / 60000);
    }

    return {
      id: meeting._id!.toString(),
      roomName: meeting.roomName,
      date: meeting.startTime.toISOString().split('T')[0],
      startTime: meeting.startTime.toTimeString().slice(0, 8),
      endTime: meeting.endTime ? meeting.endTime.toTimeString().slice(0, 8) : '',
      duration,
      participants: meeting.participants.length,
      type: isHost ? 'hosted' : 'attended',
      status: meeting.status as 'completed' | 'ongoing',
      hostName: hostParticipant?.username,
      participantsList: meeting.participants.map(p => p.username)
    };
  }

  static toMeetingHistoryDTOList(meetings: IMeeting[], currentUserId: string): MeetingHistoryDTO[] {
    return meetings.map(meeting => this.toMeetingHistoryDTO(meeting, currentUserId));
  }


  static async toAdminDashboardRecentMeetingDTO(
    meeting: IMeeting,
  ): Promise<AdminDashboardRecentMeetingDTO> {
    const hostParticipant = meeting.participants.find(p => p.role === Role.HOST);
    
    let duration = 0;
    if (meeting.duration) {
      duration = meeting.duration;
    } else if (meeting.endTime && meeting.startTime) {
      const start = new Date(meeting.startTime);
      const end = new Date(meeting.endTime);
      duration = Math.round((end.getTime() - start.getTime()) / 60000);
    }

    return {
      id: meeting._id!.toString(),
      roomName: meeting.roomName,
      hostName: hostParticipant?.username || "Unknown",
      participants: meeting.participants.length,
      duration,
      startTime: meeting.startTime.toISOString(),
      endTime: meeting.endTime ? meeting.endTime.toISOString() : '',
    };
  }

  static async toAdminDashboardRecentMeetingDTOList(
    meetings: IMeeting[],
  ): Promise<AdminDashboardRecentMeetingDTO[]> {
    return Promise.all(
      meetings.map(meeting => this.toAdminDashboardRecentMeetingDTO(meeting))
    );
  }
}