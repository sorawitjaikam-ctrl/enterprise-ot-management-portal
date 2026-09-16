import { Employee, Department } from "../types";
import { getShiftOtHours } from "./costSimulationEngine";
import { getDaysInMonth, parseEmployeeShifts } from "./budgetForecastEngine";

export interface RoleRiskAssessment {
  role: string;
  department: string;
  totalHeadcount: number;
  activeHeadcount: number;
  minimumRequired: number;
  staffingShortfall: number;
  isUnderstaffed: boolean;
  projectedFatigueCount: number;
  consecutiveDaysNearBreach: number;
  restTurnaroundViolations: number;
  riskLevel: "CRITICAL" | "HIGH" | "MODERATE" | "LOW";
  riskScore: number;
  proactiveWarning: string;
  recommendedMitigation: string;
}

export interface DepartmentRiskAssessment {
  deptId: string;
  deptName: string;
  riskScore: number;
  riskLevel: "CRITICAL" | "HIGH" | "MODERATE" | "LOW";
  fatigueCount: number;
  staffingGap: number;
  warning: string;
}

export interface ProactiveRiskRadarSummary {
  overallRiskScore: number;
  riskStatus: "CRITICAL" | "HIGH" | "MODERATE" | "LOW";
  radarMetrics: {
    staffingSufficiency: number;  // 0 - 1
    weeklyOtSafety: number;       // 0 - 1
    restTurnaroundSafety: number; // 0 - 1
    workdayAdherence: number;     // 0 - 1
    rosterResilience: number;     // 0 - 1
  };
  roleAssessments: RoleRiskAssessment[];
  departmentAssessments: DepartmentRiskAssessment[];
}

export const STANDARD_ROLE_MINIMUM_REQUIREMENTS: Record<string, number> = {
  "พนักงานขับเครน": 4,
  "Crane Operator": 4,
  "ปากเรือ": 3,
  "Foreman": 3,
  "ผู้ควบคุมงานขนถ่ายสินค้า": 2,
  "Cargo Controller": 2,
  "ช่างขับจักรกลหนัก": 4,
  "Heavy Machine Driver": 4,
  "ผู้ควบคุมงานจักรกลหนัก": 2,
  "Heavy Machine Supervisor": 2,
  "O&M - Specialist": 3,
  "O&M - Generator": 2,
  "O&M - Mechanical": 3,
  "O&M - Electrical": 3,
  "ECC": 2
};

export function getMinimumRequiredForRole(role: string, headcount: number): number {
  if (!role) return 1;
  const trimmed = role.trim();
  if (STANDARD_ROLE_MINIMUM_REQUIREMENTS[trimmed] !== undefined) {
    return STANDARD_ROLE_MINIMUM_REQUIREMENTS[trimmed];
  }
  for (const [key, val] of Object.entries(STANDARD_ROLE_MINIMUM_REQUIREMENTS)) {
    if (trimmed.toLowerCase().includes(key.toLowerCase())) {
      return val;
    }
  }
  return Math.max(1, Math.min(headcount, 3));
}

export function isEmployeeActive(emp: Employee): boolean {
  if (!emp) return false;
  const status = (emp.employmentStatus || "").trim().toLowerCase();
  if (
    status === "resigned" ||
    status === "inactive" ||
    status === "retired" ||
    status === "ลาออก" ||
    status === "เกษียณ" ||
    status === "พ้นสภาพ"
  ) {
    return false;
  }
  return true;
}

