"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, Clock, Users, Zap } from "lucide-react";

export function CTAModule() {
  const benefits = [
    { icon: Clock, text: "Save 4+ hours per week on scheduling", color: "text-blue-500" },
    { icon: CheckCircle, text: "95% scheduling success rate", color: "text-green-500" },
    { icon: Users, text: "Join 10,000+ professionals", color: "text-purple-500" },
    { icon: Zap, text: "Get started in under 2 minutes", color: "text-orange-500" },
  ];

  return (
    <section className="py-24 px-6 bg-card/50">
      <div className="max-w-6xl mx-auto">
        <div className="relative rounded-3xl border border-border bg-card/90 p-8 md:p-16 overflow-hidden backdrop-blur-sm shadow-2xl">
          {/* Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl translate-y-1/2" />

          <div className="relative z-10">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-balance">
                Ready to <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">reclaim your time?</span>
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join thousands of professionals who&apos;ve eliminated scheduling chaos with AI-powered coordination
              </p>
            </div>

            {/* Benefits Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-4 bg-background/50 rounded-xl border border-border/50 hover:border-primary/30 transition-colors"
                  >
                    <div className={`w-8 h-8 ${benefit.color.replace('text-', 'bg-')}/10 rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-4 h-4 ${benefit.color}`} />
                    </div>
                    <span className="text-sm font-medium text-foreground">{benefit.text}</span>
                  </div>
                );
              })}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link href="/signup">
                <button className="group px-8 py-4 bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold rounded-xl hover:shadow-2xl hover:shadow-primary/50 transition-all duration-300 hover:scale-105">
                  Get Started Free
                  <ArrowRight className="inline-block ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              <button className="px-8 py-4 border-2 border-border text-foreground font-semibold rounded-xl hover:bg-card hover:border-primary/50 transition-all duration-300 hover:scale-105">
                Schedule Demo
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="text-center">
              <p className="text-muted-foreground text-sm mb-4">
                14-day free trial • No credit card required • Cancel anytime
              </p>
              <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  SOC 2 Certified
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  Enterprise Security
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  99.9% Uptime
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
