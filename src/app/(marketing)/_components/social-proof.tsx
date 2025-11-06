import { Star } from "lucide-react";

export function SocialProof() {
  const stats = [
    { value: "10,000+", label: "Meetings Scheduled" },
    { value: "4.2 min", label: "Avg Response Time" },
    { value: "95%", label: "Scheduling Success Rate" },
  ];

  const testimonials = [
    {
      content:
        "Cedular has completely transformed how our team manages schedules. No more back-and-forth emails!",
      author: "Sarah Chen",
      role: "Operations Manager",
    },
    {
      content:
        "The timezone handling is incredible. Our global team finally has seamless scheduling.",
      author: "Marcus Johnson",
      role: "CEO, Tech Startup",
    },
    {
      content:
        "I can't imagine going back to manual scheduling. This AI assistant is a game-changer.",
      author: "Emily Rodriguez",
      role: "HR Director",
    },
  ];

  return (
    <section className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 bg-card/50">
      <div className="max-w-6xl mx-auto">
        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="text-4xl sm:text-5xl font-bold text-primary mb-2">
                {stat.value}
              </div>
              <div className="text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div>
          <h2 className="text-4xl sm:text-5xl font-bold text-center mb-16 text-balance">
            What Users Say
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-background border border-border rounded-lg p-8 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-primary text-primary"
                    />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>
                <div>
                  <p className="font-bold text-foreground">
                    {testimonial.author}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
