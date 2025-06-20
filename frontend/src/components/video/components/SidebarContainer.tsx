"use client";

import { useReducedState } from "@/hooks/useReducedState";
import { PanelType } from "@/context/MeetingContext";
import { Socket } from "socket.io-client";

// Components
import ChatPanel from "./ChatPanel";
import PollsAndQAPanel from "./PollsAndQAPanel";
import People from "./People";
import NotesPanel from "./NotesPanel";

interface Props {
  socket: Socket | null;
}

export function SidebarContainer({ socket }: Props) {
  const { state } = useReducedState();

  return (
    <div
      className={`h-full w-80 bg-gray-800 text-white ${
        state.isSidebarOpen ? "" : "hidden"
      }`}
    >
      {(state.activePanel === PanelType.CHAT && (
        <ChatPanel socketRef={socket} />
      )) ||
        (state.activePanel === PanelType.POLLS_AND_QA && (
          <PollsAndQAPanel socketRef={socket} />
        )) ||
        (state.activePanel === PanelType.USERS && <People />)}
      {state.activePanel === PanelType.NOTES && (
        <NotesPanel roomId={state.roomId} />
      )}
    </div>
  );
}
