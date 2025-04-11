import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface VideoStream {
  userId: string;
  stream: MediaStream;
  role: "host" | "joinee";
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

const initialState: MeetingState = {
  roomId: "Room123",
  statusMessage: null,
  videoStreams: [],
  currentUserId: "user1",
  currentUserRole: "host",
  isLocked: false,
  isInfoActive: false,
  isUserActive: false,
  isChatActive: false,
  isMoreActive: false,
};

const meetingSlice = createSlice({
  name: 'meeting',
  initialState,
  reducers: {
    setRoomId: (state, action: PayloadAction<string>) => {
      state.roomId = action.payload;
    },
    setStatusMessage: (state, action: PayloadAction<string | null>) => {
      state.statusMessage = action.payload;
    },
    setVideoStreams: (state, action: PayloadAction<VideoStream[]>) => {
      state.videoStreams = action.payload;
    },
    setCurrentUser: (state, action: PayloadAction<{ userId: string; role: "host" | "joinee" }>) => {
      state.currentUserId = action.payload.userId;
      state.currentUserRole = action.payload.role;
    },
    toggleLock: (state) => {
      state.isLocked = !state.isLocked;
    },
    toggleInfo: (state) => {
      state.isInfoActive = !state.isInfoActive;
    },
    toggleUser: (state) => {
      state.isUserActive = !state.isUserActive;
    },
    toggleChat: (state) => {
      state.isChatActive = !state.isChatActive;
    },
    toggleMore: (state) => {
      state.isMoreActive = !state.isMoreActive;
    },
  },
});

export const {
  setRoomId,
  setStatusMessage,
  setVideoStreams,
  setCurrentUser,
  toggleLock,
  toggleInfo,
  toggleUser,
  toggleChat,
  toggleMore,
} = meetingSlice.actions;

export default meetingSlice.reducer;