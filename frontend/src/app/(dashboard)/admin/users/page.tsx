"use client";

import { useState, useEffect } from "react";
import { Search, Lock, Unlock, Trash2, Undo } from "lucide-react";
import LogoutButton from "@/components/admin/LogoutButton";
import {
  fetchUsers,
  blockUser,
  unblockUser,
  restoreUser,
  softDeleteUser,
} from "@/lib/api/admin/adminApi";
import { UserStatus } from "@/types/type";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";


type User = {
  _id: string;
  username: string;
  email: string;
  status: UserStatus | "active";
};

export default function UserManagementPage() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        const response: User[] = await fetchUsers();
        const fetchedUsers = Array.isArray(response) ? response : [];
        setUsers(fetchedUsers);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          toast.error(err?.response?.data.message)
          setError(err?.response?.data.message);
        } else {
          setError("An unexpected error occurred.");
          toast.error("An unexpected error occurred.");
        }
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, []);

  const filteredUsers = users?.filter(
    (user) =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div className="p-8 text-center">Loading users...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;

  const handleBlockUser = async (userId: string) => {
    try {
      await blockUser(userId);
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === userId ? { ...user, status: UserStatus.Blocked } : user
        )
      );
    } catch (err) {
      if (axios.isAxiosError(err)) {
        toast.error(err?.response?.data.message)
      } else {
        toast.error("An unexpected error occurred while blocking user.");
      }
    }
  };

  const handleUnblockUser = async (userId: string) => {
    try {
      await unblockUser(userId);
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === userId ? { ...user, status: UserStatus.Active } : user
        )
      );
    } catch (err) {
      console.error("Error unblocking user:", err);
    }
  };

  const handleSoftDeleteUser = async (userId: string) => {
    try {
      await softDeleteUser(userId);
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === userId ? { ...user, status: UserStatus.Archived } : user
        )
      );
    } catch (err) {
      if (axios.isAxiosError(err)) {
        toast.error(err?.response?.data.message)
      } else {
        toast.error("error occurred while archiving user.");
      }
    }
  };

  const handleRestoreUser = async (userId: string) => {
    try {
      await restoreUser(userId);
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === userId ? { ...user, status: UserStatus.Active } : user
        )
      );
    } catch (err) {
      if (axios.isAxiosError(err)) {
        toast.error(err?.response?.data.message)
      } else {
        toast.error("An unexpected error occurred while restoring user.");
      }
    }
  };
  return (
    <div className="flex min-h-screen bg-gray-100">
    <Toaster />
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow p-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">
            User Management
          </h2>
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="py-2 px-4 border border-gray-300 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="w-5 h-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            </div>
            <LogoutButton />
          </div>
        </header>

        <main className="flex-1 p-8">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Sn
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user, ind) => (
                  <tr key={ind + 1} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {ind+1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.username}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          user.status === UserStatus.Active
                            ? "bg-green-100 text-green-800"
                            : user.status === UserStatus.Blocked
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {user.status.charAt(0).toUpperCase() +
                          user.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        {user.status === UserStatus.Archived ? (
                          <button
                            onClick={() => handleRestoreUser(user._id)}
                            className="text-blue-600 hover:text-blue-800 hover:cursor-pointer"
                            title="Restore user"
                          >
                            <Undo className="w-5 h-5" />
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() =>
                                user.status === UserStatus.Active
                                  ? handleBlockUser(user._id)
                                  : handleUnblockUser(user._id)
                              }
                              className={`${
                                user.status !== UserStatus.Blocked
                                  ? "text-orange-600 hover:text-orange-800"
                                  : "text-green-600 hover:text-green-800"
                              } hover:cursor-pointer`}
                              title={
                                user.status !== UserStatus.Blocked
                                  ? "Block user"
                                  : "Unblock user"
                              }
                            >
                              {user.status !== UserStatus.Blocked ? (
                                <Lock className="w-5 h-5" />
                              ) : (
                                <Unlock className="w-5 h-5" />
                              )}
                            </button>

                            <button
                              onClick={() => handleSoftDeleteUser(user._id)}
                              className="text-red-600 hover:text-red-800 hover:cursor-pointer"
                              title="Archive user"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No users found matching your criteria
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
