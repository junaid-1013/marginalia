import type { Metadata } from "next";

import { Demo } from "@/components/landing/demo/demo";
import { LandingNav } from "@/components/landing/nav";
import {
  Faq,
  Features,
  FinalCta,
  Footer,
  Hero,
  HowItWorks,
  Trust,
} from "@/components/landing/sections";

export const metadata: Metadata = {
  title: { absolute: "Marginalia: dense texts, decoded into active recall" },
  description:
    "Upload a PDF, ask it questions, and study from summaries, flashcards and quizzes. Every answer points to the page it came from.",
};

// no per-request work here: the page is prerendered once and served from the cache
export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNav />
      <main>
        <Hero />
        <div className="container max-w-6xl pb-16 md:pb-24">
          <Demo />
        </div>
        <HowItWorks />
        <Features />
        <Trust />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
