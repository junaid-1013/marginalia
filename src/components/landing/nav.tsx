import Link from "next/link";

import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { NavActions } from "@/components/landing/auth-links";
import { ThemeToggler } from "@/components/ui/theme-toggler";

const sections = [
  { hash: "#how", label: "How it works" },
  { hash: "#features", label: "Features" },
  { hash: "#faq", label: "FAQ" },
];

/** `onLanding` is false on other public pages, where the section links must point back to "/". */
export const LandingNav = ({ onLanding = true }: { onLanding?: boolean }) => {
  const links = [
    ...sections.map((s) => ({ href: `${onLanding ? "" : "/"}${s.hash}`, label: s.label })),
    { href: "/about", label: "About" },
  ];
  return (
  <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
    <div className="container flex h-16 max-w-6xl items-center justify-between gap-4">
      <Link href="/" aria-label="Marginalia home">
        <Logo />
      </Link>
      <nav aria-label="Sections" className="hidden items-center gap-1 md:flex">
        {links.map((l) => (
          <Button key={l.href} asChild variant="ghost" size="sm">
            <Link href={l.href}>{l.label}</Link>
          </Button>
        ))}
      </nav>
      <div className="flex items-center gap-2">
        <ThemeToggler />
        <NavActions />
      </div>
    </div>
  </header>
);
};
