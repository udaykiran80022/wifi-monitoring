import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Save, CheckCircle, AlertCircle, Info } from "lucide-react";
import { useSettingsQuery, useUpdateSettings } from "../hooks/queries";
import { LoadingState } from "../components/ui/LoadingState";
import { ErrorBanner } from "../components/ui/ErrorBanner";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";

// ─── Zod schema for settings validation ───
const settingsSchema = z.object({
  low_download_mbps: z
    .number({ error: "Must be a number" })
    .min(0, "Must be ≥ 0")
    .max(10000, "Must be ≤ 10,000"),
  low_upload_mbps: z
    .number({ error: "Must be a number" })
    .min(0, "Must be ≥ 0")
    .max(10000, "Must be ≤ 10,000"),
  high_ping_ms: z
    .number({ error: "Must be a number" })
    .min(0, "Must be ≥ 0")
    .max(10000, "Must be ≤ 10,000"),
  high_packet_loss_pct: z
    .number({ error: "Must be a number" })
    .min(0, "Must be ≥ 0")
    .max(100, "Must be ≤ 100"),
  ping_interval_sec: z
    .number({ error: "Must be a number" })
    .int({ message: "Must be a whole number" })
    .min(3, "Minimum 3 seconds")
    .max(3600, "Maximum 3,600 seconds"),
  speed_test_interval_sec: z
    .number({ error: "Must be a number" })
    .int({ message: "Must be a whole number" })
    .min(60, "Minimum 60 seconds")
    .max(86400, "Maximum 86,400 seconds"),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

const fields: Array<{
  key: keyof SettingsFormData;
  label: string;
  unit: string;
  helpText: string;
  step: string;
}> = [
  {
    key: "low_download_mbps",
    label: "Low Download Threshold",
    unit: "Mbps",
    helpText: "Alert when download speed drops below this value",
    step: "0.1",
  },
  {
    key: "low_upload_mbps",
    label: "Low Upload Threshold",
    unit: "Mbps",
    helpText: "Alert when upload speed drops below this value",
    step: "0.1",
  },
  {
    key: "high_ping_ms",
    label: "High Ping Threshold",
    unit: "ms",
    helpText: "Alert when ping latency exceeds this value",
    step: "0.1",
  },
  {
    key: "high_packet_loss_pct",
    label: "High Packet Loss Threshold",
    unit: "%",
    helpText: "Alert when packet loss exceeds this percentage",
    step: "0.1",
  },
  {
    key: "ping_interval_sec",
    label: "Ping Check Interval",
    unit: "seconds",
    helpText: "How often to check connectivity (min: 3 seconds)",
    step: "1",
  },
  {
    key: "speed_test_interval_sec",
    label: "Speed Test Interval",
    unit: "seconds",
    helpText: "How often to run a full speed test (min: 60 seconds)",
    step: "1",
  },
];

export default function Settings() {
  const { data: settings, isLoading, error: fetchError, refetch } = useSettingsQuery();
  const updateMutation = useUpdateSettings();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
  });

  // Reset form when settings data loads
  useEffect(() => {
    if (settings) {
      reset({
        low_download_mbps: settings.low_download_mbps,
        low_upload_mbps: settings.low_upload_mbps,
        high_ping_ms: settings.high_ping_ms,
        high_packet_loss_pct: settings.high_packet_loss_pct,
        ping_interval_sec: settings.ping_interval_sec,
        speed_test_interval_sec: settings.speed_test_interval_sec,
      });
    }
  }, [settings, reset]);

  const onSubmit = (data: SettingsFormData) => {
    updateMutation.mutate(data);
  };

  if (isLoading) return <LoadingState variant="list" count={6} />;

  if (fetchError) {
    return (
      <ErrorBanner
        error="Failed to load settings"
        onRetry={() => refetch()}
      />
    );
  }

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
      <form onSubmit={handleSubmit(onSubmit)} className="card space-y-6" noValidate>
        <h3 className="text-sm font-semibold text-white">Threshold Settings</h3>

        <div className="space-y-5">
          {fields.map(({ key, label, unit, helpText, step }) => (
            <Input
              key={key}
              label={label}
              unit={unit}
              helpText={helpText}
              type="number"
              step={step}
              min="0"
              error={errors[key]?.message}
              {...register(key, { valueAsNumber: true })}
            />
          ))}
        </div>

        {/* Status Messages */}
        {updateMutation.error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-accent-red/5 border border-accent-red/10 text-accent-red text-sm" role="alert">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {updateMutation.error instanceof Error
              ? updateMutation.error.message
              : "Failed to save settings"}
          </div>
        )}

        {updateMutation.isSuccess && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-accent-emerald/5 border border-accent-emerald/10 text-accent-emerald text-sm" role="status">
            <CheckCircle className="w-4 h-4 shrink-0" />
            Settings saved successfully!
          </div>
        )}

        {/* Save Button */}
        <Button
          type="submit"
          loading={updateMutation.isPending}
          disabled={!isDirty}
        >
          <Save className="w-4 h-4" />
          {updateMutation.isPending ? "Saving..." : "Save Settings"}
        </Button>
      </form>
    </div>
  );
}
