"use client";

import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Success() {
  const router = useRouter();

  // Confetti effect
  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.style.position = "fixed";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = "9999";
    document.body.appendChild(canvas);

    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: { x: number; y: number; vx: number; vy: number; color: string; size: number }[] = [];
    const colors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEEAD"];

    for (let i = 0; i < 150; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height * 0.3,
        vx: (Math.random() - 0.5) * 8,
        vy: Math.random() * 4 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 5 + 2,
      });
    }

    let animationFrameId: number;
    const animate = () => {
      ctx!.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1; 
        p.size *= 0.99; 

        ctx!.fillStyle = p.color;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx!.fill();
      });

      if (particles.some((p) => p.size > 0.5)) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        document.body.removeChild(canvas);
      }
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (document.body.contains(canvas)) {
        document.body.removeChild(canvas);
      }
    };
  }, []);

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
        <div className="relative bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg mx-4 transform transition-all duration-500 hover:scale-105">
          
          <div className="flex justify-center mb-6">
            <svg
              className="w-16 h-16 text-green-500 animate-pulse"
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
          </div>

          <h1 className="text-3xl font-bold text-gray-800 text-center mb-4">
            Payment Successful!
          </h1>
          <p className="text-gray-600 text-center mb-8">
            Congratulations! Your subscription is now active. Explore your plans or
            return to pricing to learn more.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => router.push("/host?section=subscription")}
              className="py-3 px-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
            >
              See Your Plans
            </button>
            <button
              onClick={() => router.push("/pricing")}
              className="py-3 px-6 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-all duration-300 transform hover:scale-105"
            >
              Back to Plans
            </button>
          </div>

          {/* <p className="text-sm text-gray-500 text-center mt-6">
            Need help?{" "}
            <a href="/support" className="text-blue-500 hover:underline">
              Contact Support
            </a>
          </p> */}
        </div>
      </div>
    </>
  );
}