"use client";

import { motion } from "framer-motion";
import { Mail, Calendar, Sparkles, Check, Clock, Zap } from "lucide-react";

export function AuthIllustration() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    },
  };

  const floatVariants = {
    animate: {
      y: [-8, 8, -8],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut" as const,
      },
    },
  };

  const pulseRing = {
    animate: {
      scale: [1, 1.5, 2],
      opacity: [0.4, 0.2, 0],
      transition: {
        duration: 2.5,
        repeat: Infinity,
        ease: "easeOut" as const,
      },
    },
  };

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-linear-to-br from-background via-muted/30 to-background">
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]">
        <svg className="h-full w-full">
          <defs>
            <pattern
              id="grid"
              width="32"
              height="32"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 32 0 L 0 0 0 32"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Gradient orbs - matching hero section style */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-20 -right-20 h-[500px] w-[500px] rounded-full bg-foreground/10 blur-[100px]"
        />
        <motion.div
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute -bottom-20 -left-20 h-[400px] w-[400px] rounded-full bg-foreground/10 blur-[100px]"
        />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative flex flex-col items-center px-8 py-12"
      >
        {/* Main Flow Visualization */}
        <div className="relative flex items-center gap-6 lg:gap-10">
          {/* Email Card */}
          <motion.div variants={itemVariants} className="relative">
            <motion.div
              variants={floatVariants}
              animate="animate"
              className="relative"
            >
              <div className="relative rounded-2xl border border-border/50 bg-card/80 p-6 shadow-2xl shadow-foreground/5 backdrop-blur-sm lg:p-8">
                <div className="absolute -top-3 -right-3">
                  <div className="relative">
                    <motion.div
                      variants={pulseRing}
                      animate="animate"
                      className="absolute inset-0 rounded-full bg-foreground/20"
                    />
                    <div className="relative rounded-full bg-foreground p-2">
                      <Mail className="h-4 w-4 text-background" />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-muted" />
                    <div className="space-y-1">
                      <div className="h-2 w-24 rounded bg-muted-foreground/20" />
                      <div className="h-1.5 w-16 rounded bg-muted-foreground/10" />
                    </div>
                  </div>
                  <div className="space-y-2 pt-2">
                    <div className="h-2 w-full rounded bg-muted-foreground/15" />
                    <div className="h-2 w-4/5 rounded bg-muted-foreground/15" />
                    <div className="h-2 w-3/5 rounded bg-muted-foreground/10" />
                  </div>
                  <div className="flex items-center gap-2 pt-3">
                    <div className="rounded-full bg-muted px-3 py-1">
                      <span className="text-[10px] font-medium text-muted-foreground">
                        cc: cedular@...
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Flow Arrow with AI */}
          <motion.div
            variants={itemVariants}
            className="relative flex flex-col items-center gap-3"
          >
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative"
            >
              <div className="absolute inset-0 rounded-full bg-foreground/20 blur-xl" />
              <div className="relative rounded-full border border-border/50 bg-card p-4 shadow-xl lg:p-5">
                <Sparkles className="h-6 w-6 text-foreground lg:h-8 lg:w-8" />
              </div>
            </motion.div>

            {/* Animated dots */}
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{
                    opacity: [0.3, 1, 0.3],
                    scale: [0.8, 1, 0.8],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                  className="h-1.5 w-1.5 rounded-full bg-foreground/40"
                />
              ))}
            </div>

            <span className="text-xs font-medium text-muted-foreground">
              AI Processing
            </span>
          </motion.div>

          {/* Calendar Card */}
          <motion.div variants={itemVariants} className="relative">
            <motion.div
              variants={floatVariants}
              animate="animate"
              style={{ animationDelay: "1s" }}
              className="relative"
            >
              <div className="relative rounded-2xl border border-border/50 bg-card/80 p-6 shadow-2xl shadow-foreground/5 backdrop-blur-sm lg:p-8">
                <div className="absolute -top-3 -left-3">
                  <div className="relative rounded-full bg-foreground p-2">
                    <Check className="h-4 w-4 text-background" />
                  </div>
                </div>

                {/* Mini Calendar */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground">
                      December
                    </span>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </div>

                  <div className="grid grid-cols-7 gap-1 text-[10px]">
                    {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
                      <div
                        key={i}
                        className="p-1 text-center font-medium text-muted-foreground"
                      >
                        {day}
                      </div>
                    ))}
                    {Array.from({ length: 35 }, (_, i) => {
                      const day = ((i - 6 + 31) % 31) + 1;
                      const isHighlighted = i === 17;
                      const isSecondary = i === 24;
                      return (
                        <motion.div
                          key={i}
                          animate={
                            isHighlighted
                              ? {
                                  scale: [1, 1.1, 1],
                                  transition: {
                                    duration: 2,
                                    repeat: Infinity,
                                  },
                                }
                              : {}
                          }
                          className={`rounded p-1 text-center ${
                            isHighlighted
                              ? "bg-foreground font-semibold text-background"
                              : isSecondary
                              ? "bg-muted font-medium text-foreground"
                              : "text-muted-foreground/60"
                          }`}
                        >
                          {day}
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Meeting indicator */}
                  <div className="mt-2 flex items-center gap-2 rounded-lg bg-muted/50 p-2">
                    <div className="h-2 w-2 rounded-full bg-foreground" />
                    <span className="text-[10px] font-medium text-foreground">
                      Meeting scheduled
                    </span>
                    <Clock className="ml-auto h-3 w-3 text-muted-foreground" />
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom tagline */}
        <motion.div
          variants={itemVariants}
          className="mt-12 text-center lg:mt-16"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-card/50 px-4 py-2 backdrop-blur-sm">
            <Zap className="h-4 w-4 text-foreground" />
            <span className="text-sm font-medium text-muted-foreground">
              From email to calendar in seconds
            </span>
          </div>
        </motion.div>

        {/* Feature highlights */}
        <motion.div
          variants={itemVariants}
          className="mt-8 grid grid-cols-3 gap-6 lg:gap-10"
        >
          {[
            { icon: Mail, label: "CC to schedule" },
            { icon: Sparkles, label: "AI handles it" },
            { icon: Calendar, label: "Done" },
          ].map((item, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -2 }}
              className="flex flex-col items-center gap-2"
            >
              <div className="rounded-full bg-muted/50 p-3">
                <item.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <span className="text-xs text-muted-foreground">
                {item.label}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Corner decorations */}
      <div className="absolute left-8 top-8">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="h-24 w-24 rounded-full border border-dashed border-border/30"
        />
      </div>
      <div className="absolute bottom-8 right-8">
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="h-32 w-32 rounded-full border border-dashed border-border/20"
        />
      </div>
    </div>
  );
}
