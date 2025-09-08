"use client";

import { useState } from "react";
import { logoutUser } from "@/lib/api/user/authApi";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Menu, X } from "lucide-react";
import NotificationDropdown from "./NotificationDropdown";
import { NavbarProps } from "@/types/type";

export default function Navbar({ user }: NavbarProps) {
  const { logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logoutUser();
      logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="flex items-center justify-between px-6 py-4 md:px-10 border-b border-gray-200 bg-white">
      <Link href="/" className="text-4xl font-bold lobster">
        <span className="text-yellow-500">w</span>ebiLink
      </Link>

      <div className="hidden md:flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-12">
        <Link
          href="/features"
          className="text-gray-700 hover:text-gray-900 py-2 md:py-0"
        >
          Features
        </Link>
        <Link
          href="/pricing"
          className="text-gray-700 hover:text-gray-900 py-2 md:py-0"
        >
          Plans & Pricing
        </Link>
        <Link
          href="/resources"
          className="text-gray-700 hover:text-gray-900 py-2 md:py-0"
        >
          Resources
        </Link>
      </div>

      <div className="flex md:hidden items-center space-x-3">
        {user && <NotificationDropdown className="md:mr-4" />}
        <button
          className="md:hidden text-gray-700 focus:outline-none"
          onClick={toggleMenu}
          aria-label="Toggle navigation menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <div
        className={`${
          isMenuOpen ? "flex" : "hidden"
        } flex-col absolute top-16 left-0 w-full bg-white border-b md:border-0 border-gray-200 px-6 py-4 z-50 min-h-[calc(100vh-4rem)]`}
      >
        <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-12">
          <Link
            href="/features"
            className="text-gray-700 hover:text-gray-900 py-2 md:py-0"
            onClick={() => setIsMenuOpen(false)}
          >
            Features
          </Link>
          <Link
            href="/pricing"
            className="text-gray-700 hover:text-gray-900 py-2 md:py-0"
            onClick={() => setIsMenuOpen(false)}
          >
            Plans & Pricing
          </Link>
          <Link
            href="/resources"
            className="text-gray-700 hover:text-gray-900 py-2 md:py-0"
            onClick={() => setIsMenuOpen(false)}
          >
            Resources
          </Link>
        </div>

        <div className="flex flex-col space-y-2 mt-4 md:hidden border-t border-gray-200 pt-4">
          {!user ? (
            <>
              <Link
                href="/login"
                className="px-4 py-2 text-yellow-600 hover:underline text-center rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign Up
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/host"
                className="px-4 py-2 text-yellow-600 hover:underline text-center rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
              <div
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                className="px-4 py-2 bg-yellow-500 cursor-pointer text-white rounded-md hover:bg-yellow-600 transition text-center"
              >
                Log Out
              </div>
            </>
          )}
        </div>
      </div>

      <div className="hidden md:flex space-x-3">
        {!user ? (
          <>
            <Link
              href="/login"
              className="px-4 py-2 text-yellow-600 hover:underline"
            >
              Log In
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition"
            >
              Sign Up
            </Link>
          </>
        ) : (
          <>
            <NotificationDropdown className="md:mr-4" />
            <Link
              href="/host"
              className="px-4 py-2 text-yellow-600 hover:underline"
            >
              Dashboard
            </Link>
            <div
              onClick={handleLogout}
              className="px-4 py-2 bg-yellow-500 cursor-pointer text-white rounded-md hover:bg-yellow-600 transition"
            >
              Log Out
            </div>
          </>
        )}
      </div>
    </header>
  );
}
