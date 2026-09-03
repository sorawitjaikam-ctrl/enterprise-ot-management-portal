// ==========================================
// SMART SHIFT RECOMMENDATION & COMPLIANCE ENGINE
// ==========================================

export interface ShiftDefinition {
  code: string;
  name: string;
  category: "morning" | "afternoon" | "night" | "full_day" | "off" | "leave";
  startTime: string;
  endTime: string;
  workHours: number;
  otHours: number;
  description: string;
}

export const SHIFT_DEFINITIONS: Record<string, ShiftDefinition> = {
  "M8": { code: "M8", name: "กะเช้า 8 ชม.", category: "morning", startTime: "07:00", endTime: "15:00", workHours: 8, otHours: 0, description: "กะเช้ามาตรฐาน (07:00 - 15:00)" },
  "M12": { code: "M12", name: "กะเช้า 12 ชม. (OT 4h)", category: "morning", startTime: "07:00", endTime: "19:00", workHours: 12, otHours: 4, description: "กะเช้าพิเศษ + OT 4 ชม. (07:00 - 19:00)" },
  "M16": { code: "M16", name: "กะเช้าควบ 16 ชม. (OT 8h)", category: "morning", startTime: "07:00", endTime: "23:00", workHours: 16, otHours: 8, description: "กะเช้าควบ 2 กะ (07:00 - 23:00)" },
  "A8": { code: "A8", name: "กะบ่าย 8 ชม.", category: "afternoon", startTime: "15:00", endTime: "23:00", workHours: 8, otHours: 0, description: "กะบ่ายมาตรฐาน (15:00 - 23:00)" },
  "A12": { code: "A12", name: "กะบ่าย 12 ชม. (OT 4h)", category: "afternoon", startTime: "15:00", endTime: "03:00", workHours: 12, otHours: 4, description: "กะบ่ายพิเศษ + OT 4 ชม. (15:00 - 03:00)" },
  "N8": { code: "N8", name: "กะดึก 8 ชม.", category: "night", startTime: "23:00", endTime: "07:00", workHours: 8, otHours: 0, description: "กะดึกมาตรฐาน (23:00 - 07:00)" },
  "N12": { code: "N12", name: "กะดึก 12 ชม. (OT 4h)", category: "night", startTime: "19:00", endTime: "07:00", workHours: 12, otHours: 4, description: "กะดึกคู่กะ 12 ชม. (19:00 - 07:00)" },
  "N16": { code: "N16", name: "กะดึกควบ 16 ชม. (OT 8h)", category: "night", startTime: "19:00", endTime: "11:00", workHours: 16, otHours: 8, description: "กะดึกควบกะเช้า (19:00 - 11:00)" },
  "D": { code: "D", name: "กะกลางวันทั่วไป (Day)", category: "full_day", startTime: "08:00", endTime: "17:00", workHours: 8, otHours: 0, description: "กะกลางวันเวลาทำการปกติ (08:00 - 17:00)" },
  "OND": { code: "OND", name: "ทำงานในวันหยุด (OT 8h)", category: "full_day", startTime: "08:00", endTime: "17:00", workHours: 8, otHours: 8, description: "วันหยุดมาทำงานเต็มวัน (OT วันหยุด x1 หรือ x3)" },
  "O": { code: "O", name: "วันหยุดประจำสัปดาห์ (Off)", category: "off", startTime: "-", endTime: "-", workHours: 0, otHours: 0, description: "วันหยุดพักผ่อนประจำสัปดาห์" },
  "OFF": { code: "OFF", name: "วันหยุด (Off)", category: "off", startTime: "-", endTime: "-", workHours: 0, otHours: 0, description: "วันหยุดพักผ่อน" },
  "ป": { code: "ป", name: "ลาป่วย (Sick Leave)", category: "leave", startTime: "-", endTime: "-", workHours: 0, otHours: 0, description: "ลาป่วย" },
  "ก": { code: "ก", name: "ลากิจ (Personal Leave)", category: "leave", startTime: "-", endTime: "-", workHours: 0, otHours: 0, description: "ลากิจธุระจำเป็น" },
  "ข": { code: "ข", name: "ขาดงาน (Absent)", category: "leave", startTime: "-", endTime: "-", workHours: 0, otHours: 0, description: "ขาดงานโดยไม่แจ้งล่วงหน้า" },
  "ปง": { code: "ปง", name: "ลาป่วยมีใบรับรองแพทย์", category: "leave", startTime: "-", endTime: "-", workHours: 0, otHours: 0, description: "ลาป่วยมีใบรับรองแพทย์" },
  "ณ": { code: "ณ", name: "ลาฌาปนกิจ", category: "leave", startTime: "-", endTime: "-", workHours: 0, otHours: 0, description: "ลาช่วยเหลืองานฌาปนกิจ" },
  "คม": { code: "คม", name: "ลาคลอด / ลาสมรส", category: "leave", startTime: "-", endTime: "-", workHours: 0, otHours: 0, description: "ลาคลอดบุตรหรือลาสมรส" },
  "พ": { code: "พ", name: "ลาพักร้อน (Annual Leave)", category: "leave", startTime: "-", endTime: "-", workHours: 0, otHours: 0, description: "ลาหยุดพักผ่อนประจำปี" },
  "ลย": { code: "ลย", name: "ลาหยุดชดเชย (Compensatory Leave)", category: "leave", startTime: "-", endTime: "-", workHours: 0, otHours: 0, description: "ลาหยุดชดเชยวันทำงานพิเศษ" },
  "ลบ": { code: "ลบ", name: "ลาบวช (Ordination Leave)", category: "leave", startTime: "-", endTime: "-", workHours: 0, otHours: 0, description: "ลาอุปสมบท" },
  "ตง": { code: "ตง", name: "ตรวจสุขภาพ / ราชการ", category: "leave", startTime: "-", endTime: "-", workHours: 0, otHours: 0, description: "ลาตรวจสุขภาพหรือราชการทหาร" }
};

