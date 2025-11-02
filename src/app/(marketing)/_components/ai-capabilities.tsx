export async function AICapabilities() {
  const capabilities = [
    {
      icon: "⚡",
      title: "Instant Processing",
      description:
        "AI analyzes your emails in real-time and finds the perfect meeting times",
    },
    {
      icon: "🎯",
      title: "Smart Detection",
      description:
        "Understands context, timezones, and availability patterns automatically",
    },
    {
      icon: "🔄",
      title: "Seamless Integration",
      description:
        "Works with your existing email and calendar systems - no setup needed",
    },
    {
      icon: "🛡️",
      title: "Privacy First",
      description:
        "Your data stays secure. We never store or share your information",
    },
  ];

  return (
    <section className="relative py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Pure{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              AI Intelligence
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Powered by advanced language models that understand scheduling
            complexity
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {capabilities.map((cap, i) => (
            <div
              key={i}
              className="group p-8 rounded-2xl border border-border hover:border-primary/50 bg-card/50 hover:bg-card transition duration-300 cursor-pointer"
            >
              <div className="text-4xl mb-4">{cap.icon}</div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition">
                {cap.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">{cap.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
