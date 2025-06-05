"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import googleLogo from "../../public/logos/google.png";
import { useRouter } from "next/navigation";
import { auth, googleProvider, signInWithPopup } from "../lib/firebase";
import { AuthInput } from "../types/type";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { signup, resendOtp, verifyOtp } from "@/lib/api/user/authApi";
import { googleSignIn } from "@/lib/api/user/authApi";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";

const Signup: React.FC = () => {
  const [user, setUser] = useState<AuthInput>({
    username: "",
    email: "",
    password: "",
  });
  const { login } = useAuth();
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({
    username: { message: "" },
    email: { message: "" },
    password: { message: "" },
    confirmPassword: { message: "" },
  });
  const OTP_TIMEOUT = 90;
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [timer, setTimer] = useState(OTP_TIMEOUT);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const router = useRouter();

  const togglePassword = () => setShowPassword(!showPassword);
  const toggleConfirmPassword = () =>
    setShowConfirmPassword(!showConfirmPassword);

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
      login(res.webiUser, res.webiAuthStatus);
      router.replace("/host");
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
      username: { message: "" },
      email: { message: "" },
      password: { message: "" },
      confirmPassword: { message: "" },
    };

    if (!user.username.trim()) {
      newErrors.username.message = "Username is required";
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!user.email.trim()) {
      newErrors.email.message = "Email is required";
    } else if (!emailRegex.test(user.email)) {
      newErrors.email.message = "Invalid email format";
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!user.password.trim()) {
      newErrors.password.message = "Password is required";
    } else if (!passwordRegex.test(user.password)) {
      newErrors.password.message =
        "Password must be at least 8 characters long, include uppercase, lowercase, a number, and a special character (@$!%*?&)";
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword.message = "Confirm Password is required";
    } else if (user.password !== confirmPassword) {
      newErrors.confirmPassword.message = "Passwords do not match";
    }

    setErrors(newErrors);

    return Object.values(newErrors).every((error) => error.message === "");
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      await signup(user.username, user.email, user.password);
      setShowOtpInput(true);
      setTimer(OTP_TIMEOUT);
      setIsResendDisabled(true);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err?.response?.data.message);
      } else {
        setError("An unexpected error occurred.");
      }
    }
  };

  const handleResendOtp = async () => {
    try {
      await resendOtp(user.username, user.email, user.password);
      setShowOtpInput(true);
      setTimer(OTP_TIMEOUT);
      setIsResendDisabled(true);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err?.response?.data.message);
      } else {
        setError("An unexpected error occurred.");
      }
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await verifyOtp(user.email, otp);
      login(res.webiUser, res.webiAuthStatus);
      router.replace("/host");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err?.response?.data.message);
      } else {
        setError("An unexpected error occurred.");
      }
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (showOtpInput && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsResendDisabled(false);
    }

    return () => clearInterval(interval);
  }, [showOtpInput, timer]);

  return (
    <div className="w-full md:w-1/2 flex items-center justify-center p-10">
      <div className="w-full max-w-md">
        <h2 className="text-3xl raleway font-bold text-center mb-6">
          {`Let's Go`}
        </h2>

        {error && (
          <div className="mb-4 p-3 raleway bg-red-100 text-red-700 rounded-lg text-center">
            {error}
          </div>
        )}

        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-gray-400 rounded-lg hover:border-black transition mb-4"
        >
          <Image src={googleLogo} alt="Google icon" width={20} height={20} />
          <span>Sign Up with Google</span>
        </button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-400"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-gray-500">OR</span>
          </div>
        </div>

        <form onSubmit={showOtpInput ? handleVerifyOtp : handleEmailSignup}>
          <div className="mb-4">
            <label
              htmlFor="username"
              className="block text-sm text-gray-700 mb-1"
            >
              Name
            </label>
            <input
              type="text"
              id="username"
              value={user.username}
              onChange={(e) => setUser({ ...user, username: e.target.value })}
              className="w-full py-3 px-4 border border-gray-400 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Enter your email"
            />
            {errors.username.message !== "" && (
              <p className="text-red-600 roboto">{errors.username.message}</p>
            )}
          </div>

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

          {!showOtpInput && (
            <>
              <div className="mb-4 relative">
                <label
                  htmlFor="password"
                  className="block text-sm text-gray-700 mb-1"
                >
                  Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={user.password}
                  onChange={(e) =>
                    setUser({ ...user, password: e.target.value })
                  }
                  className="w-full py-3 px-4 border border-gray-400 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={togglePassword}
                  className="absolute right-3 top-12 transform -translate-y-1/2"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                {errors.password.message !== "" && (
                  <p className="text-red-600 roboto">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="mb-4 relative">
                <label
                  htmlFor="confirm-password"
                  className="block text-sm text-gray-700 mb-1"
                >
                  Confirm Password
                </label>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirm-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full py-3 px-4 border border-gray-400 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={toggleConfirmPassword}
                  className="absolute right-3 top-12 transform -translate-y-1/2"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
                {errors.confirmPassword.message !== "" && (
                  <p className="text-red-600 roboto">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </>
          )}

          {showOtpInput && (
            <div className="mb-4">
              <label htmlFor="otp" className="block text-sm text-gray-700 mb-1">
                OTP
              </label>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full py-3 px-4 border border-gray-400 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Enter OTP"
              />
              <p className="text-sm text-center text-blue-500">
                Resend OTP in {timer} seconds
              </p>
              <div className="flex justify-center py-2">
                <button
                  onClick={handleResendOtp}
                  disabled={isResendDisabled}
                  className="text-red-500"
                >
                  Resend OTP
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition text-lg"
          >
            {showOtpInput ? "Verify OTP" : "Continue"}
          </button>
          <Link href="/login" className="text-center">
            {" "}
            <p>Already have an account?</p>{" "}
            <p className="text-blue-500 hover:underline">Log in</p>
          </Link>
        </form>
      </div>
    </div>
  );
};

export default Signup;
