"use client";

import { useState } from "react";
import { Socket } from "socket.io-client";
import { useReducedState } from "@/hooks/useReducedState";
import { Role } from "@/types/chatRoom";
import { X, Plus, Undo, Split } from "lucide-react";

interface Props {
  socketRef: Socket | null;
}

export default function BreakoutRoomManager({ socketRef }: Props) {
  const { state } = useReducedState();
  const [roomCount, setRoomCount] = useState(2);
  const [roomNames, setRoomNames] = useState<string[]>(["Room 1", "Room 2"]);
  const [isOpen, setIsOpen] = useState(false);
  const [isMainRoomVisible, setIsMainRoomVisible] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [openedBreakoutRoom, setOpenedBreakoutRoom] = useState<string | null>(
    null
  );

  const handleCreateRooms = () => {
    if (!socketRef) return;
    const rooms = Array.from({ length: roomCount }, (_, i) => ({
      id: `breakout-${i + 1}`,
      name: roomNames[i] || `Room ${i + 1}`,
    }));
    socketRef.emit("create-breakout-rooms", { roomId: state.roomId, rooms });
  };

  const handleAssignUser = (userId: string, breakoutRoomId: string) => {
    if (!socketRef) return;
    socketRef.emit("assign-breakout-room", {
      roomId: state.roomId,
      userId,
      breakoutRoomId,
    });
  };

  const handleEndBreakoutRooms = () => {
    if (!socketRef) return;
    socketRef.emit("end-breakout-rooms", { roomId: state.roomId });
  };

  if (state.currentUserRole !== Role.HOST) return null;
  
  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-gray-300 hover:text-white cursor-pointer flex justify-center items-center"
      >
        <Split className="w-5 h-5 text-white" />
      </button>
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-gray-800 text-white transform transition-transform duration-300 z-30 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold mb-4 text-center">
              Breakout Rooms
            </h2>
            <button
              className="text-gray-600 hover:text-gray-900 focus:outline-none cursor-pointer"
              onClick={() => setIsOpen(!isOpen)}
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
          {state.breakoutRooms.length === 0 ? (
            <div className="mb-4">
              <label className="block text-sm mb-2">Number of Rooms:</label>
              <input
                type="number"
                min="1"
                value={roomCount}
                onChange={(e) => {
                  const count = Number(e.target.value);
                  setRoomCount(count);
                  setRoomNames(
                    Array.from(
                      { length: count },
                      (_, i) => roomNames[i] || `Room ${i + 1}`
                    )
                  );
                }}
                className="w-full bg-gray-700 text-white p-2 rounded-lg mb-2"
              />
              {roomNames.map((name, i) => (
                <input
                  key={i}
                  type="text"
                  value={name}
                  onChange={(e) => {
                    const newNames = [...roomNames];
                    newNames[i] = e.target.value;
                    setRoomNames(newNames);
                  }}
                  placeholder={`Room ${i + 1}`}
                  className="w-full bg-gray-700 text-white p-2 rounded-lg mb-2"
                />
              ))}
              <button
                onClick={handleCreateRooms}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg"
              >
                Create Rooms
              </button>
            </div>
          ) : (
            <div className="flex-1 cursor-pointer overflow-y-auto">
              <h3 onClick={() => setIsMainRoomVisible(!isMainRoomVisible)} className="text-md montserrat font-medium rounded-lg mb-2 bg-gray-900 text-center p-3">
                Main Room ({state.mainRoomParticipants.length})
              </h3>
              {isMainRoomVisible &&
                state.mainRoomParticipants.map((userId) => {
                  const user = state.users.find((s) => s.userId === userId);
                  return (
                    <div
                      key={userId}
                      className="flex justify-between pl-4 ml-4 items-center mb-2 p-2 relative bg-gray-700 rounded-lg"
                    >
                      <span className="text-gray-300">
                        {user?.username || userId}
                      </span>
                      <Plus
                        className="text-gray-300 cursor-pointer w-5 h-5"
                        onClick={() =>
                          setActiveDropdown((prev) =>
                            prev === userId ? null : userId
                          )
                        }
                      />
                      {activeDropdown === userId && (
                        <div className="bg-gray-700 text-white cursor-pointer rounded absolute top-10 right-0">
                          {state.breakoutRooms.map((room) => (
                            <option
                              onClick={() => {
                                handleAssignUser(userId, room.id);
                                setActiveDropdown(null);
                              }}
                              className="p-2 hover:bg-gray-900"
                              key={room.id}
                              value={room.id}
                            >
                              {room.name}
                            </option>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              <div className="flex items-center justify-center my-4">
                <span className="mr-2 text-md montserrat font-medium text-center whitespace-nowrap">
                  Breakout Rooms ({state.breakoutRooms.length})
                </span>
                <div className="flex-grow border-t border-dashed border-gray-400"></div>
              </div>

              {state.breakoutRooms.map((room) => (
                <div
                  key={room.id}
                  onClick={() =>
                    setOpenedBreakoutRoom(
                      openedBreakoutRoom === room.id ? null : room.id
                    )
                  }
                  className="mb-2"
                >
                  <h3 className="text-md montserrat font-medium mb-2 rounded-lg bg-cyan-950 text-center p-3">
                    {room.name} ({room.participants.length})
                  </h3>
                  {openedBreakoutRoom === room.id &&
                    room.participants.map((userId) => {
                      const user = state.users.find((s) => s.userId === userId);
                      return (
                        <div
                          key={userId}
                          className="flex justify-between pl-4 ml-4 items-center mb-2 p-2 bg-gray-700 rounded-lg"
                        >
                          <span className="text-gray-300">
                            {user?.username || userId}
                          </span>
                          <Undo
                            onClick={() => handleAssignUser(userId, "")}
                            className="text-red-300 hover:text-red-500 cursor-pointer w-5 h-5"
                          />
                        </div>
                      );
                    })}
                </div>
              ))}
              <button
                onClick={handleEndBreakoutRooms}
                className="w-full bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg"
              >
                End Breakout Rooms
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
