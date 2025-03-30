"use client";
import { useState } from "react";
import { login } from "@/lib/api/admin/authApi";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function LogIn() {
  const router = useRouter()
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Both fields are required.");
      return;
    }

    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }

    setError("");

    try {
      await login(email,password)
      router.push('/admin')
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err?.response?.data.message);
      } else {
        setError("An unexpected error occurred.");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label className="block text-gray-300 lora mb-2">Email</label>
        <input
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-yellow-500"
          placeholder="Enter your email"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-300 lora mb-2">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-yellow-500"
          placeholder="Enter your password"
        />
      </div>
      {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
      <button
        type="submit"
        className="w-full lora bg-yellow-500 text-gray-900 text-xl font-bold py-2 rounded-md hover:bg-yellow-600 transition"
      >
        Login
      </button>
    </form>
  );
}
