"use client";

import { useState } from "react";
import { MessageSquare, X } from "lucide-react";
import { useReducedState } from "@/hooks/useReducedState";
import { MeetingActionType } from "@/lib/MeetingContext";
import { Socket } from "socket.io-client";
import PollPanel from "./PollPanel";
import QAPanel from "./QAPanel";
import { SubTab } from "@/types/chatRoom";

interface Props {
  socketRef: Socket | null;
}

export default function PollsAndQAPanel({ socketRef }: Props) {
  const { dispatch } = useReducedState();
  const [activeSubTab, setActiveSubTab] = useState<SubTab>(SubTab.POLLS);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 flex justify-between border-b border-gray-700">
        <div className="flex gap-2">
          <p className="text-lg align-text-bottom text-gray-300 font-semibold">
            Polls & Q&A
          </p>
          <MessageSquare className="w-7 pb-1 h-7 text-gray-500" />
        </div>
        <button
          className="text-gray-600 hover:text-gray-900 focus:outline-none cursor-pointer"
          onClick={() => dispatch({ type: MeetingActionType.CLOSE_SIDEBAR })}
        >
          <X className="w-6 h-6 text-white" />
        </button>
      </div>
      <div className="flex border-b border-gray-700">
        <button
          className={`flex-1 p-2 text-center cursor-pointer ${
            activeSubTab === SubTab.POLLS
              ? "border-b-2 border-green-500 text-white"
              : "text-gray-400"
          }`}
          onClick={() => setActiveSubTab(SubTab.POLLS)}
        >
          Polls
        </button>
        <button
          className={`flex-1 p-2 text-center cursor-pointer ${
            activeSubTab === SubTab.QA
              ? "border-b-2 border-green-500 text-white"
              : "text-gray-400"
          }`}
          onClick={() => setActiveSubTab(SubTab.QA)}
        >
          Q&A
        </button>
      </div>
      {activeSubTab === SubTab.POLLS && <PollPanel socketRef={socketRef} />}
      {activeSubTab === SubTab.QA && <QAPanel socketRef={socketRef} />}
    </div>
  );
}