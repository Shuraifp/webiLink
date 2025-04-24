export enum Status {
  CONNECTING = "connecting",
  WAITING = "waiting",
  ACTIVE = "active",
  ERROR = "error",
}

export enum Role {
  HOST = "host",
  JOINEE = "joinee",
}

export interface VideoStream {
  userId: string;
  username: string;
  avatar?: string;
  stream: MediaStream | null;
  isMuted: boolean;
}

export interface ChatMessage {
  messageId: string;
  userId: string;
  username: string;
  content: string;
  timestamp: number;
  isDM: boolean;
  targetUserId?: string;
  breakoutRoomId?: string;
}

export interface UserData {
  userId: string;
  username: string;
  avatar?: string;
  role: Role;
  isMuted: boolean;
}

export enum MessageMode {
  PUBLIC = "public",
  DM = "dm",
}

export interface BreakoutRoom {
  id: string;
  name: string;
  participants: string[];
}