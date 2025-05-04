"use client";

import { useState } from "react";
import Sidebar from "@/components/user-Dashboard/Sidebar";
import Rooms from "@/components/user-Dashboard/Rooms";
import CreateMeeting from "@/components/user-Dashboard/CreateMeeting";
import Settings from "@/components/user-Dashboard/Settings";
import Subscription from "@/components/user-Dashboard/Subscription";
import WhatsNew from "@/components/user-Dashboard/What'sNew";
import Upgrade from "@/components/user-Dashboard/Upgrade";
import { ThemeProvider } from "@/lib/ThemeContext";
import { UserData } from "@/types/type";

interface DashboardContentProps {
  user: UserData;
}

const DashboardContent: React.FC<DashboardContentProps> = ({ user }) => {
  const [selectedSection, setSelectedSection] = useState("rooms");
  const [prevSection, setPrevSection] = useState("");

  const renderContent = () => {
    switch (selectedSection) {
      case "create-meeting":
        return (
          <CreateMeeting
            onSectionChange={setSelectedSection}
            prevSection={prevSection}
          />
        );
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
        return <Subscription />;
      case "whats-new":
        return <WhatsNew />;
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
      <div className="flex host-root min-h-screen bg-gray-200">
        <Sidebar
          user={user}
          onSectionChange={setSelectedSection}
          selectedSection={selectedSection}
          setPrevSection={setPrevSection}
        />
        <main className="flex-1 p-8">
          <h2 className="text-3xl font-bold raleway text-gray-800 mb-6">
            Wellcome, {user.username}
          </h2>
          <p className="border-b-1 border-gray-400 border-dashed"></p>
          {renderContent()}
        </main>
      </div>
    </ThemeProvider>
  );
};

export default DashboardContent;
