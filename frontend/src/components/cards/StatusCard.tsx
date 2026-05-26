import { Wifi, WifiOff } from "lucide-react";
import { useIsConnected } from "../../store/monitorStore";

export default function StatusCard() {
  const isConnected = useIsConnected();

  return (
    <div
      className={`card relative overflow-hidden ${
        isConnected
          ? "border-accent-emerald/20 glow-emerald"
          : isConnected === false
          ? "border-accent-red/20 glow-red"
          : ""
      }`}
    >
      {/* Background gradient */}
      <div
        className={`absolute inset-0 opacity-5 ${
          isConnected
            ? "bg-gradient-to-br from-accent-emerald to-transparent"
            : isConnected === false
            ? "bg-gradient-to-br from-accent-red to-transparent"
            : ""
        }`}
      />

      <div className="relative flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
            Internet Status
          </p>
          <p
            className={`text-2xl font-bold ${
              isConnected === null
                ? "text-slate-400"
                : isConnected
                ? "text-accent-emerald"
                : "text-accent-red"
            }`}
          >
            {isConnected === null ? "Checking..." : isConnected ? "Connected" : "Disconnected"}
          </p>
        </div>
        <div
          className={`p-3 rounded-xl ${
            isConnected
              ? "bg-accent-emerald/10 text-accent-emerald"
              : isConnected === false
              ? "bg-accent-red/10 text-accent-red"
              : "bg-white/5 text-slate-500"
          }`}
        >
          {isConnected === false ? (
            <WifiOff className="w-6 h-6" />
          ) : (
            <Wifi className="w-6 h-6" />
          )}
        </div>
      </div>
    </div>
  );
}
