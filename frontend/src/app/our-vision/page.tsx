import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";

export default function OurVisionPage() {
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
              Our Vision for webiLink
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-8">
              Redefining video conferencing with innovation, collaboration, and an exceptional user experience.
            </p>
            <Link
              href="/signup"
              className="bg-yellow-400 text-black font-semibold py-3 px-6 rounded-lg hover:bg-yellow-500 transition"
            >
              Join Us
            </Link>
          </div>
        </section>

        {/* Vision Statement */}
        <section className="py-12 md:py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="md:w-1/2">
                <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-4">
                  A New Standard in Video Conferencing
                </h2>
                <p className="text-gray-600 text-base md:text-lg mb-4">
                  At webiLink, we envision a world where virtual meetings are not just a necessity but a delightful experience. While platforms like Google Meet provide the basics, we go further by integrating advanced features like Q&A, polls, and admin-controlled timers that keep meetings on track—visible to every user for seamless coordination.
                </p>
                <p className="text-gray-600 text-base md:text-lg">
                  Our goal is to foster collaboration with tools like breakout rooms, private DMs with emoji support, and a free whiteboard for all users, ensuring that every meeting is interactive and productive.
                </p>
              </div>
              <div className="md:w-1/2">
                <div className="bg-gray-200 h-64 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Vision Image Placeholder</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Unique Offerings */}
        <section className="py-12 md:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 text-center mb-8">
              What Makes webiLink Unique
            </h2>
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="md:w-1/3 bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-3">
                    Enhanced Collaboration
                  </h3>
                  <p className="text-gray-600 text-base md:text-lg">
                    Features like raise hand, breakout rooms, and a whiteboard make collaboration effortless for all users.
                  </p>
                </div>
                <div className="md:w-1/3 bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-3">
                    Premium & Free Features
                  </h3>
                  <p className="text-gray-600 text-base md:text-lg">
                    Premium users can download recordings and transcriptions, while all users enjoy live captions and core features.
                  </p>
                </div>
                <div className="md:w-1/3 bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-3">
                    Amazing UI
                  </h3>
                  <p className="text-gray-600 text-base md:text-lg">
                    Our beautifully designed interface ensures that every interaction is intuitive and visually appealing.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-yellow-400 py-12 md:py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Be Part of Our Vision
            </h2>
            <p className="text-base sm:text-lg text-gray-800 mb-6">
              Sign up today and experience video conferencing like never before.
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