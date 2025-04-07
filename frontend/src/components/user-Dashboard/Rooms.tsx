"use client";

import { UserData } from "@/types/type";
import { Dispatch, SetStateAction, useState } from "react";
import { useRouter } from "next/navigation";

interface RoomsProps {
  user?: UserData;
  onSectionChange: Dispatch<SetStateAction<string>>;
  selectedSection: string;
  setPrevSection: Dispatch<SetStateAction<string>>;
}

export default function DashboardPage({ user, onSectionChange, selectedSection, setPrevSection }: RoomsProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const handleCopyLink = (slug:string) => {
    navigator.clipboard.writeText("weblink.com/"+slug);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartMeeting = (slug:string) => {
    console.log("Starting meeting..."+slug);
    router.push("/landing");
  };

  const handleJoinRoom = () => {
    console.log("Joining a different room...");
  };

  const handleSectionChange = (sec:string) => {
    if(selectedSection === sec) return
    const curSec = selectedSection
    onSectionChange(sec)
    setPrevSection(curSec)
  }

  const rooms = [
    {
      slug: "shuraif-room",
      name: "shuraif-room",
      username: user?.username || "shuraif",
    },
    {
      slug: "shuraif-room",
      name: "shuraif-room",
      username: user?.username || "shuraif",
    }
  ];

  return (
    <>
      <p className="text-xl raleway font-semibold my-2 ml-1 text-gray-500">
        My rooms
      </p>
      <div className="space-y-4 max-h-[55vh] no-scrollbar overflow-y-auto pr-4">
        {rooms.map((room) => (
          <div
            key={room.slug}
            className="bg-white p-4 rounded-lg shadow-md flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded text-sm font-medium">
                SP
              </div>
              <div>
                <p className="text-gray-500 text-sm">weblink.com/{room.slug}</p>
                <p className="text-gray-800 font-medium">{room.name}</p>
                <p className="text-gray-500 text-sm">{room.username}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopyLink(room.slug)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition"
              >
                {copied ? "Copied!" : "Copy link"}
              </button>
              <button
                onClick={() => handleStartMeeting(room.slug)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Start meeting
              </button>
              <button className="p-2 text-gray-500 hover:text-gray-700">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <button
          onClick={handleJoinRoom}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition w-full"
        >
          Join a different room
        </button>
      </div>

      <button
        onClick={() => handleSectionChange('create-meeting')}
        className="fixed bottom-6 right-6 px-6 py-3 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 transition transform hover:scale-105"
      >
        + Create Room
      </button>
    </>
  );
}
