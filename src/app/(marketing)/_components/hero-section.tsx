"use client";
import {
  ArrowRight,
  Play,
  Mail,
  Calendar,
  CheckCircle,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";

export function HeroSection() {
  const workflowSteps = [
    {
      id: 1,
      icon: Mail,
      title: "Choose Your Method",
      description:
        "CC cedular@ai-scheduling.com on emails or chat with our AI assistant",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      delay: 1,
    },
    {
      id: 2,
      icon: Clock,
      title: "AI Processing",
      description: "Multi-agent AI analyzes calendars, timezones & preferences",
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
      delay: 2.5,
    },
    {
      id: 3,
      icon: Calendar,
      title: "Schedule Meeting",
      description:
        "Finds optimal time and sends calendar invites automatically",
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      delay: 4,
    },
    {
      id: 4,
      icon: CheckCircle,
      title: "Done",
      description: "Everyone gets notified. No manual coordination needed.",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      delay: 5.5,
    },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background gradient orbs */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-20 left-10 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-primary/5 via-transparent to-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Header Content */}
        <div className="text-center mb-16">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold text-balance mb-6"
          >
            <span className="bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
              Meetings on Autopilot
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-xl text-muted-foreground text-balance mb-8 max-w-3xl mx-auto leading-relaxed"
          >
            Stop wasting time scheduling. CC cedular@ai-scheduling.com on emails
            or chat with our AI assistant. Intelligent coordination, zero
            friction.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
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
          </motion.div>
        </div>

        {/* Interactive Workflow Animation */}
        <div className="relative">
          {/* Connecting Lines */}
          <div className="absolute top-20 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-border to-transparent hidden lg:block" />

          <div className="grid lg:grid-cols-4 gap-8 lg:gap-4">
            {workflowSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: step.delay }}
                  className="relative group"
                >
                  {/* Step Number */}
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-background border-2 border-primary rounded-full flex items-center justify-center text-xs font-bold text-primary z-10">
                    {step.id}
                  </div>

                  {/* Step Card */}
                  <div className="bg-card/80 backdrop-blur-sm border border-border rounded-xl p-6 text-center hover:border-primary/50 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-primary/10">
                    <div
                      className={`w-12 h-12 ${step.bgColor} rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <Icon className={`w-6 h-6 ${step.color}`} />
                    </div>
                    <h3 className="font-bold text-lg mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  {/* Arrow for desktop */}
                  {index < workflowSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-20 -right-2 w-4 h-4 text-border">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Floating gradient */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
