import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import { useMonitorStore } from "../../store/monitorStore";
import { useSidebar } from "./SidebarContext";
import { Badge } from "../ui/Badge";
import { NotificationCenter } from "../ui/NotificationCenter";
import { ConnectionHealthIndicator } from "../ui/ConnectionHealthIndicator";

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
  const isConnected = useMonitorStore((s) => s.isConnected);
  const { isMobile, toggle } = useSidebar();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const title = pageTitles[location.pathname] || "WiFi Monitor";

  return (
    <header
      className="h-16 bg-bg-secondary/80 backdrop-blur-md border-b border-white/[0.07] flex items-center justify-between px-4 md:px-6 sticky top-0 z-40 shrink-0"
      role="banner"
    >
      {/* Left side */}
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        {isMobile && (
          <button
            onClick={toggle}
            className="p-2 -ml-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <h2 className="text-lg font-semibold text-white">{title}</h2>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Internet Status Pill */}
        <div
          role="status"
          aria-live="polite"
          aria-label={
            isConnected === null
              ? "Checking internet connection"
              : isConnected
              ? "Internet connected"
              : "Internet disconnected"
          }
        >
          <Badge
            variant={
              isConnected === null
                ? "neutral"
                : isConnected
                ? "success"
                : "danger"
            }
            size="md"
            dot
            dotPulse={isConnected === false}
          >
            <span className="hidden sm:inline">
              {isConnected === null
                ? "Checking..."
                : isConnected
                ? "Connected"
                : "Disconnected"}
            </span>
            <span className="sm:hidden">
              {isConnected === null
                ? "..."
                : isConnected
                ? "On"
                : "Off"}
            </span>
          </Badge>
        </div>

        {/* Connection Health */}
        <ConnectionHealthIndicator />

        {/* Notification Center */}
        <NotificationCenter />

        {/* Current Time */}
        <div className="text-sm text-slate-400 font-mono tabular-nums hidden md:block">
          {currentTime.toLocaleTimeString()}
        </div>
      </div>
    </header>
  );
}
