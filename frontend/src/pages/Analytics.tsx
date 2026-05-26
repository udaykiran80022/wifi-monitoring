import { useEffect, useState } from "react";
import SpeedChart from "../components/charts/SpeedChart";
import UptimeChart from "../components/charts/UptimeChart";
import PacketLossChart from "../components/charts/PacketLossChart";
import HeatmapChart from "../components/charts/HeatmapChart";
import Skeleton from "../components/shared/Skeleton";
import { Download } from "lucide-react";
import {
  getSpeedHistory,
  getDailyAnalytics,
  getHourlyAnalytics,
  getSpeedAverages,
  getHeatmap,
} from "../services/api";
import type { SpeedLog, DailyAnalytics, HourlyAnalytics, SpeedAverage, HeatmapData } from "../types";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

type RangeOption = 7 | 30 | 90;

export default function Analytics() {
  const [range, setRange] = useState<RangeOption>(7);
  const [speedHistory, setSpeedHistory] = useState<SpeedLog[]>([]);
  const [dailyAnalytics, setDailyAnalytics] = useState<DailyAnalytics[]>([]);
  const [hourlyAnalytics, setHourlyAnalytics] = useState<HourlyAnalytics[]>([]);
  const [speedAverages, setSpeedAverages] = useState<SpeedAverage[]>([]);
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getSpeedHistory(range),
      getDailyAnalytics(range),
      getHourlyAnalytics(24),
      getSpeedAverages(range),
      getHeatmap(),
    ])
      .then(([speed, daily, hourly, averages, heatmap]) => {
        setSpeedHistory(speed);
        setDailyAnalytics(daily);
        setHourlyAnalytics(hourly);
        setSpeedAverages(averages);
        setHeatmapData(heatmap);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [range]);

  if (loading) return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <Skeleton className="w-16 h-9" />
        <Skeleton className="w-16 h-9" />
        <Skeleton className="w-16 h-9" />
      </div>
      <Skeleton className="w-full h-80" />
      <Skeleton className="w-full h-72" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Skeleton className="w-full h-64" />
        <Skeleton className="w-full h-64" />
      </div>
    </div>
  );

  const avgBarData = speedAverages.map((d) => ({
    date: new Date(d.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    download: d.avg_download ?? 0,
    upload: d.avg_upload ?? 0,
  }));

  return (
    <div className="space-y-6">
      {/* Header & Range Picker */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {([7, 30, 90] as RangeOption[]).map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              range === r
                ? "bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20"
                : "bg-bg-secondary text-slate-400 border border-white/[0.07] hover:text-white hover:bg-white/5"
            }`}
          >
            {r}d
          </button>
        ))}
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/api/export/csv"
            download
            className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition-colors border border-slate-700"
          >
            <Download className="w-4 h-4" /> CSV
          </a>
          <a
            href="/api/export/json"
            download
            className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition-colors border border-slate-700"
          >
            <Download className="w-4 h-4" /> JSON
          </a>
        </div>
      </div>

      {/* Speed History Chart */}
      <div className="card">
        <h3 className="text-sm font-semibold text-white mb-4">
          Speed Test History ({range} days)
        </h3>
        <SpeedChart data={speedHistory} height={320} />
      </div>

      {/* Daily Averages Bar Chart */}
      <div className="card">
        <h3 className="text-sm font-semibold text-white mb-4">
          Daily Speed Averages
        </h3>
        {avgBarData.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={avgBarData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis
                dataKey="date"
                stroke="#475569"
                fontSize={11}
                fontFamily="JetBrains Mono"
                tick={{ fill: "#64748b" }}
              />
              <YAxis
                stroke="#475569"
                fontSize={11}
                fontFamily="JetBrains Mono"
                tick={{ fill: "#64748b" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f1629",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontFamily: "JetBrains Mono",
                }}
                labelStyle={{ color: "#94a3b8" }}
              />
              <Legend wrapperStyle={{ fontSize: "12px", fontFamily: "Inter" }} />
              <Bar
                dataKey="download"
                fill="#00d4ff"
                radius={[4, 4, 0, 0]}
                maxBarSize={25}
                name="Download Avg"
                opacity={0.8}
              />
              <Bar
                dataKey="upload"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
                maxBarSize={25}
                name="Upload Avg"
                opacity={0.8}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[280px] text-slate-500 text-sm">
            No data available
          </div>
        )}
      </div>

      {/* Heatmap */}
      <div className="card">
        <h3 className="text-sm font-semibold text-white mb-4">
          Connection Quality Heatmap (All Time)
        </h3>
        <HeatmapChart data={heatmapData} />
      </div>

      {/* Bottom row: Downtime + Packet Loss */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card">
          <h3 className="text-sm font-semibold text-white mb-4">
            Daily Downtime
          </h3>
          <UptimeChart data={dailyAnalytics} />
        </div>

        <div className="card">
          <h3 className="text-sm font-semibold text-white mb-4">
            Hourly Packet Loss (24h)
          </h3>
          <PacketLossChart data={hourlyAnalytics} />
        </div>
      </div>
    </div>
  );
}
