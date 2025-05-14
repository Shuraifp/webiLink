"use client";

import { useEffect, useState } from "react";
import { useReducedState } from "@/hooks/useReducedState";
import { Search, X } from "lucide-react";
import { MeetingActionType } from "@/lib/MeetingContext";
import { Role } from "@/types/chatRoom";

export default function PeoplePanel() {
  const { state, dispatch } = useReducedState();
  const [searchQuery, setSearchQuery] = useState("");
  const [openedSection, setOpenedSection] = useState<"main" | "breakout">(
    "main"
  );

  const currentBreakoutRoom = state.breakoutRooms.find((room) =>
    room.participants.includes(state.currentUserId)
  );

  useEffect(() => {
    if (currentBreakoutRoom) {
      setOpenedSection("breakout");
    } else {
      setOpenedSection("main");
    }
  }, [openedSection, currentBreakoutRoom]);

  const filteredUsers = state.users.filter((user) =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const host = filteredUsers.find((user) => user.role === Role.HOST);
  const participants = filteredUsers.filter((user) => user.role !== Role.HOST);

  return (
    <div className="flex flex-col h-full bg-gray-800">
      <div className="p-4 flex justify-between border-b border-gray-700">
        <h2 className="text-lg font-semibold text-gray-300">
          People {currentBreakoutRoom ? `- ${currentBreakoutRoom.name}` : ""}
        </h2>
        <button
          className="text-gray-600 hover:text-gray-300 focus:outline-none cursor-pointer"
          onClick={() => {
            dispatch({ type: MeetingActionType.CLOSE_SIDEBAR });
          }}
        >
          <X className="w-6 h-6 text-white" />
        </button>
      </div>

      <div className="p-3 border-b border-gray-700">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-4 h-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="bg-gray-800 text-white text-sm rounded-lg block w-full pl-10 p-2.5 focus:outline-none"
            placeholder="Search for people"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="p-3 border-b border-gray-700">
          <div className="text-sm font-medium text-gray-400 mb-2">
            Meeting host
          </div>
          {host && (
            <div className="flex items-center justify-between p-2 hover:bg-gray-800 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {host.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-white text-sm">
                    {host.username}{" "}
                    {host.userId === state.currentUserId && "(You)"}
                  </span>
                  <span className="text-xs text-gray-400">Host</span>
                </div>
              </div>
              {/* <div className="flex items-center space-x-2">
                {host.isMuted ? 
                  <MicOff className="w-4 h-4 text-red-500" /> : 
                  <Mic className="w-4 h-4 text-green-500" />
                }
                <MoreVertical className="w-5 h-5 text-gray-400 cursor-pointer" />
              </div> */}
            </div>
          )}
        </div>

        {/* Participants Section */}
        {openedSection === "main" && (
          <div className="p-3">
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm font-medium text-gray-400">
                {state.breakoutRooms.length ? 'In the Main room' : 'In the meeting'} ({participants.length})
              </div>
              {/* <button className="text-blue-500 text-sm flex items-center space-x-1">
              <UserPlus className="w-4 h-4" />
              <span>Add people</span>
            </button> */}
            </div>

            {participants.map((user) => (
              <div
                key={user.userId}
                className="flex items-center justify-between p-2 hover:bg-gray-800 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-white text-sm">
                    {user.username}{" "}
                    {user.userId === state.currentUserId && "(You)"}
                  </span>
                </div>
                {/* <div className="flex items-center space-x-2">
                {user.isMuted ? 
                  <MicOff className="w-4 h-4 text-red-500" /> : 
                  <Mic className="w-4 h-4 text-green-500" />
                }
                <MoreVertical className="w-5 h-5 text-gray-400 cursor-pointer" />
              </div> */}
              </div>
            ))}

            {participants.length === 0 && (
              <div className="text-gray-500 text-sm text-center p-4">
                No other participants in meeting
              </div>
            )}
          </div>
        )}
        {openedSection === "breakout" && currentBreakoutRoom && (
          <div className="p-3">
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm font-medium text-gray-400">
                In {currentBreakoutRoom.name} ({currentBreakoutRoom.participants.length})
              </div>
            </div>

            {participants.length > 0 ? (
              currentBreakoutRoom.participants.map((part) => {
                const user = state.users.find((u) => u.userId === part);
                if (!user) return null;
                return (
                  <div
                    key={user.userId}
                    className="flex items-center justify-between p-2 hover:bg-gray-800 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center"
                        title={user.username}
                      >
                        <span className="text-white text-sm font-medium">
                          {user.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-white text-sm">
                        {user.username}{" "}
                        {user.userId === state.currentUserId && "(You)"}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-gray-500 text-sm text-center p-4">
                No other participants in meeting
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
