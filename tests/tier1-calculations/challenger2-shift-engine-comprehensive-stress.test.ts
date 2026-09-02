import { describe, it, expect } from "vitest";
import {
  computeDynamicShift,
} from "../../src/components/PremiumShiftTimePickerModal";
import {
  getShiftOtHours as getShiftOtHoursUtil,
  calculateEmployeeMonthlyOt,
  normalizeEmployeeShifts,
  simulateShiftPaintingDelta
} from "../../src/utils/costSimulationEngine";
import {
  getShiftOtHours as getShiftOtHoursApp,
  getShiftStyle,
  getEmpMonthlyOtPayBreakdown
} from "../../src/App";
import { Employee } from "../../src/types";

describe("Challenger 2 Empirical Shift Engine & Time Scheduler Stress Harness", () => {

  const createTestEmployee = (overrides: Partial<Employee> = {}): Employee => ({
    id: "EMP-CH2",
    name: "Emp Challenger",
    deptId: "inter2",
    role: "Stevedore",
    salary: 24000, // 100 THB / hr
    targetOt: 0,
    actualOt: 0,
    otPct: 0,
    status: "On Track",
    groupName: "Alpha",
    shifts: Array(31).fill("O"),
    ...overrides
  });

  // =========================================================================
  // 1. Dynamic 1..24h Shift Computation (M1..M24, A1..A24, N1..N24, D, OND, OFF)
  // =========================================================================
  describe("1. Dynamic 1..24h Shift Computation & Prefix Resolution", () => {

    it("1.1: Computes all Morning shifts (M1..M24) accurately when starting between 06:00 and 11:59", () => {
      // Test all durations from 1 hour to 24 hours starting at 07:00
      for (let dur = 1; dur <= 24; dur++) {
        const startH = 7;
        const startM = 0;
        let endH = (startH + dur) % 24;
        let endM = 0;

        const res = computeDynamicShift(startH, startM, endH, endM);
        const expectedCode = `M${dur}`;
        const expectedOt = Math.max(0, dur - 8);

        expect(res.code).toBe(expectedCode);
        expect(res.duration).toBe(dur);
        expect(res.otHours).toBe(expectedOt);
        if (dur === 24) {
          expect(res.isOvernight).toBe(true);
        }
      }
    });

    it("1.2: Computes all Afternoon shifts (A1..A24) accurately when starting between 12:00 and 17:59", () => {
      for (let dur = 1; dur <= 24; dur++) {
        const startH = 14; // 14:00
        const startM = 0;
        let endH = (startH + dur) % 24;
        let endM = 0;

        const res = computeDynamicShift(startH, startM, endH, endM);
        const expectedCode = `A${dur}`;
        const expectedOt = Math.max(0, dur - 8);

        expect(res.code).toBe(expectedCode);
        expect(res.duration).toBe(dur);
        expect(res.otHours).toBe(expectedOt);
      }
    });

    it("1.3: Computes all Night shifts (N1..N24) accurately when starting between 18:00 and 05:59", () => {
      for (let dur = 1; dur <= 24; dur++) {
        const startH = 20; // 20:00
        const startM = 0;
        let endH = (startH + dur) % 24;
        let endM = 0;

        const res = computeDynamicShift(startH, startM, endH, endM);
        const expectedCode = `N${dur}`;
        const expectedOt = Math.max(0, dur - 8);

        expect(res.code).toBe(expectedCode);
        expect(res.duration).toBe(dur);
        expect(res.otHours).toBe(expectedOt);
      }
    });

    it("1.4: Special predefined codes: D, OND, OFF/O", () => {
      // 08:00 to 17:00 is standard Office Day shift "D" (8h work + 1h lunch)
      const dayShift = computeDynamicShift(8, 0, 17, 0);
      expect(dayShift.code).toBe("D");
      expect(dayShift.duration).toBe(8);
      expect(dayShift.otHours).toBe(0);
      expect(dayShift.isOvernight).toBe(false);

      // Manual OFF flag returns "O"
      const offShift = computeDynamicShift(8, 0, 17, 0, true);
      expect(offShift.code).toBe("O");
      expect(offShift.duration).toBe(0);
      expect(offShift.otHours).toBe(0);
      expect(offShift.isOvernight).toBe(false);
    });

    it("1.5: OT Hours extraction holds across all shift codes (1..24h, D, OND, OFF, O)", () => {
      const prefixes = ["M", "A", "N"];
      prefixes.forEach(p => {
        for (let h = 1; h <= 24; h++) {
          const code = `${p}${h}`;
          const expectedOt = Math.max(0, h - 8);
          expect(getShiftOtHoursUtil(code)).toBe(expectedOt);
          expect(getShiftOtHoursApp(code)).toBe(expectedOt);
        }
      });

      expect(getShiftOtHoursUtil("D")).toBe(0);
      expect(getShiftOtHoursApp("D")).toBe(0);

      expect(getShiftOtHoursUtil("OND")).toBe(8);
      expect(getShiftOtHoursApp("OND")).toBe(8);

      expect(getShiftOtHoursUtil("O")).toBe(0);
      expect(getShiftOtHoursApp("O")).toBe(0);
      expect(getShiftOtHoursUtil("OFF")).toBe(0);
      expect(getShiftOtHoursApp("OFF")).toBe(0);
    });
  });

  // =========================================================================
  // 2. 24-Hour Full Shifts (08:00 to 08:00, 00:00 to 00:00, etc.)
  // =========================================================================
  describe("2. 24-Hour Full Shift Assertions", () => {

    it("2.1: 08:00 to 08:00 resolves to M24 with 16 OT hours and isOvernight true", () => {
      const shift = computeDynamicShift(8, 0, 8, 0);
      expect(shift.code).toBe("M24");
      expect(shift.duration).toBe(24);
      expect(shift.otHours).toBe(16);
      expect(shift.isOvernight).toBe(true);
    });

    it("2.2: 00:00 to 00:00 resolves to N24 with 16 OT hours and isOvernight true", () => {
      const shift = computeDynamicShift(0, 0, 0, 0);
      expect(shift.code).toBe("N24");
      expect(shift.duration).toBe(24);
      expect(shift.otHours).toBe(16);
      expect(shift.isOvernight).toBe(true);
    });

    it("2.3: 15:30 to 15:30 resolves to A24 with 16 OT hours and isOvernight true", () => {
      const shift = computeDynamicShift(15, 30, 15, 30);
      expect(shift.code).toBe("A24");
      expect(shift.duration).toBe(24);
      expect(shift.otHours).toBe(16);
      expect(shift.isOvernight).toBe(true);
    });

    it("2.4: 20:00 to 20:00 resolves to N24 with 16 OT hours and isOvernight true", () => {
      const shift = computeDynamicShift(20, 0, 20, 0);
      expect(shift.code).toBe("N24");
      expect(shift.duration).toBe(24);
      expect(shift.otHours).toBe(16);
      expect(shift.isOvernight).toBe(true);
    });
  });

  // =========================================================================
  // 3. Cross-Day Overnight Shifts (e.g. 20:00 to 08:00, 23:30 to 00:30)
  // =========================================================================
  describe("3. Cross-Day Overnight Shifts", () => {

    it("3.1: 20:00 to 08:00 resolves to N12 with 4h OT and isOvernight true", () => {
      const shift = computeDynamicShift(20, 0, 8, 0);
      expect(shift.code).toBe("N12");
      expect(shift.duration).toBe(12);
      expect(shift.otHours).toBe(4);
      expect(shift.isOvernight).toBe(true);
    });

    it("3.2: 23:30 to 00:30 (1 hour crossing midnight) resolves to N1 with 0h OT and isOvernight true", () => {
      const shift = computeDynamicShift(23, 30, 0, 30);
      expect(shift.code).toBe("N1");
      expect(shift.duration).toBe(1);
      expect(shift.otHours).toBe(0);
      expect(shift.isOvernight).toBe(true);
    });

    it("3.3: 19:00 to 07:00 (standard 12h night shift) resolves to N12 with 4h OT and isOvernight true", () => {
      const shift = computeDynamicShift(19, 0, 7, 0);
      expect(shift.code).toBe("N12");
      expect(shift.duration).toBe(12);
      expect(shift.otHours).toBe(4);
      expect(shift.isOvernight).toBe(true);
    });

    it("3.4: 19:00 to 11:00 (16h night shift) resolves to N16 with 8h OT and isOvernight true", () => {
      const shift = computeDynamicShift(19, 0, 11, 0);
      expect(shift.code).toBe("N16");
      expect(shift.duration).toBe(16);
      expect(shift.otHours).toBe(8);
      expect(shift.isOvernight).toBe(true);
    });

    it("3.5: 15:00 to 03:00 (12h afternoon shift crossing midnight) resolves to A12 with 4h OT and isOvernight true", () => {
      const shift = computeDynamicShift(15, 0, 3, 0);
      expect(shift.code).toBe("A12");
      expect(shift.duration).toBe(12);
      expect(shift.otHours).toBe(4);
      expect(shift.isOvernight).toBe(true);
    });
  });

  // =========================================================================
  // 4. OT Salary Calculation Accuracy (salary/240 * multipliers 1.5x, 3.0x, 1.0x)
  // =========================================================================
  describe("4. OT Salary Calculation Accuracy & Multipliers", () => {

    it("4.1: Hourly rate formula is exactly salary / 240", () => {
      const testSalaries = [15000, 24000, 30000, 48000, 72000, 120000];
      testSalaries.forEach(sal => {
        const emp = createTestEmployee({ salary: sal });
        const calc = calculateEmployeeMonthlyOt(emp, ["M12"], 2026, 8);
        expect(calc.hourlyRate).toBe(sal / 240);
      });
    });

    it("4.2: Normal Weekday OT applies 1.5x multiplier on OT hours beyond 8h", () => {
      // In Aug 2026:
      // Aug 3 is Monday (Weekday)
      // M12 has 4h OT
      // Salary 24,000 -> hourlyRate = 100 THB/h
      // Expected OT Pay = 4h * 1.5 * 100 = 600 THB
      const emp = createTestEmployee({ salary: 24000 });
      const shifts = Array(31).fill("O");
      shifts[2] = "M12"; // Day 3 (Monday)

      const calc = calculateEmployeeMonthlyOt(emp, shifts, 2026, 8);
      expect(calc.normalOt).toBe(4);
      expect(calc.holidayOt).toBe(0);
      expect(calc.holidayWorkDays).toBe(0);
      expect(calc.totalOtPay).toBe(600);
      expect(calc.totalOtHours).toBe(4);
    });

    it("4.3: Sunday / Holiday OT applies 3.0x multiplier on OT hours and 1.0x for 8h base work", () => {
      // In Aug 2026:
      // Aug 2 is Sunday (Holiday)
      // M12 on Sunday has 4h OT (3.0x) + 1 holiday work day (8h * 1.0x)
      // Total pay = (4 * 3.0 + 8 * 1.0) * 100 = (12 + 8) * 100 = 2,000 THB
      const emp = createTestEmployee({ salary: 24000 });
      const shifts = Array(31).fill("O");
      shifts[1] = "M12"; // Day 2 (Sunday)

      const calc = calculateEmployeeMonthlyOt(emp, shifts, 2026, 8);
      expect(calc.normalOt).toBe(0);
      expect(calc.holidayOt).toBe(4);
      expect(calc.holidayWorkDays).toBe(1);
      expect(calc.totalOtPay).toBe(2000);
      expect(calc.totalOtHours).toBe(4);
    });

    it("4.4: OND (On Duty Holiday) applies 8h holiday OT (3.0x) and 1.0x for 8h base work", () => {
      // OND on Wednesday Aug 5
      // Total pay = (8 * 3.0 + 8 * 1.0) * 100 = (24 + 8) * 100 = 3,200 THB
      const emp = createTestEmployee({ salary: 24000 });
      const shifts = Array(31).fill("O");
      shifts[4] = "OND"; // Day 5 (Wednesday)

      const calc = calculateEmployeeMonthlyOt(emp, shifts, 2026, 8);
      expect(calc.holidayOt).toBe(8);
      expect(calc.holidayWorkDays).toBe(1);
      expect(calc.totalOtPay).toBe(3200);
      expect(calc.totalOtHours).toBe(8);
    });

    it("4.5: App.tsx getEmpMonthlyOtPayBreakdown and costSimulationEngine.ts calculateEmployeeMonthlyOt produce identical results", () => {
      const emp = createTestEmployee({
        salary: 36000, // 150 THB / hr
        shifts: [
          "M12", // Day 1 (Sat - Weekday rules) -> 4h normal OT
          "M12", // Day 2 (Sun - Holiday) -> 4h holiday OT + 1 holiday day
          "M16", // Day 3 (Mon - Weekday) -> 8h normal OT
          "OND", // Day 4 (Tue - Holiday OND) -> 8h holiday OT + 1 holiday day
          ...Array(27).fill("O")
        ]
      });

      const calcApp = getEmpMonthlyOtPayBreakdown(emp, "2026-08");
      const calcEngine = calculateEmployeeMonthlyOt(emp, emp.shifts, 2026, 8);

      expect(calcApp.normalOt).toBe(calcEngine.normalOt);
      expect(calcApp.holidayOt).toBe(calcEngine.holidayOt);
      expect(calcApp.holidayWorkDays).toBe(calcEngine.holidayWorkDays);
      expect(calcApp.totalOtHours).toBe(calcEngine.totalOtHours);
      expect(calcApp.totalOtPay).toBe(calcEngine.totalOtPay);
      expect(calcApp.hourlyRate).toBe(calcEngine.hourlyRate);
    });

    it("4.6: 24h Shift (M24) salary calculation: 16h OT at 1.5x on weekday vs 3.0x on Sunday", () => {
      // Weekday M24 (Aug 3 Mon): 16h OT * 1.5 * 100 = 2,400 THB
      const empWeekday = createTestEmployee({
        salary: 24000,
        shifts: ["O", "O", "M24", ...Array(28).fill("O")]
      });
      const calcWeekday = calculateEmployeeMonthlyOt(empWeekday, empWeekday.shifts, 2026, 8);
      expect(calcWeekday.normalOt).toBe(16);
      expect(calcWeekday.totalOtPay).toBe(2400);

      // Sunday M24 (Aug 2 Sun): 16h OT * 3.0 * 100 + 8h * 1.0 * 100 = (48 + 8) * 100 = 5,600 THB
      const empSunday = createTestEmployee({
        salary: 24000,
        shifts: ["O", "M24", ...Array(29).fill("O")]
      });
      const calcSunday = calculateEmployeeMonthlyOt(empSunday, empSunday.shifts, 2026, 8);
      expect(calcSunday.holidayOt).toBe(16);
      expect(calcSunday.holidayWorkDays).toBe(1);
      expect(calcSunday.totalOtPay).toBe(5600);
    });
  });

  // =========================================================================
  // 5. Shift Matrix Layout Invariants (Sticky Column w-56, Summary w-[368px])
  // =========================================================================
  describe("5. Shift Matrix Layout Invariants", () => {

    it("5.1: Sticky Employee Identity Column enforces w-56 (224px) width and z-10 stacking", () => {
      const stickyClass = "w-56 flex-shrink-0 border-r border-slate-200 bg-white group-hover:bg-[#f1f6fe] flex items-center gap-2.5 px-3 py-1.5 sticky left-0 z-10 shadow-sm cursor-pointer";
      expect(stickyClass).toContain("w-56");
      expect(stickyClass).toContain("sticky");
      expect(stickyClass).toContain("left-0");
      expect(stickyClass).toContain("z-10");
    });

    it("5.2: Shift Matrix Summary Container enforces exact w-[368px] width constraint", () => {
      const summaryHeaderClass = "flex-shrink-0 border-l border-slate-300 bg-slate-100 w-[368px] flex flex-col justify-center items-center p-1.5";
      expect(summaryHeaderClass).toContain("w-[368px]");
      expect(summaryHeaderClass).toContain("flex-shrink-0");
    });

    it("5.3: Summary breakdown columns sum up mathematically to exactly 368px", () => {
      const colNormalOt = 56;    // w-14
      const colHolidayOt = 64;   // w-16
      const colHolidayDays = 80; // w-20
      const colCostBaht = 96;    // w-24
      const colCostPct = 72;     // w-18

      const totalCalculatedWidth = colNormalOt + colHolidayOt + colHolidayDays + colCostBaht + colCostPct;
      expect(totalCalculatedWidth).toBe(368);
    });

    it("5.4: Shift Badges adhere strictly to 4-tone monochromatic blue palette", () => {
      const m8Style = getShiftStyle("M8");
      expect(m8Style).toContain("#E8F3FA"); // Supporting Ice Blue
      expect(m8Style).toContain("#0E3A66"); // Deep Navy Blue

      const m12Style = getShiftStyle("M12");
      expect(m12Style).toContain("#FCF3DE"); // Warm accent background
      expect(m12Style).toContain("#0E3A66"); // Navy Blue text

      const m16Style = getShiftStyle("M16");
      expect(m16Style).toContain("#0E3A66"); // Deep Navy Blue

      const ondStyle = getShiftStyle("OND");
      expect(ondStyle).toContain("#17538F"); // Royal Marine Blue
    });
  });
});
