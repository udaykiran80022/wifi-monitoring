import { useEffect, useState } from "react";
import { useMonitorStore } from "../store/monitorStore";
import StatusCard from "../components/cards/StatusCard";
import SpeedCard from "../components/cards/SpeedCard";
import PingCard from "../components/cards/PingCard";
import UptimeCard from "../components/cards/UptimeCard";
import WifiCard from "../components/cards/WifiCard";
import PingChart from "../components/charts/PingChart";
import AlertItem from "../components/shared/AlertItem";
import { getAlerts, getLatestSpeed } from "../services/api";
import type { Alert, SpeedLog } from "../types";
import { Server, Globe } from "lucide-react";

export default function Dashboard() {
  const { pingHistory, latestSpeed } = useMonitorStore();
  const [recentAlerts, setRecentAlerts] = useState<Alert[]>([]);
  const [lastSpeed, setLastSpeed] = useState<SpeedLog | null>(null);

  useEffect(() => {
    getAlerts(5)
      .then(setRecentAlerts)
      .catch(() => {});
    getLatestSpeed()
      .then(setLastSpeed)
      .catch(() => {});
  }, []);

  // Use WebSocket speed data if available, otherwise REST data
  const speedData = latestSpeed || lastSpeed;

  return (
    <div className="space-y-6">
      {/* Top row: Status cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatusCard />
        <SpeedCard />
        <PingCard />
        <WifiCard />
        <UptimeCard />
      </div>

      {/* Second row: Real-time ping chart */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-white">Real-Time Latency</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Last {pingHistory.length} readings
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <div className="w-2 h-2 rounded-full bg-accent-amber" />
            Ping (ms)
          </div>
        </div>
        <PingChart data={pingHistory} />
      </div>

      {/* Third row: Last speed test + info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Last Speed Test */}
        <div className="card">
          <h3 className="text-sm font-semibold text-white mb-4">Last Speed Test</h3>
          {speedData ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-bg-tertiary rounded-lg p-3 text-center">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Download</p>
                  <p className="number-value text-lg text-accent-cyan">
                    {speedData.download_mbps.toFixed(1)}
                  </p>
                  <p className="text-[10px] text-slate-600">Mbps</p>
                </div>
                <div className="bg-bg-tertiary rounded-lg p-3 text-center">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Upload</p>
                  <p className="number-value text-lg text-accent-emerald">
                    {speedData.upload_mbps.toFixed(1)}
                  </p>
                  <p className="text-[10px] text-slate-600">Mbps</p>
                </div>
                <div className="bg-bg-tertiary rounded-lg p-3 text-center">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Ping</p>
                  <p className="number-value text-lg text-accent-amber">
                    {speedData.ping_ms.toFixed(1)}
                  </p>
                  <p className="text-[10px] text-slate-600">ms</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-500">
                {speedData.server_name && (
                  <div className="flex items-center gap-1.5">
                    <Server className="w-3 h-3" />
                    {speedData.server_name}
                  </div>
                )}
                {speedData.server_location && (
                  <div className="flex items-center gap-1.5">
                    <Globe className="w-3 h-3" />
                    {speedData.server_location}
                  </div>
                )}
              </div>

              <p className="text-[10px] text-slate-600 font-mono">
                {new Date(speedData.timestamp).toLocaleString()}
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 text-slate-500 text-sm">
              No speed test results yet
            </div>
          )}
        </div>

        {/* Recent Alerts */}
        <div className="card">
          <h3 className="text-sm font-semibold text-white mb-4">Recent Alerts</h3>
          {recentAlerts.length > 0 ? (
            <div className="space-y-2">
              {recentAlerts.map((alert) => (
                <AlertItem key={alert.id} alert={alert} compact />
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 text-slate-500 text-sm">
              No alerts — everything looks good! 🎉
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
