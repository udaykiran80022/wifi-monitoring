import { Wifi } from "lucide-react";
import { useWifiInfo } from "../../store/monitorStore";

export default function WifiCard() {
  const { wifiSsid, wifiSignal } = useWifiInfo();

  const getSignalColor = () => {
    if (wifiSignal == null) return "text-slate-400";
    if (wifiSignal >= 80) return "text-accent-emerald";
    if (wifiSignal >= 60) return "text-accent-cyan";
    if (wifiSignal >= 40) return "text-accent-amber";
    return "text-accent-red";
  };

  const getSignalBars = () => {
    if (wifiSignal == null) return 0;
    if (wifiSignal >= 80) return 4;
    if (wifiSignal >= 60) return 3;
    if (wifiSignal >= 40) return 2;
    if (wifiSignal >= 20) return 1;
    return 0;
  };

  const bars = getSignalBars();

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
          WiFi Signal
        </p>
        <div className="p-1.5 rounded-md bg-accent-cyan/10 text-accent-cyan">
          <Wifi className="w-3.5 h-3.5" />
        </div>
      </div>

      <div className="flex items-end gap-3">
        {/* Signal strength bars */}
        <div className="flex items-end gap-[3px] h-6">
          {[1, 2, 3, 4].map((bar) => (
            <div
              key={bar}
              className={`w-[5px] rounded-sm transition-all ${
                bar <= bars ? getSignalColor().replace("text-", "bg-") : "bg-white/10"
              }`}
              style={{ height: `${bar * 25}%` }}
            />
          ))}
        </div>

        <div>
          <span className={`number-value text-xl ${getSignalColor()}`}>
            {wifiSignal != null ? `${wifiSignal}%` : "—"}
          </span>
        </div>
      </div>

      {wifiSsid && (
        <p className="text-[11px] text-slate-500 mt-2 truncate">
          Network: <span className="text-slate-300 font-medium">{wifiSsid}</span>
        </p>
      )}
    </div>
  );
}
