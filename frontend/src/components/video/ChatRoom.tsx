"use client";

import { useCallback, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import io, { Socket } from "socket.io-client";
import { UserData } from "@/types/type";
import MeetingRoomUI from "./components/MeetingRoomUi";
import { createPeerConnection } from "@/lib/WEBRTCutils";
import { MeetingActionType } from "@/lib/MeetingContext";
import { useReducedState } from "@/hooks/useReducedState";
import {
  SignalingData,
  Status,
  Role,
  VideoStream,
  UserConnectingData,
} from "@/types/chatRoom";

export default function MeetingRoom({ user }: { user: UserData }) {
  const { state, dispatch } = useReducedState();
  const { roomId } = useParams() as { roomId: string };
  const socketRef = useRef<Socket | null>(null);
  const peerConnections = useRef<{ [userId: string]: RTCPeerConnection }>({});
  const localStreamRef = useRef<MediaStream | null>(null);
  const processedOffers = useRef<Set<string>>(new Set());
  const videoStreamsRef = useRef<VideoStream[]>(state.videoStreams);

  useEffect(() => {
    videoStreamsRef.current = state.videoStreams;
  }, [state.videoStreams]);
  useEffect(() => {
    console.log("Component mounted with roomId:", roomId);
    if (roomId) {
      console.log("Dispatching immediate roomId update");
      dispatch({ type: MeetingActionType.SET_ROOM_ID, payload: roomId });
    }
  }, [])

  const connectToNewUser = useCallback(
    async (userData: SignalingData) => {
      if (!localStreamRef.current) return;
      if (peerConnections.current[userData.userId]) {
        console.log("Closing existing peer connection for", userData.userId);
        try {
          peerConnections.current[userData.userId].close();
        } catch (err) {
          console.error("Error closing existing peer connection:", err);
        }
        delete peerConnections.current[userData.userId];
      }
      const pc = createPeerConnection({
        userData,
        localStream: localStreamRef.current,
        socketRef,
        roomId,
        peerConnections,
        getCurrentStreams: () => videoStreamsRef.current,
        setVideoStreams: (streams: VideoStream[]) =>
          dispatch({
            type: MeetingActionType.SET_VIDEO_STREAMS,
            payload: streams,
          }),
      });
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socketRef.current?.emit("offer", {
        target: userData.socketId,
        offer,
        roomId,
      });
    },
    [roomId,dispatch]
  );

  useEffect(() => {
    if (!roomId || !user.id) return;
    
    dispatch({
      type: MeetingActionType.SET_CURRENT_USER,
      payload: {
        userId: user.id,
        username: user.username || "Anonymous",
        avatar: user.avatar || "",
        role: Role.JOINEE,
      },
    });

    dispatch({ type: MeetingActionType.SET_ROOM_ID, payload: roomId });
    
    if (state.status !== Status.ACTIVE) {
      dispatch({
        type: MeetingActionType.SET_STATUS,
        payload: Status.CONNECTING,
      });
      console.log("Status set to CONNECTING");
    } else {
      console.log("Status already ACTIVE, skipping CONNECTING");
    }

    const userData: UserConnectingData = {
      userId: user.id!,
      roomId,
      username: user.username || "Anonymous",
      avatar: user.avatar || "",
      isMuted: state.isMuted
    };

    socketRef.current = io(process.env.NEXT_PUBLIC_SERVER_URL!);
    socketRef.current.on("connect", () => {
      console.log("Socket connected:", socketRef.current?.id);
    });
    socketRef.current.on("connect_error", (err) => {
      console.error("Socket connect error:", err);
      dispatch({ type: MeetingActionType.SET_STATUS, payload: Status.ERROR });
      dispatch({
        type: MeetingActionType.SET_STATUS_MESSAGE,
        payload: "Connection error",
      });
    });

    socketRef.current?.on("room-status", ({ hostPresent }) => {
      console.log("Received room-status, hostPresent:", hostPresent);
      dispatch({
        type: MeetingActionType.SET_STATUS,
        payload: hostPresent ? Status.ACTIVE : Status.WAITING,
      });
      dispatch({
        type: MeetingActionType.SET_STATUS_MESSAGE,
        payload: hostPresent ? null : "Waiting for host to join...",
      });
    });

    socketRef.current?.on("host-joined", () => {
      console.log("Received host-joined, setting status to ACTIVE");
  
      dispatch({
        type: MeetingActionType.SET_STATUS_MESSAGE,
        payload: 'Host Joined back!',
      });
        socketRef.current?.emit("join-room", userData);
      
    });

    socketRef.current?.on("waiting-for-host", () => {
      console.log("Received waiting-for-host, setting status to WAITING");
      dispatch({
        type: MeetingActionType.SET_STATUS,
        payload: Status.WAITING,
      });
      dispatch({
        type: MeetingActionType.SET_STATUS_MESSAGE,
        payload: "Waiting for host to join...",
      });
    });

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        localStreamRef.current = stream;
        console.log("Local stream tracks:", stream.getTracks());
        const userStream: VideoStream = {
          socketId: "",
          userId: user.id!,
          username: user.username || "Anonymous",
          avatar: user.avatar || "",
          stream,
          role: Role.JOINEE,
          isMuted: true,
        };
        dispatch({
          type: MeetingActionType.SET_VIDEO_STREAMS,
          payload: videoStreamsRef.current.some((s) => s.userId === user.id)
            ? videoStreamsRef.current.map((s) =>
                s.userId === user.id ? userStream : s
              )
            : [...videoStreamsRef.current, userStream],
        });
        dispatch({
          type: MeetingActionType.SET_STATUS,
          payload: Status.ACTIVE,
        });
        console.log("Status set to ACTIVE after getUserMedia");

        socketRef.current?.emit("join-room", userData);

        socketRef.current?.on("host-status", (socketId) => {
          console.log('host joined ',socketId)
          dispatch({
            type: MeetingActionType.SET_CURRENT_USER,
            payload: {
              userId: user.id!,
              avatar: user.avatar || "",
              username: user.username || "Anonymous",
              role: Role.HOST,
            },
          });
          dispatch({ type: MeetingActionType.SET_ROOM_ID, payload: roomId });
          dispatch({
            type: MeetingActionType.SET_STATUS,
            payload: Status.ACTIVE,
          });
          dispatch({
            type: MeetingActionType.SET_STATUS_MESSAGE,
            payload: "You are the host!",
          });
        });

        socketRef.current?.on("host-left", () => {
          console.log("Received host-left, setting status to WAITING");
          dispatch({
            type: MeetingActionType.SET_STATUS,
            payload: Status.WAITING,
          });
          dispatch({
            type: MeetingActionType.SET_STATUS_MESSAGE,
            payload: "Host has left the meeting",
          });
          Object.values(peerConnections.current).forEach((pc) => pc.close());
          peerConnections.current = {};
          dispatch({
            type: MeetingActionType.SET_VIDEO_STREAMS,
            payload: videoStreamsRef.current.filter((s) => s.userId === user.id),
          });
        });

        socketRef.current?.on("user-connected", (data: SignalingData) => {
          console.log("Processing user-connected, status:", state.status);
          if (state.status === Status.ERROR) {
            console.log("User-connected skipped: status is ERROR");
            return;
          }
          dispatch({
            type: MeetingActionType.SET_STATUS_MESSAGE,
            payload: `${data.username} joined`,
          });
          dispatch({
            type: MeetingActionType.SET_STATUS,
            payload: Status.ACTIVE,
          });
          console.log("user-connected", data.username);
          connectToNewUser(data);

          // socketRef.current?.emit("ready-for-stream", {
          //   userId: user.id,
          //   roomId,
          //   username: user.username || "Anonymous",
          //   avatar: user.avatar || "",
          //   socketId: socketRef.current?.id,
          // });
        });

        socketRef.current?.on("offer", async (signalData: SignalingData) => {
          // if (state.status === Status.WAITING) {
          //   console.log("Offer skipped: status is not waiting", state.status);
          //   return;
          // }
          const offerKey = `${signalData.userId}-${signalData.socketId}`;
          if (processedOffers.current.has(offerKey)) {
            console.log(`Ignoring duplicate offer from ${signalData.userId}`);
            return;
          }
          processedOffers.current.add(offerKey);
          let pc = peerConnections.current[signalData.userId];
          if (pc && pc.signalingState !== "stable") {
            console.log(
              `Closing existing peer connection for ${signalData.userId}: invalid state (${pc.signalingState})`
            );
            try {
              pc.close();
            } catch (err) {
              console.error("Error closing peer connection:", err);
            }
            delete peerConnections.current[signalData.userId];
          }
          if (!pc) {
            pc = createPeerConnection({
              userData: signalData,
              localStream: localStreamRef.current!,
              socketRef,
              roomId,
              peerConnections,
              getCurrentStreams: () => videoStreamsRef.current,
              setVideoStreams: (streams: VideoStream[]) =>
                dispatch({
                  type: MeetingActionType.SET_VIDEO_STREAMS,
                  payload: streams,
                }),
            });
          }
          try {
            console.log("Offer received for", signalData.username);
            if (pc.signalingState !== "stable") {
              throw new Error(
                `Cannot process offer: invalid signaling state (${pc.signalingState})`
              );
            }
            await pc.setRemoteDescription(
              new RTCSessionDescription(signalData.offer!)
            );
            console.log("Offer set for", signalData.userId);
            // if (pc.signalingState !== "have-remote-offer") {
            //   throw new Error(
            //     `Cannot create answer: invalid signaling state (${pc.signalingState})`
            //   );
            // }
            const answer = await pc.createAnswer();
            console.log("Answer created:", answer);
            await pc.setLocalDescription(answer);
            socketRef.current?.emit("answer", {
              target: signalData.socketId,
              answer,
              roomId,
              userId: user.id,
              role: state.currentUserRole,
            });
          } catch (error) {
            dispatch({
              type: MeetingActionType.SET_STATUS,
              payload: Status.ERROR,
            });
            console.error("Error processing offer:", error);
            try {
              pc.close();
            } catch (err) {
              console.error("Error closing peer connection:", err);
            }
            delete peerConnections.current[signalData.userId];
          } finally {
            processedOffers.current.delete(offerKey);
          }
        });

        socketRef.current?.on("answer", (data: SignalingData) => {
          // if (state.status === Status.WAITING) {
          //   console.log("Offer skipped: status is not waiting", state.status);
          //   return;
          // }
          if (!data.answer) {
            console.error("Answer missing in data", data);
            return;
          }
          const pc = peerConnections.current[data.userId];
          if (pc) {
            console.log("Answer received for", data.username);
            pc.setRemoteDescription(
              new RTCSessionDescription(data.answer!)
            ).catch((err) => {
              dispatch({
                type: MeetingActionType.SET_STATUS,
                payload: Status.ERROR,
              });
              console.error("Error setting answer: why man", err)
            });
          } else {
            console.warn("No peer connection found for", data.userId);
          }
        });

        socketRef.current?.on("ice-candidate", (data: SignalingData) => {
          // if (state.status === Status.WAITING) {
          //   console.log("Offer skipped: status is not waiting", state.status);
          //   return;
          // }
          const pc = peerConnections.current[data.userId];
          if (pc) {
            console.log("Adding ICE candidate for", data.userId);
            pc.addIceCandidate(new RTCIceCandidate(data.candidate!)).catch(
              (err) => {
                dispatch({
                  type: MeetingActionType.SET_STATUS,
                  payload: Status.ERROR,
                });
                console.error("Error adding ICE candidate:", err)
              }
            );
          }
        });

        socketRef.current?.on("user-disconnected", (userId: string) => {
          console.log("user-disconnected", userId);
          if (peerConnections.current[userId]) {
            peerConnections.current[userId].close();
            delete peerConnections.current[userId];
            dispatch({
              type: MeetingActionType.SET_VIDEO_STREAMS,
              payload: videoStreamsRef.current.filter((vs) => vs.userId !== userId),
            });
          }
        });

        socketRef.current?.on(
          "mute-status",
          ({ userId, isMuted }: { userId: string; isMuted: boolean }) => {
            dispatch({
              type: MeetingActionType.TOGGLE_MUTE,
              payload: { userId, isMuted },
            });
          }
        );

        socketRef.current?.on("error", (error: { message: string }) => {
          console.error("Socket error:", error);
          dispatch({
            type: MeetingActionType.SET_STATUS,
            payload: Status.ERROR,
          });
          dispatch({
            type: MeetingActionType.SET_STATUS_MESSAGE,
            payload: `Error: ${error.message}`,
          });
        });


        socketRef.current?.on("ready-for-stream", (data: SignalingData) => {
          if (data.userId !== user.id) {
            console.log(`Received ready-for-stream from ${data.username}`);
            connectToNewUser(data);
          }
        });
        
      })
      .catch((error) => {
        console.error("Media device error:", error);
        dispatch({ type: MeetingActionType.SET_STATUS, payload: Status.ERROR });
        dispatch({
          type: MeetingActionType.SET_STATUS_MESSAGE,
          payload: `Media error: ${error.message}`,
        });
      });

    return () => {
      if (socketRef.current) {
        socketRef.current.emit("leave-room", { roomId, userId: user.id });
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      Object.values(peerConnections.current).forEach((pc) => pc.close());
      peerConnections.current = {};
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
        localStreamRef.current = null;
      }
    };
  }, []);


  return (
    <MeetingRoomUI
      socketRef={socketRef.current || null}
      videoStreams={state.videoStreams}
      userId={state.currentUserId}
    />
  );
}
