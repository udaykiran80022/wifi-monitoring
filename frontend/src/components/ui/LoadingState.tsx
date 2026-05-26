import { cn } from "../../lib/utils";

interface SkeletonBlockProps {
  className?: string;
}

function SkeletonBlock({ className }: SkeletonBlockProps) {
  return (
    <div
      className={cn(
        "animate-pulse bg-slate-800/50 rounded-lg",
        className
      )}
    />
  );
}

interface LoadingStateProps {
  /** Predefined layout pattern */
  variant?: "cards" | "chart" | "list" | "page" | "table";
  /** Number of skeleton items for card/list variants */
  count?: number;
  className?: string;
}

export function LoadingState({
  variant = "page",
  count = 4,
  className,
}: LoadingStateProps) {
  if (variant === "cards") {
    return (
      <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", className)}>
        {Array.from({ length: count }).map((_, i) => (
          <SkeletonBlock key={i} className="h-32" />
        ))}
      </div>
    );
  }

  if (variant === "chart") {
    return (
      <div className={cn("space-y-3", className)}>
        <div className="flex items-center justify-between">
          <SkeletonBlock className="h-5 w-40" />
          <SkeletonBlock className="h-5 w-24" />
        </div>
        <SkeletonBlock className="h-64 w-full" />
      </div>
    );
  }

  if (variant === "list") {
    return (
      <div className={cn("space-y-2", className)}>
        {Array.from({ length: count }).map((_, i) => (
          <SkeletonBlock key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (variant === "table") {
    return (
      <div className={cn("space-y-2", className)}>
        <SkeletonBlock className="h-10 w-full" />
        {Array.from({ length: count }).map((_, i) => (
          <SkeletonBlock key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  // variant === "page"
  return (
    <div className={cn("space-y-6", className)}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonBlock key={i} className="h-32" />
        ))}
      </div>
      <SkeletonBlock className="h-64 w-full" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SkeletonBlock className="h-64" />
        <SkeletonBlock className="h-64" />
      </div>
    </div>
  );
}

export { SkeletonBlock };
