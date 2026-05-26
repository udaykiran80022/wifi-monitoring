import { type ReactNode } from "react";
import { cn } from "../../lib/utils";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 px-4 text-center",
        className
      )}
    >
      {icon && (
        <div className="mb-4 text-slate-600">
          {icon}
        </div>
      )}
      <h4 className="text-sm font-medium text-slate-400 mb-1">{title}</h4>
      {description && (
        <p className="text-xs text-slate-600 max-w-sm">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
