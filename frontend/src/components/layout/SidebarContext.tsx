import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

interface SidebarContextType {
  /** Whether the sidebar drawer is open (mobile) */
  isOpen: boolean;
  /** Whether the sidebar is collapsed to icon-only mode (desktop/tablet) */
  isCollapsed: boolean;
  /** Whether we're on a mobile viewport */
  isMobile: boolean;
  /** Toggle the sidebar open/closed (mobile) or collapsed/expanded (desktop) */
  toggle: () => void;
  /** Explicitly set open state (mobile drawer) */
  setOpen: (open: boolean) => void;
  /** Explicitly set collapsed state (desktop) */
  setCollapsed: (collapsed: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | null>(null);

const MOBILE_BREAKPOINT = 768;
const TABLET_BREAKPOINT = 1024;
const COLLAPSED_KEY = "wifi-monitor-sidebar-collapsed";

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    const stored = localStorage.getItem(COLLAPSED_KEY);
    return stored === "true";
  });
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth < MOBILE_BREAKPOINT;
  });

  // Track viewport size
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const mobile = width < MOBILE_BREAKPOINT;
      setIsMobile(mobile);

      // Auto-collapse on tablet
      if (width >= MOBILE_BREAKPOINT && width < TABLET_BREAKPOINT) {
        setIsCollapsed(true);
      }

      // Close mobile drawer when resizing to desktop
      if (!mobile) {
        setIsOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    // Run once on mount
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Persist collapsed preference
  const setCollapsed = useCallback((collapsed: boolean) => {
    setIsCollapsed(collapsed);
    localStorage.setItem(COLLAPSED_KEY, String(collapsed));
  }, []);

  const toggle = useCallback(() => {
    if (isMobile) {
      setIsOpen((prev) => !prev);
    } else {
      setCollapsed(!isCollapsed);
    }
  }, [isMobile, isCollapsed, setCollapsed]);

  const setOpen = useCallback((open: boolean) => {
    setIsOpen(open);
  }, []);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isOpen && isMobile) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, isMobile]);

  return (
    <SidebarContext.Provider
      value={{
        isOpen,
        isCollapsed,
        isMobile,
        toggle,
        setOpen,
        setCollapsed,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}
