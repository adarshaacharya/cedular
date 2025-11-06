import { ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background gradient orbs - using CSS variables */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-20 left-10 w-96 h-96 bg-primary/30 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-accent/30 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-balance animate-fade-in-up mb-6">
          <span className="bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            Meetings on Autopilot
          </span>
        </h1>

        <p
          className="text-xl text-muted-foreground text-balance animate-fade-in-up mb-8 max-w-2xl mx-auto leading-relaxed"
          style={{ animationDelay: "0.1s" }}
        >
          Stop wasting time scheduling. CC Cedular on your emails and let AI
          handle the coordination. Real scheduling, zero friction.
        </p>

        <div
          className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up mb-16"
          style={{ animationDelay: "0.2s" }}
        >
          <Button
            size="lg"
            className="bg-primary hover:bg-accent text-primary-foreground px-8"
            asChild
          >
            <Link href="/signup">
              Start Free Trial <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-border hover:bg-card px-8 bg-transparent"
          >
            <Play className="w-4 h-4 mr-2" /> Watch Demo
          </Button>
        </div>

        {/* Hero visual - animated email threads */}
        <div
          className="animate-fade-in-up"
          style={{ animationDelay: "0.3s" }}
        >
          <div className="bg-card border border-border rounded-lg p-8 max-w-2xl mx-auto backdrop-blur-sm">
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-primary">AI</span>
                </div>
                <div className="flex-1">
                  <div className="bg-muted/50 rounded p-3 space-y-2">
                    <div className="h-2 bg-muted-foreground/30 rounded w-24"></div>
                    <div className="h-2 bg-muted-foreground/30 rounded w-32"></div>
                    <div className="h-2 bg-muted-foreground/20 rounded w-20"></div>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <div className="flex-1 text-right">
                  <div className="bg-primary/20 rounded p-3 space-y-2">
                    <div className="h-2 bg-primary/40 rounded w-24 ml-auto"></div>
                    <div className="h-2 bg-primary/40 rounded w-32 ml-auto"></div>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-accent">You</span>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-primary">AI</span>
                </div>
                <div className="flex-1">
                  <div className="bg-muted/50 rounded p-3 space-y-2">
                    <div className="h-2 bg-muted-foreground/30 rounded w-24"></div>
                    <div className="h-2 bg-muted-foreground/30 rounded w-32"></div>
                    <div className="h-2 bg-muted-foreground/20 rounded w-20"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating element */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
