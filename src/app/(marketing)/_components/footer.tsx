import Link from "next/link";
import { CedularLogo } from "@/components/brand/cedular-logo";

export async function Footer() {
  return (
    <footer className="relative border-t border-border bg-card/80 backdrop-blur-sm py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <CedularLogo className="h-6 w-6" />
            <h3 className="text-lg font-bold text-foreground">Cedular</h3>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-md">
            Meetings on autopilot. Scheduling intelligence delivered via email.
          </p>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row justify-between items-center text-muted-foreground text-xs gap-4">
          <p>&copy; 2025 Cedular. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/terms" className="hover:text-primary transition">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-primary transition">
              Privacy
            </Link>
            <Link
              href="https://github.com/adarshaacharya/cedular"
              className="hover:text-primary transition"
            >
              GitHub
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