/**
 * คำนวณกะคู่ตรงข้ามที่เหมาะสมที่สุดสำหรับพนักงานในตำแหน่งเดียวกัน
 */
export function getComplementaryShift(sourceShift: string): { suggestedCode: string; rationale: string } {
  const code = (sourceShift || "O").toUpperCase().trim();

  switch (code) {
    case "M12":
      return {
        suggestedCode: "N12",
        rationale: "คู่กะ 12 ชม.: คู่กะเข้าเช้า (07:00-19:00) แนะนำให้คนนี้เข้ากะดึก (19:00-07:00) เพื่อครอบคลุม 24 ชม."
      };
    case "N12":
      return {
        suggestedCode: "M12",
        rationale: "คู่กะ 12 ชม.: คู่กะเข้าดึก (19:00-07:00) แนะนำให้คนนี้เข้ากะเช้า (07:00-19:00) เพื่อผลัดเปลี่ยนเวร"
      };
    case "M8":
      return {
        suggestedCode: "A8",
        rationale: "กะ 3 ผลัด: คู่กะเข้าเช้า (07:00-15:00) แนะนำให้คนนี้เข้ากะบ่าย (15:00-23:00)"
      };
    case "A8":
      return {
        suggestedCode: "N8",
        rationale: "กะ 3 ผลัด: คู่กะเข้าบ่าย (15:00-23:00) แนะนำให้คนนี้เข้ากะดึก (23:00-07:00)"
      };
    case "N8":
      return {
        suggestedCode: "M8",
        rationale: "กะ 3 ผลัด: คู่กะเข้าดึก (23:00-07:00) แนะนำให้คนนี้เข้ากะเช้า (07:00-15:00)"
      };
    case "D":
      return {
        suggestedCode: "N12",
        rationale: "คู่กะเข้ากลางวัน (08:00-17:00) แนะนำให้คนนี้เข้ากะดึกเพื่อดูแลงานช่วงกลางคืน"
      };
    case "O":
    case "OFF":
      return {
        suggestedCode: "M12",
        rationale: "คู่กะหยุด แนะนำให้คนนี้เข้ากะเช้าหลัก (M12) เพื่อให้ตำแหน่งไม่ขาดคน"
      };
    default:
      return {
        suggestedCode: "M12",
        rationale: "แนะนำกะเช้ามาตรฐาน M12 สำหรับช่วงเวลาทำการปกติ"
      };
  }
}

