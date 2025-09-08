"use client";

import { fetchMeetingStats } from "@/lib/api/admin/adminApi";
import { MeetingStats, RecentMeeting } from "@/types/adminDashboard";
import axios from "axios";
import { Calendar, Clock, Users } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";


export function Meetings({
  recentMeetings,
  formatDuration,
}: {
  recentMeetings: RecentMeeting[];
  formatDuration: (minutes: number) => string;
}) {
  const [meetingStats, setMeetingStats] = useState<MeetingStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const calculateMeetingStats = async () => {
      try {
        setLoading(true);
        const res = await fetchMeetingStats();
        setMeetingStats(res.data);
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
    }
    calculateMeetingStats();
  }, []);

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
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-xl shadow-lg flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-full">
            <Calendar className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 raleway">
              Total Meetings
            </h3>
            <p className="text-2xl font-bold text-gray-900">
              {meetingStats?.totalMeetings || 0}
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg flex items-center gap-4">
          <div className="bg-teal-100 p-3 rounded-full">
            <Clock className="w-6 h-6 text-teal-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 raleway">
              Total Meeting Hours
            </h3>
            <p className="text-2xl font-bold text-gray-900">
              {meetingStats
                ? formatDuration(meetingStats.totalDuration)
                : "0h 0m"}
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg flex items-center gap-4">
          <div className="bg-purple-100 p-3 rounded-full">
            <Users className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 raleway">
              Total Participants
            </h3>
            <p className="text-2xl font-bold text-gray-900">
              {meetingStats?.totalParticipants || 0}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg mb-6">
        <h3 className="text-lg font-semibold text-gray-800 raleway mb-4">
          Recent Meetings
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-2 text-left text-gray-600 raleway">
                  Room
                </th>
                <th className="px-4 py-2 text-left text-gray-600 raleway">
                  Host
                </th>
                <th className="px-4 py-2 text-left text-gray-600 raleway">
                  Start Time
                </th>
                <th className="px-4 py-2 text-left text-gray-600 raleway">
                  End Time
                </th>
                <th className="px-4 py-2 text-left text-gray-600 raleway">
                  Duration
                </th>
                <th className="px-4 py-2 text-left text-gray-600 raleway">
                  Participants
                </th>
              </tr>
            </thead>
            <tbody>
              {recentMeetings?.map((meeting) => (
                <tr key={meeting.id} className="border-b border-gray-100">
                  <td className="px-4 py-2 text-gray-800">
                    {meeting.roomName}
                  </td>
                  <td className="px-4 py-2 text-gray-600">
                    {meeting.hostName}
                  </td>
                  <td className="px-4 py-2 text-gray-600">
                    {new Date(meeting.startTime).toLocaleString()}
                  </td>
                  <td className="px-4 py-2 text-gray-600">
                    {new Date(meeting.endTime).toLocaleString()}
                  </td>
                  <td className="px-4 py-2 text-gray-600">
                    {formatDuration(meeting.duration)}
                  </td>
                  <td className="px-4 py-2 text-gray-600">
                    {meeting.participants}
                  </td>
                </tr>
              ))}
              {recentMeetings?.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-2 text-center text-gray-600"
                  >
                    No meetings available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
