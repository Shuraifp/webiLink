import { IUserPlan, Plan } from "./plan";

export interface DashboardStats {
  users: number;
  subscriptions: { planId: string; planName: string; count: number }[];
  totalRevenue: number;
  planTrends: { planId: string; planName: string; count: number }[];
  totalMeetings: number;
  activeMeetings: number;
  totalRecordings: number;
  recentMeetings: RecentMeeting[];
}

export interface RecentMeeting {
  id: string;
  roomName: string;
  hostName: string;
  participants: number;
  duration: number;
  startTime: string;
  endTime: string;
}

export interface Subscription {
  userPlan: IUserPlan;
  plan: Plan;
  user: {
    username: string;
    email: string;
  };
}

export type User = {
  _id: string;
  username: string;
  email: string;
  isArchived: boolean;
  isBlocked: boolean;
};

export interface MeetingStats {
  totalMeetings: number;
  totalDuration: number;
  totalParticipants: number;
}

export interface Transaction {
  transactionId: string;
  username: string;
  planname: string;
  amount: number;
  date: string;
}

export interface StorageStats {
  totalRecordings: number;
  totalStorageUsed: number;
  recordingsPerUser: Array<{
    userId: string;
    username: string;
    count: number;
  }>;
}
