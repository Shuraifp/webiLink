"use client";

import { useState, useEffect, Dispatch, SetStateAction } from "react";
import {
  getUserPlan,
  cancelSubscription,
  getSubscriptionHistory,
  getPendingPlan,
  cancelPendingSubscription,
  retryPayment,
} from "@/lib/api/user/planApi";
import { Plan, IUserPlan, BillingInterval, PlanStatus } from "@/types/plan";
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
  const [pendingPlanData, setPendingPlanData] = useState<UserPlanData | null>(
    null
  );
  const [subscriptionHistory, setSubscriptionHistory] = useState<
    SubscriptionHistory[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [pendingLoading, setPendingLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [retryLoading, setRetryLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [postConfirmAction, setPostConfirmAction] = useState<
    (() => void) | null
  >(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    fetchUserPlan();
    fetchPendingPlan();
    fetchSubscriptionHistory();
  }, [page]);

  const fetchUserPlan = async () => {
    try {
      setLoading(true);
      const response = await getUserPlan();
      setUserPlanData(response.data);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data.message || "Failed to fetch active plan");
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
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

  const handleCancelSubscription = async () => {
    if (!userPlanData?.userPlan.stripeSubscriptionId) {
      toast.error("No recurring subscription to cancel");
      return;
    }
    const msg = `Are you sure you want to cancel your subscription? It will remain active until the end of the current billing period.`;
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
      toast.success("Subscription canceled successfully");
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

  const handleCancelPendingSubscription = async () => {
    if (!pendingPlanData) return;
    const msg = `Are you sure you want to cancel and refund your pending subscription for ${pendingPlanData.plan.name}?`;
    confirmAction(msg, executeCancelPendingSubscription);
  };

  const executeCancelPendingSubscription = async () => {
    try {
      setCancelLoading(true);
      await cancelPendingSubscription();
      setPendingPlanData(null);
      toast.success("Pending subscription canceled and refunded successfully");
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

  const handleRetryPayment = async () => {
    if (!userPlanData?.userPlan.stripeSubscriptionId) return;
    confirmAction(
      "Are you sure you want to renew the payment for your past-due subscription?",
      executeRetryPayment
    );
  };

  const executeRetryPayment = async () => {
    try {
      setRetryLoading(true);
      const response = await retryPayment();
      window.location.href = response.data.url;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        toast.error(err?.response?.data.message);
      } else {
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setRetryLoading(false);
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

  if (loading || pendingLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-80">
        <div className="w-16 h-16 border-5 border-t-transparent border-b-transparent border-yellow-400 rounded-full animate-spin" />
        <p className="mt-4 text-gray-600">Loading subscription details...</p>
      </div>
    );
  }

  return (
    <>
      <ConfirmationModal
        message={confirmationMessage}
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        onConfirm={postConfirmAction || (() => {})}
        loading={cancelLoading || retryLoading}
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
                  disabled={retryLoading}
                  className={`px-4 py-2 rounded-lg raleway text-white font-medium transition-all duration-300 ${
                    retryLoading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-500 hover:bg-blue-600"
                  }`}
                >
                  {retryLoading ? "Processing..." : "Renew Plan"}
                </button>
              )}
              {userPlanData.userPlan.stripeSubscriptionId &&
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
                    {cancelLoading ? "Processing..." : "Cancel Subscription"}
                  </button>
                )}
              { !pendingPlanData && <button
                onClick={handleUpgradePlan}
                className="px-4 py-2 rounded-lg bg-gradient-to-r raleway from-yellow-400 to-yellow-500 text-white font-medium hover:from-yellow-500 hover:to-yellow-600 transition-all duration-300"
              >
                Upgrade Plan
              </button>}
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


      {pendingPlanData && (
        <>
          <h2 className="text-xl raleway font-semibold my-4 ml-1 text-gray-600">
            Pending Subscription
          </h2>
          <div className="bg-white shadow-lg rounded-xl mt-4 p-6 bg-opacity-90 border-l-4 border-yellow-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-800">
                  {pendingPlanData.plan.name} (Pending)
                </h3>
                <p className="text-gray-600">
                  {formatBillingCycle(pendingPlanData.plan)}
                </p>
                <p className="text-gray-600">
                  Starts on:{" "}
                  {new Date(
                    pendingPlanData.userPlan.currentPeriodStart
                  ).toLocaleDateString()}
                </p>
                <p className="text-gray-600">
                  Price: ₹{pendingPlanData.plan.price.toFixed(2)}
                </p>
              </div>
              <div className="mt-4 md:mt-0 flex space-x-4">
                <button
                  onClick={handleCancelPendingSubscription}
                  disabled={cancelLoading}
                  className={`px-4 py-2 rounded-lg raleway text-white font-medium transition-all duration-300 ${
                    cancelLoading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-red-500 hover:bg-red-600"
                  }`}
                >
                  {cancelLoading ? "Processing..." : "Cancel & Refund"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Subscription History Section */}
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
                  <tr
                    key={history._id}
                    className={`border-b border-gray-100 ${
                      history.status === "pending"
                        ? "bg-blue-50"
                        : history.status === "refunded"
                        ? "bg-orange-50"
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
                      ) : history.status === "refunded" ? (
                        <span className="text-orange-600">Refunded</span>
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
