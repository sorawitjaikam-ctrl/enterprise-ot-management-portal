import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor, within, act } from "@testing-library/react";
import React from "react";
import App from "../../src/App";
import StrategicActionHub, {
  generateBoardReadyCsv
} from "../../src/components/dashboard/StrategicActionHub";
import {
  calculateExecutiveForecastSummary,
  ExecutiveMonthEndForecastSummary
} from "../../src/utils/budgetForecastEngine";
import {
  computeProactiveRiskRadar,
  ProactiveRiskRadarSummary
} from "../../src/utils/riskRadarEngine";
import { Employee, Department } from "../../src/types";

describe("Challenger Exec 2: Adversarial Interaction, URL Sync, Batch Actions & Export Integrity", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
    window.history.replaceState(null, "", "/");
  });

  afterEach(() => {
    window.history.replaceState(null, "", "/");
    global.fetch = originalFetch;
  });

  // =========================================================================
  // SUITE 1: Mode Switching & Toggle State Dynamics
  // =========================================================================
  describe("Suite 1: Mode Switching between Executive and Operational View", () => {
    it("CH-EXEC-1.1: Defaults to Executive View with correct visual highlighting and controls", async () => {
      render(<App />);

      await waitFor(() => {
        expect(screen.getByRole("group", { name: /Dashboard View Mode/i })).toBeInTheDocument();
      });

      const execBtn = screen.getByRole("button", { name: /Executive View/i });
      const opBtn = screen.getByRole("button", { name: /Operational View/i });

      // Active styling assertions on Executive View button
      expect(execBtn.className).toContain("bg-[#0E3A66]");
      expect(execBtn.className).toContain("text-white");
      expect(opBtn.className).not.toContain("bg-[#0E3A66]");

      // Executive-specific sections should be rendered
      expect(screen.getByText("คำสั่งปฏิบัติการผู้บริหาร")).toBeInTheDocument();
      expect(screen.getByText("การคาดการณ์งบประมาณสิ้นเดือนและ Burn Rate")).toBeInTheDocument();
      expect(screen.getByText("เรดาร์ประเมินความเสี่ยงและความล้าสะสม (Risk Radar)")).toBeInTheDocument();

      // Operational-only controls should NOT be visible
      expect(screen.queryByText("ตัวกรองแดชบอร์ด")).not.toBeInTheDocument();
    });

    it("CH-EXEC-1.2: Switches bidirectionally between Executive and Operational views cleanly", async () => {
      const replaceSpy = vi.spyOn(window.history, "replaceState");
      render(<App />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /Operational View/i })).toBeInTheDocument();
      });

      // 1. Switch to Operational
      const opBtn = screen.getByRole("button", { name: /Operational View/i });
      fireEvent.click(opBtn);

      await waitFor(() => {
        expect(screen.getByText("ตัวกรองแดชบอร์ด")).toBeInTheDocument();
      });
      expect(screen.queryByText("คำสั่งปฏิบัติการผู้บริหาร")).not.toBeInTheDocument();
      expect(opBtn.className).toContain("bg-[#0E3A66]");

      // 2. Switch back to Executive
      const execBtn = screen.getByRole("button", { name: /Executive View/i });
      fireEvent.click(execBtn);

      await waitFor(() => {
        expect(screen.getByText("คำสั่งปฏิบัติการผู้บริหาร")).toBeInTheDocument();
      });
      expect(screen.queryByText("ตัวกรองแดชบอร์ด")).not.toBeInTheDocument();
      expect(execBtn.className).toContain("bg-[#0E3A66]");

      // Verify replaceState history calls
      expect(replaceSpy).toHaveBeenCalled();
    });

    it("CH-EXEC-1.3: Rapid consecutive toggle stress-test retains stability without crashes or desync", async () => {
      render(<App />);

      await waitFor(() => {
        expect(screen.getByRole("group", { name: /Dashboard View Mode/i })).toBeInTheDocument();
      });

      const execBtn = screen.getByRole("button", { name: /Executive View/i });
      const opBtn = screen.getByRole("button", { name: /Operational View/i });

      // Rapidly toggle back and forth 10 times
      for (let i = 0; i < 5; i++) {
        fireEvent.click(opBtn);
        fireEvent.click(execBtn);
      }

      // Final state must remain Executive View
      await waitFor(() => {
        expect(screen.getByText("คำสั่งปฏิบัติการผู้บริหาร")).toBeInTheDocument();
      });
      expect(execBtn.className).toContain("bg-[#0E3A66]");
      expect(screen.queryByText("ตัวกรองแดชบอร์ด")).not.toBeInTheDocument();
    });
  });

  // =========================================================================
  // SUITE 2: URL Routing Synchronization & Adversarial Query Manipulation
  // =========================================================================
  describe("Suite 2: URL Routing Synchronization & Adversarial Query Manipulation", () => {
    it("CH-EXEC-2.1: Deep links correctly into Operational View with ?mode=operational", async () => {
      window.history.replaceState(null, "", "/?mode=operational");
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText("ตัวกรองแดชบอร์ด")).toBeInTheDocument();
      });

      const opBtn = screen.getByRole("button", { name: /Operational View/i });
      expect(opBtn.className).toContain("bg-[#0E3A66]");
      expect(screen.queryByText("คำสั่งปฏิบัติการผู้บริหาร")).not.toBeInTheDocument();
    });

    it("CH-EXEC-2.2: Deep links correctly into Executive View with ?mode=executive", async () => {
      window.history.replaceState(null, "", "/?mode=executive");
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText("คำสั่งปฏิบัติการผู้บริหาร")).toBeInTheDocument();
      });

      const execBtn = screen.getByRole("button", { name: /Executive View/i });
      expect(execBtn.className).toContain("bg-[#0E3A66]");
    });

    it("CH-EXEC-2.3: Gracefully handles adversarial & invalid query parameters by falling back to Executive", async () => {
      const adversarialModes = [
        "/?mode=invalid_mode",
        "/?mode=SUPER_ADMIN",
        "/?mode=12345",
        "/?mode=",
        "/?mode=null",
        "/?mode=undefined",
        "/?mode=<script>alert(1)</script>",
        "/?mode=operational_extra",
      ];

      for (const query of adversarialModes) {
        window.history.replaceState(null, "", query);
        const { unmount } = render(<App />);

        await waitFor(() => {
          expect(screen.getByRole("group", { name: /Dashboard View Mode/i })).toBeInTheDocument();
        });

        const execBtn = screen.getByRole("button", { name: /Executive View/i });
        // Should safely fallback to executive
        expect(execBtn.className).toContain("bg-[#0E3A66]");
        expect(screen.getByText("คำสั่งปฏิบัติการผู้บริหาร")).toBeInTheDocument();

        unmount();
      }
    });

    it("CH-EXEC-2.4: Preserves pathname '/' and other query parameters during mode toggles", async () => {
      window.history.replaceState(null, "", "/?dept=inter2&ref=audit");
      const replaceSpy = vi.spyOn(window.history, "replaceState");

      render(<App />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /Operational View/i })).toBeInTheDocument();
      });

      const opBtn = screen.getByRole("button", { name: /Operational View/i });
      fireEvent.click(opBtn);

      expect(replaceSpy).toHaveBeenCalled();
      const lastCall = replaceSpy.mock.calls[replaceSpy.mock.calls.length - 1];
      const targetUrl = lastCall[2] as string;

      // Must preserve pathname '/' and existing query params while setting mode
      expect(targetUrl.startsWith("/")).toBe(true);
      expect(targetUrl).toContain("dept=inter2");
      expect(targetUrl).toContain("ref=audit");
      expect(targetUrl).toContain("mode=operational");
    });

    it("CH-EXEC-2.5: Responds to browser back/forward navigation (popstate) dynamically", async () => {
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText("คำสั่งปฏิบัติการผู้บริหาร")).toBeInTheDocument();
      });

      // Simulate user pressing browser back button to ?mode=operational
      act(() => {
        window.history.replaceState({ mode: "operational" }, "", "/?mode=operational");
        window.dispatchEvent(new PopStateEvent("popstate", { state: { mode: "operational" } }));
      });

      await waitFor(() => {
        expect(screen.getByText("ตัวกรองแดชบอร์ด")).toBeInTheDocument();
      });
      expect(screen.queryByText("คำสั่งปฏิบัติการผู้บริหาร")).not.toBeInTheDocument();

      // Simulate user pressing browser forward button to ?mode=executive
      act(() => {
        window.history.replaceState({ mode: "executive" }, "", "/?mode=executive");
        window.dispatchEvent(new PopStateEvent("popstate", { state: { mode: "executive" } }));
      });

      await waitFor(() => {
        expect(screen.getByText("คำสั่งปฏิบัติการผู้บริหาร")).toBeInTheDocument();
      });
    });
  });

  // =========================================================================
  // SUITE 3: Strategic Action Hub - Batch Approval Actions
  // =========================================================================
  describe("Suite 3: Batch Approval Action Trigger & State Integrity", () => {
    const mockForecast: ExecutiveMonthEndForecastSummary = {
      monthKey: "2026-08",
      asOfDay: 15,
      totalDays: 31,
      elapsedPct: 48.4,
      totalTargetBudgetThb: 900000,
      totalActualSpendToDateThb: 420000,
      totalTargetPacingToDateThb: 435483,
      totalDailyBurnRateThb: 28000,
      totalProjectedMonthEndSpendThb: 868000,
      totalProjectedVarianceThb: -32000,
      totalProjectedBurnRatePct: 96.4,
      criticalDeptsCount: 0,
      warningDeptsCount: 1,
      onTrackDeptsCount: 5,
      departments: []
    };

    const mockRisk: ProactiveRiskRadarSummary = {
      overallRiskScore: 35,
      riskStatus: "MODERATE",
      radarMetrics: {
        staffingSufficiency: 0.95,
        weeklyOtSafety: 0.9,
        restTurnaroundSafety: 0.88,
        workdayAdherence: 0.92,
        rosterResilience: 0.85
      },
      roleAssessments: [],
      departmentAssessments: []
    };

    it("CH-EXEC-3.1: Batch approves multiple pending requests, dispatches API calls, and updates state", async () => {
      const initialRequests = [
        { id: "REQ-001", employeeName: "Somchai", hours: 4, status: "pending" },
        { id: "REQ-002", employeeName: "Wichai", hours: 6, status: "pending" },
        { id: "REQ-003", employeeName: "Anan", hours: 3, status: "approved" },
      ];

      const setOtRequests = vi.fn();
      const mockFetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
      global.fetch = mockFetch;

      render(
        <StrategicActionHub
          monthKey="2026-08"
          otRequests={initialRequests}
          setOtRequests={setOtRequests}
          forecastSummary={mockForecast}
          riskSummary={mockRisk}
        />
      );

      // Verify pending count badge displays 2 (only REQ-001 and REQ-002 are pending)
      expect(screen.getByText("2")).toBeInTheDocument();

      const batchBtn = screen.getByRole("button", { name: /อนุมัติคำขอทั้งหมด/i });
      fireEvent.click(batchBtn);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(2);
      });

      // Assert API payloads for both pending requests
      expect(mockFetch).toHaveBeenCalledWith("/api/update-ot-request-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: "REQ-001", status: "approved" })
      });
      expect(mockFetch).toHaveBeenCalledWith("/api/update-ot-request-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: "REQ-002", status: "approved" })
      });

      // Verify setOtRequests was invoked with state updater function
      expect(setOtRequests).toHaveBeenCalled();
      const updater = setOtRequests.mock.calls[0][0];
      const updatedList = updater(initialRequests);

      // All pending should now be approved, existing approved remains approved
      expect(updatedList.find((r: any) => r.id === "REQ-001").status).toBe("approved");
      expect(updatedList.find((r: any) => r.id === "REQ-002").status).toBe("approved");
      expect(updatedList.find((r: any) => r.id === "REQ-003").status).toBe("approved");

      // Verify feedback banner
      await waitFor(() => {
        expect(screen.getByRole("status")).toHaveTextContent("อนุมัติคำขอ OT แบบกลุ่มสำเร็จแล้ว (2 รายการ)");
      });
    });

    it("CH-EXEC-3.2: Handles empty pending requests without dispatching API calls", async () => {
      const requestsNoPending = [
        { id: "REQ-101", employeeName: "Sombat", status: "approved" },
        { id: "REQ-102", employeeName: "Mana", status: "rejected" },
      ];

      const setOtRequests = vi.fn();
      const mockFetch = vi.fn();
      global.fetch = mockFetch;

      render(
        <StrategicActionHub
          monthKey="2026-08"
          otRequests={requestsNoPending}
          setOtRequests={setOtRequests}
          forecastSummary={mockForecast}
          riskSummary={mockRisk}
        />
      );

      // Pending badge displays 0
      expect(screen.getByText("0")).toBeInTheDocument();

      const batchBtn = screen.getByRole("button", { name: /อนุมัติคำขอทั้งหมด/i });
      fireEvent.click(batchBtn);

      // fetch must NOT be called
      expect(mockFetch).not.toHaveBeenCalled();
      expect(setOtRequests).not.toHaveBeenCalled();

      // Feedback banner informs user that no requests are pending
      await waitFor(() => {
        expect(screen.getByRole("status")).toHaveTextContent("ไม่มีรายการคำขอ OT ที่รออนุมัติ");
      });
    });

    it("CH-EXEC-3.3: Handles empty or undefined otRequests array safely", async () => {
      const setOtRequests = vi.fn();
      const mockFetch = vi.fn();
      global.fetch = mockFetch;

      render(
        <StrategicActionHub
          monthKey="2026-08"
          otRequests={[]}
          setOtRequests={setOtRequests}
          forecastSummary={mockForecast}
          riskSummary={mockRisk}
        />
      );

      expect(screen.getByText("0")).toBeInTheDocument();

      const batchBtn = screen.getByRole("button", { name: /อนุมัติคำขอทั้งหมด/i });
      fireEvent.click(batchBtn);

      expect(mockFetch).not.toHaveBeenCalled();
      await waitFor(() => {
        expect(screen.getByRole("status")).toHaveTextContent("ไม่มีรายการคำขอ OT ที่รออนุมัติ");
      });
    });

    it("CH-EXEC-3.4: Recovers gracefully when network API call rejects", async () => {
      const pendingReqs = [
        { id: "REQ-ERR-1", employeeName: "Chai", status: "pending" },
      ];
      const setOtRequests = vi.fn();
      // Simulate network error
      global.fetch = vi.fn().mockRejectedValue(new Error("Network disconnect"));

      render(
        <StrategicActionHub
          monthKey="2026-08"
          otRequests={pendingReqs}
          setOtRequests={setOtRequests}
          forecastSummary={mockForecast}
          riskSummary={mockRisk}
        />
      );

      const batchBtn = screen.getByRole("button", { name: /อนุมัติคำขอทั้งหมด/i });
      fireEvent.click(batchBtn);

      await waitFor(() => {
        expect(screen.getByRole("status")).toBeInTheDocument();
      });

      // Still gracefully updates local UI state
      expect(setOtRequests).toHaveBeenCalled();
    });
  });

  // =========================================================================
  // SUITE 4: Board Summary CSV Export - Data Integrity & Format Stress
  // =========================================================================
  describe("Suite 4: Board Summary CSV Export Integrity", () => {
    const sampleEmployees: Employee[] = [
      {
        id: "EMP-001",
        name: "สมชาย ใจดี",
        role: "Crane Operator",
        deptId: "INTER 2",
        department: "INTER 2",
        salary: 25000,
        shifts: JSON.stringify({
          "2026-08": ["M8", "M8", "M8", "M8", "OFF", "OFF", "M12", "M12", "M8", "M8"]
        })
      },
      {
        id: "EMP-002",
        name: "วิชัย มีสุข",
        role: "Foreman",
        deptId: "INTER 3",
        department: "INTER 3",
        salary: 32000,
        shifts: JSON.stringify({
          "2026-08": ["A8", "A8", "A8", "A8", "OFF", "OFF", "OND", "A8", "A8", "A8"]
        })
      }
    ];

    const sampleDepartments: Department[] = [
      { id: "INTER 2", name: "INTER 2", nameTh: "INTER 2" },
      { id: "INTER 3", name: "INTER 3", nameTh: "INTER 3" }
    ];

    it("CH-EXEC-4.1: Strictly prepends UTF-8 BOM '\\ufeff' (0xFEFF) at character 0", () => {
      const forecast = calculateExecutiveForecastSummary(sampleEmployees, sampleDepartments, "2026-08", 15);
      const risk = computeProactiveRiskRadar(sampleEmployees, sampleDepartments, "2026-08");
      const csv = generateBoardReadyCsv("2026-08", forecast, risk, []);

      expect(csv.startsWith("\ufeff")).toBe(true);
      expect(csv.charCodeAt(0)).toBe(0xfeff);
    });

    it("CH-EXEC-4.2: Contains all 4 mandatory executive section headers with correct bilingual titles", () => {
      const forecast = calculateExecutiveForecastSummary(sampleEmployees, sampleDepartments, "2026-08", 15);
      const risk = computeProactiveRiskRadar(sampleEmployees, sampleDepartments, "2026-08");
      const csv = generateBoardReadyCsv("2026-08", forecast, risk, []);

      expect(csv).toContain("รายงานสรุปสำหรับคณะกรรมการบริหาร (BOARD-READY EXECUTIVE SUMMARY)");
      expect(csv).toContain("--- ส่วนที่ 1: ดัชนีชี้วัดหลักของผู้บริหาร (EXECUTIVE KPI SCORECARD) ---");
      expect(csv).toContain("--- ส่วนที่ 2: การคาดการณ์งบประมาณรายแผนก (DEPARTMENT FORECAST BREAKDOWN) ---");
      expect(csv).toContain("--- ส่วนที่ 3: จุดเฝ้าระวังความเสี่ยงกำลังพลและความล้า (RISK & FATIGUE HOTSPOTS) ---");
      expect(csv).toContain("--- ส่วนที่ 4: ภาระผูกพันคำขอ OT รอการอนุมัติ (PENDING OT LIABILITIES) ---");
    });

    it("CH-EXEC-4.3: Produces zero 'undefined' or 'NaN' occurrences in standard executive dataset", () => {
      const forecast = calculateExecutiveForecastSummary(sampleEmployees, sampleDepartments, "2026-08", 15);
      const risk = computeProactiveRiskRadar(sampleEmployees, sampleDepartments, "2026-08");
      const otRequests = [
        { id: "OT-01", employeeName: "Somchai", deptId: "INTER 2", date: "2026-08-10", hours: 4, status: "pending" },
        { id: "OT-02", employeeName: "Wichai", deptId: "INTER 3", date: "2026-08-11", hours: 2.5, status: "approved" },
      ];

      const csv = generateBoardReadyCsv("2026-08", forecast, risk, otRequests);

      expect(csv).not.toContain("undefined");
      expect(csv).not.toContain("NaN");
      expect(csv).not.toContain("null");
    });

    it("CH-EXEC-4.4: Boundary stress: 0 employees, 0 departments, empty otRequests produce no NaN or undefined", () => {
      const emptyForecast = calculateExecutiveForecastSummary([], [], "2026-08", 15);
      const emptyRisk = computeProactiveRiskRadar([], [], "2026-08");
      const csv = generateBoardReadyCsv("2026-08", emptyForecast, emptyRisk, []);

      // BOM validation
      expect(csv.charCodeAt(0)).toBe(0xfeff);

      // Must NOT leak NaN or undefined under empty dataset
      expect(csv).not.toContain("undefined");
      expect(csv).not.toContain("NaN");

      // Verify structure is preserved
      expect(csv).toContain("EXECUTIVE KPI SCORECARD");
      expect(csv).toContain("DEPARTMENT FORECAST BREAKDOWN");
      expect(csv).toContain("RISK & FATIGUE HOTSPOTS");
      expect(csv).toContain("PENDING OT LIABILITIES");
    });

    it("CH-EXEC-4.5: RFC 4180 Escaping: safely escapes quotes, commas, and multi-byte Thai characters", () => {
      const customEmployees: Employee[] = [
        {
          id: "EMP-ESC",
          name: 'นาย "สมคิด" เลิศล้ำ, หัวหน้ากะ',
          role: 'ผู้เชี่ยวชาญ "Specialist", O&M',
          deptId: 'INTER 2, Zone "A"',
          salary: 40000,
          shifts: JSON.stringify({ "2026-08": ["M8"] })
        }
      ];

      const customDepts: Department[] = [
        { id: 'INTER 2, Zone "A"', name: 'INTER 2, Zone "A"', nameTh: 'อินเตอร์ 2 "โซน เอ"' }
      ];

      const customOt = [
        {
          id: "OT-COMMA-01",
          employeeName: 'นาย "สมคิด" เลิศล้ำ, หัวหน้ากะ',
          deptId: 'INTER 2, Zone "A"',
          date: "2026-08-15",
          hours: 5,
          status: "pending"
        }
      ];

      const forecast = calculateExecutiveForecastSummary(customEmployees, customDepts, "2026-08", 15);
      const risk = computeProactiveRiskRadar(customEmployees, customDepts, "2026-08");
      const csv = generateBoardReadyCsv("2026-08", forecast, risk, customOt);

      // Quotes inside cells should be doubled according to RFC 4180
      expect(csv).toContain('""สมคิด""');
      expect(csv).toContain('""Specialist""');
      expect(csv).toContain('"INTER 2, Zone ""A"""');
      expect(csv).not.toContain("undefined");
      expect(csv).not.toContain("NaN");
    });

    it("CH-EXEC-4.6: DOM click trigger: triggers Blob download with filename 'OT_Board_Executive_Summary_2026-08.csv'", async () => {
      const clickSpy = vi.fn();
      const originalCreateElement = document.createElement.bind(document);
      let createdAnchor: HTMLAnchorElement | null = null;

      vi.spyOn(document, "createElement").mockImplementation((tagName: string) => {
        const element = originalCreateElement(tagName);
        if (tagName === "a") {
          createdAnchor = element as HTMLAnchorElement;
          element.click = clickSpy;
        }
        return element;
      });

      const forecast = calculateExecutiveForecastSummary(sampleEmployees, sampleDepartments, "2026-08", 15);
      const risk = computeProactiveRiskRadar(sampleEmployees, sampleDepartments, "2026-08");

      render(
        <StrategicActionHub
          monthKey="2026-08"
          otRequests={[]}
          setOtRequests={() => {}}
          forecastSummary={forecast}
          riskSummary={risk}
        />
      );

      const exportBtn = screen.getByRole("button", { name: /ส่งออกสรุปบอร์ด \(CSV\)/i });
      fireEvent.click(exportBtn);

      expect(clickSpy).toHaveBeenCalled();
      expect(createdAnchor).not.toBeNull();
      expect(createdAnchor?.download).toBe("OT_Board_Executive_Summary_2026-08.csv");

      // Feedback notice displayed
      await waitFor(() => {
        expect(screen.getByRole("status")).toHaveTextContent("ดาวน์โหลดรายงานสรุปสำหรับบอร์ดบริหารเรียบร้อยแล้ว");
      });
    });
  });
});
