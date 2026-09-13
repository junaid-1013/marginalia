import type { Metadata } from "next";

import { AboutHero, HelpOut, Portraits, StoryChapters } from "@/components/about/story";
import { LandingNav } from "@/components/landing/nav";
import { FinalCta, Footer } from "@/components/landing/sections";

export const metadata: Metadata = {
  title: "About",
  description:
    "Marginalia began as a academic project by two classmates. It was set aside when work took over, then finished and opened up for everyone.",
};

// static: no per-request work
export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNav onLanding={false} />
      <main>
        <AboutHero />
        <Portraits />
        <StoryChapters />
        <HelpOut />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
