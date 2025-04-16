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

export interface UserConnectedData {
  userId: string;
  username: string;
  avatar: string;
  role: "host" | "joinee";
}

export interface UserConnectingData {
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
  HOST = 'host',
  JOINEE = 'joinee'
}


// Chat

export interface ChatMessage {
  messageId: string;
  userId: string;
  username: string;
  avatar: string;
  content: string;
  timestamp: number;
  }