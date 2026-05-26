export interface StatusLog {
  id: number;
  timestamp: string;
  is_connected: boolean;
  ping_ms: number | null;
  packet_loss: number | null;
  wifi_ssid: string | null;
  wifi_signal: number | null;
  local_ip: string | null;
  public_ip: string | null;
}

export interface SpeedLog {
  id: number;
  timestamp: string;
  download_mbps: number;
  upload_mbps: number;
  ping_ms: number;
  server_name: string | null;
  server_location: string | null;
  result_url: string | null;
}

export interface Alert {
  id: number;
  timestamp: string;
  alert_type: string;
  message: string;
  severity: "info" | "warning" | "critical";
  is_read: boolean;
}

export interface DowntimePeriod {
  started_at: string;
  ended_at: string | null;
  duration_minutes: number;
}

export interface DowntimeSummary {
  days: number;
  total_downtime_minutes: number;
  outage_count: number;
}

export interface DailyAnalytics {
  date: string;
  avg_download: number | null;
  avg_upload: number | null;
  avg_ping: number | null;
  downtime_minutes: number;
  outage_count: number;
}

export interface HourlyAnalytics {
  hour: string;
  avg_ping: number | null;
  avg_packet_loss: number | null;
  check_count: number;
}

export interface MonitorSettings {
  low_download_mbps: number;
  low_upload_mbps: number;
  high_ping_ms: number;
  high_packet_loss_pct: number;
  ping_interval_sec: number;
  speed_test_interval_sec: number;
  updated_at: string | null;
}

export interface LiveData {
  type: "status_update" | "speed_update" | "alert";
  timestamp: string;
  // status_update fields
  is_connected?: boolean;
  ping_ms?: number | null;
  packet_loss?: number | null;
  wifi_ssid?: string | null;
  wifi_signal?: number | null;
  local_ip?: string | null;
  public_ip?: string | null;
  // speed_update fields
  download_mbps?: number;
  upload_mbps?: number;
  server_name?: string | null;
  server_location?: string | null;
  // alert fields
  id?: number;
  alert_type?: string;
  message?: string;
  severity?: "info" | "warning" | "critical";
  is_read?: boolean;
}

export interface UptimeInfo {
  hours: number;
  total_checks: number;
  connected_checks: number;
  uptime_percent: number;
}

export interface SpeedAverage {
  date: string;
  avg_download: number | null;
  avg_upload: number | null;
  avg_ping: number | null;
}
