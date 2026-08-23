import { Employee } from "../types";
import { auditEmployeeShiftsCompliance } from "./shiftRecommendation";

export interface PaintedCell {
  empId: string;
  dateStr: string; // e.g. "2026-08-05" or day index
  newShift: string;
}

export interface ComplianceViolation {
  empId: string;
  empName: string;
  reason: string;
  type: "weekly_ot" | "consecutive_days" | "rest_period" | "budget_exceeded";
  dayNumber?: number;
}

export interface SimulationResult {
  baselineOtHours: number;
  simulatedOtHours: number;
  deltaOtHours: number;
  baselineCostThb: number;
  simulatedCostThb: number;
  deltaCostThb: number;
  departmentBudgetLimit: number;
  currentTotalCostThb: number;
  newTotalCostThb: number;
  budgetUtilizationPct: number;
  isBudgetExceeded: boolean;
  complianceViolations: ComplianceViolation[];
  affectedEmployeesCount: number;
  paintedCellsCount: number;
}

/**
 * Extracts OT hours from shift code
 */
export function getShiftOtHours(shift: string): number {
  if (!shift) return 0;
  if (shift === "OND") return 8;
  const match = shift.match(/\d+$/);
  if (match) {
    const hours = Number(match[0]);
    return Math.max(0, hours - 8);
  }
  return 0;
}

/**
 * Calculates monthly OT hours and payroll breakdown for an employee with given shifts array
 */
export function calculateEmployeeMonthlyOt(
  emp: Employee,
  shiftsArray: string[],
  year: number,
  month: number
): { normalOt: number; holidayOt: number; holidayWorkDays: number; totalOtHours: number; totalOtPay: number; hourlyRate: number } {
  const salary = Number(emp.salary) > 0 ? Number(emp.salary) : 15000;
  const hourlyRate = salary / 240;
  const totalDays = new Date(year, month, 0).getDate();

  let normalOt = 0;
  let holidayOt = 0;
  let holidayWorkDays = 0;

  for (let dayNum = 1; dayNum <= totalDays; dayNum++) {
    const shift = shiftsArray[dayNum - 1] || "O";
    const otHrs = getShiftOtHours(shift);
    const isOff = shift === "O" || shift === "OFF";

    const dateObj = new Date(year, month - 1, dayNum);
    const dayOfWeek = dateObj.getDay(); // 0 is Sunday
    const isSunday = dayOfWeek === 0;

    if (shift === "OND" || (isSunday && !isOff)) {
      holidayOt += otHrs > 0 ? otHrs : (shift === "OND" ? 8 : 0);
      if (!isOff) holidayWorkDays += 1;
    } else if (otHrs > 0) {
      normalOt += otHrs;
    }
  }

  const totalOtHours = normalOt + holidayOt;
  const totalOtPay = Math.round((normalOt * 1.5 + holidayOt * 3.0 + holidayWorkDays * 8 * 1.0) * hourlyRate);

  return {
    normalOt,
    holidayOt,
    holidayWorkDays,
    totalOtHours,
    totalOtPay,
    hourlyRate
  };
}

/**
 * Normalizes an employee's shifts into a dense array for a specific month
 */
export function normalizeEmployeeShifts(emp: Employee, monthKey: string): string[] {
  const [yStr, mStr] = monthKey.split("-");
  const yr = Number(yStr) || 2026;
  const mn = Number(mStr) || 8;
  const totalDays = new Date(yr, mn, 0).getDate();

  let extracted: string[] = [];
  const shifts = emp.shifts;

  if (shifts) {
    if (typeof shifts === "string") {
      try {
        const parsed = JSON.parse(shifts);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          extracted = parsed[monthKey] || [];
        } else if (Array.isArray(parsed)) {
          extracted = monthKey === "2026-08" ? parsed : [];
        }
      } catch (_) {}
    } else if (typeof shifts === "object") {
      if (Array.isArray(shifts)) {
        extracted = monthKey === "2026-08" ? shifts : [];
      } else {
        extracted = shifts[monthKey] || [];
      }
    }
  }

  const result: string[] = [];
  for (let i = 0; i < totalDays; i++) {
    result.push(extracted[i] || "O");
  }
  return result;
}

