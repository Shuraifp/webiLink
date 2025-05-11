"use client";

import { useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { UserData } from "@/types/type";
import MeetingRoomUI from "./components/MeetingRoomUi";
import { useReducedState } from "@/hooks/useReducedState";
import { Socket } from "socket.io-client";
import { Role, Status } from "@/types/chatRoom";
import { MeetingActionType } from "@/lib/MeetingContext";
import { disconnectSocket, getSocket } from "@/lib/socket";
import toast from "react-hot-toast";

function randomID(len: number) {
  let result = "";
  const chars =
    "12345qwertyuiopasdfgh67890jklmnbvcxzMNBVCZXASDQWERTYHGFUIOLKJP";
  const maxPos = chars.length;
  len = len || 5;
  for (let i = 0; i < len; i++) {
    result += chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return result;
}

export default function MeetingRoom({ user }: { user: UserData }) {
  const { state, dispatch } = useReducedState();
  const { roomId } = useParams() as { roomId: string };
  const socket = useRef<Socket>(getSocket());
  const meetingContainerRef = useRef<HTMLDivElement | null>(null);
  const zpRef = useRef<any>(null);
  const hasJoinedRef = useRef(false);

  console.log(state);
  useEffect(() => {
    dispatch({ type: MeetingActionType.SET_ROOM_ID, payload: roomId });
  }, [roomId, dispatch]);

  useEffect(() => {
    const currentSocket = socket.current;

    const joinRoom = async () => {
      if (hasJoinedRef.current && zpRef.current) {
        return;
      }

      if (zpRef.current) {
        try {
          zpRef.current.hangUp?.();
          zpRef.current.destroy?.();
        } catch {}
        zpRef.current = null;
      }
      hasJoinedRef.current = false;

      currentSocket.emit("join-room", {
        roomId,
        userId: user.id,
        username: user.username,
        avatar: user.avatar,
        isMuted: false,
      });

      const appID = process.env.NEXT_PUBLIC_ZEGO_APP_ID;
      const serverSecret = process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET;
      if (!appID || !serverSecret) {
        return;
      }

      const { ZegoUIKitPrebuilt } = await import(
        "@zegocloud/zego-uikit-prebuilt"
      );

      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        Number(appID),
        serverSecret,
        roomId,
        randomID(5),
        user.username || "Guest"
      );

      zpRef.current = ZegoUIKitPrebuilt.create(kitToken);
      zpRef.current.joinRoom({
        container: meetingContainerRef.current!,
        scenario: {
          mode: ZegoUIKitPrebuilt.VideoConference,
        },
        showTextChat: false,
        showRoomDetailsButton: false,
        showUserList: false,
        showPreJoinView: false,
        onJoinRoom: () => {
          hasJoinedRef.current = true;
          console.log("Successfully joined Zego room");
        },
        onLeaveRoom: () => {
          hasJoinedRef.current = false;
          console.log("Left Zego room");
        },
      });
    };

    const cleanup = () => {
      if (zpRef.current) {
        zpRef.current.hangUp?.();
        zpRef.current.destroy?.();
        zpRef.current = null;
        console.log("Zego room hung up and destroyed");
      }
      disconnectSocket();
      hasJoinedRef.current = false;
      if (meetingContainerRef.current) {
        meetingContainerRef.current.innerHTML = "";
      }
      meetingContainerRef.current = null;
      dispatch({
        type: MeetingActionType.SET_STATUS,
        payload: Status.LEFT,
      });
      dispatch({
        type: MeetingActionType.SET_CURRENT_USER,
        payload: { userId: "", username: "", avatar: "", role: Role.JOINEE },
      });
    };

    if (typeof window !== "undefined") {
      if (!currentSocket.connected) {
        currentSocket.connect();
      }
      joinRoom();

      currentSocket.on(
        "set-current-user",
        ({ userId, username, avatar, role }) => {
          dispatch({
            type: MeetingActionType.SET_CURRENT_USER,
            payload: { userId, username, avatar, role },
          });
          dispatch({
            type: MeetingActionType.SET_STATUS,
            payload: Status.ACTIVE,
          });
        }
      );

      currentSocket.on("error", ({ message }) => {
        toast.error(message);
        dispatch({ type: MeetingActionType.SET_STATUS, payload: Status.ERROR });
      });

      currentSocket.on("waiting-for-host", () => {
        dispatch({
          type: MeetingActionType.SET_STATUS,
          payload: Status.WAITING,
        });
      });

      currentSocket.onAny((event, args) => {
        console.log(`Received event: ${event} ${args}`);
      });

      currentSocket.on("host-joined", () => {
        if (state.status === Status.WAITING || state.status === Status.LEFT) {
          console.log("Reconnecting after host joined", {
            roomId,
            userId: user.id,
          });
          currentSocket.emit("join-room", {
            roomId,
            userId: user.id,
            username: user.username,
            avatar: user.avatar,
            isMuted: false,
          });
        }
      });

      currentSocket.on(
        "breakout-room-update",
        ({ breakoutRooms, mainRoomParticipants }) => {
          dispatch({
            type: MeetingActionType.UPDATE_BREAKOUT_ROOMS,
            payload: { breakoutRooms, mainRoomParticipants },
          });
        }
      );
    }

    currentSocket.on("user-left", (userId: string) => {
        console.log(`User ${userId} left the room`);
      });

      currentSocket.on("user-disconnected", (userId: string) => {
        console.log(`User ${userId} disconnected from the room`);
      });

    currentSocket.on("host-left", () => {
      console.log("Host has left the meeting. You will be disconnected.");
      currentSocket.emit("leave-room", {
        roomId,
        userId: user.id,
      });
      cleanup();
    });

    return () => {
      if (typeof window !== "undefined") {
        currentSocket.off("set-current-user");
        currentSocket.off("error");
        currentSocket.off("host-joined");
        currentSocket.off("waiting-for-host");
        currentSocket.off("breakout-room-update");
        currentSocket.off("host-left");
        cleanup();
      }
    };
  }, [dispatch, roomId, user.avatar, user.id, user.username]);

  return (
    <MeetingRoomUI
      meetingContainerRef={
        meetingContainerRef as React.RefObject<HTMLDivElement>
      }
      socketRef={socket}
    />
  );
}
