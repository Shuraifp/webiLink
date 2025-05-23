"use client";

import { createContext, useReducer } from "react";
import {
  Role,
  Status,
  UserData,
  BreakoutRoom,
  Poll,
  Question,
  ChatMessage,
} from "@/types/chatRoom";

export interface MeetingContextType {
  state: MeetingState;
  dispatch: React.Dispatch<MeetingAction>;
}

export enum PanelType {
  CHAT = "CHAT",
  USERS = "USERS",
  POLLS_AND_QA = "POLLS_AND_QA",
}

export const MeetingContext = createContext<MeetingContextType | undefined>(
  undefined
);

export enum MeetingActionType {
  SET_ROOM_ID = "SET_ROOM_ID",
  SET_LEFT_MEETING = "SET_LEFT_MEETING",
  SET_STATUS_MESSAGE = "SET_STATUS_MESSAGE",
  OPEN_SIDEBAR = "OPEN_SIDEBAR",
  CLOSE_SIDEBAR = "CLOSE_SIDEBAR",
  SET_PANEL = "SET_PANEL",
  SET_CURRENT_USER = "SET_CURRENT_USER",
  SET_STATUS = "SET_STATUS",
  SET_USERS = "SET_USERS",
  ADD_USER = "ADD_USER",
  REMOVE_USER = "REMOVE_USER",
  UPDATE_BREAKOUT_ROOMS = "UPDATE_BREAKOUT_ROOMS",
  TOGGLE_WHITEBOARD = "TOGGLE_WHITEBOARD",
  SET_POLLS = "SET_POLLS",
  ADD_POLL = "ADD_POLL",
  UPDATE_POLL = "UPDATE_POLL",
  DELETE_POLL = "DELETE_POLL",
  ENABLE_QA = "ENABLE_QA",
  SET_QUESTIONS = "SET_QUESTIONS",
  ADD_QUESTION = "ADD_QUESTION",
  UPDATE_QUESTION = "UPDATE_QUESTION",
  DELETE_QUESTION = "DELETE_QUESTION",
  ADD_MESSAGE = "ADD_MESSAGE",
  SET_MESSAGES = "SET_MESSAGES",
}

export type MeetingAction =
  | { type: MeetingActionType.SET_ROOM_ID; payload: string }
  | { type: MeetingActionType.SET_LEFT_MEETING; payload: boolean }
  | { type: MeetingActionType.SET_STATUS_MESSAGE; payload: string | null }
  | { type: MeetingActionType.SET_PANEL; payload: PanelType }
  | {
      type: MeetingActionType.CLOSE_SIDEBAR;
    }
  | {
      type: MeetingActionType.OPEN_SIDEBAR;
      payload: { panel: PanelType };
    }
  | {
      type: MeetingActionType.SET_CURRENT_USER;
      payload: {
        userId: string;
        username: string;
        avatar: string;
        role: Role.HOST | Role.JOINEE;
      };
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
    }
  | { type: MeetingActionType.TOGGLE_WHITEBOARD; payload?: boolean }
  | { type: MeetingActionType.SET_POLLS; payload: Poll[] }
  | { type: MeetingActionType.ADD_POLL; payload: Poll }
  | {
      type: MeetingActionType.UPDATE_POLL;
      payload: { pollId: number; updates: Partial<Poll> };
    }
  | { type: MeetingActionType.DELETE_POLL; payload: number }
  | { type: MeetingActionType.ENABLE_QA; payload: boolean }
  | { type: MeetingActionType.SET_QUESTIONS; payload: Question[] }
  | { type: MeetingActionType.ADD_QUESTION; payload: Question }
  | {
      type: MeetingActionType.UPDATE_QUESTION;
      payload: { questionId: number; updates: Partial<Question> };
    }
  | { type: MeetingActionType.DELETE_QUESTION; payload: number }
  | { type: MeetingActionType.ADD_MESSAGE; payload: ChatMessage }
  | { type: MeetingActionType.SET_MESSAGES; payload: ChatMessage[] };

