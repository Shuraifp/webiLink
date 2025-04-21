import { RtpCapabilities, RtpParameters } from "mediasoup/node/lib/rtpParametersTypes";

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

  //////////////  SFU
  export interface UserData {
    userId: string;
    username: string;
    avatar: string;
    isMuted: boolean;
  }
  export interface JoinRoomData {
    roomId: string;
    userId: string;
    username: string;
    avatar: string;
    isMuted: boolean;
  }
  export interface ChatMessageData {
    roomId: string;
    userId: string;
    content: string;
  }
  
  export interface ToggleMuteData {
    roomId: string;
    userId: string;
    isMuted: boolean;
  }

  export interface TransportDetails {
    id: string;
    iceParameters: any;
    iceCandidates: any;
    dtlsParameters: any;
    rtpCapabilities: RtpCapabilities;
  }
  
  export interface ConsumerDetails {
    id: string;
    producerId: string;
    kind: "audio" | "video";
    rtpParameters: RtpParameters;
  }

  export enum Status {
    CONNECTING = 'connecting',
    WAITING = 'waiting',
    ACTIVE = 'active',
    ERROR = 'error'
  }

  