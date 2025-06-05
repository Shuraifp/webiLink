"use client";

import { UserData } from "@/types/type";
import { Dispatch, SetStateAction, useState, useEffect } from "react";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { fetchRooms, deleteRoom } from "@/lib/api/user/roomApi";
import { isPremiumUser } from "@/lib/api/user/planApi";
import axios from "axios";
import toast from "react-hot-toast";
import { useConfirmationModal } from "./ConfirmationModal";

interface RoomsProps {
  user: UserData | null;
  onSectionChange: Dispatch<SetStateAction<string>>;
  selectedSection: string;
  setPrevSection: Dispatch<SetStateAction<string>>;
}

export interface Room {
  _id: string;
  name: string;
  slug: string;
  isActive: boolean;
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
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [deleteLoading, setDeleteLoading] = useState<{ [id: string]: boolean }>(
    {}
  );
  const [showWarning, setShowWarning] = useState<boolean>(false);
  const { confirm } = useConfirmationModal();

  useEffect(() => {
    const getRooms = async () => {
      setLoading(true);
      try {
        const res = await fetchRooms();
        setRooms(res);
        const hasInactiveRooms = res.some((room: Room) => !room.isActive);
        setShowWarning(hasInactiveRooms);
      } catch (err) {
        console.log("error Fetching rooms: ", err);
        toast.error("Failed to fetch rooms");
      } finally {
        setLoading(false);
      }
    };
    getRooms();
  }, []);

  useEffect(() => {
    const checkingSubscriptionStatus = async () => {
      try {
        const res = await isPremiumUser();
        if (res.data.isPremiumUser) {
          setIsPremium(true);
        } else {
          setIsPremium(false);
        }
      } catch (err) {
        if (axios.isAxiosError(err)) {
          toast.error(err?.response?.data.message);
        } else {
          toast.error("An unexpected error occurred.");
        }
      }
    };
    checkingSubscriptionStatus();
  }, []);

  const handleUpgradePlan = () => {
    onSectionChange("upgrade");
  };

  const handleCopyLink = (slug: string) => {
    navigator.clipboard.writeText(slug);
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

  const handleDeleteRoom = async (roomId: string) => {
    confirm(
      "Are you sure you want to delete this room?. once you deleted then it will be lost for ever",
      async () => {
        try {
          setDeleteLoading((prev) => ({ ...prev, [roomId]: true }));
          await deleteRoom(roomId);
          setRooms((prev) => prev.filter((room) => room._id !== roomId));
          toast.success("Room deleted successfully");
        } catch (err) {
          if (axios.isAxiosError(err)) {
            toast.error(err?.response?.data.message || "Failed to delete room");
          } else {
            toast.error("An unexpected error occurred.");
          }
        } finally {
          setDeleteLoading((prev) => ({ ...prev, [roomId]: false }));
        }
      }
    );
  };

  const handleSectionChange = (sec: string) => {
    if (sec === "create-meeting" && !isPremium && rooms.length > 0) {
      toast.error("You need to upgrade to premium to create more rooms.");
      return;
    }
    if (selectedSection === sec) return;
    const curSec = selectedSection;
    onSectionChange(sec);
    setPrevSection(curSec);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-80">
        <div className="w-16 h-16 border-5 border-t-transparent border-b-transparent border-yellow-400 rounded-full animate-spin" />
        <p className="mt-4 text-gray-600">Loading rooms...</p>
      </div>
    );
  }

  return (
    <>
      <p className="text-xl raleway font-semibold my-2 ml-1 text-gray-600">
        My rooms
      </p>
      {showWarning && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded-lg shadow-md flex items-center justify-between">
          <div className="flex items-center">
            <svg
              className="w-6 h-6 text-red-500 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-gray-800 text-sm">
              Your premium plan is past due. Please renew your subscription to
              regain access to all premium features and archived rooms.{" "}
              <div
                onClick={handleUpgradePlan}
                className="text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Upgrade Now
              </div>
            </p>
          </div>
          <button
            onClick={() => setShowWarning(false)}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
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

      <div className="space-y-4 max-h-[55vh] no-scrollbar overflow-y-auto mt-4">
        {rooms?.map((room, ind) => (
          <div
            key={ind}
            className={`bg-white p-4 rounded-lg shadow-md flex items-center justify-between ${
              !room.isActive ? "opacity-70" : ""
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded text-sm font-medium">
                {user?.username
                  ?.split(" ")
                  .map((a) => a[0].toUpperCase())
                  .join("")}
              </div>
              <div>
                <p className="text-gray-500 text-sm">
                  {process.env.NEXT_PUBLIC_DOMAIN + "/" + room.slug}
                </p>
                <p className="text-gray-800 font-medium">{room.name}</p>
                <p className="text-gray-500 text-sm">
                  {user?.username}
                  {!room.isActive && " (Archived)"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopyLink(room.slug)}
                className={`px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition ${
                  copied[room.slug] || !room.isActive ? "" : "cursor-pointer"
                }`}
                disabled={!room.isActive}
              >
                {copied[room.slug] ? "Copied!" : "Copy link"}
              </button>
              <button
                onClick={() => handleStartMeeting(room.slug)}
                className={`px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition ${
                  !room.isActive ? "cursor-not-allowed" : "cursor-pointer"
                }`}
                disabled={!room.isActive}
              >
                Start meeting
              </button>
              <button
                onClick={() => handleDeleteRoom(room._id)}
                className={`p-2 text-gray-500 hover:text-gray-700 ${
                  deleteLoading[room._id]
                    ? "cursor-not-allowed"
                    : "cursor-pointer"
                }`}
                disabled={deleteLoading[room._id]}
              >
                {deleteLoading[room._id] ? (
                  <div className="w-5 h-5 border-2 border-t-transparent border-gray-500 rounded-full animate-spin" />
                ) : (
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
                )}
              </button>
            </div>
          </div>
        ))}
        {rooms.length === 0 && (
          <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center justify-center min-h-[200px] text-center">
            <svg
              className="w-12 h-12 text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7m-9 4h-4m4 4h-4m8-8h-4m4 4h-4"
              />
            </svg>
            <p className="text-gray-600 text-lg font-medium mb-2">
              No rooms available
            </p>
            <p className="text-gray-500 text-sm mb-4">
              Create a new room to get started!
            </p>
            <button
              onClick={() => handleSectionChange("create-meeting")}
              className="px-4 py-2 bg-yellow-500 cursor-pointer text-white rounded-lg hover:bg-yellow-600 transition transform hover:scale-105"
            >
              + Create Room
            </button>
          </div>
        )}
      </div>

      <div className="mt-6">
        <button
          onClick={handleJoinRoom}
          className="px-4 py-1 text-lg text-white rounded-lg bg-gray-500 hover:bg-gray-600 cursor-pointer transition w-full"
        >
          Enter a Room
        </button>
      </div>

      {rooms.length > 0 && (
        <button
          onClick={() => handleSectionChange("create-meeting")}
          className="fixed bottom-6 z-10 right-6 px-6 py-3 cursor-pointer bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 transition transform hover:scale-105"
        >
          + Create Room
        </button>
      )}
    </>
  );
}
