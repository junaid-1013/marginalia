import { cn } from "@/lib/utils";

/**
 * The mark is a page with its margin: a ruled edge and the highlighter stroke
 * hanging in the margin. It uses currentColor for the page and the token
 * for the highlighter, so it follows light and dark.
 */
export const LogoMark = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 32 32"
    fill="none"
    aria-hidden="true"
    className={cn("h-7 w-7 shrink-0", className)}
  >
    <rect
      x="6.5"
      y="3.5"
      width="21"
      height="25"
      rx="3"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path d="M13 3.5v25" stroke="currentColor" strokeWidth="1.5" opacity="0.45" />
    <rect x="3" y="10" width="7.5" height="4" rx="1.2" className="fill-highlight" />
    <path
      d="M17 11h7M17 16h7M17 21h4.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

export const Logo = ({
  className,
  wordmark = true,
}: {
  className?: string;
  wordmark?: boolean;
}) => (
  <span className={cn("inline-flex items-center gap-2 text-foreground", className)}>
    <LogoMark />
    {wordmark && (
      <span className="font-display text-xl font-semibold tracking-[-0.02em]">
        Marginalia
      </span>
    )}
  </span>
);
