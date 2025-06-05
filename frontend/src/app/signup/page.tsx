"use client";

import Signup from "../../components/Signup";
import img from "../../../public/images/1.webp";
import Link from "next/link";
import Image from "next/image";
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
    <div className="min-h-screen flex flex-col">
      <nav className="p-4 bg-white">
        <Link href="/" className="text-4xl font-bold lobster cursor-pointer">
          <span className="text-yellow-500">w</span>ebiLink
        </Link>
      </nav>

      <div className="flex md:flex-1">
        <div className="w-1/2 flex flex:1 items-center justify-cente relative">
          <div className=" hidden md:block bg-amber-300">
            <Image
              src={img}
              alt="Background"
              width={700}
              height={700}
              // layout="fill"
              objectFit="cover"
              className="rounded-l-lg"
            />
          </div>
        </div>

        <Signup />
      </div>
    </div>
  );
}
