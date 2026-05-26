import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import type { HourlyAnalytics } from "../../types";

interface PacketLossChartProps {
  data: HourlyAnalytics[];
  height?: number;
}

export default function PacketLossChart({ data, height = 250 }: PacketLossChartProps) {
  const chartData = data.map((d) => ({
    hour: d.hour.split(" ")[1] || d.hour,
    packetLoss: d.avg_packet_loss ?? 0,
    ping: d.avg_ping ?? 0,
  }));

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[250px] text-slate-500 text-sm">
        No hourly data available yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <defs>
          <linearGradient id="packetLossGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
        <XAxis
          dataKey="hour"
          stroke="#475569"
          fontSize={10}
          fontFamily="JetBrains Mono"
          tick={{ fill: "#64748b" }}
        />
        <YAxis
          stroke="#475569"
          fontSize={11}
          fontFamily="JetBrains Mono"
          tick={{ fill: "#64748b" }}
          label={{
            value: "%",
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
          formatter={(value: unknown) => [`${Number(value).toFixed(2)}%`, "Packet Loss"]}
        />
        <Area
          type="monotone"
          dataKey="packetLoss"
          stroke="#ef4444"
          strokeWidth={2}
          fill="url(#packetLossGradient)"
          activeDot={{ r: 4, fill: "#ef4444" }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
