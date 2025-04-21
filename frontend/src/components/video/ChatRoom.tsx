"use client";

import { useCallback, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { UserData } from "@/types/type";
import MeetingRoomUI from "./components/MeetingRoomUi";
import { useReducedState } from "@/hooks/useReducedState";
import { Socket } from "socket.io-client";
import { Device } from "mediasoup-client";
import { Transport } from "mediasoup-client/types";
import {
  ConsumerDetails,
  Status,
  StreamMap,
  TransportDetails,
  VideoStream,
} from "@/types/chatRoom";
import { MeetingActionType } from "@/lib/MeetingContext";
import { disconnectSocket, getSocket } from "@/lib/socket";

export default function MeetingRoom({ user }: { user: UserData }) {
  const { state, dispatch } = useReducedState();
  const { roomId } = useParams() as { roomId: string };
  const socket = useRef<Socket>(getSocket());
  const device = useRef<Device | null>(null);
  const sendTransport = useRef<Transport | null>(null);
  const recvTransport = useRef<Transport | null>(null);
  const streams = useRef<StreamMap>({
    [String(user.id)]: {
      userId: String(user.id),
      username: String(user.username),
      stream: null,
      isMuted: false,
    },
  });
  const hasJoined = useRef(false);
  const isProcessingTransports = useRef(false);

  const updateStreams = useCallback(() => {
    const validStreams = Object.values(streams.current).filter(
      (streamInfo): streamInfo is VideoStream => streamInfo?.stream !== null
    );
    dispatch({
      type: MeetingActionType.SET_VIDEO_STREAMS,
      payload: validStreams,
    });
  }, [dispatch]);

  useEffect(
    () => {
      const joinRoom = () => {
        // if (hasJoined.current) {
        //   console.log("Already joined, skipping join-room");
        //   return;
        // }
        console.log("Emitting join-room", { roomId, userId: user.id });
        socket.current.emit("join-room", {
          roomId,
          userId: user.id,
          username: user.username,
          avatar: user.avatar,
          isMuted: false,
        });
        hasJoined.current = true;
      };

      if (socket.current.connected) {
        joinRoom();
      } else {
        socket.current.on("connect", joinRoom);
      }

      socket.current.on(
        "sfu-transports",
        async ({
          sendTransportDetails,
          recvTransportDetails,
        }: {
          sendTransportDetails: TransportDetails;
          recvTransportDetails: TransportDetails;
        }) => {
          if (isProcessingTransports.current) {
            console.log("Already processing sfu-transports, skipping");
            return;
          }
          isProcessingTransports.current = true;
          try {
            console.log("Received SFU transports", sendTransportDetails);
            if (!device.current) {
              device.current = new Device();
              await device.current.load({
                routerRtpCapabilities: sendTransportDetails.rtpCapabilities,
              });
            }
            if (!sendTransport.current) {
              console.log(device.current);
              console.log("hi" + device.current.loaded);
              sendTransport.current = device.current.createSendTransport({
                id: sendTransportDetails.id,
                iceParameters: sendTransportDetails.iceParameters,
                iceCandidates: sendTransportDetails.iceCandidates,
                dtlsParameters: sendTransportDetails.dtlsParameters,
                iceServers: [
                  {
                    urls:
                      process.env.NEXT_PUBLIC_STUN_URL ||
                      "stun:stun.l.google.com:19302",
                  },
                ],
              });
              console.log(
                "sendTransport created, initial state:",
                sendTransport.current.connectionState
              );
            }

            if (!recvTransport.current) {
              recvTransport.current = device.current.createRecvTransport({
                id: recvTransportDetails.id,
                iceParameters: recvTransportDetails.iceParameters,
                iceCandidates: recvTransportDetails.iceCandidates,
                dtlsParameters: recvTransportDetails.dtlsParameters,
                iceServers: [
                  {
                    urls:
                      process.env.NEXT_PUBLIC_STUN_URL ||
                      "stun:stun.l.google.com:19302",
                  },
                ],
              });
            }

            console.log("sendTransport............", sendTransport.current);
            console.log(
              "Has connect handler?",
              sendTransport.current?.listenerCount("connect")
            );
            console.log(
              "Initial sendTransport state:",
              sendTransport.current?.connectionState
            );

            sendTransport.current.on(
              "connect",
              ({ dtlsParameters }, callback) => {
                console.log("transport connect attempt");
                socket.current?.emit("connect-transport", {
                  dtlsParameters,
                  type: "send",
                });
                callback();
              }
            );

            sendTransport.current.on("connectionstatechange", (state) => {
              console.log("sendTransport state:", state);
            });

            sendTransport.current.on("icecandidateerror", (candidate) => {
              console.log("ICE candidate error:", candidate);
            });
            sendTransport.current.on("icecandidate" as any, (candidate) => {
              console.log("ICE candidate error:", candidate);
            });
            
            recvTransport.current.on(
              "connect",
              ({ dtlsParameters }, callback) => {
                socket.current?.emit("connect-transport", {
                  dtlsParameters,
                  type: "recv",
                });
                callback();
              }
            );

            sendTransport.current.on(
              "produce",
              async ({ kind, rtpParameters }, callback) => {
                socket.current?.emit(
                  "produce",
                  { kind, rtpParameters },
                  (data: { id: string }) => callback({ id: data.id })
                );
              }
            );

            Promise.all([
              new Promise((resolve) =>
                sendTransport.current?.on("connect", resolve)
              ),
              new Promise((resolve) =>
                recvTransport.current?.on("connect", resolve)
              ),
            ]).then(() => {
              navigator.mediaDevices
                .getUserMedia({ video: true, audio: true })
                .then((stream) => {
                  const videoTrack = stream.getVideoTracks()[0];
                  const audioTrack = stream.getAudioTracks()[0];
                  if (videoTrack)
                    sendTransport.current?.produce({ track: videoTrack });
                  if (audioTrack)
                    sendTransport.current?.produce({ track: audioTrack });
                  streams.current[user.id!]!.stream = stream;
                  updateStreams();
                  dispatch({
                    type: MeetingActionType.SET_STATUS,
                    payload: Status.ACTIVE,
                  });
                })
                .catch((err) => {
                  console.error("Media error:", err);
                  let message = "Failed to access camera/microphone";
                  if (err.name === "NotAllowedError") {
                    message = "Camera/microphone access denied by user";
                  } else if (err.name === "NotFoundError") {
                    message = "No camera or microphone found";
                  }
                  dispatch({
                    type: MeetingActionType.SET_STATUS,
                    payload: Status.ERROR,
                  });
                  dispatch({
                    type: MeetingActionType.SET_STATUS_MESSAGE,
                    payload: message,
                  });
                });
            });
          } catch (err) {
            console.error("Transport setup error:", err);
            dispatch({
              type: MeetingActionType.SET_STATUS,
              payload: Status.ERROR,
            });
          } finally {
            isProcessingTransports.current = false;
          }
        }
      );

      socket.current.on(
        "new-producer",
        async ({ producerId, userId: remoteUserId, username, isMuted }) => {
          socket.current?.emit(
            "consume",
            { producerId, rtpCapabilities: device.current!.rtpCapabilities },
            async (consumerDetails: ConsumerDetails) => {
              const consumer = await recvTransport.current?.consume(
                consumerDetails
              );
              if (consumer) {
                const stream = new MediaStream([consumer.track]);
                streams.current[remoteUserId] = {
                  userId: remoteUserId,
                  username,
                  stream,
                  isMuted,
                };
                consumer.resume();
                console.log("consumed stream", consumer);
                updateStreams();
              }
            }
          );
        }
      );

      socket.current.on(
        "user-connected",
        ({ userId: remoteUserId, username, isMuted }) => {
          streams.current[remoteUserId] = {
            userId: remoteUserId,
            username,
            stream: null,
            isMuted,
          };
          updateStreams();
        }
      );

      socket.current.on("user-disconnected", (remoteUserId: string) => {
        delete streams.current[remoteUserId];
        updateStreams();
      });

      // socket.current.on("chat-message", onMessage);
      socket.current.on("mute-status", ({ userId, isMuted }) => {
        streams.current[userId]!.isMuted = isMuted;
        updateStreams();
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

      return () => {
        disconnectSocket();
        if (sendTransport.current) sendTransport.current.close();
        if (recvTransport.current) recvTransport.current.close();
        streams.current = {
          [String(user.id)]: {
            userId: state.currentUserId,
            username: state.currentUsername,
            stream: null,
            isMuted: false,
          },
        };
      };
    },
    [
      // roomId,
      // user.avatar,
      // user.id,
      // state.currentUsername,
      // state.currentUserId,
      // user.username,
      // dispatch,
      // updateStreams,
    ]
  );

  return (
    <MeetingRoomUI socketRef={socket.current} userId={state.currentUserId} />
  );
}
