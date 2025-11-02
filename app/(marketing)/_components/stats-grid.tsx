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
              className="group p-6 rounded-xl border border-white/10 hover:border-cyan-500/50 bg-white/5 hover:bg-white/10 transition text-center"
            >
              <div className="text-3xl md:text-4xl font-bold text-transparent bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text mb-2">
                {stat.number}
              </div>
              <p className="text-gray-400 text-sm md:text-base">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
