"use client";

import { useTheme } from "@/lib/ThemeContext";

export default function Settings() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-medium mb-6">Settings</h1>
      <div className="flex items-center gap-4">
        <label htmlFor="theme-toggle" className="text-lg">
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
    </div>
  );
}