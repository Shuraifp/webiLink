"use client";

import { UserData } from "@/types/type";
import { Dispatch, SetStateAction, useState, useEffect, useRef } from "react";
import { X, Share2, MessageCircle, Send, Mail, Copy } from "lucide-react";
import { useRouter } from "next/navigation";
import { fetchRooms, deleteRoom } from "@/lib/api/user/roomApi";
import { isPremiumUser } from "@/lib/api/user/planApi";
import axios from "axios";
import toast from "react-hot-toast";
import { useConfirmationModal } from "./ConfirmationModal";
import { createPortal } from "react-dom";

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
  const [sharePanelSlug, setSharePanelSlug] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const shareButtonRef = useRef<HTMLButtonElement | null>(null);
  const { confirm } = useConfirmationModal();
  console.log(copied)
  useEffect(() => {
    const getRooms = async () => {
      setLoading(true);
      try {
        const res = await fetchRooms();
        console.log("Fetched rooms:", res);
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
    const roomUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/room/${slug}`;
    navigator.clipboard.writeText(roomUrl);
    setCopied((prev) => ({ ...prev, [slug]: true }));
    toast.success("Link copied to clipboard!");

    setTimeout(() => {
      setCopied((prev) => ({ ...prev, [slug]: false }));
    }, 2000);
    setSharePanelSlug(null); // Close panel
  };

  const handleStartMeeting = (slug: string) => {
    router.push("/room/" + slug);
  };

  const handleJoinRoom = () => {
    setIsModalOpen(true);
  };

  const handleDeleteRoom = async (roomId: string) => {
    confirm(
      "Are you sure you want to delete this room? Once deleted, it will be lost forever",
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

  // useEffect(() => {
  //   const handleClickOutside = (event: MouseEvent) => {
  //     console.log("Click event target:", event.target);
  //     if (
  //       panelRef.current &&
  //       !panelRef.current.contains(event.target as Node) &&
  //       shareButtonRef.current &&
  //       !shareButtonRef.current.contains(event.target as Node)
  //     ) {
  //       console.log("Closing share panel due to outside click");
  //       setSharePanelSlug(null);
  //     }
  //   };
  //   document.addEventListener("click", handleClickOutside);
  //   return () => document.removeEventListener("click", handleClickOutside);
  // }, []);

  const activeRoom = rooms.find((room) => room.slug === sharePanelSlug);
  const isSharePanelOpen = sharePanelSlug && activeRoom && activeRoom.isActive;

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
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded-lg shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center flex-1">
            <svg
              className="w-6 h-6 text-red-500 mr-2 mt-0.5 sm:mt-0 flex-shrink-0"
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
            <div className="flex-1">
              <p className="text-gray-800 text-sm">
                Your premium plan is past due. Please renew your subscription to
                regain access to all premium features and archived rooms.{" "}
                <span
                  onClick={handleUpgradePlan}
                  className="text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer block sm:inline mt-1 sm:mt-0"
                >
                  Upgrade Now
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowWarning(false)}
            className="text-gray-500 hover:text-gray-700 focus:outline-none flex-shrink-0 self-start sm:self-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {isModalOpen && (
        <div
          className="fixed inset-0 z-20 min-h-screen flex justify-center items-center px-4"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <div className="bg-white w-full max-w-md py-8 px-4 rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-5">
              <p className="text-xl sm:text-2xl raleway ml-2 font-semibold text-center text-gray-700">
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

      {isSharePanelOpen &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex justify-end">
            <div
              ref={panelRef}
              className="bg-white w-full max-w-xs h-full border-2 border-yellow-400 p-6 shadow-xl transform transition-transform duration-300 translate-x-0"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-700">
                  Share Room
                </h3>
                <button
                  onClick={() => setSharePanelSlug(null)}
                  className="text-gray-500 hover:text-gray-700 cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-2">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const roomUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/room/${activeRoom.slug}`;
                    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
                      `Join my video meeting: ${activeRoom.name}\n${roomUrl}`
                    )}`;
                    window.open(whatsappUrl, "_blank");
                    setSharePanelSlug(null);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-sm"
                >
                  <div className="p-1 rounded bg-green-500 text-white">
                    <MessageCircle className="w-3 h-3" />
                  </div>
                  WhatsApp
                </button>

                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const roomUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/room/${activeRoom.slug}`;
                    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(
                      roomUrl
                    )}&text=${encodeURIComponent(
                      `Join my video meeting: ${activeRoom.name}`
                    )}`;
                    window.open(telegramUrl, "_blank");
                    setSharePanelSlug(null);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-sm"
                >
                  <div className="p-1 rounded bg-blue-500 text-white">
                    <Send className="w-3 h-3" />
                  </div>
                  Telegram
                </button>

                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const roomUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/room/${activeRoom.slug}`;
                    const emailUrl = `mailto:?subject=${encodeURIComponent(
                      `Join my video meeting: ${activeRoom.name}`
                    )}&body=${encodeURIComponent(
                      `Hi,\n\nYou're invited to join my video meeting: ${activeRoom.name}\n\nClick here to join: ${roomUrl}\n\nSee you there!`
                    )}`;
                    window.location.href = emailUrl;
                    setSharePanelSlug(null);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-sm"
                >
                  <div className="p-1 rounded bg-gray-500 text-white">
                    <Mail className="w-3 h-3" />
                  </div>
                  Email
                </button>

                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleCopyLink(activeRoom.slug);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-sm"
                >
                  <div className="p-1 rounded bg-purple-500 text-white">
                    <Copy className="w-3 h-3" />
                  </div>
                  Copy Link
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      <div className="space-y-4 mt-4">
        {rooms?.map((room, ind) => (
          <div
            key={ind}
            className={`bg-white p-4 rounded-lg shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
              !room.isActive ? "opacity-70" : ""
            }`}
          >
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-lg text-sm font-medium flex-shrink-0">
                {user?.username
                  ?.split(" ")
                  .map((a) => a[0].toUpperCase())
                  .join("")}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-gray-500 text-sm sm:text-base break-words">
                  {process.env.NEXT_PUBLIC_DOMAIN + "/" + room.slug}
                </p>
                <p
                  className="text-gray-800 font-medium text-base sm:text-lg truncate"
                  title={room.name}
                >
                  {room.name}
                </p>
                <p className="text-gray-500 text-sm sm:text-base">
                  {user?.username}
                  {!room.isActive && " (Archived)"}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
              <button
                ref={shareButtonRef}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log("Opening share panel for", room.slug);
                  setSharePanelSlug(room.slug);
                }}
                className={`px-3 sm:px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition text-sm flex items-center gap-2 ${
                  !room.isActive
                    ? "cursor-not-allowed opacity-50"
                    : "cursor-pointer"
                }`}
                disabled={!room.isActive}
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>

              <button
                onClick={() => handleStartMeeting(room.slug)}
                className={`px-3 sm:px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition text-sm ${
                  !room.isActive ? "cursor-not-allowed" : "cursor-pointer"
                }`}
                disabled={!room.isActive}
              >
                Start meeting
              </button>

              <button
                onClick={() => handleDeleteRoom(room._id)}
                className={`p-2 text-gray-500 hover:text-gray-700 self-center sm:self-auto ${
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
          className="px-4 py-2 text-base sm:text-lg text-white rounded-lg bg-gray-500 hover:bg-gray-600 cursor-pointer transition w-full"
        >
          Enter a Room
        </button>
      </div>

      {rooms.length > 0 && (
        <button
          onClick={() => handleSectionChange("create-meeting")}
          className="fixed bottom-6 z-10 right-6 px-4 sm:px-6 py-2 sm:py-3 cursor-pointer bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 transition transform hover:scale-105 text-sm sm:text-base"
        >
          + Create Room
        </button>
      )}
    </>
  );
}
