"use client";

import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { getUserPlan, cancelSubscription } from "@/lib/api/user/planApi";
import { Plan, IUserPlan, BillingInterval } from "@/types/plan";
import toast from "react-hot-toast";
import axios from "axios";
import ConfirmationModal from "./ConfirmationModal";

interface UserPlanData {
  userPlan: IUserPlan;
  plan: Plan;
}

const Subscription = ({onSectionChange}:{onSectionChange: Dispatch<SetStateAction<string>>;}) => {
  const [userPlanData, setUserPlanData] = useState<UserPlanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [postConfirmAction, setPostConfirmAction] = useState<(() => void) | null>(null)

  useEffect(() => {
    fetchUserPlan();
  }, []);

  const fetchUserPlan = async () => {
    try {
      setLoading(true);
      const response = await getUserPlan();
      setUserPlanData(response.data);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        // setError(err.response?.data.message)
      } else {
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!userPlanData?.userPlan.stripeSubscriptionId) {
      setError("No recurring subscription to cancel");
      return;
    }

    confirmAction(
      "Are you sure you want to cancel your subscription? It will remain active until the end of the current billing period.",
      executeCancelSubscription
    );
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
      setIsModalOpen(false)
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
    setPostConfirmAction(() =>cb)
  };

  const closeModal = () => {
    setConfirmationMessage("");
    setIsModalOpen(false);
    setPostConfirmAction(null)
  };

  const handleUpgradePlan = () => {
    onSectionChange("upgrade")
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

  const formatStatus = (userPlan: IUserPlan) => {
    if (userPlan.cancelAtPeriodEnd) {
      return `Active until ${new Date(
        userPlan.currentPeriodEnd!
      ).toLocaleDateString()}`;
    }
    return userPlan.status.charAt(0).toUpperCase() + userPlan.status.slice(1);
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
      <h2 className="text-xl raleway font-semibold my-2 ml-1 text-gray-600">
        My Subscription
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
                    {cancelLoading ? "Canceling..." : "Cancel Subscription"}
                  </button>
                )}
              <button
                onClick={handleUpgradePlan}
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
              onClick={handleUpgradePlan}
              className="px-6 py-3 rounded-lg bg-gradient-to-r raleway from-yellow-400 to-yellow-500 text-white font-medium hover:from-yellow-500 hover:to-yellow-600 transition-all duration-300"
            >
              Upgrade to Pro
            </button>
          </div>
        </div>
      )}
      {error && <div className="mt-4 text-center text-red-500">{error}</div>}
    </>
  );
};

export default Subscription;
