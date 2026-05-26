import { useEffect, useState } from "react";
import { Clock, AlertTriangle, Timer } from "lucide-react";
import LoadingSpinner from "../components/shared/LoadingSpinner";
import { getDowntimeLogs, getDowntimeSummary } from "../services/api";
import type { DowntimePeriod, DowntimeSummary } from "../types";

export default function Downtime() {
  const [logs, setLogs] = useState<DowntimePeriod[]>([]);
  const [summaryToday, setSummaryToday] = useState<DowntimeSummary | null>(null);
  const [summaryWeek, setSummaryWeek] = useState<DowntimeSummary | null>(null);
  const [summaryMonth, setSummaryMonth] = useState<DowntimeSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getDowntimeLogs(30),
      getDowntimeSummary(1),
      getDowntimeSummary(7),
      getDowntimeSummary(30),
    ])
      .then(([logsData, today, week, month]) => {
        setLogs(logsData);
        setSummaryToday(today);
        setSummaryWeek(week);
        setSummaryMonth(month);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const formatDuration = (minutes: number) => {
    if (minutes < 1) return `${(minutes * 60).toFixed(0)}s`;
    if (minutes < 60) return `${minutes.toFixed(1)}m`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Today", data: summaryToday, icon: Clock },
          { label: "This Week", data: summaryWeek, icon: Timer },
          { label: "This Month", data: summaryMonth, icon: AlertTriangle },
        ].map(({ label, data, icon: Icon }) => (
          <div key={label} className="card">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                {label}
              </p>
              <div className="p-1.5 rounded-md bg-accent-red/10 text-accent-red">
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>
            <p className="number-value text-2xl text-white">
              {data ? formatDuration(data.total_downtime_minutes) : "—"}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {data ? `${data.outage_count} outage${data.outage_count !== 1 ? "s" : ""}` : ""}
            </p>
          </div>
        ))}
      </div>

      {/* Timeline Bar (last 7 days visual) */}
      <div className="card">
        <h3 className="text-sm font-semibold text-white mb-4">Last 7 Days Timeline</h3>
        <div className="space-y-2">
          {Array.from({ length: 7 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (6 - i));
            const dateStr = date.toISOString().split("T")[0];
            const dayLabel = date.toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            });

            // Find outages for this day
            const dayOutages = logs.filter((log) => {
              const start = new Date(log.started_at);
              return start.toISOString().split("T")[0] === dateStr;
            });

            const totalDowntime = dayOutages.reduce(
              (sum, o) => sum + o.duration_minutes,
              0
            );
            const downtimePercent = Math.min((totalDowntime / 1440) * 100, 100);

            return (
              <div key={dateStr} className="flex items-center gap-3">
                <span className="text-xs text-slate-500 w-28 shrink-0 font-mono">
                  {dayLabel}
                </span>
                <div className="flex-1 h-5 bg-accent-emerald/20 rounded overflow-hidden relative">
                  {downtimePercent > 0 && (
                    <div
                      className="absolute right-0 top-0 h-full bg-accent-red/60 rounded-r"
                      style={{ width: `${downtimePercent}%` }}
                    />
                  )}
                </div>
                <span className="text-[10px] text-slate-500 w-16 text-right font-mono">
                  {totalDowntime > 0 ? formatDuration(totalDowntime) : "0s"}
                </span>
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-4 mt-3 text-[10px] text-slate-600">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-sm bg-accent-emerald/20" />
            Uptime
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-sm bg-accent-red/60" />
            Downtime
          </div>
        </div>
      </div>

      {/* Outage Log Table */}
      <div className="card">
        <h3 className="text-sm font-semibold text-white mb-4">
          Outage History (30 days)
        </h3>

        {logs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.07]">
                  <th className="text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider pb-3 pr-4">
                    Started
                  </th>
                  <th className="text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider pb-3 pr-4">
                    Ended
                  </th>
                  <th className="text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider pb-3">
                    Duration
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {logs.map((log, index) => (
                  <tr key={index} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 pr-4 text-sm text-slate-300 font-mono">
                      {new Date(log.started_at).toLocaleString()}
                    </td>
                    <td className="py-3 pr-4 text-sm text-slate-300 font-mono">
                      {log.ended_at
                        ? new Date(log.ended_at).toLocaleString()
                        : (
                          <span className="text-accent-red font-semibold">
                            Ongoing
                          </span>
                        )}
                    </td>
                    <td className="py-3 text-sm font-mono">
                      <span
                        className={`${
                          log.duration_minutes > 30
                            ? "text-accent-red"
                            : log.duration_minutes > 5
                            ? "text-accent-amber"
                            : "text-slate-300"
                        }`}
                      >
                        {formatDuration(log.duration_minutes)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex items-center justify-center h-32 text-slate-500 text-sm">
            No outages recorded — excellent! 🎉
          </div>
        )}
      </div>
    </div>
  );
}
