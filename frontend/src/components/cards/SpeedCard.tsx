import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { useSpeed } from "../../store/monitorStore";
import { getSpeedBaseline } from "../../services/api";
import type { SpeedBaseline } from "../../types";

export default function SpeedCard() {
  const { downloadMbps, uploadMbps } = useSpeed();
  const [baseline, setBaseline] = useState<SpeedBaseline | null>(null);

  useEffect(() => {
    getSpeedBaseline().then(setBaseline).catch(console.error);
  }, []);

  const calculatePercentage = (current: number | null, base: number | undefined | null) => {
    if (!current || !base) return null;
    return Math.round((current / base) * 100);
  };

  const dlPercent = calculatePercentage(downloadMbps, baseline?.download_mbps);

  return (
    <div className="card">
      <div className="flex justify-between items-start mb-3">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
          Speed
        </p>
        {dlPercent !== null && (
          <span className={`text-[10px] px-1.5 py-0.5 rounded ${dlPercent < 80 ? 'bg-red-500/20 text-red-400' : 'bg-accent-cyan/10 text-accent-cyan'}`}>
            {dlPercent}% of usual
          </span>
        )}
      </div>
      <div className="flex items-end gap-3 sm:gap-4 flex-wrap">
        {/* Download */}
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-accent-cyan/10 text-accent-cyan">
            <ArrowDown className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="number-value text-xl text-white">
              {downloadMbps != null ? downloadMbps.toFixed(1) : "—"}
            </span>
            <span className="text-[10px] text-slate-500 ml-1">Mbps</span>
          </div>
        </div>

        {/* Upload */}
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-accent-emerald/10 text-accent-emerald">
            <ArrowUp className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="number-value text-xl text-white">
              {uploadMbps != null ? uploadMbps.toFixed(1) : "—"}
            </span>
            <span className="text-[10px] text-slate-500 ml-1">Mbps</span>
          </div>
        </div>
      </div>
    </div>
  );
}
