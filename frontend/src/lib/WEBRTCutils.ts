import { Socket } from "socket.io-client";

interface VideoStream {
  userId: string;
  stream: MediaStream;
}

export const createPeerConnection = ({
  userSocketId,
  localStream,
  socketRef,
  roomId,
  peerConnections,
  setVideoStreams,
}: {
  userSocketId: string;
  localStream: MediaStream;
  socketRef: React.MutableRefObject<Socket | null>;
  roomId: string;
  peerConnections: React.MutableRefObject<{
    [userId: string]: RTCPeerConnection;
  }>;
  setVideoStreams: React.Dispatch<React.SetStateAction<VideoStream[]>>;
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
  peerConnections.current[userSocketId] = pc;

  console.log("Adding tracks for", userSocketId, localStream.getTracks());
  localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));

  pc.onicecandidate = (event) => {
    if (event.candidate) {
      console.log("ICE candidate generated for", userSocketId, event.candidate);
      socketRef.current?.emit("ice-candidate", {
        target: userSocketId,
        candidate: event.candidate,
        roomId,
      });
    } else {
      console.log("ICE gathering complete for", userSocketId);
    }
  };

  pc.onicegatheringstatechange = () => {
    console.log("ICE gathering state for", userSocketId, pc.iceGatheringState);
  };

  pc.onsignalingstatechange = () => {
    console.log("Signaling state for", userSocketId, pc.signalingState);
  };

  pc.ontrack = (event) => {
    console.log("Received remote stream from", userSocketId);
    setVideoStreams((prev) => {
      if (!prev.some((vs) => vs.userId === userSocketId)) {
        return [...prev, { userId: userSocketId, stream: event.streams[0] }];
      }
      return prev;
    });
  };

  return pc;
};
