"use client";

import Link from "next/link";
import {
  Settings,
  Megaphone,
  Building,
  CreditCard,
  Rocket,
  User,
  LogOut,
} from "lucide-react";
import { useState, useRef, useEffect, Dispatch, SetStateAction } from "react";
import { logout } from "@/lib/api/user/authApi";
import { useRouter } from "next/navigation";
import { UserData } from "@/types/type";

const Sidebar: React.FC<{
  user: UserData;
  onSectionChange: Dispatch<SetStateAction<string>>;
  selectedSection: string;
  setPrevSection: Dispatch<SetStateAction<string>>;
}> = ({ user, onSectionChange, selectedSection, setPrevSection }) => {
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      router.replace("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const getStyle = (item: string) => {
    if (selectedSection === item) {
      return "flex items-center mx-2 bg-gray-200 text-gray-700 rounded-lg cursor-pointer transition";
    } else {
      return "flex items-center mx-2 hover:bg-gray-100 text-gray-700 rounded-lg transition cursor-pointer";
    }
  };

  const handleSectionChange = (sec:string) => {
    if(selectedSection === sec) return
    const curSec = selectedSection
    onSectionChange(sec)
    setPrevSection(curSec)
  }

  return (
    <aside className=" bg-white shadow-md">
      <div className="p-4 flex items-center justify-between gap-12 bg-white shadow-md">
        <Link href={"/"} className="text-4xl font-bold lobster cursor-pointer">
          <span className="text-yellow-500">w</span>ebiLink
        </Link>

        <div className="relative" ref={dropdownRef}>
          <div
            onClick={() => setShowDropdown(!showDropdown)}
            className="w-14 h-14 cursor-pointer rounded-full bg-gray-500 flex items-center justify-center text-2xl font-bold text-white border-2 border-gray-400 hover:scale-105 transition-all"
          >
            {user.username?.split(' ').map((a) => a[0].toUpperCase()).join('')}
          </div>

          {showDropdown && (
            <div className="absolute right-0 mt-3 w-48 bg-white shadow-xl rounded-lg overflow-hidden border border-gray-200 animate-fade-in">
              <ul className="text-gray-700">
                <li className="flex items-center gap-2 px-4 py-3 hover:bg-gray-100 cursor-pointer transition-all">
                  <User className="w-5 h-5 text-gray-600" />
                  Profile
                </li>
                <li
                  className="flex items-center gap-2 px-4 py-3 hover:bg-red-100 text-red-500 cursor-pointer transition-all"
                  onClick={handleLogout}
                >
                  <LogOut className="w-5 h-5 text-red-500" />
                  Sign Out
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
      <nav className="mt-4">
        <ul className="space-y-2">
          <li
            onClick={() => {
              handleSectionChange("create-meeting");
            }}
            className="text-gray-700 bg-gray-300 hover:bg-gray-300 transition mx-2 flex justify-center cursor-pointer"
          >
            <button className="flex items-center justify-center gap-2 px-4 py-1 cursor-pointer">
              <span className="text-blue-500 text-2xl">+</span> Create Meeting
            </button>
          </li>
          <li
            onClick={() => {
              handleSectionChange("rooms");
            }}
            className={getStyle("rooms")}
          >
            <button className="flex items-center gap-2 px-4 py-2  rounded-lg">
              <Building size={24} />
              Rooms
            </button>
          </li>
          <li
            onClick={() => {
              handleSectionChange("settings");
            }}
            className={getStyle("settings")}
          >
            <button className="flex items-center gap-2 px-4 py-2">
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
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg transition">
              <CreditCard size={24} />
              Subscription
            </button>
          </li>
          <li
            onClick={() => {
              handleSectionChange("whats-new");
            }}
            className={getStyle("whats-new")}
          >
            <button className="flex items-center gap-2 px-4 py-2 text-gray-700 rounded-lg transition">
              <Megaphone size={24} />
              {`What's new`}
            </button>
          </li>
          <li
            onClick={() => {
              handleSectionChange("upgrade");
            }}
            className={getStyle("upgrade")}
          >
            <button className="flex items-center gap-2 px-4 py-2 text-gray-700 rounded-lg transition">
              <Rocket size={24} />
              Upgrade to Pro
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
