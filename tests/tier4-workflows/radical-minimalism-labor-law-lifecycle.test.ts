import { describe, it, expect } from 'vitest';
import { calculateEmployeeMonthlyOt, getShiftOtHours } from '../../src/utils/costSimulationEngine';
import { auditEmployeeShiftsCompliance } from '../../src/utils/shiftRecommendation';
import { computeDynamicShift } from '../../src/components/PremiumShiftTimePickerModal';
import { Employee } from '../../src/types';

describe('Tier 4: Radical Minimalism Real-World Scenarios & Labor Law Lifecycle', () => {
  const createTestEmployee = (overrides: Partial<Employee> = {}): Employee => ({
    id: "EMP-LIFECYCLE-01",
    name: "นายชลธี ปฏิบัติการ",
    deptId: "inter2",
    role: "Crane Operator",
    salary: 36000, // 150 THB / hr
    targetOt: 48,
    actualOt: 0,
    otPct: 0,
    status: "Active",
    groupName: "Default",
    shifts: Array(31).fill("OFF"),
    ...overrides
  });

  // Scenario 1: Complete 1-Month Shift Lifecycle across 31 Days
  it('T4.LL.1: Completes full 31-day maritime terminal monthly shift cycle with 100% mathematical precision', () => {
    // 31-day schedule following a realistic 4-on-2-off rotation + 1 holiday OND + 1 heavy 24h shift
    // Aug 2026: Aug 1 (Sat), Aug 2 (Sun), Aug 3 (Mon)...
    const monthShifts = [
      "M12", "M12", "A12", "A12", "OFF", "OFF", // Days 1-6
      "N12", "N12", "M12", "M12", "OFF", "OFF", // Days 7-12
      "OND", "A12", "A12", "N12", "OFF", "OFF", // Days 13-18 (Day 13 is OND)
      "M8",  "M8",  "D",   "D",   "OFF", "OFF", // Days 19-24 (Regular 8h days)
      "M16", "N16", "M24", "OFF", "OFF", "M12", "A12" // Days 25-31
    ];

    expect(monthShifts.length).toBe(31);

    const emp = createTestEmployee({ shifts: monthShifts });
    const result = calculateEmployeeMonthlyOt(emp, monthShifts, 2026, 8);

    // Hourly rate = 36,000 / 240 = 150 THB/hr
    expect(result.hourlyRate).toBe(150);

    // Verify all calculation fields exist and are positive
    expect(result.totalOtHours).toBeGreaterThan(0);
    expect(result.totalOtPay).toBeGreaterThan(0);
    expect(result.normalOt).toBeGreaterThan(0);
    expect(result.holidayOt).toBeGreaterThan(0);
    expect(result.holidayWorkDays).toBeGreaterThan(0);

    // Verify algebraic integrity: totalOtPay == (normalOt * 1.5 + holidayOt * 3.0 + holidayWorkDays * 8 * 1.0) * hourlyRate
    const expectedPay = (result.normalOt * 1.5 + result.holidayOt * 3.0 + result.holidayWorkDays * 8 * 1.0) * result.hourlyRate;
    expect(result.totalOtPay).toBe(Math.round(expectedPay));
  });

  // Scenario 2: Weekly Overtime Safety Limit (36-Hour OT Limit)
  it('T4.LL.2: Audits weekly overtime safety limit and detects excessive OT', () => {
    // Excessive schedule: 5 consecutive days of M16 (8h OT each = 40h OT in 5 days, exceeding 36h)
    const heavyOtShifts = [
      "M16", "M16", "M16", "M16", "M16", "OFF", "OFF",
      ...Array(24).fill("OFF")
    ];

    let totalWeekOt = 0;
    for (let i = 0; i < 7; i++) {
      totalWeekOt += getShiftOtHours(heavyOtShifts[i]);
    }

    expect(totalWeekOt).toBe(40); // 40h OT in 1 week > 36h limit

    const violations = auditEmployeeShiftsCompliance(heavyOtShifts, "2026-08");
    expect(violations.length).toBeGreaterThan(0);
  });

  // Scenario 3: 6-Day Consecutive Workday Fatigue Limit
  it('T4.LL.3: Audits 6-consecutive-day fatigue threshold and flags violation', () => {
    // Schedule with 7 consecutive work days without an OFF day
    const fatigueShifts = [
      "M8", "M8", "M8", "M8", "M8", "M8", "M8", // 7 consecutive days
      ...Array(24).fill("OFF")
    ];

    const violations = auditEmployeeShiftsCompliance(fatigueShifts, "2026-08");
    const hasFatigueAlert = violations.some(v => 
      v.message.includes("ติดต่อ") || v.message.includes("พักผ่อน") || v.type === "consecutive_days"
    );
    expect(hasFatigueAlert).toBe(true);
  });

  // Scenario 4: Dynamic Cross-Day Shift Transition Invariants
  it('T4.LL.4: Dynamic shift transitions calculate accurately across full 24-hour cycle', () => {
    const shiftCases = [
      { sH: 6, sM: 0, eH: 14, eM: 0, expectedCode: "M8", expectedOt: 0 },
      { sH: 7, sM: 0, eH: 19, eM: 0, expectedCode: "M12", expectedOt: 4 },
      { sH: 12, sM: 0, eH: 20, eM: 0, expectedCode: "A8", expectedOt: 0 },
      { sH: 15, sM: 0, eH: 3, eM: 0, expectedCode: "A12", expectedOt: 4 },
      { sH: 19, sM: 0, eH: 7, eM: 0, expectedCode: "N12", expectedOt: 4 },
      { sH: 20, sM: 0, eH: 8, eM: 0, expectedCode: "N12", expectedOt: 4 },
      { sH: 8, sM: 0, eH: 8, eM: 0, expectedCode: "M24", expectedOt: 16 },
    ];

    shiftCases.forEach(({ sH, sM, eH, eM, expectedCode, expectedOt }) => {
      const computed = computeDynamicShift(sH, sM, eH, eM);
      expect(computed.code).toBe(expectedCode);
      expect(computed.otHours).toBe(expectedOt);
    });
  });
});
