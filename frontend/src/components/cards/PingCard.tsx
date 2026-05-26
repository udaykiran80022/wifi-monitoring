import { Activity } from "lucide-react";
import { usePingMs, usePacketLoss } from "../../store/monitorStore";

export default function PingCard() {
  const pingMs = usePingMs();
  const packetLoss = usePacketLoss();

  const getPingColor = () => {
    if (pingMs == null) return "text-slate-400";
    if (pingMs < 50) return "text-accent-emerald";
    if (pingMs < 100) return "text-accent-cyan";
    if (pingMs < 150) return "text-accent-amber";
    return "text-accent-red";
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
          Latency
        </p>
        <div className="p-1.5 rounded-md bg-accent-amber/10 text-accent-amber">
          <Activity className="w-3.5 h-3.5" />
        </div>
      </div>

      <div className="flex items-end gap-1">
        <span className={`number-value text-2xl ${getPingColor()}`}>
          {pingMs != null ? Math.round(pingMs) : "—"}
        </span>
        <span className="text-xs text-slate-500 mb-0.5">ms</span>
      </div>

      {packetLoss != null && (
        <p className="text-[11px] text-slate-500 mt-2">
          Packet loss:{" "}
          <span
            className={`font-mono font-medium ${
              packetLoss === 0
                ? "text-accent-emerald"
                : packetLoss < 5
                ? "text-accent-amber"
                : "text-accent-red"
            }`}
          >
            {packetLoss.toFixed(1)}%
          </span>
        </p>
      )}
    </div>
  );
}
