"use client";

import { getPlans, getUserPlan, subscribeToPlan } from "@/lib/api/user/planApi";
import { Plan } from "@/types/plan";
import axios from "axios";
import { Circle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

export default function Upgrade() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [userPlan, setUserPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUserPlan();
    fetchPlans();
  }, []);
  console.log(userPlan);
  const fetchUserPlan = async () => {
    try {
      const response = await getUserPlan();
      setUserPlan(response.data.userPlan.planId);
    } catch (error) {
      console.error("Error fetching UserPlan:", error);
    }
  };

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
        planId: plan._id!,
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

  const planRef = useRef<HTMLDivElement>(null);
  const [hoverDirection, setHoverDirection] = useState<string | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!planRef.current) return;

    const rect = planRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const width = rect.width;
    const height = rect.height;

    const fromLeft = x;
    const fromRight = width - x;
    const fromTop = y;
    const fromBottom = height - y;

    const minDistance = Math.min(fromLeft, fromRight, fromTop, fromBottom);

    if (minDistance === fromLeft) {
      setHoverDirection("left");
    } else if (minDistance === fromRight) {
      setHoverDirection("right");
    } else if (minDistance === fromTop) {
      setHoverDirection("top");
    } else {
      setHoverDirection("bottom");
    }
  };

  const handleMouseLeave = () => {
    setHoverDirection(null);
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
    <div>
      <Toaster />
      <h2 className="text-xl raleway font-semibold my-2 ml-1 text-gray-600">
        Here are The Plans for you
      </h2>
      <div className="flex min-h-[75%]">
        <div className="min-w-[70%] p-6">
          <div className="max-w-5xl max-h-[450px] overflow-y-scroll no-scrollbar">
            <div className="flex flex-col gap-5 mb-12">
              {plans.map(
                (plan, index) =>
                  plan.price > 0 &&
                  plan._id !== userPlan && (
                    <div
                      key={index}
                      className={`relative flex flex-col justify-between p-6 rounded-2xl bg-gray-50 shadow-lg`}
                    >
                      <div className="flex">
                        <div className="w-[50%]">
                          <h2 className="text-xl font-semibold text-gray-600 mb-2">
                            {plan.name}
                          </h2>
                          <p className="text-2xl text-gray-600 font-semibold mb-4">
                            {plan.price.toFixed(2)}
                          </p>
                          <p className="text-sm mb-6">{plan.description}</p>
                        </div>

                        <ul className="mb-6 w-[50%] space-y-3">
                          {plan.features.map((feature, idx) => (
                            <li key={idx} className="flex items-center">
                              <span className="mr-2 text-green-400">✔</span>
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {plan.price !== 0 && (
                        <div
                          onClick={() => handleSubscribe(plan)}
                          className={`w-full py-3 rounded-lg text-center font-semibold transition-all cursor-pointer duration-300
                          bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600  
                      `}
                        >
                          {"Let's Go"}
                        </div>
                      )}
                    </div>
                  )
              )}
            </div>
          </div>
        </div>
        {plans
          .filter((p) => p._id === userPlan)
          .map((pl) => (
            <div key={pl._id} className="min-w-[30%] p-6">
              <h2 className="flex items-center text-lg raleway font-semibold mb-2 text-gray-600">
                <Circle className="w-4 h-4 mr-1 bg-gray-50 rounded-full p-0.5 border border-gray-400 text-gray-400" />
                Current plan
              </h2>
              <div
                ref={planRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                className={`bg-gray-50 flex justify-between items-center p-4 rounded transition-all duration-300 ${
                  hoverDirection === "left"
                    ? " translate-x-[-2px]"
                    : hoverDirection === "right"
                    ? " translate-x-[2px]"
                    : hoverDirection === "top"
                    ? "translate-y-[-2px]"
                    : hoverDirection === "bottom"
                    ? "translate-y-[2px]"
                    : "shadow-md"
                }`}
              >
                <p>{pl.name}</p>
                <p className="text-gray-600 text-2xl font-semibold">
                  {pl.price.toFixed(2)}
                </p>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
