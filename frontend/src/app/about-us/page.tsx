"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";

export default function AboutUsPage() {
  const { auth } = useAuth();
  const userData = auth.user;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar user={userData} />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-pink-100 py-12 md:py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-5">
              About webiLink
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-8">
              Your all-in-one video conferencing solution designed for seamless collaboration and productivity.
            </p>
            <Link
              href="/signup"
              className="bg-yellow-400 text-black font-semibold py-3 px-6 rounded-lg hover:bg-yellow-500 transition"
            >
              Get Started
            </Link>
          </div>
        </section>

        {/* Company Overview */}
        <section className="py-12 md:py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="md:w-1/2">
                <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-4">
                  Who We Are
                </h2>
                <p className="text-gray-600 text-base md:text-lg mb-4">
                  webiLink is a modern video conferencing platform built to simplify online meetings while enhancing collaboration. We aim to provide an intuitive and feature-rich experience that goes beyond traditional tools like Google Meet, empowering teams to connect, engage, and work efficiently from anywhere in the world.
                </p>
                <p className="text-gray-600 text-base md:text-lg">
                  Our mission is to make virtual meetings as engaging and productive as in-person ones, with a stunning UI and advanced features tailored for all users.
                </p>
              </div>
              <div className="md:w-1/2">
                <div className="bg-gray-200 h-64 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Team Image Placeholder</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Key Features */}
        <section className="py-12 md:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 text-center mb-8">
              What Sets Us Apart
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-3">
                  Interactive Q&A and Polls
                </h3>
                <p className="text-gray-600 text-base md:text-lg">
                  Engage your audience with live Q&A sessions and polls, perfect for webinars and team meetings.
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-3">
                  Admin-Controlled Timer
                </h3>
                <p className="text-gray-600 text-base md:text-lg">
                  Admins can set timers visible to all participants, ensuring meetings stay on schedule.
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-3">
                  Breakout Rooms & DMs
                </h3>
                <p className="text-gray-600 text-base md:text-lg">
                  Facilitate small group discussions with breakout rooms and enable private DMs with emoji support.
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-3">
                  Whiteboard for All
                </h3>
                <p className="text-gray-600 text-base md:text-lg">
                  Collaborate in real-time with our built-in whiteboard, available to all users at no extra cost.
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-3">
                  Premium Transcription Features
                </h3>
                <p className="text-gray-600 text-base md:text-lg">
                  Premium users can download transcriptions, while all users can view live captions during meetings.
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-3">
                  Stunning UI Design
                </h3>
                <p className="text-gray-600 text-base md:text-lg">
                  Experience a beautifully designed interface that makes every meeting a pleasure to attend.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-yellow-400 py-12 md:py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Join the webiLink Community
            </h2>
            <p className="text-base sm:text-lg text-gray-800 mb-6">
              Sign up today and experience the future of video conferencing.
            </p>
            <Link
              href="/signup"
              className="bg-white text-gray-900 font-semibold py-3 px-6 rounded-lg hover:bg-gray-100 transition"
            >
              Sign Up Now
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}