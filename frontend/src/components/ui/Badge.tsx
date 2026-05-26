import { type HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full font-medium border",
  {
    variants: {
      variant: {
        info: "bg-accent-cyan/10 text-accent-cyan border-accent-cyan/20",
        success: "bg-accent-emerald/10 text-accent-emerald border-accent-emerald/20",
        warning: "bg-accent-amber/10 text-accent-amber border-accent-amber/20",
        danger: "bg-accent-red/10 text-accent-red border-accent-red/20",
        purple: "bg-accent-purple/10 text-accent-purple border-accent-purple/20",
        neutral: "bg-white/5 text-slate-400 border-white/[0.07]",
      },
      size: {
        sm: "px-2 py-0.5 text-[10px]",
        md: "px-3 py-1 text-xs",
      },
    },
    defaultVariants: {
      variant: "info",
      size: "sm",
    },
  }
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
  dotPulse?: boolean;
}

export function Badge({
  className,
  variant,
  size,
  dot = false,
  dotPulse = false,
  children,
  ...props
}: BadgeProps) {
  const dotColorMap: Record<string, string> = {
    info: "bg-accent-cyan",
    success: "bg-accent-emerald",
    warning: "bg-accent-amber",
    danger: "bg-accent-red",
    purple: "bg-accent-purple",
    neutral: "bg-slate-500",
  };

  const dotColor = dotColorMap[variant || "info"] || "bg-accent-cyan";

  return (
    <span
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full",
            dotColor,
            dotPulse && "animate-pulse"
          )}
        />
      )}
      {children}
    </span>
  );
}

export { badgeVariants };
