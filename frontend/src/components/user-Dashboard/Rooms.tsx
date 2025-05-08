"use client";

import { UserData } from "@/types/type";
import { Dispatch, SetStateAction, useState, useEffect } from "react";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { fetchRooms } from "@/lib/api/user/roomApi";

interface RoomsProps {
  user: UserData;
  onSectionChange: Dispatch<SetStateAction<string>>;
  selectedSection: string;
  setPrevSection: Dispatch<SetStateAction<string>>;
}

interface Room {
  name: string;
  slug: string;
}

export default function DashboardPage({
  user,
  onSectionChange,
  selectedSection,
  setPrevSection,
}: RoomsProps) {
  const router = useRouter();
  const [copied, setCopied] = useState<{ [slug: string]: boolean }>({});
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [roomId, setRoomId] = useState<string>("");

  useEffect(() => {
    const getRooms = async () => {
      try {
        const res = await fetchRooms();
        setRooms(res);
      } catch (err) {
        console.log("error Fetching rooms: ", err);
      }
    };
    getRooms();
  }, []);

  const handleCopyLink = (slug: string) => {
    navigator.clipboard.writeText(`${process.env.NEXT_PUBLIC_DOMAIN}/${slug}`);
    setCopied((prev) => ({ ...prev, [slug]: true }));

    setTimeout(() => {
      setCopied((prev) => ({ ...prev, [slug]: false }));
    }, 2000);
  };

  const handleStartMeeting = (slug: string) => {
    router.push("/room/" + slug);
  };

  const handleJoinRoom = () => {
    setIsModalOpen(true);
  };

  const handleSectionChange = (sec: string) => {
    if (selectedSection === sec) return;
    const curSec = selectedSection;
    onSectionChange(sec);
    setPrevSection(curSec);
  };

  return (
    <>
      <p className="text-xl raleway font-semibold my-2 ml-1 text-gray-600">
        My rooms
      </p>
      {isModalOpen && (
        <div
          className="fixed inset-0 z-20 min-h-screen flex justify-center items-center"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <div className="bg-white w-96 py-8 px-4 rounded-lg shadow-lg max-w-sm">
            <div className="flex justify-between items-center mb-5">
              <p className="text-2xl raleway ml-2 font-semibold text-center text-gray-700">
                Join Video Room
              </p>

              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-white focus:outline-none rounded-sm text-red-700 hover:text-red-800 mr-1 cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter Room URL"
              />
              <button
                className="w-full py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
                onClick={() => handleStartMeeting(roomId)}
              >
                Join
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4 max-h-[55vh] no-scrollbar overflow-y-auto pr-4">
        {rooms?.map((room, ind) => (
          <div
            key={ind}
            className="bg-white p-4 rounded-lg shadow-md flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded text-sm font-medium">
                {user.username
                  ?.split(" ")
                  .map((a) => a[0].toUpperCase())
                  .join("")}
              </div>
              <div>
                <p className="text-gray-500 text-sm">
                  {process.env.NEXT_PUBLIC_DOMAIN}/{room.slug}
                </p>
                <p className="text-gray-800 font-medium">{room.name}</p>
                <p className="text-gray-500 text-sm">{user.username}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopyLink(room.slug)}
                className={`px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition ${
                  copied[room.slug] ? "" : "cursor-pointer"
                }`}
              >
                {copied[room.slug] ? "Copied!" : "Copy link"}
              </button>
              <button
                onClick={() => handleStartMeeting(room.slug)}
                className="px-4 py-2 bg-yellow-500 cursor-pointer text-white rounded-lg hover:bg-yellow-600 transition"
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
          className="px-4 py-1 text-lg text-white rounded-lg bg-gray-500 hover:bg-gray-600 cursor-pointer transition w-full"
        >
          Join a different room
        </button>
      </div>

      <button
        onClick={() => handleSectionChange("create-meeting")}
        className="fixed bottom-6 z-10 right-6 px-6 py-3 cursor-pointer bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 transition transform hover:scale-105"
      >
        + Create Room
      </button>
    </>
  );
}
