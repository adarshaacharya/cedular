"use client";
import {
  ArrowRight,
  Play,
  Mail,
  Calendar,
  CheckCircle,
  Zap,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";

export function HeroSection() {
  const workflowPhases = [
    {
      id: "input",
      icon: Mail,
      label: "Input",
      color: "text-blue-500",
      bgColor: "bg-blue-500/5",
      description: "Connect your email and get your AI assistant",
      delay: 0.5,
    },
    {
      id: "process",
      icon: Sparkles,
      label: "Process",
      color: "text-purple-500",
      bgColor: "bg-purple-500/5",
      description: "Multi-agent AI analyzes calendars & preferences",
      delay: 1.5,
    },
    {
      id: "schedule",
      icon: Calendar,
      label: "Schedule",
      color: "text-green-500",
      bgColor: "bg-green-500/5",
      description: "Optimal time found, invites sent automatically",
      delay: 2.5,
    },
    {
      id: "complete",
      icon: CheckCircle,
      label: "Complete",
      color: "text-orange-500",
      bgColor: "bg-orange-500/5",
      description: "Everyone notified, coordination complete",
      delay: 3.5,
    },
  ];

  // Predefined meteor properties to avoid Math.random() during render
  const meteorProps = [
    { height: "35px", left: "15%", duration: 4.2, delay: 0.5 },
    { height: "28px", left: "45%", duration: 3.8, delay: 1.2 },
    { height: "42px", left: "72%", duration: 4.5, delay: 2.1 },
    { height: "31px", left: "28%", duration: 3.6, delay: 3.4 },
    { height: "39px", left: "58%", duration: 4.1, delay: 0.8 },
    { height: "25px", left: "85%", duration: 3.9, delay: 2.8 },
    { height: "36px", left: "32%", duration: 4.3, delay: 1.7 },
    { height: "33px", left: "68%", duration: 3.7, delay: 4.1 },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Sophisticated background - subtle grid and gradients */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Centered subtle grid pattern */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 opacity-[0.03] dark:opacity-[0.05]">
          <svg className="h-full w-full">
            <defs>
              <pattern
                id="hero-grid"
                width="16"
                height="16"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 16 0 L 0 0 0 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.5"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hero-grid)" />
          </svg>
        </div>

        {/* Falling meteor shower animation */}
        {meteorProps.map((meteor, i) => (
          <motion.div
            key={i}
            className="absolute w-px bg-linear-to-b from-transparent via-primary/30 to-transparent"
            style={{
              height: meteor.height,
              left: meteor.left,
              top: `-20px`,
            }}
            animate={{
              y: ["0vh", "120vh"],
              opacity: [0, 1, 1, 0],
            }}
            transition={{
              duration: meteor.duration,
              repeat: Infinity,
              delay: meteor.delay,
              ease: "linear",
            }}
          />
        ))}

        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,0,0,0.3) 1px, transparent 0)`,
            backgroundSize: "20px 20px",
          }}
        />

        {/* Floating orbs with more sophisticated positioning */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-20 left-10 w-96 h-96 bg-linear-to-br from-primary/10 to-transparent rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.1, 0.15, 0.1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute bottom-20 right-10 w-96 h-96 bg-linear-to-tl from-accent/10 to-transparent rounded-full blur-3xl"
        />

        {/* Central ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-radial from-primary/3 via-transparent to-transparent rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Elegant header with more breathing room */}
        <div className="text-center mb-24">
          {/* Time saved indicator - subtle but impactful */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10 text-primary text-sm font-medium mb-8">
            <Zap className="w-4 h-4" />
            Save 2+ hours weekly on scheduling
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-normal text-balance mb-8 leading-tight">
            <span className="block text-muted-foreground font-normal text-lg sm:text-xl lg:text-2xl mb-4 tracking-wide">
              INTELLIGENT SCHEDULING
            </span>
            <span className="bg-linear-to-r from-foreground via-primary to-accent bg-clip-text text-transparent font-display">
              Meetings on Autopilot
            </span>
          </h1>

          <p className="text-lg text-muted-foreground text-balance mb-12 max-w-2xl mx-auto leading-relaxed font-light">
            Connect your email and get AI-powered scheduling. CC{" "}
            <span className="font-mono text-foreground">
              cedular@ai-scheduling.com
            </span>{" "}
            on meeting requests or chat directly with your AI assistant.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-base font-medium shadow-lg hover:shadow-xl transition-all duration-300"
              asChild
            >
              <Link href="/signup">
                Start Free Trial <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-border/50 hover:bg-card/50 px-8 py-3 text-base font-medium backdrop-blur-sm"
            >
              <Play className="w-4 h-4 mr-2" /> Watch Demo
            </Button>
          </div>
        </div>

        {/* Sophisticated workflow visualization - flowing timeline */}
        <div className="relative max-w-5xl mx-auto">
          {/* Flowing connection line */}
          <div className="absolute top-8 left-0 right-0 h-px bg-linear-to-r from-transparent via-border/50 to-transparent hidden lg:block" />

          {/* Animated flow indicator */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
            className="absolute top-7 left-0 right-0 h-1 bg-linear-to-r from-transparent via-primary/30 to-transparent hidden lg:block"
          />

          <div className="grid lg:grid-cols-4 gap-12 lg:gap-8">
            {workflowPhases.map((phase, index) => {
              const Icon = phase.icon;
              return (
                <div key={phase.id} className="relative group text-center">
                  {/* Subtle phase indicator */}
                  <div className="w-16 h-16 mx-auto mb-6 relative">
                    <div
                      className={`absolute inset-0 ${phase.bgColor} rounded-2xl backdrop-blur-sm border border-border/20`}
                    />
                    <div className="absolute inset-2 bg-background/80 backdrop-blur-sm rounded-xl border border-border/10" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Icon className={`w-7 h-7 ${phase.color}`} />
                    </div>
                  </div>

                  {/* Clean typography */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-primary tracking-wider uppercase">
                      {phase.label}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed max-w-[200px] mx-auto">
                      {phase.description}
                    </p>
                  </div>

                  {/* Minimal connection dots for mobile */}
                  {index < workflowPhases.length - 1 && (
                    <div className="lg:hidden absolute -bottom-6 left-1/2 -translate-x-1/2 w-1 h-1 bg-border rounded-full" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Subtle bottom fade */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-40 bg-linear-to-t from-background via-background/50 to-transparent" />
    </section>
  );
}
