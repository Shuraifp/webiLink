"use client";

import dynamic from "next/dynamic";
import { UserData } from "@/types/type";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

const ChatRoom = dynamic(() => import("@/components/video/ChatRoom"), {
  ssr: false,
});

export default function ChatRoomWrapper() {
  const router = useRouter();
  const { auth } = useAuth();
  const user = auth.user as UserData;

  if (!auth.authStatus?.isAuthenticated) {
    router.push("/login");
    return null;
  }

  if (auth.isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <div className="w-16 h-16 border-5 border-t-transparent border-b-transparent border-yellow-400 rounded-full animate-spin" />
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    );
  }

  return <ChatRoom user={user} />;
}