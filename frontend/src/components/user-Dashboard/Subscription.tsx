"use client";

import { useState, useEffect, Dispatch, SetStateAction } from "react";
import {
  getUserPlan,
  cancelSubscription,
  getSubscriptionHistory,
} from "@/lib/api/user/planApi";
import { Plan, IUserPlan, BillingInterval } from "@/types/plan";
import toast from "react-hot-toast";
import axios from "axios";
import ConfirmationModal from "./ConfirmationModal";

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
  const [subscriptionHistory, setSubscriptionHistory] = useState<
    SubscriptionHistory[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [postConfirmAction, setPostConfirmAction] = useState<
    (() => void) | null
  >(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchUserPlan();
    fetchSubscriptionHistory();
  }, [page]);

  const fetchUserPlan = async () => {
    try {
      setLoading(true);
      const response = await getUserPlan();
      setUserPlanData(response.data);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        // setError(err.response?.data.message);
      } else {
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscriptionHistory = async () => {
    try {
      setHistoryLoading(true);
      const response = await getSubscriptionHistory(page, limit);
      setSubscriptionHistory(response.data.data);
      setTotalPages(response.data.data.totalPages);
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

  const handleCancelSubscription = async () => {
    if (
      !userPlanData?.userPlan.stripeSubscriptionId &&
      !userPlanData?.userPlan.stripePaymentIntentId
    ) {
      toast.error("No recurring subscription to cancel");
      return;
    }

    const msg =
      userPlanData.plan.billingCycle.interval === BillingInterval.LIFETIME
        ? "Are you sure you want to cancel your Lifetime access?"
        : "Are you sure you want to cancel your subscription? It will remain active until the end of the current billing period.";
    confirmAction(msg, executeCancelSubscription);
  };

  const executeCancelSubscription = async () => {
    try {
      setCancelLoading(true);
      await cancelSubscription();
      setUserPlanData({
        ...userPlanData!,
        userPlan: { ...userPlanData!.userPlan, cancelAtPeriodEnd: true },
      });
      setError(null);
      toast.success("Subscription canceled successfully");
      setIsModalOpen(false);
      fetchSubscriptionHistory();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        toast.error(err?.response?.data.message);
      } else {
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setCancelLoading(false);
      closeModal();
    }
  };

  const confirmAction = (msg: string, cb: () => void) => {
    setConfirmationMessage(msg);
    setIsModalOpen(true);
    setPostConfirmAction(() => cb);
  };

  const closeModal = () => {
    setConfirmationMessage("");
    setIsModalOpen(false);
    setPostConfirmAction(null);
  };

  const handleUpgradePlan = (
    cb: () => void,
    msg = "Are you sure you want to cancel your subscription?"
  ) => {
    setConfirmationMessage(msg);
    setIsModalOpen(true);
    setPostConfirmAction(() => cb);
  };

  const upgradePlan = () => {
    onSectionChange("upgrade");
  };

  const handleCreatePlan = () => {
    onSectionChange("upgrade");
  };

  const formatBillingCycle = (plan: Plan, userPlan: IUserPlan) => {
    if (plan.price === 0) {
      return "Free plan";
    }
    if (
      plan.billingCycle.interval === BillingInterval.LIFETIME ||
      !userPlan.currentPeriodEnd
    ) {
      return "One-time payment (Lifetime access)";
    }
    return `Billed every ${plan.billingCycle.frequency} ${
      plan.billingCycle.interval
    }${plan.billingCycle.frequency > 1 ? "s" : ""}`;
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const formatStatus = (userPlan: IUserPlan) => {
    if (userPlan.cancelAtPeriodEnd) {
      return `Active until ${new Date(
        userPlan.currentPeriodEnd!
      ).toLocaleDateString()}`;
    }
    return userPlan.status.charAt(0).toUpperCase() + userPlan.status.slice(1);
  };

  const formatHistoryBillingCycle = (history: SubscriptionHistory) => {
    if (history.planId.price === 0) {
      return "Free plan";
    }
    if (
      history.planId.billingCycle.interval === BillingInterval.LIFETIME ||
      !history.currentPeriodEnd
    ) {
      return "One-time payment (Lifetime access)";
    }
    return `Billed every ${history.planId.billingCycle.frequency} ${
      history.planId.billingCycle.interval
    }${history.planId.billingCycle.frequency > 1 ? "s" : ""}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-80">
        <div className="w-16 h-16 border-5 border-t-transparent border-b-transparent border-yellow-400 rounded-full animate-spin" />
        <p className="mt-4 text-gray-600">Loading subscription details...</p>
      </div>
    );
  }

  if (error && !userPlanData) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  return (
    <>
      <ConfirmationModal
        message={confirmationMessage}
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        onConfirm={postConfirmAction || (() => {})}
        loading={cancelLoading}
      />
      <h2 className="text-xl raleway font-semibold mt-4 mb-2 ml-1 text-gray-600">
        My Current Subscription
      </h2>
      {userPlanData ? (
        <div className="bg-white shadow-lg rounded-xl mt-4 p-6 bg-opacity-90">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-800">
                {userPlanData.plan.name}
              </h3>
              <p className="text-gray-600">
                {formatBillingCycle(userPlanData.plan, userPlanData.userPlan)}
              </p>
              <p className="text-gray-600">
                Status: {formatStatus(userPlanData.userPlan)}
              </p>
              <p className="text-gray-600">
                Price: ₹{userPlanData.plan.price.toFixed(2)}
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-4">
              {(userPlanData.userPlan.stripeSubscriptionId ||
                userPlanData.plan.billingCycle.interval ===
                  BillingInterval.LIFETIME) &&
                !userPlanData.userPlan.cancelAtPeriodEnd && (
                  <button
                    onClick={handleCancelSubscription}
                    disabled={cancelLoading}
                    className={`px-4 py-2 rounded-lg raleway text-white font-medium transition-all duration-300 ${
                      cancelLoading
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-red-500 hover:bg-red-600"
                    }`}
                  >
                    {cancelLoading
                      ? "Processing..."
                      : userPlanData.plan.billingCycle.interval ===
                        BillingInterval.LIFETIME
                      ? "Request Refund"
                      : "Cancel Subscription"}
                  </button>
                )}
              <button
                onClick={() => handleUpgradePlan(upgradePlan)}
                className="px-4 py-2 rounded-lg bg-gradient-to-r raleway from-yellow-400 to-yellow-500 text-white font-medium hover:from-yellow-500 hover:to-yellow-600 transition-all duration-300"
              >
                Change Plan
              </button>
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
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              You don’t have any active Premium plan.
            </p>
            <button
              onClick={handleCreatePlan}
              className="px-6 py-3 rounded-lg bg-gradient-to-r raleway from-yellow-400 to-yellow-500 text-white font-medium hover:from-yellow-500 hover:to-yellow-600 transition-all duration-300"
            >
              Upgrade to Pro
            </button>
          </div>
        </div>
      )}

      {/* Subscription History Section  */}
      <h2 className="text-xl raleway font-semibold my-4 ml-1 text-gray-600">
        Subscription History
      </h2>
      {historyLoading ? (
        <div className="flex flex-col items-center justify-center h-40">
          <div className="w-12 h-12 border-4 border-t-transparent border-b-transparent border-yellow-400 rounded-full animate-spin" />
          <p className="mt-4 text-gray-600">Loading subscription history...</p>
        </div>
      ) : subscriptionHistory?.length > 0 ? (
        <div className="bg-white shadow-lg rounded-xl mt-4 p-6 bg-opacity-90">
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
                  <tr key={history._id} className="border-b border-gray-100">
                    <td className="px-4 py-2 text-gray-800">
                      {history.planId.name}
                    </td>
                    <td className="px-4 py-2 text-gray-600">
                      {history.status === "canceled"
                        ? "Canceled"
                        : history.cancelAtPeriodEnd
                        ? `Active until ${new Date(
                            history.currentPeriodEnd!
                          ).toLocaleDateString()}`
                        : history.status.charAt(0).toUpperCase() +
                          history.status.slice(1)}
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
              Page {page} of {totalPages} (Total: {subscriptionHistory?.length}{" "}
              records)
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className={`px-4 py-2 rounded-sm raleway text-white font-medium transition-all duration-300 ${
                  page === 1
                    ? "bg-gray-500 cursor-not-allowed"
                    : "bg-yellow-500 hover:bg-yellow-600"
                }`}
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className={`px-4 py-2 rounded-sm raleway text-white font-medium transition-all duration-300 ${
                  page === totalPages
                    ? "bg-gray-500 cursor-not-allowed"
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
