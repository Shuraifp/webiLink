"use client";

import { DashboardStats, RecentMeeting } from "@/app/(dashboard)/admin/page";
import {
  Calendar,
  HardDrive,
  IndianRupee,
  Layers,
  Users,
  Video,
} from "lucide-react";
import Link from "next/link";
import React from "react";

export default function Overview({
  stats,
  recentMeetings,
  formatDuration
}: {
  stats: DashboardStats;
  recentMeetings: RecentMeeting[];
  formatDuration: (minutes:number)=>string
}) {
  const sorted = stats?.planTrends.sort((a,b)=>b.count-a.count)
  const total = sorted.reduce((acc, curr) => acc + curr.count, 0);
  const precList = sorted?.map((sub) => {
    return ((sub.count / total) * 100).toFixed(2);
  }
  );
     
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-xl shadow-lg flex items-center gap-4">
          <div className="bg-purple-100 p-3 rounded-full">
            <Users className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 raleway">
              Active Users
            </h3>
            <p className="text-2xl font-bold text-gray-900">
              {stats?.users || 0}
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg flex items-center gap-4">
          <div className="bg-yellow-100 p-3 rounded-full">
            <Layers className="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 raleway">
              Total Subscriptions
            </h3>
            <p className="text-2xl font-bold text-gray-900">
              {stats?.subscriptions.reduce((sum, sub) => sum + sub.count, 0) ||
                0}
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-full">
            <Calendar className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 raleway">
              Total Meetings
            </h3>
            <p className="text-2xl font-bold text-gray-900">
              {stats?.totalMeetings || 0}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-xl shadow-lg flex items-center gap-4">
          <div className="bg-green-100 p-3 rounded-full">
            <IndianRupee className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 raleway">
              Total Revenue
            </h3>
            <p className="text-2xl font-bold text-gray-900">
              ₹{(stats?.totalRevenue || 0).toFixed(2)}
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg flex items-center gap-4">
          <div className="bg-teal-100 p-3 rounded-full">
            <Video className="w-6 h-6 text-teal-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 raleway">
              Ongoing Meetings
            </h3>
            <p className="text-2xl font-bold text-gray-900">
              {stats?.activeMeetings || 0}
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg flex items-center gap-4">
          <div className="bg-red-100 p-3 rounded-full">
            <HardDrive className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 raleway">
              Total Recordings
            </h3>
            <p className="text-2xl font-bold text-gray-900">
              {stats?.totalRecordings || 0}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-6 rounded-xl shadow-lg">
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
                    Duration
                  </th>
                  <th className="px-4 py-2 text-left text-gray-600 raleway">
                    Participants
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentMeetings.map((meeting) => (
                  <tr key={meeting.id} className="border-b border-gray-100">
                    <td className="px-4 py-2 text-gray-800">
                      {meeting.roomName}
                    </td>
                    <td className="px-4 py-2 text-gray-600">
                      {meeting.hostName}
                    </td>
                    <td className="px-4 py-2 text-gray-600">
                      {formatDuration(meeting.duration)}
                    </td>
                    <td className="px-4 py-2 text-gray-600">
                      {meeting.participants}
                    </td>
                  </tr>
                ))}
                {recentMeetings.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-2 text-center text-gray-600"
                    >
                      No recent meetings
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 raleway mb-4">
            Trending Plans
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-2 text-left text-gray-600 raleway">
                    Plan
                  </th>
                  <th className="px-4 py-2 text-left text-gray-600 raleway">
                    Subscribers
                  </th>
                  <th className="px-4 py-2 text-left text-gray-500 raleway">
                    Perc
                  </th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((sub, i) => (
                  <tr key={sub.planId + i} className="border-b border-gray-100">
                    <td className="px-4 py-2 text-gray-800">{sub.planName}</td>
                    <td className="px-4 py-2 text-gray-600">{sub.count}</td>
                    <td className="px-4 py-2 text-green-400">{precList[i]} %</td>
                  </tr>
                ))}
                {(!stats?.subscriptions ||
                  stats.subscriptions.length === 0) && (
                  <tr>
                    <td
                      colSpan={2}
                      className="px-4 py-2 text-center text-gray-600"
                    >
                      No active subscriptions
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-center gap-4">
        <Link
          href="/admin/users"
          className="px-6 py-3 rounded-lg bg-yellow-400 text-white font-medium raleway hover:bg-yellow-500 transition-all duration-300"
        >
          Manage Users
        </Link>
        <Link
          href="/admin/plans"
          className="px-6 py-3 rounded-lg bg-yellow-400 text-white font-medium raleway hover:bg-yellow-500 transition-all duration-300"
        >
          Manage Plans
        </Link>
      </div>
    </div>
  );
}