export interface MeetingState {
  roomId: string;
  status: Status;
  isLeftMeeting: boolean;
  isSidebarOpen: boolean;
  activePanel: PanelType | null;
  statusMessage: string | null;
  currentUserId: string;
  currentUsername: string;
  currentUserAvatar: string;
  currentUserRole: Role.HOST | Role.JOINEE;
  users: UserData[];
  breakoutRooms: BreakoutRoom[];
  mainRoomParticipants: string[];
  isWhiteboardVisible: boolean;
  messages: ChatMessage[];
  polls: Poll[];
  isQAEnabled: boolean;
  questions: Question[];
}

export const initialState: MeetingState = {
  roomId: "",
  isLeftMeeting: false,
  isSidebarOpen: false,
  activePanel: null,
  status: Status.CONNECTING,
  statusMessage: null,
  currentUserId: "",
  currentUsername: "",
  currentUserAvatar: "",
  currentUserRole: Role.JOINEE,
  users: [],
  breakoutRooms: [],
  mainRoomParticipants: [],
  isWhiteboardVisible: false,
  messages: [],
  polls: [],
  isQAEnabled: false,
  questions: [],
};

const meetingReducer = (
  state: MeetingState,
  action: MeetingAction
): MeetingState => {
  switch (action.type) {
    case MeetingActionType.SET_ROOM_ID:
      return { ...state, roomId: action.payload };
    case MeetingActionType.SET_LEFT_MEETING:
      return { ...state, isLeftMeeting: action.payload };
    case MeetingActionType.SET_STATUS:
      return { ...state, status: action.payload };
    case MeetingActionType.SET_STATUS_MESSAGE:
      return { ...state, statusMessage: action.payload };
    case MeetingActionType.OPEN_SIDEBAR:
      return {
        ...state,
        isSidebarOpen: true,
        activePanel: action.payload.panel,
      };
    case MeetingActionType.CLOSE_SIDEBAR:
      return {
        ...state,
        isSidebarOpen: false,
        activePanel: null,
      };
    case MeetingActionType.SET_PANEL:
      return {
        ...state,
        isSidebarOpen: true,
        activePanel: action.payload,
      };
    case MeetingActionType.SET_CURRENT_USER:
      return {
        ...state,
        currentUserId: action.payload.userId,
        currentUsername: action.payload.username,
        currentUserAvatar: action.payload.avatar,
        currentUserRole: action.payload.role,
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
    case MeetingActionType.TOGGLE_WHITEBOARD:
      return {
        ...state,
        isWhiteboardVisible: action.payload
          ? action.payload
          : !state.isWhiteboardVisible,
      };
    case MeetingActionType.SET_POLLS:
      return { ...state, polls: action.payload };
    case MeetingActionType.ADD_POLL:
      return { ...state, polls: [...state.polls, action.payload] };
    case MeetingActionType.UPDATE_POLL:
      return {
        ...state,
        polls: state.polls.map((p) =>
          p.id === action.payload.pollId
            ? { ...p, ...action.payload.updates }
            : p
        ),
      };
    case MeetingActionType.DELETE_POLL:
      return {
        ...state,
        polls: state.polls.filter((p) => p.id !== action.payload),
      };
    case MeetingActionType.ENABLE_QA:
      return { ...state, isQAEnabled: action.payload };
    case MeetingActionType.SET_QUESTIONS:
      return { ...state, questions: action.payload };
    case MeetingActionType.ADD_QUESTION:
      return { ...state, questions: [...state.questions, action.payload] };
    case MeetingActionType.UPDATE_QUESTION:
      return {
        ...state,
        questions: state.questions.map((q) =>
          q.id === action.payload.questionId
            ? { ...q, ...action.payload.updates }
            : q
        ),
      };
    case MeetingActionType.DELETE_QUESTION:
      return {
        ...state,
        questions: state.questions.filter((q) => q.id !== action.payload),
      };
    case MeetingActionType.ADD_MESSAGE:
      return { ...state, messages: [...state.messages, action.payload] };
    case MeetingActionType.SET_MESSAGES:
      return { ...state, messages: action.payload };
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

  return (
    <MeetingContext.Provider value={{ state, dispatch }}>
      {children}
    </MeetingContext.Provider>
  );
};
