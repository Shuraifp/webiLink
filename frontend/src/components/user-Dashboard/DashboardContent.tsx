"use client";

import { useState } from "react";
import Sidebar from "@/components/user-Dashboard/Sidebar";
import Rooms from "@/components/user-Dashboard/Rooms";
import CreateMeeting from "@/components/user-Dashboard/CreateMeeting";
import Settings from "@/components/user-Dashboard/Settings";
import Subscription from "@/components/user-Dashboard/Subscription";
import WhatsNew from "@/components/user-Dashboard/What'sNew";
import Upgrade from "@/components/user-Dashboard/Upgrade";
import { UserData } from "@/types/type";

interface DashboardContentProps {
  user: UserData
}

const DashboardContent: React.FC<DashboardContentProps> = ({ user }) => {
  const [selectedSection, setSelectedSection] = useState("rooms");

  const renderContent = () => {
    switch (selectedSection) {
      case "create-meeting":
        return <CreateMeeting />;
      case "rooms":
        return <Rooms user={user} />;
      case "settings":
        return <Settings />;
      case "subscription":
        return <Subscription />;
      case "whats-new":
        return <WhatsNew />;
      case "upgrade":
        return <Upgrade />;
      default:
        return <Rooms user={user} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-200">
      <Sidebar onSectionChange={setSelectedSection} selectedSection={selectedSection} />
      <main className="flex-1 p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">
          Hello, {user.username}!
        </h2>
        {renderContent()}
      </main>
    </div>
  );
};

export default DashboardContent;