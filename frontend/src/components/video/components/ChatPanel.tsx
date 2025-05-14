"use client";

import { useState, useEffect, useRef } from "react";
import { Socket } from "socket.io-client";
import { useReducedState } from "@/hooks/useReducedState";
import { ChatMessage } from "@/types/chatRoom";
import { CornerDownRight, CornerDownLeft, X, Search } from "lucide-react";
import { MeetingActionType } from "@/lib/MeetingContext";

interface Props {
  socketRef: Socket | null;
}

export default function ChatPanel({ socketRef }: Props) {
  const { state, dispatch } = useReducedState();
  const [input, setInput] = useState("");
  const [selectedRecipient, setSelectedRecipient] = useState<string>("everyone");
  const [recipientSearch, setRecipientSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentBreakoutRoom = state.breakoutRooms.find((room) =>
    room.participants.includes(state.currentUserId)
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [state.messages]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const sendMessage = () => {
    if (!input.trim() || !socketRef) return;
    socketRef.emit("chat-message", {
      roomId: state.roomId,
      userId: state.currentUserId,
      content: input.trim(),
      targetUserId:
        selectedRecipient === "everyone" ? undefined : selectedRecipient,
    });
    setInput("");
  };

  const getMessageLabel = (msg: ChatMessage) => {
    if (!msg.isDM) {
      return {
        text: "To Everyone",
        className: "text-gray-400 bg-gray-700/50 w-fit px-2 py-0.5 rounded",
      };
    }
    if (msg.userId === state.currentUserId) {
      const recipient = state.users.find((u) => u.userId === msg.targetUserId);
      return {
        text: `Only to ${recipient?.username || "Unknown"}`,
        className: "text-green-400 w-fit bg-green-900/50 px-2 py-0.5 rounded",
      };
    } else {
      return {
        text: `From ${msg.username}`,
        className: "text-green-400 w-fit bg-green-900/50 px-2 py-1 rounded",
      };
    }
  };

  const getAvailableRecipients = () => {
    if (currentBreakoutRoom) {
      return state.users.filter(
        (user) =>
          currentBreakoutRoom.participants.includes(user.userId!) &&
          user.userId !== state.currentUserId
      );
    }
    return state.users.filter(
      (user) =>
        state.mainRoomParticipants.includes(user.userId!) &&
        user.userId !== state.currentUserId
    );
  };

  const getSelectedRecipientName = () => {
    if (selectedRecipient === "everyone") return "Everyone";
    const user = state.users.find(u => u.userId === selectedRecipient);
    return user ? user.username : "Everyone";
  };

  // Filter recipients based on search
  const filteredRecipients = getAvailableRecipients().filter(user => 
    user.username.toLowerCase().includes(recipientSearch.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 flex justify-between border-b border-gray-700">
        <h2 className="text-lg font-semibold text-gray-300">
          Chat {currentBreakoutRoom ? `- ${currentBreakoutRoom.name}` : ""}
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
      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        {state.messages.map((msg) => {
          const label = getMessageLabel(msg);
          return (
            <div
              key={msg.messageId}
              className={`flex ${
                msg.userId === state.currentUserId
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div className="inline-flex flex-col max-w-[70%]">
                <div
                  className={`p-2 rounded-lg break-words overflow-hidden ${
                    msg.userId === state.currentUserId
                      ? "bg-blue-600"
                      : "bg-gray-700"
                  }`}
                >
                  <div className="text-sm font-semibold">{msg.username}</div>
                  <div className="text-sm">{msg.content}</div>
                  <div className="text-xs mt-0.5 text-gray-400 whitespace-nowrap">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </div>
                </div>
                <div
                  className={`flex items-center ${
                    msg.userId === state.currentUserId ? "flex-row-reverse" : ""
                  } gap-1 mt-1`}
                >
                  {msg.userId === state.currentUserId ? (
                    <CornerDownLeft className="w-4 h-4 text-gray-400" />
                  ) : (
                    <CornerDownRight className="w-4 h-4 text-gray-400" />
                  )}
                  <div className={`text-xs mt-1 ${label.className}`}>
                    {label.text}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-gray-700">
        <div className="flex gap-2 mb-2 relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex-1 bg-gray-700 text-white p-2 rounded-lg focus:outline-none text-left"
          >
            To: {getSelectedRecipientName()}
          </button>
          
          {dropdownOpen && (
            <div className="absolute bottom-full left-0 w-full mb-1 bg-gray-800 rounded-lg shadow-lg z-10 overflow-hidden">
              {/* Search bar */}
              <div className="p-2 border-b border-gray-700">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Search className="w-4 h-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="bg-gray-700 text-white text-sm rounded-lg block w-full pl-10 p-2 focus:outline-none"
                    placeholder="Search for recipients"
                    value={recipientSearch}
                    onChange={(e) => setRecipientSearch(e.target.value)}
                    autoFocus
                  />
                </div>
              </div>
              
              {/* Recipients list */}
              <div className="max-h-48 overflow-y-auto">
                <div 
                  className="p-2 hover:bg-gray-700 cursor-pointer"
                  onClick={() => {
                    setSelectedRecipient("everyone");
                    setDropdownOpen(false);
                  }}
                >
                  Everyone
                </div>
                
                {filteredRecipients.map((user) => (
                  <div
                    key={user.userId}
                    className="p-2 hover:bg-gray-700 cursor-pointer"
                    onClick={() => {
                      setSelectedRecipient(user.userId!);
                      setDropdownOpen(false);
                    }}
                  >
                    {user.username}
                  </div>
                ))}
                
                {filteredRecipients.length === 0 && recipientSearch && (
                  <div className="p-2 text-gray-400 text-center">
                    No matches found
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            className="flex-1 bg-gray-700 text-white p-2 rounded-lg focus:outline-none"
            placeholder="Type a message..."
          />
          <button
            onClick={sendMessage}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}