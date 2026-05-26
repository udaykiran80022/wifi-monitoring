import { create } from "zustand";
import type { LiveData, SpeedLog } from "../types";

interface PingEntry {
  time: string;
  ping: number | null;
}

interface MonitorState {
  // Live status
  isConnected: boolean | null;
  pingMs: number | null;
  packetLoss: number | null;
  wifiSsid: string | null;
  wifiSignal: number | null;
  localIp: string | null;
  publicIp: string | null;

  // Speed
  latestSpeed: SpeedLog | null;
  downloadMbps: number | null;
  uploadMbps: number | null;

  // Alerts
  unreadAlertCount: number;

  // History (for real-time chart)
  pingHistory: PingEntry[];

  // WebSocket status
  wsConnected: boolean;

  // Actions
  setLiveData: (data: LiveData) => void;
  setLatestSpeed: (speed: SpeedLog | null) => void;
  setUnreadAlertCount: (count: number) => void;
  incrementUnreadAlertCount: () => void;
  setWsConnected: (connected: boolean) => void;
}

export const useMonitorStore = create<MonitorState>((set) => ({
  isConnected: null,
  pingMs: null,
  packetLoss: null,
  wifiSsid: null,
  wifiSignal: null,
  localIp: null,
  publicIp: null,
  latestSpeed: null,
  downloadMbps: null,
  uploadMbps: null,
  unreadAlertCount: 0,
  pingHistory: [],
  wsConnected: false,

  setLiveData: (data) =>
    set((state) => {
      if (data.type === "status_update") {
        const newPingEntry = {
          time: new Date(data.timestamp).toLocaleTimeString(),
          ping: data.ping_ms ?? null,
        };

        return {
          isConnected: data.is_connected ?? state.isConnected,
          pingMs: data.ping_ms ?? null,
          packetLoss: data.packet_loss ?? null,
          wifiSsid: data.wifi_ssid ?? state.wifiSsid,
          wifiSignal: data.wifi_signal ?? state.wifiSignal,
          localIp: data.local_ip ?? state.localIp,
          publicIp: data.public_ip ?? state.publicIp,
          pingHistory: newPingEntry
            ? [...state.pingHistory.slice(-59), newPingEntry]
            : state.pingHistory,
        };
      }

      if (data.type === "speed_update") {
        return {
          downloadMbps: data.download_mbps ?? state.downloadMbps,
          uploadMbps: data.upload_mbps ?? state.uploadMbps,
          latestSpeed: {
            id: 0,
            timestamp: data.timestamp,
            download_mbps: data.download_mbps!,
            upload_mbps: data.upload_mbps!,
            ping_ms: data.ping_ms ?? 0,
            server_name: data.server_name ?? null,
            server_location: data.server_location ?? null,
            result_url: null,
          },
        };
      }

      if (data.type === "alert") {
        return {
          unreadAlertCount: state.unreadAlertCount + 1,
        };
      }

      return {};
    }),

  setLatestSpeed: (speed) =>
    set({
      latestSpeed: speed,
      downloadMbps: speed?.download_mbps ?? null,
      uploadMbps: speed?.upload_mbps ?? null,
    }),

  setUnreadAlertCount: (count) => set({ unreadAlertCount: count }),
  incrementUnreadAlertCount: () =>
    set((state) => ({ unreadAlertCount: state.unreadAlertCount + 1 })),
  setWsConnected: (connected) => set({ wsConnected: connected }),
}));
