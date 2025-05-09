"use client";

import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";

export default function Cancel() {
  const router = useRouter();

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
        <div className="relative bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg mx-4 transform transition-all duration-500 hover:scale-105">
          <div className="flex justify-center mb-6">
            <svg
              className="w-16 h-16 text-yellow-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-gray-800 text-center mb-4">
            Subscription Incomplete
          </h1>
          <p className="text-gray-600 text-center mb-8">
            Your subscription has not been completed. You can still access your account or explore other plans.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => router.push("/host?section=subscription")}
              className="py-3 px-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => router.push("/pricing")}
              className="py-3 px-6 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-all duration-300 transform hover:scale-105"
            >
              Explore Plans
            </button>
          </div>

          {/* <p className="text-sm text-gray-500 text-center mt-6">
            Changed your mind?{" "}
            <a href="/support" className="text-blue-500 hover:underline">
              Contact Support
            </a>
          </p> */}
        </div>
      </div>
    </>
  );
}