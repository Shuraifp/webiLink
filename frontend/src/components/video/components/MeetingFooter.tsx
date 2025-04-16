"use client";

import {
  Video,
  Smile,
  Hand,
  Mic,
  MicOff,
  Camera,
  Share2,
  Settings,
  LogOut,
} from "lucide-react";
import { useReducedState } from "@/hooks/useReducedState";
import { Socket } from "socket.io-client";

interface Props {
  socketRef: Socket | null;
}

const MeetingFooter = ({socketRef}: Props) => {
  const { state } = useReducedState();

  const toggleMute = () => {
    if(!socketRef) return
    console.log(state)
    const isMuted = !state.isMuted;
    socketRef.emit("toggle-mute", {
      roomId: state.roomId,
      userId: state.currentUserId,
      isMuted,
    });
  };

  return (
    <div className="flex justify-center gap-4 p-2 bg-gray-800 rounded-lg absolute bottom-1 left-1/2 -translate-1/2">
      <button className="flex items-center gap-1 text-white hover:text-gray-300">
        <Video size={20} /> Record
      </button>
      <button className="flex items-center gap-1 text-white hover:text-gray-300">
        <Smile size={20} /> Reactions
      </button>
      <button className="flex items-center gap-1 text-white hover:text-gray-300">
        <Hand size={20} /> Rise
      </button>
      <button
        onClick={toggleMute}
        className="flex items-center gap-1 text-white hover:text-gray-300 cursor-pointer"
      >
        {state.isMuted ? <MicOff size={20} /> : <Mic size={20} />}
        {state.isMuted ? "Unmute" : "Mute"}
      </button>
      <button className="flex items-center gap-1 text-white hover:text-gray-300">
        <Camera size={20} /> Cam
      </button>
      <button className="flex items-center gap-1 text-white hover:text-gray-300">
        <Share2 size={20} /> Share
      </button>
      <button className="flex items-center gap-1 text-white hover:text-gray-300">
        <Settings size={20} /> Tools
      </button>
      <button className="flex items-center gap-1 text-red-500 hover:text-red-300">
        <LogOut size={20} /> Leave
      </button>
    </div>
  );
};

export default MeetingFooter;
