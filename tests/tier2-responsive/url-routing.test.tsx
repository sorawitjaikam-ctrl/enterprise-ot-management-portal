import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import {
  TAB_TO_PATH,
  PATH_TO_TAB,
  normalizePathname,
  getInitialTabFromUrl,
  useUrlRouting,
} from "../../src/hooks/useUrlRouting";

describe("useUrlRouting and Path Helpers", () => {
  const originalLocation = window.location;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    window.history.replaceState(null, "", "/");
  });

  describe("normalizePathname", () => {
    it("handles empty and root paths", () => {
      expect(normalizePathname("")).toBe("/");
      expect(normalizePathname("/")).toBe("/");
    });

    it("strips trailing slashes correctly", () => {
      expect(normalizePathname("/shifts/")).toBe("/shifts");
      expect(normalizePathname("/job-value///")).toBe("/job-value");
      expect(normalizePathname("/dashboard")).toBe("/dashboard");
    });
  });

  describe("getInitialTabFromUrl", () => {
    it("returns correct tab based on current window.location.pathname", () => {
      window.history.replaceState(null, "", "/shifts");
      expect(getInitialTabFromUrl()).toBe("shifts");

      window.history.replaceState(null, "", "/reports");
      expect(getInitialTabFromUrl()).toBe("reports");

      window.history.replaceState(null, "", "/job-value");
      expect(getInitialTabFromUrl()).toBe("job_value");

      window.history.replaceState(null, "", "/job_value");
      expect(getInitialTabFromUrl()).toBe("job_value");

      window.history.replaceState(null, "", "/leave-records");
      expect(getInitialTabFromUrl()).toBe("leave-records");

      window.history.replaceState(null, "", "/unknown-route");
      expect(getInitialTabFromUrl()).toBe("dashboard");

      window.history.replaceState(null, "", "/");
      expect(getInitialTabFromUrl()).toBe("dashboard");
    });
  });

  describe("TAB_TO_PATH and PATH_TO_TAB mappings", () => {
    it("maps all 11 views bidirectionally", () => {
      const views = [
        { tab: "dashboard", path: "/" },
        { tab: "reports", path: "/reports" },
        { tab: "shifts", path: "/shifts" },
        { tab: "employees", path: "/employees" },
        { tab: "job_value", path: "/job-value" },
        { tab: "leave-records", path: "/leave-records" },
        { tab: "ot-records", path: "/ot-records" },
        { tab: "hr-editor", path: "/hr-editor" },
        { tab: "admin-permissions", path: "/admin-permissions" },
        { tab: "settings", path: "/settings" },
        { tab: "profile", path: "/profile" },
      ];

      for (const { tab, path } of views) {
        expect(TAB_TO_PATH[tab]).toBe(path);
        expect(PATH_TO_TAB[path]).toBe(tab);
      }
    });

    it("supports alias /dashboard for dashboard tab", () => {
      expect(PATH_TO_TAB["/dashboard"]).toBe("dashboard");
    });
  });

  describe("useUrlRouting hook", () => {
    it("pushes state when activeTab changes", () => {
      window.history.replaceState(null, "", "/");
      const pushSpy = vi.spyOn(window.history, "pushState");
      let currentTab = "dashboard";
      const setActiveTab = vi.fn((tab: string) => {
        currentTab = tab;
      });

      const { rerender } = renderHook(
        ({ tab }) => useUrlRouting(tab, setActiveTab),
        { initialProps: { tab: currentTab } }
      );

      expect(pushSpy).not.toHaveBeenCalled();

      // Change tab to 'shifts'
      currentTab = "shifts";
      rerender({ tab: currentTab });

      expect(pushSpy).toHaveBeenCalledWith({ tab: "shifts" }, "", "/shifts");
    });

    it("responds to popstate events (Browser Back/Forward)", () => {
      window.history.replaceState(null, "", "/");
      let currentTab = "dashboard";
      const setActiveTab = vi.fn((tab: string) => {
        currentTab = tab;
      });

      renderHook(() => useUrlRouting(currentTab, setActiveTab));

      // Simulate back button to /reports with state
      act(() => {
        window.history.replaceState({ tab: "reports" }, "", "/reports");
        window.dispatchEvent(new PopStateEvent("popstate", { state: { tab: "reports" } }));
      });

      expect(setActiveTab).toHaveBeenCalledWith("reports");

      // Simulate popstate without state (direct browser back fallback to pathname)
      act(() => {
        window.history.replaceState(null, "", "/employees");
        window.dispatchEvent(new PopStateEvent("popstate", { state: null }));
      });

      expect(setActiveTab).toHaveBeenCalledWith("employees");
    });
  });
});
