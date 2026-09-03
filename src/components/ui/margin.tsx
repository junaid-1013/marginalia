import { cn } from "@/lib/utils";

/**
 * Margin note: a short annotation that hangs beside the text it explains
 * (a citation, a recall cue, a gloss). Small italic serif, a tick on the rule side.
 */
export const MarginNote = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <aside
    className={cn(
      "border-l-2 border-margin/50 pl-3 font-display text-[0.9375rem] italic leading-6 text-ink-soft",
      className
    )}
  >
    {children}
  </aside>
);

/**
 * Text with its margin: on wide screens the note sits in a left column
 * divided by the notebook's red rule (the Cornell-notes layout), on narrow
 * screens it moves above the text.
 */
export const MarginalRow = ({
  note,
  children,
  className,
}: {
  note: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={cn(
      "grid gap-x-8 gap-y-2 md:grid-cols-[10rem_minmax(0,1fr)]",
      className
    )}
  >
    <MarginNote className="md:border-l-0 md:border-r md:border-margin/40 md:pl-0 md:pr-6 md:text-right">
      {note}
    </MarginNote>
    <div>{children}</div>
  </div>
);
