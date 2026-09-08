"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { MarginalRow } from "@/components/ui/margin";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-[70vh] items-center justify-center px-6 py-16">
      <MarginalRow note="Error" className="w-full max-w-xl md:grid-cols-[6rem_minmax(0,1fr)]">
        <div className="space-y-5">
          <h1 className="text-title">Something went wrong.</h1>
          <p className="text-reading text-ink-soft">
            This page could not be loaded. Try again, and if it keeps happening, come back in a few
            minutes.
          </p>
          <div className="flex flex-wrap gap-3 pt-1">
            <Button onClick={reset}>Try again</Button>
            <Button asChild variant="outline">
              <Link href="/documents">Go to your documents</Link>
            </Button>
          </div>
          {error.digest && <p className="text-caption">Reference: {error.digest}</p>}
        </div>
      </MarginalRow>
    </main>
  );
}
