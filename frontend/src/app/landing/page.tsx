import Link from "next/link";
import { headers } from "next/headers";
import { UserData } from "@/types/type";
import Lobby from "@/components/video/Lobby";

export default async function HostingPage() {
  const headersList = await headers();
  const userData = headersList.get("x-user") as string | null;
  if (!userData) {
    return <div>Please log in to view your landing page.</div>;
  }
  const user: UserData = JSON.parse(userData);

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="absolute top-4 right-4">
        <Link
          href={"/host"}
          className="text-4xl cursor-pointer font-bold lobster"
        >
          <span className="text-yellow-500">w</span>ebiLink
        </Link>
      </div>

      <Lobby user={user} />
    </div>
  );
}
