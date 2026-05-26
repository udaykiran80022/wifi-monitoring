import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import Downtime from "./pages/Downtime";
import Alerts from "./pages/Alerts";
import Settings from "./pages/Settings";
import SystemInfo from "./pages/SystemInfo";
import { useWebSocket } from "./hooks/useWebSocket";
import { useMonitorData } from "./hooks/useMonitorData";
import { Toaster } from "react-hot-toast";
import { ErrorBoundary } from "react-error-boundary";

function ErrorFallback({ error, resetErrorBoundary }: any) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="bg-gray-800 p-8 rounded-xl shadow-xl max-w-md w-full">
        <h2 className="text-xl font-bold text-red-500 mb-4">Something went wrong</h2>
        <pre className="text-sm bg-gray-950 p-4 rounded overflow-auto mb-6 text-gray-300">
          {error.message}
        </pre>
        <button
          onClick={resetErrorBoundary}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors"
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
      <BrowserRouter>
        <Toaster 
          position="top-right" 
          toastOptions={{
            style: {
              background: '#1f2937',
              color: '#fff',
              border: '1px solid #374151',
            }
          }}
        />
        <AppContent />
      </BrowserRouter>
    </ErrorBoundary>
  );
}
