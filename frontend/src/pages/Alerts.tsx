import { useEffect, useState, useCallback } from "react";
import { CheckCheck } from "lucide-react";
import AlertItem from "../components/shared/AlertItem";
import LoadingSpinner from "../components/shared/LoadingSpinner";
import { useMonitorStore } from "../store/monitorStore";
import {
  getAlerts,
  markAlertRead,
  markAllAlertsRead,
  deleteAlert,
  getUnreadAlertCount,
} from "../services/api";
import type { Alert } from "../types";

type FilterType = "all" | "unread" | "critical" | "warning";

export default function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filter, setFilter] = useState<FilterType>("all");
  const [loading, setLoading] = useState(true);
  const { setUnreadAlertCount } = useMonitorStore();

  const fetchAlerts = useCallback(async () => {
    try {
      const data = await getAlerts(200, filter === "unread");
      setAlerts(data);
      const count = await getUnreadAlertCount();
      setUnreadAlertCount(count);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [filter, setUnreadAlertCount]);

  useEffect(() => {
    setLoading(true);
    fetchAlerts();
  }, [fetchAlerts]);

  const handleMarkRead = async (id: number) => {
    await markAlertRead(id);
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, is_read: true } : a))
    );
    const count = await getUnreadAlertCount();
    setUnreadAlertCount(count);
  };

  const handleDelete = async (id: number) => {
    await deleteAlert(id);
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    const count = await getUnreadAlertCount();
    setUnreadAlertCount(count);
  };

  const handleMarkAllRead = async () => {
    await markAllAlertsRead();
    setAlerts((prev) => prev.map((a) => ({ ...a, is_read: true })));
    setUnreadAlertCount(0);
  };

  const filteredAlerts = alerts.filter((a) => {
    if (filter === "critical") return a.severity === "critical";
    if (filter === "warning") return a.severity === "warning";
    return true; // "all" and "unread" are handled in the API call
  });

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {(["all", "unread", "critical", "warning"] as FilterType[]).map(
            (f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                  filter === f
                    ? f === "critical"
                      ? "bg-accent-red/10 text-accent-red border border-accent-red/20"
                      : f === "warning"
                      ? "bg-accent-amber/10 text-accent-amber border border-accent-amber/20"
                      : "bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20"
                    : "bg-bg-secondary text-slate-400 border border-white/[0.07] hover:text-white hover:bg-white/5"
                }`}
              >
                {f}
              </button>
            )
          )}
        </div>

        <button
          onClick={handleMarkAllRead}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-bg-secondary text-slate-400 border border-white/[0.07] hover:text-white hover:bg-white/5 transition-all"
        >
          <CheckCheck className="w-4 h-4" />
          Mark all read
        </button>
      </div>

      {/* Alert List */}
      {filteredAlerts.length > 0 ? (
        <div className="space-y-2">
          {filteredAlerts.map((alert) => (
            <AlertItem
              key={alert.id}
              alert={alert}
              onMarkRead={handleMarkRead}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="card flex items-center justify-center h-48 text-slate-500">
          No {filter !== "all" ? filter : ""} alerts found
        </div>
      )}
    </div>
  );
}
