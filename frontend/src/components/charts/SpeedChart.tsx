import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { ChartContainer } from "./ChartContainer";
import {
  chartColors,
  tooltipStyle,
  axisDefaults,
  gridDefaults,
  chartMargin,
  yAxisLabel,
  legendStyle,
} from "./chartConfig";
import type { SpeedLog } from "../../types";

interface SpeedChartProps {
  data: SpeedLog[];
  height?: number;
}

export default function SpeedChart({ data, height = 300 }: SpeedChartProps) {
  const chartData = useMemo(
    () =>
      data
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
        .reverse(),
    [data]
  );

  return (
    <ChartContainer
      height={height}
      isEmpty={chartData.length === 0}
      emptyMessage="No speed test data available yet"
      aria-label={`Speed test history chart with ${chartData.length} data points`}
    >
      <LineChart data={chartData} margin={chartMargin}>
        <CartesianGrid {...gridDefaults} />
        <XAxis dataKey="time" {...axisDefaults} />
        <YAxis {...axisDefaults} label={yAxisLabel("Mbps")} />
        <Tooltip {...tooltipStyle} />
        <Legend wrapperStyle={legendStyle} />
        <Line
          type="monotone"
          dataKey="download"
          stroke={chartColors.cyan}
          strokeWidth={2}
          dot={{ r: 3, fill: chartColors.cyan }}
          activeDot={{ r: 5, fill: chartColors.cyan }}
          name="Download"
        />
        <Line
          type="monotone"
          dataKey="upload"
          stroke={chartColors.emerald}
          strokeWidth={2}
          dot={{ r: 3, fill: chartColors.emerald }}
          activeDot={{ r: 5, fill: chartColors.emerald }}
          name="Upload"
        />
      </LineChart>
    </ChartContainer>
  );
}
