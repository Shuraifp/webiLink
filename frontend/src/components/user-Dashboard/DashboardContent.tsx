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

interface DashboardContentProps {
  user: UserData;
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
  const initialSection = searchParams.get("section") || "rooms";
  const [selectedSection, setSelectedSection] = useState(initialSection);
  const [prevSection, setPrevSection] = useState("");

  useEffect(() => {
    if (searchParams.get("section")) {
      setSelectedSection(searchParams.get("section")!);
    }
  }, [searchParams]);

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
      case "upgrade":
        return <Upgrade />;
      default:
        return (
          <Rooms
            user={user}
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
          <main className=" p-8 ">
            <h2 className="text-3xl font-bold raleway text-gray-800 mb-6">
              {selectedSection === "profile"
                ? "Profile"
                : selectedSection === "recordings"
                ? "Recordings"
                : `Wellcome, ${user.username}`}
            </h2>
            {selectedSection !== "profile" && (
              <p className="border-b-1 border-gray-400 border-dashed"></p>
            )}
            {renderContent()}
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default DashboardContent;
