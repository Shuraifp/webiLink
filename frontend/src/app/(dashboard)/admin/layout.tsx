"use client";

import Sidebar from "@/components/admin/Sidebar";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { admin } = useAuth();
  const router = useRouter();

  
  useEffect(()=>{
    if (!admin.adminStatus?.isAuthenticated) {
      router.push("/admin/auth/login");
  }
},[])

if (admin.isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <div className="w-16 h-16 border-5 border-t-transparent border-b-transparent border-yellow-400 rounded-full animate-spin" />
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    );
  }
  
  if (!admin.adminStatus?.isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-100 overflow-y-scroll">
      <Sidebar />

      <div className="flex-1">{children}</div>
    </div>
  );
}
