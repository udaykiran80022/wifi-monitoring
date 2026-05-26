import { useEffect, useState } from "react";
import {
  Wifi,
  Globe,
  Network,
  Shield,
  Radio,
  Server,
  MapPin,
  ExternalLink,
} from "lucide-react";
import LoadingSpinner from "../components/shared/LoadingSpinner";
import { useWifiInfo, useNetworkInfo } from "../store/monitorStore";
import { getCurrentStatus, getLatestSpeed } from "../services/api";
import type { StatusLog, SpeedLog } from "../types";

interface InfoRowProps {
  icon: React.ElementType;
  label: string;
  value: string | null | undefined;
  accent?: string;
}

function InfoRow({ icon: Icon, label, value, accent }: InfoRowProps) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-white/[0.04] last:border-0">
      <div className="p-1.5 rounded-md bg-white/5">
        <Icon className={`w-4 h-4 ${accent || "text-slate-400"}`} />
      </div>
      <div className="flex-1">
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-sm text-white font-mono mt-0.5">
          {value || "—"}
        </p>
      </div>
    </div>
  );
}

export default function SystemInfo() {
  const { wifiSsid, wifiSignal } = useWifiInfo();
  const { localIp, publicIp, isConnected } = useNetworkInfo();
  const [status, setStatus] = useState<StatusLog | null>(null);
  const [speed, setSpeed] = useState<SpeedLog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getCurrentStatus(), getLatestSpeed()])
      .then(([s, sp]) => {
        setStatus(s);
        setSpeed(sp);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-3xl space-y-6">
      {/* WiFi Adapter Info */}
      <div className="card">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Wifi className="w-4 h-4 text-accent-cyan" />
          WiFi Connection
        </h3>

        <InfoRow
          icon={Wifi}
          label="Network Name (SSID)"
          value={wifiSsid}
          accent="text-accent-cyan"
        />
        <InfoRow
          icon={Radio}
          label="Signal Strength"
          value={wifiSignal != null ? `${wifiSignal}%` : null}
          accent="text-accent-emerald"
        />

        {/* Visual Signal Bar */}
        {wifiSignal != null && (
          <div className="py-3 border-b border-white/[0.04]">
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-white/5 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    wifiSignal >= 80
                      ? "bg-accent-emerald"
                      : wifiSignal >= 60
                      ? "bg-accent-cyan"
                      : wifiSignal >= 40
                      ? "bg-accent-amber"
                      : "bg-accent-red"
                  }`}
                  style={{ width: `${wifiSignal}%` }}
                />
              </div>
              <span className="number-value text-sm text-white w-10 text-right">
                {wifiSignal}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Network Info */}
      <div className="card">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Network className="w-4 h-4 text-accent-purple" />
          Network
        </h3>

        <InfoRow
          icon={Network}
          label="Local IP Address"
          value={localIp}
          accent="text-accent-purple"
        />
        <InfoRow
          icon={Globe}
          label="Public IP Address"
          value={publicIp}
          accent="text-accent-cyan"
        />
        <InfoRow
          icon={Shield}
          label="Connection Status"
          value={
            isConnected === null
              ? "Checking..."
              : isConnected
              ? "Connected"
              : "Disconnected"
          }
          accent={isConnected ? "text-accent-emerald" : "text-accent-red"}
        />
      </div>

      {/* Last Speed Test Server */}
      {speed && (
        <div className="card">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Server className="w-4 h-4 text-accent-amber" />
            Last Speed Test Server
          </h3>

          <InfoRow
            icon={Server}
            label="Server Name"
            value={speed.server_name}
            accent="text-accent-amber"
          />
          <InfoRow
            icon={MapPin}
            label="Server Location"
            value={speed.server_location}
            accent="text-accent-amber"
          />

          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="bg-bg-tertiary rounded-lg p-3 text-center">
              <p className="text-[10px] text-slate-500 uppercase mb-1">Download</p>
              <p className="number-value text-accent-cyan">
                {speed.download_mbps.toFixed(1)}
              </p>
              <p className="text-[10px] text-slate-600">Mbps</p>
            </div>
            <div className="bg-bg-tertiary rounded-lg p-3 text-center">
              <p className="text-[10px] text-slate-500 uppercase mb-1">Upload</p>
              <p className="number-value text-accent-emerald">
                {speed.upload_mbps.toFixed(1)}
              </p>
              <p className="text-[10px] text-slate-600">Mbps</p>
            </div>
            <div className="bg-bg-tertiary rounded-lg p-3 text-center">
              <p className="text-[10px] text-slate-500 uppercase mb-1">Ping</p>
              <p className="number-value text-accent-amber">
                {speed.ping_ms.toFixed(1)}
              </p>
              <p className="text-[10px] text-slate-600">ms</p>
            </div>
          </div>

          {speed.result_url && (
            <a
              href={speed.result_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 mt-4 text-sm text-accent-cyan hover:text-accent-cyan/80 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              View result on Speedtest.net
            </a>
          )}

          <p className="text-[10px] text-slate-600 mt-3 font-mono">
            Tested: {new Date(speed.timestamp).toLocaleString()}
          </p>
        </div>
      )}

      {/* Latest Status Log (raw data) */}
      {status && (
        <div className="card">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Globe className="w-4 h-4 text-slate-400" />
            Latest Status Log
          </h3>
          <pre className="text-xs text-slate-400 font-mono bg-bg-tertiary rounded-lg p-4 overflow-x-auto">
            {JSON.stringify(status, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
