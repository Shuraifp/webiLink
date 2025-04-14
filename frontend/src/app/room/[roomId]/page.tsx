// import Link from "next/link";
import { headers } from "next/headers";
import { UserData } from "@/types/type";
import ChatRoom from "@/components/video/ChatRoom";
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
      <div className="flex h-screen bg-gray-100">
        {/* <div className="absolute top-4 right-4">
        <Link
          href={"/host"}
          className="text-4xl cursor-pointer font-bold lobster"
        >
          <span className="text-yellow-500">w</span>ebiLink
        </Link>
      </div> */}

        <ChatRoom user={user} />
      </div>
    </MeetingProvider>
  );
}
