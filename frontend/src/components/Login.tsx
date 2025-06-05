"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import googleLogo from "../../public/logos/google.png";
import { auth, googleProvider, signInWithPopup } from "../lib/firebase";
import Link from "next/link";
import { AuthInput } from "../types/type";
import { useAuth } from "@/context/AuthContext";
import { loginUser, googleSignIn, forgotPassword } from "@/lib/api/user/authApi";
import axios from "axios";

const Login: React.FC = () => {
  const [user, setUser] = useState<AuthInput>({
    username: "",
    email: "",
    password: "",
  });
  const { login } = useAuth();
  const [resetEmail, setResetEmail] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState('')
  const [errors, setErrors] = useState({
    email: { message: "" },
    password: { message: "" },
  });
  const router = useRouter();

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const userData = result.user;

      const res = await googleSignIn({
        username: userData?.displayName ?? "",
        email: userData?.email ?? "",
        avatar: userData?.photoURL ?? "",
        googleId: userData?.uid ?? "",
      });
      login(res.webiUser, res.webiAuthStatus)
      router.replace("/host");
    } catch (err) {
      console.log(err)
      if (axios.isAxiosError(err)) {
        setError(err?.response?.data.message);
      } else {
        setError("An unexpected error occurred.");
      }
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      const res = await loginUser(user.email, user.password);
      login(res.webiUser, res.webiAuthStatus)
      router.replace("/host");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err?.response?.data.message);
      } else {
        setError("An unexpected error occurred.");
      }
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if(successMsg!==''){
      setSuccessMsg('')
      return
    }
    setError("");

    if (
      !resetEmail.trim() ||
      !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(resetEmail)
    ) {
      setError("Please enter a valid email.");
      return;
    }

    try {
      const res = await forgotPassword(resetEmail);
      setSuccessMsg(res.message)
// v      setShowForgotPassword(false);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err?.response?.data.message);
      } else {
        setError("An unexpected error occurred.");
      }
    }
  };

  const validateForm = () => {
    const newErrors = {
      email: { message: "" },
      password: { message: "" },
    };

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!user.email.trim()) {
      newErrors.email.message = "Email is required";
    } else if (!emailRegex.test(user.email)) {
      newErrors.email.message = "Invalid email format";
    }

    if (!user.password.trim()) {
      newErrors.password.message = "Password is required";
    }

    setErrors(newErrors);

    return Object.values(newErrors).every((error) => error.message === "");
  };

  return (
    <>
      {error && (
        <div className="mb-4 p-3 raleway bg-red-100 text-red-700 rounded-lg text-center">
          {error}
        </div>
      )}

      {/* Google Login Button */}
      <button
        onClick={handleGoogleLogin}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-gray-400 rounded-lg transform hover:border-black transition mb-4"
      >
        <Image src={googleLogo} alt="Google icon" width={20} height={20} />
        <span>Sign in with Google</span>
      </button>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-400"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-2 text-gray-500">OR</span>
        </div>
      </div>

      {!showForgotPassword ? (
        <form onSubmit={handleEmailLogin}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm text-gray-700 mb-1">
              Working Email
            </label>
            <input
              type="text"
              id="email"
              value={user.email}
              onChange={(e) => setUser({ ...user, email: e.target.value })}
              className="w-full py-3 px-4 border border-gray-400 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Enter your email"
            />
            {errors.email.message !== "" && (
              <p className="text-red-600 roboto">{errors.email.message}</p>
            )}
          </div>

          <div className="mb-4">
            <label
              htmlFor="password"
              className="block text-sm text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={user.password}
              onChange={(e) => setUser({ ...user, password: e.target.value })}
              className="w-full py-3 px-4 border border-gray-400 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Enter your password"
            />
            {errors.password.message !== "" && (
              <p className="text-red-600 roboto">{errors.password.message}</p>
            )}
          </div>

          <div className="text-right mb-4">
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="text-sm text-blue-600 hover:underline"
            >
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition text-lg"
          >
            Log in
          </button>
          <Link href="/signup" className="text-center">
            {" "}
            <p>Are you new here?</p>{" "}
            <p className="text-blue-500 hover:underline">Sign up</p>
          </Link>
        </form>
      ) : (
        <form onSubmit={handleForgotPassword}>
          <h3 className="text-lg font-semibold mb-4">Forgot Password</h3>
          <p className="text-sm text-gray-700 mb-4">
            {successMsg !== '' ? successMsg : 'Enter your email address, and we’ll send you a link to reset your password.'}
          </p>
          <div className="mb-4">
            <label
              htmlFor="forgot-email"
              className="block text-sm text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              type="text"
              id="forgot-email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              className="w-full py-3 px-4 border border-gray-400 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Enter your email"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            {successMsg !== '' ? 'Send again' : 'Send Reset Link'}
          </button>
          <button
            type="button"
            onClick={() => setShowForgotPassword(false)}
            className="w-full mt-2 text-sm text-blue-600 hover:underline"
          >
            Back to Log in
          </button>
          <Link href="/signup" className="text-center">
            {" "}
            <p>Are you new here?</p>{" "}
            <p className="text-blue-500 hover:underline">Sign up</p>
          </Link>
        </form>
      )}
    </>
  );
};

export default Login;
