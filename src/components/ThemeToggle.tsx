"use client";

import React from "react";
import { useTheme } from "./ThemeProvider";
import { Sun, Moon, Monitor } from "lucide-react";

export function ThemeToggle({ variant = "sidebar" }: { variant?: "sidebar" | "header" }) {
  const { theme, setTheme } = useTheme();

  const cycleTheme = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  };

  const icon =
    theme === "light" ? (
      <Sun className="w-4 h-4 text-amber-500" />
    ) : theme === "dark" ? (
      <Moon className="w-4 h-4 text-blue-400" />
    ) : (
      <Monitor className="w-4 h-4 text-slate-500" />
    );

  const label =
    theme === "light" ? "Light Mode" : theme === "dark" ? "Dark Mode" : "System";

  if (variant === "header") {
    return (
      <button
        onClick={cycleTheme}
        className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        title={`Current: ${label}. Click to cycle.`}
        aria-label={`Switch theme (current: ${label})`}
      >
        {icon}
      </button>
    );
  }

  return (
    <button
      onClick={cycleTheme}
      className="flex items-center gap-2 w-full px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
      title={`Current: ${label}. Click to cycle.`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
