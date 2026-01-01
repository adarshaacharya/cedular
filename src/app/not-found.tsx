"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Calendar,
  Mail,
  Home,
  ArrowRight,
  Sparkles,
  Clock,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
      },
    },
  };

  const floatingVariants = {
    animate: {
      y: [-10, 10, -10],
      rotate: [-2, 2, -2],
      transition: {
        duration: 6,
        repeat: Infinity,
      },
    },
  };

  const emailVariants = {
    animate: {
      x: [-20, 20, -20],
      y: [-5, 5, -5],
      transition: {
        duration: 8,
        repeat: Infinity,
        delay: 1,
      },
    },
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 -z-10">
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,0,0,0.3) 1px, transparent 0)`,
            backgroundSize: "20px 20px",
          }}
        />

        {/* Floating orbs */}
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

        {/* Central glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-radial from-primary/5 via-transparent to-transparent rounded-full blur-3xl" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
      >
        {/* 404 Animation */}
        <motion.div variants={itemVariants} className="relative mb-12">
          <div className="flex items-center justify-center gap-4 mb-8">
            {/* Confused Calendar */}
            <motion.div
              variants={floatingVariants}
              animate="animate"
              className="relative"
            >
              <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
                <Calendar className="w-10 h-10 text-primary" />
              </div>
              {/* Question mark floating above */}
              <motion.div
                animate={{
                  y: [-5, 5, -5],
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute -top-2 -right-2 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center"
              >
                <span className="text-white text-sm font-bold">?</span>
              </motion.div>
            </motion.div>

            {/* 404 Text */}
            <div className="text-8xl font-bold bg-linear-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
              404
            </div>

            {/* Floating Email */}
            <motion.div
              variants={emailVariants}
              animate="animate"
              className="relative"
            >
              <div className="w-20 h-20 bg-accent/10 rounded-2xl flex items-center justify-center border border-accent/20">
                <Mail className="w-10 h-10 text-accent" />
              </div>
              {/* Sparkles around email */}
              <motion.div
                animate={{
                  rotate: 360,
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute -top-1 -right-1"
              >
                <Sparkles className="w-4 h-4 text-yellow-500" />
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        {/* Error Message */}
        <motion.div variants={itemVariants} className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-semibold text-foreground mb-4">
            Meeting Not Found
          </h1>
          <p className="text-lg text-muted-foreground max-w-lg mx-auto leading-relaxed">
            Looks like this page got lost in the scheduling shuffle. Our AI
            assistant couldn&apos;t find the meeting you&apos;re looking for.
          </p>
        </motion.div>

        {/* Time-saving message */}
        <motion.div variants={itemVariants} className="mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10 text-primary text-sm font-medium">
            <Clock className="w-4 h-4" />
            Don&apos;t worry - your time is still being saved!
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-base font-medium shadow-lg hover:shadow-xl transition-all duration-300 group"
            asChild
          >
            <Link href="/">
              <Home className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
              Return Home
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="border-border/50 hover:bg-card/50 px-8 py-3 text-base font-medium backdrop-blur-sm group"
            asChild
          >
            <Link href="/dashboard">
              <Zap className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
              Schedule Meeting
            </Link>
          </Button>
        </motion.div>
      </motion.div>

      {/* Subtle bottom fade */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-40 bg-linear-to-t from-background via-background/50 to-transparent" />
    </div>
  );
}
