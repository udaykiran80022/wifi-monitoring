import { useMemo } from "react";
import type { HeatmapData } from "../../types";

interface HeatmapChartProps {
  data: HeatmapData[];
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function HeatmapChart({ data }: HeatmapChartProps) {
  // Create a 7x24 grid
  const grid = useMemo(() => {
    const grid = Array.from({ length: 7 }, () => Array.from({ length: 24 }, () => ({
      ping: null as number | null,
      disconnected: 0
    })));
    
    data.forEach((d) => {
      grid[d.day_of_week][d.hour] = {
        ping: d.avg_ping,
        disconnected: d.disconnected_count
      };
    });
    
    return grid;
  }, [data]);

  const getColor = (cell: { ping: number | null, disconnected: number }) => {
    if (cell.disconnected > 0) return "bg-red-500/80"; // Bad
    if (cell.ping === null) return "bg-bg-secondary"; // No data
    if (cell.ping > 150) return "bg-orange-500/80";
    if (cell.ping > 80) return "bg-yellow-500/80";
    if (cell.ping > 40) return "bg-green-500/60";
    return "bg-green-500/90";
  };

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[600px]">
        <div className="flex mb-1 gap-1">
          <div className="w-8"></div>
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} className="flex-1 text-center text-[10px] text-slate-500">
              {i % 2 === 0 ? i : ''}
            </div>
          ))}
        </div>
        
        {grid.map((row, dayIdx) => (
          <div key={dayIdx} className="flex items-center mb-1 gap-1">
            <div className="w-8 text-[10px] text-slate-400 font-medium text-right pr-2">{DAYS[dayIdx]}</div>
            {row.map((cell, hourIdx) => (
              <div
                key={hourIdx}
                title={`${DAYS[dayIdx]} ${hourIdx}:00\nPing: ${cell.ping ? cell.ping.toFixed(1) : '-'}ms\nDrops: ${cell.disconnected}`}
                className={`flex-1 aspect-square rounded-sm ${getColor(cell)} transition-colors hover:ring-1 hover:ring-white/50 cursor-crosshair`}
              />
            ))}
          </div>
        ))}
        
        <div className="flex flex-wrap items-center gap-4 mt-4 text-[10px] text-slate-500 justify-end">
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-bg-secondary"></div>No Data</div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-green-500/90"></div>&lt;40ms</div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-yellow-500/80"></div>&gt;80ms</div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-orange-500/80"></div>&gt;150ms</div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-red-500/80"></div>Drops</div>
        </div>
      </div>
    </div>
  );
}
