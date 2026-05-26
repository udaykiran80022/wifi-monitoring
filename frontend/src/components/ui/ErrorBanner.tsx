import { AlertCircle, X, RefreshCw } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "./Button";

interface ErrorBannerProps {
  error: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export function ErrorBanner({
  error,
  onRetry,
  onDismiss,
  className,
}: ErrorBannerProps) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className={cn(
        "flex items-center gap-3 p-4 rounded-xl bg-accent-red/5 border border-accent-red/10 text-accent-red animate-slide-down",
        className
      )}
    >
      <AlertCircle className="w-5 h-5 shrink-0" />
      <p className="flex-1 text-sm">{error}</p>
      <div className="flex items-center gap-2 shrink-0">
        {onRetry && (
          <Button
            variant="danger"
            size="sm"
            onClick={onRetry}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </Button>
        )}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="p-1 text-accent-red/60 hover:text-accent-red transition-colors rounded"
            aria-label="Dismiss error"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
