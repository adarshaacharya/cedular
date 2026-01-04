"use client";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  Bot,
  User,
  Calendar,
  Clock,
  CheckCircle,
  Mail,
  Globe,
  Zap,
  AlertTriangle,
  CalendarDays,
  Users,
  ArrowRight,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";

type ChatMessage = {
  type: "user" | "assistant";
  content: string;
  avatar: string;
  delay: number;
  thinking?: boolean;
  success?: boolean;
  action?: boolean;
  indicators?: string[];
};

export function AIAssistantDemo() {
  const [currentScenario, setCurrentScenario] = useState(0);
  const [currentMessage, setCurrentMessage] = useState(0);

  const scenarios: Array<{
    id: string;
    title: string;
    icon: React.ReactNode;
    messages: ChatMessage[];
  }> = useMemo(
    () => [
      {
        id: "complex-scheduling",
        title: "Complex Multi-Timezone Scheduling",
        icon: <Globe className="w-4 h-4" />,
        messages: [
          {
            type: "user",
            content:
              "Schedule 2hr workshop next week for design team. Sarah (EST) needs mornings free, Mike (PST) has conflicts Thu-Fri, Alex (GMT) prefers afternoons.",
            avatar: "U",
            delay: 1,
          },
          {
            type: "assistant",
            content: "Analyzing 4 calendars across 3 time zones...",
            avatar: "AI",
            delay: 2.5,
            thinking: true,
            indicators: ["calendar-sync", "timezone-conversion"],
          },
          {
            type: "assistant",
            content:
              "Found optimal slot: Wednesday 11 AM EST (8 AM PST, 4 PM GMT). All team members available. Sarah's morning preference honored.",
            avatar: "AI",
            delay: 5,
            success: true,
            indicators: ["availability-found"],
          },
          {
            type: "assistant",
            content:
              "Workshop scheduled! Sent invites with Zoom link. Added 15min buffer. Reminders set for 24h and 1h before.",
            avatar: "AI",
            delay: 7,
            action: true,
            indicators: ["meeting-created", "reminders-set"],
          },
        ],
      },
      {
        id: "email-integration",
        title: "Smart Email Processing",
        icon: <Mail className="w-4 h-4" />,
        messages: [
          {
            type: "user",
            content:
              "Check my emails for any meeting requests I haven't responded to yet.",
            avatar: "U",
            delay: 1,
          },
          {
            type: "assistant",
            content: "Scanning inbox and parsing email threads...",
            avatar: "AI",
            delay: 2.5,
            thinking: true,
            indicators: ["email-scan"],
          },
          {
            type: "assistant",
            content:
              "Found 3 pending requests: Product review (Sarah, tomorrow 3 PM), Client demo (Alex, Friday 10 AM), Team sync (Mike, next Monday).",
            avatar: "AI",
            delay: 5,
            indicators: ["requests-found"],
          },
          {
            type: "assistant",
            content:
              "Auto-drafted responses for all. Product review confirmed, client demo proposed 11 AM alternative, team sync accepted. Send now?",
            avatar: "AI",
            delay: 7,
            action: true,
            indicators: ["auto-responses"],
          },
        ],
      },
      {
        id: "conflict-resolution",
        title: "Smart Conflict Resolution",
        icon: <AlertTriangle className="w-4 h-4" />,
        messages: [
          {
            type: "user",
            content:
              "I just got double-booked for tomorrow 2 PM. Help me fix this mess!",
            avatar: "U",
            delay: 1,
          },
          {
            type: "assistant",
            content:
              "Detecting scheduling conflict... Analyzing both meetings and finding alternatives.",
            avatar: "AI",
            delay: 2.5,
            thinking: true,
            indicators: ["conflict-detected"],
          },
          {
            type: "assistant",
            content:
              "Conflict: Team standup (2-2:30 PM) vs Client call (2-3 PM). Client meeting has higher priority. Moving standup to 4 PM.",
            avatar: "AI",
            delay: 5,
            indicators: ["rescheduling"],
          },
          {
            type: "assistant",
            content:
              "✅ Standup moved to 4 PM. ✅ Client call confirmed. ✅ All attendees notified with updated invites. Crisis averted!",
            avatar: "AI",
            delay: 7,
            success: true,
            indicators: ["conflict-resolved"],
          },
        ],
      },
      {
        id: "proactive-assistance",
        title: "Proactive Calendar Management",
        icon: <Zap className="w-4 h-4" />,
        messages: [
          {
            type: "user",
            content:
              "I'm feeling overwhelmed this week. Help me optimize my schedule.",
            avatar: "U",
            delay: 1,
          },
          {
            type: "assistant",
            content: "Analyzing your calendar patterns and workload...",
            avatar: "AI",
            delay: 2.5,
            thinking: true,
            indicators: ["pattern-analysis"],
          },
          {
            type: "assistant",
            content:
              "You're 40% overbooked. 12 meetings this week vs your optimal 8. Suggesting: Cancel 3 low-priority meetings, shorten 2 by 30min.",
            avatar: "AI",
            delay: 5,
            indicators: ["optimization-suggestions"],
          },
          {
            type: "assistant",
            content:
              "Applied optimizations! Added focus blocks for deep work. Next week projected at 85% capacity. Want me to send updated schedule to your team?",
            avatar: "AI",
            delay: 7,
            action: true,
            indicators: ["schedule-optimized"],
          },
        ],
      },
    ],
    []
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentMessage((prev) => {
        const currentScenarioMessages = scenarios[currentScenario].messages;
        if (prev + 1 >= currentScenarioMessages.length) {
          // Move to next scenario
          setCurrentScenario((scenario) => (scenario + 1) % scenarios.length);
          return 0;
        }
        return prev + 1;
      });
    }, 3500);
    return () => clearInterval(timer);
  }, [currentScenario, scenarios]);

  return (
    <section className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-display font-semibold mb-4 text-balance">
            Meet Your{" "}
            <span className="bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
              AI Assistant
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
           Beyond email, chat directly for instant calendar help, meeting management, and
            productivity insights tailored to your schedule.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Chat Interface Demo */}
          <div className="order-2 lg:order-1">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="bg-card border border-border rounded-xl overflow-hidden shadow-xl"
            >
              {/* Chat Header */}
              <div className="bg-muted/50 px-6 py-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <Bot className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">
                        Cedular Assistant
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Online • Ready to help
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full">
                    {scenarios[currentScenario].icon}
                    <span className="text-xs font-medium text-primary">
                      {scenarios[currentScenario].title}
                    </span>
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="p-6 space-y-4 min-h-[400px] max-h-[400px] overflow-y-auto">
                <AnimatePresence mode="wait">
                  {scenarios[currentScenario].messages
                    .slice(0, currentMessage + 1)
                    .map((message, index) => (
                      <motion.div
                        key={`${currentScenario}-${index}`}
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.4 }}
                        className={`flex gap-3 ${
                          message.type === "user"
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        {message.type === "assistant" && (
                          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center shrink-0">
                            <Bot className="w-4 h-4 text-primary-foreground" />
                          </div>
                        )}

                        <div
                          className={`max-w-[90%] p-3 rounded-lg ${
                            message.type === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-foreground"
                          }`}
                        >
                          {message.thinking && (
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                              <span className="text-xs text-primary font-medium">
                                {message.content}
                              </span>
                            </div>
                          )}

                          {!message.thinking && (
                            <p className="text-sm leading-relaxed">
                              {message.content}
                            </p>
                          )}

                          {message.success && (
                            <div className="mt-3 flex items-center gap-2 p-2 bg-green-500/10 rounded border border-green-500/20">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <span className="text-xs text-green-600 font-medium">
                                Task completed successfully
                              </span>
                            </div>
                          )}

                          {message.indicators?.length && (
                            <div className="mt-3 flex flex-wrap gap-1">
                              {message.indicators.map((indicator, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full flex items-center gap-1"
                                >
                                  {indicator === "calendar-sync" && (
                                    <Calendar className="w-3 h-3" />
                                  )}
                                  {indicator === "timezone-conversion" && (
                                    <Globe className="w-3 h-3" />
                                  )}
                                  {indicator === "availability-found" && (
                                    <CheckCircle className="w-3 h-3" />
                                  )}
                                  {indicator === "meeting-created" && (
                                    <CalendarDays className="w-3 h-3" />
                                  )}
                                  {indicator === "reminders-set" && (
                                    <Clock className="w-3 h-3" />
                                  )}
                                  {indicator === "email-scan" && (
                                    <Mail className="w-3 h-3" />
                                  )}
                                  {indicator === "requests-found" && (
                                    <Users className="w-3 h-3" />
                                  )}
                                  {indicator === "auto-responses" && (
                                    <ArrowRight className="w-3 h-3" />
                                  )}
                                  {indicator === "conflict-detected" && (
                                    <AlertTriangle className="w-3 h-3" />
                                  )}
                                  {indicator === "rescheduling" && (
                                    <Clock className="w-3 h-3" />
                                  )}
                                  {indicator === "conflict-resolved" && (
                                    <CheckCircle className="w-3 h-3" />
                                  )}
                                  {indicator === "pattern-analysis" && (
                                    <Zap className="w-3 h-3" />
                                  )}
                                  {indicator === "optimization-suggestions" && (
                                    <Users className="w-3 h-3" />
                                  )}
                                  {indicator === "schedule-optimized" && (
                                    <CheckCircle className="w-3 h-3" />
                                  )}
                                  {indicator.replace("-", " ")}
                                </span>
                              ))}
                            </div>
                          )}

                          {message.action && (
                            <div className="mt-3 flex gap-2">
                              <button className="px-3 py-1 bg-primary/10 text-primary text-xs rounded hover:bg-primary/20 transition-colors">
                                Confirm
                              </button>
                              <button className="px-3 py-1 bg-primary/10 text-primary text-xs rounded hover:bg-primary/20 transition-colors">
                                Edit
                              </button>
                            </div>
                          )}
                        </div>

                        {message.type === "user" && (
                          <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center shrink-0">
                            <User className="w-4 h-4 text-accent-foreground" />
                          </div>
                        )}
                      </motion.div>
                    ))}
                </AnimatePresence>

                {/* Typing indicator for last message */}
                {currentMessage ===
                  scenarios[currentScenario].messages.length - 1 && (
                  <div className="flex gap-3 justify-start">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <div className="bg-muted p-4 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                        </div>
                        <span className="text-xs text-primary/70 font-medium">
                          Processing...
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="px-6 py-4 border-t border-border bg-linear-to-r from-muted/20 to-muted/10">
                <div className="flex gap-3">
                  <div className="flex-1 bg-background/80 backdrop-blur-sm border border-border/50 rounded-xl px-4 py-3 text-sm text-muted-foreground shadow-sm">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4 text-muted-foreground/50" />
                      <span className="text-muted-foreground/80">
                        Try: &ldquo;Schedule team meeting&rdquo; or &ldquo;Check
                        my conflicts&rdquo;...
                      </span>
                    </div>
                  </div>
                  <button className="px-4 py-3 bg-linear-to-r from-primary to-primary/90 text-primary-foreground rounded-xl hover:from-primary/90 hover:to-primary/80 transition-all duration-200 shadow-sm hover:shadow-md">
                    Send
                  </button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Features List */}
          <div className="order-1 lg:order-2 space-y-8">
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shrink-0">
                  <Globe className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-1">
                    Multi-Timezone Intelligence
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Handles complex scheduling across global teams with
                    automatic timezone conversions and preferences.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-10 h-10 bg-linear-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-1">Email Integration</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Automatically scans emails, parses meeting requests, and
                    drafts intelligent responses.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-10 h-10 bg-linear-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-1">
                    Conflict Resolution
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Detects scheduling conflicts and automatically finds optimal
                    alternatives with smart prioritization.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-10 h-10 bg-linear-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shrink-0">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-1">
                    Proactive Optimization
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Analyzes patterns, optimizes schedules, and suggests
                    improvements before you even ask.
                  </p>
                </div>
              </div>
            </div>

            {/* Interactive Demo Hint */}
            <div className="bg-linear-to-br from-card/80 to-card/60 border border-border rounded-xl p-6 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-linear-to-br from-primary to-primary/80 rounded-full flex items-center justify-center">
                  <Zap className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="text-sm font-semibold bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
                  Live Demo Scenarios
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Watch as Cedular handles complex real-world scenarios. The demo
                cycles through advanced scheduling, email integration, conflict
                resolution, and proactive optimization - all in natural
                conversation.
              </p>
              <div className="mt-4 flex items-center gap-2">
                <div className="flex gap-1">
                  {scenarios.map((_, idx) => (
                    <div
                      key={idx}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        idx === currentScenario
                          ? "bg-primary"
                          : "bg-muted-foreground/30"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground ml-2">
                  Scenario {currentScenario + 1} of {scenarios.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
