import {
  LineChart,
  Line,
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

interface PingChartProps {
  data: Array<{ time: string; ping: number | null }>;
  height?: number;
}

export default function PingChart({ data, height = 250 }: PingChartProps) {
  return (
    <ChartContainer
      height={height}
      isEmpty={data.length === 0}
      emptyMessage="Collecting ping data..."
      aria-label={`Real-time ping latency chart showing ${data.length} data points`}
    >
      <LineChart data={data} margin={chartMargin}>
        <CartesianGrid {...gridDefaults} />
        <XAxis
          dataKey="time"
          {...axisDefaults}
          fontSize={10}
          interval="preserveStartEnd"
          minTickGap={60}
        />
        <YAxis {...axisDefaults} label={yAxisLabel("ms")} />
        <Tooltip
          {...tooltipStyle}
          formatter={(value: unknown) => [`${value}ms`, "Ping"]}
        />
        <Line
          type="monotone"
          dataKey="ping"
          stroke={chartColors.amber}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: chartColors.amber }}
          isAnimationActive={false}
          connectNulls={false}
        />
      </LineChart>
    </ChartContainer>
  );
}
