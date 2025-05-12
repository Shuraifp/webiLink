"use client";

import { useEffect } from "react";
import { useReducedState } from "@/hooks/useReducedState";
import { Socket } from "socket.io-client";
import { MeetingActionType } from "@/lib/MeetingContext";
import {
  ChatMessage,
  Poll,
  PollStatus,
  Question,
  QuestionStatus,
  RoomState,
  SocketEvent,
  TimerState,
  UserData,
} from "@/types/chatRoom";

interface Props {
  socketRef: Socket | null;
}

export default function SocketManager({ socketRef }: Props) {
  const { state, dispatch } = useReducedState();

  useEffect(() => {
    if (!socketRef) return;
     
    
    
    socketRef.onAny((event, args) => {
      console.log(`Received event: ${event} ${args}`);
    });
    
    socketRef.emit("get-roomState", {roomId: state.roomId})
    socketRef.emit("fetch-raised-hands", { roomId: state.roomId });
    socketRef.on("user-list", (userList: UserData[]) => {
      dispatch({
        type: MeetingActionType.SET_USERS,
        payload: userList,
      });
    });
    socketRef.on(
      "room-state-fetched",
      ({  isQAEnabled }: RoomState) => {
        dispatch({ type: MeetingActionType.ENABLE_QA, payload: isQAEnabled });
      }
    );
    socketRef.on("chat-message", (message: ChatMessage) => {
      const userBreakoutRoom = state.breakoutRooms.find((room) =>
        room.participants.includes(state.currentUserId)
      );
      if (message.isDM) {
        if (
          message.userId === state.currentUserId ||
          message.targetUserId === state.currentUserId
        ) {
          console.log(message.isDM)
          dispatch({
            type: MeetingActionType.ADD_MESSAGE,
            payload: message,
          });
        }
      } else if (
        userBreakoutRoom &&
        message.breakoutRoomId === userBreakoutRoom.id
      ) {
        dispatch({
          type: MeetingActionType.ADD_MESSAGE,
          payload: message,
        });
      } else if (!userBreakoutRoom && !message.breakoutRoomId) {
        dispatch({
          type: MeetingActionType.ADD_MESSAGE,
          payload: message,
        });
      }
    });
    socketRef.on(
      "user-connected",
      ({ userId, username, avatar, isMuted, role }: UserData) => {
        if (userId !== state.currentUserId) {
          dispatch({
            type: MeetingActionType.ADD_USER,
            payload: { userId, username, avatar, isMuted, role },
          });
        }
      }
    );
    socketRef.on("user-disconnected", (userId: string) => {
      dispatch({
        type: MeetingActionType.REMOVE_USER,
        payload: userId,
      });
    });
    socketRef.on("polls-fetched", (polls: Poll[]) => {
      dispatch({ type: MeetingActionType.SET_POLLS, payload: polls });
    });
    socketRef.on("poll-created", (poll: Poll) => {
      dispatch({ type: MeetingActionType.ADD_POLL, payload: poll });
    });
    socketRef.on("poll-launched", (pollId: number) => {
      dispatch({
        type: MeetingActionType.UPDATE_POLL,
        payload: { pollId, updates: { status: PollStatus.ACTIVE } },
      });
      socketRef.emit("poll-timer-start", { pollId });
    });
    socketRef.on(
      "poll-updated",
      ({
        pollId,
        responses,
      }: {
        pollId: number;
        responses: { [userId: string]: string[] };
      }) => {
        dispatch({
          type: MeetingActionType.UPDATE_POLL,
          payload: { pollId, updates: { responses } },
        });
      }
    );
    socketRef.on("poll-ended", (pollId: number) => {
      dispatch({
        type: MeetingActionType.UPDATE_POLL,
        payload: { pollId, updates: { status: PollStatus.ENDED } },
      });
    });
    socketRef.on("poll-deleted", (pollId: number) => {
      dispatch({ type: MeetingActionType.DELETE_POLL, payload: pollId });
    });

    // Q&A events

    socketRef.on("QA-Enabled", ({ isEnabled }) => {
      dispatch({ type: MeetingActionType.ENABLE_QA, payload: isEnabled });
    });
    socketRef.on("QA-Disabled", ({ isEnabled }) => {
      dispatch({ type: MeetingActionType.ENABLE_QA, payload: isEnabled });
    });
    socketRef.on("questions-fetched", (questions: Question[]) => {
      dispatch({ type: MeetingActionType.SET_QUESTIONS, payload: questions });
    });
    socketRef.on("question-asked", (question: Question) => {
      dispatch({ type: MeetingActionType.ADD_QUESTION, payload: question });
    });
    socketRef.on(
      "question-upvoted",
      ({ questionId, votes }: { questionId: number; userId: string, votes: string[] }) => {
        dispatch({
          type: MeetingActionType.UPDATE_QUESTION,
          payload: {
            questionId,
            updates: {
              upvotes: votes
            },
          },
        });
      }
    );
    socketRef.on("question-published", (questionId: number) => {
      dispatch({
        type: MeetingActionType.UPDATE_QUESTION,
        payload: { questionId, updates: { isVisible: true } },
      });
    });
    socketRef.on("question-dismissed", (questionId: number) => {
      dispatch({
        type: MeetingActionType.DELETE_QUESTION,
        payload: questionId,
      });
    });
    socketRef.on(
      "question-answered",
      ({
        questionId,
        answer,
        answeredBy,
      }: {
        questionId: number;
        answer?: string;
        answeredBy: string;
      }) => {
        dispatch({
          type: MeetingActionType.UPDATE_QUESTION,
          payload: {
            questionId,
            updates: { answer, answeredBy, isAnswered: true },
          },
        });
      }
    );
    socketRef.on("question-closed", (questionId: number) => {
      dispatch({
        type: MeetingActionType.UPDATE_QUESTION,
        payload: { questionId, updates: { status: QuestionStatus.CLOSED } },
      });
    });

    // Timer 

    socketRef.on(SocketEvent.TIMER_UPDATE, (timerState: TimerState) => {
      dispatch({
        type: MeetingActionType.SET_TIMER,
        payload: timerState,
      });
    });

    // Rise hand
    socketRef.on("hand-raised", ({ userId }: { userId: string }) => {
      dispatch({ type: MeetingActionType.RAISE_HAND, payload: userId });
    });

    socketRef.on("hand-lowered", ({ userId }: { userId: string }) => {
      dispatch({ type: MeetingActionType.LOWER_HAND, payload: userId });
    });

    socketRef.on("raised-hands-fetched", (raisedHands: string[]) => {
      dispatch({ type: MeetingActionType.SET_RAISED_HANDS, payload: raisedHands });
    });

    return () => {
      socketRef.off("get-roomState")
      socketRef.off("user-list")
      socketRef.off("room-state-fetched")
      socketRef.off("chat-message")
      socketRef.off("user-connected")
      socketRef.off("user-disconnected")
      
      // Poll events
      socketRef.off("polls-fetched");
      socketRef.off("poll-created");
      socketRef.off("poll-launched");
      socketRef.off("poll-updated");
      socketRef.off("poll-ended");
      socketRef.off("poll-deleted");

      // Q&A events
      socketRef.off("QA-Enabled");
      socketRef.off("QA-Disabled");
      socketRef.off("questions-fetched");
      socketRef.off("question-asked");
      socketRef.off("question-upvoted");
      socketRef.off("question-published");
      socketRef.off("question-dismissed");
      socketRef.off("question-answered");
      socketRef.off("question-closed");

      // Timer
      socketRef.off(SocketEvent.TIMER_UPDATE)

      // Rise hand
      socketRef.off("hand-raised");
      socketRef.off("hand-lowered");
      socketRef.off("raised-hands-fetched");
    };
  }, [socketRef, dispatch,state.roomId, state.currentUserId]);

  return null;
}
