import { useEffect, useState } from "react";
import { Shield } from "lucide-react";
import { getUptime } from "../../services/api";

export default function UptimeCard() {
  const [uptime, setUptime] = useState<number | null>(null);
  const [totalChecks, setTotalChecks] = useState(0);

  useEffect(() => {
    const fetchUptime = async () => {
      try {
        const data = await getUptime(24);
        setUptime(data.uptime_percent);
        setTotalChecks(data.total_checks);
      } catch {
        // ignore
      }
    };

    fetchUptime();
    const interval = setInterval(fetchUptime, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const getUptimeColor = () => {
    if (uptime == null) return "text-slate-400";
    if (uptime >= 99.5) return "text-accent-emerald";
    if (uptime >= 95) return "text-accent-cyan";
    if (uptime >= 90) return "text-accent-amber";
    return "text-accent-red";
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
          Uptime (24h)
        </p>
        <div className="p-1.5 rounded-md bg-accent-purple/10 text-accent-purple">
          <Shield className="w-3.5 h-3.5" />
        </div>
      </div>

      <div className="flex items-end gap-1">
        <span className={`number-value text-2xl ${getUptimeColor()}`}>
          {uptime != null ? uptime.toFixed(2) : "—"}
        </span>
        <span className="text-xs text-slate-500 mb-0.5">%</span>
      </div>

      {totalChecks > 0 && (
        <div className="mt-3">
          <div className="w-full bg-white/5 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full transition-all duration-500 ${
                (uptime ?? 0) >= 99 ? "bg-accent-emerald" :
                (uptime ?? 0) >= 95 ? "bg-accent-cyan" :
                (uptime ?? 0) >= 90 ? "bg-accent-amber" : "bg-accent-red"
              }`}
              style={{ width: `${Math.min(uptime ?? 0, 100)}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-600 mt-1">
            {totalChecks.toLocaleString()} checks
          </p>
        </div>
      )}
    </div>
  );
}
