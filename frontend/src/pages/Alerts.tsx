import { useState, useMemo, useCallback } from "react";
import { CheckCheck, Search, ChevronLeft, ChevronRight, SortDesc } from "lucide-react";
import AlertItem from "../components/shared/AlertItem";
import { LoadingState } from "../components/ui/LoadingState";
import { EmptyState } from "../components/ui/EmptyState";
import { ErrorBanner } from "../components/ui/ErrorBanner";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Bell } from "lucide-react";
import {
  useAlerts,
  useMarkAlertRead,
  useMarkAllAlertsRead,
  useDeleteAlert,
} from "../hooks/queries";

type FilterType = "all" | "unread" | "critical" | "warning" | "info";
type SortType = "newest" | "oldest" | "severity";

const PAGE_SIZE = 20;

const severityOrder: Record<string, number> = {
  critical: 0,
  warning: 1,
  info: 2,
};

export default function Alerts() {
  const [filter, setFilter] = useState<FilterType>("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortType>("newest");
  const [page, setPage] = useState(0);

  const { data: alerts = [], isLoading, error, refetch } = useAlerts(200, filter === "unread");
  const markReadMutation = useMarkAlertRead();
  const markAllReadMutation = useMarkAllAlertsRead();
  const deleteMutation = useDeleteAlert();

  // Filter alerts
  const filteredAlerts = useMemo(() => {
    let result = alerts;

    // Apply severity filter
    if (filter === "critical") result = result.filter((a) => a.severity === "critical");
    else if (filter === "warning") result = result.filter((a) => a.severity === "warning");
    else if (filter === "info") result = result.filter((a) => a.severity === "info");

    // Apply search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (a) =>
          a.message.toLowerCase().includes(q) ||
          a.alert_type.toLowerCase().includes(q)
      );
    }

    // Apply sort
    return [...result].sort((a, b) => {
      if (sort === "oldest") {
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      }
      if (sort === "severity") {
        return (severityOrder[a.severity] ?? 99) - (severityOrder[b.severity] ?? 99);
      }
      // newest first (default)
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
  }, [alerts, filter, search, sort]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredAlerts.length / PAGE_SIZE));
  const paginatedAlerts = filteredAlerts.slice(
    page * PAGE_SIZE,
    (page + 1) * PAGE_SIZE
  );

  // Reset page when filters change
  const handleFilterChange = useCallback((f: FilterType) => {
    setFilter(f);
    setPage(0);
  }, []);

  // Filter counts
  const counts = useMemo(() => {
    return {
      all: alerts.length,
      unread: alerts.filter((a) => !a.is_read).length,
      critical: alerts.filter((a) => a.severity === "critical").length,
      warning: alerts.filter((a) => a.severity === "warning").length,
      info: alerts.filter((a) => a.severity === "info").length,
    };
  }, [alerts]);

  const handleMarkRead = async (id: number) => {
    markReadMutation.mutate(id);
  };

  const handleDelete = async (id: number) => {
    deleteMutation.mutate(id);
  };

  const handleMarkAllRead = async () => {
    markAllReadMutation.mutate(undefined);
  };

  if (isLoading) return <LoadingState variant="list" count={8} />;

  if (error) {
    return (
      <ErrorBanner
        error="Failed to load alerts"
        onRetry={() => refetch()}
      />
    );
  }

  const filterChips: Array<{ key: FilterType; label: string; variant: "info" | "danger" | "warning" | "neutral" | "success" }> = [
    { key: "all", label: `All (${counts.all})`, variant: "info" },
    { key: "unread", label: `Unread (${counts.unread})`, variant: "info" },
    { key: "critical", label: `Critical (${counts.critical})`, variant: "danger" },
    { key: "warning", label: `Warning (${counts.warning})`, variant: "warning" },
    { key: "info", label: `Info (${counts.info})`, variant: "neutral" },
  ];

  return (
    <div className="space-y-4">
      {/* Top bar: Filters + Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        {/* Filter chips */}
        <div className="flex items-center gap-2 flex-wrap flex-1">
          {filterChips.map(({ key, label, variant }) => (
            <button
              key={key}
              onClick={() => handleFilterChange(key)}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50 rounded-full"
            >
              <Badge
                variant={filter === key ? variant : "neutral"}
                size="md"
                className={`cursor-pointer transition-all ${
                  filter === key ? "ring-1 ring-white/10" : "opacity-70 hover:opacity-100"
                }`}
              >
                {label}
              </Badge>
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleMarkAllRead}
            disabled={counts.unread === 0}
            loading={markAllReadMutation.isPending}
          >
            <CheckCheck className="w-4 h-4" />
            <span className="hidden sm:inline">Mark all read</span>
          </Button>
        </div>
      </div>

      {/* Search + Sort */}
      <div className="flex flex-col sm:flex-row gap-2">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="search"
            placeholder="Search alerts..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            className="w-full bg-bg-secondary border border-white/[0.07] rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-accent-cyan/30 focus:ring-1 focus:ring-accent-cyan/10 transition-all"
            aria-label="Search alerts by message or type"
          />
        </div>

        {/* Sort */}
        <div className="flex items-center gap-1">
          {(["newest", "oldest", "severity"] as SortType[]).map((s) => (
            <Button
              key={s}
              variant={sort === s ? "primary" : "ghost"}
              size="sm"
              onClick={() => setSort(s)}
            >
              {s === "severity" && <SortDesc className="w-3.5 h-3.5" />}
              <span className="capitalize">{s}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Alert List */}
      {paginatedAlerts.length > 0 ? (
        <div className="space-y-2">
          {paginatedAlerts.map((alert) => (
            <AlertItem
              key={alert.id}
              alert={alert}
              onMarkRead={handleMarkRead}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Bell className="w-12 h-12" />}
          title={search ? "No matching alerts" : `No ${filter !== "all" ? filter : ""} alerts found`}
          description={
            search
              ? "Try adjusting your search terms"
              : "All clear — your network is running smoothly!"
          }
          className="card"
        />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-slate-500">
            Showing {page * PAGE_SIZE + 1}–
            {Math.min((page + 1) * PAGE_SIZE, filteredAlerts.length)} of{" "}
            {filteredAlerts.length}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-xs text-slate-400 px-2 tabular-nums font-mono">
              {page + 1} / {totalPages}
            </span>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
