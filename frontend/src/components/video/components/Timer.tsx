"use client"

import { Role, SocketEvent } from "@/types/chatRoom";
import { Clock } from "lucide-react";
import { useState } from "react";
import { Socket } from "socket.io-client";
import { useReducedState } from "@/hooks/useReducedState";

export default function Timer({ socketRef }: { socketRef: Socket }) {
  const { state } = useReducedState();
  const [isTimerDropdownOpen, setIsTimerDropdownOpen] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState<number>(300);


  const handleTimerStart = () => {
    socketRef.emit(SocketEvent.TIMER_START, {
      roomId: state.roomId,
      duration: selectedDuration,
    });
    setIsTimerDropdownOpen(false);
  };

  const handleTimerPause = () => {
    socketRef.emit(SocketEvent.TIMER_PAUSE, { roomId: state.roomId });
    setIsTimerDropdownOpen(false);
  };

  const handleTimerReset = () => {
    socketRef.emit(SocketEvent.TIMER_RESET, {
      roomId: state.roomId,
      duration: selectedDuration,
    });
    setIsTimerDropdownOpen(false);
  };

  return (
    <div className="relative flex items-center space-x-3">
    
      <div className="flex items-center space-x-2">
        <Clock
          size={20}
          onClick={() => setIsTimerDropdownOpen(!isTimerDropdownOpen)}
          className="text-gray-300 hover:text-white cursor-pointer transition-colors"
        />
      </div>

      {state.currentUserRole === Role.HOST && isTimerDropdownOpen && (
        <div className="absolute top-8 left-0 mt-2 w-72 bg-gray-900 rounded-lg shadow-xl z-20 border border-gray-700">
          <div className="p-4">
            <p className="text-white font-normal mb-3 block tracking-wide">
              Select Duration
            </p>
            <select
              value={selectedDuration}
              onChange={(e) => setSelectedDuration(Number(e.target.value))}
              className="w-full bg-gray-800 text-white rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              <option value={60}>1 Minute</option>
              <option value={300}>5 Minutes</option>
              <option value={600}>10 Minutes</option>
              <option value={900}>15 Minutes</option>
              <option value={1800}>30 Minutes</option>
            </select>

            <div className="flex space-x-3 mt-4">
              <button
                onClick={handleTimerStart}
                className="flex-1 hover:bg-gray-950 bg-white text-gray-900 cursor-pointer hover:text-white font-medium text-sm py-2 rounded-md duration-300 transition-colors"
              >
                Start
              </button>
              <button
                onClick={handleTimerPause}
                className="flex-1 bg-gray-700 hover:bg-gray-800 cursor-pointer text-white font-medium text-sm py-2 rounded-md transition-colors"
              >
                Pause
              </button>
              <button
                onClick={handleTimerReset}
                className="flex-1 bg-red-500 hover:bg-red-700 cursor-pointer text-white font-medium text-sm py-2 rounded-md transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}