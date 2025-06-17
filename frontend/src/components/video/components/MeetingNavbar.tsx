"use client";

import { User2, MessageCircle, MessageSquare, Notebook } from "lucide-react";
import { useReducedState } from "@/hooks/useReducedState";
import { MeetingActionType, PanelType } from "@/context/MeetingContext";
import BreakoutRoomManager from "./BreakoutRoomManager";
import { Socket } from "socket.io-client";
import Timer from "./Timer";
import { Role } from "@/types/chatRoom";
import { useEffect } from "react";

interface Props {
  socketRef: Socket;
}

const MeetingNavbar = ({ socketRef }: Props) => {
  const { state, dispatch } = useReducedState();

  const togglePanel = (panel: PanelType) => {
    if (state.isSidebarOpen && state.activePanel === panel) {
      dispatch({ type: MeetingActionType.CLOSE_SIDEBAR });
    } else {
      dispatch({ type: MeetingActionType.OPEN_SIDEBAR, payload: { panel } });
    }
  };

  useEffect(() => {
    if (state.activePanel === PanelType.CHAT) {
      dispatch({ type: MeetingActionType.RESET_UNREAD_MESSAGES });
    }
  }, [state.activePanel, dispatch]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div
      className={`flex justify-between relative items-center p-4 bg-gray-800 mb-2 ${
        state.isLeftMeeting ? "hidden" : ""
      }`}
    >
      <div className="flex items-center space-x-4">
        <BreakoutRoomManager socketRef={socketRef} />
        {state.currentUserRole === Role.HOST && <Timer socketRef={socketRef} />}
      </div>

      {state.timer.isRunning && (
        <div className="absolute left-1/2 -translate-x-1/2 bg-gray-900 py-2 px-8 border-2 border-gray-600 rounded-2xl">
          <span className={`animate-pulse text-blue-400 font-mono text-lg`}>
            {formatTime(
              state.timer.isRunning
                ? state.timer.timeLeft
                : state.timer.duration || 0
            )}
          </span>
        </div>
      )}

      <div className="flex items-center space-x-4">
        <button
          className={`text-gray-300 hover:text-white cursor-pointer ${
            state.activePanel === PanelType.USERS ? "text-blue-400" : ""
          }`}
          onClick={() => {
            togglePanel(PanelType.USERS);
          }}
        >
          <User2 size={20} />
        </button>
        <button
          className={`text-gray-300 hover:text-white relative cursor-pointer ${
            state.activePanel === PanelType.CHAT ? "text-blue-400" : ""
          }`}
          onClick={() => {
            togglePanel(PanelType.CHAT);
          }}
        >
          <MessageCircle size={20} />
          {state.unreadMessages > 0 && state.activePanel !== PanelType.CHAT && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {state.unreadMessages}
            </span>
          )}
        </button>
        <button
          className={`text-gray-300 hover:text-white cursor-pointer ${
            state.activePanel === PanelType.POLLS_AND_QA ? "text-blue-400" : ""
          }`}
          onClick={() => {
            togglePanel(PanelType.POLLS_AND_QA);
          }}
        >
          <MessageSquare size={20} />
        </button>
        <button
          className={`text-gray-300 hover:text-white cursor-pointer ${
            state.activePanel === PanelType.NOTES ? "text-blue-400" : ""
          }`}
          onClick={() => {
            togglePanel(PanelType.NOTES);
          }}
        >
          <Notebook size={20} />
        </button>
      </div>
    </div>
  );
};

export default MeetingNavbar;