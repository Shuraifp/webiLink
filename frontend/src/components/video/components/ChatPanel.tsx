"use client";

import { useState, useEffect, useRef } from "react";
import { Socket } from "socket.io-client";
import { useReducedState } from "@/hooks/useReducedState";
import { ChatMessage, UserData } from "@/types/chatRoom";
import { X, CornerDownRight, CornerDownLeft } from "lucide-react";
import { MeetingActionType } from "@/lib/MeetingContext";

interface Props {
  socketRef: Socket | null;
}

export default function ChatPanel({ socketRef }: Props) {
  const { state, dispatch } = useReducedState();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [selectedRecipient, setSelectedRecipient] =
    useState<string>("everyone");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentBreakoutRoom = state.breakoutRooms.find((room) =>
    room.participants.includes(state.currentUserId)
  );

  useEffect(() => {
    if (!socketRef) return;

    socketRef.on("chat-message", (message: ChatMessage) => {
      const userBreakoutRoom = state.breakoutRooms.find((room) =>
        room.participants.includes(state.currentUserId)
      );
      if (message.isDM) {
        if (
          message.userId === state.currentUserId ||
          message.targetUserId === state.currentUserId
        ) {
          setMessages((prev) => [...prev, message]);
        }
      } else if (
        userBreakoutRoom &&
        message.breakoutRoomId === userBreakoutRoom.id
      ) {
        setMessages((prev) => [...prev, message]);
      } else if (!userBreakoutRoom && !message.breakoutRoomId) {
        setMessages((prev) => [...prev, message]);
      }
    });

    socketRef.on("user-list", (userList: UserData[]) => {
      dispatch({
        type: MeetingActionType.SET_USERS,
        payload: userList,
      });
    });

    socketRef.on(
      "user-connected",
      ({ userId, username, avatar, isMuted, role }: UserData) => {
        if (userId !== state.currentUserId) {
          dispatch({
            type: MeetingActionType.ADD_USER,
            payload: { userId, username, avatar, isMuted, role },
          });
        }
      }
    );

    socketRef.on("user-disconnected", (userId: string) => {
      dispatch({
        type: MeetingActionType.REMOVE_USER,
        payload: userId,
      });
    });

    socketRef.emit("request-users", { roomId: state.roomId });

    return () => {
      socketRef.off("chat-message");
      socketRef.off("user-list");
      socketRef.off("user-connected");
      socketRef.off("user-disconnected");
    };
  }, [socketRef, state.currentUserId, state.roomId, state.breakoutRooms]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  console.log(state);
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
      return state.users.filter((user) =>
        currentBreakoutRoom.participants.includes(user.userId!)
      );
    }
    return state.users.filter((user) =>
      state.mainRoomParticipants.includes(user.userId!)
    );
  };

  return (
    <div className="h-full w-80 bg-gray-800 text-white">
      <div className="flex flex-col h-full">
        <div className="p-4 flex justify-between border-b border-gray-700">
          <h2 className="text-lg font-semibold">
            Chat {currentBreakoutRoom ? `- ${currentBreakoutRoom.name}` : ""}
          </h2>
          <button
            className="text-gray-600 hover:text-gray-900 focus:outline-none cursor-pointer"
            onClick={() => dispatch({ type: MeetingActionType.TOGGLE_CHAT })}
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
          {messages.map((msg) => {
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
                  <div className={`flex items-center ${msg.userId === state.currentUserId ? 'flex-row-reverse' : ''} gap-1 mt-1`}>
                    { msg.userId === state.currentUserId ? <CornerDownLeft className="w-4 h-4 text-gray-400" /> : <CornerDownRight className="w-4 h-4 text-gray-400" />}
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
          <div className="flex gap-2 mb-2">
            <select
              value={selectedRecipient}
              onChange={(e) => setSelectedRecipient(e.target.value)}
              className="flex-1 bg-gray-700 text-white p-2 rounded-lg focus:outline-none"
            >
              <option value="everyone">To Everyone</option>
              {getAvailableRecipients().map((user) => (
                <option key={user.userId} value={user.userId}>
                  To {user.username}
                </option>
              ))}
            </select>
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
    </div>
  );
}
