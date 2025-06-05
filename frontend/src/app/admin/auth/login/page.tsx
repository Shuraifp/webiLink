"use client"

import Link from "next/link";
import Login from "@/components/admin/Login";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

const AdminLogin = () => {
  const router = useRouter();
  const { admin } = useAuth();
  const adminAuth = admin.adminStatus;

  if(admin.isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-full bg-gray-100">
        <div className="w-16 h-16 border-5 border-t-transparent border-b-transparent border-yellow-400 rounded-full animate-spin" />
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    );
  }

  if(adminAuth?.isAuthenticated) {
    router.push('/admin');
    return null;
  }
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-white merriweather text-2xl font-bold text-center mb-6"><p className="text-4xl cursor-pointer inline font-bold lobster"><span className="text-yellow-500">w</span>ebiLink </p> Admin</h2>
        <Login />
        <div className="mt-4 text-center">
          <Link href="/" className="text-yellow-500 hover:underline">Back to Home</Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
