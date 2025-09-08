"use client";

import { fetchDashboardStats } from "@/lib/api/admin/recording";
import { StorageStats } from "@/types/adminDashboard";
import { HardDrive } from "lucide-react";
import { useEffect, useState } from "react";

export function Storage() {
  const [storageStats, setStorageStats] = useState<StorageStats | null>({
        totalRecordings: 0,
        totalStorageUsed: 0,
        recordingsPerUser: []
      });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatStorageSize = (bytes:number) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    else if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    else return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  };

  const fetchStorageStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetchDashboardStats();
      setStorageStats(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch storage stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStorageStats();
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-6 rounded-xl shadow-lg flex items-center gap-4">
          <div className="bg-red-100 p-3 rounded-full">
            <HardDrive className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 raleway">
              Total Recordings
            </h3>
            <p className="text-2xl font-bold text-gray-900">
              {storageStats?.totalRecordings || 0}
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg flex items-center gap-4">
          <div className="bg-indigo-100 p-3 rounded-full">
            <HardDrive className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 raleway">
              Total Storage Used
            </h3>
            <p className="text-2xl font-bold text-gray-900">
              {storageStats
                ? formatStorageSize(storageStats.totalStorageUsed)
                : "0 B"}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-lg font-semibold text-gray-800 raleway mb-4">
          Top Recording Users
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-2 text-left text-gray-600 raleway">
                  User
                </th>
                <th className="px-4 py-2 text-left text-gray-600 raleway">
                  Recordings
                </th>
              </tr>
            </thead>
            <tbody>
              {storageStats?.recordingsPerUser.slice(0, 10).map((item) => (
                <tr key={item.userId} className="border-b border-gray-100">
                  <td className="px-4 py-2 text-gray-800">{item.username}</td>
                  <td className="px-4 py-2 text-gray-600">{item.count}</td>
                </tr>
              ))}
              {(!storageStats?.recordingsPerUser ||
                storageStats.recordingsPerUser.length === 0) && (
                <tr>
                  <td
                    colSpan={2}
                    className="px-4 py-2 text-center text-gray-600"
                  >
                    No recording data available
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
