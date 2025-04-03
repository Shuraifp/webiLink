"use client"

import { useState } from "react";

const SubscriptionPlans = () => {
  const [isAnnual, setIsAnnual] = useState(false);

  const plans = [
    {
      name: "Base",
      price: isAnnual ? 0 : 0,
      description: "Limited services of Omuk Tomuk",
      features: [
        { name: "Library Access", included: false },
        { name: "10 Omuk Per Day", included: true },
        { name: "10 Tomuk Per Day", included: true },
        { name: "10 Henten Per Day", included: true },
      ],
      buttonText: "Currently Using",
      buttonDisabled: true,
    },
    {
      name: "Premium",
      price: isAnnual ? 150 : 15, // $15/month or $150/year (20% discount)
      description: "Upgrade to PREMIUM for the best experience. Most of our clients switch to this package.",
      features: [
        { name: "Access to Library", included: true },
        { name: "200 Omuk Per Day", included: true },
        { name: "200 Tomuk Per Day", included: true },
        { name: "200 Henten Per Day", included: true },
      ],
      buttonText: "Upgrade to Premium",
      popular: true,
    },
    {
      name: "Unlimited",
      price: isAnnual ? 300 : 30, // $30/month or $300/year (20% discount)
      description: "Upgrade to the best TotoCompany",
      features: [
        { name: "Access to Library", included: true },
        { name: "Unlimited Tomuk", included: true },
        { name: "Unlimited Henten", included: true },
      ],
      buttonText: "Upgrade to Unlimited",
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-yellow-100 to-pink-50 text-white pt-18 p-6">
      <div className="max-w-5xl w-full">
        <p className="text-center text-xl mb-4 text-blue-500">webiLink Meetings</p>
        <h1 className="text-6xl md:text-5xl text-black font-bold text-center mb-4 whitespace-pre-line">
          {`Effortless and Powerfull\nvideo calls`}
        </h1>
        <p className="text-center text-black text-lg mb-8">
          Choose the right plan for you. 
        </p>

        <div className="flex justify-center items-center mb-12">
          <span className={`mr-3 ${!isAnnual ? "text-yellow-400" : "text-gray-400"}`}>
            Monthly
          </span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only"
              checked={isAnnual}
              onChange={() => setIsAnnual(!isAnnual)}
            />
            <div className="w-12 h-6 bg-gray-600 rounded-full shadow-inner"></div>
            <div
              className={`absolute w-6 h-6 bg-yellow-300 rounded-full shadow transform transition-all duration-300 ${
                isAnnual ? "translate-x-6" : "translate-x-0"
              }`}
            ></div>
          </label>
          <span className={`ml-3 ${isAnnual ? "text-yellow-400" : "text-gray-400"}`}>
            Annually
          </span>
          {/* {isAnnual && (
            <span className="ml-3 bg-green-500 text-white text-sm px-2 py-1 rounded-full animate-bounce">
              Save 20%
            </span>
          )} */}
        </div>

        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative p-6 rounded-2xl bg-opacity-20 backdrop-blur-lg border border-opacity-30 border-white shadow-lg transform transition-all duration-300 hover:scale-105 ${
                plan.popular ? "bg-purple-500 bg-opacity-30" : "bg-gray-800 bg-opacity-30"
              }`}
            >

              {/* Plan Name and Price */}
              <h2 className="text-2xl font-bold mb-2">{plan.name}</h2>
              <p className="text-4xl font-semibold mb-4">
                {plan.price === 0 ? "Free" : `$${plan.price}${isAnnual ? "/year" : "/month"}`}
              </p>
              <p className="text-sm mb-6">{plan.description}</p>

              {/* Features List */}
              <ul className="mb-6 space-y-3">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center">
                    <span className={`mr-2 ${feature.included ? "text-green-400" : "text-red-400"}`}>
                      {feature.included ? "✔" : "✖"}
                    </span>
                    <span>{feature.name}</span>
                  </li>
                ))}
              </ul>

              {/* Button */}
              <button
                className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 ${
                  plan.buttonDisabled
                    ? "bg-blue-600 cursor-not-allowed"
                    : plan.name === "Unlimited"
                    ? "bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600"
                    : "bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
                }`}
                disabled={plan.buttonDisabled}
              >
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlans;