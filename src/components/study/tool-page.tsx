import { cn } from "@/lib/utils";

/** The same reading column for every study tool. */
export const ToolPage = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={cn("mx-auto w-full max-w-3xl space-y-8 px-5 py-6 md:px-8 md:py-8", className)}>
    {children}
  </div>
);
