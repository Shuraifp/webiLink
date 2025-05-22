"use client";

import { useState, useEffect } from "react";
import LogoutButton from "@/components/admin/LogoutButton";
import {
  fetchDashboardStats,
  // fetchMeetingStats,
  // fetchStorageStats,
  // fetchRecentMeetings
} from "@/lib/api/admin/adminApi";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import Overview from "@/components/admin/Overview";
import { Revenue } from "@/components/admin/Revenue";
import { Meetings } from "@/components/admin/Meetings";
import { Storage } from "@/components/admin/Storage";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface Subscription {
  planId: string;
  planName: string;
  count: number;
  growth?: number;
  newSubscribers?: number;
  churnedSubscribers?: number;
}
export interface DashboardStats {
  users: number;
  subscriptions: { planId: string; planName: string; count: number }[];
  totalRevenue: number;
  planTrends: { planId: string; planName: string; count: number }[];
  totalMeetings: number;
  activeMeetings: number;
  totalRecordings: number;
}

interface StorageStats {
  totalRecordings: number;
  totalStorageUsed: number;
  recordingsPerUser: { userId: string; username: string; count: number }[];
}

export interface RecentMeeting {
  id: string;
  roomName: string;
  hostName: string;
  participants: number;
  duration: number;
  startTime: string;
  hasRecording: boolean;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentMeetings, setRecentMeetings] = useState<RecentMeeting[]>([]);
  const [storageStats, setStorageStats] = useState<StorageStats | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [activeTab, setActiveTab] = useState<
    "overview" | "revenue" | "meetings" | "storage"
  >("overview");

  useEffect(() => {
    const loadAllData = async () => {
      try {
        setLoading(true);
        const [
          statsResponse,
          // meetingStatsResponse,
          // storageStatsResponse,
          // recentMeetingsResponse,
        ] = await Promise.all([
          fetchDashboardStats(),
          // fetchMeetingStats(),
          // fetchStorageStats(),
          // fetchRecentMeetings(),
        ]);
        setStats(statsResponse.data);
        // setMeetingStats(meetingStatsResponse.data);
        // setStorageStats(storageStatsResponse.data);
        // setRecentMeetings(recentMeetingsResponse.data);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          const message =
            err.response?.data.message || "Failed to fetch dashboard stats";
          setError(message);
          toast.error(message);
        } else {
          const message = "An unexpected error occurred.";
          setError(message);
          toast.error(message);
        }
      } finally {
        setLoading(false);
      }
    };
    loadAllData();
  }, []);

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex justify-center items-center flex-col">
          <div className="w-16 h-16 border-4 border-t-transparent border-yellow-400 rounded-full animate-spin" />
          <p className="mt-4 text-gray-600">Loading dashboard..</p>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="p-8 text-center text-red-600">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Toaster />
      <div className="bg-white shadow p-4 flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-800 raleway">
          Dashboard Overview
        </h2>
        <LogoutButton />
      </div>

      <div className="p-8">
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-xl shadow-lg flex gap-1 relative ">
            <div
              className={`absolute transition-all duration-500 ease-in-out h-full rounded-lg bg-gradient-to-r from-yellow-400 to-yellow-300 z-0`}
              style={{
                boxShadow: "0 0 15px rgba(255, 205, 86, 0.7)",
                left:
                  activeTab === "overview"
                    ? "0%"
                    : activeTab === "meetings"
                    ? "25%"
                    : activeTab === "storage"
                    ? "50%"
                    : "75%",
                width: "25%",
              }}
            />

            <button
              className={`px-6 py-3 cursor-pointer rounded-lg font-semibold z-10 transition-all duration-300 relative whitespace-nowrap ${
                activeTab === "overview"
                  ? "text-white transform scale-105"
                  : "text-gray-700 hover:text-gray-900"
              }`}
              onClick={() => setActiveTab("overview")}
            >
              Overview
            </button>

            <button
              className={`px-6 py-3 cursor-pointer rounded-lg font-semibold z-10 transition-all duration-300 relative whitespace-nowrap ${
                activeTab === "meetings"
                  ? "text-white transform scale-105"
                  : "text-gray-700 hover:text-gray-900"
              }`}
              onClick={() => setActiveTab("meetings")}
            >
              Meetings
            </button>

            <button
              className={`px-6 py-3 cursor-pointer rounded-lg font-semibold z-10 transition-all duration-300 relative whitespace-nowrap ${
                activeTab === "storage"
                  ? "text-white transform scale-105"
                  : "text-gray-700 hover:text-gray-900"
              }`}
              onClick={() => setActiveTab("storage")}
            >
              Storage
            </button>

            <button
              className={`px-6 py-3 cursor-pointer rounded-lg font-semibold z-10 transition-all duration-300 relative whitespace-nowrap ${
                activeTab === "revenue"
                  ? "text-white transform scale-105"
                  : "text-gray-700 hover:text-gray-900"
              }`}
              onClick={() => setActiveTab("revenue")}
            >
              Revenue
            </button>
          </div>
        </div>

        {activeTab === "overview" && (
          <Overview
            stats={stats!}
            formatDuration={formatDuration}
            recentMeetings={recentMeetings}
          />
        )}

        {activeTab === "revenue" && <Revenue />}

        {activeTab === "meetings" && (
          <Meetings
            recentMeetings={recentMeetings}
            formatDuration={formatDuration}
          />
        )}

        {activeTab === "storage" && <Storage />}
      </div>
    </div>
  );
}
