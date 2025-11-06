"use client";

import { ThemeToggle } from "@/app/(marketing)/_components/theme-toggle";
import { UserMenu } from "@/app/(marketing)/_components/user-menu";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";

export function Header() {
  const { data: session, isPending } = useSession();

  return (
    <header className="fixed top-0 w-full z-50 bg-background/50 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg" />
          <span className="text-xl font-bold text-foreground">Cedular</span>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <a
            href="#"
            className="text-sm text-muted-foreground hover:text-foreground transition"
          >
            Features
          </a>
          <a
            href="#"
            className="text-sm text-muted-foreground hover:text-foreground transition"
          >
            Demo
          </a>
          <a
            href="#"
            className="text-sm text-muted-foreground hover:text-foreground transition"
          >
            Pricing
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
            <Link href="/signup">
              <button className="px-6 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition">
                Get Started
              </button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
