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
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { User } from "@/types/adminDashboard";


export default function UserManagementPage() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        const response = await fetchUsers(page, limit);
        console.log(response)
        setUsers(response.data.data);
        setTotalPages(response.data.totalPages);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          toast.error(err?.response?.data.message);
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
  }, [limit,page]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };


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
          user._id === userId ? { ...user, isBlocked: true } : user
        )
      );
    } catch (err) {
      if (axios.isAxiosError(err)) {
        toast.error(err?.response?.data.message);
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
          user._id === userId ? { ...user, isBlocked: false } : user
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
          user._id === userId ? { ...user, isArchived: true } : user
        )
      );
    } catch (err) {
      if (axios.isAxiosError(err)) {
        toast.error(err?.response?.data.message);
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
          user._id === userId ? { ...user, isArchived: false } : user
        )
      );
    } catch (err) {
      if (axios.isAxiosError(err)) {
        toast.error(err?.response?.data.message);
      } else {
        toast.error("An unexpected error occurred while restoring user.");
      }
    }
  };
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Toaster />
      <div className="flex-1 flex flex-col">
        <div className="bg-white shadow p-4 flex items-center justify-between">
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
        </div>

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
                      {ind + 1}
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
                          user.isBlocked
                            ? "bg-red-100 text-red-800"
                            : user.isArchived
                            ?  "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {
                          user.isBlocked
                            ? "Blocked"
                            : user.isArchived
                            ?  "Archived"
                            : "Active"
                        }
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        {user.isArchived ? (
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
                                !user.isBlocked
                                  ? handleBlockUser(user._id)
                                  : handleUnblockUser(user._id)
                              }
                              className={`${
                                !user.isBlocked
                                  ? "text-orange-600 hover:text-orange-800"
                                  : "text-green-600 hover:text-green-800"
                              } hover:cursor-pointer`}
                              title={
                                !user.isBlocked
                                  ? "Block user"
                                  : "Unblock user"
                              }
                            >
                              { !user.isBlocked ? (
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

          <div className="flex justify-between items-center mt-4">
            <div className="text-gray-600 text-sm">
              Page {page} of {totalPages} (Total: {users.length}{" "}
              records)
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className={`px-4 py-2 rounded-sm raleway text-white font-medium transition-all duration-300 ${
                  page === 1
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-yellow-500 hover:bg-yellow-600"
                }`}
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className={`px-4 py-2 rounded-sm raleway text-white font-medium transition-all duration-300 ${
                  page === totalPages
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-yellow-500 hover:bg-yellow-600"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        </main> 
      </div>
    </div>
  );
}
