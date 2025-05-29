"use client";

import { useState, useEffect, Dispatch, SetStateAction } from "react";
import {
  getUserPlan,
  cancelSubscription,
  getSubscriptionHistory,
  getPendingPlan,
  retryPayment,
} from "@/lib/api/user/planApi";
import { Plan, IUserPlan, BillingInterval, PlanStatus } from "@/types/plan";
import toast from "react-hot-toast";
import axios from "axios";
import { useConfirmationModal } from "./ConfirmationModal";

interface UserPlanData {
  userPlan: IUserPlan;
  plan: Plan;
}

interface SubscriptionHistory {
  _id: string;
  planId: {
    name: string;
    price: number;
    billingCycle: { interval: BillingInterval; frequency: number };
  };
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd?: string | null;
  createdAt: string;
  cancelAtPeriodEnd?: boolean;
}

const Subscription = ({
  onSectionChange,
}: {
  onSectionChange: Dispatch<SetStateAction<string>>;
}) => {
  const [userPlanData, setUserPlanData] = useState<UserPlanData | null>(null);
  const [pendingPlanData, setPendingPlanData] = useState<UserPlanData | null>(
    null
  );
  const [subscriptionHistory, setSubscriptionHistory] = useState<
    SubscriptionHistory[]
  >([]);
  const [loadingFetch, setLoadingFetch] = useState(true);
  const [pendingLoading, setPendingLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const { confirm, setLoading } = useConfirmationModal();

  useEffect(() => {
    fetchUserPlan();
    fetchPendingPlan();
    fetchSubscriptionHistory();
  }, [page]);

  const fetchUserPlan = async () => {
    try {
      setLoadingFetch(true);
      const response = await getUserPlan();
      setUserPlanData(response.data);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data.message || "Failed to fetch active plan");
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoadingFetch(false);
    }
  };

  const fetchPendingPlan = async () => {
    try {
      setPendingLoading(true);
      const response = await getPendingPlan();
      setPendingPlanData(response.data);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        toast.error(
          err.response?.data.message || "Failed to fetch pending plan"
        );
      }
    } finally {
      setPendingLoading(false);
    }
  };

  const fetchSubscriptionHistory = async () => {
    try {
      setHistoryLoading(true);
      const response = await getSubscriptionHistory(page, limit);
      setSubscriptionHistory(response.data.data);
      setTotalPages(response.data.totalPages || 1);
      setTotalItems(response.data.totalItems || 0);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        toast.error(
          err.response?.data.message || "Failed to fetch subscription history"
        );
      } else {
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleCancelSubscription = () => {
    if (!userPlanData?.userPlan.stripeSubscriptionId) {
      toast.error("No recurring subscription to cancel");
      return;
    }
    confirm(
      "Are you sure you want to cancel your subscription? It will remain active until the end of the current billing period.",
      async () => {
        try {
          setLoading(true);
          await cancelSubscription();
          setUserPlanData({
            ...userPlanData!,
            userPlan: { ...userPlanData!.userPlan, cancelAtPeriodEnd: true },
          });
          toast.success("Subscription canceled successfully");
          fetchSubscriptionHistory();
        } catch (err) {
          if (axios.isAxiosError(err)) {
            toast.error(err?.response?.data.message);
          } else {
            toast.error("An unexpected error occurred.");
          }
        } finally {
          setLoading(false);
        }
      }
    );
  };

  const handleRetryPayment = () => {
    if (!userPlanData?.userPlan.stripeSubscriptionId) return;
    confirm(
      "Are you sure you want to renew the payment for your past-due subscription?",
      async () => {
        try {
          setLoading(true);
          const response = await retryPayment();
          window.location.href = response.data.url;
        } catch (err) {
          if (axios.isAxiosError(err)) {
            toast.error(err?.response?.data.message);
          } else {
            toast.error("An unexpected error occurred.");
          }
        } finally {
          setLoading(false);
        }
      }
    );
  };

  const handleUpgradePlan = () => {
    onSectionChange("upgrade");
  };

  const handleCreatePlan = () => {
    onSectionChange("upgrade");
  };

  const formatBillingCycle = (plan: Plan) => {
    return `Billed every ${plan.billingCycle?.frequency} ${
      plan.billingCycle?.interval
    }${plan.billingCycle!.frequency > 1 ? "s" : ""}`;
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const formatStatus = (userPlan: IUserPlan) => {
    if (userPlan.cancelAtPeriodEnd && userPlan.currentPeriodEnd) {
      return `Active until ${new Date(
        userPlan.currentPeriodEnd
      ).toLocaleDateString()}`;
    }
    return userPlan.status.charAt(0).toUpperCase() + userPlan.status.slice(1);
  };

  const formatHistoryBillingCycle = (history: SubscriptionHistory) => {
    return `Billed every ${history.planId.billingCycle.frequency} ${
      history.planId.billingCycle.interval
    }${history.planId.billingCycle.frequency > 1 ? "s" : ""}`;
  };

  if (loadingFetch || pendingLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-80">
        <div className="w-12 h-12 border-4 border-t-transparent border-yellow-500 rounded-full animate-spin" />
        <p className="mt-4 text-gray-600">Loading subscription details...</p>
      </div>
    );
  }

  return (
    <>
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        My Current Subscription
      </h2>
      {userPlanData ? (
        <div className="bg-white shadow-lg rounded-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-800">
                {userPlanData.plan.name}
              </h3>
              <p className="text-gray-600">
                {formatBillingCycle(userPlanData.plan)}
              </p>
              <p className="text-gray-600">
                Status: {formatStatus(userPlanData.userPlan)}
              </p>
              <p className="text-gray-600">
                Price: ₹{userPlanData.plan.price.toFixed(2)}
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-4">
              {userPlanData.userPlan.status === PlanStatus.PAST_DUE && (
                <button
                  onClick={handleRetryPayment}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  Renew Plan
                </button>
              )}
              {userPlanData.userPlan.stripeSubscriptionId &&
                !userPlanData.userPlan.cancelAtPeriodEnd && (
                  <button
                    onClick={handleCancelSubscription}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
                  >
                    Cancel Subscription
                  </button>
                )}
              {!pendingPlanData && (
                <button
                  onClick={handleUpgradePlan}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-yellow-500 hover:bg-yellow-600 transition-colors"
                >
                  Upgrade Plan
                </button>
              )}
            </div>
          </div>
          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-lg font-semibold text-gray-800 mb-2">
              Plan Features
            </h4>
            <ul className="space-y-2">
              {userPlanData.plan.features.map((feature, idx) => (
                <li key={idx} className="flex items-center text-gray-600">
                  <span className="mr-2 text-green-500">✔</span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div className="flex justify-center items-center min-h-[300px]">
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              You don’t have any active Premium plan.
            </p>
            <button
              onClick={handleCreatePlan}
              className="px-6 py-2 rounded-lg text-sm font-medium text-white bg-yellow-500 hover:bg-yellow-600 transition-colors"
            >
              Upgrade to Pro
            </button>
          </div>
        </div>
      )}

      {pendingPlanData && (
        <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-4 mb-8">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 text-green-500 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                Your {pendingPlanData.plan.name} plan will start on{" "}
                {new Date(
                  pendingPlanData.userPlan.currentPeriodStart
                ).toLocaleDateString()}.
              </h3>
              <p className="text-gray-600">
                Enjoy all its features now as a bonus!
              </p>
            </div>
          </div>
        </div>
      )}

      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        Subscription History
      </h2>
      {historyLoading ? (
        <div className="flex flex-col items-center justify-center h-40">
          <div className="w-12 h-12 border-4 border-t-transparent border-yellow-500 rounded-full animate-spin" />
          <p className="mt-4 text-gray-600">Loading subscription history...</p>
        </div>
      ) : subscriptionHistory?.length > 0 ? (
        <div className="bg-white shadow-lg rounded-xl p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-2 text-left text-gray-600">Plan</th>
                  <th className="px-4 py-2 text-left text-gray-600">Status</th>
                  <th className="px-4 py-2 text-left text-gray-600">Price</th>
                  <th className="px-4 py-2 text-left text-gray-600">
                    Billing Cycle
                  </th>
                  <th className="px-4 py-2 text-left text-gray-600">
                    Start Date
                  </th>
                  <th className="px-4 py-2 text-left text-gray-600">
                    End Date
                  </th>
                  <th className="px-4 py-2 text-left text-gray-600">
                    Created At
                  </th>
                </tr>
              </thead>
              <tbody>
                {subscriptionHistory.map((history) => (
                  <tr
                    key={history._id}
                    className={`border-b border-gray-100 ${
                      history.status === "pending"
                        ? "bg-blue-50"
                        : history.status === "canceled"
                        ? "bg-gray-50"
                        : ""
                    }`}
                  >
                    <td className="px-4 py-2 text-gray-800">
                      {history.planId.name}
                    </td>
                    <td className="px-4 py-2 text-gray-600">
                      {history.status === "canceled" ? (
                        "Canceled"
                      ) : history.cancelAtPeriodEnd ? (
                        `Active until ${new Date(
                          history.currentPeriodEnd!
                        ).toLocaleDateString()}`
                      ) : (
                        history.status.charAt(0).toUpperCase() +
                        history.status.slice(1)
                      )}
                    </td>
                    <td className="px-4 py-2 text-gray-600">
                      ₹{history.planId.price.toFixed(2)}
                    </td>
                    <td className="px-4 py-2 text-gray-600">
                      {formatHistoryBillingCycle(history)}
                    </td>
                    <td className="px-4 py-2 text-gray-600">
                      {new Date(
                        history.currentPeriodStart
                      ).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 text-gray-600">
                      {history.currentPeriodEnd
                        ? new Date(
                            history.currentPeriodEnd
                          ).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="px-4 py-2 text-gray-600">
                      {new Date(history.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-between items-center mt-4">
            <div className="text-gray-600 text-sm">
              Page {page} of {totalPages} (Total: {totalItems} records)
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className={`px-4 py-2 rounded-lg text-sm font-medium text-white ${
                  page === 1
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-yellow-500 hover:bg-yellow-600"
                }`}
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className={`px-4 py-2 rounded-lg text-sm font-medium text-white ${
                  page === totalPages
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-yellow-500 hover:bg-yellow-600"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-600 py-6">
          No subscription history available.
        </div>
      )}

      {error && <div className="mt-4 text-center text-red-500">{error}</div>}
    </>
  );
};

export default Subscription;