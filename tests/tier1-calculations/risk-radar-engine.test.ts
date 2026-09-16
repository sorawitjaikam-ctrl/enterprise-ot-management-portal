import { describe, it, expect } from "vitest";
import {
  getMinimumRequiredForRole,
  auditEmployeeProactiveRisks,
  computeProactiveRiskRadar,
  STANDARD_ROLE_MINIMUM_REQUIREMENTS
} from "../../src/utils/riskRadarEngine";
import { Employee, Department } from "../../src/types";

describe("Tier 1: Proactive Risk & Fatigue Radar Engine", () => {
  describe("getMinimumRequiredForRole", () => {
    it("returns established minimums for standard terminal roles", () => {
      expect(getMinimumRequiredForRole("พนักงานขับเครน", 10)).toBe(4);
      expect(getMinimumRequiredForRole("Crane Operator", 10)).toBe(4);
      expect(getMinimumRequiredForRole("ปากเรือ", 10)).toBe(3);
      expect(getMinimumRequiredForRole("ช่างขับจักรกลหนัก", 10)).toBe(4);
      expect(getMinimumRequiredForRole("ECC", 10)).toBe(2);
    });

    it("falls back gracefully for unknown roles", () => {
      expect(getMinimumRequiredForRole("Office Clerk", 2)).toBe(2);
      expect(getMinimumRequiredForRole("Unknown Role", 5)).toBe(3);
    });
  });

  describe("auditEmployeeProactiveRisks", () => {
    it("flags impending weekly OT when 7-day window accumulates >= 28h OT", () => {
      // 7 consecutive M12 shifts (4h OT each = 28h OT in 7 days)
      const emp: Employee = {
        id: "EMP_OT",
        name: "Overworked Operator",
        deptId: "INTER 2",
        role: "Crane Operator",
        targetOt: 48,
        actualOt: 0,
        otPct: 0,
        status: "On Track",
        groupName: "A",
        shifts: {
          "2026-08": ["M12", "M12", "M12", "M12", "M12", "M12", "M12", "O", "O"]
        }
      };

      const audit = auditEmployeeProactiveRisks(emp, "2026-08");
      expect(audit.hasImpendingWeeklyOt).toBe(true);
      expect(audit.maxWeeklyOt).toBe(28);
    });

    it("flags consecutive days near breach when non-off sequence is >= 5 days", () => {
      const emp: Employee = {
        id: "EMP_CONSEC",
        name: "Consecutive Worker",
        deptId: "INTER 2",
        role: "Worker",
        targetOt: 48,
        actualOt: 0,
        otPct: 0,
        status: "On Track",
        groupName: "A",
        shifts: {
          "2026-08": ["M8", "M8", "M8", "M8", "M8", "O", "O"]
        }
      };

      const audit = auditEmployeeProactiveRisks(emp, "2026-08");
      expect(audit.hasConsecutiveNearBreach).toBe(true);
      expect(audit.maxConsecutiveDays).toBe(5);
    });

    it("detects rest turnaround violations between night shift and subsequent morning shift", () => {
      const emp: Employee = {
        id: "EMP_REST",
        name: "Turnaround Worker",
        deptId: "INTER 2",
        role: "Operator",
        targetOt: 48,
        actualOt: 0,
        otPct: 0,
        status: "On Track",
        groupName: "A",
        shifts: {
          "2026-08": ["N12", "M8", "O", "N8", "D", "O"]
        }
      };

      const audit = auditEmployeeProactiveRisks(emp, "2026-08");
      expect(audit.restTurnaroundCount).toBe(2); // N12->M8 and N8->D
    });

    it("returns zero violations for balanced shifts", () => {
      const emp: Employee = {
        id: "EMP_BALANCED",
        name: "Balanced Worker",
        deptId: "INTER 2",
        role: "Worker",
        targetOt: 48,
        actualOt: 0,
        otPct: 0,
        status: "On Track",
        groupName: "A",
        shifts: {
          "2026-08": ["M8", "M8", "O", "O", "A8", "A8", "O", "O"]
        }
      };

      const audit = auditEmployeeProactiveRisks(emp, "2026-08");
      expect(audit.hasImpendingWeeklyOt).toBe(false);
      expect(audit.hasConsecutiveNearBreach).toBe(false);
      expect(audit.restTurnaroundCount).toBe(0);
    });
  });

  describe("computeProactiveRiskRadar", () => {
    it("computes comprehensive risk radar with 5-axis metrics and role assessments", () => {
      const employees: Employee[] = [
        // Role: Crane Operator (min required = 4). We only have 2 active -> shortfall = 2 -> CRITICAL
        {
          id: "CRANE_1",
          name: "Crane 1",
          deptId: "INTER 2",
          role: "Crane Operator",
          targetOt: 48,
          actualOt: 0,
          otPct: 0,
          status: "On Track",
          groupName: "A",
          shifts: { "2026-08": ["M12", "M12", "M12", "M12", "M12", "M12", "M12", "O"] } // 28h OT
        },
        {
          id: "CRANE_2",
          name: "Crane 2",
          deptId: "INTER 2",
          role: "Crane Operator",
          targetOt: 48,
          actualOt: 0,
          otPct: 0,
          status: "On Track",
          groupName: "A",
          shifts: { "2026-08": ["N12", "M8", "N12", "M8", "O"] }
        },
        // Role: Foreman (min required = 3). We have 3 active with balanced shifts -> LOW
        {
          id: "FOREMAN_1",
          name: "Foreman 1",
          deptId: "INTER 3",
          role: "Foreman",
          targetOt: 48,
          actualOt: 0,
          otPct: 0,
          status: "On Track",
          groupName: "B",
          shifts: { "2026-08": ["M8", "M8", "O", "O", "M8", "M8", "O"] }
        },
        {
          id: "FOREMAN_2",
          name: "Foreman 2",
          deptId: "INTER 3",
          role: "Foreman",
          targetOt: 48,
          actualOt: 0,
          otPct: 0,
          status: "On Track",
          groupName: "B",
          shifts: { "2026-08": ["A8", "A8", "O", "O", "A8", "A8", "O"] }
        },
        {
          id: "FOREMAN_3",
          name: "Foreman 3",
          deptId: "INTER 3",
          role: "Foreman",
          targetOt: 48,
          actualOt: 0,
          otPct: 0,
          status: "On Track",
          groupName: "B",
          shifts: { "2026-08": ["N8", "N8", "O", "O", "N8", "N8", "O"] }
        }
      ];

      const departments: Department[] = [
        { id: "INTER 2", name: "INTER 2", nameTh: "INTER 2" } as Department,
        { id: "INTER 3", name: "INTER 3", nameTh: "INTER 3" } as Department
      ];

      const summary = computeProactiveRiskRadar(employees, departments, "2026-08");

      // Verify 5-Axis Radar metrics are normalized within [0, 1]
      expect(summary.radarMetrics.staffingSufficiency).toBeGreaterThanOrEqual(0);
      expect(summary.radarMetrics.staffingSufficiency).toBeLessThanOrEqual(1);
      expect(summary.radarMetrics.weeklyOtSafety).toBeGreaterThanOrEqual(0);
      expect(summary.radarMetrics.weeklyOtSafety).toBeLessThanOrEqual(1);
      expect(summary.radarMetrics.restTurnaroundSafety).toBeGreaterThanOrEqual(0);
      expect(summary.radarMetrics.restTurnaroundSafety).toBeLessThanOrEqual(1);
      expect(summary.radarMetrics.workdayAdherence).toBeGreaterThanOrEqual(0);
      expect(summary.radarMetrics.workdayAdherence).toBeLessThanOrEqual(1);
      expect(summary.radarMetrics.rosterResilience).toBeGreaterThanOrEqual(0);
      expect(summary.radarMetrics.rosterResilience).toBeLessThanOrEqual(1);

      // Verify role assessments
      const craneRole = summary.roleAssessments.find(r => r.role === "Crane Operator");
      expect(craneRole).toBeDefined();
      expect(craneRole?.isUnderstaffed).toBe(true);
      expect(craneRole?.staffingShortfall).toBe(2);
      expect(craneRole?.riskLevel).toBe("CRITICAL");
      expect(craneRole?.proactiveWarning).toContain("อัตรากำลังขาดแคลน");

      const foremanRole = summary.roleAssessments.find(r => r.role === "Foreman");
      expect(foremanRole).toBeDefined();
      expect(foremanRole?.isUnderstaffed).toBe(false);
      expect(foremanRole?.riskLevel).toBe("LOW");

      // Verify department assessments
      const inter2Dept = summary.departmentAssessments.find(d => d.deptId === "INTER 2");
      expect(inter2Dept).toBeDefined();
      expect(inter2Dept?.riskLevel).toBe("CRITICAL");
      expect(inter2Dept?.staffingGap).toBe(2);

      // Overall status should reflect CRITICAL due to INTER 2
      expect(summary.riskStatus).toBe("CRITICAL");
    });
  });
});
