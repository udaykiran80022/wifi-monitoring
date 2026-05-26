import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  BarChart3,
  Clock,
  Bell,
  Settings,
  Monitor,
  Wifi,
} from "lucide-react";
import { useMonitorStore } from "../../store/monitorStore";

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
  const { unreadAlertCount, wsConnected } = useMonitorStore();

  return (
    <aside className="fixed left-0 top-0 h-full w-[240px] bg-bg-secondary border-r border-white/[0.07] flex flex-col z-50">
      {/* Logo */}
      <div className="h-16 flex items-center gap-3 px-5 border-b border-white/[0.07]">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-cyan to-accent-emerald flex items-center justify-center">
          <Wifi className="w-4 h-4 text-bg-primary" />
        </div>
        <div>
          <h1 className="text-sm font-semibold text-white tracking-tight">WiFi Monitor</h1>
          <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">v1.0</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname === to;
          return (
            <NavLink
              key={to}
              to={to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative ${
                isActive
                  ? "bg-accent-cyan/10 text-accent-cyan"
                  : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-accent-cyan rounded-r" />
              )}
              <Icon className="w-[18px] h-[18px]" />
              <span>{label}</span>
              {label === "Alerts" && unreadAlertCount > 0 && (
                <span className="ml-auto bg-accent-red text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1">
                  {unreadAlertCount > 99 ? "99+" : unreadAlertCount}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Connection Status */}
      <div className="px-4 py-4 border-t border-white/[0.07]">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              wsConnected
                ? "bg-accent-emerald status-dot-connected"
                : "bg-accent-red status-dot-disconnected"
            }`}
          />
          <span className="text-xs text-slate-500">
            {wsConnected ? "Live" : "Reconnecting..."}
          </span>
        </div>
      </div>
    </aside>
  );
}
