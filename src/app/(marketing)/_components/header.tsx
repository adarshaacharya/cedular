"use client";

import { ThemeToggle } from "@/app/(marketing)/_components/theme-toggle";
import { UserMenu } from "@/app/(marketing)/_components/user-menu";
import Link from "next/link";
import { useSession } from "@/lib/auth/client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CedularLogo } from "@/components/brand/cedular-logo";

export function Header() {
  const { data: session, isPending } = useSession();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 20); // Lower threshold for smoother transition
    };

    // Use passive listener for better performance
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      className={`w-full z-50 ${
        isScrolled
          ? "fixed top-0 bg-background/95 backdrop-blur-md border-b border-border shadow-sm"
          : "relative bg-transparent"
      }`}
      animate={{
        y: isScrolled ? 0 : 0,
        backgroundColor: isScrolled
          ? "rgba(var(--background), 0.95)"
          : "transparent",
        backdropFilter: isScrolled ? "blur(8px)" : "none",
        borderBottom: isScrolled ? "1px solid hsl(var(--border))" : "none",
        boxShadow: isScrolled ? "0 1px 3px 0 rgb(0 0 0 / 0.1)" : "none",
      }}
      transition={{
        duration: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94], // Custom cubic-bezier for smooth animation
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CedularLogo className="h-8 w-8" />
          <span className="text-xl font-bold text-foreground">Cedular</span>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <a
            href="#how-it-works"
            className="text-base text-muted-foreground hover:text-foreground transition-colors duration-200 font-medium"
          >
            How It Works
          </a>
          <a
            href="#demo"
            className="text-base text-muted-foreground hover:text-foreground transition-colors duration-200 font-medium"
          >
            Demo
          </a>
          <a
            href="#get-started"
            className="text-base text-muted-foreground hover:text-foreground transition-colors duration-200 font-medium"
          >
            Get Started
          </a>
        </nav>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          {isPending ? (
            <div className="px-6 py-2 text-sm text-muted-foreground">
              Loading...
            </div>
          ) : session?.user ? (
            <UserMenu />
          ) : (
            <Link href="/login">
              <button className="px-6 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition">
                Sign In
              </button>
            </Link>
          )}
        </div>
      </div>
    </motion.header>
  );
}
