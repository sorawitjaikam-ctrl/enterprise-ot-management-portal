import { Department, Employee, CompanyHoliday, DepartmentRestDayPolicy } from "../types";
import { getShiftOtHours } from "./costSimulationEngine";

export interface DepartmentBudgetForecast {
  deptId: string;
  deptName: string;
  deptNameTh: string;
  employeeCount: number;
  totalBaseSalary: number;
  avgHourlyRate: number;
  targetBudgetThb: number;
  daysElapsed: number;
  totalDaysInMonth: number;
  elapsedProgressPct: number;
  actualOtHoursToDate: number;
  actualSpendToDateThb: number;
  targetSpendToDateThb: number;
  pacingVarianceThb: number;
  pacingVariancePct: number;
  dailySpendBurnRateThb: number;
  dailyHoursBurnRate: number;
  dailyTargetPacingThb: number;
  projectedMonthEndSpendThb: number;
  projectedMonthEndHours: number;
  projectedVarianceThb: number;
  projectedVariancePct: number;
  projectedBurnRatePct: number;
  estimatedDepletionDay: number | null;
  daysUntilDepletion: number | null;
  status: "surplus" | "on_track" | "warning" | "critical";
}

export interface ExecutiveMonthEndForecastSummary {
  monthKey: string;
  asOfDay: number;
  totalDays: number;
  elapsedPct: number;
  totalTargetBudgetThb: number;
  totalActualSpendToDateThb: number;
  totalTargetPacingToDateThb: number;
  totalDailyBurnRateThb: number;
  totalProjectedMonthEndSpendThb: number;
  totalProjectedVarianceThb: number;
  totalProjectedBurnRatePct: number;
  criticalDeptsCount: number;
  warningDeptsCount: number;
  onTrackDeptsCount: number;
  departments: DepartmentBudgetForecast[];
}

export const DEFAULT_DEPARTMENT_BUDGET_CEILING = 150000;

export function getDaysInMonth(monthKey: string): number {
  if (!monthKey || !monthKey.includes("-")) return 31;
  const [yStr, mStr] = monthKey.split("-");
  const year = Number(yStr) || new Date().getFullYear();
  const month = Number(mStr) || (new Date().getMonth() + 1);
  return new Date(year, month, 0).getDate();
}

export function parseEmployeeShifts(shifts: any, monthKey: string): string[] {
  if (!shifts) return [];
  if (typeof shifts === "string") {
    try {
      const parsed = JSON.parse(shifts);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed[monthKey] || [];
      }
      if (Array.isArray(parsed)) {
        return monthKey === "2026-08" ? parsed : [];
      }
    } catch {
      return [];
    }
  } else if (typeof shifts === "object") {
    if (Array.isArray(shifts)) {
      return monthKey === "2026-08" ? shifts : [];
    }
    return shifts[monthKey] || [];
  }
  return [];
}

