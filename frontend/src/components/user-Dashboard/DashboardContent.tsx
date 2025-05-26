"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/user-Dashboard/Sidebar";
import Rooms from "@/components/user-Dashboard/Rooms";
import CreateMeeting from "@/components/user-Dashboard/CreateMeeting";
import Settings from "@/components/user-Dashboard/Settings";
import Subscription from "@/components/user-Dashboard/Subscription";
import Upgrade from "@/components/user-Dashboard/Upgrade";
import { ThemeProvider } from "@/lib/ThemeContext";
import { UserData } from "@/types/type";
import { useSearchParams } from "next/navigation";
import { Toaster } from "react-hot-toast";
import Profile from "./Profile";
import Recordings from "./Recordings";
// import {
//   fetchNotifications,
//   markNotificationAsRead,
// } from "@/lib/api/user/notifications";
import { Bell, X } from "lucide-react";
import Dashboard from "./Overview";
import History from "./History";

interface DashboardContentProps {
  user: UserData;
}

interface Notification {
  _id: string;
  type: string;
  message: string;
  status: "unread" | "read";
  metadata?: { paymentUrl?: string };
}

// interface SidebarSections {
//   Rooms : 'rooms';
//   Profile: 'profile';
//   Create_Meeting: 'create-meeting';
//   Settings: 'settings';
//   Subscription: 'subscription';
//   Recordings: 'recordings';
//   Upgrade: 'upgrade';
// }

const DashboardContent: React.FC<DashboardContentProps> = ({ user }) => {
  const searchParams = useSearchParams();
  const initialSection = searchParams.get("section") || "overview";
  const [selectedSection, setSelectedSection] = useState(initialSection);
  const [prevSection, setPrevSection] = useState("");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (searchParams.get("section")) {
      setSelectedSection(searchParams.get("section")!);
    }
  }, [searchParams]);

  // useEffect(() => {
  //   const loadNotifications = async () => {
  //     try {
  //       const data = await fetchNotifications();
  //       setNotifications(data);
  //     } catch (error) {
  //       console.error("Failed to fetch notifications:", error);
  //     }
  //   };
  //   loadNotifications();
  // }, []);

  // const handleMarkAsRead = async (notificationId: string) => {
  //   try {
  //     await markNotificationAsRead(notificationId);
  //     setNotifications((prev) =>
  //       prev.map((n) =>
  //         n._id === notificationId ? { ...n, status: "read" } : n
  //       )
  //     );
  //   } catch (error) {
  //     console.error("Failed to mark notification as read:", error);
  //   }
  // };

  // const handleNotificationAction = (notification: Notification) => {
  //   if (
  //     notification.type === "payment_failed" &&
  //     notification.metadata?.paymentUrl
  //   ) {
  //     window.location.href = notification.metadata.paymentUrl;
  //   }
  // };

  const renderContent = () => {
    switch (selectedSection) {
      case "create-meeting":
        return (
          <CreateMeeting
            onSectionChange={setSelectedSection}
            prevSection={prevSection}
          />
        );
      case "profile":
        return <Profile />;
      case "rooms":
        return (
          <Rooms
            user={user}
            onSectionChange={setSelectedSection}
            selectedSection={selectedSection}
            setPrevSection={setPrevSection}
          />
        );
      case "settings":
        return <Settings />;
      case "subscription":
        return <Subscription onSectionChange={setSelectedSection} />;
      case "recordings":
        return <Recordings onSectionChanges={setSelectedSection} />;
      case "overview":
        return (
          <Dashboard
            onSectionChange={setSelectedSection}
            selectedSection={selectedSection}
            setPrevSection={setPrevSection}
          />
        );
      case "history":
        return <History />;
      case "upgrade":
        return <Upgrade />;
      default:
        return (
          <Dashboard
            onSectionChange={setSelectedSection}
            selectedSection={selectedSection}
            setPrevSection={setPrevSection}
          />
        );
    }
  };

  return (
    <ThemeProvider>
      <Toaster />
      <div className="flex host-root min-h-screen bg-gray-200">
        <Sidebar
          user={user}
          onSectionChange={setSelectedSection}
          selectedSection={selectedSection}
          setPrevSection={setPrevSection}
        />
        <div className="flex-1 h-screen overflow-y-scroll">
          <main className="">
            <div className="p-8 pt-7 pb-5 flex items-center justify-between">
              <h2 className="text-3xl font-bold raleway items-center flex-1 text-gray-800">
                {selectedSection === "profile"
                  ? "Profile"
                  : selectedSection === "recordings"
                  ? "Recordings"
                  : `Welcome, ${user.username}`}
              </h2>
              <div className="relative flex">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 justify-end"
                >
                  <Bell size={24} className="text-gray-700" />
                  {notifications.filter((n) => n.status === "unread").length >
                    0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {
                        notifications.filter((n) => n.status === "unread")
                          .length
                      }
                    </span>
                  )}
                </button>
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-lg z-10">
                    <div className="p-4 border-b flex justify-between items-center">
                      <h3 className="text-lg font-semibold">Notifications</h3>
                      <button onClick={() => setShowNotifications(false)}>
                        <X size={20} />
                      </button>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="p-4 text-gray-500">No notifications</p>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification._id}
                            className={`p-4 border-b ${
                              notification.status === "unread"
                                ? "bg-gray-50"
                                : ""
                            }`}
                          >
                            <p className="text-sm">{notification.message}</p>
                            {notification.type === "payment_failed" &&
                              notification.metadata?.paymentUrl && (
                                <button
                                  // onClick={() =>
                                  //   handleNotificationAction(notification)
                                  // }
                                  className="text-blue-500 text-sm mt-2"
                                >
                                  Fix Payment
                                </button>
                              )}
                            {notification.status === "unread" && (
                              <button
                                // onClick={() =>
                                //   handleMarkAsRead(notification._id)
                                // }
                                className="text-gray-500 text-xs mt-2"
                              >
                                Mark as read
                              </button>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
              {selectedSection !== "profile" && (
                <p className="border-b-1 border-gray-400 border-dashed"></p>
              )}
            </div>
            <div className="p-8 pt-4">{renderContent()}</div>
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default DashboardContent;
