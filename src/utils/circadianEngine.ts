import { Employee } from "../types";
import { SHIFT_DEFINITIONS } from "./shiftRecommendation";

export interface CircadianSegment {
  startHour: number; // 0 to 24
  endHour: number;   // 0 to 24
  isNight: boolean;  // whether it falls into night band
  otHours: number;   // OT hours attributed
  shiftCode: string;
  dayOffset: number; // 0 for current day, 1 for next day segment
  color?: string;
}

export interface HourlyStaffingSlot {
  hour: number; // 0 to 23
  label: string; // e.g. "00:00", "01:00", ...
  headcount: number;
  morningCount: number;
  afternoonCount: number;
  nightCount: number;
  employees: Array<{ empId: string; name: string; role: string; shiftCode: string }>;
  isNightBand: boolean;
  isGap: boolean;
  isWarning: boolean;
  densityLevel: "zero" | "low" | "optimal" | "high";
}

export interface HourlyStaffingHeatmap {
  dateStr: string;
  slots: HourlyStaffingSlot[];
  totalActiveStaff: number;
  peakHour: number;
  lowestHour: number;
  coverageWarnings: string[];
  morningAverage: number;
  afternoonAverage: number;
  nightAverage: number;
}

/**
 * Returns true if an hour belongs to night circadian band (20:00 to 08:00)
 */
export function isCircadianNightHour(hour: number): boolean {
  return hour < 8 || hour >= 20;
}

/**
 * Decomposes a shift code into 24-hour continuous timeline segments.
 * Cross-midnight shifts (N8, N12, N16, A12) are split into Day 0 and Day 1 segments.
 */
export function getShiftCircadianSegments(shiftCode: string, _dateStr: string = "2026-08-01"): CircadianSegment[] {
  const code = (shiftCode || "O").toUpperCase().trim();
  const segments: CircadianSegment[] = [];

  switch (code) {
    case "M8":
      // 07:00 - 15:00 (8h work, 0h OT)
      segments.push({
        startHour: 7,
        endHour: 15,
        isNight: false,
        otHours: 0,
        shiftCode: "M8",
        dayOffset: 0,
        color: "#0284c7"
      });
      break;

    case "M12":
      // 07:00 - 19:00 (12h work, 4h OT)
      segments.push({
        startHour: 7,
        endHour: 19,
        isNight: false,
        otHours: 4,
        shiftCode: "M12",
        dayOffset: 0,
        color: "#06b6d4"
      });
      break;

    case "M16":
      // 07:00 - 23:00 (16h work, 8h OT)
      segments.push({
        startHour: 7,
        endHour: 23,
        isNight: false,
        otHours: 8,
        shiftCode: "M16",
        dayOffset: 0,
        color: "#1e40af"
      });
      break;

    case "A8":
      // 15:00 - 23:00 (8h work, 0h OT)
      segments.push({
        startHour: 15,
        endHour: 23,
        isNight: false,
        otHours: 0,
        shiftCode: "A8",
        dayOffset: 0,
        color: "#f59e0b"
      });
      break;

    case "A12":
      // 15:00 - 03:00 (+1 day, 12h work, 4h OT) -> Split at 24:00
      segments.push({
        startHour: 15,
        endHour: 24,
        isNight: false,
        otHours: 0,
        shiftCode: "A12",
        dayOffset: 0,
        color: "#d97706"
      });
      segments.push({
        startHour: 0,
        endHour: 3,
        isNight: true,
        otHours: 4,
        shiftCode: "A12",
        dayOffset: 1,
        color: "#b45309"
      });
      break;

    case "N8":
      // 23:00 - 07:00 (+1 day, 8h work, 0h OT) -> Split at 24:00
      segments.push({
        startHour: 23,
        endHour: 24,
        isNight: true,
        otHours: 0,
        shiftCode: "N8",
        dayOffset: 0,
        color: "#8b5cf6"
      });
      segments.push({
        startHour: 0,
        endHour: 7,
        isNight: true,
        otHours: 0,
        shiftCode: "N8",
        dayOffset: 1,
        color: "#7c3aed"
      });
      break;

    case "N12":
      // 19:00 - 07:00 (+1 day, 12h work, 4h OT) -> Split at 24:00
      segments.push({
        startHour: 19,
        endHour: 24,
        isNight: true,
        otHours: 0,
        shiftCode: "N12",
        dayOffset: 0,
        color: "#ec4899"
      });
      segments.push({
        startHour: 0,
        endHour: 7,
        isNight: true,
        otHours: 4,
        shiftCode: "N12",
        dayOffset: 1,
        color: "#db2777"
      });
      break;

    case "N16":
      // 19:00 - 11:00 (+1 day, 16h work, 8h OT) -> Split at 24:00
      segments.push({
        startHour: 19,
        endHour: 24,
        isNight: true,
        otHours: 0,
        shiftCode: "N16",
        dayOffset: 0,
        color: "#ef4444"
      });
      segments.push({
        startHour: 0,
        endHour: 11,
        isNight: false,
        otHours: 8,
        shiftCode: "N16",
        dayOffset: 1,
        color: "#dc2626"
      });
      break;

    case "D":
      // 08:00 - 17:00 (8h work, 0h OT)
      segments.push({
        startHour: 8,
        endHour: 17,
        isNight: false,
        otHours: 0,
        shiftCode: "D",
        dayOffset: 0,
        color: "#64748b"
      });
      break;

    case "OND":
      // 08:00 - 17:00 (8h work, 8h Holiday OT)
      segments.push({
        startHour: 8,
        endHour: 17,
        isNight: false,
        otHours: 8,
        shiftCode: "OND",
        dayOffset: 0,
        color: "#10b981"
      });
      break;

    default:
      // Off / Unassigned
      break;
  }

  return segments;
}

