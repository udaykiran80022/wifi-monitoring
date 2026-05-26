import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  BarChart3,
  Clock,
  Bell,
  Settings,
  Monitor,
  Wifi,
  PanelLeftClose,
  PanelLeft,
  X,
} from "lucide-react";
import { useMonitorStore } from "../../store/monitorStore";
import { useSidebar } from "./SidebarContext";
import { cn } from "../../lib/utils";
import { AnimatePresence, motion } from "framer-motion";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/analytics", icon: BarChart3, label: "Analytics" },
  { to: "/downtime", icon: Clock, label: "Downtime" },
  { to: "/alerts", icon: Bell, label: "Alerts" },
  { to: "/settings", icon: Settings, label: "Settings" },
  { to: "/system-info", icon: Monitor, label: "System Info" },
];

export default function Sidebar() {
  const location = useLocation();
  const unreadAlertCount = useMonitorStore((s) => s.unreadAlertCount);
  const wsConnected = useMonitorStore((s) => s.wsConnected);
  const { isOpen, isCollapsed, isMobile, toggle, setOpen } = useSidebar();

  const sidebarContent = (
    <aside
      className={cn(
        "h-full bg-bg-secondary border-r border-white/[0.07] flex flex-col z-50",
        isMobile
          ? "w-[280px]"
          : isCollapsed
          ? "w-16"
          : "w-60"
      )}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Logo */}
      <div className="h-16 flex items-center gap-3 px-4 border-b border-white/[0.07] shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-cyan to-accent-emerald flex items-center justify-center shrink-0">
          <Wifi className="w-4 h-4 text-bg-primary" />
        </div>
        {(!isCollapsed || isMobile) && (
          <div className="overflow-hidden">
            <h1 className="text-sm font-semibold text-white tracking-tight whitespace-nowrap">
              WiFi Monitor
            </h1>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
              v1.0
            </p>
          </div>
        )}

        {/* Mobile close button */}
        {isMobile && (
          <button
            onClick={() => setOpen(false)}
            className="ml-auto p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname === to;
          return (
            <NavLink
              key={to}
              to={to}
              onClick={() => isMobile && setOpen(false)}
              aria-current={isActive ? "page" : undefined}
              title={isCollapsed && !isMobile ? label : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg text-sm font-medium transition-all duration-200 group relative",
                isCollapsed && !isMobile
                  ? "px-0 py-2.5 justify-center"
                  : "px-3 py-2.5",
                isActive
                  ? "bg-accent-cyan/10 text-accent-cyan"
                  : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-accent-cyan rounded-r" />
              )}
              <Icon className="w-[18px] h-[18px] shrink-0" />
              {(!isCollapsed || isMobile) && <span>{label}</span>}
              {label === "Alerts" && unreadAlertCount > 0 && (
                <span
                  className={cn(
                    "bg-accent-red text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1",
                    isCollapsed && !isMobile
                      ? "absolute -top-0.5 -right-0.5 scale-90"
                      : "ml-auto"
                  )}
                >
                  {unreadAlertCount > 99 ? "99+" : unreadAlertCount}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-3 py-3 border-t border-white/[0.07] space-y-2 shrink-0">
        {/* Connection Status */}
        <div
          className={cn(
            "flex items-center gap-2",
            isCollapsed && !isMobile && "justify-center"
          )}
          role="status"
          aria-label={wsConnected ? "Live connection active" : "Reconnecting to server"}
        >
          <div
            className={cn(
              "w-2 h-2 rounded-full shrink-0",
              wsConnected
                ? "bg-accent-emerald status-dot-connected"
                : "bg-accent-red status-dot-disconnected"
            )}
          />
          {(!isCollapsed || isMobile) && (
            <span className="text-xs text-slate-500">
              {wsConnected ? "Live" : "Reconnecting..."}
            </span>
          )}
        </div>

        {/* Collapse toggle (desktop only) */}
        {!isMobile && (
          <button
            onClick={toggle}
            className="w-full flex items-center justify-center gap-2 px-2 py-1.5 rounded-md text-slate-500 hover:text-slate-300 hover:bg-white/[0.04] transition-colors text-xs"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <PanelLeft className="w-4 h-4" />
            ) : (
              <>
                <PanelLeftClose className="w-4 h-4" />
                <span>Collapse</span>
              </>
            )}
          </button>
        )}
      </div>
    </aside>
  );

  // Mobile: render as a slide-in drawer with backdrop
  if (isMobile) {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 h-full z-50"
            >
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  // Desktop/Tablet: fixed sidebar
  return (
    <div
      className={cn(
        "fixed left-0 top-0 h-full z-50 transition-all duration-300",
        isCollapsed ? "w-16" : "w-60"
      )}
    >
      {sidebarContent}
    </div>
  );
}
