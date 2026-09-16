import { describe, it, expect } from "vitest";
import {
  getDaysInMonth,
  calculateDepartmentBudgetForecast,
  calculateExecutiveForecastSummary,
  calculateEmployeeOtToDay
} from "../../src/utils/budgetForecastEngine";
import { Employee, Department } from "../../src/types";

describe("Tier 1: Budget Forecast & Burn Rate Engine", () => {
  describe("getDaysInMonth", () => {
    it("returns 31 days for August 2026", () => {
      expect(getDaysInMonth("2026-08")).toBe(31);
    });

    it("returns 30 days for September 2026", () => {
      expect(getDaysInMonth("2026-09")).toBe(30);
    });

    it("returns 28 days for February 2026", () => {
      expect(getDaysInMonth("2026-02")).toBe(28);
    });

    it("handles invalid or empty month keys gracefully", () => {
      expect(getDaysInMonth("")).toBe(31);
      expect(getDaysInMonth("invalid")).toBe(31);
    });
  });

  describe("calculateEmployeeOtToDay", () => {
    it("accumulates OT hours and cost strictly up to specified day", () => {
      const mockEmp: Employee = {
        id: "EMP001",
        name: "Somchai",
        deptId: "INTER 2",
        role: "Crane Operator",
        targetOt: 48,
        actualOt: 0,
        otPct: 0,
        status: "On Track",
        groupName: "A",
        salary: 24000, // hourly rate = 100 THB
        shifts: {
          "2026-08": ["M12", "M12", "M8", "O", "M12", "M12", "M8", "O"]
        }
      };

      // Day 1 (Sat): M12 (normalOt = 4)
      // Day 2 (Sun): M12 (holidayOt = 4, holidayWorkDays = 1)
      const day2Calc = calculateEmployeeOtToDay(mockEmp, "2026-08", 2);
      expect(day2Calc.normalOt).toBe(4);
      expect(day2Calc.holidayOt).toBe(4);
      expect(day2Calc.totalOtHours).toBe(8);
      expect(day2Calc.hourlyRate).toBe(100);
      // Day 1: 4 * 1.5 * 100 = 600. Day 2: (4 * 3.0 + 8 * 1.0) * 100 = 2,000. Total = 2,600 THB
      expect(day2Calc.totalOtPay).toBe(2600);

      // Day 1 to 5: day 1 (Sat 4h normal), day 2 (Sun 4h holiday), day 3 (0h), day 4 (0h), day 5 (Wed 4h normal)
      const day5Calc = calculateEmployeeOtToDay(mockEmp, "2026-08", 5);
      expect(day5Calc.normalOt).toBe(8);
      expect(day5Calc.holidayOt).toBe(4);
      expect(day5Calc.totalOtHours).toBe(12);
      expect(day5Calc.totalOtPay).toBe(3200);
    });

    it("handles zero days elapsed gracefully", () => {
      const mockEmp: Employee = {
        id: "EMP002",
        name: "Prasert",
        deptId: "INTER 2",
        role: "Worker",
        targetOt: 48,
        actualOt: 0,
        otPct: 0,
        status: "On Track",
        groupName: "A",
        shifts: ["M12", "M12"]
      };

      const result = calculateEmployeeOtToDay(mockEmp, "2026-08", 0);
      expect(result.totalOtHours).toBe(0);
      expect(result.totalOtPay).toBe(0);
    });
  });

  describe("calculateDepartmentBudgetForecast", () => {
    it("calculates accurate burn rate, pacing variance, and forecast projection", () => {
      // 10 employees, each has 24,000 salary (100 THB/hr)
      // Days elapsed: 10, Total days: 31
      // Each day has M12 (4h OT normal)
      // 10 days * 4h * 1.5 * 100 = 6,000 THB per employee -> 60,000 THB total spent
      const employees: Employee[] = Array.from({ length: 10 }, (_, i) => ({
        id: `EMP_${i}`,
        name: `Worker ${i}`,
        deptId: "INTER 2",
        role: "Operator",
        targetOt: 48,
        actualOt: 0,
        otPct: 0,
        status: "On Track",
        groupName: "A",
        salary: 24000,
        shifts: {
          "2026-08": Array(31).fill("M12")
        }
      }));

      const forecast = calculateDepartmentBudgetForecast({
        deptId: "INTER 2",
        deptName: "INTER 2",
        employees,
        monthKey: "2026-08",
        asOfDay: 10,
        targetBudgetThb: 150000
      });

      expect(forecast.employeeCount).toBe(10);
      expect(forecast.daysElapsed).toBe(10);
      expect(forecast.totalDaysInMonth).toBe(31);
      expect(forecast.elapsedProgressPct).toBe(32.3);

      expect(forecast.actualSpendToDateThb).toBe(88000);
      expect(forecast.actualOtHoursToDate).toBe(400); // 10 emp * 10 days * 4h

      // Target pacing: 150,000 / 31 = 4,838.71 THB/day
      expect(forecast.dailyTargetPacingThb).toBe(4838.71);
      // Target spend to date = round(4838.71 * 10) = 48,387 THB
      expect(forecast.targetSpendToDateThb).toBe(48387);
      // Pacing variance = 88,000 - 48,387 = 39,613 THB
      expect(forecast.pacingVarianceThb).toBe(39613);

      // Daily burn rate: 88,000 / 10 = 8,800 THB/day
      expect(forecast.dailySpendBurnRateThb).toBe(8800);
      // Projected month-end spend: 8,800 * 31 = 272,800 THB
      expect(forecast.projectedMonthEndSpendThb).toBe(272800);
      // Projected variance: 272,800 - 150,000 = 122,800 THB
      expect(forecast.projectedVarianceThb).toBe(122800);

      // Projected burn rate %: 272,800 / 150,000 = 181.9%
      expect(forecast.projectedBurnRatePct).toBe(181.9);
      // Status should be critical (> 115%)
      expect(forecast.status).toBe("critical");

      // Depletion day: ceil(150,000 / 8,800) = 18
      expect(forecast.estimatedDepletionDay).toBe(18);
      expect(forecast.daysUntilDepletion).toBe(8);
    });

    it("predicts surplus when spending is well below target allocation", () => {
      // 1 employee, spends 1,600 THB in 10 days (Sunday holiday work pay) -> 160 THB/day -> 4,960 THB projected vs 150,000 THB target
      const employees: Employee[] = [
        {
          id: "EMP_SURPLUS",
          name: "Surplus Worker",
          deptId: "INTER 5",
          role: "Planner",
          targetOt: 48,
          actualOt: 0,
          otPct: 0,
          status: "On Track",
          groupName: "A",
          salary: 24000,
          shifts: {
            "2026-08": ["M8", "M8", "M8", "M8", "M8", "M8", "M8", "M8", "M8", "M8"]
          }
        }
      ];

      const forecast = calculateDepartmentBudgetForecast({
        deptId: "INTER 5",
        employees,
        monthKey: "2026-08",
        asOfDay: 10,
        targetBudgetThb: 150000
      });

      expect(forecast.projectedBurnRatePct).toBe(3.3);
      expect(forecast.status).toBe("surplus");
      expect(forecast.estimatedDepletionDay).toBeNull();
      expect(forecast.daysUntilDepletion).toBeNull();
    });

    it("handles zero employees or empty department cleanly", () => {
      const forecast = calculateDepartmentBudgetForecast({
        deptId: "EMPTY_DEPT",
        employees: [],
        monthKey: "2026-08",
        asOfDay: 15
      });

      expect(forecast.employeeCount).toBe(0);
      expect(forecast.actualSpendToDateThb).toBe(0);
      expect(forecast.projectedMonthEndSpendThb).toBe(0);
      expect(forecast.status).toBe("surplus");
      expect(forecast.estimatedDepletionDay).toBeNull();
    });
  });

  describe("calculateExecutiveForecastSummary", () => {
    it("aggregates enterprise-wide budget forecast summary across departments", () => {
      const employees: Employee[] = [
        {
          id: "E1",
          name: "Emp 1",
          deptId: "INTER 2",
          role: "Operator",
          targetOt: 48,
          actualOt: 0,
          otPct: 0,
          status: "On Track",
          groupName: "A",
          salary: 24000,
          shifts: { "2026-08": Array(31).fill("M12") } // 4h/day
        },
        {
          id: "E2",
          name: "Emp 2",
          deptId: "INTER 3",
          role: "Technician",
          targetOt: 48,
          actualOt: 0,
          otPct: 0,
          status: "On Track",
          groupName: "B",
          salary: 24000,
          shifts: { "2026-08": Array(31).fill("M8") } // 0h OT
        }
      ];

      const departments: Department[] = [
        { id: "INTER 2", name: "INTER 2", nameTh: "INTER 2" } as Department,
        { id: "INTER 3", name: "INTER 3", nameTh: "INTER 3" } as Department
      ];

      const summary = calculateExecutiveForecastSummary(
        employees,
        departments,
        "2026-08",
        15
      );

      expect(summary.totalDays).toBe(31);
      expect(summary.asOfDay).toBe(15);
      expect(summary.totalTargetBudgetThb).toBe(300000); // 2 depts * 150k
      expect(summary.departments.length).toBe(2);
      expect(summary.totalActualSpendToDateThb).toBeGreaterThan(0);
      expect(summary.totalProjectedMonthEndSpendThb).toBeGreaterThan(0);
    });
  });
});
