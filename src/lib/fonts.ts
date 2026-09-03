import { Hanken_Grotesk, Newsreader } from "next/font/google";

// Newsreader is drawn for reading on screens and has an optical size axis, so
// large headings tighten up by themselves. Hanken Grotesk carries the UI.
export const display = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  display: "swap",
  variable: "--font-display",
  fallback: ["Georgia", "Times New Roman", "serif"],
  // next/font has no metrics for this family, so skip the (failing) fallback adjustment
  adjustFontFallback: false,
});

export const sans = Hanken_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});
