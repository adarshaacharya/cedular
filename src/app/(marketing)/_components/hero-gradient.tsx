import Link from "next/link";

export function HeroGradient() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden bg-background">
      {/* Background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-96 h-96 bg-primary/30 dark:bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-accent/30 dark:bg-accent/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
          <span className="bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent dark:from-white dark:via-blue-200 dark:to-cyan-300">
            Meetings on Autopilot
          </span>
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
          Stop wasting time scheduling. CC Kaspr on your emails and let AI
          handle the coordination. Real scheduling, zero friction.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/signup">
            <button className="px-8 py-4 bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold rounded-xl hover:shadow-2xl hover:shadow-primary/40 dark:hover:shadow-blue-500/40 transition duration-300">
              Start Free Trial
            </button>
          </Link>
          <button className="px-8 py-4 border border-border text-foreground font-semibold rounded-xl hover:bg-secondary transition">
            Watch Demo
          </button>
        </div>
      </div>

      {/* Floating element */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
