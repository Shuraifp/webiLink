import SubscriptionPlans from "@/components/SubscriptionPlans";
import Navbar from "@/components/Navbar";
import { headers } from "next/headers";

export default async function Home() {
  const headersList = await headers();
  const userData = headersList.get("x-user");
  let user;
  if (userData) {
    user = JSON.parse(userData);
  }
  return (
    <div>
      <Navbar {...(userData && { user })} />
      <SubscriptionPlans />
    </div>
  );
}