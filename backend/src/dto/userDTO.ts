import { UserRole } from "../types/type";

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

export interface UserDTO {
  _id: string;
  username: string;
  email: string;
  role?: UserRole;
  profile?: {
    firstName?: string;
    lastName?: string;
    avatar?: string;
    backgroundImage?: string;
    bio?: string;
    jobTitle?: string;
    company?: string;
  };
  isBlocked: boolean;
  isArchived: boolean;
  isPremium: boolean;
  planId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}