import { ArrowDown, ArrowUp } from "lucide-react";
import { useMonitorStore } from "../../store/monitorStore";

export default function SpeedCard() {
  const { downloadMbps, uploadMbps } = useMonitorStore();

  return (
    <div className="card">
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">
        Speed
      </p>
      <div className="flex items-end gap-6">
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
