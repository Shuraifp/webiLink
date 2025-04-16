"use client";

import { createContext, useReducer, useEffect } from "react";
import { Role, Status, VideoStream } from "@/types/chatRoom";

export interface MeetingContextType {
  state: MeetingState;
  dispatch: React.Dispatch<MeetingAction>;
}

export const MeetingContext = createContext<MeetingContextType | undefined>(
  undefined
);

export enum MeetingActionType {
  SET_ROOM_ID = "SET_ROOM_ID",
  SET_STATUS_MESSAGE = "SET_STATUS_MESSAGE",
  SET_VIDEO_STREAMS = "SET_VIDEO_STREAMS",
  SET_CURRENT_USER = "SET_CURRENT_USER",
  TOGGLE_LOCK = "TOGGLE_LOCK",
  TOGGLE_INFO = "TOGGLE_INFO",
  TOGGLE_USER = "TOGGLE_USER",
  TOGGLE_CHAT = "TOGGLE_CHAT",
  TOGGLE_MORE = "TOGGLE_MORE",
  TOGGLE_MUTE = "TOGGLE_MUTE",
  SET_STATUS = "SET_STATUS",
}

export type MeetingAction =
  | { type: MeetingActionType.SET_ROOM_ID; payload: string }
  | { type: MeetingActionType.SET_STATUS_MESSAGE; payload: string | null }
  | { type: MeetingActionType.SET_VIDEO_STREAMS; payload: VideoStream[] }
  | {
      type: MeetingActionType.SET_CURRENT_USER;
      payload: {
        userId: string;
        username: string;
        avatar: string;
        role: Role.HOST | Role.JOINEE;
      };
    }
  | { type: MeetingActionType.TOGGLE_LOCK }
  | { type: MeetingActionType.TOGGLE_INFO }
  | { type: MeetingActionType.TOGGLE_USER }
  | { type: MeetingActionType.TOGGLE_CHAT }
  | { type: MeetingActionType.TOGGLE_MORE }
  | {
      type: MeetingActionType.TOGGLE_MUTE;
      payload: { userId: string; isMuted: boolean };
    }
  | {
      type: MeetingActionType.SET_STATUS;
      payload:
        | Status.CONNECTING
        | Status.ACTIVE
        | Status.ERROR
        | Status.WAITING;
    };

export interface MeetingState {
  roomId: string;
  status: Status.CONNECTING | Status.ACTIVE | Status.ERROR | Status.WAITING;
  statusMessage: string | null;
  videoStreams: VideoStream[];
  isMuted: boolean;
  currentUserId: string;
  currentUsername: string;
  currentUserAvatar: string;
  currentUserRole: Role.HOST | Role.JOINEE;
  isLocked: boolean;
  isInfoActive: boolean;
  isUserActive: boolean;
  isChatActive: boolean;
  isMoreActive: boolean;
}

export const initialState: MeetingState = {
  roomId: "",
  status: Status.CONNECTING,
  statusMessage: null,
  videoStreams: [],
  isMuted: true,
  currentUserId: "",
  currentUsername: "",
  currentUserAvatar: "",
  currentUserRole: Role.JOINEE,
  isLocked: false,
  isInfoActive: false,
  isUserActive: false,
  isChatActive: false,
  isMoreActive: false,
};

