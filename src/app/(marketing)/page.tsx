import { Header } from "@/app/(marketing)/_components/header";
import { HeroSection } from "@/app/(marketing)/_components/hero-section";
import { HowItWorks } from "@/app/(marketing)/_components/how-it-works";
import { AIAssistantDemo } from "@/app/(marketing)/_components/ai-assistant-demo";
import { CTAModule } from "@/app/(marketing)/_components/cta-modules";
import { Footer } from "@/app/(marketing)/_components/footer";

export default async function Home() {

  return (
    <>
      <main className="min-h-screen bg-background text-foreground">
        <Header />
        {/* Hero - Clear value proposition */}
        <HeroSection />
        {/* How It Works - Technical demonstration */}
        <HowItWorks />

        {/* AI Assistant - Interactive demo */}
        <AIAssistantDemo />

        {/* CTA - Drive conversion */}
        <CTAModule />
        <Footer />
      </main>
    </>
  );
}
