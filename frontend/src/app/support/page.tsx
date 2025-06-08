"use client";

import Link from "next/link";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { apiWithoutAuth } from "@/lib/api/axios";

export default function SupportPage() {
  const { auth } = useAuth();
  const userData = auth.user;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await apiWithoutAuth.post("/users/support/contact", formData);
      setIsSubmitted(true);
    } catch (err) {
      console.error("Error submitting form:", err);
      setError("An error occurred. Please try again later.");
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar user={userData} />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-pink-100 py-12 md:py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-5">
              We’re Here to Help You
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-8">
              Get support for your webiLink experience—find answers, contact us,
              or explore resources.
            </p>
            <Link
              href="#contact"
              className="bg-yellow-400 text-black font-semibold py-3 px-6 rounded-lg hover:bg-yellow-500 transition"
            >
              Contact Us
            </Link>
          </div>
        </section>

        {/* Support Options */}
        <section className="py-12 md:py-20 bg-white">
          <div className="container mx-auto px-4">
            {/* FAQs */}
            <div className="mb-12">
              <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 text-center mb-8">
                Frequently Asked Questions
              </h2>
              <div className="space-y-4 max-w-3xl mx-auto">
                <details className="bg-gray-50 rounded-lg p-4">
                  <summary className="text-lg font-medium text-gray-900 cursor-pointer">
                    How do I use the whiteboard in webiLink?
                  </summary>
                  <p className="text-gray-600 mt-2">
                    During a meeting, click the whiteboard icon in the toolbar
                    to open the collaborative whiteboard. Draw, annotate, and
                    brainstorm with all participants in real-time.
                  </p>
                </details>
                <details className="bg-gray-50 rounded-lg p-4">
                  <summary className="text-lg font-medium text-gray-900 cursor-pointer">
                    How can I set up breakout rooms?
                  </summary>
                  <p className="text-gray-600 mt-2">
                    As a host, go to the meeting controls, select{" "}
                    {"Breakout Rooms,"} and assign participants to smaller
                    groups for focused discussions.
                  </p>
                </details>
                <details className="bg-gray-50 rounded-lg p-4">
                  <summary className="text-lg font-medium text-gray-900 cursor-pointer">
                    How do I enable live captions during a meeting?
                  </summary>
                  <p className="text-gray-600 mt-2">
                    In the meeting settings, toggle on {"Live Captions"} to
                    enable real-time transcription for all participants. Premium
                    users can download the full transcription after the meeting.
                  </p>
                </details>
              </div>
            </div>

            {/* Contact Form */}
            <div id="contact" className="mb-12">
              <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 text-center mb-8">
                Contact Support
              </h2>
              <div className="max-w-lg mx-auto bg-gray-50 rounded-lg p-6 shadow-md">
                {isSubmitted ? (
                  <p className="text-green-600 text-center">
                    Thank you for reaching out! We’ll get back to you soon.
                  </p>
                ) : (
                  <>
                    {error && (
                      <p className="text-red-600 text-center mb-4">{error}</p>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label
                          htmlFor="name"
                          className="block text-gray-700 mb-1"
                        >
                          Name
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                          required
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="email"
                          className="block text-gray-700 mb-1"
                        >
                          Email
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                          required
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="message"
                          className="block text-gray-700 mb-1"
                        >
                          Message
                        </label>
                        <textarea
                          id="message"
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                          rows={4}
                          required
                        ></textarea>
                      </div>
                      <button
                        type="submit"
                        className="w-full bg-yellow-400 text-black font-semibold py-3 px-6 rounded-lg hover:bg-yellow-500 transition"
                      >
                        Submit
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 text-center mb-8">
                Quick Links
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <Link
                  href="/features"
                  className="bg-gray-50 rounded-lg p-4 text-center text-gray-900 hover:bg-gray-100 transition"
                >
                  Explore Features
                </Link>
                <Link
                  href="/pricing"
                  className="bg-gray-50 rounded-lg p-4 text-center text-gray-900 hover:bg-gray-100 transition"
                >
                  View Pricing
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Support CTA */}
        <section className="bg-yellow-400 py-12 md:py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Still Need Assistance?
            </h2>
            <p className="text-base sm:text-lg text-gray-800 mb-6">
              Our team is available 24/7 to help you with any issues.
            </p>
            <Link
              href="#contact"
              className="bg-white text-gray-900 font-semibold py-3 px-6 rounded-lg hover:bg-gray-100 transition"
            >
              Get in Touch
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
