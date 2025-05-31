"use client";

import React, { useState } from "react";

const ChangePassword: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess("Password changed successfully! Please log in again.");
        // setTimeout(() => {
        //   signOut({ callbackUrl: "/login" });
        // }, 2000);
      } else {
        setError(data.message || "Failed to change password.");
      }
    } catch {
      setError("Failed to change password. Please try again.");
    }
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Change Password</h3>
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
      <form onSubmit={handleChangePassword}>
        <div className="mb-4">
          <label htmlFor="current-password" className="block text-sm text-gray-600 mb-1">
            Current Password
          </label>
          <input
            type="password"
            id="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter current password"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="new-password" className="block text-sm text-gray-600 mb-1">
            New Password
          </label>
          <input
            type="password"
            id="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter new password"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="confirm-password" className="block text-sm text-gray-600 mb-1">
            Confirm New Password
          </label>
          <input
            type="password"
            id="confirm-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Confirm new password"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Change Password
        </button>
      </form>
    </div>
  );
};

export default ChangePassword;