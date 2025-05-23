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