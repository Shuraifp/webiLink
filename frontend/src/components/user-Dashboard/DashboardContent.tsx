"use client";

import { useState, useEffect, Suspense } from "react";
import Sidebar from "@/components/user-Dashboard/Sidebar";
import Rooms from "@/components/user-Dashboard/Rooms";
import CreateMeeting from "@/components/user-Dashboard/CreateMeeting";
import Settings from "@/components/user-Dashboard/Settings";
import Subscription from "@/components/user-Dashboard/Subscription";
import Upgrade from "@/components/user-Dashboard/Upgrade";
import { ThemeProvider } from "@/lib/ThemeContext";
import { useSearchParams } from "next/navigation";
import { Toaster } from "react-hot-toast";
import Profile from "./Profile";
import { useRouter } from "next/navigation";
import Recordings from "./Recordings";
import Dashboard from "./Overview";
import History from "./History";
import { ConfirmationModalProvider } from "./ConfirmationModal";
import { useAuth } from "@/context/AuthContext";

const DashboardLoading = () => (
  <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
    <div className="w-16 h-16 border-5 border-t-transparent border-b-transparent border-yellow-400 rounded-full animate-spin" />
    <p className="mt-4 text-gray-600">Loading...</p>
  </div>
);

const DashboardWithSearchParams: React.FC = () => {
  const router = useRouter();
  const { auth } = useAuth();
  const user = auth?.user;
  const searchParams = useSearchParams();
  const initialSection = searchParams.get("section") || "overview";
  const [selectedSection, setSelectedSection] = useState(initialSection);
  const [prevSection, setPrevSection] = useState("");

  useEffect(() => {
    if (searchParams.get("section")) {
      setSelectedSection(searchParams.get("section")!);
    }
  }, [searchParams]);

  if (!auth.authStatus?.isAuthenticated) {
    router.push("/login");
    return null;
  }

  if (auth.isLoading) {
    return <DashboardLoading />;
  }

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
                : `Welcome, ${user?.username}`}
            </h2>
            {selectedSection !== "profile" && (
              <p className="border-b-1 border-gray-400 border-dashed"></p>
            )}
          </div>
          <div className="p-8 pt-4">{renderContent()}</div>
        </main>
      </div>
    </div>
  );
};

const DashboardContent: React.FC = () => {
  return (
    <ThemeProvider>
      <ConfirmationModalProvider>
        <Toaster />
        <Suspense fallback={<DashboardLoading />}>
          <DashboardWithSearchParams />
        </Suspense>
      </ConfirmationModalProvider>
    </ThemeProvider>
  );
};

export default DashboardContent;