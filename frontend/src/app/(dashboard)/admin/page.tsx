"use client";

import { useState, useEffect } from "react";
import { Users, Layers } from "lucide-react";
import LogoutButton from "@/components/admin/LogoutButton";
import { fetchDashboardStats } from "@/lib/api/admin/adminApi";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

interface DashboardStats {
  users: number;
  subscriptions: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const response = await fetchDashboardStats();
        console.log(response)
        setStats(response);
      } catch (err) {
        console.log(err)
        if (axios.isAxiosError(err)) {
          setError(err?.response?.data.message || "Failed to fetch dashboard stats");
          toast.error(err?.response?.data.message || "Failed to fetch dashboard stats");
        } else {
          setError("An unexpected error occurred.");
          toast.error("An unexpected error occurred.");
        }
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  if (loading) {
    return <div className="p-8 text-center">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-600">{error}</div>;
  }

  return (
    <div className="p-8">
      <Toaster />
      <div className="flex justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Dashboard</h2>
        <LogoutButton />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center gap-4">
          <div className="bg-purple-100 p-3 rounded-full">
            <Users className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Users</h3>
            <p className="text-2xl font-bold text-gray-900">{stats?.users || 0}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center gap-4">
          <div className="bg-yellow-100 p-3 rounded-full">
            <Layers className="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Subscriptions</h3>
            <p className="text-2xl font-bold text-gray-900">{stats?.subscriptions || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
}