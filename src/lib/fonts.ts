import { Hanken_Grotesk, Newsreader } from "next/font/google";

// Newsreader is drawn for reading on screens and has an optical size axis, so
// large headings tighten up by themselves. Hanken Grotesk carries the UI.
export const display = Newsreader({
  subsets: ["latin"],
  style: ["normal"],
  axes: ["opsz"],
  display: "swap",
  variable: "--font-display",
  fallback: ["Georgia", "Times New Roman", "serif"],
  // next/font has no metrics for this family, so skip the (failing) fallback adjustment
  adjustFontFallback: false,
});

// The italic is a separate file that is not preloaded: it is only used for
// margin notes and quotes, never in the first paint, so it must not compete
// with the upright face for bandwidth. `.italic` switches to it (globals.css).
export const displayItalic = Newsreader({
  subsets: ["latin"],
  style: ["italic"],
  axes: ["opsz"],
  display: "swap",
  variable: "--font-display-italic",
  preload: false,
  fallback: ["Georgia", "Times New Roman", "serif"],
  adjustFontFallback: false,
});

export const sans = Hanken_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});
