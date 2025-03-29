"use client";

import { useState } from "react";
import { Search, Filter, Plus, Edit, Archive } from "lucide-react";

export default function PlanManagementPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const mockPlans = [
    {
      id: "1",
      name: "Basic",
      price: 9.99,
      duration: "monthly",
      status: "active",
      features: "Up to 10 participants",
    },
    {
      id: "2",
      name: "Pro",
      price: 19.99,
      duration: "monthly",
      status: "active",
      features: "Up to 50 participants, Recording",
    },
    {
      id: "3",
      name: "Enterprise",
      price: 49.99,
      duration: "yearly",
      status: "archived",
      features: "Unlimited participants, Analytics",
    },
    {
      id: "4",
      name: "Starter",
      price: 5.99,
      duration: "monthly",
      status: "active",
      features: "Up to 5 participants",
    },
  ];

  const filteredPlans = mockPlans.filter(
    (plan) =>
      (statusFilter === "all" || plan.status === statusFilter) &&
      (plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plan.features.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <>
      <header className="bg-white shadow p-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">Plan Management</h2>
        <div className="flex items-center gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search plans..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="py-2 px-4 border border-gray-300 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="w-5 h-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Plus className="w-5 h-5" />
            Create Plan
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {/* Filters */}
        <div className="mb-6 flex items-center gap-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-2 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Plans</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        {/* Plans Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Features
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPlans.map((plan) => (
                <tr key={plan.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {plan.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${plan.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {plan.duration.charAt(0).toUpperCase() +
                      plan.duration.slice(1)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {plan.features}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        plan.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {plan.status.charAt(0).toUpperCase() +
                        plan.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit plan"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        className={`${
                          plan.status === "active"
                            ? "text-orange-600 hover:text-orange-800"
                            : "text-gray-400 cursor-not-allowed"
                        }`}
                        disabled={plan.status !== "active"}
                        title={
                          plan.status === "active"
                            ? "Archive plan"
                            : "Plan already archived"
                        }
                      >
                        <Archive className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* If no plans found */}
        {filteredPlans.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No plans found matching your criteria
          </div>
        )}
      </main>
    </>
  );
}
