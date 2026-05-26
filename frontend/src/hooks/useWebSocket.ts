import { useEffect, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useMonitorStore } from "../store/monitorStore";
import { getUnreadAlertCount } from "../services/api";
import toast from "react-hot-toast";

export function useWebSocket() {
  const ws = useRef<WebSocket | null>(null);
  const retryDelay = useRef(1000);
  const retryCount = useRef(0);
  const reconnectTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const setLiveData = useMonitorStore((s) => s.setLiveData);
  const setWsConnected = useMonitorStore((s) => s.setWsConnected);
  const setUnreadAlertCount = useMonitorStore((s) => s.setUnreadAlertCount);
  const queryClient = useQueryClient();

  const connect = useCallback(() => {
    // Determine WebSocket URL based on current location
    const API_TOKEN = import.meta.env.VITE_API_TOKEN || "changeme";
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws?token=${API_TOKEN}`;

    try {
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        setWsConnected(true);
        
        // Show reconnection success toast if we previously lost connection
        if (retryCount.current > 0) {
          toast.success("Connection restored", {
            id: "ws-reconnected",
            duration: 3000,
            icon: "🔗",
          });
        }
        
        retryDelay.current = 1000; // Reset retry delay on successful connect
        retryCount.current = 0;
      };

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === "alert") {
            // Show toast notification
            if (data.severity === "critical") {
              toast.error(data.message, { id: data.id?.toString(), duration: 10000 });
            } else if (data.severity === "warning") {
              toast.error(data.message, { id: data.id?.toString(), icon: "⚠️" });
            } else {
              toast.success(data.message, { id: data.id?.toString(), icon: "ℹ️" });
            }

            // Invalidate TanStack Query alert cache so lists refresh
            queryClient.invalidateQueries({ queryKey: ["alerts"] });

            // Fetch the REAL unread count from the server instead of blindly incrementing.
            // This ensures the sidebar badge is always accurate.
            getUnreadAlertCount()
              .then((count) => setUnreadAlertCount(count))
              .catch(() => {
                // Fallback: increment optimistically if API call fails
                useMonitorStore.getState().incrementUnreadAlertCount();
              });

            // Don't pass alert to setLiveData since we handle count separately
            return;
          }
          
          setLiveData(data);
        } catch (err) {
          console.warn("[WebSocket] Failed to parse message:", err);
        }
      };

      ws.current.onclose = (event) => {
        setWsConnected(false);
        
        // Log the close reason for debugging
        if (event.code !== 1000) {
          console.warn(`[WebSocket] Closed unexpectedly (code: ${event.code}, reason: ${event.reason || "none"})`);
        }
        
        // Show disconnection toast on first disconnect
        if (retryCount.current === 0) {
          toast.error("Live connection lost. Reconnecting...", {
            id: "ws-disconnected",
            duration: 5000,
            icon: "📡",
          });
        }
        
        retryCount.current++;
        
        // Reconnect with exponential backoff
        reconnectTimeout.current = setTimeout(() => {
          retryDelay.current = Math.min(retryDelay.current * 2, 30000);
          connect();
        }, retryDelay.current);
      };

      ws.current.onerror = (event) => {
        console.error("[WebSocket] Connection error:", event);
        // onclose will fire after onerror, so reconnection is handled there
        ws.current?.close();
      };
    } catch (err) {
      console.error("[WebSocket] Failed to create connection:", err);
      setWsConnected(false);
      retryCount.current++;
      reconnectTimeout.current = setTimeout(() => {
        retryDelay.current = Math.min(retryDelay.current * 2, 30000);
        connect();
      }, retryDelay.current);
    }
  }, [setLiveData, setWsConnected, setUnreadAlertCount, queryClient]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
      ws.current?.close();
    };
  }, [connect]);
}
