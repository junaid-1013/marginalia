import { cn } from "@/lib/utils";

interface IProps {
  icon?: React.ReactNode;
  title: string;
  description?: React.ReactNode;
  /** the one thing the person should do next */
  action?: React.ReactNode;
  className?: string;
}

/** An empty screen is an invitation: say what belongs here and offer the next step. */
export const EmptyState = ({ icon, title, description, action, className }: IProps) => (
  <div
    className={cn(
      "flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed bg-card/50 px-6 py-14 text-center",
      className
    )}
  >
    {icon && <div className="text-muted-foreground [&_svg]:h-8 [&_svg]:w-8">{icon}</div>}
    <h3 className="text-heading">{title}</h3>
    {description && (
      <p className="max-w-sm text-sm leading-6 text-muted-foreground">{description}</p>
    )}
    {action && <div className="mt-2">{action}</div>}
  </div>
);
