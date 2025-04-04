import DashboardPage from "@/components/user-Dashboard/Dashboard-rooms";
import { headers } from 'next/headers';

export default async function UserDashboard() {
  const headersList = await headers();
  const userData = headersList.get('x-user');

  if (!userData) {
    return <div>Please log in to view your dashboard.</div>;
  }

  const user = JSON.parse(userData);

  return <DashboardPage user={user} />;
}