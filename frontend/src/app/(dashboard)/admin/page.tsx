"use client";

import { useState, useEffect } from "react";
import { Users, Layers, IndianRupee } from "lucide-react";
import LogoutButton from "@/components/admin/LogoutButton";
import { fetchDashboardStats } from "@/lib/api/admin/adminApi";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";
import { Line } from "react-chartjs-2";
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface DashboardStats {
  users: number;
  subscriptions: { planId: string; planName: string; count: number }[];
  totalRevenue: number;
}

interface RevenueData {
  month: string;
  revenue: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"overview" | "revenue">(
    "overview"
  );
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const response = await fetchDashboardStats();
        setStats(response.data);
        // Mock revenue data (replace with API call if available)
        setRevenueData([{ month: "April 2025", revenue: 0 }]);
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
    loadStats();
  }, []);

  const chartData = {
    labels: revenueData.map((data) => data.month),
    datasets: [
      {
        label: "Monthly Revenue",
        data: revenueData.map((data) => data.revenue),
        borderColor: "rgb(255, 205, 86)",
        backgroundColor: "rgba(255, 205, 86, 0.2)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      title: { display: true, text: "Revenue Trend" },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: "Revenue (₹)" },
      },
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-transparent border-yellow-400 rounded-full animate-spin" />
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
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
          Admin Dashboard
        </h2>
        <LogoutButton />
      </div>

      <div className="p-8">
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-xl shadow-lg flex gap-1 relative overflow-hidden">
            <div
              className={`absolute transition-all duration-500 ease-in-out h-full rounded-lg bg-gradient-to-r from-yellow-400 to-yellow-300 z-0 ${
                activeTab === "overview" ? "left-0 w-1/2" : "left-1/2 w-1/2"
              }`}
              style={{
                boxShadow: "0 0 15px rgba(255, 205, 86, 0.7)",
              }}
            />

            <button
              className={`px-8 py-3 cursor-pointer rounded-lg font-semibold z-10 transition-all duration-300 relative ${
                activeTab === "overview"
                  ? "text-white transform scale-105"
                  : "text-gray-700 hover:text-gray-900"
              }`}
              onClick={() => setActiveTab("overview")}
            >
              Overview
              {activeTab === "overview" && (
                <span className="absolute inset-0 rounded-lg animate-pulse bg-yellow-400 opacity-10 z-0" />
              )}
            </button>

            <button
              className={`px-8 py-3 cursor-pointer rounded-lg font-semibold z-10 transition-all duration-300 relative ${
                activeTab === "revenue"
                  ? "text-white transform scale-105"
                  : "text-gray-700 hover:text-gray-900"
              }`}
              onClick={() => setActiveTab("revenue")}
            >
              Revenue
              {activeTab === "revenue" && (
                <span className="absolute inset-0 rounded-lg animate-pulse bg-yellow-400 opacity-10 z-0" />
              )}
            </button>
          </div>
        </div>

        {activeTab === "overview" && (
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
                    {stats?.subscriptions.reduce(
                      (sum, sub) => sum + sub.count,
                      0
                    ) || 0}
                  </p>
                </div>
              </div>
              {/* <div className="bg-white p-6 rounded-xl shadow-lg flex items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 raleway">
                    Total Meetings
                  </h3>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats?.meetings || 0}
                  </p>
                </div>
              </div> */}
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
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-lg font-semibold text-gray-800 raleway mb-4">
                Subscriptions by Plan
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
                    </tr>
                  </thead>
                  <tbody>
                    {stats?.subscriptions.map((sub, i) => (
                      <tr
                        key={sub.planId + i}
                        className="border-b border-gray-100"
                      >
                        <td className="px-4 py-2 text-gray-800">
                          {sub.planName}
                        </td>
                        <td className="px-4 py-2 text-gray-600">{sub.count}</td>
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

            <div className="mt-6 flex gap-4">
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
        )}

        {activeTab === "revenue" && (
          <div>
            <div className="bg-white p-6 rounded-xl shadow-lg mb-6">
              <h3 className="text-lg font-semibold text-gray-800 raleway mb-4">
                Revenue Trend
              </h3>
              <Line data={chartData} options={chartOptions} />
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-lg font-semibold text-gray-800 raleway mb-4">
                Recent Transactions
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-2 text-left text-gray-600 raleway">
                        User
                      </th>
                      <th className="px-4 py-2 text-left text-gray-600 raleway">
                        Plan
                      </th>
                      <th className="px-4 py-2 text-left text-gray-600 raleway">
                        Amount
                      </th>
                      <th className="px-4 py-2 text-left text-gray-600 raleway">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Mock data; replace with API call */}
                    <tr className="border-b border-gray-100">
                      <td className="px-4 py-2 text-gray-800">john_doe</td>
                      <td className="px-4 py-2 text-gray-600">Pro Plan</td>
                      <td className="px-4 py-2 text-gray-600">₹999.00</td>
                      <td className="px-4 py-2 text-gray-600">2025-05-01</td>
                    </tr>
                    {/* Add more rows via API */}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
