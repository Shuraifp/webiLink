"use client";

import dynamic from "next/dynamic";
import { UserData } from "@/types/type";

const ChatRoom = dynamic(() => import("@/components/video/ChatRoom"), {
  ssr: false,
});

export default function ChatRoomWrapper({ user }: { user: UserData }) {
  return <ChatRoom user={user} />;
}