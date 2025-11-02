import { ThemeToggle } from "@/app/(marketing)/_components/theme-toggle";

export function Header() {
  return (
    <header className="fixed top-0 w-full z-50 bg-background/50 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-lg" />
          <span className="text-xl font-bold text-foreground">Kaspr</span>
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
          <button className="px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-black font-semibold rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition">
            Get Started
          </button>
        </div>
      </div>
    </header>
  );
}
