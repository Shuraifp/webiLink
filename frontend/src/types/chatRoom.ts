export enum Status {
  CONNECTING = 'connecting',
  WAITING = 'waiting',
  ACTIVE = 'active',
  ERROR = 'error'
}

export enum Role {
  HOST = 'host',
  JOINEE = 'joinee'
}

export interface SignalingData {
  socketId:string;
  userId: string;
  username: string;
  avatar: string;
  role: Role.HOST | Role.JOINEE;
  offer?: RTCSessionDescriptionInit;
  answer?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
  roomId: string;
  target: string;
  isMuted?: boolean;
}

export interface UserConnectedData {
  userId: string;
  username: string;
  avatar: string;
  role: Role.HOST | Role.JOINEE;
  isMuted: boolean;
}

export interface UserConnectingData {
  userId: string;
  username: string;
  avatar: string;
  roomId: string;
  isMuted: boolean;
}

export interface VideoStream {
  socketId: string;
  userId: string;
  username: string;
  avatar: string;
  stream: MediaStream | null;
  role: Role.HOST | Role.JOINEE;
  isMuted: boolean;
}