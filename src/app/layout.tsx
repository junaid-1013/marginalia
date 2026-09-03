import "@/styles/globals.css";
import type { Metadata, Viewport } from "next";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "@/components/ui/sonner";
import { Provider as BalancerProvider } from "react-wrap-balancer";

import { display, sans } from "@/lib/fonts";
import { ThemeProvider, ReactQueryProvider } from "@/providers";


export const metadata: Metadata = {
  title: { default: "Marginalia", template: "%s | Marginalia" },
  description:
    "Dense texts, decoded into active recall. Upload a PDF, ask it questions, and study from summaries, flashcards and quizzes with page citations.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F4F2EC" },
    { media: "(prefers-color-scheme: dark)", color: "#10171E" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${display.variable} ${sans.variable}`}
    >
      <body className="font-sans antialiased">
        <SessionProvider>
          <ReactQueryProvider>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              <BalancerProvider>{children}</BalancerProvider>
              <Toaster richColors position="top-center" />
            </ThemeProvider>
          </ReactQueryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
