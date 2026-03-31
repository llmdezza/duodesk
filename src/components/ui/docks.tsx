"use client";

import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeDock() {
  const { theme, setTheme } = useTheme();

  return (
    <div
      className="
        inline-flex rounded-lg overflow-hidden relative
        bg-white/20 dark:bg-black/40
        backdrop-blur-md
        shadow-lg shadow-black/20
        border border-gray-300 dark:border-black/60
        transition-colors duration-500
      "
    >
      <button
        onClick={() => setTheme("light")}
        className={`
          px-4 py-2 rounded-l-lg
          flex items-center gap-2
          text-black dark:text-white
          transition-colors duration-300
          focus:outline-none focus:ring-0
          border-r border-gray-300 dark:border-black/60
          group
          ${theme === "light" ? "bg-black/10 dark:bg-white/10" : "bg-transparent hover:bg-black/10 dark:hover:bg-white/10"}
        `}
        aria-label="Light Mode"
      >
        <Sun
          className="
            w-5 h-5
            text-current
            transition-transform duration-300
            group-hover:scale-110
          "
          aria-hidden="true"
        />
        <span className="select-none hidden sm:inline">Light</span>
      </button>

      <button
        onClick={() => setTheme("dark")}
        className={`
          px-4 py-2
          flex items-center gap-2
          text-black dark:text-white
          transition-colors duration-300
          focus:outline-none focus:ring-0
          border-r border-gray-300 dark:border-black/60
          group
          ${theme === "dark" ? "bg-black/10 dark:bg-white/10" : "bg-transparent hover:bg-black/10 dark:hover:bg-white/10"}
        `}
        aria-label="Dark Mode"
      >
        <Moon
          className="
            w-5 h-5
            text-current
            transition-transform duration-300
            group-hover:scale-110
          "
          aria-hidden="true"
        />
        <span className="select-none hidden sm:inline">Dark</span>
      </button>

      <button
        onClick={() => setTheme("system")}
        className={`
          px-4 py-2 rounded-r-lg
          flex items-center gap-2
          text-black dark:text-white
          transition-colors duration-300
          focus:outline-none focus:ring-0
          group
          ${theme === "system" ? "bg-black/10 dark:bg-white/10" : "bg-transparent hover:bg-black/10 dark:hover:bg-white/10"}
        `}
        aria-label="System Theme"
      >
        <Monitor
          className="
            w-5 h-5
            text-current
            transition-transform duration-300
            group-hover:scale-110
          "
          aria-hidden="true"
        />
        <span className="select-none hidden sm:inline">System</span>
      </button>
    </div>
  );
}
