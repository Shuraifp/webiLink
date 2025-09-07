"use client";

import { useState, useEffect } from "react";
import { getPlans, subscribeToPlan } from "@/lib/api/user/planApi";
import { Plan } from "@/types/plan";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

const SubscriptionPlans = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await getPlans();
      setPlans(response.data);
    } catch (error) {
      console.error("Error fetching plans:", error);
    }
  };

  const handleSubscribe = async (plan: Plan) => {

    setLoading(true);

    try {
      const response = await subscribeToPlan({
        planId: plan.id!,
        priceId: plan.stripePriceId || "",
      });

      window.location.href = response.data.url;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error?.response?.data.message);
      } else {
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-80">
        <div className="w-16 h-16 border-5 border-t-transparent border-b-transparent border-yellow-400 rounded-full animate-spin" />
        <p className="mt-4 text-gray-600">Proceeding...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-yellow-100 to-pink-50 text-white pt-12 p-6">
      <Toaster />
      <div className="max-w-5xl w-full">
        <p className="text-center text-xl mb-4 text-blue-500">
          webiLink Meetings
        </p>
        <h1 className="text-6xl md:text-5xl text-black font-bold text-center mb-5 whitespace-pre-line">
          {`Effortless and Powerfull\nvideo calls`}
        </h1>
        <p className="text-center text-black text-lg mb-10">
          Choose the right plan for you.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative flex flex-col justify-between p-6 rounded-2xl bg-opacity-20 shadow-lg transform transition-all duration-300 hover:scale-105 ${
                plan.price > 0
                  ? "bg-purple-500 bg-opacity-30"
                  : "bg-gray-800 bg-opacity-30"
              }`}
            >
              <div>
                <h2 className="text-2xl font-bold mb-2">{plan.name}</h2>
                <p className="text-4xl font-semibold mb-4">
                  {plan.price.toFixed(2)}
                </p>
                <p className="text-sm mb-6">{plan.description}</p>

                <ul className="mb-6 space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center">
                      <span className="mr-2 text-green-400">✔</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              { plan.price !== 0 && <div
                onClick={() => handleSubscribe(plan)}
                className={`w-full py-3 rounded-lg text-center font-semibold transition-all duration-300 ${
                  plan.price > 0
                    ? "bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600"
                    : "bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
                }`}
              >
                {"Let's Go"}
              </div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlans;
