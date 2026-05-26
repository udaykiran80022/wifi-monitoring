import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import { SidebarProvider, useSidebar } from "./SidebarContext";
import { cn } from "../../lib/utils";

function LayoutInner() {
  const { isCollapsed, isMobile } = useSidebar();

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div
        className={cn(
          "flex-1 flex flex-col min-w-0 transition-[margin-left] duration-300",
          isMobile
            ? "ml-0"
            : isCollapsed
            ? "ml-16"
            : "ml-60"
        )}
      >
        <TopBar />
        <main className="flex-1 overflow-y-auto grid-bg p-4 md:p-6">
          <div className="animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default function Layout() {
  return (
    <SidebarProvider>
      <LayoutInner />
    </SidebarProvider>
  );
}
