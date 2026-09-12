import "@/styles/globals.css";
import type { Metadata, Viewport } from "next";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "@/components/ui/sonner";
import { Provider as BalancerProvider } from "react-wrap-balancer";

import { display, displayItalic, sans } from "@/lib/fonts";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/site";
import { ThemeProvider, ReactQueryProvider } from "@/providers";


export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME}: ${SITE_TAGLINE.toLowerCase().replace(/\.$/, "")}`, template: `%s | ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME}: ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
  },
  twitter: { card: "summary_large_image" },
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
      className={`${display.variable} ${displayItalic.variable} ${sans.variable}`}
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
