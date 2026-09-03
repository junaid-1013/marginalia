import { cn } from "@/lib/utils";

// loading placeholder as a faint ink wash; the pulse stops with reduced motion
export const Skeleton = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("animate-pulse rounded-md bg-foreground/[0.08]", className)}
    {...props}
  />
);
