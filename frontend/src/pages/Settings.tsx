import { useState } from "react";
import { Save, CheckCircle, AlertCircle, Info } from "lucide-react";
import { useSettings } from "../hooks/useSettings";
import LoadingSpinner from "../components/shared/LoadingSpinner";

export default function Settings() {
  const { settings, loading, saving, error, success, saveSettings } = useSettings();
  const [form, setForm] = useState<{
    low_download_mbps: string;
    low_upload_mbps: string;
    high_ping_ms: string;
    high_packet_loss_pct: string;
    ping_interval_sec: string;
    speed_test_interval_sec: string;
  } | null>(null);

  // Initialize form when settings load
  if (settings && !form) {
    setForm({
      low_download_mbps: String(settings.low_download_mbps),
      low_upload_mbps: String(settings.low_upload_mbps),
      high_ping_ms: String(settings.high_ping_ms),
      high_packet_loss_pct: String(settings.high_packet_loss_pct),
      ping_interval_sec: String(settings.ping_interval_sec),
      speed_test_interval_sec: String(settings.speed_test_interval_sec),
    });
  }

  if (loading || !form) return <LoadingSpinner />;

  const handleChange = (key: string, value: string) => {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const handleSave = () => {
    if (!form) return;
    saveSettings({
      low_download_mbps: parseFloat(form.low_download_mbps),
      low_upload_mbps: parseFloat(form.low_upload_mbps),
      high_ping_ms: parseFloat(form.high_ping_ms),
      high_packet_loss_pct: parseFloat(form.high_packet_loss_pct),
      ping_interval_sec: parseInt(form.ping_interval_sec),
      speed_test_interval_sec: parseInt(form.speed_test_interval_sec),
    });
  };

  const fields = [
    {
      key: "low_download_mbps",
      label: "Low Download Threshold",
      unit: "Mbps",
      info: "Alert when download speed drops below this value",
    },
    {
      key: "low_upload_mbps",
      label: "Low Upload Threshold",
      unit: "Mbps",
      info: "Alert when upload speed drops below this value",
    },
    {
      key: "high_ping_ms",
      label: "High Ping Threshold",
      unit: "ms",
      info: "Alert when ping latency exceeds this value",
    },
    {
      key: "high_packet_loss_pct",
      label: "High Packet Loss Threshold",
      unit: "%",
      info: "Alert when packet loss exceeds this percentage",
    },
    {
      key: "ping_interval_sec",
      label: "Ping Check Interval",
      unit: "seconds",
      info: "How often to check connectivity (min: 3 seconds)",
    },
    {
      key: "speed_test_interval_sec",
      label: "Speed Test Interval",
      unit: "seconds",
      info: "How often to run a full speed test (min: 60 seconds)",
    },
  ];

  return (
    <div className="max-w-2xl space-y-6">
      {/* Info Banner */}
      <div className="card flex items-start gap-3 bg-accent-cyan/5 border-accent-cyan/10">
        <Info className="w-5 h-5 text-accent-cyan mt-0.5 shrink-0" />
        <div>
          <p className="text-sm text-slate-300">
            Configure monitoring thresholds and intervals. Alerts will be generated
            when metrics exceed these values.
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Changes take effect immediately for future checks.
          </p>
        </div>
      </div>

      {/* Settings Form */}
      <div className="card space-y-6">
        <h3 className="text-sm font-semibold text-white">Threshold Settings</h3>

        <div className="space-y-5">
          {fields.map(({ key, label, unit, info }) => (
            <div key={key}>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-slate-300">
                  {label}
                </label>
                <span className="text-[10px] text-slate-600">{info}</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={form[key as keyof typeof form]}
                  onChange={(e) => handleChange(key, e.target.value)}
                  min="0"
                  step={key.includes("interval") ? "1" : "0.1"}
                  className="flex-1 bg-bg-tertiary border border-white/[0.07] rounded-lg px-4 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-accent-cyan/30 focus:ring-1 focus:ring-accent-cyan/10 transition-all"
                />
                <span className="text-xs text-slate-500 w-16">{unit}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Status Messages */}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-accent-red/5 border border-accent-red/10 text-accent-red text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-accent-emerald/5 border border-accent-emerald/10 text-accent-emerald text-sm">
            <CheckCircle className="w-4 h-4 shrink-0" />
            Settings saved successfully!
          </div>
        )}

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20 font-medium text-sm hover:bg-accent-cyan/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
