"use client";

import { useState, useEffect, SetStateAction, Dispatch } from "react";
import { Bell } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { userApiWithAuth } from "@/lib/api/axios";
import toast from "react-hot-toast";
import { INotification } from "@/types/notification";
import { useRouter } from "next/navigation";

interface NotificationDropdownProps {
  className?: string;
  onSectionChange?: Dispatch<SetStateAction<string>>;
}

export default function NotificationDropdown({
  className,
  onSectionChange,
}: NotificationDropdownProps) {
  const { auth } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    if (auth.user?.id) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [auth.user?.id, page]);

  const fetchNotifications = async () => {
    try {
      const res = await userApiWithAuth.get(
        `/notifications?page=${page}&limit=${limit}`
      );
      setNotifications((prev) => [
        ...prev,
        ...res.data.data.notifications.filter(
          (n: INotification) => !prev.some((p) => p._id === n._id)
        ),
      ]);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error?.response?.data.message);
      } else {
        toast.error("Failed to fetch notifications");
      }
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const res = await userApiWithAuth.get("/notifications/unread-count");
      setUnreadCount(res.data.data.count);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        toast.error(err?.response?.data.message);
      } else {
        toast.error("An unexpected error occurred.");
      }
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await userApiWithAuth.patch(`/notifications/${notificationId}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => prev - 1);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        toast.error(err?.response?.data.message);
      } else {
        toast.error("An unexpected error occurred.");
      }
    }
  };

  const markAllAsRead = async () => {
    try {
      await userApiWithAuth.patch("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        toast.error(err?.response?.data.message);
      } else {
        toast.error("An unexpected error occurred.");
      }
    }
  };

  const handleNotificationClick = async (notification: INotification) => {
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }
    switch (notification.type) {
      case "recording_upload":
        if (onSectionChange) {
          onSectionChange("recordings");
        } else {
          router.push(`/host?section=recordings`);
        }
        break;
      case "subscription_expiring":
      case "subscription_welcome":
        if (onSectionChange) {
          onSectionChange("subscription");
        } else {
          router.push(`/host?section=subscription`);
        }
        break;
      default:
        break;
    }
    setIsOpen(false);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "recording_upload":
        return "🎥";
      case "subscription_expiring":
        return "⏰";
      case "subscription_welcome":
        return "🎉";
      default:
        return "🔔";
    }
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center focus:outline-none bg-gray-50 p-2 rounded-full"
      >
        <Bell className="w-6 h-6 text-gray-500 hover:text-gray-900 transition" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-blue-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-gray-100 rounded-md shadow-lg z-50">
          <div className="p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold text-gray-800">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Mark All as Read
                </button>
              )}
            </div>
            {notifications.length === 0 ? (
              <p className="text-gray-600">No notifications</p>
            ) : (
              <ul className="space-y-2 max-h-80 overflow-y-auto no-scrollbar">
                {notifications.map((notification) => (
                  <li
                    key={notification._id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-3 rounded-md flex items-start gap-3 cursor-pointer transition hover:bg-gray-100 ${
                      notification.isRead ? "bg-gray-100" : "bg-gray-50"
                    }`}
                  >
                    <span className="text-lg">
                      {getNotificationIcon(notification.type)}
                    </span>
                    <div>
                      <p className="text-sm text-gray-700">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                      {!notification.isRead && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notification._id);
                          }}
                          className="text-xs text-blue-600 hover:underline mt-1"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {notifications.length >= page * limit && (
              <button
                onClick={() => setPage((prev) => prev + 1)}
                className="w-full mt-2 text-sm text-blue-600 hover:underline"
              >
                Load More
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
