import { describe, it, expect } from "vitest";
import {
  getShiftCircadianSegments,
  isCircadianNightHour,
  calculateHourlyStaffingDensity,
  isEmployeeActiveAtHour
} from "../../src/utils/circadianEngine";
import { Employee } from "../../src/types";

describe("Tier 1: Circadian 24-Hour Timeline Engine (circadianEngine)", () => {
  it("T1.C.1: getShiftCircadianSegments correctly handles daytime shifts (M8, M12, M16, D, OND)", () => {
    // M8: 07:00 - 15:00
    const m8 = getShiftCircadianSegments("M8");
    expect(m8).toHaveLength(1);
    expect(m8[0].startHour).toBe(7);
    expect(m8[0].endHour).toBe(15);
    expect(m8[0].isNight).toBe(false);
    expect(m8[0].otHours).toBe(0);

    // M12: 07:00 - 19:00 (4h OT)
    const m12 = getShiftCircadianSegments("M12");
    expect(m12).toHaveLength(1);
    expect(m12[0].startHour).toBe(7);
    expect(m12[0].endHour).toBe(19);
    expect(m12[0].isNight).toBe(false);
    expect(m12[0].otHours).toBe(4);

    // M16: 07:00 - 23:00 (8h OT)
    const m16 = getShiftCircadianSegments("M16");
    expect(m16).toHaveLength(1);
    expect(m16[0].startHour).toBe(7);
    expect(m16[0].endHour).toBe(23);
    expect(m16[0].otHours).toBe(8);

    // D: 08:00 - 17:00
    const d = getShiftCircadianSegments("D");
    expect(d).toHaveLength(1);
    expect(d[0].startHour).toBe(8);
    expect(d[0].endHour).toBe(17);

    // OND: 08:00 - 17:00 (8h OT)
    const ond = getShiftCircadianSegments("OND");
    expect(ond).toHaveLength(1);
    expect(ond[0].startHour).toBe(8);
    expect(ond[0].endHour).toBe(17);
    expect(ond[0].otHours).toBe(8);
  });

  it("T1.C.2: getShiftCircadianSegments correctly splits cross-midnight shifts (N8, N12, N16, A12)", () => {
    // N12: 19:00 to 07:00 next day -> Segment 1 (19-24), Segment 2 (0-7 next day)
    const n12 = getShiftCircadianSegments("N12");
    expect(n12).toHaveLength(2);
    expect(n12[0].startHour).toBe(19);
    expect(n12[0].endHour).toBe(24);
    expect(n12[0].dayOffset).toBe(0);
    expect(n12[0].isNight).toBe(true);

    expect(n12[1].startHour).toBe(0);
    expect(n12[1].endHour).toBe(7);
    expect(n12[1].dayOffset).toBe(1);
    expect(n12[1].isNight).toBe(true);
    expect(n12[1].otHours).toBe(4);

    // N8: 23:00 to 07:00 next day -> Segment 1 (23-24), Segment 2 (0-7)
    const n8 = getShiftCircadianSegments("N8");
    expect(n8).toHaveLength(2);
    expect(n8[0].startHour).toBe(23);
    expect(n8[0].endHour).toBe(24);
    expect(n8[1].startHour).toBe(0);
    expect(n8[1].endHour).toBe(7);

    // A12: 15:00 to 03:00 next day -> Segment 1 (15-24), Segment 2 (0-3)
    const a12 = getShiftCircadianSegments("A12");
    expect(a12).toHaveLength(2);
    expect(a12[0].startHour).toBe(15);
    expect(a12[0].endHour).toBe(24);
    expect(a12[1].startHour).toBe(0);
    expect(a12[1].endHour).toBe(3);

    // Off shift returns empty segments
    expect(getShiftCircadianSegments("O")).toEqual([]);
    expect(getShiftCircadianSegments("OFF")).toEqual([]);
  });

  it("T1.C.3: isCircadianNightHour accurately classifies day (08-20) vs night (20-08) hours", () => {
    expect(isCircadianNightHour(0)).toBe(true);
    expect(isCircadianNightHour(4)).toBe(true);
    expect(isCircadianNightHour(7)).toBe(true);
    expect(isCircadianNightHour(8)).toBe(false);
    expect(isCircadianNightHour(12)).toBe(false);
    expect(isCircadianNightHour(19)).toBe(false);
    expect(isCircadianNightHour(20)).toBe(true);
    expect(isCircadianNightHour(23)).toBe(true);
  });

  it("T1.C.4: isEmployeeActiveAtHour evaluates current day and previous day carryover accurately", () => {
    // Current day M12 (07:00-19:00)
    expect(isEmployeeActiveAtHour("M12", undefined, 6).active).toBe(false);
    expect(isEmployeeActiveAtHour("M12", undefined, 7).active).toBe(true);
    expect(isEmployeeActiveAtHour("M12", undefined, 12).active).toBe(true);
    expect(isEmployeeActiveAtHour("M12", undefined, 18).active).toBe(true);
    expect(isEmployeeActiveAtHour("M12", undefined, 19).active).toBe(false);

    // Previous day N12 (19:00-07:00) active on current day 00:00-07:00
    expect(isEmployeeActiveAtHour("O", "N12", 3).active).toBe(true);
    expect(isEmployeeActiveAtHour("O", "N12", 6).active).toBe(true);
    expect(isEmployeeActiveAtHour("O", "N12", 7).active).toBe(false);
  });

  it("T1.C.5: calculateHourlyStaffingDensity generates 24 slots with accurate metrics & gap detection", () => {
    const employees: Employee[] = [
      { id: "E1", name: "Somchai", deptId: "inter2", role: "Driver", targetOt: 0, actualOt: 0, otPct: 0, status: "On Track", groupName: "A", shifts: [] },
      { id: "E2", name: "Sombat", deptId: "inter2", role: "Driver", targetOt: 0, actualOt: 0, otPct: 0, status: "On Track", groupName: "B", shifts: [] }
    ];

    // E1 has M12 (07:00-19:00), E2 has N12 (19:00-07:00)
    const shifts = { E1: "M12", E2: "N12" };
    const prevShifts = { E1: "O", E2: "N12" }; // E2 worked N12 yesterday too, covering 00:00-07:00

    const density = calculateHourlyStaffingDensity(shifts, "2026-08-05", employees, prevShifts);

    expect(density.slots).toHaveLength(24);
    expect(density.totalActiveStaff).toBe(2);

    // Hour 3 (Night): E2 should be active from prev night shift
    expect(density.slots[3].headcount).toBe(1);
    expect(density.slots[3].employees[0].empId).toBe("E2");

    // Hour 12 (Noon): E1 should be active from M12
    expect(density.slots[12].headcount).toBe(1);
    expect(density.slots[12].employees[0].empId).toBe("E1");

    // Hour 21 (Night): E2 should be active from today N12
    expect(density.slots[21].headcount).toBe(1);
    expect(density.slots[21].employees[0].empId).toBe("E2");
  });
});
