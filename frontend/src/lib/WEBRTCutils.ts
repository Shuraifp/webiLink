import { Socket } from "socket.io-client";
import { SignalingData, VideoStream } from "@/types/chatRoom";

export const createPeerConnection = ({
  userData,
  localStream,
  socketRef,
  roomId,
  peerConnections,
  getCurrentStreams,
  setVideoStreams,
}: {
  userData: SignalingData;
  localStream: MediaStream;
  socketRef: React.MutableRefObject<Socket | null>;
  roomId: string;
  peerConnections: React.MutableRefObject<{
    [userId: string]: RTCPeerConnection;
  }>;
  getCurrentStreams: () => VideoStream[];
  setVideoStreams: (streams: VideoStream[]) => void;
}): RTCPeerConnection => {
  const pc = new RTCPeerConnection({
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      {
        urls: "turn:openrelay.metered.ca:80",
        username: "openrelayproject",
        credential: "openrelayproject",
      },
    ],
  });
  peerConnections.current[userData.userId] = pc;

  console.log("Adding tracks for", userData.userId, localStream.getTracks());
  localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));

  pc.onicecandidate = (event) => {
    if (event.candidate) {
      console.log("ICE candidate generated for", userData.userId, event.candidate);
      socketRef.current?.emit("ice-candidate", {
        target: userData.socketId,
        candidate: event.candidate,
        roomId,
      });
    } else {
      console.log("ICE gathering complete for", userData.userId);
    }
  };

  pc.onicegatheringstatechange = () => {
    console.log("ICE gathering state for", userData.userId, pc.iceGatheringState);
  };

  pc.onsignalingstatechange = () => {
    console.log("Signaling state for", userData.userId, pc.signalingState);
  };

  pc.ontrack = (event) => {
    console.log("Received remote stream from", userData.userId);
    const remoteStream = event.streams[0];
    console.log('remote stream ',remoteStream)
    const currentStreams = getCurrentStreams();
    const alreadyExists = currentStreams.find(
      (stream) => stream.userId === userData.userId
    );
    if (!alreadyExists) {
      const newStream: VideoStream = {
        socketId:userData.socketId,
        userId: userData.userId,
        username: userData.username,
        avatar: userData.avatar,
        role: userData.role,
        stream: remoteStream,
        isMuted: userData.isMuted || true,
      };
      const updatedStreams = [...currentStreams, newStream];
      setVideoStreams(updatedStreams);
    }
  };

  return pc;
};
