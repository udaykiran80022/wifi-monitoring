import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  // Base styles applied to all buttons
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary disabled:opacity-50 disabled:pointer-events-none select-none",
  {
    variants: {
      variant: {
        primary:
          "bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20 hover:bg-accent-cyan/20 active:bg-accent-cyan/25",
        secondary:
          "bg-bg-secondary text-slate-400 border border-white/[0.07] hover:text-white hover:bg-white/5 active:bg-white/10",
        ghost:
          "text-slate-400 hover:text-white hover:bg-white/[0.04] active:bg-white/[0.08]",
        danger:
          "bg-accent-red/10 text-accent-red border border-accent-red/20 hover:bg-accent-red/20 active:bg-accent-red/25",
        success:
          "bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/20 hover:bg-accent-emerald/20 active:bg-accent-emerald/25",
      },
      size: {
        sm: "text-xs px-2.5 py-1.5 h-7",
        md: "text-sm px-4 py-2 h-9",
        lg: "text-sm px-6 py-2.5 h-11",
        icon: "h-9 w-9 p-0",
        "icon-sm": "h-7 w-7 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
