export interface MeetingHistoryDTO {
  id: string;
  roomName: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  participants: number;
  type: 'hosted' | 'attended';
  status: 'completed' | 'ongoing';
  hostName?: string;
  participantsList?: string[];
}

export interface AdminDashboardRecentMeetingDTO {
  id: string;
  roomName: string;
  hostName: string;
  participants: number;
  duration: number;
  startTime: string;
  endTime: string;
}