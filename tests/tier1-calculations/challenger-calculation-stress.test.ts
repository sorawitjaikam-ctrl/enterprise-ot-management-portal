import { describe, it, expect } from "vitest";
import {
  getDaysInMonth,
  calculateEmployeeOtToDay,
  calculateDepartmentBudgetForecast,
  calculateExecutiveForecastSummary,
  parseEmployeeShifts,
  DEFAULT_DEPARTMENT_BUDGET_CEILING
} from "../../src/utils/budgetForecastEngine";
import {
  getMinimumRequiredForRole,
  isEmployeeActive,
  auditEmployeeProactiveRisks,
  computeProactiveRiskRadar
} from "../../src/utils/riskRadarEngine";
import { Employee, Department } from "../../src/types";

describe("Challenger Calculation Stress Suite: Executive Dashboard Boundary & Invariant Audit", () => {
  // Helper to construct baseline mock employee
  const makeMockEmployee = (overrides: Partial<Employee> = {}): Employee => ({
    id: "EMP_CHALLENGER_01",
    name: "Somchai Challenger",
    deptId: "INTER 2",
    department: "INTER 2",
    role: "Crane Operator",
    targetOt: 48,
    actualOt: 0,
    otPct: 0,
    status: "On Track",
    groupName: "A",
    salary: 24000,
    employmentStatus: "active",
    shifts: {
      "2026-08": Array(31).fill("M8")
    },
    ...overrides
  });

  // =========================================================================
  // 1. TEMPORAL BOUNDARY CONDITIONS (Day 0, Day 1, Month-End, Out-of-Bounds)
  // =========================================================================
  describe("1. Temporal Boundary Conditions & Zero-Division Protections", () => {
    it("CH.TIME.1: Day 0 elapsed time protects against division by zero in burn rate and pacing", () => {
      const emp = makeMockEmployee({
        salary: 24000,
        shifts: { "2026-08": Array(31).fill("M12") } // 4h OT each day
      });

      // calculateEmployeeOtToDay at Day 0
      const empCalc = calculateEmployeeOtToDay(emp, "2026-08", 0);
      expect(empCalc.normalOt).toBe(0);
      expect(empCalc.holidayOt).toBe(0);
      expect(empCalc.totalOtHours).toBe(0);
      expect(empCalc.totalOtPay).toBe(0);
      expect(empCalc.hourlyRate).toBe(100);

      // calculateDepartmentBudgetForecast at Day 0
      const forecast = calculateDepartmentBudgetForecast({
        deptId: "INTER 2",
        employees: [emp],
        monthKey: "2026-08",
        asOfDay: 0,
        targetBudgetThb: 150000
      });

      expect(forecast.daysElapsed).toBe(0);
      expect(forecast.totalDaysInMonth).toBe(31);
      expect(forecast.elapsedProgressPct).toBe(0);
      expect(forecast.actualOtHoursToDate).toBe(0);
      expect(forecast.actualSpendToDateThb).toBe(0);
      expect(forecast.targetSpendToDateThb).toBe(0);
      expect(forecast.pacingVarianceThb).toBe(0);
      expect(forecast.pacingVariancePct).toBe(0);

      // Burn rates must be 0, never NaN or Infinity
      expect(forecast.dailySpendBurnRateThb).toBe(0);
      expect(Number.isFinite(forecast.dailySpendBurnRateThb)).toBe(true);
      expect(forecast.dailyHoursBurnRate).toBe(0);
      expect(Number.isFinite(forecast.dailyHoursBurnRate)).toBe(true);

      // Projections at Day 0
      expect(forecast.projectedMonthEndSpendThb).toBe(0);
      expect(forecast.projectedMonthEndHours).toBe(0);
      expect(forecast.projectedBurnRatePct).toBe(0);
      expect(forecast.status).toBe("surplus");
      expect(forecast.estimatedDepletionDay).toBeNull();
      expect(forecast.daysUntilDepletion).toBeNull();
    });

    it("CH.TIME.2: Day 1 elapsed time projects month-end burn rate cleanly from single day data", () => {
      const emp = makeMockEmployee({
        salary: 24000, // hourly rate = 100 THB
        shifts: {
          "2026-08": ["M12", ...Array(30).fill("M8")] // Day 1 is Sat: M12 (4h normal OT = 4 * 1.5 * 100 = 600 THB)
        }
      });

      const forecast = calculateDepartmentBudgetForecast({
        deptId: "INTER 2",
        employees: [emp],
        monthKey: "2026-08",
        asOfDay: 1,
        targetBudgetThb: 150000
      });

      expect(forecast.daysElapsed).toBe(1);
      expect(forecast.actualSpendToDateThb).toBe(600);
      expect(forecast.dailySpendBurnRateThb).toBe(600);
      // Projected month end: 600 THB/day * 31 days = 18,600 THB
      expect(forecast.projectedMonthEndSpendThb).toBe(18600);
      expect(forecast.projectedBurnRatePct).toBe(12.4);
      expect(forecast.status).toBe("surplus");
      expect(forecast.estimatedDepletionDay).toBeNull();
    });

    it("CH.TIME.3: Month-end (Day 31 of 31) elapsed time handles depletion day boundary conditions", () => {
      // 10 employees with massive OT, exceeding budget before month end
      const employees = Array.from({ length: 10 }, (_, i) =>
        makeMockEmployee({
          id: `EMP_${i}`,
          salary: 24000,
          shifts: { "2026-08": Array(31).fill("M12") } // 4h OT/day
        })
      );

      const forecast = calculateDepartmentBudgetForecast({
        deptId: "INTER 2",
        employees,
        monthKey: "2026-08",
        asOfDay: 31,
        targetBudgetThb: 150000
      });

      expect(forecast.daysElapsed).toBe(31);
      expect(forecast.totalDaysInMonth).toBe(31);
      expect(forecast.elapsedProgressPct).toBe(100);
      expect(forecast.actualSpendToDateThb).toBeGreaterThan(150000);
      expect(forecast.status).toBe("critical");

      // Depletion day must be bounded: daysUntilDepletion must be 0 because budget is already depleted
      expect(forecast.estimatedDepletionDay).toBe(31);
      expect(forecast.daysUntilDepletion).toBe(0);
    });

    it("CH.TIME.4: Extreme negative and excessive asOfDay inputs are clamped without error", () => {
      const emp = makeMockEmployee({
        salary: 24000,
        shifts: { "2026-08": Array(31).fill("M12") }
      });

      // Negative day: should clamp to 0
      const negForecast = calculateDepartmentBudgetForecast({
        deptId: "INTER 2",
        employees: [emp],
        monthKey: "2026-08",
        asOfDay: -42,
        targetBudgetThb: 150000
      });
      expect(negForecast.daysElapsed).toBe(0);
      expect(negForecast.actualSpendToDateThb).toBe(0);

      // Beyond total days (e.g. 999): should clamp to 31
      const highForecast = calculateDepartmentBudgetForecast({
        deptId: "INTER 2",
        employees: [emp],
        monthKey: "2026-08",
        asOfDay: 999,
        targetBudgetThb: 150000
      });
      expect(highForecast.daysElapsed).toBe(31);
      expect(highForecast.totalDaysInMonth).toBe(31);
    });
  });

  // =========================================================================
  // 2. CALENDAR MONTH VARIATIONS (28, 29, 30, 31 DAYS & LEAP YEARS)
  // =========================================================================
  describe("2. Calendar Month Variations & Leap Year Support", () => {
    it("CH.CAL.1: Correctly identifies 28 days for standard non-leap February (2025, 2026)", () => {
      expect(getDaysInMonth("2026-02")).toBe(28);
      expect(getDaysInMonth("2025-02")).toBe(28);

      const emp = makeMockEmployee({
        salary: 24000,
        shifts: { "2026-02": Array(28).fill("M8") }
      });

      const forecast = calculateDepartmentBudgetForecast({
        deptId: "INTER 2",
        employees: [emp],
        monthKey: "2026-02",
        asOfDay: 28,
        targetBudgetThb: 140000
      });

      expect(forecast.totalDaysInMonth).toBe(28);
      expect(forecast.dailyTargetPacingThb).toBe(5000); // 140,000 / 28
      expect(forecast.elapsedProgressPct).toBe(100);
    });

    it("CH.CAL.2: Correctly identifies 29 days for leap year February (2024, 2028, 2000)", () => {
      expect(getDaysInMonth("2024-02")).toBe(29);
      expect(getDaysInMonth("2028-02")).toBe(29);
      expect(getDaysInMonth("2000-02")).toBe(29); // Century leap year

      const emp = makeMockEmployee({
        salary: 24000,
        shifts: { "2024-02": Array(29).fill("M8") }
      });

      const forecast = calculateDepartmentBudgetForecast({
        deptId: "INTER 2",
        employees: [emp],
        monthKey: "2024-02",
        asOfDay: 29,
        targetBudgetThb: 145000
      });

      expect(forecast.totalDaysInMonth).toBe(29);
      expect(forecast.dailyTargetPacingThb).toBe(5000); // 145,000 / 29
    });

    it("CH.CAL.3: Correctly identifies 30 days for April, June, September, November", () => {
      expect(getDaysInMonth("2026-04")).toBe(30);
      expect(getDaysInMonth("2026-06")).toBe(30);
      expect(getDaysInMonth("2026-09")).toBe(30);
      expect(getDaysInMonth("2026-11")).toBe(30);

      const forecast = calculateDepartmentBudgetForecast({
        deptId: "INTER 2",
        employees: [],
        monthKey: "2026-09",
        asOfDay: 15,
        targetBudgetThb: 150000
      });

      expect(forecast.totalDaysInMonth).toBe(30);
      expect(forecast.elapsedProgressPct).toBe(50);
      expect(forecast.dailyTargetPacingThb).toBe(5000);
    });

    it("CH.CAL.4: Correctly identifies 31 days for Jan, Mar, May, Jul, Aug, Oct, Dec", () => {
      expect(getDaysInMonth("2026-01")).toBe(31);
      expect(getDaysInMonth("2026-03")).toBe(31);
      expect(getDaysInMonth("2026-05")).toBe(31);
      expect(getDaysInMonth("2026-07")).toBe(31);
      expect(getDaysInMonth("2026-08")).toBe(31);
      expect(getDaysInMonth("2026-10")).toBe(31);
      expect(getDaysInMonth("2026-12")).toBe(31);
    });

    it("CH.CAL.5: Gracefully handles malformed, null, or empty month keys with safe default", () => {
      // Non-hyphenated strings and falsy keys default directly to 31
      expect(getDaysInMonth("")).toBe(31);
      expect(getDaysInMonth("2026")).toBe(31);
      expect(getDaysInMonth(null as any)).toBe(31);
      expect(getDaysInMonth(undefined as any)).toBe(31);

      // Hyphenated keys with non-numeric tokens fall back to current month's day count
      const expectedCurrentMonthDays = new Date(
        new Date().getFullYear(),
        new Date().getMonth() + 1,
        0
      ).getDate();
      expect(getDaysInMonth("invalid-key")).toBe(expectedCurrentMonthDays);
    });
  });

  // =========================================================================
  // 3. FINANCIAL & SALARY BOUNDARY EXTREMES (Zero Budget, Zero Salary)
  // =========================================================================
  describe("3. Financial & Salary Boundary Extremes", () => {
    it("CH.FIN.1: Zero budget limit (targetBudgetThb = 0) does not produce NaN or Infinity", () => {
      const emp = makeMockEmployee({
        salary: 24000,
        shifts: { "2026-08": Array(31).fill("M12") }
      });

      const forecast = calculateDepartmentBudgetForecast({
        deptId: "INTER 2",
        employees: [emp],
        monthKey: "2026-08",
        asOfDay: 10,
        targetBudgetThb: 0
      });

      expect(forecast.targetBudgetThb).toBe(0);
      expect(forecast.dailyTargetPacingThb).toBe(0);
      expect(forecast.targetSpendToDateThb).toBe(0);
      expect(forecast.pacingVariancePct).toBe(0);
      expect(forecast.projectedVariancePct).toBe(0);
      expect(forecast.projectedBurnRatePct).toBe(0);

      // Verify no NaN or Infinity anywhere
      expect(Number.isFinite(forecast.dailyTargetPacingThb)).toBe(true);
      expect(Number.isFinite(forecast.pacingVariancePct)).toBe(true);
      expect(Number.isFinite(forecast.projectedVariancePct)).toBe(true);
      expect(Number.isFinite(forecast.projectedBurnRatePct)).toBe(true);
    });

    it("CH.FIN.2: Zero or missing employee salary falls back safely to default 15,000 THB", () => {
      const zeroSalaryEmp1 = makeMockEmployee({
        id: "ZERO_SAL_1",
        salary: 0,
        shifts: { "2026-08": ["M12"] } // 4h normal OT
      });

      const zeroSalaryEmp2 = makeMockEmployee({
        id: "ZERO_SAL_2",
        salary: 0,
        shifts: { "2026-08": ["M12"] }
      });

      const undefinedSalaryEmp = makeMockEmployee({
        id: "UNDEF_SAL",
        salary: undefined as any,
        shifts: { "2026-08": ["M12"] }
      });

      // In calculateEmployeeOtToDay, fallback salary is 15000 -> hourlyRate = 15000 / 240 = 62.5
      const calcZero = calculateEmployeeOtToDay(zeroSalaryEmp1, "2026-08", 1);
      expect(calcZero.hourlyRate).toBe(62.5);
      expect(calcZero.totalOtPay).toBe(Math.round(4 * 1.5 * 62.5)); // 375 THB

      const calcUndef = calculateEmployeeOtToDay(undefinedSalaryEmp, "2026-08", 1);
      expect(calcUndef.hourlyRate).toBe(62.5);
      expect(calcUndef.totalOtPay).toBe(375);

      // In calculateDepartmentBudgetForecast, totalBaseSalary falls back to 15,000 per employee for 0 / undefined
      const forecast = calculateDepartmentBudgetForecast({
        deptId: "INTER 2",
        employees: [zeroSalaryEmp1, zeroSalaryEmp2, undefinedSalaryEmp],
        monthKey: "2026-08",
        asOfDay: 1
      });

      expect(forecast.employeeCount).toBe(3);
      expect(forecast.totalBaseSalary).toBe(45000); // 3 * 15,000
      expect(forecast.avgHourlyRate).toBe(62.5);
    });

    it("CH.FIN.3: Massive target budget (1,000,000,000 THB) does not overflow or lose precision", () => {
      const emp = makeMockEmployee({
        salary: 30000,
        shifts: { "2026-08": Array(31).fill("M12") }
      });

      const forecast = calculateDepartmentBudgetForecast({
        deptId: "INTER 2",
        employees: [emp],
        monthKey: "2026-08",
        asOfDay: 15,
        targetBudgetThb: 1_000_000_000
      });

      expect(forecast.targetBudgetThb).toBe(1_000_000_000);
      expect(forecast.status).toBe("surplus");
      expect(forecast.projectedBurnRatePct).toBe(0); // Extremely low %
      expect(forecast.estimatedDepletionDay).toBeNull();
    });
  });

  // =========================================================================
  // 4. OVERTIME SPIKES VS ZERO OT (100h+ OVERTIME & 0h OVERTIME)
  // =========================================================================
  describe("4. Overtime Spikes (100h+) vs Absolute Zero OT", () => {
    it("CH.OT.1: Massive overtime spike (124h - 248h OT) triggers critical status and computes accurate depletion", () => {
      // 31 consecutive M16 shifts = 8h OT each day = 248h OT in month
      // August 2026 has 5 Sundays (Aug 2, 9, 16, 23, 30) and 26 regular days
      const overstressedEmp = makeMockEmployee({
        salary: 24000, // 100 THB/hr
        shifts: { "2026-08": Array(31).fill("M16") }
      });

      const empCalc = calculateEmployeeOtToDay(overstressedEmp, "2026-08", 31);
      expect(empCalc.totalOtHours).toBe(248); // 31 * 8h = 248h OT
      expect(empCalc.normalOt).toBe(208); // 26 regular days * 8h = 208h normal OT
      expect(empCalc.holidayOt).toBe(40); // 5 Sundays * 8h = 40h holiday OT
      expect(empCalc.holidayWorkDays).toBe(5);

      // Test department with 5 employees working 248h OT each
      const employees = Array.from({ length: 5 }, (_, i) =>
        makeMockEmployee({
          id: `MASSIVE_EMP_${i}`,
          salary: 24000,
          shifts: { "2026-08": Array(31).fill("M16") }
        })
      );

      const forecast = calculateDepartmentBudgetForecast({
        deptId: "INTER 2",
        employees,
        monthKey: "2026-08",
        asOfDay: 10,
        targetBudgetThb: 100000
      });

      expect(forecast.actualOtHoursToDate).toBe(400); // 5 emp * 10 days * 8h
      expect(forecast.dailyHoursBurnRate).toBe(40);
      expect(forecast.status).toBe("critical");
      expect(forecast.projectedBurnRatePct).toBeGreaterThan(150);
      expect(forecast.estimatedDepletionDay).toBeDefined();
      expect(forecast.estimatedDepletionDay).toBeLessThanOrEqual(31);
    });

    it("CH.OT.2: Absolute zero OT across all employees yields surplus status and null depletion", () => {
      const calmEmployees = Array.from({ length: 5 }, (_, i) =>
        makeMockEmployee({
          id: `CALM_EMP_${i}`,
          salary: 24000,
          shifts: { "2026-08": Array(31).fill("O") } // All off days, 0 OT
        })
      );

      const forecast = calculateDepartmentBudgetForecast({
        deptId: "INTER 2",
        employees: calmEmployees,
        monthKey: "2026-08",
        asOfDay: 20,
        targetBudgetThb: 150000
      });

      expect(forecast.actualOtHoursToDate).toBe(0);
      expect(forecast.actualSpendToDateThb).toBe(0);
      expect(forecast.dailySpendBurnRateThb).toBe(0);
      expect(forecast.dailyHoursBurnRate).toBe(0);
      expect(forecast.projectedMonthEndSpendThb).toBe(0);
      expect(forecast.projectedBurnRatePct).toBe(0);
      expect(forecast.status).toBe("surplus");
      expect(forecast.estimatedDepletionDay).toBeNull();
      expect(forecast.daysUntilDepletion).toBeNull();
    });
  });

  // =========================================================================
  // 5. HEADCOUNT & ACTIVE STATUS EXTREMES (All Leave / 0 Active)
  // =========================================================================
  describe("5. Headcount & Active Status Extremes", () => {
    it("CH.HEAD.1: isEmployeeActive correctly filters out all resigned and inactive statuses (EN and TH)", () => {
      const active1 = makeMockEmployee({ employmentStatus: "active" });
      const active2 = makeMockEmployee({ employmentStatus: "probation" });
      const active3 = makeMockEmployee({ employmentStatus: "" });

      const inactive1 = makeMockEmployee({ employmentStatus: "resigned" });
      const inactive2 = makeMockEmployee({ employmentStatus: "inactive" });
      const inactive3 = makeMockEmployee({ employmentStatus: "retired" });
      const inactive4 = makeMockEmployee({ employmentStatus: "ลาออก" });
      const inactive5 = makeMockEmployee({ employmentStatus: "เกษียณ" });
      const inactive6 = makeMockEmployee({ employmentStatus: "พ้นสภาพ" });
      const inactiveNull = null as any;

      expect(isEmployeeActive(active1)).toBe(true);
      expect(isEmployeeActive(active2)).toBe(true);
      expect(isEmployeeActive(active3)).toBe(true);

      expect(isEmployeeActive(inactive1)).toBe(false);
      expect(isEmployeeActive(inactive2)).toBe(false);
      expect(isEmployeeActive(inactive3)).toBe(false);
      expect(isEmployeeActive(inactive4)).toBe(false);
      expect(isEmployeeActive(inactive5)).toBe(false);
      expect(isEmployeeActive(inactive6)).toBe(false);
      expect(isEmployeeActive(inactiveNull)).toBe(false);
    });

    it("CH.HEAD.2: 0 active employees yields CRITICAL shortfall in Risk Radar with bounded metrics", () => {
      // 4 employees, but all have resigned
      const resignedEmployees: Employee[] = [
        makeMockEmployee({ id: "R1", role: "Crane Operator", employmentStatus: "resigned" }),
        makeMockEmployee({ id: "R2", role: "Crane Operator", employmentStatus: "ลาออก" }),
        makeMockEmployee({ id: "R3", role: "Crane Operator", employmentStatus: "retired" }),
        makeMockEmployee({ id: "R4", role: "Crane Operator", employmentStatus: "พ้นสภาพ" })
      ];

      const departments: Department[] = [
        { id: "INTER 2", name: "INTER 2", nameTh: "INTER 2" } as Department
      ];

      const summary = computeProactiveRiskRadar(resignedEmployees, departments, "2026-08");

      expect(summary.roleAssessments.length).toBe(1);
      const craneRole = summary.roleAssessments[0];
      expect(craneRole.totalHeadcount).toBe(4);
      expect(craneRole.activeHeadcount).toBe(0);
      expect(craneRole.minimumRequired).toBe(4);
      expect(craneRole.staffingShortfall).toBe(4);
      expect(craneRole.isUnderstaffed).toBe(true);
      expect(craneRole.riskLevel).toBe("CRITICAL");
      expect(craneRole.riskScore).toBe(100);

      // Radar metrics must stay within [0, 1] without NaN
      expect(summary.radarMetrics.staffingSufficiency).toBe(0);
      expect(summary.radarMetrics.weeklyOtSafety).toBe(1.0); // No active workers to have fatigue
      expect(summary.radarMetrics.restTurnaroundSafety).toBe(1.0);
      expect(summary.radarMetrics.workdayAdherence).toBe(1.0);
      expect(summary.radarMetrics.rosterResilience).toBe(0);

      expect(summary.riskStatus).toBe("CRITICAL");
    });

    it("CH.HEAD.3: Entirely empty employee dataset ([]) executes without runtime errors", () => {
      const summary = computeProactiveRiskRadar([], [], "2026-08");

      expect(summary.overallRiskScore).toBe(0);
      expect(summary.riskStatus).toBe("LOW");
      expect(summary.radarMetrics.staffingSufficiency).toBe(1.0);
      expect(summary.radarMetrics.weeklyOtSafety).toBe(1.0);
      expect(summary.radarMetrics.restTurnaroundSafety).toBe(1.0);
      expect(summary.radarMetrics.workdayAdherence).toBe(1.0);
      expect(summary.radarMetrics.rosterResilience).toBe(1.0);
      expect(summary.roleAssessments).toEqual([]);
      expect(summary.departmentAssessments).toEqual([]);
    });
  });

  // =========================================================================
  // 6. REST TURNAROUND & ROLLING-WINDOW FATIGUE STRESS
  // =========================================================================
  describe("6. Rest Turnaround (< 11h) & Rolling-Window Fatigue Stress", () => {
    it("CH.REST.1: Rapid alternating Night/Morning shifts detects exact rest turnaround count across month", () => {
      // Alternate N12 and M8 every day for 31 days:
      // Day 1: N12, Day 2: M8 (Violation 1)
      // Day 3: N12, Day 4: M8 (Violation 2)
      // ... Day 29: N12, Day 30: M8 (Violation 15)
      // Day 31: N12
      const alternatingShifts: string[] = [];
      for (let i = 0; i < 31; i++) {
        alternatingShifts.push(i % 2 === 0 ? "N12" : "M8");
      }

      const emp = makeMockEmployee({
        role: "Crane Operator",
        shifts: { "2026-08": alternatingShifts }
      });

      const audit = auditEmployeeProactiveRisks(emp, "2026-08");
      expect(audit.restTurnaroundCount).toBe(15); // Exactly 15 turnaround breaches
      expect(audit.hasConsecutiveNearBreach).toBe(true); // 31 consecutive work days
      expect(audit.maxConsecutiveDays).toBe(31);

      // Verify in Risk Radar that metric degrades safely
      const summary = computeProactiveRiskRadar([emp], [{ id: "INTER 2", name: "INTER 2" } as Department], "2026-08");
      expect(summary.radarMetrics.restTurnaroundSafety).toBeLessThan(0.1); // Severely degraded
      expect(summary.radarMetrics.restTurnaroundSafety).toBeGreaterThanOrEqual(0.0); // Lower bounded at 0
      expect(summary.radarMetrics.workdayAdherence).toBe(0.0); // 31 days near breach
    });

    it("CH.REST.2: Tests various Night->Morning combinations: N8->M8, N12->M12, N16->D", () => {
      const combinations = ["N8", "M8", "N12", "M12", "N16", "D", "O", "N8", "M16"];
      // Pairs:
      // (0,1): N8 -> M8 (BREACH 1)
      // (2,3): N12 -> M12 (BREACH 2)
      // (4,5): N16 -> D (BREACH 3)
      // (7,8): N8 -> M16 (BREACH 4)
      const emp = makeMockEmployee({
        shifts: { "2026-08": combinations }
      });

      const audit = auditEmployeeProactiveRisks(emp, "2026-08");
      expect(audit.restTurnaroundCount).toBe(4);
    });

    it("CH.REST.3: Rolling 7-day window detects impending OT even if calendar weeks do not align", () => {
      // Employee works 3 days off, then 7 consecutive M12 shifts across the week boundary, then off
      // Days 1-3: O, O, O
      // Days 4-10: 7 * M12 (4h OT each = 28h OT in 7-day window)
      // Days 11-31: O
      const customShifts = [
        "O", "O", "O",
        "M12", "M12", "M12", "M12", "M12", "M12", "M12",
        ...Array(21).fill("O")
      ];

      const emp = makeMockEmployee({
        shifts: { "2026-08": customShifts }
      });

      const audit = auditEmployeeProactiveRisks(emp, "2026-08");
      expect(audit.hasImpendingWeeklyOt).toBe(true);
      expect(audit.maxWeeklyOt).toBe(28);
      expect(audit.hasConsecutiveNearBreach).toBe(true);
      expect(audit.maxConsecutiveDays).toBe(7);
    });
  });

  // =========================================================================
  // 7. MULTI-DEPARTMENT ENTERPRISE AGGREGATION & INVARIANTS
  // =========================================================================
  describe("7. Multi-Department Enterprise Aggregation & Mathematical Invariants", () => {
    it("CH.INV.1: Aggregation mathematical invariant: enterprise total equals sum of department parts", () => {
      const empA = makeMockEmployee({
        id: "A1",
        deptId: "INTER 2",
        department: "INTER 2",
        salary: 24000,
        shifts: { "2026-08": Array(31).fill("M12") }
      });

      const empB = makeMockEmployee({
        id: "B1",
        deptId: "INTER 3",
        department: "INTER 3",
        salary: 36000,
        shifts: { "2026-08": Array(31).fill("M8") }
      });

      const empC = makeMockEmployee({
        id: "C1",
        deptId: "Heavy Machine",
        department: "Heavy Machine",
        salary: 18000,
        shifts: { "2026-08": Array(31).fill("O") }
      });

      const departments: Department[] = [
        { id: "INTER 2", name: "INTER 2", targetBudget: 150000 } as any,
        { id: "INTER 3", name: "INTER 3", targetBudget: 120000 } as any,
        { id: "Heavy Machine", name: "Heavy Machine", targetBudget: 100000 } as any
      ];

      const summary = calculateExecutiveForecastSummary(
        [empA, empB, empC],
        departments,
        "2026-08",
        15
      );

      // Invariant 1: Total budget equals sum of dept budgets
      const sumDeptBudgets = summary.departments.reduce((s, d) => s + d.targetBudgetThb, 0);
      expect(summary.totalTargetBudgetThb).toBe(sumDeptBudgets);

      // Invariant 2: Total actual spend equals sum of dept actual spends
      const sumDeptSpends = summary.departments.reduce((s, d) => s + d.actualSpendToDateThb, 0);
      expect(summary.totalActualSpendToDateThb).toBe(sumDeptSpends);

      // Invariant 3: Total projected spend equals sum of dept projected spends
      const sumDeptProjected = summary.departments.reduce((s, d) => s + d.projectedMonthEndSpendThb, 0);
      expect(summary.totalProjectedMonthEndSpendThb).toBe(sumDeptProjected);

      // Invariant 4: Dept status counts must partition the department count exactly
      const totalDepts = summary.departments.length;
      expect(summary.criticalDeptsCount + summary.warningDeptsCount + summary.onTrackDeptsCount).toBe(totalDepts);
    });

    it("CH.INV.2: Shift parsing handles stringified JSON, legacy arrays, and missing keys reliably", () => {
      const jsonStringShifts = JSON.stringify({ "2026-08": ["M12", "M8"] });
      const legacyArrayShifts = ["M12", "M8"];
      const legacyArrayOtherMonth = ["M12", "M8"];

      expect(parseEmployeeShifts(jsonStringShifts, "2026-08")).toEqual(["M12", "M8"]);
      expect(parseEmployeeShifts(legacyArrayShifts, "2026-08")).toEqual(["M12", "M8"]);
      expect(parseEmployeeShifts(legacyArrayOtherMonth, "2026-09")).toEqual([]);
      expect(parseEmployeeShifts("invalid-json{", "2026-08")).toEqual([]);
      expect(parseEmployeeShifts(null, "2026-08")).toEqual([]);
      expect(parseEmployeeShifts(undefined, "2026-08")).toEqual([]);
    });

    it("CH.INV.3: CompanyHoliday and DepartmentRestDayPolicy custom rules modify OT calculation reliably", () => {
      // Worker with M8 on Wednesday Aug 12 (HM Queen Birthday) and Sunday
      const emp = makeMockEmployee({
        deptId: "INTER 2",
        salary: 24000, // 100 THB/hr
        shifts: { "2026-08": Array(31).fill("M8") }
      });

      const holidays = [
        { date: "2026-08-12", name: "HM Queen's Birthday" }
      ];

      // Custom policy: Monday and Tuesday rest days
      const restPolicies = [
        {
          deptId: "INTER 2",
          policyType: "custom" as const,
          customRestDays: [1, 2] // Mon, Tue
        }
      ];

      const calc = calculateEmployeeOtToDay(emp, "2026-08", 15, holidays, restPolicies);
      // On special days (Aug 12 holiday + custom rest days Mon/Tue), M8 counts as holiday work days
      expect(calc.holidayWorkDays).toBeGreaterThan(0);
      expect(calc.totalOtPay).toBeGreaterThan(0);
    });

    it("CH.INV.4: February month-end (Day 28 and Day 29) elapsed bounds depletion accurately", () => {
      // 28-day month: asOfDay = 28
      const emp28 = makeMockEmployee({
        salary: 24000,
        shifts: { "2026-02": Array(28).fill("M12") }
      });

      const forecast28 = calculateDepartmentBudgetForecast({
        deptId: "INTER 2",
        employees: [emp28],
        monthKey: "2026-02",
        asOfDay: 28,
        targetBudgetThb: 10000
      });

      expect(forecast28.daysElapsed).toBe(28);
      expect(forecast28.totalDaysInMonth).toBe(28);
      expect(forecast28.elapsedProgressPct).toBe(100);
      expect(forecast28.estimatedDepletionDay).toBe(28);
      expect(forecast28.daysUntilDepletion).toBe(0);

      // 29-day leap month: asOfDay = 29
      const emp29 = makeMockEmployee({
        salary: 24000,
        shifts: { "2024-02": Array(29).fill("M12") }
      });

      const forecast29 = calculateDepartmentBudgetForecast({
        deptId: "INTER 2",
        employees: [emp29],
        monthKey: "2024-02",
        asOfDay: 29,
        targetBudgetThb: 10000
      });

      expect(forecast29.daysElapsed).toBe(29);
      expect(forecast29.totalDaysInMonth).toBe(29);
      expect(forecast29.elapsedProgressPct).toBe(100);
      expect(forecast29.estimatedDepletionDay).toBe(29);
      expect(forecast29.daysUntilDepletion).toBe(0);
    });

    it("CH.INV.5: STANDARD_ROLE_MINIMUM_REQUIREMENTS handles case-insensitive and partial role names", () => {
      // Exact Thai
      expect(getMinimumRequiredForRole("พนักงานขับเครน", 10)).toBe(4);
      // Exact English
      expect(getMinimumRequiredForRole("Crane Operator", 10)).toBe(4);
      // Partial matching (e.g. Senior Crane Operator)
      expect(getMinimumRequiredForRole("Senior Crane Operator II", 10)).toBe(4);
      expect(getMinimumRequiredForRole("Assistant Cargo Controller", 10)).toBe(2);
      // Unknown role fallback: Math.max(1, Math.min(headcount, 3))
      expect(getMinimumRequiredForRole("Data Scientist", 1)).toBe(1);
      expect(getMinimumRequiredForRole("Data Scientist", 2)).toBe(2);
      expect(getMinimumRequiredForRole("Data Scientist", 10)).toBe(3);
    });
  });
});
