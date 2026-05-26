import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { ChartContainer } from "./ChartContainer";
import {
  chartColors,
  tooltipStyle,
  axisDefaults,
  gridDefaults,
  chartMargin,
  yAxisLabel,
} from "./chartConfig";
import type { HourlyAnalytics } from "../../types";

interface PacketLossChartProps {
  data: HourlyAnalytics[];
  height?: number;
}

export default function PacketLossChart({ data, height = 250 }: PacketLossChartProps) {
  const chartData = useMemo(
    () =>
      data.map((d) => ({
        hour: d.hour.split(" ")[1] || d.hour,
        packetLoss: d.avg_packet_loss ?? 0,
        ping: d.avg_ping ?? 0,
      })),
    [data]
  );

  return (
    <ChartContainer
      height={height}
      isEmpty={chartData.length === 0}
      emptyMessage="No hourly data available yet"
      aria-label="Hourly packet loss area chart"
    >
      <AreaChart data={chartData} margin={chartMargin}>
        <defs>
          <linearGradient id="packetLossGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={chartColors.red} stopOpacity={0.3} />
            <stop offset="95%" stopColor={chartColors.red} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid {...gridDefaults} />
        <XAxis dataKey="hour" {...axisDefaults} fontSize={10} />
        <YAxis {...axisDefaults} label={yAxisLabel("%")} />
        <Tooltip
          {...tooltipStyle}
          formatter={(value: unknown) => [`${Number(value).toFixed(2)}%`, "Packet Loss"]}
        />
        <Area
          type="monotone"
          dataKey="packetLoss"
          stroke={chartColors.red}
          strokeWidth={2}
          fill="url(#packetLossGradient)"
          activeDot={{ r: 4, fill: chartColors.red }}
        />
      </AreaChart>
    </ChartContainer>
  );
}
