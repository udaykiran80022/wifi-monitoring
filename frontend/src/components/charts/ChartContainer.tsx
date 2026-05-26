import { ResponsiveContainer } from "recharts";
import { cn } from "../../lib/utils";

interface ChartContainerProps {
  children: React.ReactNode;
  height?: number;
  emptyMessage?: string;
  isEmpty?: boolean;
  className?: string;
  "aria-label"?: string;
}

export function ChartContainer({
  children,
  height = 250,
  emptyMessage = "No data available",
  isEmpty = false,
  className,
  "aria-label": ariaLabel,
}: ChartContainerProps) {
  if (isEmpty) {
    return (
      <div
        className={cn(
          "flex items-center justify-center text-slate-500 text-sm",
          className
        )}
        style={{ height }}
        role="img"
        aria-label={ariaLabel || emptyMessage}
      >
        {emptyMessage}
      </div>
    );
  }

  return (
    <div
      role="img"
      aria-label={ariaLabel}
      className={className}
    >
      <ResponsiveContainer width="100%" height={height}>
        {children as React.ReactElement}
      </ResponsiveContainer>
    </div>
  );
}
