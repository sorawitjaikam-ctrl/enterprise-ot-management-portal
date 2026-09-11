import { useEffect, useCallback } from "react";

export const TAB_TO_PATH: Record<string, string> = {
  dashboard: "/",
  reports: "/reports",
  shifts: "/shifts",
  employees: "/employees",
  job_value: "/job-value",
  "leave-records": "/leave-records",
  "ot-records": "/ot-records",
  "hr-editor": "/hr-editor",
  "admin-permissions": "/admin-permissions",
  settings: "/settings",
  profile: "/profile",
};

export const PATH_TO_TAB: Record<string, string> = {
  "/": "dashboard",
  "/dashboard": "dashboard",
  "/reports": "reports",
  "/shifts": "shifts",
  "/employees": "employees",
  "/job-value": "job_value",
  "/job_value": "job_value",
  "/leave-records": "leave-records",
  "/ot-records": "ot-records",
  "/hr-editor": "hr-editor",
  "/admin-permissions": "admin-permissions",
  "/settings": "settings",
  "/profile": "profile",
};

export const normalizePathname = (pathname: string): string => {
  if (!pathname || pathname === "") return "/";
  // Remove trailing slashes (except root '/')
  const trimmed = pathname.replace(/\/+$/, "");
  return trimmed === "" ? "/" : trimmed;
};

export const getInitialTabFromUrl = (): string => {
  if (typeof window === "undefined") return "dashboard";
  const normalized = normalizePathname(window.location.pathname);
  return PATH_TO_TAB[normalized] || "dashboard";
};

export const useUrlRouting = (
  activeTab: string,
  setActiveTab: (tab: string) => void
) => {
  // Sync URL to activeTab on popstate (Back/Forward buttons)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handlePopState = (event: PopStateEvent) => {
      if (event.state && typeof event.state.tab === "string") {
        setActiveTab(event.state.tab);
      } else {
        const normalized = normalizePathname(window.location.pathname);
        const tab = PATH_TO_TAB[normalized] || "dashboard";
        setActiveTab(tab);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [setActiveTab]);

  // Sync activeTab to URL (pushState if path changes)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const targetPath = TAB_TO_PATH[activeTab] || `/${activeTab}`;
    const currentPath = normalizePathname(window.location.pathname);

    // If current path already maps to this tab, or exact match, avoid redundant push
    const currentTab = PATH_TO_TAB[currentPath];
    if (currentPath !== targetPath && currentTab !== activeTab) {
      window.history.pushState({ tab: activeTab }, "", targetPath);
    }
  }, [activeTab]);

  const navigateToTab = useCallback(
    (tab: string) => {
      setActiveTab(tab);
    },
    [setActiveTab]
  );

  return { navigateToTab };
};
