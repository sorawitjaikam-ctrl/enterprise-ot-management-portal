import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import {
  calculateEmployeeMonthlyOt,
  simulateShiftPaintingDelta,
  getShiftOtHours,
  normalizeEmployeeShifts,
} from "../../src/utils/costSimulationEngine";
import {
  getComplementaryShift,
  generateTwoTeamPairSchedules,
  generateThreeTeamRotatingSchedules,
  generate4On2OffSchedule,
  auditEmployeeShiftsCompliance,
  SHIFT_DEFINITIONS,
} from "../../src/utils/shiftRecommendation";
import {
  getShiftCircadianSegments,
  calculateHourlyStaffingDensity,
} from "../../src/utils/circadianEngine";
import { computeDynamicShift } from "../../src/components/PremiumShiftTimePickerModal";
import { Employee } from "../../src/types";

describe("Final Empirical Challenger: Mathematical & Invariance Verification", () => {
  it("CH.FINAL.1: Exhaustively validates shift OT hours and dynamic shift calculations", () => {
    // Standard shifts
    expect(getShiftOtHours("M8")).toBe(0);
    expect(getShiftOtHours("A8")).toBe(0);
    expect(getShiftOtHours("N8")).toBe(0);
    expect(getShiftOtHours("D")).toBe(0);
    expect(getShiftOtHours("M12")).toBe(4);
    expect(getShiftOtHours("A12")).toBe(4);
    expect(getShiftOtHours("N12")).toBe(4);
    expect(getShiftOtHours("M16")).toBe(8);
    expect(getShiftOtHours("A16")).toBe(8);
    expect(getShiftOtHours("N16")).toBe(8);
    expect(getShiftOtHours("OND")).toBe(8);
    expect(getShiftOtHours("O")).toBe(0);
    expect(getShiftOtHours("OFF")).toBe(0);

    // Dynamic shift calculation: 08:00 to 20:00 (12h -> 4 OT)
    const d12 = computeDynamicShift(8, 0, 20, 0, false);
    expect(d12.duration).toBe(12);
    expect(d12.otHours).toBe(4);
    expect(d12.code).toBe("M12");

    // Dynamic overnight shift: 20:00 to 08:00 next day (12h -> 4 OT)
    const dOvernight = computeDynamicShift(20, 0, 8, 0, false);
    expect(dOvernight.duration).toBe(12);
    expect(dOvernight.otHours).toBe(4);
    expect(dOvernight.isOvernight).toBe(true);
    expect(dOvernight.code).toBe("N12");

    // Dynamic 24H full shift: 08:00 to 08:00 (24h -> 16 OT)
    const d24 = computeDynamicShift(8, 0, 8, 0, false);
    expect(d24.duration).toBe(24);
    expect(d24.otHours).toBe(16);
    expect(d24.isOvernight).toBe(true);
    expect(d24.code).toBe("M24");

    // Manual off
    const dOff = computeDynamicShift(8, 0, 17, 0, true);
    expect(dOff.code).toBe("O");
    expect(dOff.duration).toBe(0);
    expect(dOff.otHours).toBe(0);
  });

  it("CH.FINAL.2: Invariance of salary/240 formula and 1.5x / 3.0x / 1.0x rate calculation", () => {
    const salaries = [15000, 24000, 30000, 36000, 48000, 60000];
    salaries.forEach((sal) => {
      const expectedHourlyRate = sal / 240;
      const emp: Employee = {
        id: `EMP-${sal}`,
        name: `Test Worker ${sal}`,
        deptId: "ops",
        role: "Technician",
        salary: sal,
        targetOt: 0,
        actualOt: 0,
        otPct: 0,
        status: "On Track",
        groupName: "Alpha",
        shifts: [],
      };

      // Month: 2026-08 (starts on Sat Aug 1, Sundays: 2, 9, 16, 23, 30)
      // Aug 3-7 (Mon-Fri): 5 x M12 (4h OT each = 20h normal OT)
      // Aug 9 (Sun): 1 x M12 (4h holiday OT + 1 holiday work day = 8h regular pay)
      const shifts = Array(31).fill("OFF");
      shifts[2] = "M12"; // Mon Aug 3
      shifts[3] = "M12"; // Tue Aug 4
      shifts[4] = "M12"; // Wed Aug 5
      shifts[5] = "M12"; // Thu Aug 6
      shifts[6] = "M12"; // Fri Aug 7
      shifts[8] = "M12"; // Sun Aug 9

      const calc = calculateEmployeeMonthlyOt(emp, shifts, 2026, 8);
      expect(calc.normalOt).toBe(20);
      expect(calc.holidayOt).toBe(4);
      expect(calc.holidayWorkDays).toBe(1);
      expect(calc.totalOtHours).toBe(24);

      const expectedPay = (20 * 1.5 + 4 * 3.0 + 1 * 8 * 1.0) * expectedHourlyRate;
      expect(calc.totalOtPay).toBeCloseTo(expectedPay, 2);
    });
  });

  it("CH.FINAL.3: Labor Law compliance engine strictly enforces 36h OT limit and 6-day fatigue", () => {
    // 1. Weekly OT threshold (>36h)
    // 5 days of M16 in week 1 = 5 * 8 = 40h OT > 36h
    const heavyOtShifts = ["M16", "M16", "M16", "M16", "M16", "O", "O", ...Array(24).fill("O")];
    const alertsOt = auditEmployeeShiftsCompliance(heavyOtShifts, "2026-08");
    const weeklyOtAlert = alertsOt.find((a) => a.type === "weekly_ot");
    expect(weeklyOtAlert).toBeDefined();
    expect(weeklyOtAlert?.level).toBe("danger");

    // 2. 6-day fatigue alert (7 consecutive workdays)
    const consecutive7 = ["M8", "M8", "M8", "M8", "M8", "M8", "M8", ...Array(24).fill("O")];
    const alertsConsecutive = auditEmployeeShiftsCompliance(consecutive7, "2026-08");
    const consecutiveAlert = alertsConsecutive.find((a) => a.type === "consecutive_days");
    expect(consecutiveAlert).toBeDefined();
    expect(consecutiveAlert?.level).toBe("warning");

    // 6 consecutive workdays should NOT trigger fatigue alert
    const consecutive6 = ["M8", "M8", "M8", "M8", "M8", "M8", "O", ...Array(24).fill("O")];
    const alerts6 = auditEmployeeShiftsCompliance(consecutive6, "2026-08");
    expect(alerts6.find((a) => a.type === "consecutive_days")).toBeUndefined();
  });

  it("CH.FINAL.4: Circadian staffing calculations accurately map 24-hour density", () => {
    const employees: Employee[] = [
      {
        id: "EMP-1",
        name: "Worker 1",
        deptId: "ops",
        role: "Technician",
        salary: 30000,
        targetOt: 0,
        actualOt: 0,
        otPct: 0,
        status: "On Track",
        groupName: "Alpha",
        shifts: [],
      },
      {
        id: "EMP-2",
        name: "Worker 2",
        deptId: "ops",
        role: "Technician",
        salary: 30000,
        targetOt: 0,
        actualOt: 0,
        otPct: 0,
        status: "On Track",
        groupName: "Alpha",
        shifts: [],
      },
    ];

    const currentShifts = { "EMP-1": "M12", "EMP-2": "N12" };
    const heatmap = calculateHourlyStaffingDensity(currentShifts, "2026-08-01", employees);
    expect(heatmap.slots).toHaveLength(24);
    expect(heatmap.totalActiveStaff).toBe(2);
    expect(heatmap.morningAverage).toBeGreaterThan(0);
    expect(heatmap.nightAverage).toBeGreaterThan(0);
  });

  it("CH.FINAL.5: Live simulation delta calculation handles complex painting and budget thresholds", () => {
    const emp1: Employee = {
      id: "EMP-001",
      name: "Prasert S.",
      deptId: "crane_ops",
      role: "Crane Operator",
      salary: 36000, // 150 THB/hr
      targetOt: 0,
      actualOt: 0,
      otPct: 0,
      status: "On Track",
      groupName: "Crane Team",
      shifts: Array(31).fill("O"),
    };

    const paintedCells = [
      { empId: "EMP-001", dateStr: "2026-08-03", newShift: "M12" }, // Mon: 4h * 1.5 * 150 = 900
      { empId: "EMP-001", dateStr: "2026-08-04", newShift: "M12" }, // Tue: 4h * 1.5 * 150 = 900
      { empId: "EMP-001", dateStr: "2026-08-09", newShift: "M12" }, // Sun: (4*3.0 + 8*1.0) * 150 = 3000
    ];

    const deltaResult = simulateShiftPaintingDelta({}, paintedCells, [emp1], 2026, 8, 10000);
    expect(deltaResult.baselineCostThb).toBe(0);
    // 900 + 900 + 3000 = 4800 THB
    expect(deltaResult.simulatedCostThb).toBe(4800);
    expect(deltaResult.deltaCostThb).toBe(4800);
    expect(deltaResult.isBudgetExceeded).toBe(false);
  });
});

