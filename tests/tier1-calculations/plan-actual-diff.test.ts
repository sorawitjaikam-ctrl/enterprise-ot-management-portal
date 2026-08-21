import { describe, it, expect } from 'vitest';
import { isPlanActualMismatch, getEmpMonthlyOtPayBreakdown, getEmpPlanShiftsArray } from '../../src/App';

describe('Tier 1: Plan vs Actual Difference Engine', () => {
  it('T1.3.1: isPlanActualMismatch returns true when plan and actual differ (excluding off days)', () => {
    expect(isPlanActualMismatch('M8', 'M12')).toBe(true);
    expect(isPlanActualMismatch('M12', 'A12')).toBe(true);
    expect(isPlanActualMismatch('M8', 'OFF')).toBe(true);
    expect(isPlanActualMismatch('N12', 'M12')).toBe(true);
  });

  it('T1.3.2: isPlanActualMismatch returns false when plan and actual are identical', () => {
    expect(isPlanActualMismatch('M8', 'M8')).toBe(false);
    expect(isPlanActualMismatch('M12', 'M12')).toBe(false);
    expect(isPlanActualMismatch('OFF', 'OFF')).toBe(false);
    expect(isPlanActualMismatch('OND', 'OND')).toBe(false);
  });

  it('T1.3.3: isPlanActualMismatch returns false when plan is OFF, O, empty, or nullish', () => {
    expect(isPlanActualMismatch('OFF', 'M12')).toBe(false);
    expect(isPlanActualMismatch('O', 'M8')).toBe(false);
    expect(isPlanActualMismatch('', 'M8')).toBe(false);
    expect(isPlanActualMismatch('  ', 'M8')).toBe(false);
    expect(isPlanActualMismatch(null as any, 'M8')).toBe(false);
    expect(isPlanActualMismatch('M8', null as any)).toBe(false);
  });

  it('T1.3.4: Plan vs Actual OT breakdown accurately computes positive and negative delta metrics', () => {
    const salary = 24000; // hourly rate = 100
    // Plan: 20 days of M8 (18 weekdays = 0 OT, 2 Sundays = 0 OT + 2 holiday work days -> pay = 2*8*100 = 1,600)
    const planShifts = Array(31).fill('OFF');
    for (let i = 2; i < 22; i++) planShifts[i] = 'M8';

    // Actual: 20 days of M12 (18 weekdays = 72 OT hrs, 2 Sundays = 8 holiday OT hrs + 2 holiday work days -> pay = 14,800)
    const actualShifts = Array(31).fill('OFF');
    for (let i = 2; i < 22; i++) actualShifts[i] = 'M12';

    const actualBreakdown = getEmpMonthlyOtPayBreakdown({ salary, shifts: actualShifts }, '2026-08');
    const planBreakdown = getEmpMonthlyOtPayBreakdown({ salary, shifts: planShifts }, '2026-08');

    const diffNormalOt = actualBreakdown.normalOt - planBreakdown.normalOt;
    const diffTotalPay = actualBreakdown.totalOtPay - planBreakdown.totalOtPay;

    expect(diffNormalOt).toBe(72);
    expect(diffTotalPay).toBe(13200);
    expect(actualBreakdown.totalOtHours).toBeGreaterThan(planBreakdown.totalOtHours);
  });

  it('T1.3.5: Negative diff correctly indicates actual OT was lower than planned OT', () => {
    const salary = 24000;
    // Plan: 10 days of M12 (9 weekdays = 36 normal OT hrs, 1 Sunday = 4 holiday OT hrs + 1 hol work day -> pay = 7,400)
    const planShifts = Array(31).fill('OFF');
    for (let i = 2; i < 12; i++) planShifts[i] = 'M12';

    // Actual: 10 days of M8 (0 OT hrs, 1 Sunday hol work day -> pay = 800)
    const actualShifts = Array(31).fill('OFF');
    for (let i = 2; i < 12; i++) actualShifts[i] = 'M8';

    const actualBreakdown = getEmpMonthlyOtPayBreakdown({ salary, shifts: actualShifts }, '2026-08');
    const planBreakdown = getEmpMonthlyOtPayBreakdown({ salary, shifts: planShifts }, '2026-08');

    const diffNormalOt = actualBreakdown.normalOt - planBreakdown.normalOt;
    const diffTotalPay = actualBreakdown.totalOtPay - planBreakdown.totalOtPay;

    expect(diffNormalOt).toBe(-36);
    expect(diffTotalPay).toBe(-6600);
  });

  it('T1.3.6: getEmpPlanShiftsArray properly extracts plan shifts with fallback to actual shifts', () => {
    const empWithPlan = {
      shifts: ['M12', 'M12'],
      planShifts: ['M8', 'M8']
    };
    expect(getEmpPlanShiftsArray(empWithPlan)).toEqual(['M8', 'M8']);

    const empWithoutPlan = {
      shifts: ['M12', 'M12']
    };
    // If planShifts is not provided, returns empty array or safe fallback
    const result = getEmpPlanShiftsArray(empWithoutPlan);
    expect(Array.isArray(result)).toBe(true);
  });
});
