export interface DashboardStatsDTO {
  totalMeetings: number;
  hostedMeetings: number;
  attendedMeetings: number;
  totalDuration: number; 
  totalParticipants: number;
  avgMeetingDuration: number;
  thisWeekMeetings: number;
  thisMonthMeetings: number;
  recentActivity: {
    id: string;
    roomName: string;
    duration: number;
    participants: number;
    date: string;
    status: 'completed' | 'ongoing';
    type: 'hosted' | 'attended';
    hostName?: string;
  }[];
}