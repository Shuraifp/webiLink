"use client";

import { useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { UserData } from "@/types/type";
import MeetingRoomUI from "./components/MeetingRoomUi";
import { useReducedState } from "@/hooks/useReducedState";
import { Socket } from "socket.io-client";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { Status } from "@/types/chatRoom";
import { MeetingActionType } from "@/lib/MeetingContext";
import { disconnectSocket, getSocket } from "@/lib/socket";

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
  const { dispatch } = useReducedState();
  const { roomId } = useParams() as { roomId: string };
  const socket = useRef<Socket>(getSocket());
  const meetingContainerRef = useRef<HTMLDivElement | null>(null);
  const zpRef = useRef<ZegoUIKitPrebuilt | null>(null);

  useEffect(() => {
    dispatch({ type: MeetingActionType.SET_ROOM_ID, payload: roomId });
  }, [roomId, dispatch]);

  useEffect(() => {
    const joinRoom = async () => {
      console.log("Emitting join-room", { roomId, userId: user.id });
      socket.current.emit("join-room", {
        roomId,
        userId: user.id,
        username: user.username,
        avatar: user.avatar,
        isMuted: false,
      });

      const appID = process.env.NEXT_PUBLIC_ZEGO_APP_ID;
      const serverSecret = process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET;
      if (!appID || !serverSecret) {
        console.error("Zego App ID or Server Secret is not defined");
        return;
      }

      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        Number(appID),
        serverSecret,
        roomId,
        randomID(5),
        user.username!
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
      });

      return () => {
        disconnectSocket();
        if (zpRef.current) zpRef.current.hangUp();
      };
    };

    if (socket.current.connected) {
      joinRoom();
    } else {
      socket.current.on("connect", joinRoom);
    }

    socket.current.on(
      "user-connected",
      ({ userId: remoteUserId, username, isMuted, avatar }) => {
        dispatch({
          type: MeetingActionType.ADD_STREAM,
          payload: {
            userId: remoteUserId,
            username,
            stream: null,
            isMuted,
            avatar,
          },
        });
      }
    );

    socket.current.on("user-disconnected", (remoteUserId: string) => {
      dispatch({
        type: MeetingActionType.REMOVE_STREAM,
        payload: remoteUserId,
      });
    });

    socket.current.on("mute-status", ({ userId, isMuted }) => {
      dispatch({
        type: MeetingActionType.TOGGLE_MUTE,
        payload: { userId, isMuted },
      });
    });

    socket.current.on("set-status", (status: Status) => {
      dispatch({ type: MeetingActionType.SET_STATUS, payload: status });
    });

    socket.current.on(
      "set-current-user",
      ({ userId, username, avatar, role }) => {
        dispatch({
          type: MeetingActionType.SET_CURRENT_USER,
          payload: { userId, username, avatar, role },
        });
      }
    );

    socket.current.on("error", ({ message }) => {
      dispatch({ type: MeetingActionType.SET_STATUS, payload: Status.ERROR });
      dispatch({
        type: MeetingActionType.SET_STATUS_MESSAGE,
        payload: message,
      });
    });

    socket.current.on("waiting-for-host", () => {
      dispatch({
        type: MeetingActionType.SET_STATUS,
        payload: Status.WAITING,
      });
    });

    socket.current.on("breakout-room-update", ({ breakoutRooms, mainRoomParticipants }) => {
      dispatch({
        type: MeetingActionType.UPDATE_BREAKOUT_ROOMS,
        payload: { breakoutRooms, mainRoomParticipants },
      });
    });

    return () => {
      socket.current.off("user-connected");
      socket.current.off("user-disconnected");
      socket.current.off("mute-status");
      socket.current.off("set-status");
      socket.current.off("set-current-user");
      socket.current.off("error");
      socket.current.off("waiting-for-host");
      socket.current.off("breakout-room-update");
    };
  }, [roomId, user, dispatch]);

  return (
    <MeetingRoomUI
      meetingContainerRef={meetingContainerRef as React.RefObject<HTMLDivElement>}
      socketRef={socket.current}
    />
  );
}