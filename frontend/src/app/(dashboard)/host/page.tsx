// app/dashboard/page.js
import DashboardPage from "@/components/user-Dashboard/Dashboard-rooms";
import { headers } from 'next/headers';

export default async function UserDashboard() {
  const headersList = await headers();
  const userData = headersList.get('x-user');

  if (!userData) {
    // Fallback (shouldn’t happen with middleware, but good practice)
    return <div>Please log in to view your dashboard.</div>;
  }

  const user = JSON.parse(userData); // { id, username, email }

  return <DashboardPage user={user} />;
}