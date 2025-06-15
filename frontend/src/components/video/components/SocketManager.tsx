  "use client";

  import { useEffect } from "react";
  import { useReducedState } from "@/hooks/useReducedState";
  import { Socket } from "socket.io-client";
  import { MeetingActionType, PanelType } from "@/context/MeetingContext";
  import {
    Caption,
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
      
      const anyHandler = (event: string, args: unknown) => {
        console.log(`Received event: ${event}`, args);
      };
      const userListHandler = (userList: UserData[]) => {
        dispatch({
          type: MeetingActionType.SET_USERS,
          payload: userList,
        });
      };
      const roomStateFetchedHandler = ({ isQAEnabled, captions }: RoomState) => {
        dispatch({ type: MeetingActionType.ENABLE_QA, payload: isQAEnabled });
        dispatch({ type: MeetingActionType.SET_CAPTIONS, payload: captions });
      };
      const chatMessageHandler = (message: ChatMessage) => {
        const userBreakoutRoom = state.breakoutRooms.find((room) =>
          room.participants.includes(state.currentUserId)
        );
        let shouldAddMessage = false;

      if (message.isDM) {
        if (
          message.userId === state.currentUserId ||
          message.targetUserId === state.currentUserId
        ) {
          shouldAddMessage = true;
        }
      } else if (
        userBreakoutRoom &&
        message.breakoutRoomId === userBreakoutRoom.id
      ) {
        shouldAddMessage = true;
      } else if (!userBreakoutRoom && !message.breakoutRoomId) {
        shouldAddMessage = true;
      }

      if (shouldAddMessage) {
        dispatch({
          type: MeetingActionType.ADD_MESSAGE,
          payload: message,
        });
        if (state.activePanel !== PanelType.CHAT) {
          dispatch({ type: MeetingActionType.INCREMENT_UNREAD_MESSAGES });
        }
      }
      };
      const userConnectedHandler = ({ userId, username, avatar, isMuted, role }: UserData) => {
        if (userId !== state.currentUserId) {
          dispatch({
            type: MeetingActionType.ADD_USER,
            payload: { userId, username, avatar, isMuted, role },
          });
        }
      };
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
      const userDisconnectedHandler = (userId: string) => {
        dispatch({
          type: MeetingActionType.REMOVE_USER,
          payload: userId,
        });
      };
      const pollsFetchedHandler = (polls: Poll[]) => {
        dispatch({ type: MeetingActionType.SET_POLLS, payload: polls });
      };
      const pollCreatedHandler = (poll: Poll) => {
        dispatch({ type: MeetingActionType.ADD_POLL, payload: poll });
      }; 
      const pollDeletedHandler = (pollId: number) => {
        dispatch({ type: MeetingActionType.DELETE_POLL, payload: pollId });
      };
      const pollEndedHandler = (pollId: number) => {
        dispatch({
          type: MeetingActionType.UPDATE_POLL,
          payload: { pollId, updates: { status: PollStatus.ENDED } },
        });
      };
      const qaEnabledHandler = ({ isEnabled }: { isEnabled: boolean }) => {
        dispatch({ type: MeetingActionType.ENABLE_QA, payload: isEnabled });
      };
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
      const questionAskedHandler = (question: Question) => {
        dispatch({ type: MeetingActionType.ADD_QUESTION, payload: question });
      };
      const questionsFetchedHandler = (questions: Question[]) => {
        dispatch({ type: MeetingActionType.SET_QUESTIONS, payload: questions });
      };
      const pollLaunchedHandler = (pollId: number) => {
        dispatch({
          type: MeetingActionType.UPDATE_POLL,
          payload: { pollId, updates: { status: PollStatus.ACTIVE } },
        });
        socketRef.emit("poll-timer-start", { pollId });
      };
      const questionPublishedHandler = (questionId: number) => {
        dispatch({
          type: MeetingActionType.UPDATE_QUESTION,
          payload: { questionId, updates: { isVisible: true } },
        });
      };
      const questionDismissedHandler = (questionId: number) => {
        dispatch({
          type: MeetingActionType.DELETE_QUESTION,
          payload: questionId,
        });
      };
      const questionClosedHandler = (questionId: number) => {
        dispatch({
          type: MeetingActionType.UPDATE_QUESTION,
          payload: { questionId, updates: { status: QuestionStatus.CLOSED } },
        });
      };
      const timerUpdateHandler = (timerState: TimerState) => {
        dispatch({
          type: MeetingActionType.SET_TIMER,
          payload: timerState,
        });
      };
      const handRaisedHandler = (data: { userId: string, username:string }) => {
        console.log(`Hand raised by: ${data.username}`);
        dispatch({ type: MeetingActionType.RAISE_HAND, payload: data });
      };
      const handLoweredHandler = (data: { userId: string, username:string }) => {
        console.log(`Hand lowered by: ${data.username}`);
        dispatch({ type: MeetingActionType.LOWER_HAND, payload: data });
      };
      const raisedHandsFetchedHandler = (raisedHands: { userId: string, username:string }[]) => {
        console.log(`Fetched raised hands:`, raisedHands);
        dispatch({ type: MeetingActionType.SET_RAISED_HANDS, payload: raisedHands });
      };
      const captionHandler = (caption: Caption) => {
          dispatch({
            type: MeetingActionType.ADD_CAPTION,
            payload: caption,
          });
        };
        
      
      const setupSocketListeners = () => {
        socketRef.emit("get-roomState", {roomId: state.roomId});
        socketRef.emit("fetch-raised-hands", { roomId: state.roomId });
        
        socketRef.onAny(anyHandler);
        
        socketRef.on("user-list", userListHandler);
        socketRef.on("room-state-fetched", roomStateFetchedHandler);
        socketRef.on("chat-message", chatMessageHandler); 
        socketRef.on("user-connected", userConnectedHandler);
        socketRef.on("user-disconnected", userDisconnectedHandler);

        // Caption handler
        socketRef.on("caption", captionHandler);
        
        // Poll handlers
        socketRef.on("polls-fetched", pollsFetchedHandler);
        socketRef.on("poll-created", pollCreatedHandler);
        socketRef.on("poll-launched", pollLaunchedHandler);
        socketRef.on("poll-updated", pollUpdatedHandler);
        socketRef.on("poll-ended", pollEndedHandler);
        socketRef.on("poll-deleted", pollDeletedHandler);

        // Q&A handlers
        socketRef.on("QA-Enabled", qaEnabledHandler);
        socketRef.on("QA-Disabled", qaEnabledHandler);
        socketRef.on("questions-fetched", questionsFetchedHandler);
        socketRef.on("question-asked", questionAskedHandler);
        socketRef.on("question-upvoted", questionUpvotedHandler);
        socketRef.on("question-published", questionPublishedHandler);
        socketRef.on("question-dismissed", questionDismissedHandler);
        socketRef.on("question-answered", questionAnsweredHandler);
        socketRef.on("question-closed", questionClosedHandler);

        // Timer handler
        socketRef.on(SocketEvent.TIMER_UPDATE, timerUpdateHandler);

        // Hand raising handlers
        socketRef.on("hand-raised", handRaisedHandler);
        socketRef.on("hand-lowered", handLoweredHandler);
        socketRef.on("raised-hands-fetched", raisedHandsFetchedHandler);

        return () => {
          socketRef.off("get-roomState");
          socketRef.off("user-list", userListHandler);
          socketRef.off("room-state-fetched", roomStateFetchedHandler);
          socketRef.off("chat-message", chatMessageHandler);
          socketRef.off("user-connected", userConnectedHandler);
          socketRef.off("user-disconnected", userDisconnectedHandler);
          socketRef.offAny(anyHandler);

          // Caption events
          socketRef.off("caption", captionHandler);
          
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