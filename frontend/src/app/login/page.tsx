"use client";

import Login from "../../components/Login";
import Navbar from "../../components/Navbar";
import BackgroundIMG from "../../../public/images/login.jpeg";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const { auth } = useAuth();

  if (auth.authStatus?.isAuthenticated) {
    router.push("/host");
    return null;
  }

  if (auth.isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <div className="w-16 h-16 border-5 border-t-transparent border-b-transparent border-yellow-400 rounded-full animate-spin" />
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <>
      <Navbar user={null} />
      <div
        className={`min-h-screen flex items-center justify-center bg-cover bg-center`}
        style={{ backgroundImage: `url(${BackgroundIMG.src})` }}
      >
        <div className="p-8 w-full max-w-md">
          <h2 className="text-3xl raleway font-bold text-center mb-6">
            Log in
          </h2>
          <Login />
        </div>
      </div>
    </>
  );
}
