import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";
import { useWsConnected, useLastUpdated } from "../../store/monitorStore";
import { Badge } from "./Badge";
import { timeAgo } from "../../lib/utils";

export function ConnectionHealthIndicator() {
  const wsConnected = useWsConnected();
  const lastUpdated = useLastUpdated();
  const [, setTick] = useState(0);

  // Force re-render every 10s to update "last updated" text
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 10_000);
    return () => clearInterval(interval);
  }, []);

  const isStale = lastUpdated && Date.now() - lastUpdated > 30_000;

  // Don't show anything when healthy and recent
  if (wsConnected && !isStale) return null;

  return (
    <div className="flex items-center gap-2" role="status" aria-live="polite">
      {!wsConnected && (
        <Badge variant="warning" size="md" dot dotPulse>
          <WifiOff className="w-3 h-3" />
          <span className="hidden sm:inline">Reconnecting...</span>
        </Badge>
      )}
      {isStale && wsConnected && (
        <Badge variant="neutral" size="sm">
          Data {lastUpdated ? timeAgo(lastUpdated) : "stale"}
        </Badge>
      )}
    </div>
  );
}