describe("Final Empirical Challenger: Zero-Emoji, Zero-Rogue-Style & Micro-Copy Audit", () => {
  const srcDir = path.resolve(__dirname, "../../src");

  function walkSync(dir: string, filelist: string[] = []): string[] {
    const files = fs.readdirSync(dir);
    files.forEach((file) => {
      const filepath = path.join(dir, file);
      const stat = fs.statSync(filepath);
      if (stat.isDirectory()) {
        walkSync(filepath, filelist);
      } else if (file.endsWith(".tsx") || file.endsWith(".ts") || file.endsWith(".css")) {
        filelist.push(filepath);
      }
    });
    return filelist;
  }

  const allSrcFiles = walkSync(srcDir);

  it("CH.FINAL.6: 0 emojis exist anywhere across all production source files in src/", () => {
    const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/u;
    const violations: { file: string; line: number; text: string }[] = [];

    allSrcFiles.forEach((file) => {
      const content = fs.readFileSync(file, "utf-8");
      content.split("\n").forEach((line, idx) => {
        if (emojiRegex.test(line)) {
          violations.push({
            file: path.relative(srcDir, file),
            line: idx + 1,
            text: line.trim(),
          });
        }
      });
    });

    expect(violations).toHaveLength(0);
  });

  it("CH.FINAL.7: Zero Google Material Symbols (material-symbols-outlined) in src/", () => {
    const violations: { file: string; line: number }[] = [];
    allSrcFiles.forEach((file) => {
      const content = fs.readFileSync(file, "utf-8");
      if (content.includes("material-symbols-outlined")) {
        violations.push({ file: path.relative(srcDir, file), line: 1 });
      }
    });

    expect(violations).toHaveLength(0);
  });

  it("CH.FINAL.8: Design token palette integrity — ensures CSS root tokens define authorized colors", () => {
    const cssPath = path.resolve(srcDir, "index.css");
    const cssContent = fs.readFileSync(cssPath, "utf-8");

    expect(cssContent).toContain("#0E3A66"); // navy-primary
    expect(cssContent).toContain("#17538F"); // navy-supporting-1
    expect(cssContent).toContain("#2E90CB"); // navy-supporting-2
    expect(cssContent).toContain("#DCE4EA"); // neutral-border
    expect(cssContent).toContain("#F3F6F8"); // neutral-canvas
    expect(cssContent).toContain("#1E9C6E"); // semantic-green
    expect(cssContent).toContain("#D99B14"); // semantic-yellow
    expect(cssContent).toContain("#B3352C"); // semantic-red
  });
});
