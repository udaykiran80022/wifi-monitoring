import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";
import { cn } from "../../lib/utils";

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={cn(
        "fixed top-0 left-0 right-0 z-[100] flex items-center justify-center gap-2",
        "bg-accent-red py-2 px-4 text-white text-sm font-medium",
        "animate-slide-down"
      )}
    >
      <WifiOff className="w-4 h-4" />
      You are offline. Some features may not work.
    </div>
  );
}
