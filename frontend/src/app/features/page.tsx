"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";

export default function FeaturesPage() {
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
              Discover the Features of webiLink
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-8">
              Advanced tools to make your online meetings interactive, secure, and productive.
            </p>
            <Link
              href="/signup"
              className="bg-yellow-400 text-black font-semibold py-3 px-6 rounded-lg hover:bg-yellow-500 transition"
            >
              Get Started Now
            </Link>
          </div>
        </section>

        {/* Detailed Features Section */}
        <section className="py-12 md:py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="space-y-12">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="md:w-1/2">
                  <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-4">
                    Interactive Q&A and Polls
                  </h2>
                  <p className="text-gray-600 text-base md:text-lg mb-4">
                    Engage participants with live Q&A sessions and polls. Perfect for webinars, classes, or team meetings, these tools make your sessions more dynamic and interactive.
                  </p>
                  <Link
                    href="/signup"
                    className="text-yellow-600 hover:underline font-semibold"
                  >
                    Learn More
                  </Link>
                </div>
                <div className="md:w-1/2 overflow-hidden">
                  <div className="bg-gray-200 h-64 rounded-lg flex items-center justify-center">
                    <Image
                      src="/images/features/qa.png"
                      alt="Q&A and Polls"
                      width={500}
                      height={300}
                      className="object-cover rounded-lg"
                    />
                  </div>
                </div>
              </div>

              <div id='breakout-rooms' className="flex flex-col md:flex-row-reverse items-center gap-8">
                <div className="md:w-1/2">
                  <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-4">
                    Breakout Rooms & DMs
                  </h2>
                  <p className="text-gray-600 text-base md:text-lg mb-4">
                    Facilitate small group discussions with breakout rooms and allow private communication through DMs, complete with emoji support for a more expressive chat experience.
                  </p>
                  <Link
                    href="/signup"
                    className="text-yellow-600 hover:underline font-semibold"
                  >
                    Learn More
                  </Link>
                </div>
                <div className="md:w-1/2 overflow-hidden">
                   <div className="bg-gray-200 h-64 rounded-lg flex items-center justify-center">
                    <Image
                      src="/images/features/dms.png"
                      alt="Q&A and Polls"
                      width={500}
                      height={300}
                      className="object-cover rounded-lg"
                    />
                  </div>
                </div>
              </div>

              <div id='whiteboard' className="flex flex-col md:flex-row items-center gap-8">
                <div className="md:w-1/2">
                  <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-4">
                    Collaborative Whiteboard
                  </h2>
                  <p className="text-gray-600 text-base md:text-lg mb-4">
                    Brainstorm and collaborate in real-time with our built-in whiteboard, available to all users for free. Perfect for workshops, brainstorming sessions, or teaching.
                  </p>
                  <Link
                    href="/signup"
                    className="text-yellow-600 hover:underline font-semibold"
                  >
                    Learn More
                  </Link>
                </div>
                <div className="md:w-1/2 overflow-hidden">
                  <div className="bg-gray-200 h-64 rounded-lg flex items-center justify-center">
                    <Image
                      src="/images/features/whiteboard.png"
                      alt="Q&A and Polls"
                      width={500}
                      height={300}
                      className="object-cover rounded-lg"
                    />
                  </div>
                </div>
              </div>

              <div id='transcript&recording' className="flex flex-col md:flex-row-reverse items-center gap-8">
                <div className="md:w-1/2">
                  <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-4">
                    Transcription & Recording
                  </h2>
                  <p className="text-gray-600 text-base md:text-lg mb-4">
                    Premium users can download recordings and transcriptions, while all users can view live captions during meetings, ensuring accessibility and convenience.
                  </p>
                  <Link
                    href="/pricing"
                    className="text-yellow-600 hover:underline font-semibold"
                  >
                    Explore Plans
                  </Link>
                </div>
                <div className="md:w-1/2 overflow-hidden">
                  <div className="bg-gray-200 h-64 rounded-lg flex items-center justify-center">
                    <Image
                      src="/images/features/transcription.png"
                      alt="Q&A and Polls"
                      width={500}
                      height={300}
                      className="object-cover rounded-lg"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="md:w-1/2">
                  <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-4">
                    Admin Timer & Engagement Tools
                  </h2>
                  <p className="text-gray-600 text-base md:text-lg mb-4">
                    Admins can set timers visible to all participants to keep meetings on track. Features like raise hand ensure active engagement during sessions.
                  </p>
                  <Link
                    href="/signup"
                    className="text-yellow-600 hover:underline font-semibold"
                  >
                    Learn More
                  </Link>
                </div>
                <div className="md:w-1/2 overflow-hidden">
                  <div className="bg-gray-200 h-64 rounded-lg flex items-center justify-center">
                    <Image
                      src="/images/features/engagement.png"
                      alt="Q&A and Polls"
                      width={500}
                      height={300}
                      className="object-cover rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-yellow-400 py-12 md:py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Ready to Experience webiLink?
            </h2>
            <p className="text-base sm:text-lg text-gray-800 mb-6">
              Sign up today and elevate your online meetings.
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