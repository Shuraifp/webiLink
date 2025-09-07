"use client";

import { useState, useEffect } from "react";
import { Search, Filter, Plus, Edit, Archive, Trash, Undo } from "lucide-react";
import LogoutButton from "@/components/admin/LogoutButton";
import {
  createPlan,
  getPlans,
  archivePlan,
  getArchivedPlans,
  restorePlan,
  editPlan,
} from "@/lib/api/admin/planApi";
import { Plan, BillingInterval } from "@/types/plan";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";

export default function PlanManagementPage() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("active");
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [currentFeature, setCurrentFeature] = useState<string>("");
  const [isEditing, setIsEditing] = useState<Plan | null>(null);
  const [newPlan, setNewPlan] = useState<Plan>({
    name: "",
    description: "",
    price: 0,
    billingCycle: {
      interval: BillingInterval.MONTH,
      frequency: 1,
    },
    features: [],
    isArchived: false,
    stripePriceId: "",
  });
  console.log(newPlan);
  useEffect(() => {
    if (statusFilter === "active") {
      fetchPlans();
    } else {
      fetchArchivedPlans();
    }
  }, [statusFilter]);

  const fetchPlans = async () => {
    try {
      const response = await getPlans();
      setPlans(response.data);
    } catch (error) {
      console.error("Error fetching plans:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchArchivedPlans = async () => {
    try {
      const response = await getArchivedPlans();
      setPlans(response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "An error occurred");
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if(newPlan.price===0){
        delete newPlan.billingCycle
      }
      const response = await createPlan(newPlan);
      setPlans([...plans, response.data]);
      setIsCreateModalOpen(false);
      setNewPlan({
        name: "",
        description: "",
        price: 0,
        billingCycle: {
          interval: BillingInterval.MONTH,
          frequency: 1,
        },
        features: [],
        isArchived: false,
        stripePriceId: "",
      });
      toast.success("Plan was created successfully");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "An error occurred");
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  };

  const handleArchivePlan = async (id: string | undefined) => {
    try {
      if (!id) {
        throw new Error("Id was not provided");
      }
      const res = await archivePlan(id);
      setPlans(plans.map((plan) => (plan.id === id ? res : plan)));
      toast.success("Plan was archived successfully");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "An error occurred");
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  };

  const handleRestorePlan = async (id: string | undefined) => {
    try {
      if (!id) {
        throw new Error("Id was not provided");
      }
      const res = await restorePlan(id);
      setPlans(plans.map((plan) => (plan.id === id ? res : plan)));
      toast.success("Plan was restored successfully");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "An error occurred");
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  };

  const handleEditPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if(newPlan.price===0){
        delete newPlan.billingCycle
      }
      const res = await editPlan(newPlan);
      setPlans(plans.map((plan) => (plan.id === newPlan.id ? res : plan)));
      setIsEditing(null);
      setIsCreateModalOpen(false);
      setNewPlan({
        name: "",
        description: "",
        price: 0,
        billingCycle: {
          interval: BillingInterval.MONTH,
          frequency: 1,
        },
        features: [],
        isArchived: false,
        stripePriceId: "",
      });
      toast.success("Plan was updated successfully");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "An error occurred");
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  };

  const formatBillingCycle = (
    billingCycle: Plan["billingCycle"],
    price: number
  ) => {
    if (price === 0) {
      return "free of cost. lifetime access";
    }

    return `Every ${billingCycle?.frequency} ${billingCycle?.interval}${
      billingCycle!.frequency > 1 ? "s" : ""
    }`;
  };

  const handleRemoveFeature = (ind: number) => {
    setNewPlan((prev) => ({
      ...prev,
      features: prev.features.filter((item, id) => id !== ind),
    }));
  };

  const filtered = plans.filter((p) => {
    return (
      (statusFilter === "archived" && p.isArchived) ||
      (statusFilter === "active" && !p.isArchived)
    );
  });

  return (
    <>
      <Toaster />
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
          <LogoutButton />
        </div>
      </header>

      <main className="flex-1 p-8">
        <div className="flex justify-between">
          <div className="mb-6 flex items-center gap-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-2 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {/* <option value="all">All Plans</option> */}
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center mb-6 cursor-pointer gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-5 h-5" />
            Create Plan
          </button>
        </div>

        {/* Create Plan Modal */}
        {isCreateModalOpen && (
          <div
            className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center overflow-y-scroll justify-center z-50"
            style={{ backgroundColor: "rgba(75, 85, 99, 0.5)" }}
          >
            <div className="bg-white rounded-lg p-6 w-full max-w-md my-10 mt-16">
              <h3 className="text-lg font-semibold mb-4">Create New Plan</h3>
              <form onSubmit={isEditing ? handleEditPlan : handleCreatePlan}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <input
                    type="text"
                    value={newPlan.name}
                    onChange={(e) =>
                      setNewPlan({ ...newPlan, name: e.target.value })
                    }
                    className="mt-1 p-2 w-full border rounded-md"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <input
                    type="text"
                    value={newPlan.description}
                    onChange={(e) =>
                      setNewPlan({ ...newPlan, description: e.target.value })
                    }
                    className="mt-1 p-2 w-full border rounded-md"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newPlan.price}
                    onChange={(e) =>
                      setNewPlan({
                        ...newPlan,
                        price: parseFloat(e.target.value),
                      })
                    }
                    className="mt-1 p-2 w-full border rounded-md"
                  />
                </div>
               { newPlan.price > 0 && <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Billing Cycle
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={newPlan.billingCycle?.interval}
                      onChange={(e) =>
                        setNewPlan({
                          ...newPlan,
                          billingCycle: {
                            interval: e.target.value as BillingInterval,
                            frequency: newPlan.billingCycle?.frequency || 1,
                          },
                        })
                      }
                      className="mt-1 p-2 w-1/2 border rounded-md"
                    >
                      <option value="day">Day</option>
                      <option value="week">Week</option>
                      <option value="month">Month</option>
                      <option value="year">Year</option>
                    </select>
                    <input
                      type="number"
                      value={newPlan.billingCycle!.frequency<1?1:newPlan.billingCycle!.frequency}
                      onChange={(e) =>
                        setNewPlan({
                          ...newPlan,
                          billingCycle: {
                            interval: e.target.value as BillingInterval,
                            frequency: parseInt(e.target.value),
                          },
                        })
                      }
                      className="mt-1 p-2 w-1/2 border rounded-md"
                      placeholder="Interval_count"
                      required
                    />
                  </div>
                </div>}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Features
                  </label>
                  <input
                    placeholder="Add feature"
                    value={currentFeature}
                    onChange={(e) => setCurrentFeature(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        const trimmedInp = currentFeature.trim();
                        if (trimmedInp) {
                          setNewPlan((prev) => ({
                            ...prev,
                            features: [...prev.features, trimmedInp],
                          }));
                          setCurrentFeature("");
                        }
                      }
                    }}
                    className="mt-1 p-2 w-full border rounded-md"
                  />
                </div>
                <ul className="border-2 mb-4 px-1 border-gray-200 rounded-2xl">
                  {newPlan.features.map((feat, ind) => (
                    <li
                      key={ind}
                      className="p-2 pl-4 bg-gray-200 flex justify-between my-1 rounded-xl"
                    >
                      <p>{feat}</p>
                      <Trash
                        onClick={() => handleRemoveFeature(ind)}
                        className="w-5 h-5 text-gray-600 cursor-pointer"
                      />
                    </li>
                  ))}
                </ul>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (isEditing) setIsEditing(null);
                      setIsCreateModalOpen(false);
                    }}
                    className="px-4 py-2 bg-gray-200 cursor-pointer rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 cursor-pointer text-white rounded-lg hover:bg-blue-700"
                  >
                    {isEditing ? "update" : "create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

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
                  Billing Cycle
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
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-4">
                    Loading...
                  </td>
                </tr>
              ) : plans.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-gray-500">
                    No plans found matching your criteria
                  </td>
                </tr>
              ) : (
                filtered.map((plan) => (
                  <tr key={plan.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {plan.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ₹{plan.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatBillingCycle(plan.billingCycle, plan.price)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {plan.features.join(", ")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          !plan.isArchived
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {!plan.isArchived ? "Active" : "Archived"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          className="text-blue-600 hover:text-blue-800 cursor-pointer"
                          onClick={() => {
                            // const edititem = plans.find(
                            //   (a) => a._id === plan._id
                            // );
                            // if (edititem) {
                            setIsEditing(plan);
                            setNewPlan(plan);
                            setIsCreateModalOpen(true);
                            // }
                          }}
                          title="Edit plan"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          className={`${
                            !plan.isArchived
                              ? "text-orange-600 hover:text-orange-800 cursor-pointer"
                              : "text-green-400 cursor-pointer"
                          }`}
                          title={
                            !plan.isArchived ? "Archive plan" : "Restore plan"
                          }
                          onClick={() =>
                            plan.isArchived
                              ? handleRestorePlan(plan.id)
                              : handleArchivePlan(plan.id)
                          }
                        >
                          {plan.isArchived ? (
                            <Undo className="w-5 h-5" />
                          ) : (
                            <Archive className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
