import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import type { DailyAnalytics } from "../../types";

interface UptimeChartProps {
  data: DailyAnalytics[];
  height?: number;
}

export default function UptimeChart({ data, height = 250 }: UptimeChartProps) {
  const chartData = data.map((d) => ({
    date: new Date(d.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    downtime: d.downtime_minutes,
    outages: d.outage_count,
  }));

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[250px] text-slate-500 text-sm">
        No analytics data available yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
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
          label={{
            value: "min",
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
          formatter={(value: unknown, name: unknown) => {
            if (name === "downtime") return [`${Number(value).toFixed(1)} min`, "Downtime"];
            return [`${value}`, `${name}`];
          }}
        />
        <Bar dataKey="downtime" name="downtime" radius={[4, 4, 0, 0]} maxBarSize={30}>
          {chartData.map((entry, index) => (
            <Cell
              key={index}
              fill={entry.downtime > 10 ? "#ef4444" : entry.downtime > 0 ? "#f59e0b" : "#10b981"}
              opacity={0.8}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
