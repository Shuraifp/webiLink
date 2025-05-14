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
    
    const setupSocketListeners = () => {
      socketRef.emit("get-roomState", {roomId: state.roomId});
      socketRef.emit("fetch-raised-hands", { roomId: state.roomId });
      
      const anyHandler = (event: string, args: unknown) => {
        console.log(`Received event: ${event}`, args);
      };
      socketRef.onAny(anyHandler);
      
      const userListHandler = (userList: UserData[]) => {
        console.log(userList)
        dispatch({
          type: MeetingActionType.SET_USERS,
          payload: userList,
        });
      };
      socketRef.on("user-list", userListHandler);
      
      const roomStateFetchedHandler = ({ isQAEnabled }: RoomState) => {
        dispatch({ type: MeetingActionType.ENABLE_QA, payload: isQAEnabled });
      };
      socketRef.on("room-state-fetched", roomStateFetchedHandler);
      
      const chatMessageHandler = (message: ChatMessage) => {
        const userBreakoutRoom = state.breakoutRooms.find((room) =>
          room.participants.includes(state.currentUserId)
        );
        if (message.isDM) {
          if (
            message.userId === state.currentUserId ||
            message.targetUserId === state.currentUserId
          ) {
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
      };
      socketRef.on("chat-message", chatMessageHandler);
      
      const userConnectedHandler = ({ userId, username, avatar, isMuted, role }: UserData) => {
        if (userId !== state.currentUserId) {
          dispatch({
            type: MeetingActionType.ADD_USER,
            payload: { userId, username, avatar, isMuted, role },
          });
        }
      };
      socketRef.on("user-connected", userConnectedHandler);
      
      const userDisconnectedHandler = (userId: string) => {
        dispatch({
          type: MeetingActionType.REMOVE_USER,
          payload: userId,
        });
      };
      socketRef.on("user-disconnected", userDisconnectedHandler);
      
      // Poll handlers
      const pollsFetchedHandler = (polls: Poll[]) => {
        dispatch({ type: MeetingActionType.SET_POLLS, payload: polls });
      };
      socketRef.on("polls-fetched", pollsFetchedHandler);
      
      const pollCreatedHandler = (poll: Poll) => {
        dispatch({ type: MeetingActionType.ADD_POLL, payload: poll });
      };
      socketRef.on("poll-created", pollCreatedHandler);
      
      const pollLaunchedHandler = (pollId: number) => {
        dispatch({
          type: MeetingActionType.UPDATE_POLL,
          payload: { pollId, updates: { status: PollStatus.ACTIVE } },
        });
        socketRef.emit("poll-timer-start", { pollId });
      };
      socketRef.on("poll-launched", pollLaunchedHandler);
      
      const pollUpdatedHandler = ({
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
      };
      socketRef.on("poll-updated", pollUpdatedHandler);
      
      const pollEndedHandler = (pollId: number) => {
        dispatch({
          type: MeetingActionType.UPDATE_POLL,
          payload: { pollId, updates: { status: PollStatus.ENDED } },
        });
      };
      socketRef.on("poll-ended", pollEndedHandler);
      
      const pollDeletedHandler = (pollId: number) => {
        dispatch({ type: MeetingActionType.DELETE_POLL, payload: pollId });
      };
      socketRef.on("poll-deleted", pollDeletedHandler);

      // Q&A handlers
      const qaEnabledHandler = ({ isEnabled }: { isEnabled: boolean }) => {
        dispatch({ type: MeetingActionType.ENABLE_QA, payload: isEnabled });
      };
      socketRef.on("QA-Enabled", qaEnabledHandler);
      socketRef.on("QA-Disabled", qaEnabledHandler);
      
      const questionsFetchedHandler = (questions: Question[]) => {
        dispatch({ type: MeetingActionType.SET_QUESTIONS, payload: questions });
      };
      socketRef.on("questions-fetched", questionsFetchedHandler);
      
      const questionAskedHandler = (question: Question) => {
        dispatch({ type: MeetingActionType.ADD_QUESTION, payload: question });
      };
      socketRef.on("question-asked", questionAskedHandler);
      
      const questionUpvotedHandler = ({ questionId, votes }: { questionId: number; userId: string, votes: string[] }) => {
        dispatch({
          type: MeetingActionType.UPDATE_QUESTION,
          payload: {
            questionId,
            updates: {
              upvotes: votes
            },
          },
        });
      };
      socketRef.on("question-upvoted", questionUpvotedHandler);
      
      const questionPublishedHandler = (questionId: number) => {
        dispatch({
          type: MeetingActionType.UPDATE_QUESTION,
          payload: { questionId, updates: { isVisible: true } },
        });
      };
      socketRef.on("question-published", questionPublishedHandler);
      
      const questionDismissedHandler = (questionId: number) => {
        dispatch({
          type: MeetingActionType.DELETE_QUESTION,
          payload: questionId,
        });
      };
      socketRef.on("question-dismissed", questionDismissedHandler);
      
      const questionAnsweredHandler = ({
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
      };
      socketRef.on("question-answered", questionAnsweredHandler);
      
      const questionClosedHandler = (questionId: number) => {
        dispatch({
          type: MeetingActionType.UPDATE_QUESTION,
          payload: { questionId, updates: { status: QuestionStatus.CLOSED } },
        });
      };
      socketRef.on("question-closed", questionClosedHandler);

      // Timer handler
      const timerUpdateHandler = (timerState: TimerState) => {
        dispatch({
          type: MeetingActionType.SET_TIMER,
          payload: timerState,
        });
      };
      socketRef.on(SocketEvent.TIMER_UPDATE, timerUpdateHandler);

      // Hand raising handlers
      const handRaisedHandler = (data: { userId: string, username:string }) => {
        console.log(`Hand raised by: ${data.username}`);
        dispatch({ type: MeetingActionType.RAISE_HAND, payload: data });
      };
      socketRef.on("hand-raised", handRaisedHandler);

      const handLoweredHandler = (data: { userId: string, username:string }) => {
        console.log(`Hand lowered by: ${data.username}`);
        dispatch({ type: MeetingActionType.LOWER_HAND, payload: data });
      };
      socketRef.on("hand-lowered", handLoweredHandler);

      const raisedHandsFetchedHandler = (raisedHands: { userId: string, username:string }[]) => {
        console.log(`Fetched raised hands:`, raisedHands);
        dispatch({ type: MeetingActionType.SET_RAISED_HANDS, payload: raisedHands });
      };
      socketRef.on("raised-hands-fetched", raisedHandsFetchedHandler);

      return () => {
        socketRef.off("get-roomState");
        socketRef.off("user-list", userListHandler);
        socketRef.off("room-state-fetched", roomStateFetchedHandler);
        socketRef.off("chat-message", chatMessageHandler);
        socketRef.off("user-connected", userConnectedHandler);
        socketRef.off("user-disconnected", userDisconnectedHandler);
        socketRef.offAny(anyHandler);
        
        // Poll events
        socketRef.off("polls-fetched", pollsFetchedHandler);
        socketRef.off("poll-created", pollCreatedHandler);
        socketRef.off("poll-launched", pollLaunchedHandler);
        socketRef.off("poll-updated", pollUpdatedHandler);
        socketRef.off("poll-ended", pollEndedHandler);
        socketRef.off("poll-deleted", pollDeletedHandler);

        // Q&A events
        socketRef.off("QA-Enabled", qaEnabledHandler);
        socketRef.off("QA-Disabled", qaEnabledHandler);
        socketRef.off("questions-fetched", questionsFetchedHandler);
        socketRef.off("question-asked", questionAskedHandler);
        socketRef.off("question-upvoted", questionUpvotedHandler);
        socketRef.off("question-published", questionPublishedHandler);
        socketRef.off("question-dismissed", questionDismissedHandler);
        socketRef.off("question-answered", questionAnsweredHandler);
        socketRef.off("question-closed", questionClosedHandler);

        // Timer
        socketRef.off(SocketEvent.TIMER_UPDATE, timerUpdateHandler);

        // Hand raising events
        socketRef.off("hand-raised", handRaisedHandler);
        socketRef.off("hand-lowered", handLoweredHandler);
        socketRef.off("raised-hands-fetched", raisedHandsFetchedHandler);
      };
    };

    const cleanup = setupSocketListeners();
    
    return cleanup;
  }, [socketRef, dispatch, state.roomId, state.currentUserId, state.breakoutRooms]);

  return null;
}