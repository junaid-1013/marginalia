import type { Metadata } from "next";
import Link from "next/link";

import { LandingNav } from "@/components/landing/nav";
import { Footer } from "@/components/landing/sections";
import { REPO_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "What Marginalia stores, what it sends to AI providers, how your API key is protected, and how to delete your data.",
};

const UPDATED = "10 October 2026";

const link = "underline decoration-highlight decoration-2 underline-offset-4";

const Section = ({ note, title, children }: { note: string; title: string; children: React.ReactNode }) => (
  <div className="grid gap-x-10 gap-y-2 md:grid-cols-[11rem_minmax(0,1fr)]">
    <div className="md:sticky md:top-24 md:self-start md:border-r md:border-margin/40 md:pr-6 md:text-right">
      <p className="border-l-2 border-margin/50 pl-3 font-display text-[0.9375rem] italic leading-6 text-ink-soft md:border-l-0 md:pl-0">
        {note}
      </p>
    </div>
    <div className="max-w-prose space-y-4">
      <h2 className="text-title">{title}</h2>
      <div className="text-reading space-y-4 text-ink-soft">{children}</div>
    </div>
  </div>
);

const List = ({ items }: { items: React.ReactNode[] }) => (
  <ul className="list-disc space-y-2 pl-5 marker:text-margin">
    {items.map((item, i) => (
      <li key={i}>{item}</li>
    ))}
  </ul>
);

// static: no per-request work
export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNav onLanding={false} />
      <main>
        <section className="container max-w-6xl pb-10 pt-14 md:pb-14 md:pt-20">
          <h1 className="text-display max-w-4xl">Your documents, your key, your call.</h1>
          <p className="text-lead mt-6 max-w-2xl">
            This page says plainly what Marginalia stores, what it sends to AI providers, and how to remove it. The
            code is open, so you can check every claim here against it.
          </p>
          <p className="text-caption mt-4">Last updated {UPDATED}</p>
        </section>

        <section className="container max-w-6xl space-y-14 border-t py-14 md:space-y-20 md:py-20" aria-label="Privacy notice">
          <Section note="What we keep" title="What Marginalia stores">
            <List
              items={[
                "Your account: your name and email, and a password hash (never the password). If you sign in with Google we receive your name, email and profile picture from Google.",
                "Your documents: the PDF itself, the text extracted from it in chunks, and numeric embeddings of those chunks used for search.",
                "What you make from them: chat messages and their page citations, summaries, flashcards, quizzes and notes.",
                "Your AI settings: the provider and models you chose, and your API key if you add one (see below).",
                "A daily counter of AI actions, only while you use the shared key (to enforce its allowance).",
                "Operational logs: error messages and request information, kept to run and fix the service. We do not log document text, and keys are removed from log lines.",
              ]}
            />
          </Section>

          <Section note="Your API key" title="How your API key is protected">
            <p>
              If you add your own OpenAI or Google Gemini key, it is encrypted with AES-256-GCM before it is stored, and
              bound to your account so it cannot be used from another one. The encryption secret lives only in the
              server environment, never in the database or the code.
            </p>
            <List
              items={[
                "It is decrypted only in memory, only to call your provider for your documents.",
                "It is never shown again (the settings screen shows only its last four characters), never returned by any API, never written to logs, and never placed in background job data.",
                "You can remove it at any time in AI settings, which deletes the stored copy. Deleting your account removes it as well.",
                "A key is only saved after the provider has accepted it, and it is used only with the official OpenAI or Google endpoints.",
              ]}
            />
            <p>
              Use a key meant for this purpose, and set a spending limit with your provider. If you think a key has been
              exposed, revoke it at the provider as well as removing it here.
            </p>
          </Section>

          <Section note="The shared key" title="When Marginalia's own key is used">
            <p>
              If you have not added a key, a shared key owned by the people who run this service may be used, within a
              small allowance. Your documents and questions are then sent to the AI provider under that account. When the
              allowance is used up you are asked to add your own key.
            </p>
          </Section>

          <Section note="Who else sees it" title="Services that handle your data">
            <List
              items={[
                <>
                  <strong className="font-semibold text-foreground">AI providers (OpenAI, Google).</strong> To answer a
                  question, summarize or make flashcards and quizzes, the relevant excerpts of your document and your
                  questions are sent to the provider you selected. To search a document, its text is sent to produce
                  embeddings. What the provider does with it is governed by its own terms and data policy; with your own
                  key, that agreement is between you and the provider.
                </>,
                <>
                  <strong className="font-semibold text-foreground">Hosting and storage.</strong> The app runs on Vercel.
                  PDFs are kept in a private Vercel Blob store and opened only for their owner. Account and document data
                  is kept in a Postgres database.
                </>,
                <>
                  <strong className="font-semibold text-foreground">Background jobs (Inngest).</strong> Processing runs as
                  background jobs. The jobs receive a document id, not your key, but the service keeps the results of each
                  job step for a while, and some of those are intermediate summaries written from your document.
                </>,
              ]}
            />
            <p>We do not sell your data, and we do not use it for advertising.</p>
          </Section>

          <Section note="Cookies" title="Cookies and tracking">
            <p>
              A session cookie keeps you logged in. Your browser also remembers small preferences on your device (the
              theme, whether the tool list is collapsed, and whether you have seen the tour). There are no analytics, no
              advertising trackers and no third-party cookies.
            </p>
          </Section>

          <Section note="Deleting" title="Keeping control of your data">
            <List
              items={[
                "Delete a document and its PDF, extracted text, chat, summary, flashcards, quiz and notes are removed.",
                "Remove an API key in AI settings at any time.",
                <>
                  To delete your whole account, or to ask a question about your data, contact either of us through the
                  links on the{" "}
                  <Link href="/about" className={link}>
                    About page
                  </Link>
                  .
                </>,
              ]}
            />
            <p>
              Please only upload documents you are allowed to share with an AI provider. Marginalia reads whatever you
              give it, and it cannot know whether a file is confidential.
            </p>
          </Section>

          <Section note="Open source" title="Check it yourself">
            <p>
              Marginalia&apos;s code is public, including how keys are encrypted and where data goes. You can read it,
              run your own copy so that everything stays on your own infrastructure, and open an issue if something here
              does not match what the code does.
            </p>
            <p>
              <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className={link}>
                Source on GitHub
              </a>
            </p>
          </Section>
        </section>
      </main>
      <Footer />
    </div>
  );
}
