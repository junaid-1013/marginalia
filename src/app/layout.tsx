import "@/styles/globals.css";
import type { Metadata } from "next";
// import { Inter } from "next/font/google";
import { dm_sans, inter } from "@/lib/fonts";
import { Toaster } from "@/components/ui/sonner";

// const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "InnovatED",
  description:
    "AI SAAS Application for the students to summarize and interact with thier documents",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${dm_sans.variable}`}
      suppressHydrationWarning
    >
      {/* <Header stargazers_count={stargazers_count} /> */}
      <body className={inter.className}>{children}</body>
      <Toaster richColors position="top-right" />
      {/* <Footer /> */}
    </html>
  );
}
