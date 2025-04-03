"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { logout } from "@/lib/api/admin/authApi";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/admin/auth/login");
    } catch (err: unknown) {
      console.log(err);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 bg-gray-200 text-gray-700 mx-2 px-4 py-2 rounded-xl shadow-md hover:bg-black hover:text-yellow-300 cursor-pointer transition"
    >
      <LogOut size={20} /> Logout
    </button>
  );
}
