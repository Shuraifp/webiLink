import { headers } from "next/headers";
import { UserData } from "@/types/type";
// import ChatRoom from "@/components/video/ChatRoom";
import { MeetingProvider } from "@/lib/MeetingContext";
import dynamic from "next/dynamic";

const ChatRoom = dynamic(() => import("@/components/video/ChatRoom"));

export default async function HostingPage() {
  const headersList = await headers();
  const userData = headersList.get("x-user") as string | null;
  if (!userData) {
    return <div>Please log in to view your chatting page.</div>;
  }
  const user: UserData = JSON.parse(userData);

  return (
    <MeetingProvider>
      <div className="flex min-h-screen">
        <ChatRoom user={user} />
      </div>
    </MeetingProvider>
  );
}
