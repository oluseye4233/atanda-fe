import { HomeTopNav } from "@/components/home/HomeTopNav";
import { HeroSection } from "@/components/home/HeroSection";
import { ExplainerSection } from "@/components/home/ExplainerSection";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { PricingSection } from "@/components/home/PricingSection";
import { CtaSection } from "@/components/home/CtaSection";
import { HomeFooter } from "@/components/home/HomeFooter";

export default function Home() {
  return (
    <div className="min-h-screen" data-testid="page-home">
      <HomeTopNav />
      <main>
        <HeroSection />
        <ExplainerSection />
        <FeaturesSection />
        <PricingSection />
        <CtaSection />
      </main>
      <HomeFooter />
    </div>
  );
}