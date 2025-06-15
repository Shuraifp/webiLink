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
  TimerState,
  Caption,
} from "@/types/chatRoom";

export interface MeetingContextType {
  state: MeetingState;
  dispatch: React.Dispatch<MeetingAction>;
}

export enum PanelType {
  CHAT = "CHAT",
  USERS = "USERS",
  POLLS_AND_QA = "POLLS_AND_QA",
  NOTES = "NOTES",
}

export type NoteBlock =
  | { type: "text"; content: string }
  | { type: "image"; src: string; };

export const MeetingContext = createContext<MeetingContextType | undefined>(
  undefined
);

export enum MeetingActionType {
  SET_ROOM_ID = "SET_ROOM_ID",
  SET_LEFT_MEETING = "SET_LEFT_MEETING",
  OPEN_SIDEBAR = "OPEN_SIDEBAR",
  CLOSE_SIDEBAR = "CLOSE_SIDEBAR",
  SET_PANEL = "SET_PANEL",
  SET_CURRENT_USER = "SET_CURRENT_USER",
  SET_STATUS = "SET_STATUS",
  SET_USERS = "SET_USERS",
  ADD_USER = "ADD_USER",
  REMOVE_USER = "REMOVE_USER",
  SET_ISPREMIUM = "SET_ISPREMIUM",
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
  SET_TIMER = "SET_TIMER",
  UPDATE_TIMER = "UPDATE_TIMER",
  RESET_TIMER = "RESET_TIMER",
  RAISE_HAND = "RAISE_HAND",
  LOWER_HAND = "LOWER_HAND",
  SET_RAISED_HANDS = "SET_RAISED_HANDS",
  ADD_CAPTION = "ADD_CAPTION",
  SET_CAPTIONS = "SET_CAPTIONS",
  INCREMENT_UNREAD_MESSAGES = "INCREMENT_UNREAD_MESSAGES",
  RESET_UNREAD_MESSAGES = "RESET_UNREAD_MESSAGES",
  SET_NOTES = "SET_NOTES",
  CLEAR_NOTES = "CLEAR_NOTES",
}

export type MeetingAction =
  | { type: MeetingActionType.SET_ROOM_ID; payload: string }
  | { type: MeetingActionType.SET_LEFT_MEETING; payload: boolean }
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
  | { type: MeetingActionType.SET_ISPREMIUM; payload?: boolean }
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
  | { type: MeetingActionType.SET_MESSAGES; payload: ChatMessage[] }
  | { type: MeetingActionType.SET_TIMER; payload: TimerState }
  | {
      type: MeetingActionType.UPDATE_TIMER;
      payload: { timeLeft: number; isRunning: boolean };
    }
  | { type: MeetingActionType.RESET_TIMER; payload: { duration: number } }
  | {
      type: MeetingActionType.RAISE_HAND;
      payload: { userId: string; username: string };
    }
  | {
      type: MeetingActionType.LOWER_HAND;
      payload: { userId: string; username: string };
    }
  | {
      type: MeetingActionType.SET_RAISED_HANDS;
      payload: { userId: string; username: string }[];
    }
  | {
      type: MeetingActionType.ADD_CAPTION;
      payload: Caption;
    }
  | {
      type: MeetingActionType.SET_CAPTIONS;
      payload: Caption[];
    }
  | {
      type: MeetingActionType.INCREMENT_UNREAD_MESSAGES;
    }
  | {
      type: MeetingActionType.RESET_UNREAD_MESSAGES;
    }
  | {
      type: MeetingActionType.SET_NOTES;
      payload: NoteBlock[];
    }
  | { type: MeetingActionType.CLEAR_NOTES };

export interface MeetingState {
  roomId: string;
  status: Status;
  isLeftMeeting: boolean;
  isSidebarOpen: boolean;
  activePanel: PanelType | null;
  currentUserId: string;
  currentUsername: string;
  currentUserAvatar: string;
  currentUserRole: Role.HOST | Role.JOINEE;
  isPremiumUser: boolean;
  users: UserData[];
  breakoutRooms: BreakoutRoom[];
  mainRoomParticipants: string[];
  isWhiteboardVisible: boolean;
  messages: ChatMessage[];
  polls: Poll[];
  isQAEnabled: boolean;
  questions: Question[];
  timer: TimerState;
  raisedHands: { userId: string; username: string }[];
  captions: Caption[];
  unreadMessages: number;
  notes: NoteBlock[];
}

export const initialState: MeetingState = {
  roomId: "",
  isLeftMeeting: false,
  isSidebarOpen: false,
  activePanel: null,
  status: Status.CONNECTING,
  currentUserId: "",
  currentUsername: "",
  currentUserAvatar: "",
  currentUserRole: Role.JOINEE,
  isPremiumUser: false,
  users: [],
  breakoutRooms: [],
  mainRoomParticipants: [],
  isWhiteboardVisible: false,
  messages: [],
  polls: [],
  isQAEnabled: false,
  questions: [],
  timer: { isRunning: false, duration: 0, timeLeft: 0 },
  raisedHands: [],
  captions: [],
  unreadMessages: 0,
  notes: [{ type: "text", content: "" }],
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
    case MeetingActionType.SET_ISPREMIUM:
      return {
        ...state,
        isPremiumUser: action.payload!,
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
    case MeetingActionType.SET_TIMER:
      return { ...state, timer: action.payload };
    case MeetingActionType.UPDATE_TIMER:
      return {
        ...state,
        timer: {
          ...state.timer,
          timeLeft: action.payload.timeLeft,
          isRunning: action.payload.isRunning,
        },
      };
    case MeetingActionType.RESET_TIMER:
      return {
        ...state,
        timer: {
          isRunning: false,
          duration: action.payload.duration,
          timeLeft: action.payload.duration,
        },
      };
    case MeetingActionType.RAISE_HAND:
      return {
        ...state,
        raisedHands: state.raisedHands.some(
          (hand) => hand.userId === action.payload.userId
        )
          ? state.raisedHands
          : [...state.raisedHands, action.payload],
      };
    case MeetingActionType.LOWER_HAND:
      return {
        ...state,
        raisedHands: state.raisedHands.filter(
          (item) => item.userId !== action.payload.userId
        ),
      };
    case MeetingActionType.SET_RAISED_HANDS:
      const uniqueRaisedHands = Array.from(
        new Map(action.payload.map((hand) => [hand.userId, hand])).values()
      );
      return {
        ...state,
        raisedHands: uniqueRaisedHands,
      };
    case MeetingActionType.ADD_CAPTION:
      return {
        ...state,
        captions: [...state.captions, action.payload],
      };
    case MeetingActionType.SET_CAPTIONS:
      return {
        ...state,
        captions: action.payload,
      };
    case MeetingActionType.INCREMENT_UNREAD_MESSAGES:
      return {
        ...state,
        unreadMessages: state.unreadMessages + 1,
      };
    case MeetingActionType.RESET_UNREAD_MESSAGES:
      return {
        ...state,
        unreadMessages: 0,
      };
    case MeetingActionType.SET_NOTES:
      return {
        ...state,
        notes: action.payload,
      };
    case MeetingActionType.CLEAR_NOTES:
      return {
        ...state,
        notes: [{ type: "text", content: "" }],
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

  return (
    <MeetingContext.Provider value={{ state, dispatch }}>
      {children}
    </MeetingContext.Provider>
  );
};
