import Link from "next/link";

import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { MarginalRow } from "@/components/ui/margin";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="container py-6">
        <Link href="/" aria-label="Marginalia home" className="w-fit">
          <Logo />
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center px-6 pb-24">
        <MarginalRow note="404" className="w-full max-w-xl md:grid-cols-[6rem_minmax(0,1fr)]">
          <div className="space-y-5">
            <h1 className="text-title">This page isn&apos;t in the document.</h1>
            <p className="text-reading text-ink-soft">
              The link may be old, or the page may have moved. Your documents are where you left
              them.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <Button asChild>
                <Link href="/documents">Go to your documents</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/">Back to home</Link>
              </Button>
            </div>
          </div>
        </MarginalRow>
      </main>
    </div>
  );
}
