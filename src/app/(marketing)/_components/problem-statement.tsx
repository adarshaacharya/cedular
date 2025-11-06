import { Clock, Mail, CalendarX } from "lucide-react";

export function ProblemStatement() {
  const problems = [
    {
      icon: Mail,
      title: "Endless Email Threads",
      description: "Back-and-forth emails just to find a meeting time that works for everyone",
    },
    {
      icon: Clock,
      title: "Wasted Hours",
      description: "Spending hours each week coordinating schedules instead of doing meaningful work",
    },
    {
      icon: CalendarX,
      title: "Double Bookings & Conflicts",
      description: "Manual scheduling leads to mistakes, missed meetings, and frustrated teams",
    },
  ];

  return (
    <section className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-balance">
            Tired of Scheduling Chaos?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
            You know the pain. We&apos;ve all been there.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {problems.map((problem, index) => {
            const Icon = problem.icon;
            return (
              <div
                key={index}
                className="relative group animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="relative bg-background border border-border rounded-lg p-8 hover:border-primary/50 transition">
                  <div className="mb-4">
                    <div className="w-12 h-12 rounded-lg bg-destructive/20 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-destructive" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-3">{problem.title}</h3>
                  <p className="text-muted-foreground">{problem.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

