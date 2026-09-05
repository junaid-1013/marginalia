import type { Metadata } from "next";

import { auth } from "@/auth";
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

export default async function Home() {
  const session = await auth();
  const loggedIn = !!session?.user;

  return (
    <div className="min-h-screen bg-background">
      <LandingNav loggedIn={loggedIn} />
      <main>
        <Hero loggedIn={loggedIn} />
        <div className="container max-w-6xl pb-16 md:pb-24">
          <Demo />
        </div>
        <HowItWorks />
        <Features />
        <Trust />
        <Faq />
        <FinalCta loggedIn={loggedIn} />
      </main>
      <Footer />
    </div>
  );
}
