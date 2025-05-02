"use client";

import { useState } from "react";
import MeetingNavbar from "./MeetingNavbar";
import { useReducedState } from "@/hooks/useReducedState";
import { Socket } from "socket.io-client";
import ZegoContainer from "./ZegoContainer";
import { SidebarContainer } from "./SidebarContainer";
import { Toaster } from 'react-hot-toast';
import SocketManager from "./SocketManager";

interface Props {
  meetingContainerRef: React.RefObject<HTMLDivElement>;
  socketRef: React.RefObject<Socket>;
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
      <Toaster />
      <SocketManager socketRef={socketRef.current} />
      <div className="w-full">
        <MeetingNavbar
          layout={layout}
          handleLayoutChange={handleLayoutChange}
          socketRef={socketRef.current}
        />
      </div>

      <ZegoContainer
        navbarHeight={navbarHeight}
        meetingContainerRef={meetingContainerRef}
        socketRef={socketRef}
      />
      
      <div
        className={`${!state.isSidebarOpen && 'hidden'} w-80 transform transition-transform duration-300 absolute right-0 z-10`}
        style={{
          top: navbarHeight,
          height: `calc(100% - ${navbarHeight})`,
        }}
      >
        <div
          className={`h-full transform transition-transform duration-300 bg-gray-800 ${
            state.isSidebarOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <SidebarContainer socket={socketRef.current} />
        </div>
      </div>
    </div>
  );
}
