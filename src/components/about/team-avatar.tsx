"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

/** GitHub serves a member's current avatar at github.com/<user>.png, so photos stay up to date. */
export const githubAvatarUrl = (githubUrl?: string, size = 640) => {
  const user = githubUrl?.match(/github\.com\/([^/?#]+)/i)?.[1];
  return user ? `https://github.com/${user}.png?size=${size}` : undefined;
};

// first and last name: "Muhammad Junaid Iqbal" -> "MI"
const initialsOf = (name: string) => {
  const parts = name.split(" ").filter(Boolean);
  const pick = parts.length > 1 ? [parts[0], parts[parts.length - 1]] : parts;
  return pick.map((part) => part[0]).join("").toUpperCase();
};

/**
 * A member's portrait. It "develops" when it arrives (a single fade from soft
 * grayscale), and falls back to initials if GitHub cannot be reached.
 */
export default function TeamAvatar({
  name,
  github,
  priority = false,
}: {
  name: string;
  github: string;
  /** above the fold: load right away instead of lazily */
  priority?: boolean;
}) {
  // "ssr": rendered by the server, visible as is (works without JavaScript too)
  // "loading": still on its way, shown soft; "done" / "failed": settled
  const [phase, setPhase] = useState<"ssr" | "loading" | "done" | "failed">("ssr");
  const ref = useRef<HTMLImageElement>(null);
  const src = githubAvatarUrl(github);

  // the image can finish (or fail) before React hydrates, and its load/error
  // events are gone by then: look at its state once on mount instead
  useEffect(() => {
    const img = ref.current;
    if (!img) return;
    if (img.complete) setPhase(img.naturalWidth > 0 ? "done" : "failed");
    else setPhase("loading");
  }, []);

  const initials = (
    <span
      className="absolute inset-0 flex items-center justify-center bg-secondary font-display text-5xl font-medium text-muted-foreground"
      role="img"
      aria-label={`Initials of ${name}`}
    >
      {initialsOf(name)}
    </span>
  );

  if (!src || phase === "failed") return <span className="relative block h-full w-full">{initials}</span>;

  // the initials sit underneath while the portrait is on its way, so the frame is never empty
  return (
    <span className="relative block h-full w-full">
      {phase === "loading" && initials}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={ref}
        src={src}
        alt={`Portrait of ${name}`}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        decoding="async"
        referrerPolicy="no-referrer"
        onLoad={() => setPhase("done")}
        onError={() => setPhase("failed")}
        className={cn(
          "absolute inset-0 h-full w-full object-cover object-center transition-[filter,opacity] duration-1000 ease-out motion-reduce:transition-none",
          phase === "loading" ? "opacity-0 grayscale blur-sm" : "opacity-100 grayscale-0 blur-0"
        )}
      />
    </span>
  );
}
