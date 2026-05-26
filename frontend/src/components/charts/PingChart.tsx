import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

interface PingChartProps {
  data: Array<{ time: string; ping: number }>;
  height?: number;
}

export default function PingChart({ data, height = 250 }: PingChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[250px] text-slate-500 text-sm">
        Collecting ping data...
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
        <XAxis
          dataKey="time"
          stroke="#475569"
          fontSize={10}
          fontFamily="JetBrains Mono"
          tick={{ fill: "#64748b" }}
          interval="preserveStartEnd"
          minTickGap={20}
        />
        <YAxis
          stroke="#475569"
          fontSize={11}
          fontFamily="JetBrains Mono"
          tick={{ fill: "#64748b" }}
          label={{
            value: "ms",
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
          formatter={(value: unknown) => [`${value}ms`, "Ping"]}
        />
        <Line
          type="monotone"
          dataKey="ping"
          stroke="#f59e0b"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: "#f59e0b" }}
          isAnimationActive={false}
          connectNulls={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
