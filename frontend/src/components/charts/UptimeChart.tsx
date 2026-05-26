import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
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
import type { DailyAnalytics } from "../../types";

interface UptimeChartProps {
  data: DailyAnalytics[];
  height?: number;
}

export default function UptimeChart({ data, height = 250 }: UptimeChartProps) {
  const chartData = useMemo(
    () =>
      data.map((d) => ({
        date: new Date(d.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        downtime: d.downtime_minutes,
        outages: d.outage_count,
      })),
    [data]
  );

  return (
    <ChartContainer
      height={height}
      isEmpty={chartData.length === 0}
      emptyMessage="No analytics data available yet"
      aria-label="Daily downtime bar chart"
    >
      <BarChart data={chartData} margin={chartMargin}>
        <CartesianGrid {...gridDefaults} />
        <XAxis dataKey="date" {...axisDefaults} />
        <YAxis {...axisDefaults} label={yAxisLabel("min")} />
        <Tooltip
          {...tooltipStyle}
          formatter={(value: unknown, name: unknown) => {
            if (name === "downtime") return [`${Number(value).toFixed(1)} min`, "Downtime"];
            return [`${value}`, `${name}`];
          }}
        />
        <Bar dataKey="downtime" name="downtime" radius={[4, 4, 0, 0]} maxBarSize={30}>
          {chartData.map((entry, index) => (
            <Cell
              key={index}
              fill={entry.downtime > 10 ? chartColors.red : entry.downtime > 0 ? chartColors.amber : chartColors.emerald}
              opacity={0.8}
            />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
