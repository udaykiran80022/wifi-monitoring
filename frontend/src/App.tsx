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
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
