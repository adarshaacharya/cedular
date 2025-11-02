import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function PricingTeaser() {
  return (
    <section id="pricing" className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-balance animate-fade-in-up">
          Start Free, Upgrade as You Grow
        </h2>
        <p
          className="text-lg text-muted-foreground mb-8 text-balance animate-fade-in-up"
          style={{ animationDelay: "0.1s" }}
        >
          Get full access to Kaspr with generous free limits. Only pay when
          you&apos;re ready to scale.
        </p>
        <Button
          size="lg"
          className="bg-primary hover:bg-accent text-primary-foreground px-8 animate-fade-in-up"
          style={{ animationDelay: "0.2s" }}
        >
          Get Started Today <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </div>
    </section>
  );
}
