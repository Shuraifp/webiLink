"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import io, { Socket } from "socket.io-client";
import { UserData } from "@/types/type";
import MeetingRoomUI from "./components/MeetingRoomUi";
import { createPeerConnection } from "@/lib/WEBRTCutils";

interface VideoStream {
  userId: string;
  stream: MediaStream;
}

interface SignalingData {
  userId: string;
  offer?: RTCSessionDescriptionInit;
  answer?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
  roomId: string;
  target: string;
}

export default function MeetingRoom({ user }: { user: UserData }) {
  const { roomId } = useParams() as { roomId: string };
  const socketRef = useRef<Socket | null>(null);
  const peerConnections = useRef<{ [userId: string]: RTCPeerConnection }>({});
  const [videoStreams, setVideoStreams] = useState<VideoStream[]>([]);
  const [status, setStatus] = useState<
    "connecting" | "waiting" | "active" | "error"
  >("connecting");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const statusRef = useRef(status);
  statusRef.current = status;
  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  const connectToNewUser = useCallback(
    async (userSocketId: string, stream: MediaStream) => {
      if (peerConnections.current[userSocketId]) {
        console.log("Peer connection already exists for", userSocketId);
        return;
      }
      const pc = createPeerConnection({
        userSocketId,
        localStream: stream,
        socketRef,
        roomId,
        peerConnections,
        setVideoStreams,
      });
      const offer = await pc.createOffer();
      console.log("Setting local SDP of existing");
      await pc.setLocalDescription(offer);
      console.log("Done with local SDP of existing");
      socketRef.current?.emit("offer", {
        target: userSocketId,
        offer,
        roomId,
      });
    },
    [roomId]
  );

  useEffect(() => {
    if (!roomId || !user.id) return;

    socketRef.current = io(process.env.NEXT_PUBLIC_SERVER_URL!);
    socketRef.current.on("connect", () =>
      console.log("Socket connected:", socketRef.current?.id)
    );
    socketRef.current.on("connect_error", (err) =>
      console.log("Socket connect error:", err)
    );

    let localStream: MediaStream;

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        localStream = stream;
        console.log("Local stream tracks:", localStream.getTracks());
        setVideoStreams([{ userId: user.id!, stream }]);
        setStatus("active");
        socketRef.current?.emit("join-room", { userId: user.id, roomId });

        socketRef.current?.on("host-status", (isHost: boolean) => {
          setStatus("active");
          setStatusMessage(isHost ? "You are the host!" : null);
        });

        socketRef.current?.on("waiting-for-host", () => {
          setStatus("waiting");
          setStatusMessage("Waiting for host to join...");
        });

        socketRef.current?.on("host-joined", () => {
          setStatus("active");
          console.log("Host joined, status:", status);
          setStatusMessage(null);
        });

        socketRef.current?.on("host-left", () => {
          setStatus("waiting");
          setStatusMessage("Host has left the meeting");
          Object.values(peerConnections.current).forEach((pc) => pc.close());
          peerConnections.current = {};
          setVideoStreams([{ userId: user.id!, stream }]);
        });

        socketRef.current?.on("user-connected", (userSocketId: string) => {
          console.log("user-connected", userSocketId);
          if (statusRef.current === "active") {
            connectToNewUser(userSocketId, localStream);
          }
        });

        socketRef.current?.on("offer", async (data: SignalingData) => {
          if (statusRef.current !== "active") return;
          let pc = peerConnections.current[data.userId];
          if (!pc) {
            pc = createPeerConnection({
              userSocketId: data.userId,
              localStream,
              socketRef,
              roomId,
              peerConnections,
              setVideoStreams,
            });
          } else {
            console.log("Reusing existing peer connection for", data.userId);
          }
          console.log("Received offer from", data.userId);
          await pc.setRemoteDescription(new RTCSessionDescription(data.offer!));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          console.log("Answer created and set for", data.userId);
          socketRef.current?.emit("answer", {
            target: data.userId,
            answer,
            roomId,
          });
        });

        socketRef.current?.on("answer", (data: SignalingData) => {
          if (statusRef.current !== "active") return;
          const pc = peerConnections.current[data.userId];
          if (pc) {
            console.log("Received answer from", data.userId);
            pc.setRemoteDescription(
              new RTCSessionDescription(data.answer!)
            ).catch((err) => console.error("Error setting answer:", err));
          }
        });

        socketRef.current?.on("ice-candidate", (data: SignalingData) => {
          if (statusRef.current !== "active") return;
          const pc = peerConnections.current[data.userId];
          if (pc) {
            console.log(
              "Received ICE candidate from",
              data.userId,
              data.candidate
            );
            pc.addIceCandidate(new RTCIceCandidate(data.candidate!)).catch(
              (err) => console.error("Error adding ICE candidate:", err)
            );
          }
        });

        socketRef.current?.on("user-disconnected", (userId: string) => {
          console.log("user disconnected", userId);
          if (peerConnections.current[userId]) {
            peerConnections.current[userId].close();
            delete peerConnections.current[userId];
            setVideoStreams((prev) =>
              prev.filter((vs) => vs.userId !== userId)
            );
          }
        });

        socketRef.current?.on("error", (error: { message: string }) => {
          console.log("Socket error:", error);
          setStatus("error");
          setStatusMessage(`Error: ${error.message}`);
        });
      })
      .catch((error) => {
        console.error("Media device error:", error);
        setStatus("error");
        setStatusMessage(`Media error: ${error.message}`);
      });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
      Object.values(peerConnections.current).forEach((pc) => pc.close());
      peerConnections.current = {};
      if (localStream) localStream.getTracks().forEach((track) => track.stop());
    };
  }, [roomId, user.id, connectToNewUser]);

  return (
    <MeetingRoomUI
      roomId={roomId!}
      statusMessage={statusMessage}
      videoStreams={videoStreams}
      userId={user.id!}
    />
  );
}
