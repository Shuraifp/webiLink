"use client"

import { useEffect, useRef } from "react";
import { useReducedState } from "@/hooks/useReducedState";
import { Mic, MicOff } from "lucide-react"


export function VideoPlayer({
  stream,
  isLocal,
  username,
  isMuted
}: {
  stream: MediaStream;
  isLocal: boolean;
  username: string;
  isMuted: boolean;
}) {
  const { state } = useReducedState()
  const videoRef = useRef<HTMLVideoElement>(null);
  console.log(state.videoStreams)

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="relative">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={state.isMuted}
        style={{
          width: "100%",
          height: "auto",
          transform: isLocal ? "scaleX(-1)" : "none",
        }}
      />
      <div className="absolute bottom-1 w-full flex justify-between items-center px-2">
        <div className="flex items-center space-x-2">
          {isMuted ? (
            <div className="bg-red-600 text-white p-2 rounded-full shadow-lg hover:bg-red-700 transition">
              <MicOff size={20} />
            </div>
          ) : (
            <div className="bg-green-600 text-white p-2 rounded-full shadow-lg hover:bg-green-700 transition">
              <Mic size={20} />
            </div>
          )}
        </div>
        <span className="text-white bg-gray-800 px-3 py-1 rounded-full shadow-md">{username}</span>
      </div>
    </div>
  );
}
