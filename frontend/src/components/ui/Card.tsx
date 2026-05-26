import { forwardRef, type HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const cardVariants = cva(
  // Base card styles — matches the existing .card CSS class
  "bg-bg-secondary border border-white/[0.07] rounded-xl transition-all duration-300",
  {
    variants: {
      variant: {
        default: "hover:border-white/[0.14] hover:shadow-[0_0_20px_rgba(0,212,255,0.03)]",
        "glow-cyan": "border-accent-cyan/20 shadow-[0_0_15px_rgba(0,212,255,0.1),0_0_30px_rgba(0,212,255,0.05)]",
        "glow-emerald": "border-accent-emerald/20 shadow-[0_0_15px_rgba(16,185,129,0.1),0_0_30px_rgba(16,185,129,0.05)]",
        "glow-red": "border-accent-red/20 shadow-[0_0_15px_rgba(239,68,68,0.1),0_0_30px_rgba(239,68,68,0.05)]",
        "glow-amber": "border-accent-amber/20 shadow-[0_0_15px_rgba(245,158,11,0.1),0_0_30px_rgba(245,158,11,0.05)]",
        flat: "",
        interactive:
          "hover:border-white/[0.14] hover:shadow-[0_0_20px_rgba(0,212,255,0.03)] cursor-pointer active:scale-[0.99]",
      },
      padding: {
        none: "p-0",
        sm: "p-3",
        md: "p-5",
        lg: "p-6",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "md",
    },
  }
);

export interface CardProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(cardVariants({ variant, padding }), className)}
        {...props}
      />
    );
  }
);

Card.displayName = "Card";

// Card sub-components for structured layouts
function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex items-center justify-between mb-4", className)}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("text-sm font-semibold text-white", className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-xs text-slate-500 mt-0.5", className)}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("", className)} {...props} />;
}

export { Card, cardVariants, CardHeader, CardTitle, CardDescription, CardContent };
