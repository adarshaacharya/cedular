import { Brain, Mail, Calendar, Globe, Lock, Zap } from "lucide-react";

export function FeaturesSection() {
  const features = [
    {
      icon: Brain,
      title: "Multi-Agent Intelligence",
      description:
        "Specialized AI agents handle preferences, conflicts, timezones",
    },
    {
      icon: Mail,
      title: "Works Via Email",
      description: "No new apps to learn, just CC your assistant",
    },
    {
      icon: Calendar,
      title: "Calendar Integration",
      description: "Syncs with Google Calendar automatically",
    },
    {
      icon: Globe,
      title: "Timezone Smart",
      description: "Handles global team scheduling effortlessly",
    },
    {
      icon: Lock,
      title: "Conflict Detection",
      description: "Prevents double-booking and respects buffer time",
    },
    {
      icon: Zap,
      title: "Learns Your Preferences",
      description: "Gets smarter about your scheduling habits over time",
    },
  ];

  return (
    <section id="features" className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-balance">
            Powerful Features
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
            Everything you need for intelligent scheduling
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group bg-card border border-border rounded-lg p-8 hover:border-primary/50 hover:bg-card/80 transition duration-300 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="w-12 h-12 rounded-lg bg-primary/20 group-hover:bg-primary/30 flex items-center justify-center mb-4 transition">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
