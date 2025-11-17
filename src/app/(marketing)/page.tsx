import { Header } from "@/app/(marketing)/_components/header";
import { HeroSection } from "@/app/(marketing)/_components/hero-section";
import { ProblemStatement } from "@/app/(marketing)/_components/problem-statement";
import { SocialProof } from "@/app/(marketing)/_components/social-proof";
import { HowItWorks } from "@/app/(marketing)/_components/how-it-works";
import { FeaturesSection } from "@/app/(marketing)/_components/features-section";
import { AICapabilities } from "@/app/(marketing)/_components/ai-capabilities";
import { DemoSection } from "@/app/(marketing)/_components/demo-section";
import { StatsGrid } from "@/app/(marketing)/_components/stats-grid";
import { UseCasesCarousel } from "@/app/(marketing)/_components/use-cases-carousel";
import { PricingTeaser } from "@/app/(marketing)/_components/pricing-teaser";
import { CTAModule } from "@/app/(marketing)/_components/cta-modules";
import { Footer } from "@/app/(marketing)/_components/footer";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AuthRedirector } from "@/components/auth-redirector";

export default async function Home() {
  return (
    <>
      <Suspense fallback={null}>
        <AuthRedirector />
      </Suspense>
      <main className="min-h-screen bg-background text-foreground overflow-hidden">
        <Header />
        {/* Hero - First impression */}
        <HeroSection />
        {/* Problem Statement - Build empathy */}
        <ProblemStatement />
        {/* Social Proof - Build trust early */}
        <SocialProof />
        {/* How It Works - Show simplicity */}
        <HowItWorks />
        {/* Features - Show value */}
        <FeaturesSection />
        {/* AI Capabilities - Differentiate */}
        <AICapabilities />
        {/* Demo Section - Visual proof */}
        <DemoSection />
        {/* Stats - Build credibility */}
        <StatsGrid />
        {/* Use Cases - Show versatility */}
        <UseCasesCarousel />
        {/* Pricing Teaser - Remove friction */}
        <PricingTeaser />
        {/* Final CTA - Convert */}
        <CTAModule />
        <Footer />
      </main>
    </>
  );
}
