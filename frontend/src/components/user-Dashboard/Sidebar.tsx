"use client";

import Link from "next/link";
import {
  Settings,
  // Megaphone,
  Building,
  CreditCard,
  Rocket,
  User,
  LogOut,
  Video,
  Clock,
  LayoutDashboard,
} from "lucide-react";
import { useState, useRef, Dispatch, SetStateAction } from "react";
import { logoutUser } from "@/lib/api/user/authApi";
import { UserData } from "@/types/type";
import { useAuth } from "@/context/AuthContext";

const Sidebar: React.FC<{
  user: UserData | null;
  onSectionChange: Dispatch<SetStateAction<string>>;
  selectedSection: string;
  setPrevSection: Dispatch<SetStateAction<string>>;
}> = ({ user, onSectionChange, selectedSection, setPrevSection }) => {
  const { logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    try {
      await logoutUser();
      logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const getStyle = (item: string) => {
    if (selectedSection === item) {
      return "flex items-center mx-2 bg-gray-200 text-gray-700 rounded-lg cursor-pointer transition";
    } else {
      return "flex items-center mx-2 light-bg text-gray-700 rounded-lg transition cursor-pointer";
    }
  };

  const handleSectionChange = (sec: string) => {
    if (selectedSection === sec) return;
    const curSec = selectedSection;
    onSectionChange(sec);
    setPrevSection(curSec);
  };

  return (
    <aside className=" bg-white shadow-md min-h-screen">
      <div className="p-4 flex items-center justify-between gap-12 bg-white shadow-sm">
        <Link href={"/"} className="text-4xl font-bold lobster cursor-pointer">
          <span className="text-yellow-500">w</span>ebiLink
        </Link>

        <div className="relative" ref={dropdownRef}>
          <div
            onClick={() => setShowDropdown(!showDropdown)}
            className="w-14 h-14 cursor-pointer rounded-full bg-gray-500 flex items-center justify-center text-2xl font-bold text-white border-2 border-gray-400 hover:scale-105 transition-all"
          >
            {user?.avatar !== "" ? (
              <img
                src={user?.avatar}
                alt="Avatar"
                className="w-full h-full rounded-full border-white relative z-10"
              />
            ) : (
              user.username
                ?.split(" ")
                .map((a) => a[0].toUpperCase())
                .join("")
            )}
          </div>
        </div>
      </div>
      <nav className="mt-4 h-[520px] flex flex-col justify-between">
        <ul className="space-y-2">
          <li
            onClick={() => {
              handleSectionChange("create-meeting");
            }}
            className="text-white bg-gray-300 transition mx-2 flex justify-center cursor-pointer"
          >
            <button className="flex items-center justify-center gap-2 px-4 py-1 cursor-pointer rounded-lg">
              <span className="text-2xl">+</span> Create Meeting
            </button>
          </li>
          <li
            onClick={() => handleSectionChange("dashboard")}
            className={getStyle("dashboard")}
          >
            <button className="flex items-center gap-2 px-4 py-2 cursor-pointer rounded-lg">
              <LayoutDashboard size={24} />
              Overview
            </button>
          </li>
          <li
            onClick={() => {
              handleSectionChange("profile");
            }}
            className={getStyle("profile")}
          >
            <button className="flex items-center gap-2 px-4 py-2 cursor-pointer rounded-lg">
              <User size={24} />
              Profile
            </button>
          </li>
          <li
            onClick={() => {
              handleSectionChange("rooms");
            }}
            className={getStyle("rooms")}
          >
            <button className="flex items-center gap-2 px-4 py-2 cursor-pointer rounded-lg">
              <Building size={24} />
              Rooms
            </button>
          </li>
          <li
            onClick={() => {
              handleSectionChange("recordings");
            }}
            className={getStyle("recordings")}
          >
            <button className="flex items-center gap-2 px-4 py-2 cursor-pointer rounded-lg">
              <Video size={24} />
              Recordings
            </button>
          </li>
          <li
            onClick={() => handleSectionChange("history")}
            className={getStyle("history")}
          >
            <button className="flex items-center gap-2 px-4 py-2 cursor-pointer rounded-lg">
              <Clock size={24} />
              History
            </button>
          </li>
          <li
            onClick={() => {
              handleSectionChange("settings");
            }}
            className={getStyle("settings")}
          >
            <button className="flex items-center gap-2 px-4 py-2 cursor-pointer">
              <Settings size={24} />
              Settings
            </button>
          </li>
          <li
            onClick={() => {
              handleSectionChange("subscription");
            }}
            className={getStyle("subscription")}
          >
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition">
              <CreditCard size={24} />
              Subscription
            </button>
          </li>
          <li
            onClick={() => {
              handleSectionChange("upgrade");
            }}
            className={getStyle("upgrade")}
          >
            <button className="flex items-center gap-2 px-4 py-2 text-gray-700 rounded-lg transition cursor-pointer">
              <Rocket size={24} />
              Upgrade to Pro
            </button>
          </li>
        </ul>
        <div
          className="flex items-center gap-2 hover:bg-red-100 mx-2 rounded-lg bg-red-50 text-gray-800 cursor-pointer transition-all"
          onClick={handleLogout}
        >
          <button className="flex items-center gap-2 px-4 py-2 cursor-pointer">
            <LogOut size={24} />
            Logout
          </button>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
