import { MeetingAction } from "@/lib/MeetingContext";
import { DtlsParameters, IceCandidate, IceParameters, RtpCapabilities, RtpParameters } from "mediasoup-client/types";

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


// Chat

export interface ChatMessage {
  messageId: string;
  userId: string;
  username: string;
  content: string;
  timestamp: number;
  }

  // SFU
  export interface StreamMap {
    [userId: string]: VideoStream | null;
  }

  export interface UseSfuProps {
    roomId: string;
    userId: string;
    username: string;
    avatar: string;
    dispatch: React.Dispatch<MeetingAction>;
    onMessage: (message: ChatMessage) => void;
  }

  export interface TransportDetails {
    id: string;
    iceParameters: IceParameters;
    iceCandidates: IceCandidate[];
    dtlsParameters: DtlsParameters;
    rtpCapabilities: RtpCapabilities;
  }

  export interface ConsumerDetails {
    id: string;
    producerId: string;
    kind: "audio" | "video";
    rtpParameters: RtpParameters;
  }

  export interface VideoStream {
    socketId?: string;
    userId: string;
    username: string;
    avatar?: string;
    stream: MediaStream | null;
    role?: Role.HOST | Role.JOINEE;
    isMuted: boolean;
  }