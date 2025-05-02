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
export enum DrawingState {
  START = "start",
  DRAW = "draw",
  END = "end",
}
export interface DrawEvent {
  roomId: string;
  x: number;
  y: number;
  type: DrawingState;
  color?: string;
  lineWidth?: number;
}
export enum SocketEvent {
  JOIN_ROOM = "join-room",
  LEAVE_ROOM = "leave-room",
  Whiteboard_DRAW = "whiteboard-draw",
}
export enum SubTab {
  POLLS = "POLLS",
  QA = "QA",
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
  roomId: string;
  // users: UserData[];
  // messages: ChatMessage[];
  isWhiteboardVisible: boolean;
  isQAEnabled: boolean;
}
