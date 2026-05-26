import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import type { SpeedLog } from "../../types";

interface SpeedChartProps {
  data: SpeedLog[];
  height?: number;
}

export default function SpeedChart({ data, height = 300 }: SpeedChartProps) {
  const chartData = data
    .map((d) => ({
      time: new Date(d.timestamp).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      download: d.download_mbps,
      upload: d.upload_mbps,
    }))
    .reverse();

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-slate-500 text-sm">
        No speed test data available yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
        <XAxis
          dataKey="time"
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
          label={{
            value: "Mbps",
            angle: -90,
            position: "insideLeft",
            fill: "#64748b",
            fontSize: 11,
          }}
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
        <Legend
          wrapperStyle={{ fontSize: "12px", fontFamily: "Inter" }}
        />
        <Line
          type="monotone"
          dataKey="download"
          stroke="#00d4ff"
          strokeWidth={2}
          dot={{ r: 3, fill: "#00d4ff" }}
          activeDot={{ r: 5, fill: "#00d4ff" }}
          name="Download"
        />
        <Line
          type="monotone"
          dataKey="upload"
          stroke="#10b981"
          strokeWidth={2}
          dot={{ r: 3, fill: "#10b981" }}
          activeDot={{ r: 5, fill: "#10b981" }}
          name="Upload"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
