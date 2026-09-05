import Link from "next/link";

import { Logo } from "@/components/logo";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { MarginalRow } from "@/components/ui/margin";

const Section = ({
  id,
  title,
  children,
}: {
  id?: string;
  title: string;
  children: React.ReactNode;
}) => (
  <section id={id} className="scroll-mt-16 border-t py-16 md:py-24">
    <div className="container max-w-6xl">
      <h2 className="text-title mb-10 max-w-2xl text-balance md:mb-14">{title}</h2>
      {children}
    </div>
  </section>
);

export const Hero = ({ loggedIn }: { loggedIn: boolean }) => (
  <section className="container max-w-6xl pb-12 pt-14 md:pb-16 md:pt-24">
    <h1 className="text-display max-w-4xl">Dense texts, decoded into active recall.</h1>
    <p className="text-lead mt-6 max-w-xl">
      Upload a PDF, then question it, summarize it and quiz yourself on it. Every answer points to
      the page it came from.
    </p>
    <div className="mt-8 flex flex-wrap items-center gap-3">
      <Button asChild size="lg">
        <Link href={loggedIn ? "/documents/create" : "/create-account"}>Upload your first PDF</Link>
      </Button>
      <Button asChild size="lg" variant="outline">
        <a href="#demo">See it work</a>
      </Button>
    </div>
    <p className="text-caption mt-4">Text-based PDFs up to 20 MB.</p>
  </section>
);

export const HowItWorks = () => (
  <Section id="how" title="How it works">
    <div className="max-w-3xl space-y-10">
      <MarginalRow note="Upload">
        <p className="text-reading">
          Drop in a PDF: a paper, lecture notes, a chapter. It is stored privately for your account.
        </p>
      </MarginalRow>
      <MarginalRow note="Read">
        <p className="text-reading">
          Marginalia reads the text page by page and indexes it, so answers can point to the right
          page. This usually takes a minute or two, and you can leave while it works.
        </p>
      </MarginalRow>
      <MarginalRow note="Study">
        <p className="text-reading">
          Ask questions in chat, read the summary, flip through flashcards and take a quiz. Keep your
          own notes next to the document.
        </p>
      </MarginalRow>
    </div>
  </Section>
);

const features = [
  {
    name: "Chat with citations",
    text: "Ask in plain language. Each answer lists the pages it used, and one click opens the PDF at that page.",
  },
  {
    name: "Summary",
    text: "A short summary, the key takeaways and a word cloud of the terms that matter most.",
  },
  {
    name: "Flashcards",
    text: "Question and answer cards generated from the document, ready to flip through.",
  },
  {
    name: "Quiz",
    text: "Ten multiple-choice questions with explanations and a score at the end. Generate a new one whenever you like.",
  },
  {
    name: "Notes",
    text: "A notes editor beside the document, saved to your account.",
  },
];

export const Features = () => (
  <Section id="features" title="What you can do with a document">
    <dl className="max-w-4xl">
      {features.map((f) => (
        <div
          key={f.name}
          className="grid gap-1 border-t py-5 first:border-t-0 first:pt-0 md:grid-cols-[14rem_minmax(0,1fr)] md:gap-8"
        >
          <dt className="text-heading">{f.name}</dt>
          <dd className="text-reading text-ink-soft">{f.text}</dd>
        </div>
      ))}
    </dl>
  </Section>
);

export const Trust = () => (
  <Section id="trust" title="Answers you can check, documents that stay yours">
    <div className="grid gap-12 md:grid-cols-2 md:gap-16">
      <div className="space-y-3">
        <h3 className="text-heading">Every answer shows its source</h3>
        <p className="text-reading text-ink-soft">
          Marginalia answers from your document and says so when it cannot find something. Page
          references let you check any claim in seconds, which matters most when you are studying
          for an exam.
        </p>
      </div>
      <div className="space-y-3">
        <h3 className="text-heading">Private by default</h3>
        <p className="text-reading text-ink-soft">
          Your files are stored privately and open only for your account. Delete a document and the
          PDF, chat, summary, flashcards and quiz are deleted with it.
        </p>
      </div>
    </div>
  </Section>
);

const faqs = [
  {
    q: "Which files work?",
    a: "Text-based PDFs up to 20 MB. Scanned or image-only PDFs have no text to read yet, so they stop with a clear message instead of producing empty results.",
  },
  {
    q: "How many documents can I keep?",
    a: "Up to 10 per account. Delete one to make room for another.",
  },
  {
    q: "How long does processing take?",
    a: "Usually a minute or two for a typical paper, longer for a whole book. You can leave the page: chat unlocks when the document is ready.",
  },
  {
    q: "Where do the answers come from?",
    a: "From the text of your document. Marginalia shows the pages it used so you can compare with the PDF. Like any AI tool it can still make mistakes, so use the citations to check.",
  },
  {
    q: "Who can see my documents?",
    a: "Only you, through your account. To answer a question or write a summary, the relevant excerpts of your document are sent to the AI service that generates the text.",
  },
];

export const Faq = () => (
  <Section id="faq" title="Questions">
    <Accordion type="single" collapsible className="max-w-3xl">
      {faqs.map((f, i) => (
        <AccordionItem key={f.q} value={`faq-${i}`}>
          <AccordionTrigger className="text-left text-base font-medium">{f.q}</AccordionTrigger>
          <AccordionContent className="text-reading text-ink-soft">{f.a}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  </Section>
);

export const FinalCta = ({ loggedIn }: { loggedIn: boolean }) => (
  <section className="border-t bg-card py-16 md:py-24">
    <div className="container max-w-6xl">
      <h2 className="text-display max-w-3xl text-[clamp(2.25rem,1.4rem+3.6vw,3.75rem)]">
        Start with one PDF.
      </h2>
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Button asChild size="lg">
          <Link href={loggedIn ? "/documents/create" : "/create-account"}>
            {loggedIn ? "Upload a PDF" : "Create an account"}
          </Link>
        </Button>
        {!loggedIn && (
          <Button asChild size="lg" variant="ghost">
            <Link href="/login">Log in</Link>
          </Button>
        )}
      </div>
    </div>
  </section>
);

export const Footer = () => (
  <footer className="border-t py-10">
    <div className="container flex max-w-6xl flex-wrap items-center justify-between gap-4">
      <div className="space-y-1">
        <Logo />
        <p className="text-caption">Dense texts, decoded into active recall.</p>
      </div>
      <p className="text-caption">&copy; {new Date().getFullYear()} Marginalia</p>
    </div>
  </footer>
);