export function auditEmployeeProactiveRisks(
  emp: Employee,
  monthKey: string
): {
  hasImpendingWeeklyOt: boolean;
  maxWeeklyOt: number;
  hasConsecutiveNearBreach: boolean;
  maxConsecutiveDays: number;
  restTurnaroundCount: number;
} {
  const shifts = parseEmployeeShifts(emp.shifts, monthKey);
  const totalDays = getDaysInMonth(monthKey);

  let maxWeeklyOt = 0;
  let hasImpendingWeeklyOt = false;

  // 1. Impending Weekly OT (>= 28h within rolling 7 days)
  for (let i = 0; i < totalDays; i += 7) {
    const slice = shifts.slice(i, Math.min(i + 7, totalDays));
    let weekOt = 0;
    for (const code of slice) {
      weekOt += getShiftOtHours(code);
    }
    if (weekOt > maxWeeklyOt) maxWeeklyOt = weekOt;
    if (weekOt >= 28) {
      hasImpendingWeeklyOt = true;
    }
  }

  // Also check rolling 7-day windows starting at every day
  for (let i = 0; i <= totalDays - 7; i++) {
    const slice = shifts.slice(i, i + 7);
    let weekOt = 0;
    for (const code of slice) {
      weekOt += getShiftOtHours(code);
    }
    if (weekOt > maxWeeklyOt) maxWeeklyOt = weekOt;
    if (weekOt >= 28) {
      hasImpendingWeeklyOt = true;
    }
  }

  // 2. Consecutive Days Near Breach (>= 5 consecutive days without rest)
  let maxConsecutiveDays = 0;
  let currentConsecutive = 0;
  for (let d = 0; d < totalDays; d++) {
    const code = shifts[d] || "O";
    const isOff = code === "O" || code === "OFF" || code === "";
    if (!isOff) {
      currentConsecutive++;
      if (currentConsecutive > maxConsecutiveDays) {
        maxConsecutiveDays = currentConsecutive;
      }
    } else {
      currentConsecutive = 0;
    }
  }
  const hasConsecutiveNearBreach = maxConsecutiveDays >= 5;

  // 3. Rest Turnaround (< 11h between night shift and subsequent morning shift)
  let restTurnaroundCount = 0;
  for (let d = 0; d < totalDays - 1; d++) {
    const today = shifts[d] || "O";
    const tomorrow = shifts[d + 1] || "O";
    const isTodayNight = today === "N12" || today === "N8" || today === "N16";
    const isTomorrowMorning = tomorrow === "M8" || tomorrow === "M12" || tomorrow === "M16" || tomorrow === "D";
    if (isTodayNight && isTomorrowMorning) {
      restTurnaroundCount++;
    }
  }

  return {
    hasImpendingWeeklyOt,
    maxWeeklyOt,
    hasConsecutiveNearBreach,
    maxConsecutiveDays,
    restTurnaroundCount
  };
}

