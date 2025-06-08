"use client";

import { useTheme } from "@/lib/ThemeContext";

export default function Settings() {
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      <h1 className="text-xl raleway font-semibold my-2 ml-1 text-gray-600">Settings</h1>
      <div className="flex items-center gap-4 p-4 pt-6">
        <label htmlFor="theme-toggle" className="text-xl">
          Theme: {theme === "light" ? "Light" : "Dark"}
        </label>
        <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
          <input
            type="checkbox"
            name="theme-toggle"
            id="theme-toggle"
            checked={theme === "dark"}
            onChange={toggleTheme}
            className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
          />
          <label
            htmlFor="theme-toggle"
            className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"
          ></label>
        </div>
      </div>
    </>
  );
}