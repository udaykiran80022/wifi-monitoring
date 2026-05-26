import { useEffect } from "react";
import { useMonitorStore } from "../store/monitorStore";
import { getLatestSpeed, getUnreadAlertCount } from "../services/api";

/**
 * Hook that loads initial data from the REST API on mount.
 * WebSocket updates will keep the data fresh after initial load.
 */
export function useMonitorData() {
  const setLatestSpeed = useMonitorStore((s) => s.setLatestSpeed);
  const setUnreadAlertCount = useMonitorStore((s) => s.setUnreadAlertCount);

  useEffect(() => {
    // Load initial speed data
    getLatestSpeed()
      .then((speed) => setLatestSpeed(speed))
      .catch((err) => {
        console.warn("[MonitorData] Failed to load initial speed data:", err);
      });

    // Load initial unread alert count
    getUnreadAlertCount()
      .then((count) => setUnreadAlertCount(count))
      .catch((err) => {
        console.warn("[MonitorData] Failed to load unread alert count:", err);
      });
  }, [setLatestSpeed, setUnreadAlertCount]);
}