export function computeProactiveRiskRadar(
  employees: Employee[],
  departments: Department[],
  monthKey: string = "2026-08"
): ProactiveRiskRadarSummary {
  const roleMap: Map<string, { role: string; deptId: string; employees: Employee[] }> = new Map();

  for (const emp of employees) {
    const roleKey = `${emp.deptId}:::${emp.role || "Unknown"}`;
    if (!roleMap.has(roleKey)) {
      roleMap.set(roleKey, {
        role: emp.role || "Unknown",
        deptId: emp.deptId || "Unknown",
        employees: []
      });
    }
    roleMap.get(roleKey)!.employees.push(emp);
  }

  const roleAssessments: RoleRiskAssessment[] = [];

  let totalActiveHeadcount = 0;
  let totalMinimumRequired = 0;
  let totalImpendingFatigue = 0;
  let totalConsecutiveNearBreach = 0;
  let totalRestTurnarounds = 0;

  for (const entry of roleMap.values()) {
    const totalHeadcount = entry.employees.length;
    const activeEmployees = entry.employees.filter(isEmployeeActive);
    const activeHeadcount = activeEmployees.length;
    const minimumRequired = getMinimumRequiredForRole(entry.role, totalHeadcount);
    const staffingShortfall = Math.max(0, minimumRequired - activeHeadcount);
    const isUnderstaffed = staffingShortfall > 0;

    let projectedFatigueCount = 0;
    let consecutiveDaysNearBreach = 0;
    let restTurnaroundViolations = 0;

    for (const emp of activeEmployees) {
      const risk = auditEmployeeProactiveRisks(emp, monthKey);
      if (risk.hasImpendingWeeklyOt) projectedFatigueCount++;
      if (risk.hasConsecutiveNearBreach) consecutiveDaysNearBreach++;
      restTurnaroundViolations += risk.restTurnaroundCount;
    }

    totalActiveHeadcount += activeHeadcount;
    totalMinimumRequired += minimumRequired;
    totalImpendingFatigue += projectedFatigueCount;
    totalConsecutiveNearBreach += consecutiveDaysNearBreach;
    totalRestTurnarounds += restTurnaroundViolations;

    const rawScore =
      staffingShortfall * 25 +
      projectedFatigueCount * 20 +
      consecutiveDaysNearBreach * 15 +
      restTurnaroundViolations * 15;
    const riskScore = Math.min(100, Math.max(0, rawScore));

    let riskLevel: "CRITICAL" | "HIGH" | "MODERATE" | "LOW" = "LOW";
    if (riskScore >= 70 || staffingShortfall >= 2 || projectedFatigueCount >= 3) {
      riskLevel = "CRITICAL";
    } else if (riskScore >= 45 || staffingShortfall >= 1 || projectedFatigueCount >= 2) {
      riskLevel = "HIGH";
    } else if (riskScore >= 20 || consecutiveDaysNearBreach >= 1 || restTurnaroundViolations >= 1) {
      riskLevel = "MODERATE";
    }

    let proactiveWarning = "อัตรากำลังและตารางการทำงานอยู่ในเกณฑ์ปลอดภัย";
    let recommendedMitigation = "รักษาตารางการทำงานตามแผนเดิม";

    if (staffingShortfall > 0) {
      proactiveWarning = `อัตรากำลังขาดแคลน ${staffingShortfall} อัตรา เสี่ยงจัดกะควบ`;
      recommendedMitigation = "ระดมกำลังพลสำรองหรือปรับแผนจัดกะข้ามทีม";
    } else if (projectedFatigueCount > 0) {
      proactiveWarning = `พบพนักงาน ${projectedFatigueCount} คนมี OT สะสมจวนเกินเกณฑ์ 36 ชม./สัปดาห์`;
      recommendedMitigation = "สลับพนักงานกะสำรองเข้าแทนเพื่อลดชั่วโมงสะสม";
    } else if (consecutiveDaysNearBreach > 0) {
      proactiveWarning = `พนักงานทำงานต่อเนื่อง 5 วันขึ้นไป เสี่ยงละเมิดกฎหมายแรงงาน`;
      recommendedMitigation = "กำหนดวันหยุดชดเชยภายใน 24 ชั่วโมง";
    } else if (restTurnaroundViolations > 0) {
      proactiveWarning = `พบการจัดกะดึกต่อกะเช้า พักผ่อนไม่ถึง 11 ชม.`;
      recommendedMitigation = "ปรับขยับกะเช้าเป็นกะบ่ายเพื่อให้มีเวลาพักผ่อนครบ 11 ชม.";
    }

    roleAssessments.push({
      role: entry.role,
      department: entry.deptId,
      totalHeadcount,
      activeHeadcount,
      minimumRequired,
      staffingShortfall,
      isUnderstaffed,
      projectedFatigueCount,
      consecutiveDaysNearBreach,
      restTurnaroundViolations,
      riskLevel,
      riskScore,
      proactiveWarning,
      recommendedMitigation
    });
  }

  // Sort role assessments: CRITICAL first, then HIGH, then MODERATE, then LOW
  const riskOrder: Record<string, number> = { CRITICAL: 0, HIGH: 1, MODERATE: 2, LOW: 3 };
  roleAssessments.sort((a, b) => {
    const diff = riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
    if (diff !== 0) return diff;
    return b.riskScore - a.riskScore;
  });

  // Department assessments
  const deptList = departments && departments.length > 0
    ? departments
    : Array.from(new Set(roleAssessments.map(r => r.department))).map(id => ({ id, name: id } as Department));

  const departmentAssessments: DepartmentRiskAssessment[] = deptList.map(d => {
    const dRoles = roleAssessments.filter(
      r => r.department.toLowerCase() === d.id.toLowerCase() || (d.name && r.department.toLowerCase() === d.name.toLowerCase())
    );
    const staffingGap = dRoles.reduce((acc, curr) => acc + curr.staffingShortfall, 0);
    const fatigueCount = dRoles.reduce((acc, curr) => acc + curr.projectedFatigueCount + curr.consecutiveDaysNearBreach, 0);
    const maxRoleScore = dRoles.length > 0 ? Math.max(...dRoles.map(r => r.riskScore)) : 0;
    const avgRoleScore = dRoles.length > 0 ? Math.round(dRoles.reduce((acc, curr) => acc + curr.riskScore, 0) / dRoles.length) : 0;
    const combinedScore = Math.min(100, Math.round(maxRoleScore * 0.7 + avgRoleScore * 0.3));

    let riskLevel: "CRITICAL" | "HIGH" | "MODERATE" | "LOW" = "LOW";
    if (combinedScore >= 70 || staffingGap >= 2) {
      riskLevel = "CRITICAL";
    } else if (combinedScore >= 45 || staffingGap >= 1 || fatigueCount >= 2) {
      riskLevel = "HIGH";
    } else if (combinedScore >= 20 || fatigueCount >= 1) {
      riskLevel = "MODERATE";
    }

    let warning = "การบริหารกะทำงานและกำลังพลอยู่ในเกณฑ์ปกติ";
    if (riskLevel === "CRITICAL") {
      warning = `พบความเสี่ยงระดับวิกฤต กำลังพลขาด ${staffingGap} อัตรา และเสี่ยงความล้าสะสม`;
    } else if (riskLevel === "HIGH") {
      warning = `เฝ้าระวังอัตรากำลังและชั่วโมงการทำงานล่วงหน้า`;
    } else if (riskLevel === "MODERATE") {
      warning = `ตรวจพบข้อควรระวังเรื่องการพักผ่อนและวันหยุดต่อเนื่อง`;
    }

    return {
      deptId: d.id,
      deptName: d.name || d.id,
      riskScore: combinedScore,
      riskLevel,
      fatigueCount,
      staffingGap,
      warning
    };
  });

  departmentAssessments.sort((a, b) => {
    const diff = riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
    if (diff !== 0) return diff;
    return b.riskScore - a.riskScore;
  });

  // 5-Axis Radar metrics (all normalized 0 to 1)
  const staffingSufficiency = totalMinimumRequired > 0
    ? Math.max(0, Math.min(1, Math.round((totalActiveHeadcount / totalMinimumRequired) * 100) / 100))
    : 1.0;

  const weeklyOtSafety = totalActiveHeadcount > 0
    ? Math.max(0, Math.min(1, Math.round((1 - totalImpendingFatigue / totalActiveHeadcount) * 100) / 100))
    : 1.0;

  const restTurnaroundSafety = totalActiveHeadcount > 0
    ? Math.max(0, Math.min(1, Math.round((1 - totalRestTurnarounds / (totalActiveHeadcount * 2)) * 100) / 100))
    : 1.0;

  const workdayAdherence = totalActiveHeadcount > 0
    ? Math.max(0, Math.min(1, Math.round((1 - totalConsecutiveNearBreach / totalActiveHeadcount) * 100) / 100))
    : 1.0;

  const rosterResilience = totalMinimumRequired > 0
    ? Math.max(0, Math.min(1, Math.round((totalActiveHeadcount / (totalMinimumRequired * 1.25)) * 100) / 100))
    : 1.0;

  const overallRiskScore = departmentAssessments.length > 0
    ? Math.round(departmentAssessments.reduce((acc, curr) => acc + curr.riskScore, 0) / departmentAssessments.length)
    : 0;

  let riskStatus: "CRITICAL" | "HIGH" | "MODERATE" | "LOW" = "LOW";
  if (overallRiskScore >= 70 || departmentAssessments.some(d => d.riskLevel === "CRITICAL")) {
    riskStatus = "CRITICAL";
  } else if (overallRiskScore >= 45 || departmentAssessments.some(d => d.riskLevel === "HIGH")) {
    riskStatus = "HIGH";
  } else if (overallRiskScore >= 20 || departmentAssessments.some(d => d.riskLevel === "MODERATE")) {
    riskStatus = "MODERATE";
  }

  return {
    overallRiskScore,
    riskStatus,
    radarMetrics: {
      staffingSufficiency,
      weeklyOtSafety,
      restTurnaroundSafety,
      workdayAdherence,
      rosterResilience
    },
    roleAssessments,
    departmentAssessments
  };
}
