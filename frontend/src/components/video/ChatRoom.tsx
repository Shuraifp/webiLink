"use client";

import { useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { UserData } from "@/types/type";
import MeetingRoomUI from "./components/MeetingRoomUi";
import { useReducedState } from "@/hooks/useReducedState";
import { Socket } from "socket.io-client";
import { Role, Status } from "@/types/chatRoom";
import { MeetingActionType } from "@/context/MeetingContext";
import { getSocket } from "@/lib/socket";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import axios from "axios";
import { userApiWithAuth } from "@/lib/api/axios";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";

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
  const router = useRouter();
  const { dispatch } = useReducedState();
  const { roomId } = useParams() as { roomId: string };
  const socket = useRef<Socket>(getSocket());
  const meetingContainerRef = useRef<HTMLDivElement | null>(null);
  const zpRef = useRef<InstanceType<typeof ZegoUIKitPrebuilt> | null>(null);
  const hasJoinedRef = useRef(false);

  useEffect(() => {
    dispatch({ type: MeetingActionType.SET_ROOM_ID, payload: roomId });
  }, [roomId, dispatch]);

  useEffect(() => {
    const checkingSubscriptionStatus = async () => {
      try {
        const res = await userApiWithAuth.get("/users/isPremium");
        if (res.data.data.isPremiumUser) {
          dispatch({
            type: MeetingActionType.SET_ISPREMIUM,
            payload: res.data.data.isPremiumUser,
          });
        }
      } catch (err) {
        if (axios.isAxiosError(err)) {
          toast.error(err?.response?.data.message);
        } else {
          toast.error("An unexpected error occurred.");
        }
      }
    };
    checkingSubscriptionStatus();
  }, [dispatch]);

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
    };

    const startStreaming = async () => {
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
      currentSocket.emit("leave-room", {
        roomId,
        userId: user.id,
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
          startStreaming();
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
        cleanup();
        router.replace("/host");
      });

      // currentSocket.on("host-joined", () => {
      //   if (
      //     state.status === Status.WAITING ||
      //     state.status === Status.LEFT ||
      //     state.status === Status.CONNECTING
      //   ) {
      //     currentSocket.emit("join-room", {
      //       roomId,
      //       userId: user.id,
      //       username: user.username,
      //       avatar: user.avatar,
      //       isMuted: false,
      //     });
      //   }
      // });

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

    currentSocket.on("host-left", () => {
      currentSocket.emit("leave-room", {
        roomId,
        userId: user.id,
      });
      router.replace("/host");
    });

    return () => {
      if (typeof window !== "undefined") {
        currentSocket.off("set-current-user");
        currentSocket.off("error");
        currentSocket.off("waiting-for-host");
        currentSocket.off("breakout-room-update");
        currentSocket.off("host-left");
        cleanup();
      }
    };
  }, [dispatch, user.avatar, user.id, user.username]);

  return (
    <MeetingRoomUI
      meetingContainerRef={
        meetingContainerRef as React.RefObject<HTMLDivElement>
      }
      socketRef={socket}
    />
  );
}
