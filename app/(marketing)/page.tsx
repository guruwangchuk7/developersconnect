import { GlobalHeader } from "@/components/common/global-header";
import { GlobalFooter } from "@/components/common/global-footer";
import { HeroSection } from "@/features/marketing/components/hero-section";
import Link from "next/link";
import { Database, Code, Monitor, Share2 } from "lucide-react";
import { HowItWorks } from "@/features/marketing/components/how-it-works";
import { Plans } from "@/features/marketing/components/plans";
import { WhyUseIt } from "@/features/marketing/components/why-use-it";
import { Founder } from "@/features/marketing/components/founder";
import { FAQ } from "@/features/marketing/components/faq";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "Bhutan Developer Connect | Developer Network & Tech Community in Bhutan"
  },
  description: "Join the premier network for developers in Bhutan. Connect with professionals, build your identity, and collaborate on national projects.",
  alternates: {
    canonical: "/",
  },
};

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Bhutan Developer Connect",
    "alternateName": "BDC",
    "url": "https://www.bhutandevelopersconnect.xyz",
    "description": "A professional network for developers and builders in Bhutan.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://www.bhutandevelopersconnect.xyz/directory?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Bhutan Developer Connect",
    "url": "https://www.bhutandevelopersconnect.xyz",
    "logo": "https://www.bhutandevelopersconnect.xyz/logo.png",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+975-17XXXXXX",
      "contactType": "customer service",
      "areaServed": "BT",
      "availableLanguage": ["English", "Dzongkha"]
    },
    "sameAs": [
      "https://twitter.com/BhutanDevNet",
      "https://github.com/bhutan-developer-network"
    ]
  };

  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-primary/5">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />
      <GlobalHeader />
      <main className="flex-1">
        <HeroSection />

        {/* Core Capabilities Section */}
        <section id="capabilities" className="min-h-[100dvh] flex items-center justify-center bg-background py-16 md:py-20 lg:py-32 border-t">
          <div className="w-full px-[1cm]">
            <div className="flex flex-col items-center gap-4 md:gap-6 text-center mb-16 md:mb-24 lg:mb-32">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-5xl font-semibold tracking-tighter text-foreground text-balance">
                Where Identity Meets Collaboration
              </h2>
              <p className="max-w-[700px] text-sm md:text-base text-muted-foreground/70 leading-relaxed text-balance">
                We provide the Bhutanese tech ecosystem with a centralized layer for professional identity,
                technical help, and team formation.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 border border-border overflow-hidden rounded-sm">
              <FeatureCard
                icon={<Monitor className="h-full w-full" />}
                title="Developer Identity"
                description="Build a Bhutan-specific professional identity that showcases your technical reputation."
              />
              <FeatureCard
                icon={<Code className="h-full w-full" />}
                title="Technical Help"
                description="Get clear answers to blocking problems from a community of vetted local experts."
              />
              <FeatureCard
                icon={<Database className="h-full w-full" />}
                title="Team Formation"
                description="Find collaborators for your next project based on verified skills and availability."
              />
              <FeatureCard
                icon={<Share2 className="h-full w-full" />}
                title="Project Collaboration"
                description="Collaborate on projects and open-source initiatives to grow the national ecosystem."
              />
            </div>
          </div>
        </section>

        <HowItWorks />
        <WhyUseIt />
        <Founder />
        <Plans />
        <FAQ />
      </main>

      <GlobalFooter />
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-background p-8 md:p-10 lg:p-12 transition-all hover:bg-secondary/20 group cursor-pointer border sm:border-none rounded-sm flex flex-col items-center text-center">
      <div className="h-8 w-8 md:h-9 md:w-9 mb-6 md:mb-8 p-1.5 md:p-2 rounded-sm bg-secondary/80 text-primary group-hover:scale-110 transition-transform shadow-[0_2px_4px_rgba(0,0,0,0.05)] border border-border/20">
        {icon}
      </div>
      <h3 className="text-base md:text-lg font-semibold tracking-tight mb-2 md:mb-4 text-foreground">
        {title}
      </h3>
      <p className="text-[13px] md:text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
}

