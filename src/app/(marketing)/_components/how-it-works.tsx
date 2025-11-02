import { Mail, Zap, Calendar } from "lucide-react";
import { ArrowRight } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      icon: Mail,
      title: "CC Your AI Assistant",
      description: "Forward or CC scheduling emails to your@assistant.Kaspr.ai",
    },
    {
      icon: Zap,
      title: "AI Finds The Perfect Time",
      description:
        "Multi-agent system checks calendars, preferences, timezones",
    },
    {
      icon: Calendar,
      title: "Meeting Scheduled",
      description: "AI responds professionally and adds to calendars",
    },
  ];

  return (
    <section
      id="how"
      className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 bg-card/50"
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-balance">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
            Three simple steps to automate your scheduling
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={index}
                className="relative group animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                <div className="relative bg-background border border-border rounded-lg p-8 hover:border-primary/50 transition">
                  <div className="mb-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2">
                      <ArrowRight className="w-8 h-8 text-muted-foreground/30" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
