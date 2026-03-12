import { LandingNavbar } from "@/components/landing/landing-navbar";
import { HeroSection } from "@/components/landing/hero-section";
import { SocialProof } from "@/components/landing/social-proof";
import { FeaturesSection } from "@/components/landing/features-section";
import { DashboardShowcase } from "@/components/landing/dashboard-showcase";
import { AnalyticsSection } from "@/components/landing/analytics-section";
import { HowItWorks } from "@/components/landing/how-it-works";
import { SecuritySection } from "@/components/landing/security-section";
import { CTASection } from "@/components/landing/cta-section";
import { Footer } from "@/components/landing/footer";

export default function Home() {
  return (
    <div className="bg-background">
      <LandingNavbar />
      <HeroSection />
      <SocialProof />
      <FeaturesSection />
      <DashboardShowcase />
      <AnalyticsSection />
      <HowItWorks />
      <SecuritySection />
      <CTASection />
      <Footer />
    </div>
  );
}
