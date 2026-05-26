import axios from "axios";
import type {
  StatusLog,
  SpeedLog,
  Alert,
  DowntimePeriod,
  DowntimeSummary,
  DailyAnalytics,
  HourlyAnalytics,
  MonitorSettings,
  UptimeInfo,
  SpeedAverage,
} from "../types";

const api = axios.create({
  baseURL: "/api",
  timeout: 15000,
});

// --- Status ---

export async function getCurrentStatus(): Promise<StatusLog | null> {
  const { data } = await api.get<StatusLog | null>("/status/current");
  return data;
}

export async function getStatusHistory(hours = 24): Promise<StatusLog[]> {
  const { data } = await api.get<StatusLog[]>("/status/history", {
    params: { hours },
  });
  return data;
}

export async function getUptime(hours = 24): Promise<UptimeInfo> {
  const { data } = await api.get<UptimeInfo>("/status/uptime", {
    params: { hours },
  });
  return data;
}

// --- Speed ---

export async function getLatestSpeed(): Promise<SpeedLog | null> {
  const { data } = await api.get<SpeedLog | null>("/speed/latest");
  return data;
}

export async function getSpeedHistory(days = 7): Promise<SpeedLog[]> {
  const { data } = await api.get<SpeedLog[]>("/speed/history", {
    params: { days },
  });
  return data;
}

export async function getSpeedAverages(days = 7): Promise<SpeedAverage[]> {
  const { data } = await api.get<SpeedAverage[]>("/speed/averages", {
    params: { days },
  });
  return data;
}

// --- Alerts ---

export async function getAlerts(
  limit = 50,
  unreadOnly = false
): Promise<Alert[]> {
  const { data } = await api.get<Alert[]>("/alerts", {
    params: { limit, unread_only: unreadOnly },
  });
  return data;
}

export async function getUnreadAlertCount(): Promise<number> {
  const { data } = await api.get<{ unread_count: number }>("/alerts/count");
  return data.unread_count;
}

export async function markAlertRead(id: number): Promise<void> {
  await api.post(`/alerts/${id}/read`);
}

export async function markAllAlertsRead(): Promise<void> {
  await api.post("/alerts/read-all");
}

export async function deleteAlert(id: number): Promise<void> {
  await api.delete(`/alerts/${id}`);
}

// --- Downtime ---

export async function getDowntimeLogs(days = 30): Promise<DowntimePeriod[]> {
  const { data } = await api.get<DowntimePeriod[]>("/downtime/logs", {
    params: { days },
  });
  return data;
}

export async function getDowntimeSummary(days = 30): Promise<DowntimeSummary> {
  const { data } = await api.get<DowntimeSummary>("/downtime/summary", {
    params: { days },
  });
  return data;
}

// --- Analytics ---

export async function getDailyAnalytics(
  days = 30
): Promise<DailyAnalytics[]> {
  const { data } = await api.get<DailyAnalytics[]>("/analytics/daily", {
    params: { days },
  });
  return data;
}

export async function getHourlyAnalytics(
  hours = 24
): Promise<HourlyAnalytics[]> {
  const { data } = await api.get<HourlyAnalytics[]>("/analytics/hourly", {
    params: { hours },
  });
  return data;
}

// --- Settings ---

export async function getSettings(): Promise<MonitorSettings> {
  const { data } = await api.get<MonitorSettings>("/settings");
  return data;
}

export async function updateSettings(
  settings: Partial<MonitorSettings>
): Promise<MonitorSettings> {
  const { data } = await api.put<MonitorSettings>("/settings", settings);
  return data;
}