/**
 * Simulates real-time delta OT hours, monetary cost, department budget ceiling,
 * and labor law compliance violations during shift painting / rapid editing.
 */
export function simulateShiftPaintingDelta(
  currentShifts: Record<string, string>,
  paintedCells: PaintedCell[],
  employees: Employee[],
  year: number = 2026,
  month: number = 8,
  departmentBudgetLimit: number = 150000
): SimulationResult {
  const monthKey = `${year}-${String(month).padStart(2, "0")}`;
  const totalDays = new Date(year, month, 0).getDate();

  // 1. Group painted cells by employee
  const paintedByEmp = new Map<string, Map<number, string>>();
  paintedCells.forEach(cell => {
    if (!paintedByEmp.has(cell.empId)) {
      paintedByEmp.set(cell.empId, new Map<number, string>());
    }
    // Extract day number (1..totalDays)
    let dayNum = 1;
    if (cell.dateStr.includes("-")) {
      const parts = cell.dateStr.split("-");
      dayNum = Number(parts[2]) || 1;
    } else {
      dayNum = Number(cell.dateStr) || 1;
    }
    paintedByEmp.get(cell.empId)!.set(dayNum, cell.newShift);
  });

  let baselineOtHours = 0;
  let simulatedOtHours = 0;
  let baselineCostThb = 0;
  let simulatedCostThb = 0;
  const complianceViolations: ComplianceViolation[] = [];

  // 2. Compute baseline and simulated for all provided employees
  employees.forEach(emp => {
    const baseShifts = normalizeEmployeeShifts(emp, monthKey);
    const baseCalc = calculateEmployeeMonthlyOt(emp, baseShifts, year, month);
    baselineOtHours += baseCalc.totalOtHours;
    baselineCostThb += baseCalc.totalOtPay;

    // Check if this employee has painted changes
    const empOverrides = paintedByEmp.get(emp.id);
    const simShifts = [...baseShifts];

    if (empOverrides && empOverrides.size > 0) {
      empOverrides.forEach((newShift, dayNum) => {
        if (dayNum >= 1 && dayNum <= totalDays) {
          simShifts[dayNum - 1] = newShift;
        }
      });
    }

    const simCalc = calculateEmployeeMonthlyOt(emp, simShifts, year, month);
    simulatedOtHours += simCalc.totalOtHours;
    simulatedCostThb += simCalc.totalOtPay;

    // Run compliance check on simulated shifts if modified
    if (empOverrides && empOverrides.size > 0) {
      const alerts = auditEmployeeShiftsCompliance(simShifts, monthKey);
      alerts.forEach(alert => {
        complianceViolations.push({
          empId: emp.id,
          empName: emp.name,
          reason: alert.message,
          type: alert.type,
          dayNumber: alert.dayNumber
        });
      });
    }
  });

  const deltaOtHours = simulatedOtHours - baselineOtHours;
  const deltaCostThb = simulatedCostThb - baselineCostThb;
  const currentTotalCostThb = baselineCostThb;
  const newTotalCostThb = baselineCostThb + deltaCostThb;

  const budgetUtilizationPct = departmentBudgetLimit > 0
    ? Number(((newTotalCostThb / departmentBudgetLimit) * 100).toFixed(1))
    : 0;
  const isBudgetExceeded = newTotalCostThb > departmentBudgetLimit;

  if (isBudgetExceeded) {
    complianceViolations.push({
      empId: "DEPT_BUDGET",
      empName: "แผนก (งบประมาณ OT)",
      reason: `งบประมาณเกินเพดาน ฿${departmentBudgetLimit.toLocaleString()} (ปัจจุบัน ฿${newTotalCostThb.toLocaleString()} - ${budgetUtilizationPct}%)`,
      type: "budget_exceeded"
    });
  }

  return {
    baselineOtHours,
    simulatedOtHours,
    deltaOtHours,
    baselineCostThb,
    simulatedCostThb,
    deltaCostThb,
    departmentBudgetLimit,
    currentTotalCostThb,
    newTotalCostThb,
    budgetUtilizationPct,
    isBudgetExceeded,
    complianceViolations,
    affectedEmployeesCount: paintedByEmp.size,
    paintedCellsCount: paintedCells.length
  };
}
