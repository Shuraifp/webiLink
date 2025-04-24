"use client";

import { User, MessageCircle, MoreVertical } from "lucide-react";
import { useReducedState } from "@/hooks/useReducedState";
import { MeetingActionType } from "@/lib/MeetingContext";
import BreakoutRoomManager from "./BreakoutRoomManager";
import { Socket } from "socket.io-client";

interface Props {
  handleLayoutChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  layout: string;
  socketRef: Socket;
}

const MeetingNavbar = ({ handleLayoutChange, layout, socketRef }: Props) => {
  const { state, dispatch } = useReducedState();

  const toggleChat = () => {
    dispatch({ type: MeetingActionType.TOGGLE_CHAT });
  };

  return (
    <div className="flex justify-between items-center p-2 bg-gray-800 mb-3">
      <div className="flex items-center space-x-4">
        <BreakoutRoomManager socketRef={socketRef} />
      </div>
      <div className="flex items-center space-x-4">
        <button
          className={`text-gray-300 hover:text-white ${
            state.isUserActive ? "text-blue-400" : ""
          }`}
          onClick={() => {
            dispatch({ type: MeetingActionType.TOGGLE_USER });
            toggleChat();
          }}
        >
          <User size={20} />
        </button>
        <button
          className={`text-gray-300 hover:text-white ${
            state.isChatActive ? "text-blue-400" : ""
          }`}
          onClick={toggleChat}
        >
          <MessageCircle size={20} />
        </button>
        <button
          className={`text-gray-300 hover:text-white ${
            state.isMoreActive ? "text-blue-400" : ""
          }`}
          onClick={() => dispatch({ type: MeetingActionType.TOGGLE_MORE })}
        >
          <MoreVertical size={20} />
        </button>
      </div>
    </div>
  );
};

export default MeetingNavbar;