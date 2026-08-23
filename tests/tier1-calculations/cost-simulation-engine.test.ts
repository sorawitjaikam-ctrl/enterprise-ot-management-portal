import { describe, it, expect } from "vitest";
import {
  simulateShiftPaintingDelta,
  getShiftOtHours,
  calculateEmployeeMonthlyOt,
  normalizeEmployeeShifts
} from "../../src/utils/costSimulationEngine";
import { Employee } from "../../src/types";

describe("Tier 1: Live Cost & Safety Simulation Engine (costSimulationEngine)", () => {
  it("T1.CS.1: getShiftOtHours correctly calculates OT for all shift codes", () => {
    expect(getShiftOtHours("M8")).toBe(0);
    expect(getShiftOtHours("M12")).toBe(4);
    expect(getShiftOtHours("M16")).toBe(8);
    expect(getShiftOtHours("A8")).toBe(0);
    expect(getShiftOtHours("A12")).toBe(4);
    expect(getShiftOtHours("N8")).toBe(0);
    expect(getShiftOtHours("N12")).toBe(4);
    expect(getShiftOtHours("N16")).toBe(8);
    expect(getShiftOtHours("D")).toBe(0);
    expect(getShiftOtHours("OND")).toBe(8);
    expect(getShiftOtHours("O")).toBe(0);
    expect(getShiftOtHours("OFF")).toBe(0);
  });

  it("T1.CS.2: calculateEmployeeMonthlyOt computes accurate OT hours & THB cost with salary/240", () => {
    const emp: Employee = {
      id: "E1",
      name: "Somchai",
      deptId: "inter2",
      role: "Operator",
      salary: 24000, // hourly rate = 100
      targetOt: 0,
      actualOt: 0,
      otPct: 0,
      status: "On Track",
      groupName: "A",
      shifts: []
    };

    // Aug 3-7 (Mon-Fri) M12 = 5 * 4h = 20h normal OT
    // Aug 2 (Sun) M12 = 1 * 4h holiday OT + 1 holiday work day
    const shifts = Array(31).fill("OFF");
    shifts[1] = "M12"; // Aug 2 (Sun)
    shifts[2] = "M12"; // Aug 3 (Mon)
    shifts[3] = "M12"; // Aug 4 (Tue)
    shifts[4] = "M12"; // Aug 5 (Wed)
    shifts[5] = "M12"; // Aug 6 (Thu)
    shifts[6] = "M12"; // Aug 7 (Fri)

    const calc = calculateEmployeeMonthlyOt(emp, shifts, 2026, 8);
    expect(calc.normalOt).toBe(20);
    expect(calc.holidayOt).toBe(4);
    expect(calc.holidayWorkDays).toBe(1);
    expect(calc.totalOtHours).toBe(24);
    // (20*1.5 + 4*3.0 + 1*8*1.0) * 100 = (30 + 12 + 8) * 100 = 50 * 100 = 5,000 THB
    expect(calc.totalOtPay).toBe(5000);
  });

  it("T1.CS.3: simulateShiftPaintingDelta accurately calculates delta OT hours and delta THB cost", () => {
    const emp1: Employee = {
      id: "E1",
      name: "Somchai",
      deptId: "inter2",
      role: "Operator",
      salary: 24000, // 100 THB/hr
      targetOt: 0,
      actualOt: 0,
      otPct: 0,
      status: "On Track",
      groupName: "A",
      shifts: Array(31).fill("O")
    };

    const employees = [emp1];

    // User is painting Aug 3 (Mon) and Aug 4 (Tue) with M12 (+4h OT each = +8h total)
    // Delta cost = 8 * 1.5 * 100 = 1,200 THB
    const paintedCells = [
      { empId: "E1", dateStr: "2026-08-03", newShift: "M12" },
      { empId: "E1", dateStr: "2026-08-04", newShift: "M12" }
    ];

    const result = simulateShiftPaintingDelta({}, paintedCells, employees, 2026, 8, 150000);

    expect(result.baselineOtHours).toBe(0);
    expect(result.simulatedOtHours).toBe(8);
    expect(result.deltaOtHours).toBe(8);
    expect(result.baselineCostThb).toBe(0);
    expect(result.simulatedCostThb).toBe(1200);
    expect(result.deltaCostThb).toBe(1200);
    expect(result.newTotalCostThb).toBe(1200);
    expect(result.isBudgetExceeded).toBe(false);
    expect(result.budgetUtilizationPct).toBe(0.8);
  });

  it("T1.CS.4: simulateShiftPaintingDelta detects 150k department budget ceiling breach", () => {
    const emp1: Employee = {
      id: "E1",
      name: "Somchai",
      deptId: "inter2",
      role: "Operator",
      salary: 48000, // 200 THB/hr
      targetOt: 0,
      actualOt: 0,
      otPct: 0,
      status: "On Track",
      groupName: "A",
      shifts: Array(31).fill("OND") // 31 days of OND => very high OT
    };

    const result = simulateShiftPaintingDelta({}, [], [emp1], 2026, 8, 150000);

    expect(result.isBudgetExceeded).toBe(true);
    expect(result.complianceViolations.some(v => v.type === "budget_exceeded")).toBe(true);
  });

  it("T1.CS.5: simulateShiftPaintingDelta detects weekly OT limit (>36h) and rest period violation", () => {
    const emp1: Employee = {
      id: "E1",
      name: "Somchai",
      deptId: "inter2",
      role: "Operator",
      salary: 24000,
      targetOt: 0,
      actualOt: 0,
      otPct: 0,
      status: "On Track",
      groupName: "A",
      shifts: Array(31).fill("O")
    };

    // Painting 5 days of M16 (8h OT each = 40h OT in week 1 > 36h)
    const paintedCells = [
      { empId: "E1", dateStr: "2026-08-01", newShift: "M16" },
      { empId: "E1", dateStr: "2026-08-02", newShift: "M16" },
      { empId: "E1", dateStr: "2026-08-03", newShift: "M16" },
      { empId: "E1", dateStr: "2026-08-04", newShift: "M16" },
      { empId: "E1", dateStr: "2026-08-05", newShift: "M16" }
    ];

    const result = simulateShiftPaintingDelta({}, paintedCells, [emp1], 2026, 8, 150000);

    expect(result.complianceViolations.some(v => v.type === "weekly_ot")).toBe(true);
  });
});