export function calculateEmployeeOtToDay(
  emp: Employee,
  monthKey: string,
  upToDay: number,
  holidays?: CompanyHoliday[],
  restPolicies?: DepartmentRestDayPolicy[]
): {
  normalOt: number;
  holidayOt: number;
  holidayWorkDays: number;
  totalOtHours: number;
  totalOtPay: number;
  hourlyRate: number;
} {
  const salary = Number(emp.salary) > 0 ? Number(emp.salary) : 15000;
  const hourlyRate = salary / 240;
  const shiftsArray = parseEmployeeShifts(emp.shifts, monthKey);
  const totalDays = getDaysInMonth(monthKey);
  const cappedDay = Math.max(0, Math.min(totalDays, upToDay));

  const [yStr, mStr] = monthKey.split("-");
  const yr = Number(yStr) || 2026;
  const mn = Number(mStr) || 8;

  let normalOt = 0;
  let holidayOt = 0;
  let holidayWorkDays = 0;

  for (let dayNum = 1; dayNum <= cappedDay; dayNum++) {
    const shift = shiftsArray[dayNum - 1] || "O";
    const otHrs = getShiftOtHours(shift);
    const isOff = shift === "O" || shift === "OFF";

    const dateObj = new Date(yr, mn - 1, dayNum);
    const dayOfWeek = dateObj.getDay();
    const isSunday = dayOfWeek === 0;
    const dateStr = `${yr}-${String(mn).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;

    const isCompanyHoliday = Boolean(
      holidays && holidays.some(h => h.date === dateStr)
    );

    let isRestDay = isSunday;
    if (restPolicies && restPolicies.length > 0) {
      const policy = restPolicies.find(p => p.deptId === emp.deptId);
      if (policy) {
        if (policy.policyType === "sat_sun") {
          isRestDay = dayOfWeek === 0 || dayOfWeek === 6;
        } else if (policy.policyType === "custom" && policy.customRestDays) {
          isRestDay = policy.customRestDays.includes(dayOfWeek);
        } else {
          isRestDay = dayOfWeek === 0;
        }
      }
    }

    const isSpecial = isCompanyHoliday || isRestDay;

    if (shift === "OND" || (isSpecial && !isOff)) {
      holidayOt += otHrs > 0 ? otHrs : (shift === "OND" ? 8 : 0);
      if (!isOff) holidayWorkDays += 1;
    } else if (otHrs > 0) {
      normalOt += otHrs;
    }
  }

  const totalOtHours = normalOt + holidayOt;
  const totalOtPay = Math.round(
    (normalOt * 1.5 + holidayOt * 3.0 + holidayWorkDays * 8 * 1.0) * hourlyRate
  );

  return {
    normalOt,
    holidayOt,
    holidayWorkDays,
    totalOtHours,
    totalOtPay,
    hourlyRate
  };
}

export function calculateDepartmentBudgetForecast(options: {
  deptId: string;
  deptName?: string;
  deptNameTh?: string;
  employees: Employee[];
  monthKey: string;
  asOfDay?: number;
  targetBudgetThb?: number;
  holidays?: CompanyHoliday[];
  restPolicies?: DepartmentRestDayPolicy[];
}): DepartmentBudgetForecast {
  const {
    deptId,
    deptName = deptId,
    deptNameTh = deptName,
    employees,
    monthKey,
    asOfDay,
    targetBudgetThb = DEFAULT_DEPARTMENT_BUDGET_CEILING,
    holidays,
    restPolicies
  } = options;

  const totalDaysInMonth = getDaysInMonth(monthKey);
  const daysElapsed = asOfDay !== undefined
    ? Math.max(0, Math.min(totalDaysInMonth, asOfDay))
    : totalDaysInMonth;

  const deptEmployees = employees.filter(e => {
    if (deptId === "all") return true;
    const eDept = (e.deptId || "").toLowerCase();
    const dId = deptId.toLowerCase();
    return eDept === dId || (e.department && e.department.toLowerCase() === dId);
  });

  const employeeCount = deptEmployees.length;
  const totalBaseSalary = deptEmployees.reduce((acc, curr) => acc + (Number(curr.salary) || 15000), 0);
  const avgHourlyRate = employeeCount > 0
    ? Math.round((totalBaseSalary / employeeCount / 240) * 100) / 100
    : 62.5;

  const elapsedProgressPct = totalDaysInMonth > 0
    ? Math.round((daysElapsed / totalDaysInMonth) * 1000) / 10
    : 0;

  let actualOtHoursToDate = 0;
  let actualSpendToDateThb = 0;

  if (daysElapsed > 0) {
    for (const emp of deptEmployees) {
      const calc = calculateEmployeeOtToDay(emp, monthKey, daysElapsed, holidays, restPolicies);
      actualOtHoursToDate += calc.totalOtHours;
      actualSpendToDateThb += calc.totalOtPay;
    }
  }

  const dailyTargetPacingThb = totalDaysInMonth > 0
    ? Math.round((targetBudgetThb / totalDaysInMonth) * 100) / 100
    : 0;

  const targetSpendToDateThb = Math.round(dailyTargetPacingThb * daysElapsed);
  const pacingVarianceThb = actualSpendToDateThb - targetSpendToDateThb;
  const pacingVariancePct = targetSpendToDateThb > 0
    ? Math.round((pacingVarianceThb / targetSpendToDateThb) * 1000) / 10
    : 0;

  const dailySpendBurnRateThb = daysElapsed > 0
    ? Math.round((actualSpendToDateThb / daysElapsed) * 100) / 100
    : 0;

  const dailyHoursBurnRate = daysElapsed > 0
    ? Math.round((actualOtHoursToDate / daysElapsed) * 10) / 10
    : 0;

  const projectedMonthEndSpendThb = daysElapsed > 0
    ? Math.round(dailySpendBurnRateThb * totalDaysInMonth)
    : 0;

  const projectedMonthEndHours = daysElapsed > 0
    ? Math.round(dailyHoursBurnRate * totalDaysInMonth * 10) / 10
    : 0;

  const projectedVarianceThb = projectedMonthEndSpendThb - targetBudgetThb;
  const projectedVariancePct = targetBudgetThb > 0
    ? Math.round((projectedVarianceThb / targetBudgetThb) * 1000) / 10
    : 0;

  const projectedBurnRatePct = targetBudgetThb > 0
    ? Math.round((projectedMonthEndSpendThb / targetBudgetThb) * 1000) / 10
    : 0;

  let estimatedDepletionDay: number | null = null;
  let daysUntilDepletion: number | null = null;

  if (
    dailySpendBurnRateThb > 0 &&
    dailySpendBurnRateThb > dailyTargetPacingThb &&
    projectedMonthEndSpendThb > targetBudgetThb
  ) {
    const rawDepletionDay = Math.ceil(targetBudgetThb / dailySpendBurnRateThb);
    estimatedDepletionDay = Math.min(totalDaysInMonth, Math.max(daysElapsed, rawDepletionDay));
    daysUntilDepletion = Math.max(0, estimatedDepletionDay - daysElapsed);
  }

  let status: "surplus" | "on_track" | "warning" | "critical" = "on_track";
  if (projectedBurnRatePct > 115) {
    status = "critical";
  } else if (projectedBurnRatePct > 100) {
    status = "warning";
  } else if (projectedBurnRatePct >= 85) {
    status = "on_track";
  } else {
    status = "surplus";
  }

  return {
    deptId,
    deptName,
    deptNameTh,
    employeeCount,
    totalBaseSalary,
    avgHourlyRate,
    targetBudgetThb,
    daysElapsed,
    totalDaysInMonth,
    elapsedProgressPct,
    actualOtHoursToDate,
    actualSpendToDateThb,
    targetSpendToDateThb,
    pacingVarianceThb,
    pacingVariancePct,
    dailySpendBurnRateThb,
    dailyHoursBurnRate,
    dailyTargetPacingThb,
    projectedMonthEndSpendThb,
    projectedMonthEndHours,
    projectedVarianceThb,
    projectedVariancePct,
    projectedBurnRatePct,
    estimatedDepletionDay,
    daysUntilDepletion,
    status
  };
}

export function calculateExecutiveForecastSummary(
  employees: Employee[],
  departments: Department[],
  monthKey: string,
  asOfDay?: number,
  holidays?: CompanyHoliday[],
  restPolicies?: DepartmentRestDayPolicy[]
): ExecutiveMonthEndForecastSummary {
  const totalDays = getDaysInMonth(monthKey);
  const resolvedAsOfDay = asOfDay !== undefined
    ? Math.max(0, Math.min(totalDays, asOfDay))
    : totalDays;

  const elapsedPct = totalDays > 0
    ? Math.round((resolvedAsOfDay / totalDays) * 1000) / 10
    : 0;

  const deptForecasts: DepartmentBudgetForecast[] = [];

  const deptsToProcess = departments && departments.length > 0
    ? departments
    : [
        { id: "INTER 2", name: "INTER 2", nameTh: "INTER 2" } as Department,
        { id: "INTER 3", name: "INTER 3", nameTh: "INTER 3" } as Department,
        { id: "INTER 5", name: "INTER 5", nameTh: "INTER 5" } as Department,
        { id: "INTER 7", name: "INTER 7", nameTh: "INTER 7" } as Department,
        { id: "Heavy Machine", name: "Heavy Machine", nameTh: "เครื่องจักรกลหนัก" } as Department,
        { id: "ECC", name: "ECC", nameTh: "ศูนย์ควบคุม ECC" } as Department
      ];

  for (const d of deptsToProcess) {
    const targetBudget = (d as any).budgetLimit || (d as any).targetBudget || DEFAULT_DEPARTMENT_BUDGET_CEILING;
    const forecast = calculateDepartmentBudgetForecast({
      deptId: d.id,
      deptName: d.name,
      deptNameTh: d.nameTh || d.name,
      employees,
      monthKey,
      asOfDay: resolvedAsOfDay,
      targetBudgetThb: targetBudget,
      holidays,
      restPolicies
    });
    deptForecasts.push(forecast);
  }

  const totalTargetBudgetThb = deptForecasts.reduce((acc, curr) => acc + curr.targetBudgetThb, 0);
  const totalActualSpendToDateThb = deptForecasts.reduce((acc, curr) => acc + curr.actualSpendToDateThb, 0);
  const totalTargetPacingToDateThb = deptForecasts.reduce((acc, curr) => acc + curr.targetSpendToDateThb, 0);
  const totalDailyBurnRateThb = Math.round(deptForecasts.reduce((acc, curr) => acc + curr.dailySpendBurnRateThb, 0) * 100) / 100;
  const totalProjectedMonthEndSpendThb = deptForecasts.reduce((acc, curr) => acc + curr.projectedMonthEndSpendThb, 0);
  const totalProjectedVarianceThb = totalProjectedMonthEndSpendThb - totalTargetBudgetThb;
  const totalProjectedBurnRatePct = totalTargetBudgetThb > 0
    ? Math.round((totalProjectedMonthEndSpendThb / totalTargetBudgetThb) * 1000) / 10
    : 0;

  const criticalDeptsCount = deptForecasts.filter(d => d.status === "critical").length;
  const warningDeptsCount = deptForecasts.filter(d => d.status === "warning").length;
  const onTrackDeptsCount = deptForecasts.filter(d => d.status === "on_track" || d.status === "surplus").length;

  return {
    monthKey,
    asOfDay: resolvedAsOfDay,
    totalDays,
    elapsedPct,
    totalTargetBudgetThb,
    totalActualSpendToDateThb,
    totalTargetPacingToDateThb,
    totalDailyBurnRateThb,
    totalProjectedMonthEndSpendThb,
    totalProjectedVarianceThb,
    totalProjectedBurnRatePct,
    criticalDeptsCount,
    warningDeptsCount,
    onTrackDeptsCount,
    departments: deptForecasts
  };
}
