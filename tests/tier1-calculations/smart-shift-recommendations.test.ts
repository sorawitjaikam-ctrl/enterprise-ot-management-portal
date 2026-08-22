import { describe, it, expect } from "vitest";
import {
  getComplementaryShift,
  generateTwoTeamPairSchedules,
  generateThreeTeamRotatingSchedules,
  generate4On2OffSchedule,
  auditEmployeeShiftsCompliance,
  analyzeDepartmentShiftCoverage,
  SHIFT_DEFINITIONS
} from "../../src/utils/shiftRecommendation";

describe("Tier 1: Smart Shift Recommendation & Pair Scheduling Engine", () => {
  it("suggests complementary Day/Night shift for 12-hour paired operations", () => {
    const m12Pair = getComplementaryShift("M12");
    expect(m12Pair.suggestedCode).toBe("N12");
    expect(m12Pair.rationale).toContain("กะดึก");

    const n12Pair = getComplementaryShift("N12");
    expect(n12Pair.suggestedCode).toBe("M12");
    expect(n12Pair.rationale).toContain("กะเช้า");
  });

  it("suggests complementary rotating shifts for 8-hour 3-team operations", () => {
    expect(getComplementaryShift("M8").suggestedCode).toBe("A8");
    expect(getComplementaryShift("A8").suggestedCode).toBe("N8");
    expect(getComplementaryShift("N8").suggestedCode).toBe("M8");
  });

  it("generates balanced 2-team 12h alternating schedules (Team A and Team B)", () => {
    const { teamA, teamB } = generateTwoTeamPairSchedules(30);
    expect(teamA).toHaveLength(30);
    expect(teamB).toHaveLength(30);

    expect(teamA[0]).toBe("M12");
    expect(teamB[0]).toBe("N12");

    expect(teamA[4]).toBe("O");
    expect(teamB[4]).toBe("O");
  });

  it("generates 4-on-2-off standard operational schedule", () => {
    const schedule = generate4On2OffSchedule(30, "M12");
    expect(schedule).toHaveLength(30);
    expect(schedule.slice(0, 4)).toEqual(["M12", "M12", "M12", "M12"]);
    expect(schedule.slice(4, 6)).toEqual(["O", "O"]);
    expect(schedule.slice(6, 10)).toEqual(["M12", "M12", "M12", "M12"]);
  });
});

describe("Tier 1: Thai Labor Law & Safety Compliance Auditing", () => {
  it("detects weekly OT accumulation exceeding 36 hours limit", () => {
    const heavyOtShifts = ["M16", "M16", "M16", "M16", "M16", "O", "O", ...Array(23).fill("O")];
    const alerts = auditEmployeeShiftsCompliance(heavyOtShifts, "2026-08");

    const otAlert = alerts.find(a => a.type === "weekly_ot");
    expect(otAlert).toBeDefined();
    expect(otAlert?.level).toBe("danger");
    expect(otAlert?.message).toContain("36 ชม./สัปดาห์");
  });

  it("detects consecutive work days exceeding 6 days without rest day", () => {
    const longStretch = ["M8", "M8", "M8", "M8", "M8", "M8", "M8", "M8", ...Array(22).fill("O")];
    const alerts = auditEmployeeShiftsCompliance(longStretch, "2026-08");

    const consecutiveAlert = alerts.find(a => a.type === "consecutive_days");
    expect(consecutiveAlert).toBeDefined();
    expect(consecutiveAlert?.level).toBe("warning");
    expect(consecutiveAlert?.message).toContain("ทำงานติดต่อกัน");
  });

  it("detects insufficient rest period when transitioning from Night to Morning shift", () => {
    const quickTurnaround = ["N12", "M12", ...Array(28).fill("O")];
    const alerts = auditEmployeeShiftsCompliance(quickTurnaround, "2026-08");

    const restAlert = alerts.find(a => a.type === "rest_period");
    expect(restAlert).toBeDefined();
    expect(restAlert?.level).toBe("danger");
    expect(restAlert?.message).toContain("เวลาพักผ่อนไม่ถึง 11 ชม.");
  });

  it("passes cleanly with zero alerts on balanced 2-team schedule", () => {
    const { teamA } = generateTwoTeamPairSchedules(30);
    const alerts = auditEmployeeShiftsCompliance(teamA, "2026-08");
    const dangerAlerts = alerts.filter(a => a.level === "danger");
    expect(dangerAlerts).toHaveLength(0);
  });
});
