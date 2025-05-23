"use client";

import { Dispatch, SetStateAction, useState, useEffect } from "react";
import {
  Clock,
  Video,
  Calendar,
  TrendingUp,
  BarChart3,
  Activity,
} from "lucide-react";
import { getStats } from "@/lib/api/user/overview";

interface DashboardProps {
  onSectionChange: Dispatch<SetStateAction<string>>;
  selectedSection: string;
  setPrevSection: Dispatch<SetStateAction<string>>;
}

interface DashboardStats {
  totalMeetings: number;
  hostedMeetings: number;
  attendedMeetings: number;
  totalDuration: number;
  totalParticipants: number;
  avgMeetingDuration: number;
  thisWeekMeetings: number;
  thisMonthMeetings: number;
}

interface RecentActivity {
  id: string;
  roomName: string;
  duration: number;
  participants: number;
  date: string;
  status: "completed" | "ongoing";
  type: "hosted" | "attended";
  hostName?: string;
}

export default function Dashboard({
  onSectionChange,
  selectedSection,
  setPrevSection,
}: DashboardProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalMeetings: 0,
    hostedMeetings: 0,
    attendedMeetings: 0,
    totalDuration: 0,
    totalParticipants: 0,
    avgMeetingDuration: 0,
    thisWeekMeetings: 0,
    thisMonthMeetings: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const res = await getStats();
        const data = res.data;
        setStats({
          totalMeetings: data.totalMeetings,
          hostedMeetings: data.hostedMeetings,
          attendedMeetings: data.attendedMeetings,
          totalDuration: data.totalDuration,
          totalParticipants: data.totalParticipants,
          avgMeetingDuration: data.avgMeetingDuration,
          thisWeekMeetings: data.thisWeekMeetings,
          thisMonthMeetings: data.thisMonthMeetings,
        });
        setRecentActivity(data.recentActivity);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching dashboard data: ", err);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleSectionChange = (sec: string) => {
    if (selectedSection === sec) return;
    const curSec = selectedSection;
    onSectionChange(sec);
    setPrevSection(curSec);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-80">
        <div className="w-16 h-16 border-5 border-t-transparent border-b-transparent border-yellow-400 rounded-full animate-spin" />
        <p className="mt-4 text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xl raleway font-semibold my-2 ml-1 text-gray-600">
          Overview
        </p>
        <button
          onClick={() => handleSectionChange("rooms")}
          className="px-5 py-2 bg-yellow-500 cursor-pointer text-white rounded-lg hover:bg-yellow-600 transition"
        >
          Start Meeting
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Meetings</p>
              <p className="text-3xl font-bold text-gray-800">
                {stats.totalMeetings}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {stats.hostedMeetings} hosted • {stats.attendedMeetings}{" "}
                attended
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Video className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Duration</p>
              <p className="text-3xl font-bold text-gray-800">
                {formatDuration(stats.totalDuration)}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">This Week</p>
              <p className="text-3xl font-bold text-gray-800">
                {stats.thisWeekMeetings}
              </p>
              <div className="flex items-center mt-1">
                <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                <p className="text-xs text-green-500">+2 from last week</p>
              </div>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Avg Duration</p>
              <p className="text-3xl font-bold text-gray-800">
                {formatDuration(stats.avgMeetingDuration)}
              </p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <BarChart3 className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Recent Activity
          </h3>
          <button
            onClick={() => handleSectionChange("history")}
            className="text-yellow-600 hover:text-yellow-700 text-sm font-medium cursor-pointer"
          >
            View All →
          </button>
        </div>

        <div className="space-y-3 max-h-80 overflow-y-auto no-scrollbar">
          {recentActivity.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    activity.type === "hosted"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {activity.type === "hosted" ? "HOST" : "JOIN"}
                </div>
                <div>
                  <p className="font-medium text-gray-800">
                    {activity.roomName}
                  </p>
                  <p className="text-sm text-gray-500">
                    {activity.type === "attended" && activity.hostName
                      ? `Hosted by ${activity.hostName}`
                      : `${activity.participants} participants`}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">
                  {formatDuration(activity.duration)}
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(activity.date).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>

        {recentActivity.length === 0 && (
          <div className="text-center py-8">
            <Activity className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No recent activity</p>
            <p className="text-sm text-gray-400 mt-1">
              Your meeting activity will appear here
            </p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => handleSectionChange("create-meeting")}
            className="p-4 border-2 border-dashed border-yellow-300 rounded-lg hover:border-yellow-400 hover:bg-yellow-50 transition cursor-pointer group"
          >
            <div className="text-center">
              <div className="bg-yellow-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:bg-yellow-200 transition">
                <span className="text-2xl text-yellow-600">+</span>
              </div>
              <p className="font-medium text-gray-700">Create Meeting</p>
              <p className="text-sm text-gray-500">Start a new room</p>
            </div>
          </button>

          <button
            onClick={() => handleSectionChange("rooms")}
            className="p-4 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition cursor-pointer group"
          >
            <div className="text-center">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:bg-blue-200 transition">
                <Video className="w-5 h-5 text-blue-600" />
              </div>
              <p className="font-medium text-gray-700">My Rooms</p>
              <p className="text-sm text-gray-500">Manage your rooms</p>
            </div>
          </button>

          <button
            onClick={() => handleSectionChange("recordings")}
            className="p-4 border-2 border-dashed border-green-300 rounded-lg hover:border-green-400 hover:bg-green-50 transition cursor-pointer group"
          >
            <div className="text-center">
              <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:bg-green-200 transition">
                <Video className="w-5 h-5 text-green-600" />
              </div>
              <p className="font-medium text-gray-700">Recordings</p>
              <p className="text-sm text-gray-500">View saved meetings</p>
            </div>
          </button>
        </div>
      </div>
    </>
  );
}
