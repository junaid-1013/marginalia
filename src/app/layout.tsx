import "@/styles/globals.css";
import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

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
  const session = null; // Replace null with the actual value of the session variable
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <SessionProvider>{children}</SessionProvider>
      </body>
      <Toaster richColors position="top-right" />
    </html>
  );
}
