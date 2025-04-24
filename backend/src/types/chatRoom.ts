export interface SignalingData {
  userId: string;
  username?: string;
  role?: "host" | "joinee";
  offer?: RTCSessionDescriptionInit;
  answer?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
  roomId: string;
  target?: string;
}

export interface UserData {
  userId: string;
  username: string;
  avatar: string;
  roomId: string;
  isMuted: boolean;
}

export interface VideoStream {
  userId: string;
  username: string;
  avatar: string;
  stream: MediaStream | null;
  role: "host" | "joinee";
  isMuted: boolean;
}

export enum Role {
  HOST = "host",
  JOINEE = "joinee",
}

export enum Status {
  CONNECTING = "connecting",
  WAITING = "waiting",
  ACTIVE = "active",
  ERROR = "error",
}

// Chat

export interface ChatMessageData {
  roomId: string;
  messageId: string;
  userId: string;
  username: string;
  avatar: string;
  content: string;
  timestamp: number;
}

export interface BreakoutRoom {
  id: string;
  name: string;
  participants: string[]; 
}
