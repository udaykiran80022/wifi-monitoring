import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useMonitorStore } from "../../store/monitorStore";

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/analytics": "Analytics",
  "/downtime": "Downtime",
  "/alerts": "Alerts",
  "/settings": "Settings",
  "/system-info": "System Info",
};

export default function TopBar() {
  const location = useLocation();
  const { isConnected, wsConnected } = useMonitorStore();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const title = pageTitles[location.pathname] || "WiFi Monitor";

  return (
    <header className="h-16 bg-bg-secondary/80 backdrop-blur-md border-b border-white/[0.07] flex items-center justify-between px-6 sticky top-0 z-40">
      {/* Page Title */}
      <h2 className="text-lg font-semibold text-white">{title}</h2>

      {/* Right Side */}
      <div className="flex items-center gap-4">
        {/* Internet Status Pill */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
            isConnected === null
              ? "bg-white/5 text-slate-400"
              : isConnected
              ? "bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/20"
              : "bg-accent-red/10 text-accent-red border border-accent-red/20"
          }`}
        >
          <div
            className={`w-1.5 h-1.5 rounded-full ${
              isConnected === null
                ? "bg-slate-500"
                : isConnected
                ? "bg-accent-emerald status-dot-connected"
                : "bg-accent-red status-dot-disconnected"
            }`}
          />
          {isConnected === null
            ? "Checking..."
            : isConnected
            ? "Connected"
            : "Disconnected"}
        </div>

        {/* WebSocket Reconnecting Badge */}
        {!wsConnected && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-accent-amber/10 text-accent-amber border border-accent-amber/20">
            <div className="w-1.5 h-1.5 rounded-full bg-accent-amber status-dot-reconnecting" />
            Reconnecting...
          </div>
        )}

        {/* Current Time */}
        <div className="text-sm text-slate-400 font-mono tabular-nums">
          {currentTime.toLocaleTimeString()}
        </div>
      </div>
    </header>
  );
}