/**
 * Checks whether an employee is active at a given hour (0..23) on dateStr
 * considering both the current day shift and any carryover from previous day shift.
 */
export function isEmployeeActiveAtHour(
  currentDayShift: string,
  prevDayShift: string | undefined,
  hour: number
): { active: boolean; shiftCode: string; category: "morning" | "afternoon" | "night" | "full_day" | "off" | "leave" } {
  // Check current day segments (dayOffset === 0)
  const currentSegments = getShiftCircadianSegments(currentDayShift);
  for (const seg of currentSegments) {
    if (seg.dayOffset === 0 && hour >= seg.startHour && hour < seg.endHour) {
      const def = SHIFT_DEFINITIONS[seg.shiftCode];
      return { active: true, shiftCode: seg.shiftCode, category: def?.category || "morning" };
    }
  }

  // Check previous day carryover segments (dayOffset === 1)
  if (prevDayShift) {
    const prevSegments = getShiftCircadianSegments(prevDayShift);
    for (const seg of prevSegments) {
      if (seg.dayOffset === 1 && hour >= seg.startHour && hour < seg.endHour) {
        const def = SHIFT_DEFINITIONS[seg.shiftCode];
        return { active: true, shiftCode: seg.shiftCode, category: def?.category || "night" };
      }
    }
  }

  return { active: false, shiftCode: "O", category: "off" };
}

/**
 * Calculates the 24-hour hourly staffing density heatmap for a specific date across employees.
 */
export function calculateHourlyStaffingDensity(
  shifts: Record<string, string>,
  dateStr: string,
  employees: Employee[],
  prevDayShifts?: Record<string, string>
): HourlyStaffingHeatmap {
  const slots: HourlyStaffingSlot[] = [];
  const activeEmployeeIds = new Set<string>();

  for (let h = 0; h < 24; h++) {
    const label = `${String(h).padStart(2, "0")}:00`;
    const slotEmployees: Array<{ empId: string; name: string; role: string; shiftCode: string }> = [];
    let morningCount = 0;
    let afternoonCount = 0;
    let nightCount = 0;

    employees.forEach(emp => {
      const curShift = shifts[emp.id] || "O";
      const prevShift = prevDayShifts ? prevDayShifts[emp.id] : undefined;
      const status = isEmployeeActiveAtHour(curShift, prevShift, h);

      if (status.active) {
        activeEmployeeIds.add(emp.id);
        slotEmployees.push({
          empId: emp.id,
          name: emp.name,
          role: emp.role || "Operator",
          shiftCode: status.shiftCode
        });

        if (status.category === "morning" || status.category === "full_day") {
          morningCount++;
        } else if (status.category === "afternoon") {
          afternoonCount++;
        } else if (status.category === "night") {
          nightCount++;
        }
      }
    });

    const headcount = slotEmployees.length;
    const isNight = isCircadianNightHour(h);
    const isGap = headcount === 0 && employees.length > 0;
    const isWarning = headcount === 1 && employees.length >= 2;

    let densityLevel: "zero" | "low" | "optimal" | "high" = "optimal";
    if (headcount === 0) densityLevel = "zero";
    else if (headcount <= 1) densityLevel = "low";
    else if (headcount >= 4) densityLevel = "high";

    slots.push({
      hour: h,
      label,
      headcount,
      morningCount,
      afternoonCount,
      nightCount,
      employees: slotEmployees,
      isNightBand: isNight,
      isGap,
      isWarning,
      densityLevel
    });
  }

  // Calculate metrics
  let peakHour = 0;
  let maxCount = -1;
  let lowestHour = 0;
  let minCount = Infinity;
  let morningTotal = 0;
  let afternoonTotal = 0;
  let nightTotal = 0;

  slots.forEach(slot => {
    if (slot.headcount > maxCount) {
      maxCount = slot.headcount;
      peakHour = slot.hour;
    }
    if (slot.headcount < minCount) {
      minCount = slot.headcount;
      lowestHour = slot.hour;
    }

    // Circadian distribution (07-15 morning, 15-23 afternoon, 23-07 night)
    if (slot.hour >= 7 && slot.hour < 15) morningTotal += slot.headcount;
    else if (slot.hour >= 15 && slot.hour < 23) afternoonTotal += slot.headcount;
    else nightTotal += slot.headcount;
  });

  const morningAverage = Number((morningTotal / 8).toFixed(1));
  const afternoonAverage = Number((afternoonTotal / 8).toFixed(1));
  const nightAverage = Number((nightTotal / 8).toFixed(1));

  const coverageWarnings: string[] = [];
  slots.forEach(s => {
    if (s.isGap) {
      coverageWarnings.push(`ช่องว่างกำลังพล: ไม่มีพนักงานปฏิบัติงานช่วง ${s.label} - ${String((s.hour + 1) % 24).padStart(2, "0")}:00`);
    } else if (s.isWarning) {
      coverageWarnings.push(`กำลังพลขั้นต่ำ: มีพนักงานเพียง 1 คนช่วง ${s.label} (${s.employees[0]?.name || "1 คน"})`);
    }
  });

  return {
    dateStr,
    slots,
    totalActiveStaff: activeEmployeeIds.size,
    peakHour,
    lowestHour,
    coverageWarnings,
    morningAverage,
    afternoonAverage,
    nightAverage
  };
}
