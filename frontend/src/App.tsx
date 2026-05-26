import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import Downtime from "./pages/Downtime";
import Alerts from "./pages/Alerts";
import Settings from "./pages/Settings";
import SystemInfo from "./pages/SystemInfo";
import { useWebSocket } from "./hooks/useWebSocket";
import { useMonitorData } from "./hooks/useMonitorData";
import { queryClient } from "./lib/queryClient";
import { OfflineBanner } from "./components/ui/OfflineBanner";
import { Toaster } from "react-hot-toast";
import { ErrorBoundary } from "react-error-boundary";

function ErrorFallback({ error, resetErrorBoundary }: any) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary text-white">
      <div className="bg-bg-secondary p-8 rounded-xl shadow-xl max-w-md w-full border border-white/[0.07]">
        <h2 className="text-xl font-bold text-accent-red mb-4">Something went wrong</h2>
        <pre className="text-sm bg-bg-tertiary p-4 rounded-lg overflow-auto mb-6 text-slate-300 font-mono">
          {error.message}
        </pre>
        <button
          onClick={resetErrorBoundary}
          className="w-full bg-accent-cyan/10 hover:bg-accent-cyan/20 text-accent-cyan font-medium py-2.5 px-4 rounded-lg transition-colors border border-accent-cyan/20"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

function AppContent() {
  // Initialize WebSocket connection and load initial data
  useWebSocket();
  useMonitorData();

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/downtime" element={<Downtime />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/system-info" element={<SystemInfo />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <OfflineBanner />
          <Toaster 
            position="top-right" 
            toastOptions={{
              style: {
                background: '#0f1629',
                color: '#e2e8f0',
                border: '1px solid rgba(255, 255, 255, 0.07)',
                borderRadius: '12px',
              }
            }}
          />
          <AppContent />
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
