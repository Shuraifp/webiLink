"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";

export default function ResourcesPage() {
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
              Resources to Get the Most Out of webiLink
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-8">
              Explore guides and support options to enhance your meeting experience.
            </p>
            <Link
              href="/support"
              className="bg-yellow-400 text-black font-semibold py-3 px-6 rounded-lg hover:bg-yellow-500 transition"
            >
              Contact Support
            </Link>
          </div>
        </section>

        {/* Resources Grid */}
        <section className="py-12 md:py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              <div className="bg-gray-50 rounded-lg shadow-md p-6">
                <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-3">
                  How to Record Meetings
                </h3>
                <p className="text-gray-600 text-base md:text-lg mb-4">
                  Step-by-step instructions on recording your meetings. Learn how premium users can download recordings.
                </p>
                <Link
                  href="/pricing"
                  className="text-yellow-600 hover:underline font-semibold"
                >
                  Upgrade to Premium
                </Link>
              </div>

              <div className="bg-gray-50 rounded-lg shadow-md p-6">
                <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-3">
                  Using the Whiteboard
                </h3>
                <p className="text-gray-600 text-base md:text-lg mb-4">
                  Discover how to use webiLink’s free whiteboard to collaborate and brainstorm during meetings.
                </p>
                <Link
                  href="/support"
                  className="text-yellow-600 hover:underline font-semibold"
                >
                  Need Help?
                </Link>
              </div>

              <div className="bg-gray-50 rounded-lg shadow-md p-6">
                <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-3">
                  Managing Breakout Rooms
                </h3>
                <p className="text-gray-600 text-base md:text-lg mb-4">
                  Learn how to set up and manage breakout rooms for small group discussions in your meetings.
                </p>
                <Link
                  href="/support"
                  className="text-yellow-600 hover:underline font-semibold"
                >
                  Need Help?
                </Link>
              </div>

              <div className="bg-gray-50 rounded-lg shadow-md p-6">
                <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-3">
                  Using Q&A and Polls
                </h3>
                <p className="text-gray-600 text-base md:text-lg mb-4">
                  A guide to engaging your audience with live Q&A sessions and polls during meetings.
                </p>
                <Link
                  href="/support"
                  className="text-yellow-600 hover:underline font-semibold"
                >
                  Need Help?
                </Link>
              </div>

              <div className="bg-gray-50 rounded-lg shadow-md p-6">
                <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-3">
                  Meeting Transcription
                </h3>
                <p className="text-gray-600 text-base md:text-lg mb-4">
                  Understand how to use live captions and how premium users can download transcriptions.
                </p>
                <Link
                  href="/pricing"
                  className="text-yellow-600 hover:underline font-semibold"
                >
                  Upgrade to Premium
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Support CTA */}
        <section className="bg-yellow-400 py-12 md:py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Need Help?
            </h2>
            <p className="text-base sm:text-lg text-gray-800 mb-6">
              Our support team is here to assist you 24/7.
            </p>
            <Link
              href="/support"
              className="bg-white text-gray-900 font-semibold py-3 px-6 rounded-lg hover:bg-gray-100 transition"
            >
              Contact Support
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}