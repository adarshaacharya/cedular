"use client"

export function UseCasesCarousel() {
  const useCases = [
    {
      title: "Sales Teams",
      desc: "Coordinate client calls without the back-and-forth",
      icon: "💼",
    },
    {
      title: "Executives",
      desc: "Reclaim 5+ hours per week from scheduling",
      icon: "👔",
    },
    {
      title: "Recruiters",
      desc: "Streamline interview scheduling at scale",
      icon: "🎯",
    },
    {
      title: "Agencies",
      desc: "Manage multiple client calendars effortlessly",
      icon: "🏢",
    },
  ]

  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold mb-16 text-center">
          Built for <span className="text-primary">every role</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {useCases.map((useCase, i) => (
            <div
              key={i}
              className="group p-6 rounded-xl border border-border hover:border-primary/50 bg-card/50 hover:bg-card dark:hover:from-primary/10 dark:hover:to-accent/10 transition duration-300"
            >
              <div className="text-4xl mb-4">{useCase.icon}</div>
              <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition">{useCase.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{useCase.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