const meetingReducer = (
  state: MeetingState,
  action: MeetingAction
): MeetingState => {
  switch (action.type) {
    case MeetingActionType.SET_ROOM_ID:
      return { ...state, roomId: action.payload };
    case MeetingActionType.SET_STATUS:
      return { ...state, status: action.payload };
    case MeetingActionType.SET_STATUS_MESSAGE:
      return { ...state, statusMessage: action.payload };
    case MeetingActionType.SET_VIDEO_STREAMS:
      return { ...state, videoStreams: [...action.payload] };
    case MeetingActionType.SET_CURRENT_USER:
      return {
        ...state,
        currentUserId: action.payload.userId,
        currentUsername: action.payload.username,
        currentUserAvatar: action.payload.avatar,
        currentUserRole: action.payload.role,
      };
    case MeetingActionType.TOGGLE_LOCK:
      return { ...state, isLocked: !state.isLocked };
    case MeetingActionType.TOGGLE_INFO:
      return { ...state, isInfoActive: !state.isInfoActive };
    case MeetingActionType.TOGGLE_USER:
      return { ...state, isUserActive: !state.isUserActive };
    case MeetingActionType.TOGGLE_CHAT:
      return { ...state, isChatActive: !state.isChatActive };
    case MeetingActionType.TOGGLE_MORE:
      return { ...state, isMoreActive: !state.isMoreActive };
    case MeetingActionType.TOGGLE_MUTE:
      const updatedStreams = state.videoStreams.map((stream) => {
        if (stream.userId === action.payload.userId) {
          const audioTracks = stream.stream?.getAudioTracks?.();
          if (audioTracks && audioTracks.length > 0) {
            audioTracks.forEach((track) => {
              track.enabled = !action.payload.isMuted;
            });
          }else {
            console.warn("No audio tracks found for user:", action.payload.userId);
          }

          return {
            ...stream,
            isMuted: action.payload.isMuted,
          };
        }
        return stream;
      });

      return {
        ...state,
        isMuted: state.currentUserId === action.payload.userId ? action.payload.isMuted : state.isMuted,
        videoStreams: updatedStreams,
      };
    default:
      return state;
  }
};

export const MeetingProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [state, dispatch] = useReducer(meetingReducer, initialState);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("meetingState");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        dispatch({
          type: MeetingActionType.SET_ROOM_ID,
          payload: parsed.roomId || "",
        });
        dispatch({
          type: MeetingActionType.SET_STATUS,
          payload: parsed.status || Status.CONNECTING,
        });
        dispatch({
          type: MeetingActionType.SET_STATUS_MESSAGE,
          payload: parsed.statusMessage || null,
        });
        dispatch({
          type: MeetingActionType.SET_CURRENT_USER,
          payload: {
            userId: parsed.currentUserId || "",
            username: parsed.currentUsername || "",
            avatar: parsed.currentUserAvatar || "",
            role: parsed.currentUserRole || Role.JOINEE,
          },
        });
        if (parsed.isLocked) dispatch({ type: MeetingActionType.TOGGLE_LOCK });
        if (parsed.isInfoActive)
          dispatch({ type: MeetingActionType.TOGGLE_INFO });
        if (parsed.isUserActive)
          dispatch({ type: MeetingActionType.TOGGLE_USER });
        if (parsed.isMuted)
          dispatch({
            type: MeetingActionType.TOGGLE_MUTE,
            payload: { userId: parsed.currentUserId, isMuted: parsed.isMuted },
          });
        if (parsed.isChatActive)
          dispatch({ type: MeetingActionType.TOGGLE_CHAT });
        if (parsed.isMoreActive)
          dispatch({ type: MeetingActionType.TOGGLE_MORE });
      } catch (e) {
        console.error("Failed to parse meeting state from localStorage", e);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const serializableState = {
        roomId: state.roomId,
        status: state.status,
        statusMessage: state.statusMessage,
        currentUserId: state.currentUserId,
        currentUsername: state.currentUsername,
        currentUserAvatar: state.currentUserAvatar,
        currentUserRole: state.currentUserRole,
        isLocked: state.isLocked,
        isMuted: state.isMuted,
        isInfoActive: state.isInfoActive,
        isUserActive: state.isUserActive,
        isChatActive: state.isChatActive,
        isMoreActive: state.isMoreActive,
      };
      localStorage.setItem("meetingState", JSON.stringify(serializableState));
    }
  }, [state]);

  return (
    <MeetingContext.Provider value={{ state, dispatch }}>
      {children}
    </MeetingContext.Provider>
  );
};
