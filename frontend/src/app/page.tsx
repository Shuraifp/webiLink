"use client"

import Navbar from "../components/Navbar";
import Banner from "../components/Banner";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { auth } = useAuth();
  const userData = auth.user;

  return (
    <div>
      <Navbar user = {userData} />
      <Banner user = {userData} />
    </div>
  );
}