/**
 * สร้างรูปแบบตารางกะคู่สลับ 12 ชม. (2 ทีม A/B)
 */
export function generateTwoTeamPairSchedules(totalDays: number): { teamA: string[]; teamB: string[] } {
  const teamA: string[] = [];
  const teamB: string[] = [];

  const patternA = ["M12", "M12", "M12", "M12", "O", "O", "N12", "N12", "N12", "N12", "O", "O"];
  const patternB = ["N12", "N12", "N12", "N12", "O", "O", "M12", "M12", "M12", "M12", "O", "O"];

  for (let d = 0; d < totalDays; d++) {
    teamA.push(patternA[d % patternA.length]);
    teamB.push(patternB[d % patternB.length]);
  }

  return { teamA, teamB };
}

/**
 * สร้างรูปแบบกะ 3 ผลัด (3 ทีม A/B/C)
 */
export function generateThreeTeamRotatingSchedules(totalDays: number): { teamA: string[]; teamB: string[]; teamC: string[] } {
  const teamA: string[] = [];
  const teamB: string[] = [];
  const teamC: string[] = [];

  const patternA = ["M8", "M8", "M8", "M8", "O", "O", "A8", "A8", "A8", "A8", "O", "O", "N8", "N8", "N8", "N8", "O", "O"];
  const patternB = ["A8", "A8", "A8", "A8", "O", "O", "N8", "N8", "N8", "N8", "O", "O", "M8", "M8", "M8", "M8", "O", "O"];
  const patternC = ["N8", "N8", "N8", "N8", "O", "O", "M8", "M8", "M8", "M8", "O", "O", "A8", "A8", "A8", "A8", "O", "O"];

  for (let d = 0; d < totalDays; d++) {
    teamA.push(patternA[d % patternA.length]);
    teamB.push(patternB[d % patternB.length]);
    teamC.push(patternC[d % patternC.length]);
  }

  return { teamA, teamB, teamC };
}

/**
 * ตรวจสอบความสอดคล้องตามกฎหมายแรงงานไทย
 */
export interface ComplianceAlert {
  type: "weekly_ot" | "consecutive_days" | "rest_period";
  level: "warning" | "danger";
  message: string;
  dayIndex?: number;
  dayNumber?: number;
}

export function auditEmployeeShiftsCompliance(shifts: string[], monthKey: string): ComplianceAlert[] {
  const alerts: ComplianceAlert[] = [];
  if (!shifts || shifts.length === 0) return alerts;

  const [yStr, mStr] = (monthKey || "2026-08").split("-");
  const yr = Number(yStr) || 2026;
  const mn = Number(mStr) || 8;
  const totalDays = new Date(yr, mn, 0).getDate();

  // 1. OT สะสมรายสัปดาห์ > 36 ชม.
  for (let i = 0; i < totalDays; i += 7) {
    const weekSlice = shifts.slice(i, Math.min(i + 7, totalDays));
    let weekOt = 0;
    weekSlice.forEach(code => {
      if (code === "OND") weekOt += 8;
      else if (code === "M12" || code === "A12" || code === "N12") weekOt += 4;
      else if (code === "M16" || code === "N16") weekOt += 8;
    });

    if (weekOt > 36) {
      const weekNum = Math.floor(i / 7) + 1;
      alerts.push({
        type: "weekly_ot",
        level: "danger",
        message: `สัปดาห์ที่ ${weekNum} มี OT สะสม ${weekOt} ชม. (เกินขีดจำกัดกฎหมายแรงงาน 36 ชม./สัปดาห์)`,
        dayIndex: i,
        dayNumber: i + 1
      });
    }
  }

  // 2. ทำงานติดต่อกันเกิน 6 วัน
  let consecutiveWork = 0;
  for (let d = 0; d < totalDays; d++) {
    const code = shifts[d] || "O";
    const isOff = code === "O" || code === "OFF";

    if (!isOff) {
      consecutiveWork++;
      if (consecutiveWork > 6) {
        alerts.push({
          type: "consecutive_days",
          level: "warning",
          message: `วันที่ ${d + 1} ทำงานติดต่อกัน ${consecutiveWork} วันโดยไม่มีวันหยุดประจำสัปดาห์`,
          dayIndex: d,
          dayNumber: d + 1
        });
      }
    } else {
      consecutiveWork = 0;
    }
  }

  // 3. ระยะเวลาพักผ่อนระหว่างกะ (< 11 ชม.)
  for (let d = 0; d < totalDays - 1; d++) {
    const today = shifts[d] || "O";
    const tomorrow = shifts[d + 1] || "O";

    const isTodayNight = today === "N12" || today === "N8" || today === "N16";
    const isTomorrowMorning = tomorrow === "M8" || tomorrow === "M12" || tomorrow === "M16" || tomorrow === "D";

    if (isTodayNight && isTomorrowMorning) {
      alerts.push({
        type: "rest_period",
        level: "danger",
        message: `วันที่ ${d + 1} ออกกะดึก (${today}) แล้วต่อกะเช้า (${tomorrow}) ในวันที่ ${d + 2} ทันที (เวลาพักผ่อนไม่ถึง 11 ชม.)`,
        dayIndex: d + 1,
        dayNumber: d + 2
      });
    }
  }

  return alerts;
}

