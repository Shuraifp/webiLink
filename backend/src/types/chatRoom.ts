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

export enum SocketEvent {
  JOIN_ROOM = "join-room",
  LEAVE_ROOM = "leave-room",
  Whiteboard_DRAW = "whiteboard-draw",
  TIMER_START = "timer-start",
  TIMER_PAUSE = "timer-pause",
  TIMER_RESET = "timer-reset",
  TIMER_UPDATE = "timer-update",
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


export interface DrawEvent {
  roomId: string;
  x: number;
  y: number;
  type: "start" | "draw" | "end";
  color?: string;
  lineWidth?: number;
  username?: string;
}

export enum PollStatus {
  ACTIVE = "active",
  UPCOMING = "upcoming",
  ENDED = "ended",
}

export interface Poll {
  id: number;
  question: string;
  options: { text: string; image?: string }[];
  allowMultiple: boolean;
  anonymous: boolean;
  showResults: boolean;
  duration: number;
  status: PollStatus
  responses: { [userId: string]: string[] };
  image?: string;
}


export enum QuestionStatus {
  OPEN = "OPEN",
  CLOSED = "CLOSED",
}
export interface Question {
  id: number;
  text: string;
  userId: string;
  username: string;
  timestamp: number;
  status: QuestionStatus;
  isAnonymous: boolean; 
  upvotes: string[]; 
  isVisible: boolean; 
  isAnswered: boolean; 
  answer?: string; 
  answeredBy?: string; 
}

export interface RoomState {
  isDrawing: boolean;
  isQAEnabled: boolean;
}

export interface TimerState {
  isRunning: boolean;
  duration: number;
  timeLeft: number; 
}