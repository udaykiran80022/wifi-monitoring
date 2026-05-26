import { useState, useEffect, useCallback } from "react";
import type { MonitorSettings } from "../types";
import { getSettings, updateSettings } from "../services/api";

/**
 * Hook for fetching and updating monitor settings.
 */
export function useSettings() {
  const [settings, setSettings] = useState<MonitorSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSettings();
      setSettings(data);
    } catch (e) {
      setError("Failed to load settings");
    } finally {
      setLoading(false);
    }
  }, []);

  const saveSettings = useCallback(
    async (data: Partial<MonitorSettings>) => {
      setSaving(true);
      setError(null);
      setSuccess(false);
      try {
        const updated = await updateSettings(data);
        setSettings(updated);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } catch (e: unknown) {
        const msg =
          e instanceof Error ? e.message : "Failed to save settings";
        setError(msg);
      } finally {
        setSaving(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return { settings, loading, saving, error, success, saveSettings, fetchSettings };
}
