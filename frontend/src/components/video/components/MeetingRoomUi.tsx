"use client";

import { useState } from "react";
import MeetingNavbar from "./MeetingNavbar";
import ChatPanel from "./ChatPanel";
import { useReducedState } from "@/hooks/useReducedState";
import { Socket } from "socket.io-client";

interface Props {
  meetingContainerRef: React.RefObject<HTMLDivElement>;
  socketRef: Socket;
}

export default function MeetingRoomUI({
  meetingContainerRef,
  socketRef,
}: Props) {
  const [layout, setLayout] = useState("everyone");
  const { state } = useReducedState();
  const navbarHeight = "60px";

  const handleLayoutChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLayout(e.target.value);
  };

  return (
    <div className="bg-gray-900 text-white flex flex-col h-screen min-w-screen overflow-hidden relative">
      <div className="w-full">
        <MeetingNavbar
          layout={layout}
          handleLayoutChange={handleLayoutChange}
          socketRef={socketRef}
        />
      </div>
      <div
        className={`flex-1 transition-all bg-gray-800 duration-300 w-full ${
          state.isChatActive ? "pr-[320px]" : "pr-0"
        }`}
      >
        <div
          ref={meetingContainerRef}
          className="w-full relative"
          style={{ height: `calc(100vh - ${navbarHeight})` }}
        />
      </div>
      <div
        className={`w-80 transform transition-transform duration-300 absolute right-0 z-20`}
        style={{
          top: navbarHeight,
          height: `calc(100% - ${navbarHeight})`,
        }}
      >
        <div
          className={`h-full transform transition-transform duration-300 bg-gray-800 ${
            state.isChatActive ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <ChatPanel socketRef={socketRef} />
        </div>
      </div>
    </div>
  );
}