"use client";

import { createContext, useReducer, useEffect } from "react";
import { Role, Status, UserData, BreakoutRoom } from "@/types/chatRoom";

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
  SET_CURRENT_USER = "SET_CURRENT_USER",
  TOGGLE_CHAT = "TOGGLE_CHAT",
  TOGGLE_MUTE = "TOGGLE_MUTE",
  TOGGLE_USER = "TOGGLE_USER",
  SET_STATUS = "SET_STATUS",
  SET_USERS = "SET_USERS",
  ADD_USER = "ADD_USER",
  REMOVE_USER = "REMOVE_USER",
  UPDATE_BREAKOUT_ROOMS = "UPDATE_BREAKOUT_ROOMS",
}

export type MeetingAction =
  | { type: MeetingActionType.SET_ROOM_ID; payload: string }
  | { type: MeetingActionType.SET_STATUS_MESSAGE; payload: string | null }
  | {
      type: MeetingActionType.SET_CURRENT_USER;
      payload: {
        userId: string;
        username: string;
        avatar: string;
        role: Role.HOST | Role.JOINEE;
      };
    }
  | { type: MeetingActionType.TOGGLE_CHAT }
  | { type: MeetingActionType.TOGGLE_USER }
  | {
      type: MeetingActionType.TOGGLE_MUTE;
      payload: { userId: string; isMuted: boolean };
    }
  | { type: MeetingActionType.SET_STATUS; payload: Status }
  | { type: MeetingActionType.SET_USERS; payload: UserData[] }
  | { type: MeetingActionType.ADD_USER; payload: UserData }
  | { type: MeetingActionType.REMOVE_USER; payload: string }
  | {
      type: MeetingActionType.UPDATE_BREAKOUT_ROOMS;
      payload: {
        breakoutRooms: BreakoutRoom[];
        mainRoomParticipants: string[];
      };
    };

export interface MeetingState {
  roomId: string;
  status: Status;
  statusMessage: string | null;
  isMuted: boolean;
  currentUserId: string;
  currentUsername: string;
  currentUserAvatar: string;
  currentUserRole: Role.HOST | Role.JOINEE;
  isChatActive: boolean;
  isUserActive: boolean;
  users: UserData[];
  breakoutRooms: BreakoutRoom[];
  mainRoomParticipants: string[];
}

export const initialState: MeetingState = {
  roomId: "",
  status: Status.CONNECTING,
  statusMessage: null,
  isMuted: true,
  currentUserId: "",
  currentUsername: "",
  currentUserAvatar: "",
  currentUserRole: Role.JOINEE,
  isChatActive: false,
  isUserActive: false,
  users: [],
  breakoutRooms: [],
  mainRoomParticipants: [],
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
    case MeetingActionType.SET_CURRENT_USER:
      return {
        ...state,
        currentUserId: action.payload.userId,
        currentUsername: action.payload.username,
        currentUserAvatar: action.payload.avatar,
        currentUserRole: action.payload.role,
      };
    case MeetingActionType.TOGGLE_CHAT:
      return { ...state, isChatActive: !state.isChatActive };
    case MeetingActionType.TOGGLE_USER:
      return { ...state, isUserActive: !state.isUserActive };
    case MeetingActionType.TOGGLE_MUTE:
      return {
        ...state,
        isMuted:
          state.currentUserId === action.payload.userId
            ? action.payload.isMuted
            : state.isMuted,
      };
    case MeetingActionType.ADD_USER:
      return {
        ...state,
        users: [
          ...state.users.filter((u) => u.userId !== action.payload.userId),
          action.payload,
        ],
      };
    case MeetingActionType.REMOVE_USER:
      return {
        ...state,
        users: state.users.filter((u) => u.userId !== action.payload),
      };
    case MeetingActionType.SET_USERS:
      return {
        ...state,
        users: [
          ...state.users.filter(
            (u) =>
              !action.payload.some((newUser) => newUser.userId === u.userId)
          ),
          ...action.payload,
        ],
      };
    case MeetingActionType.UPDATE_BREAKOUT_ROOMS:
      return {
        ...state,
        breakoutRooms: action.payload.breakoutRooms,
        mainRoomParticipants: action.payload.mainRoomParticipants,
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
        if (parsed.isChatActive)
          dispatch({ type: MeetingActionType.TOGGLE_CHAT });
        if (parsed.isUserActive)
          dispatch({ type: MeetingActionType.TOGGLE_USER });
        if (parsed.isMuted)
          dispatch({
            type: MeetingActionType.TOGGLE_MUTE,
            payload: { userId: parsed.currentUserId, isMuted: parsed.isMuted },
          });
      } catch (e) {
        console.error("Failed to parse meeting state from localStorage", e);
      }
    }

    return () => {
      localStorage.removeItem("meetingState");
    };
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
        isMuted: state.isMuted,
        isChatActive: state.isChatActive,
        isUserActive: state.isUserActive,
      };
      localStorage.setItem("meetingState", JSON.stringify(serializableState));
    }

    return () => {
      localStorage.removeItem("meetingState");
    };
  }, [state]);

  return (
    <MeetingContext.Provider value={{ state, dispatch }}>
      {children}
    </MeetingContext.Provider>
  );
};
