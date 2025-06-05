"use client";

import SubscriptionPlans from "@/components/SubscriptionPlans";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";


export default function Home() {
  const { auth } = useAuth();
    const userData = auth.user;

    return (
    <div>
      <Navbar user={userData} />
      <SubscriptionPlans />
    </div>
  );
}