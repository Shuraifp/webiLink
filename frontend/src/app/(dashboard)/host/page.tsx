import { headers } from "next/headers";
import DashboardContent from "@/components/user-Dashboard/DashboardContent";

export default async function UserDashboard() {
  const headersList = await headers();
  const userData = headersList.get("x-user");
  if (!userData) {
    return <div>Please log in to view your dashboard.</div>;
  }
  const user = JSON.parse(userData);

  return <DashboardContent user={user} />;
}