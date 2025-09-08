"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  changePassword,
  getUser,
  updateProfile,
} from "../../lib/api/user/profileApi";
import { UserProfile } from "../../types/type";
import axios from "axios";
import toast from "react-hot-toast";
import { fetchRooms } from "@/lib/api/user/roomApi";
import { Room } from "@/types/userDashboard";

export default function Profile() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [profileData, setProfileData] = useState<
    Partial<UserProfile["profile"]>
  >({});
  const backgroundInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const userData = await getUser();
        setUser(userData.data!);
        setProfileData(userData.data!.profile || {});
      } catch (err) {
        if (axios.isAxiosError(err)) {
          toast.error(err?.response?.data.message);
        } else {
          toast.error("An unexpected error occurred.");
        }
      } finally {
        setLoading(false);
      }
    };
    const getRooms = async () => {
      try {
        const res = await fetchRooms();
        setRooms(res);
      } catch (err) {
        console.log("error Fetching rooms: ", err);
      }
    };
    fetchUser();
    getRooms();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updatedUser = await updateProfile(profileData);
      setUser(updatedUser.data!);
      setIsEditing(false);
      setError(null);
      toast.success(updatedUser.message);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        toast.error(err?.response?.data.message);
      } else {
        toast.error("An unexpected error occurred.");
      }
    }
  };

  const handleImageClick = (ref: React.RefObject<HTMLInputElement | null>) => {
    if (ref?.current) {
      ref.current.click();
    }
  };

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "backgroundImage" | "avatar"
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleImageUpload(file, type);
    }
  };

  const handleImageUpload = async (
    file: File,
    type: "backgroundImage" | "avatar"
  ) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "webilink");
      formData.append(
        "cloud_name",
        process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!
      );

      const response = await axios.post(
        "https://api.cloudinary.com/v1_1/" +
          process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME +
          "/image/upload",
        formData
      );

      const imageUrl = response.data.secure_url;
      const updatedProfileData = { ...profileData, [type]: imageUrl };

      const updatedUser = await updateProfile(updatedProfileData);
      setUser(updatedUser.data!);
      setProfileData(updatedProfileData);
      toast.success("Image updated successfully!");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        toast.error(err?.response?.data.message || "Image upload failed.");
      } else {
        toast.error("An unexpected error occurred.");
      }
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New password and confirmation do not match.");
      return;
    }
    if (passwordData.newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long.");
      return;
    }

    try {
      const response = await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success(response.message);
      setIsChangePasswordOpen(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        toast.error(
          err?.response?.data.message || "Failed to change password."
        );
      } else {
        toast.error("An unexpected error occurred.");
      }
    }
  };

  const handlePasswordInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-600">{error}</div>;
  }

  if (!user) {
    return <div className="text-center py-10">No user data available</div>;
  }

  return (
    <div className="flex justify-around pt-4">
      <div className="relative px-4 w-full max-w-2xl">
        <div className="relative">
          <div
            onClick={() => handleImageClick(backgroundInputRef)}
            className="w-full h-48 rounded-t-3xl bg-gray-200 cursor-pointer relative"
            title="Change Background image"
          >
            {profileData?.backgroundImage ? (
              <img
                src={profileData?.backgroundImage}
                alt="Background"
                className="w-full h-full object-cover rounded-t-3xl"
              />
            ) : (
              <div className="w-full h-full bg-gray-100 rounded-t-3xl"></div>
            )}
            <input
              type="file"
              ref={backgroundInputRef}
              className="hidden"
              accept="image/*"
              onChange={(e) => handleFileChange(e, "backgroundImage")}
            />
          </div>

          <div className="flex justify-center relative z-10 -mt-12">
            <div
              className="cursor-pointer"
              onClick={() => handleImageClick(avatarInputRef)}
              title="Change Profile image"
            >
              {profileData?.avatar ? (
                <img
                  src={profileData?.avatar}
                  alt="Avatar"
                  className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-24 h-24 cursor-pointer rounded-full bg-gray-500 flex items-center justify-center text-4xl font-bold text-white border-2 border-gray-400 hover:scale-105 transition-all">
                  {user.username
                    ?.split(" ")
                    .map((a) => a[0].toUpperCase())
                    .join("")}
                </div>
              )}
              <input
                type="file"
                ref={avatarInputRef}
                className="hidden"
                accept="image/*"
                onChange={(e) => handleFileChange(e, "avatar")}
              />
            </div>
          </div>
        </div>

        <div className="flex relative flex-col items-center mt-4">
          <h1 className="text-2xl font-bold text-gray-800">
            {user.profile?.firstName || ""} {user.profile?.lastName || ""}
          </h1>
          <p className="text-sm text-gray-500">@{user.username}</p>
          <p className="text-sm text-gray-600 mt-1">
            {user.profile?.jobTitle || ""} {user.profile?.company ? "•" : ""}{" "}
            {user.profile?.company || ""}
          </p>
          <button
            title="Edit profile"
            className="absolute bottom-1 cursor-pointer right-2 bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
            onClick={() => setIsEditing(true)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z"
              />
            </svg>
          </button>
        </div>

        <div className="mt-6">
          <h2 className="text-lg font-semibold text-gray-700">About Me</h2>
          <p className="text-gray-600 mt-2 text-sm">
            {user.profile?.bio || "No bio available"}
          </p>
        </div>

        <div className="mt-6">
          <h2 className="text-lg font-semibold text-gray-700">Contact</h2>
          <div className="mt-2 space-y-2">
            <div>
              <label className="text-sm font-medium text-gray-600">Email</label>
              <p className="text-gray-800 text-sm">{user.email}</p>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-lg font-semibold text-gray-700">
            Account Details
          </h2>
          <div className="mt-2 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-600">Premium</span>
              <span
                className={`text-sm ${
                  user.isPremium ? "text-green-600" : "text-red-600"
                }`}
              >
                {user.isPremium ? "Yes" : "No"}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-lg font-semibold text-gray-700">Account Dates</h2>
          <div className="mt-2 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-600">
                Created At
              </span>
              <span className="text-gray-800 text-sm">
                {user.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-600">
                Last Updated
              </span>
              <span className="text-gray-800 text-sm">
                {user.updatedAt
                  ? new Date(user.updatedAt).toLocaleDateString()
                  : "N/A"}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t pt-4">
          <h2 className="text-lg font-semibold text-yellow-600">
            Change Password
          </h2>
          <p className="text-sm text-gray-600 mt-2">
            Update your password to keep your account secure. Ensure your new
            password is strong and unique.
          </p>
          <button
            onClick={() => setIsChangePasswordOpen(true)}
            className="mt-4 w-full bg-yellow-500 cursor-pointer text-white px-4 py-2 rounded-full hover:bg-yellow-600 transition"
          >
            Change Password
          </button>
        </div>

        {isEditing && (
          <div
            className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center  overflow-y-scroll justify-center z-50"
            style={{ backgroundColor: "rgba(75, 85, 99, 0.5)" }}
          >
            <div className="bg-white p-6 rounded-lg w-full max-w-md mt-16 my-10">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Edit Profile
              </h2>
              <form onSubmit={handleUpdateProfile}>
                <div className="mb-2">
                  <label className="block text-sm font-medium text-gray-600">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={profileData?.firstName || ""}
                    onChange={handleInputChange}
                    className="w-full p-1 border rounded-md"
                  />
                </div>
                <div className="mb-2">
                  <label className="block text-sm font-medium text-gray-600">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={profileData?.lastName || ""}
                    onChange={handleInputChange}
                    className="w-full p-1 border rounded-md"
                  />
                </div>
                <div className="mb-2">
                  <label className="block text-sm font-medium text-gray-600">
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    value={profileData?.bio || ""}
                    onChange={handleInputChange}
                    className="w-full p-1 border rounded-md"
                  />
                </div>
                <div className="mb-2">
                  <label className="block text-sm font-medium text-gray-600">
                    Job Title
                  </label>
                  <input
                    type="text"
                    name="jobTitle"
                    value={profileData?.jobTitle || ""}
                    onChange={handleInputChange}
                    className="w-full p-1 border rounded-md"
                  />
                </div>
                <div className="mb-2">
                  <label className="block text-sm font-medium text-gray-600">
                    Company
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={profileData?.company || ""}
                    onChange={handleInputChange}
                    className="w-full p-1 border rounded-md"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isChangePasswordOpen && (
          <div
            className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50"
            style={{ backgroundColor: "rgba(75, 85, 99, 0.5)" }}
          >
            <div className="bg-white p-6 rounded-lg w-full max-w-md">
              <h2 className="text-xl font-semibold text-yellow-600 mb-4">
                Change Password
              </h2>
              <form onSubmit={handlePasswordChange}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-600">
                    Current Password
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordInputChange}
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-600">
                    New Password
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordInputChange}
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-600">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordInputChange}
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsChangePasswordOpen(false)}
                    className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
                  >
                    Save Password
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-around mt-4 pl-2 border-yellow-500 border-l-3 bg-gray-200 h-fit py-4">
        <div className="text-center">
          <p className="text-xl text-gray-500">Active rooms</p>
          <p className="text-lg font-semibold text-gray-800">{rooms.length}</p>
        </div>
      </div>
    </div>
  );
}
