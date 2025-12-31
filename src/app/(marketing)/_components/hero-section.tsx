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
      description: "CC cedular@ai-scheduling.com or chat with AI",
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

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Sophisticated background - subtle grid and gradients */}
      <div className="absolute inset-0 -z-10">
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
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10 text-primary text-sm font-medium mb-8"
          >
            <Zap className="w-4 h-4" />
            Save 2+ hours weekly on scheduling
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-light text-balance mb-8 leading-tight"
          >
            <span className="block text-muted-foreground font-normal text-lg sm:text-xl lg:text-2xl mb-4 tracking-wide">
              INTELLIGENT SCHEDULING
            </span>
            <span className="bg-linear-to-r from-foreground via-primary to-accent bg-clip-text text-transparent font-semibold">
              Meetings on Autopilot
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg text-muted-foreground text-balance mb-12 max-w-2xl mx-auto leading-relaxed font-light"
          >
            CC{" "}
            <span className="font-medium text-foreground">
              cedular@ai-scheduling.com
            </span>{" "}
            on emails or chat with our AI assistant. Zero-friction coordination
            that just works.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-20"
          >
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
          </motion.div>
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
                <motion.div
                  key={phase.id}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.8,
                    delay: phase.delay,
                    ease: "easeOut",
                  }}
                  className="relative group text-center"
                >
                  {/* Subtle phase indicator */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      delay: phase.delay + 0.3,
                      type: "spring",
                      stiffness: 200,
                    }}
                    className="w-16 h-16 mx-auto mb-6 relative"
                  >
                    <div
                      className={`absolute inset-0 ${phase.bgColor} rounded-2xl backdrop-blur-sm border border-border/20`}
                    />
                    <div className="absolute inset-2 bg-background/80 backdrop-blur-sm rounded-xl border border-border/10" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Icon className={`w-7 h-7 ${phase.color}`} />
                    </div>
                  </motion.div>

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
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: phase.delay + 0.5 }}
                      className="lg:hidden absolute -bottom-6 left-1/2 -translate-x-1/2 w-1 h-1 bg-border rounded-full"
                    />
                  )}
                </motion.div>
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
