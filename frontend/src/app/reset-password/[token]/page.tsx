"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import BackgroundIMG from "../../../../public/images/login.jpeg";
import Navbar from "@/components/Navbar";
import axios from "axios";
import { resetPassword } from "@/lib/api/user/authApi";

const ResetPasswordPage: React.FC = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

 const params = useParams();
 const token = params?.token as string;

  const validate = () => {
    setError("");

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!newPassword.trim()) {
      setError("Password is required");
      return false;
    } else if (!passwordRegex.test(newPassword)) {
      setError(
        "Password must be at least 8 characters long, include uppercase, lowercase, a number, and a special character (@$!%*?&)"
      );
      return false;
    }

    if (!confirmPassword.trim()) {
      setError("Confirm Password is required");
      return false;
    } else if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
  
    return true;
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if(success !==''){
      window.close()
    }
    setSuccess("");

    if(!validate()){
      return
    }

    try {
      await resetPassword(token, newPassword);
      setSuccess("Password reset successfully")
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err?.response?.data.message);
      } else {
        setError("Failed to reset password. Please try again.");
      }
    }
  };

  return (
    <>
      <Navbar user={null} />
      <div
        className="min-h-screen flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: `url(${BackgroundIMG.src})` }}
      >
        <div className="p-8 w-full max-w-md">
          <h2 className="text-3xl raleway font-bold text-center mb-6">
            Reset Password
          </h2>
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-center">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg text-center">
              {success}
            </div>
          )}
          <form onSubmit={handleResetPassword}>
            <div className="mb-4">
              <label
                htmlFor="new-password"
                className="block text-sm text-gray-600 mb-1"
              >
                New Password
              </label>
              <input
                type="password"
                id="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter new password"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="confirm-password"
                className="block text-sm text-gray-600 mb-1"
              >
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirm-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Confirm new password"
              />
            </div>
            <p className="text-sm text-gray-700 mb-4">
            {success !== '' ? 'Your password has been successfully reset. You can now close this tab or go back to the login page.' : ''}
          </p>
            <button
              type="submit"
              className={`w-full py-3 ${success !== '' ? 'bg-amber-300 hover:bg-amber-400' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-lg transition`}
            >
              {success !== '' ? 'Close the window' : 'Reset Password'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default ResetPasswordPage;
