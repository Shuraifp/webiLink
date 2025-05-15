"use client";

import { useState, useEffect } from "react";
import { Search, Filter } from "lucide-react";
import LogoutButton from "@/components/admin/LogoutButton";
import { fetchSubscriptions } from "@/lib/api/admin/subscriptionApi";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import { PlanStatus, IUserPlan } from "@/types/plan";
import { Plan } from "@/types/plan";

interface Subscription {
  userPlan: IUserPlan;
  plan: Plan;
  user: {
    username: string;
    email: string;
  };
}

export default function SubscriptionManagementPage() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const loadSubscriptions = async () => {
      try {
        setLoading(true);
        const response = await fetchSubscriptions({
          page: currentPage,
          limit: itemsPerPage,
          search: searchQuery,
          status:
            statusFilter === "all" ? undefined : (statusFilter as PlanStatus),
        });
        setSubscriptions(response.data);
        setTotalPages(response.totalPages);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          toast.error(err?.response?.data.message);
        } else {
          toast.error("An unexpected error occurred.");
        }
      } finally {
        setLoading(false);
      }
    };
    loadSubscriptions();
  }, [currentPage, searchQuery, statusFilter]);

  const formatDate = (date: Date | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString();
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <>
      <Toaster />
      <header className="bg-white shadow p-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">
          Subscription Management
        </h2>
        <div className="flex items-center gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search subscriptions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="py-2 px-4 border border-gray-300 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="w-5 h-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          </div>
          <LogoutButton />
        </div>
      </header>

      <main className="flex-1 p-8">
        <div className="flex justify-between mb-6">
          <div className="flex items-center gap-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-2 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="past_due">Past Due</option>
              <option value="canceled">Canceled</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Start Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  End Date
                </th>
                {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th> */}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-4">
                    Loading...
                  </td>
                </tr>
              ) : subscriptions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-gray-500">
                    No subscriptions found matching your criteria
                  </td>
                </tr>
              ) : (
                subscriptions.map((sub) => (
                  <tr
                    key={sub.userPlan._id.toString()}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {sub.user.username} ({sub.user.email})
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {sub.plan.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          sub.userPlan.status === PlanStatus.ACTIVE
                            ? "bg-green-100 text-green-800"
                            : sub.userPlan.status === PlanStatus.PAST_DUE
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {sub.userPlan.status.charAt(0).toUpperCase() +
                          sub.userPlan.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(sub.userPlan.currentPeriodStart)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(sub.userPlan.currentPeriodEnd!)}
                    </td>
                    {/* <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {sub.userPlan.status !== PlanStatus.CANCELED && (
                        <button
                          onClick={() => handleCancelSubscription(sub.userPlan._id.toString())}
                          className="text-red-600 hover:text-red-800 cursor-pointer"
                          title="Cancel subscription"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </td> */}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center mt-4">
          <div className="text-gray-600 text-sm">
            Page {currentPage} of {totalPages} (Total: {subscriptions.length}{" "}
            records)
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-sm raleway text-white font-medium transition-all duration-300 ${
                currentPage === 1
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-yellow-500 hover:bg-yellow-600"
              }`}
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-sm raleway text-white font-medium transition-all duration-300 ${
                currentPage === totalPages
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-yellow-500 hover:bg-yellow-600"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
