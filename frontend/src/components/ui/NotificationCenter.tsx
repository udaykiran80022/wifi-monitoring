import { useState, useRef, useEffect } from "react";
import { Bell, X } from "lucide-react";
import { useUnreadAlertCount } from "../../store/monitorStore";
import { useAlerts } from "../../hooks/queries";
import { cn } from "../../lib/utils";
import { Badge } from "./Badge";
import { useNavigate } from "react-router-dom";

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = useUnreadAlertCount();
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Fetch recent alerts only when dropdown is open
  const { data: recentAlerts = [] } = useAlerts(5, false);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  // Close on escape
  useEffect(() => {
    function handleEsc(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }
    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      return () => document.removeEventListener("keydown", handleEsc);
    }
  }, [isOpen]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-accent-red text-white text-[9px] font-bold min-w-[16px] h-[16px] rounded-full flex items-center justify-center px-1">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="absolute right-0 top-full mt-2 w-80 bg-bg-secondary border border-white/[0.07] rounded-xl shadow-xl overflow-hidden z-50 animate-slide-down"
          role="menu"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.07]">
            <h4 className="text-sm font-semibold text-white">Notifications</h4>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded text-slate-400 hover:text-white transition-colors"
              aria-label="Close notifications"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Alert list */}
          <div className="max-h-80 overflow-y-auto">
            {recentAlerts.length > 0 ? (
              recentAlerts.map((alert) => {
                const severityVariant =
                  alert.severity === "critical"
                    ? "danger"
                    : alert.severity === "warning"
                    ? "warning"
                    : "info";
                return (
                  <div
                    key={alert.id}
                    className={cn(
                      "px-4 py-3 border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors cursor-pointer",
                      !alert.is_read && "bg-white/[0.01]"
                    )}
                    onClick={() => {
                      setIsOpen(false);
                      navigate("/alerts");
                    }}
                    role="menuitem"
                  >
                    <div className="flex items-start gap-2">
                      <Badge variant={severityVariant} size="sm" className="mt-0.5 shrink-0">
                        {alert.severity}
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-300 line-clamp-2">
                          {alert.message}
                        </p>
                        <p className="text-[10px] text-slate-600 mt-1 font-mono">
                          {new Date(alert.timestamp).toLocaleString()}
                        </p>
                      </div>
                      {!alert.is_read && (
                        <span className="w-2 h-2 rounded-full bg-accent-cyan shrink-0 mt-1" />
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="px-4 py-8 text-center text-sm text-slate-500">
                No recent alerts
              </div>
            )}
          </div>

          {/* Footer */}
          <button
            onClick={() => {
              setIsOpen(false);
              navigate("/alerts");
            }}
            className="w-full px-4 py-3 text-xs font-medium text-accent-cyan hover:bg-white/[0.02] transition-colors text-center border-t border-white/[0.07]"
            role="menuitem"
          >
            View all alerts →
          </button>
        </div>
      )}
    </div>
  );
}
