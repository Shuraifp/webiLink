"use client";

import { useState, useEffect, useRef } from "react";
import { Socket } from "socket.io-client";
import { useReducedState } from "@/hooks/useReducedState";
import { ChatMessage } from "@/types/chatRoom";
import { X } from "lucide-react";
import { MeetingActionType } from "@/lib/MeetingContext";

interface Props {
  socketRef: Socket | null;
  isOpen: boolean;
}

export default function ChatPanel({ socketRef, isOpen }: Props) {
  const { state, dispatch } = useReducedState();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!socketRef) return;
    socketRef.on("chat-message", (message: ChatMessage) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socketRef.off("chat-message");
    };
  }, [socketRef]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim() || !socketRef) return;
    socketRef.emit("chat-message", {
      roomId: state.roomId,
      userId: state.currentUserId,
      content: input.trim(),
    });

    setInput("");
  };

  return (
    <div
      className={`fixed top-0 right-0 h-full z-20 w-80 bg-gray-800 text-white transform transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="flex flex-col h-full">
        <div className="p-4 flex justify-between border-b border-gray-700">
          <h2 className="text-lg font-semibold">Chat</h2>
          <button
            className="text-gray-600 hover:text-gray-900 focus:outline-none cursor-pointer"
            onClick={() => dispatch({ type: MeetingActionType.TOGGLE_CHAT })}
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.messageId}
              className={`flex ${
                msg.userId === state.currentUserId
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`max-w-[70%] p-2 rounded-lg ${
                  msg.userId === state.currentUserId
                    ? "bg-blue-600"
                    : "bg-gray-700"
                }`}
              >
                <div className="text-sm font-semibold">{msg.username}</div>
                <div className="text-sm">{msg.content}</div>
                <div className="text-xs text-gray-400">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="p-4 border-t border-gray-700">
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
    </div>
  );
}
