import { Dispatch, SetStateAction } from "react";
import { UserData } from "./type";
import { BillingInterval, IUserPlan, Plan } from "./plan";

export interface ConfirmationModalContextType {
  confirm: (message: string, onConfirm: () => void) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

export interface CreateMeetingProps {
  onSectionChange: Dispatch<SetStateAction<string>>;
  prevSection: string;
}

export interface MeetingHistory {
  id: string;
  roomName: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  participants: number;
  type: "hosted" | "attended";
  status: "completed" | "ongoing";
  hostName?: string;
  participantsList?: string[];
}

export type FilterType = "all" | "hosted" | "attended";
export type StatusFilter = "all" | "completed" | "ongoing";

export interface DashboardProps {
  onSectionChange: Dispatch<SetStateAction<string>>;
  selectedSection: string;
  setPrevSection: Dispatch<SetStateAction<string>>;
}

export interface DashboardStats {
  totalMeetings: number;
  hostedMeetings: number;
  attendedMeetings: number;
  totalDuration: number;
  totalParticipants: number;
  avgMeetingDuration: number;
  thisWeekMeetings: number;
  thisMonthMeetings: number;
}

export interface RecentActivity {
  id: string;
  roomName: string;
  duration: number;
  participants: number;
  date: string;
  status: "completed" | "ongoing";
  type: "hosted" | "attended";
  hostName?: string;
}

// recordings types
export interface Recording {
  recordingId: string;
  roomId: string;
  createdAt: string;
  url: string;
}

export interface RecordingsProps {
  onSectionChanges: Dispatch<SetStateAction<string>>;
}


// room types
export interface RoomsProps {
  user: UserData | null;
  onSectionChange: Dispatch<SetStateAction<string>>;
  selectedSection: string;
  setPrevSection: Dispatch<SetStateAction<string>>;
}

export interface Room {
  _id: string;
  name: string;
  slug: string;
  isActive: boolean;
}

// subscription types
export interface UserPlanData {
  userPlan: IUserPlan;
  plan: Plan;
}

export interface SubscriptionHistory {
  _id: string;
  planId: {
    name: string;
    price: number;
    billingCycle: { interval: BillingInterval; frequency: number };
  };
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd?: string | null;
  createdAt: string;
  cancelAtPeriodEnd?: boolean;
}