import { WifiOff, AlertTriangle, Activity, Wifi, ArrowDown, ArrowUp } from "lucide-react";
import type { Alert } from "../../types";

const alertIcons: Record<string, React.ElementType> = {
  DISCONNECTED: WifiOff,
  RECONNECTED: Wifi,
  HIGH_PING: Activity,
  HIGH_PACKET_LOSS: AlertTriangle,
  LOW_DOWNLOAD: ArrowDown,
  LOW_UPLOAD: ArrowUp,
};

const severityStyles = {
  info: {
    bg: "bg-accent-cyan/5",
    border: "border-accent-cyan/10",
    icon: "text-accent-cyan",
    dot: "bg-accent-cyan",
  },
  warning: {
    bg: "bg-accent-amber/5",
    border: "border-accent-amber/10",
    icon: "text-accent-amber",
    dot: "bg-accent-amber",
  },
  critical: {
    bg: "bg-accent-red/5",
    border: "border-accent-red/10",
    icon: "text-accent-red",
    dot: "bg-accent-red",
  },
};

interface AlertItemProps {
  alert: Alert;
  onMarkRead?: (id: number) => void;
  onDelete?: (id: number) => void;
  compact?: boolean;
}

export default function AlertItem({ alert, onMarkRead, onDelete, compact = false }: AlertItemProps) {
  const Icon = alertIcons[alert.alert_type] || AlertTriangle;
  const style = severityStyles[alert.severity] || severityStyles.info;
  const time = new Date(alert.timestamp).toLocaleString();

  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${style.bg} ${style.border} ${
        !alert.is_read ? "ring-1 ring-white/[0.03]" : "opacity-75"
      }`}
    >
      <div className={`p-1.5 rounded-md ${style.bg} ${style.icon} mt-0.5`}>
        <Icon className="w-4 h-4" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-xs font-semibold text-white uppercase tracking-wider">
            {alert.alert_type.replace(/_/g, " ")}
          </span>
          {!alert.is_read && (
            <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
          )}
        </div>
        <p className="text-sm text-slate-300 leading-relaxed">{alert.message}</p>
        {!compact && (
          <p className="text-[11px] text-slate-500 mt-1 font-mono">{time}</p>
        )}
      </div>

      {!compact && (
        <div className="flex items-center gap-1">
          {!alert.is_read && onMarkRead && (
            <button
              onClick={() => onMarkRead(alert.id)}
              className="text-xs text-slate-500 hover:text-white px-2 py-1 rounded hover:bg-white/5 transition-colors"
            >
              Read
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(alert.id)}
              className="text-xs text-slate-500 hover:text-accent-red px-2 py-1 rounded hover:bg-accent-red/5 transition-colors"
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}
