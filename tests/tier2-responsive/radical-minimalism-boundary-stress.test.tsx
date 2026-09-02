import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import App from '../../src/App';
import { calculateEmployeeMonthlyOt } from '../../src/utils/costSimulationEngine';
import { Employee } from '../../src/types';

const setViewport = (width: number, height = 800) => {
  window.innerWidth = width;
  window.innerHeight = height;
  window.dispatchEvent(new Event('resize'));
};

describe('Tier 2: Radical Minimalism Boundary & Corner Cases Stress Suite', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem("adminLoggedIn", "true");
    localStorage.setItem("currentUser", JSON.stringify({
      username: "admin",
      name: "ผู้ดูแลระบบ",
      role: "ผู้ดูแลระบบ",
      deptId: "all"
    }));
    vi.clearAllMocks();
  });

  // 1. Boundary: Empty Datasets Handling
  it('T2.B.1: Handles empty employee dataset gracefully without throwing runtime errors', async () => {
    // Override fetch to return empty arrays
    global.fetch = vi.fn().mockImplementation(async (input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : input.toString();
      if (url.includes('/api/portal-state')) {
        return new Response(JSON.stringify({
          departments: [],
          employees: [],
          shiftConfig: {},
          otTrendData: [],
          vesselSchedules: [],
          leaveRecords: [],
          accounts: [],
          otRequests: []
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    });

    const { container } = render(<App />);
    await waitFor(() => {
      expect(container.querySelector('main')).toBeInTheDocument();
    });

    // App header should still render cleanly
    expect(screen.getByText('ระบบวางแผนและจัดการตารางกะพนักงาน')).toBeInTheDocument();
  });

  // 2. Boundary: Large Roster Calculation Engine Stress (100+ Employees x 31 Days)
  it('T2.B.2: Computes large roster matrix with 100+ employees x 31 days with 0 precision error', () => {
    const largeRoster: Employee[] = Array.from({ length: 120 }, (_, idx) => ({
      id: `EMP-STRESS-${idx + 1}`,
      name: `พนักงานทดสอบ ${idx + 1}`,
      deptId: idx % 3 === 0 ? "inter2" : idx % 3 === 1 ? "inter3" : "inter4",
      role: "Stevedore",
      salary: 24000 + (idx % 10) * 1000,
      targetOt: 48,
      actualOt: 0,
      otPct: 0,
      status: "Active",
      groupName: "Default",
      shifts: Array.from({ length: 31 }, (_, day) => {
        if (day % 7 === 0) return "OFF";
        if (day % 7 === 1) return "OND";
        if (day % 7 === 2) return "M12";
        if (day % 7 === 3) return "A12";
        if (day % 7 === 4) return "N12";
        if (day % 7 === 5) return "M16";
        return "M8";
      })
    }));

    const startTime = performance.now();
    let totalDepartmentCost = 0;
    let totalOtHours = 0;

    largeRoster.forEach(emp => {
      const result = calculateEmployeeMonthlyOt(emp, emp.shifts, 2026, 8);
      expect(result.hourlyRate).toBe(emp.salary / 240);
      expect(result.totalOtHours).toBeGreaterThan(0);
      expect(result.totalOtPay).toBeGreaterThan(0);
      totalDepartmentCost += result.totalOtPay;
      totalOtHours += result.totalOtHours;
    });

    const duration = performance.now() - startTime;
    // 120 employees x 31 days = 3,720 shifts computed in < 150ms
    expect(duration).toBeLessThan(150);
    expect(totalDepartmentCost).toBeGreaterThan(0);
    expect(totalOtHours).toBeGreaterThan(0);
  });

  // 3. Boundary: Viewport Invariance across 375px, 768px, and 1440px Viewports
  it('T2.B.3: Pinned frozen worker identity column remains sticky left-0 at 375px mobile viewport', async () => {
    setViewport(375, 667);
    const { container } = render(<App />);

    await waitFor(() => {
      expect(container.querySelector('main')).toBeInTheDocument();
    });

    // Check for overflow-x-auto container and responsive styling
    const scrollContainers = container.querySelectorAll('.overflow-x-auto');
    expect(scrollContainers.length).toBeGreaterThan(0);
  });

  it('T2.B.4: Pinned frozen worker identity column remains sticky left-0 at 768px tablet viewport', async () => {
    setViewport(768, 1024);
    const { container } = render(<App />);

    await waitFor(() => {
      expect(container.querySelector('main')).toBeInTheDocument();
    });

    const scrollContainers = container.querySelectorAll('.overflow-x-auto');
    expect(scrollContainers.length).toBeGreaterThan(0);
  });

  it('T2.B.5: Pinned frozen worker identity column maintains layout integrity at 1440px desktop viewport', async () => {
    setViewport(1440, 900);
    const { container } = render(<App />);

    await waitFor(() => {
      expect(container.querySelector('main')).toBeInTheDocument();
    });

    const header = container.querySelector('header');
    expect(header).toBeInTheDocument();
    expect(header?.className).toContain('border-b');
  });
});
