import ChatRoomWrapper from "@/components/video/ChatRoomWrapper";
import { MeetingProvider } from "@/context/MeetingContext";


export default async function HostingPage() {
  return (
    <MeetingProvider>
      <div className="flex min-h-screen">
        <ChatRoomWrapper />
      </div>
    </MeetingProvider>
  );
}
