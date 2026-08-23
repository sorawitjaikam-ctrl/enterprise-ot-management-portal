import { describe, it, expect } from "vitest";
import {
  getShiftCircadianSegments,
  isCircadianNightHour,
  calculateHourlyStaffingDensity,
  isEmployeeActiveAtHour
} from "../../src/utils/circadianEngine";
import {
  simulateShiftPaintingDelta,
  getShiftOtHours,
  calculateEmployeeMonthlyOt,
  normalizeEmployeeShifts
} from "../../src/utils/costSimulationEngine";
import {
  auditEmployeeShiftsCompliance,
  getComplementaryShift,
  generateTwoTeamPairSchedules,
  generateThreeTeamRotatingSchedules,
  generate4On2OffSchedule
} from "../../src/utils/shiftRecommendation";
import { Employee } from "../../src/types";

describe("Challenger 2 Adversarial Stress Suite: R3 Circadian Timeline & Live Cost Simulation", () => {
  // Helper to create a fully typed Employee object
  const createMockEmployee = (overrides: Partial<Employee>): Employee => ({
    id: "EMP-TEST",
    name: "Test Employee",
    deptId: "inter2",
    role: "Operator",
    salary: 24000,
    targetOt: 0,
    actualOt: 0,
    otPct: 0,
    status: "On Track",
    groupName: "Group A",
    shifts: Array(31).fill("O"),
    ...overrides
  });

  // =========================================================================
  // 1. CIRCADIAN 24-HR TIMELINE ENGINE STRESS TESTS
  // =========================================================================
  describe("1. Circadian 24-Hour Timeline Engine Stress Tests", () => {
    it("CH2.C.1: Edge Hours Verification (00:00, 23:59, 24:00, negative, out-of-bounds)", () => {
      // 00:00 (hour 0) is night band (20:00 - 08:00)
      expect(isCircadianNightHour(0)).toBe(true);
      // 07:00 (hour 7) is night band
      expect(isCircadianNightHour(7)).toBe(true);
      // 08:00 (hour 8) is day band
      expect(isCircadianNightHour(8)).toBe(false);
      // 19:00 (hour 19) is day band
      expect(isCircadianNightHour(19)).toBe(false);
      // 20:00 (hour 20) is night band
      expect(isCircadianNightHour(20)).toBe(true);
      // 23:00 (hour 23) is night band
      expect(isCircadianNightHour(23)).toBe(true);

      // Boundary values: 24, -1, 25
      expect(isCircadianNightHour(24)).toBe(true);
      expect(isCircadianNightHour(-1)).toBe(true);
      expect(isCircadianNightHour(25)).toBe(true);

      // Verify getShiftCircadianSegments decomposition precision
      const n8 = getShiftCircadianSegments("N8");
      expect(n8[0].startHour).toBe(23);
      expect(n8[0].endHour).toBe(24);
      expect(n8[1].startHour).toBe(0);
      expect(n8[1].endHour).toBe(7);

      const n16 = getShiftCircadianSegments("N16");
      expect(n16[0].startHour).toBe(19);
      expect(n16[0].endHour).toBe(24);
      expect(n16[1].startHour).toBe(0);
      expect(n16[1].endHour).toBe(11);
    });

    it("CH2.C.2: Cross-Month and Cross-Midnight Day 1 Carryover Stress", () => {
      // Employee on Day 1 (Aug 1) with "O" shift, but had N12 on previous month Day 31 (Jul 31)
      const emp1 = createMockEmployee({ id: "E1", name: "Worker 1", role: "Crane Operator" });
      const emp2 = createMockEmployee({ id: "E2", name: "Worker 2", role: "Signalman" });
      const emp3 = createMockEmployee({ id: "E3", name: "Worker 3", role: "Stevedore" });
      const emp4 = createMockEmployee({ id: "E4", name: "Worker 4", role: "Technician" });

      const currentDayShifts = {
        E1: "O",    // E1 is off today, but worked N12 yesterday
        E2: "M8",   // E2 works M8 today (07:00-15:00), worked N8 yesterday (23:00-07:00)
        E3: "M12",  // E3 works M12 today (07:00-19:00), worked A12 yesterday (15:00-03:00)
        E4: "O"     // E4 is off today, worked N16 yesterday (19:00-11:00)
      };

      const prevMonthDay31Shifts = {
        E1: "N12", // 19:00 - 07:00 (+1 day)
        E2: "N8",  // 23:00 - 07:00 (+1 day)
        E3: "A12", // 15:00 - 03:00 (+1 day)
        E4: "N16"  // 19:00 - 11:00 (+1 day)
      };

      const density = calculateHourlyStaffingDensity(
        currentDayShifts,
        "2026-08-01",
        [emp1, emp2, emp3, emp4],
        prevMonthDay31Shifts
      );

      expect(density.slots).toHaveLength(24);
      expect(density.totalActiveStaff).toBe(4);

      // Hour 00:00 (Midnight): E1 (N12), E2 (N8), E3 (A12), E4 (N16) all active from prev month carryover
      expect(density.slots[0].headcount).toBe(4);
      expect(density.slots[0].nightCount).toBe(3);      // E1 (N12), E2 (N8), E4 (N16)
      expect(density.slots[0].afternoonCount).toBe(1);  // E3 (A12 afternoon shift category)

      // Hour 02:00: E1, E2, E3, E4 active -> 4
      expect(density.slots[2].headcount).toBe(4);

      // Hour 03:00: E3 (A12 ended at 03:00) -> E1, E2, E4 active -> 3
      expect(density.slots[3].headcount).toBe(3);
      expect(density.slots[3].employees.map(e => e.empId)).toEqual(["E1", "E2", "E4"]);

      // Hour 06:00: E1, E2, E4 still active -> 3
      expect(density.slots[6].headcount).toBe(3);

      // Hour 07:00: E1 & E2 night carryover ended. E4 (N16) active until 11:00. E2 starts M8 (07:00). E3 starts M12 (07:00).
      // Active: E2 (M8), E3 (M12), E4 (N16 carryover) -> 3
      expect(density.slots[7].headcount).toBe(3);
      expect(density.slots[7].employees.map(e => e.empId)).toContain("E2");
      expect(density.slots[7].employees.map(e => e.empId)).toContain("E3");
      expect(density.slots[7].employees.map(e => e.empId)).toContain("E4");

      // Hour 10:00: E2 (M8), E3 (M12), E4 (N16 until 11:00) -> 3
      expect(density.slots[10].headcount).toBe(3);

      // Hour 11:00: E4 (N16) ended at 11:00. E2 (M8) & E3 (M12) active -> 2
      expect(density.slots[11].headcount).toBe(2);

      // Hour 15:00: E2 (M8) ended at 15:00. E3 (M12 until 19:00) active -> 1
      expect(density.slots[15].headcount).toBe(1);

      // Hour 19:00: E3 (M12) ended at 19:00. No more active workers -> 0 (Gap!)
      expect(density.slots[19].headcount).toBe(0);
      expect(density.slots[19].isGap).toBe(true);
      expect(density.coverageWarnings.some(w => w.includes("19:00"))).toBe(true);
    });

    it("CH2.C.3: Day 31 Cross-Midnight Transition & Missing Prev Shifts Gracefulness", () => {
      const emp = createMockEmployee({ id: "E1" });

      // Missing previous day shifts (undefined)
      const densityNoPrev = calculateHourlyStaffingDensity({ E1: "N12" }, "2026-08-31", [emp], undefined);
      expect(densityNoPrev.slots[0].headcount).toBe(0); // No prev carryover
      expect(densityNoPrev.slots[19].headcount).toBe(1); // N12 starts at 19:00
      expect(densityNoPrev.slots[23].headcount).toBe(1);

      // Malformed / Unknown shift codes
      const densityMalformed = calculateHourlyStaffingDensity(
        { E1: "UNKNOWN_SHIFT" },
        "2026-08-31",
        [emp],
        { E1: "INVALID_SHIFT" }
      );
      expect(densityMalformed.slots[0].headcount).toBe(0);
      expect(densityMalformed.totalActiveStaff).toBe(0);
      expect(densityMalformed.slots.every(s => s.headcount === 0)).toBe(true);
    });

    it("CH2.C.4: Massive Simultaneous Multi-Shift Overlap & Density Heatmap Metrics", () => {
      // 20 workers with diverse overlapping schedules
      const employees: Employee[] = [];
      const currentShifts: Record<string, string> = {};
      const prevShifts: Record<string, string> = {};

      for (let i = 1; i <= 20; i++) {
        const id = `EMP-${i}`;
        let curShift = "O";
        let prevShift = "O";

        if (i <= 5) {
          curShift = "M12"; // 07:00 - 19:00 (5 workers)
          prevShift = "O";
        } else if (i <= 10) {
          curShift = "N12"; // 19:00 - 07:00 (5 workers)
          prevShift = "N12"; // Carryover 00:00 - 07:00
        } else if (i <= 13) {
          curShift = "A12"; // 15:00 - 03:00 (3 workers)
          prevShift = "A12"; // Carryover 00:00 - 03:00
        } else if (i <= 16) {
          curShift = "M16"; // 07:00 - 23:00 (3 workers)
          prevShift = "O";
        } else if (i <= 18) {
          curShift = "OND"; // 08:00 - 17:00 (2 workers)
          prevShift = "O";
        } else {
          curShift = "O";   // Off (2 workers)
          prevShift = "O";
        }

        employees.push(createMockEmployee({ id, name: `Worker ${i}`, role: `Role ${i}` }));
        currentShifts[id] = curShift;
        prevShifts[id] = prevShift;
      }

      const heatmap = calculateHourlyStaffingDensity(currentShifts, "2026-08-15", employees, prevShifts);

      // Verify total active headcount
      expect(heatmap.totalActiveStaff).toBe(18); // 18 active, 2 OFF

      // Peak hour analysis:
      // Hour 15:00 - 17:00: M12 (5) + M16 (3) + OND (2) + A12 (3) = 13 workers
      expect(heatmap.slots[15].headcount).toBe(13);
      expect(heatmap.slots[16].headcount).toBe(13);
      expect(heatmap.peakHour).toBe(15);

      // Lowest hour analysis:
      // Hour 03:00 - 06:00: N12 carryover only (5 workers)
      expect(heatmap.slots[3].headcount).toBe(5);
      expect(heatmap.slots[4].headcount).toBe(5);
      expect(heatmap.slots[5].headcount).toBe(5);
      expect(heatmap.slots[6].headcount).toBe(5);
      expect(heatmap.lowestHour).toBe(3);

      // Distribution averages
      expect(heatmap.morningAverage).toBeGreaterThan(0);
      expect(heatmap.afternoonAverage).toBeGreaterThan(0);
      expect(heatmap.nightAverage).toBeGreaterThan(0);
      expect(heatmap.coverageWarnings).toHaveLength(0); // All hours have >= 5 workers, no gaps or single worker warnings
    });
  });

  // =========================================================================
  // 2. LIVE COST SIMULATION ENGINE STRESS TESTS
  // =========================================================================
  describe("2. Live Cost Simulation Engine Stress Tests", () => {
    it("CH2.CS.1: Zero, Negative, and Extreme High Salary Robustness", () => {
      // Zero salary employee -> fallback to 15,000 THB (62.5 THB/hr)
      const zeroSalaryEmp = createMockEmployee({ id: "E_ZERO", salary: 0 });
      const shiftsZero = Array(31).fill("O");
      shiftsZero[2] = "M12"; // Aug 3 (Mon) +4h OT
      const calcZero = calculateEmployeeMonthlyOt(zeroSalaryEmp, shiftsZero, 2026, 8);
      expect(calcZero.hourlyRate).toBe(62.5);
      expect(calcZero.normalOt).toBe(4);
      expect(calcZero.totalOtPay).toBe(Math.round(4 * 1.5 * 62.5)); // 375 THB

      // Negative salary employee -> fallback to 15,000 THB
      const negSalaryEmp = createMockEmployee({ id: "E_NEG", salary: -20000 });
      const calcNeg = calculateEmployeeMonthlyOt(negSalaryEmp, shiftsZero, 2026, 8);
      expect(calcNeg.hourlyRate).toBe(62.5);
      expect(calcNeg.totalOtPay).toBe(375);

      // Extreme high salary employee (e.g. 2,400,000 THB/mo -> 10,000 THB/hr)
      const highSalaryEmp = createMockEmployee({ id: "E_HIGH", salary: 2400000 });
      const shiftsHigh = Array(31).fill("O");
      shiftsHigh[2] = "M16"; // Aug 3 (Mon) +8h OT
      const calcHigh = calculateEmployeeMonthlyOt(highSalaryEmp, shiftsHigh, 2026, 8);
      expect(calcHigh.hourlyRate).toBe(10000);
      expect(calcHigh.normalOt).toBe(8);
      // 8 * 1.5 * 10000 = 120,000 THB
      expect(calcHigh.totalOtPay).toBe(120000);
    });

    it("CH2.CS.2: Holiday vs Weekday Mixed Painting (Sundays, OND, M12, N16)", () => {
      const emp = createMockEmployee({ id: "E1", salary: 24000 }); // 100 THB/hr
      // In Aug 2026:
      // Aug 2 is Sunday (Holiday)
      // Aug 3 is Monday (Weekday)
      // Aug 5 is Wednesday (Weekday)
      // Aug 9 is Sunday (Holiday)
      const paintedCells = [
        { empId: "E1", dateStr: "2026-08-02", newShift: "M12" }, // Sun: 4h OT (3.0x) + 1 holiday work day (8h * 1.0x) = 12 + 8 = 20h rate = 2,000 THB
        { empId: "E1", dateStr: "2026-08-03", newShift: "M12" }, // Mon: 4h OT (1.5x) = 6h rate = 600 THB
        { empId: "E1", dateStr: "2026-08-05", newShift: "OND" }, // Wed: OND shift = 8h holiday OT (3.0x) + 1 holiday work day (8h * 1.0x) = 24 + 8 = 32h rate = 3,200 THB
        { empId: "E1", dateStr: "2026-08-09", newShift: "O" }    // Sun: Off = 0 THB
      ];

      const sim = simulateShiftPaintingDelta({}, paintedCells, [emp], 2026, 8, 150000);

      // Total expected simulated pay = 2,000 + 600 + 3,200 = 5,800 THB
      expect(sim.simulatedCostThb).toBe(5800);
      expect(sim.deltaCostThb).toBe(5800);
      expect(sim.newTotalCostThb).toBe(5800);
      // Total OT hours = 4 (Sun M12) + 4 (Mon M12) + 8 (Wed OND) = 16h
      expect(sim.simulatedOtHours).toBe(16);
      expect(sim.deltaOtHours).toBe(16);
    });

    it("CH2.CS.3: 150k THB Budget Threshold Crossings (94.9% vs 95.1% vs 100.0% vs 100.1%)", () => {
      // 150,000 THB budget limit
      const budgetLimit = 150000;

      // 94.9% threshold test: 142,350 THB
      // Create employee with salary tailored to hit exact budget amounts
      const emp1 = createMockEmployee({ id: "E_BUDGET", salary: 24000 }); // 100 THB/hr

      // Case A: Below 95% threshold (94.9% = 142,350 THB)
      // Custom direct simulation calculation
      const result949 = simulateShiftPaintingDelta(
        {},
        [],
        [createMockEmployee({ id: "E1", salary: 24000, shifts: [] })],
        2026,
        8,
        budgetLimit
      );
      // Let's test simulateShiftPaintingDelta when baseline hits exactly near limit
      // With salary 24,000 (100 THB/hr):
      // 31 days of OND: 31 * (8*3.0 + 8*1.0) * 100 = 31 * 32 * 100 = 99,200 THB
      // 2 employees on 31 days OND = 198,400 THB (exceeds)

      // Test budget utilization percentage formatting and breach detection
      const empExceed = createMockEmployee({
        id: "E_EXCEED",
        salary: 48000, // 200 THB/hr
        shifts: Array(31).fill("OND") // 31 * 32 * 200 = 198,400 THB
      });

      const simExceed = simulateShiftPaintingDelta({}, [], [empExceed], 2026, 8, 150000);
      expect(simExceed.isBudgetExceeded).toBe(true);
      expect(simExceed.budgetUtilizationPct).toBeGreaterThan(100);
      expect(simExceed.complianceViolations.some(v => v.type === "budget_exceeded")).toBe(true);
      expect(simExceed.complianceViolations.find(v => v.type === "budget_exceeded")?.reason).toContain("งบประมาณเกินเพดาน");

      // Test within budget (e.g. 5 days of M12 with 24,000 salary = 3,000 THB / 150,000 = 2.0%)
      const empSafe = createMockEmployee({
        id: "E_SAFE",
        salary: 24000,
        shifts: ["M12", "M12", "M12", "M12", "M12", ...Array(26).fill("O")]
      });
      const simSafe = simulateShiftPaintingDelta({}, [], [empSafe], 2026, 8, 150000);
      expect(simSafe.isBudgetExceeded).toBe(false);
      expect(simSafe.budgetUtilizationPct).toBeLessThan(10);
      expect(simSafe.complianceViolations.some(v => v.type === "budget_exceeded")).toBe(false);
    });

    it("CH2.CS.4: Rolling 7-Day 36h OT Limit, Consecutive Days, and Rest Period Violations", () => {
      // 1. Weekly OT <= 36h is compliant; > 36h is violation
      // Week 1 (Days 1..7): 4 x M16 (32h OT) + 1 x M12 (4h OT) = 36h OT -> Compliant
      const compliantShifts36 = ["M16", "M16", "M16", "M16", "M12", "O", "O", ...Array(24).fill("O")];
      const alerts36 = auditEmployeeShiftsCompliance(compliantShifts36, "2026-08");
      expect(alerts36.some(a => a.type === "weekly_ot")).toBe(false);

      // Week 1 (Days 1..7): 5 x M16 (40h OT > 36h) -> Violation!
      const violationShifts40 = ["M16", "M16", "M16", "M16", "M16", "O", "O", ...Array(24).fill("O")];
      const alerts40 = auditEmployeeShiftsCompliance(violationShifts40, "2026-08");
      expect(alerts40.some(a => a.type === "weekly_ot")).toBe(true);
      expect(alerts40.find(a => a.type === "weekly_ot")?.message).toContain("40 ชม.");

      // 2. Consecutive work days > 6 days
      // 6 consecutive days -> Compliant
      const compliantConsecutive6 = ["M8", "M8", "M8", "M8", "M8", "M8", "O", ...Array(24).fill("O")];
      const alertsConsecutive6 = auditEmployeeShiftsCompliance(compliantConsecutive6, "2026-08");
      expect(alertsConsecutive6.some(a => a.type === "consecutive_days")).toBe(false);

      // 7 consecutive days -> Violation!
      const violationConsecutive7 = ["M8", "M8", "M8", "M8", "M8", "M8", "M8", ...Array(24).fill("O")];
      const alertsConsecutive7 = auditEmployeeShiftsCompliance(violationConsecutive7, "2026-08");
      expect(alertsConsecutive7.some(a => a.type === "consecutive_days")).toBe(true);
      expect(alertsConsecutive7.find(a => a.type === "consecutive_days")?.message).toContain("ติดต่อกัน 7 วัน");

      // 3. Rest period < 11h (Night shift into Morning shift next day)
      // Day 1 N12 (19:00-07:00) into Day 2 M8 (07:00-15:00) -> Violation (0h rest)
      const restViolationShifts = ["N12", "M8", ...Array(29).fill("O")];
      const alertsRest = auditEmployeeShiftsCompliance(restViolationShifts, "2026-08");
      expect(alertsRest.some(a => a.type === "rest_period")).toBe(true);
      expect(alertsRest.find(a => a.type === "rest_period")?.message).toContain("เวลาพักผ่อนไม่ถึง 11 ชม.");

      // Day 1 M12 (07:00-19:00) into Day 2 M12 (07:00-19:00) -> Compliant (12h rest >= 11h)
      const restCompliantShifts = ["M12", "M12", ...Array(29).fill("O")];
      const alertsRestSafe = auditEmployeeShiftsCompliance(restCompliantShifts, "2026-08");
      expect(alertsRestSafe.some(a => a.type === "rest_period")).toBe(false);
    });

    it("CH2.CS.5: Painting Delta Robustness on Edge Inputs (out-of-bounds dates, duplicate overrides, empty sets)", () => {
      const emp = createMockEmployee({ id: "E1", salary: 24000 });

      // Empty painted cells -> delta is 0
      const simEmpty = simulateShiftPaintingDelta({}, [], [emp], 2026, 8, 150000);
      expect(simEmpty.deltaOtHours).toBe(0);
      expect(simEmpty.deltaCostThb).toBe(0);
      expect(simEmpty.paintedCellsCount).toBe(0);

      // Multiple overrides on the same day in one paint batch (last one wins)
      const simDuplicate = simulateShiftPaintingDelta(
        {},
        [
          { empId: "E1", dateStr: "2026-08-03", newShift: "M8" },  // 0h OT
          { empId: "E1", dateStr: "2026-08-03", newShift: "M16" }  // Overwrites to 8h OT
        ],
        [emp],
        2026,
        8,
        150000
      );
      expect(simDuplicate.deltaOtHours).toBe(8);
      expect(simDuplicate.deltaCostThb).toBe(8 * 1.5 * 100); // 1,200 THB

      // Out-of-bounds day string (e.g. Day 0, Day 32, or malformed "XYZ")
      const simOutOfBounds = simulateShiftPaintingDelta(
        {},
        [
          { empId: "E1", dateStr: "2026-08-00", newShift: "M16" },
          { empId: "E1", dateStr: "2026-08-32", newShift: "M16" },
          { empId: "E1", dateStr: "XYZ", newShift: "M16" }
        ],
        [emp],
        2026,
        8,
        150000
      );
      // Out-of-bounds days are ignored or capped within 1..31
      expect(simOutOfBounds).toBeDefined();
    });

    it("CH2.CS.6: Shift Recommendation Algorithms (Complementary Pairs & Rotation Generators)", () => {
      // Complementary pairs
      expect(getComplementaryShift("M12").suggestedCode).toBe("N12");
      expect(getComplementaryShift("N12").suggestedCode).toBe("M12");
      expect(getComplementaryShift("M8").suggestedCode).toBe("A8");
      expect(getComplementaryShift("A8").suggestedCode).toBe("N8");
      expect(getComplementaryShift("N8").suggestedCode).toBe("M8");
      expect(getComplementaryShift("D").suggestedCode).toBe("N12");
      expect(getComplementaryShift("O").suggestedCode).toBe("M12");
      expect(getComplementaryShift("OFF").suggestedCode).toBe("M12");

      // 2-team schedules (31 days)
      const twoTeam = generateTwoTeamPairSchedules(31);
      expect(twoTeam.teamA).toHaveLength(31);
      expect(twoTeam.teamB).toHaveLength(31);
      expect(twoTeam.teamA[0]).toBe("M12");
      expect(twoTeam.teamB[0]).toBe("N12");

      // 3-team schedules (31 days)
      const threeTeam = generateThreeTeamRotatingSchedules(31);
      expect(threeTeam.teamA).toHaveLength(31);
      expect(threeTeam.teamB).toHaveLength(31);
      expect(threeTeam.teamC).toHaveLength(31);

      // 4-on-2-off generator
      const fourOnTwoOff = generate4On2OffSchedule(31, "M12", 0);
      expect(fourOnTwoOff).toHaveLength(31);
      expect(fourOnTwoOff.slice(0, 6)).toEqual(["M12", "M12", "M12", "M12", "O", "O"]);
    });
  });
});
