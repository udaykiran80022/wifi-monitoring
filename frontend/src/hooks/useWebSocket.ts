import { useEffect, useRef, useCallback } from "react";
import { useMonitorStore } from "../store/monitorStore";
import toast from "react-hot-toast";

export function useWebSocket() {
  const ws = useRef<WebSocket | null>(null);
  const retryDelay = useRef(1000);
  const reconnectTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { setLiveData, setWsConnected } = useMonitorStore();

  const connect = useCallback(() => {
    // Determine WebSocket URL based on current location
    const API_TOKEN = import.meta.env.VITE_API_TOKEN || "changeme";
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws?token=${API_TOKEN}`;

    try {
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        setWsConnected(true);
        retryDelay.current = 1000; // Reset retry delay on successful connect
      };

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === "alert") {
            if (data.severity === "critical") {
              toast.error(data.message, { id: data.id?.toString(), duration: 10000 });
            } else if (data.severity === "warning") {
              toast.error(data.message, { id: data.id?.toString(), icon: "⚠️" });
            } else {
              toast.success(data.message, { id: data.id?.toString(), icon: "ℹ️" });
            }
          }
          
          setLiveData(data);
        } catch {
          // Ignore malformed messages
        }
      };

      ws.current.onclose = () => {
        setWsConnected(false);
        // Reconnect with exponential backoff
        reconnectTimeout.current = setTimeout(() => {
          retryDelay.current = Math.min(retryDelay.current * 2, 30000);
          connect();
        }, retryDelay.current);
      };

      ws.current.onerror = () => {
        // onclose will fire after onerror, so reconnection is handled there
        ws.current?.close();
      };
    } catch {
      setWsConnected(false);
      reconnectTimeout.current = setTimeout(() => {
        retryDelay.current = Math.min(retryDelay.current * 2, 30000);
        connect();
      }, retryDelay.current);
    }
  }, [setLiveData, setWsConnected]);

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
