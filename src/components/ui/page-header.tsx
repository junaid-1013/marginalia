import { cn } from "@/lib/utils";

interface IProps {
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export const PageHeader = ({ title, description, actions, className }: IProps) => (
  <div className={cn("flex flex-wrap items-end justify-between gap-4", className)}>
    <div className="space-y-1">
      <h1 className="text-title">{title}</h1>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
    </div>
    {actions && <div className="flex items-center gap-2">{actions}</div>}
  </div>
);