/**
 * วิเคราะห์ความพร้อมของกำลังพลรายวันในแผนก (Daily Role Coverage)
 */
export interface DailyRoleCoverage {
  dayNumber: number;
  role: string;
  morningCount: number;
  nightCount: number;
  offCount: number;
  totalEmployees: number;
  hasGap: boolean;
  status: "optimal" | "warning" | "danger";
}

export function analyzeDepartmentShiftCoverage(
  departmentEmployees: any[],
  monthKey: string
): Record<string, DailyRoleCoverage[]> {
  const [yStr, mStr] = (monthKey || "2026-08").split("-");
  const yr = Number(yStr) || 2026;
  const mn = Number(mStr) || 8;
  const totalDays = new Date(yr, mn, 0).getDate();

  const roleGroups: Record<string, any[]> = {};
  departmentEmployees.forEach(emp => {
    const r = emp.role || "Operator";
    if (!roleGroups[r]) roleGroups[r] = [];
    roleGroups[r].push(emp);
  });

  const result: Record<string, DailyRoleCoverage[]> = {};

  Object.entries(roleGroups).forEach(([role, emps]) => {
    result[role] = [];

    for (let day = 1; day <= totalDays; day++) {
      let morning = 0;
      let night = 0;
      let off = 0;

      emps.forEach(emp => {
        const shifts = Array.isArray(emp.shifts) ? emp.shifts : (emp.shifts?.[monthKey] || []);
        const code = shifts[day - 1] || "O";
        const def = SHIFT_DEFINITIONS[code];

        if (def?.category === "morning" || def?.category === "full_day" || code === "D" || code === "M8" || code === "M12" || code === "M16") {
          morning++;
        } else if (def?.category === "night" || def?.category === "afternoon" || code === "N8" || code === "N12" || code === "A8" || code === "A12") {
          night++;
        } else {
          off++;
        }
      });

      const total = emps.length;
      let hasGap = false;
      let status: "optimal" | "warning" | "danger" = "optimal";

      if (total >= 2) {
        if (morning === 0 && night === 0) {
          hasGap = true;
          status = "danger";
        } else if (morning === 0 || night === 0) {
          hasGap = true;
          status = "warning";
        }
      } else if (total === 1 && morning === 0 && night === 0) {
        status = "warning";
      }

      result[role].push({
        dayNumber: day,
        role,
        morningCount: morning,
        nightCount: night,
        offCount: off,
        totalEmployees: total,
        hasGap,
        status
      });
    }
  });

  return result;
}

/**
 * สร้างรูปแบบกะมาตรฐาน 4-on-2-off
 */
export function generate4On2OffSchedule(totalDays: number, shiftCode: string = "M12", startOffset: number = 0): string[] {
  const result: string[] = [];
  for (let d = 0; d < totalDays; d++) {
    const cycle = (d + startOffset) % 6;
    if (cycle < 4) {
      result.push(shiftCode);
    } else {
      result.push("O");
    }
  }
  return result;
}
