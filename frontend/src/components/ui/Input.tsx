import { forwardRef, type InputHTMLAttributes, useId } from "react";
import { cn } from "../../lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
  unit?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helpText, unit, id: propId, ...props }, ref) => {
    const generatedId = useId();
    const id = propId || generatedId;
    const helpId = helpText ? `${id}-help` : undefined;
    const errorId = error ? `${id}-error` : undefined;

    const describedBy = [helpId, errorId].filter(Boolean).join(" ") || undefined;

    return (
      <div className="space-y-2">
        {label && (
          <div className="flex items-center justify-between">
            <label
              htmlFor={id}
              className="text-sm font-medium text-slate-300"
            >
              {label}
            </label>
            {helpText && (
              <span id={helpId} className="text-[10px] text-slate-600">
                {helpText}
              </span>
            )}
          </div>
        )}
        <div className="flex items-center gap-2">
          <input
            ref={ref}
            id={id}
            aria-invalid={!!error}
            aria-describedby={describedBy}
            className={cn(
              "flex-1 bg-bg-tertiary border rounded-lg px-4 py-2.5 text-white font-mono text-sm",
              "focus:outline-none focus:ring-1 transition-all",
              "placeholder:text-slate-600",
              error
                ? "border-accent-red/30 focus:border-accent-red/50 focus:ring-accent-red/10"
                : "border-white/[0.07] focus:border-accent-cyan/30 focus:ring-accent-cyan/10",
              className
            )}
            {...props}
          />
          {unit && (
            <span className="text-xs text-slate-500 w-16 shrink-0">
              {unit}
            </span>
          )}
        </div>
        {error && (
          <p id={errorId} className="text-xs text-accent-red mt-1" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
