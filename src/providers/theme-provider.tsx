"use client";

import type React from "react";

import { useEffect, useState } from "react";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark" | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check system preference first, then localStorage
    const stored = localStorage.getItem("theme") as "light" | "dark" | null;
    const isDark =
      stored === "dark" ||
      (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches);

    setTheme(isDark ? "dark" : "light");
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggleTheme = () => {
    if (!mounted) return;
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  if (!mounted) return <>{children}</>;

  return (
    <>
      {children}
      <script
        dangerouslySetInnerHTML={{
          __html: `window.toggleTheme = () => document.documentElement.classList.toggle('dark')`,
        }}
      />
    </>
  );
}
