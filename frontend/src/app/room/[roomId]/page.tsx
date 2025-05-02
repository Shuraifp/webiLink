import { headers } from "next/headers";
import { UserData } from "@/types/type";
import ChatRoomWrapper from "@/components/video/ChatRoomWrapper";
import { MeetingProvider } from "@/lib/MeetingContext";


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
        <ChatRoomWrapper user={user} />
      </div>
    </MeetingProvider>
  );
}
