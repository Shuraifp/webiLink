"use client";

import Navbar from "../components/Navbar";
import Banner from "../components/Banner";
import Features from "../components/Features";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { auth } = useAuth();
  const userData = auth.user;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar user={userData} />
      <main className="flex-1">
        <Banner user={userData} />
        <Features />
      </main>
      <Footer />
    </div>
  );
}