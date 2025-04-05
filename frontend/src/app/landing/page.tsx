import Link from "next/link";
import { headers } from "next/headers";
import { UserData } from "@/types/type";

export default async function HostingPage() {
  const headersList = await headers();
  const userData = headersList.get("x-user") as UserData | null;
  if (!userData) {
    return <div>Please log in to view your dashboard.</div>;
  }
  const user = JSON.parse(userData);

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="absolute top-4 right-4">
        <Link href={'/host'} className="text-4xl cursor-pointer font-bold lobster">
          <span className="text-yellow-500">w</span>ebiLink
        </Link>
      </div>

      <div className="flex flex-col justify-center items-center w-1/2 bg-gray-300 rounded-lg ml-8 p-4 shadow-inner">
        <p className="text-lg font-medium text-gray-500">Video Placeholder for Host</p>
      </div>

      <div className="flex flex-col justify-center items-center w-full max-w-md mx-auto p-8">
        <h1 className="text-4xl font-bold mb-4">Host your Meeting</h1>
        <p className="text-lg mb-8 text-center">Set up your meeting and get started as a host.</p>
        <button className="bg-blue-500 text-white px-6 py-3 rounded font-medium shadow hover:bg-blue-600">
          Start your Session
        </button>
      </div>
    </div>
  );
}