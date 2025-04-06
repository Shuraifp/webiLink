"use client";

import { UserData } from "@/types/type";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface RoomsProps {
  user?: UserData;
}


export default function DashboardPage({user}: UserData) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText("weblink.com/shuraif-room");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartMeeting = () => {
    console.log("Starting meeting...");
    router.push("/landing");
  };

  const handleJoinRoom = () => {
    console.log("Joining a different room...");
  };

  return (
    <>
        
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">My rooms</h3>
          <div className="bg-white p-4 rounded-lg shadow-md flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded text-sm font-medium">
                SP
              </div>
              <div>
                <p className="text-gray-500 text-sm">weblink.com/shuraif-room</p>
                <p className="text-gray-800 font-medium">shuraif-room</p>
                <p className="text-gray-500 text-sm">Shuraif</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyLink}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition"
              >
                {copied ? "Copied!" : "Copy link"}
              </button>
              <button
                onClick={handleStartMeeting}
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
          <div className="mt-6">
            <button
              onClick={handleJoinRoom}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition"
            >
              Join a different room
            </button>
          </div>
        </div>
      </>
  );
}
