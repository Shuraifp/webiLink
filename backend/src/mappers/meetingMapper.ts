import { IMeeting } from "../models/MeetingModel";
import { MeetingHistoryDTO } from "../dto/meetingDTO";
import { Role } from "../types/chatRoom";

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
}