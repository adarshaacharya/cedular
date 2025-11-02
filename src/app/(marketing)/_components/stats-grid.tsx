export function StatsGrid() {
  const stats = [
    { number: "10M+", label: "Meetings Scheduled" },
    { number: "99.9%", label: "Uptime Guarantee" },
    { number: "2 Seconds", label: "Average Response Time" },
    { number: "180+", label: "Countries Supported" },
  ];

  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="group p-6 rounded-xl border border-border hover:border-primary/50 bg-card/50 hover:bg-card transition text-center"
            >
              <div className="text-3xl md:text-4xl font-bold text-transparent bg-gradient-to-r from-primary to-accent bg-clip-text mb-2">
                {stat.number}
              </div>
              <p className="text-muted-foreground text-sm md:text-base">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
