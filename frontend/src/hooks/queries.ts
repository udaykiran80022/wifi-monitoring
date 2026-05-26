import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAlerts,
  getUnreadAlertCount,
  markAlertRead,
  markAllAlertsRead,
  deleteAlert,
  getSpeedHistory,
  getSpeedAverages,
  getDailyAnalytics,
  getHourlyAnalytics,
  getHeatmap,
  getDowntimeLogs,
  getDowntimeSummary,
  getSettings,
  updateSettings,
  getCurrentStatus,
  getLatestSpeed,
  getUptime,
  getSpeedBaseline,
} from "../services/api";
import { useMonitorStore } from "../store/monitorStore";
import type { MonitorSettings } from "../types";

// ─── Query Keys ───

export const queryKeys = {
  alerts: (limit?: number, unreadOnly?: boolean) =>
    ["alerts", { limit, unreadOnly }] as const,
  unreadAlertCount: ["alerts", "unreadCount"] as const,
  speedHistory: (days: number) => ["speed", "history", days] as const,
  speedAverages: (days: number) => ["speed", "averages", days] as const,
  speedBaseline: ["speed", "baseline"] as const,
  latestSpeed: ["speed", "latest"] as const,
  dailyAnalytics: (days: number) => ["analytics", "daily", days] as const,
  hourlyAnalytics: (hours: number) => ["analytics", "hourly", hours] as const,
  heatmap: ["analytics", "heatmap"] as const,
  downtimeLogs: (days: number) => ["downtime", "logs", days] as const,
  downtimeSummary: (days: number) => ["downtime", "summary", days] as const,
  settings: ["settings"] as const,
  currentStatus: ["status", "current"] as const,
  uptime: (hours: number) => ["status", "uptime", hours] as const,
} as const;

// ─── Helper: sync Zustand unreadAlertCount from server ───

async function syncUnreadCount() {
  try {
    const count = await getUnreadAlertCount();
    useMonitorStore.getState().setUnreadAlertCount(count);
  } catch {
    // Silently fail — the periodic refetch will catch up
  }
}

// ─── Alert Queries ───

export function useAlerts(limit = 50, unreadOnly = false) {
  return useQuery({
    queryKey: queryKeys.alerts(limit, unreadOnly),
    queryFn: () => getAlerts(limit, unreadOnly),
  });
}

export function useUnreadAlertCount() {
  return useQuery({
    queryKey: queryKeys.unreadAlertCount,
    queryFn: getUnreadAlertCount,
    refetchInterval: 30_000, // Sync every 30s to keep badge accurate
  });
}

export function useMarkAlertRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => markAlertRead(id),
    onSuccess: async () => {
      qc.invalidateQueries({ queryKey: ["alerts"] });
      // Sync the Zustand badge count from the server (source of truth)
      await syncUnreadCount();
    },
  });
}

export function useMarkAllAlertsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: markAllAlertsRead,
    onSuccess: async () => {
      qc.invalidateQueries({ queryKey: ["alerts"] });
      // Server says 0 unread now
      useMonitorStore.getState().setUnreadAlertCount(0);
    },
  });
}

export function useDeleteAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteAlert(id),
    onSuccess: async () => {
      qc.invalidateQueries({ queryKey: ["alerts"] });
      // Re-sync count — the deleted alert might have been unread
      await syncUnreadCount();
    },
  });
}

// ─── Speed Queries ───

export function useSpeedHistory(days: number) {
  return useQuery({
    queryKey: queryKeys.speedHistory(days),
    queryFn: () => getSpeedHistory(days),
  });
}

export function useSpeedAverages(days: number) {
  return useQuery({
    queryKey: queryKeys.speedAverages(days),
    queryFn: () => getSpeedAverages(days),
  });
}

export function useSpeedBaseline() {
  return useQuery({
    queryKey: queryKeys.speedBaseline,
    queryFn: getSpeedBaseline,
    staleTime: 5 * 60_000, // Baseline doesn't change often
  });
}

export function useLatestSpeedQuery() {
  return useQuery({
    queryKey: queryKeys.latestSpeed,
    queryFn: getLatestSpeed,
  });
}

// ─── Analytics Queries ───

export function useDailyAnalytics(days: number) {
  return useQuery({
    queryKey: queryKeys.dailyAnalytics(days),
    queryFn: () => getDailyAnalytics(days),
  });
}

export function useHourlyAnalytics(hours = 24) {
  return useQuery({
    queryKey: queryKeys.hourlyAnalytics(hours),
    queryFn: () => getHourlyAnalytics(hours),
  });
}

export function useHeatmap() {
  return useQuery({
    queryKey: queryKeys.heatmap,
    queryFn: getHeatmap,
    staleTime: 5 * 60_000,
  });
}

// ─── Downtime Queries ───

export function useDowntimeLogs(days: number) {
  return useQuery({
    queryKey: queryKeys.downtimeLogs(days),
    queryFn: () => getDowntimeLogs(days),
  });
}

export function useDowntimeSummary(days: number) {
  return useQuery({
    queryKey: queryKeys.downtimeSummary(days),
    queryFn: () => getDowntimeSummary(days),
  });
}

// ─── Settings Queries ───

export function useSettingsQuery() {
  return useQuery({
    queryKey: queryKeys.settings,
    queryFn: getSettings,
  });
}

export function useUpdateSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<MonitorSettings>) => updateSettings(data),
    onSuccess: (data) => {
      qc.setQueryData(queryKeys.settings, data);
    },
  });
}

// ─── Status Queries ───

export function useCurrentStatus() {
  return useQuery({
    queryKey: queryKeys.currentStatus,
    queryFn: getCurrentStatus,
  });
}

export function useUptime(hours = 24) {
  return useQuery({
    queryKey: queryKeys.uptime(hours),
    queryFn: () => getUptime(hours),
    refetchInterval: 60_000,
  });
}
