import { Header } from "@/app/(marketing)/_components/header";
import { HeroGradient } from "@/app/(marketing)/_components/hero-gradient";
import { HeroSection } from "@/app/(marketing)/_components/hero-section";
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

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground overflow-hidden">
      <Header />
      <HeroGradient />
      <SocialProof />
      <HowItWorks />
      <FeaturesSection />
      <AICapabilities />
      <DemoSection />
      <StatsGrid />
      <UseCasesCarousel />
      <PricingTeaser />
      <CTAModule />
      <Footer />
    </main>
  );
}
