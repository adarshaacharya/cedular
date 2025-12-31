"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Clock, CheckCircle, Users, Globe, Zap } from "lucide-react";
import { useState, useEffect } from "react";

export function HowItWorks() {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      id: 1,
      title: "Send an email",
      description:
        "Include cedular@ai-scheduling.com in any scheduling request",
      icon: Mail,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      email: {
        from: "sarah@company.com",
        to: ["team@company.com", "cedular@ai-scheduling.com"],
        subject: "Team sync this week?",
        content:
          "Hey team,\n\nCan we schedule a 30min sync this week? I'm free Tuesday after 2pm EST, or Wednesday morning. Let me know what works for everyone!\n\nThanks,\nSarah",
        timestamp: "2:15 PM",
      },
      processing: false,
      success: false,
    },
    {
      id: 2,
      title: "AI analyzes calendars",
      description: "Multi-agent AI checks availability across all timezones",
      icon: Clock,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
      email: {
        from: "cedular@ai-scheduling.com",
        to: ["sarah@company.com"],
        subject: "Re: Team sync this week?",
        content:
          "I'll find the best time for everyone. Checking calendars...\n\n⏳ Analyzing Sarah's calendar (EST)\n⏳ Checking Mike's availability (PST)\n⏳ Reviewing Alex's schedule (GMT)\n⏳ Finding optimal time slot",
        timestamp: "2:16 PM",
      },
      processing: true,
      success: false,
    },
    {
      id: 3,
      title: "Optimal time found",
      description: "AI finds the perfect slot that works for everyone",
      icon: CheckCircle,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      email: {
        from: "cedular@ai-scheduling.com",
        to: ["sarah@company.com", "team@company.com"],
        subject: "Re: Team sync this week?",
        content:
          "✅ Perfect! Tuesday at 3:00 PM EST works for everyone.\n\n📅 Meeting Details:\n• Team Sync (30 minutes)\n• Tuesday, March 12th at 3:00 PM EST\n• Attendees: Sarah, Mike (PST), Alex (GMT)\n\n📧 Calendar invites sent automatically\n🔄 No manual coordination needed",
        timestamp: "2:17 PM",
      },
      processing: false,
      success: true,
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [steps.length]);

  return (
    <section
      id="how-it-works"
      className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 bg-card/30"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-balance">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
            Email-based scheduling with AI intelligence. No new interfaces, no
            manual calendar invites. Just CC and let AI do the rest.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Steps Visualization */}
          <div className="space-y-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;

              return (
                <div
                  key={step.id}
                  className={`relative p-6 rounded-xl border transition-all duration-300 ${
                    isActive
                      ? "bg-card border-primary shadow-lg shadow-primary/20"
                      : "bg-background/50 border-border hover:border-primary/30"
                  }`}
                >
                  {/* Step Number */}
                  <div
                    className={`absolute -left-4 top-6 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {step.id}
                  </div>

                  {/* Content */}
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 ${
                        step.bgColor
                      } rounded-lg flex items-center justify-center shrink-0 ${
                        isActive ? "scale-110" : ""
                      } transition-transform duration-300`}
                    >
                      <Icon className={`w-6 h-6 ${step.color}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {/* Connecting Line */}
                  {index < steps.length - 1 && (
                    <div className="absolute left-6 top-20 w-0.5 h-16 bg-linear-to-b from-border to-transparent" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Email Preview */}
          <div className="lg:sticky lg:top-8">
            <div className="bg-background border border-border rounded-xl overflow-hidden shadow-xl">
              {/* Email Header */}
              <div className="bg-muted/50 px-6 py-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <h3 className="font-semibold text-sm">
                      Email Conversation
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Real-time scheduling in action
                    </p>
                  </div>
                </div>
              </div>

              {/* Email Content */}
              <div className="p-6 h-[465px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-4"
                  >
                    {/* Email Details */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">From:</span>
                        <span className="text-sm text-muted-foreground">
                          {steps[currentStep].email.from}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">To:</span>
                        <span className="text-sm text-muted-foreground">
                          {steps[currentStep].email.to.join(", ")}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Subject:</span>
                        <span className="text-sm text-muted-foreground">
                          {steps[currentStep].email.subject}
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-border pt-4">
                      {/* Processing Animation */}
                      {steps[currentStep].processing && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex items-center gap-3 mb-4 p-3 bg-primary/5 rounded-lg border border-primary/20"
                        >
                          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-sm text-primary font-medium">
                            AI analyzing calendars...
                          </span>
                        </motion.div>
                      )}

                      {/* Email Content */}
                      <div className="bg-muted/30 rounded-lg p-4">
                        <pre className="text-sm whitespace-pre-wrap leading-relaxed text-foreground">
                          {steps[currentStep].email.content}
                        </pre>
                      </div>

                      {/* Success Indicator */}
                      {steps[currentStep].success && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="mt-4 flex items-center gap-2 p-3 bg-green-500/10 rounded-lg border border-green-500/20"
                        >
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span className="text-sm text-green-600 font-medium">
                            Meeting scheduled successfully!
                          </span>
                        </motion.div>
                      )}

                      {/* Timestamp */}
                      <div className="mt-4 text-xs text-muted-foreground text-right">
                        {steps[currentStep].email.timestamp}
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="mt-20 grid md:grid-cols-4 gap-6 text-center">
          <div className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-colors">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-6 h-6 text-primary" />
            </div>
            <div className="text-3xl font-bold text-primary mb-2">95%</div>
            <div className="text-sm text-muted-foreground">
              Scheduling Success Rate
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-colors">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <div className="text-3xl font-bold text-primary mb-2">&lt;4min</div>
            <div className="text-sm text-muted-foreground">
              Average Response Time
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-colors">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Globe className="w-6 h-6 text-primary" />
            </div>
            <div className="text-3xl font-bold text-primary mb-2">400+</div>
            <div className="text-sm text-muted-foreground">
              Timezones Supported
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-colors">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div className="text-3xl font-bold text-primary mb-2">10k+</div>
            <div className="text-sm text-muted-foreground">
              Meetings Scheduled
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
