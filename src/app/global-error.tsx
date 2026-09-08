"use client";

import "@/styles/globals.css";

// last resort: replaces the root layout, so it brings its own html and body
export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-background px-6 font-serif text-foreground">
        <div className="max-w-md space-y-4">
          <h1 className="text-title">Marginalia hit a problem.</h1>
          <p className="text-reading">Reload the page. If it keeps happening, try again in a few minutes.</p>
          <button
            onClick={reset}
            className="rounded-md bg-primary px-4 py-2 font-sans text-sm font-medium text-primary-foreground"
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}
