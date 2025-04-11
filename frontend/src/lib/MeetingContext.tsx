"use client";
import { createContext, useReducer, useEffect, useContext } from "react";

const MeetingContext = createContext<MeetingContextType | undefined>(undefined);

interface VideoStream {
  userId: string;
  username: string;
  stream: MediaStream | null;
  role: "host" | "joinee";
  isMuted: boolean;
}

interface MeetingState {
  roomId: string;
  statusMessage: string | null;
  videoStreams: VideoStream[];
  currentUserId: string;
  currentUserRole: "host" | "joinee";
  isLocked: boolean;
  isInfoActive: boolean;
  isUserActive: boolean;
  isChatActive: boolean;
  isMoreActive: boolean;
}

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
  SET_ALL_STATE = "SET_ALL_STATE",
}


type MeetingAction =
  | { type: MeetingActionType.SET_ROOM_ID; payload: string }
  | { type: MeetingActionType.SET_STATUS_MESSAGE; payload: string | null }
  | { type: MeetingActionType.SET_VIDEO_STREAMS; payload: VideoStream[] }
  | {
      type: MeetingActionType.SET_CURRENT_USER;
      payload: { userId: string; role: "host" | "joinee" };
    }
  | { type: MeetingActionType.TOGGLE_LOCK }
  | { type: MeetingActionType.TOGGLE_INFO }
  | { type: MeetingActionType.TOGGLE_USER }
  | { type: MeetingActionType.TOGGLE_CHAT }
  | { type: MeetingActionType.TOGGLE_MORE }
  | { type: MeetingActionType.TOGGLE_MUTE; payload: string }
  | { type: MeetingActionType.SET_ALL_STATE; payload: MeetingState };

const initialState: MeetingState = {
  roomId: "",
  statusMessage: null,
  videoStreams: [],
  currentUserId: "",
  currentUserRole: "host",
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
    case MeetingActionType.SET_STATUS_MESSAGE:
      return { ...state, statusMessage: action.payload };
    case MeetingActionType.SET_VIDEO_STREAMS:
      return { ...state, videoStreams: action.payload };
    case MeetingActionType.SET_CURRENT_USER:
      return {
        ...state,
        currentUserId: action.payload.userId,
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
      return {
        ...state,
        videoStreams: state.videoStreams.map((stream) =>
          stream.userId === action.payload
            ? { ...stream, isMuted: !stream.isMuted }
            : stream
        ),
      };
    case MeetingActionType.SET_ALL_STATE:
      return { ...action.payload }
    default:
      return state;
  }
};

interface MeetingContextType {
  state: MeetingState;
  dispatch: React.Dispatch<MeetingAction>;
}

export const MeetingProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [state, dispatch] = useReducer(meetingReducer, initialState);

  useEffect(() => {
    const serializableState = {
      ...state,
      videoStreams: state.videoStreams.map(({ stream, ...rest }) => rest),
    };
    localStorage.setItem("meetingState", JSON.stringify(serializableState));
  }, [state]);

  useEffect(() => {
    const savedState = localStorage.getItem("meetingState");
    if (savedState) {
      const parsedState = JSON.parse(savedState);
      if (parsedState) {
        dispatch({ type: MeetingActionType.SET_ALL_STATE, payload: parsedState })
      }
    }
  }, []);

  return (
    <MeetingContext.Provider value={{ state, dispatch }}>
      {children}
    </MeetingContext.Provider>
  );
};

export default MeetingContext;

// Custom Hook

export const useStateTools = () => {
  const context = useContext(MeetingContext);

  if (!context) {
    throw new Error("useStateTools hook must be used within a MeetingProvider");
  }

  const { state, dispatch } = context;
  return { state, dispatch };
};