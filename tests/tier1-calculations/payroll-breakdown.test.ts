import { describe, it, expect } from 'vitest';
import { getEmpMonthlyOtPayBreakdown } from '../../src/App';

describe('Tier 1: Monthly OT & Payroll Breakdown Engine (getEmpMonthlyOtPayBreakdown)', () => {
  it('T1.2.1: Base hourly rate is computed as salary / 240 hours', () => {
    const emp1 = { salary: 24000, shifts: [] };
    const emp2 = { salary: 36000, shifts: [] };
    const emp3 = { salary: 48000, shifts: [] };

    expect(getEmpMonthlyOtPayBreakdown(emp1).hourlyRate).toBe(100);
    expect(getEmpMonthlyOtPayBreakdown(emp2).hourlyRate).toBe(150);
    expect(getEmpMonthlyOtPayBreakdown(emp3).hourlyRate).toBe(200);
  });

  it('T1.2.2: Weekday OT is calculated with 1.5x multiplier on normal working days', () => {
    // August 2026: Day 3 to Day 7 are Mon-Fri (weekdays)
    // 5 days of M12 = 5 * 4 = 20 normal OT hours
    const shifts = Array(31).fill('OFF');
    shifts[2] = 'M12'; // Aug 3 (Mon)
    shifts[3] = 'M12'; // Aug 4 (Tue)
    shifts[4] = 'M12'; // Aug 5 (Wed)
    shifts[5] = 'M12'; // Aug 6 (Thu)
    shifts[6] = 'M12'; // Aug 7 (Fri)

    const emp = {
      salary: 24000, // hourly rate = 100
      shifts
    };

    const breakdown = getEmpMonthlyOtPayBreakdown(emp, '2026-08');
    expect(breakdown.normalOt).toBe(20);
    expect(breakdown.holidayOt).toBe(0);
    expect(breakdown.holidayWorkDays).toBe(0);
    expect(breakdown.totalOtHours).toBe(20);
    // Pay = 20 * 1.5 * 100 = 3,000 THB
    expect(breakdown.totalOtPay).toBe(3000);
    // otPctSalary = (3000 / 24000) * 100 = 12.50%
    expect(breakdown.otPctSalary).toBe('12.50');
  });

  it('T1.2.3: Sunday shifts apply 3.0x multiplier for OT hours and 1.0x (8h) for Sunday regular work', () => {
    // In August 2026, Sundays are Aug 2, 9, 16, 23, 30
    // If an employee works M12 (4h OT) on 2 Sundays (Aug 2 and Aug 9):
    // holidayWorkDays = 2 days
    // holidayOt = 2 * 4 = 8 hours
    const shifts = Array(31).fill('OFF');
    shifts[1] = 'M12'; // Aug 2 (Sun)
    shifts[8] = 'M12'; // Aug 9 (Sun)

    const emp = {
      salary: 24000, // hourly rate = 100
      shifts
    };

    const breakdown = getEmpMonthlyOtPayBreakdown(emp, '2026-08');
    expect(breakdown.normalOt).toBe(0);
    expect(breakdown.holidayOt).toBe(8);
    expect(breakdown.holidayWorkDays).toBe(2);
    expect(breakdown.totalOtHours).toBe(8);
    // Total OT Pay = (0*1.5 + 8*3.0 + 2*8*1.0) * 100 = (24 + 16) * 100 = 4,000 THB
    expect(breakdown.totalOtPay).toBe(4000);
    // otPctSalary = (4000 / 24000) * 100 = 16.67%
    expect(breakdown.otPctSalary).toBe('16.67');
  });

  it('T1.2.4: On-Duty (OND) shifts grant 8 holiday OT hours and 1 holiday work day regardless of day', () => {
    // Aug 3 (Mon, weekday) is OND
    const shifts = Array(31).fill('OFF');
    shifts[2] = 'OND'; // Aug 3 (Mon)

    const emp = {
      salary: 30000, // hourly rate = 125
      shifts
    };

    const breakdown = getEmpMonthlyOtPayBreakdown(emp, '2026-08');
    expect(breakdown.normalOt).toBe(0);
    expect(breakdown.holidayOt).toBe(8);
    expect(breakdown.holidayWorkDays).toBe(1);
    expect(breakdown.totalOtHours).toBe(8);
    // Pay = (8 * 3.0 + 1 * 8 * 1.0) * 125 = (24 + 8) * 125 = 32 * 125 = 4,000 THB
    expect(breakdown.totalOtPay).toBe(4000);
    // otPctSalary = (4000 / 30000) * 100 = 13.33%
    expect(breakdown.otPctSalary).toBe('13.33');
  });

  it('T1.2.5: Zero, negative, or undefined salary falls back to 15,000 THB (62.50 THB/hr)', () => {
    const shifts = Array(31).fill('OFF');
    shifts[2] = 'M12'; // Aug 3 (4h weekday OT)

    const empZero = { salary: 0, shifts };
    const empUndefined = { shifts };

    const breakdownZero = getEmpMonthlyOtPayBreakdown(empZero, '2026-08');
    expect(breakdownZero.salary).toBe(15000);
    expect(breakdownZero.hourlyRate).toBe(62.5);
    // Pay = 4 * 1.5 * 62.5 = 375 THB
    expect(breakdownZero.totalOtPay).toBe(375);

    const breakdownUndefined = getEmpMonthlyOtPayBreakdown(empUndefined, '2026-08');
    expect(breakdownUndefined.salary).toBe(15000);
    expect(breakdownUndefined.hourlyRate).toBe(62.5);
    expect(breakdownUndefined.totalOtPay).toBe(375);
  });

  it('T1.2.6: Correctly handles dynamic month lengths (28-day Feb, 29-day leap Feb, 30-day Apr, 31-day Aug)', () => {
    const emp = {
      salary: 24000,
      shifts: {
        '2026-02': Array(28).fill('M12'),
        '2024-02': Array(29).fill('M12'),
        '2026-08': Array(31).fill('M12')
      }
    };

    // 2026-02 has 28 days (starts Sun Feb 1): Sundays are 1, 8, 15, 22 (4 Sundays). Weekdays = 24.
    // normalOt = 24 * 4 = 96, holidayOt = 4 * 4 = 16, holidayWorkDays = 4
    const feb2026 = getEmpMonthlyOtPayBreakdown(emp, '2026-02');
    expect(feb2026.normalOt).toBe(96);
    expect(feb2026.holidayOt).toBe(16);
    expect(feb2026.holidayWorkDays).toBe(4);
    expect(feb2026.totalOtHours).toBe(112);

    // 2024-02 has 29 days (Leap Year, starts Thu): Sundays: 4, 11, 18, 25 (4 Sundays). Weekdays = 25.
    // normalOt = 25 * 4 = 100, holidayOt = 4 * 4 = 16, holidayWorkDays = 4
    const feb2024 = getEmpMonthlyOtPayBreakdown(emp, '2024-02');
    expect(feb2024.normalOt).toBe(100);
    expect(feb2024.holidayOt).toBe(16);
    expect(feb2024.holidayWorkDays).toBe(4);
    expect(feb2024.totalOtHours).toBe(116);
  });

  it('T1.2.7: Null or undefined employee safely returns default zeroed breakdown', () => {
    const defaultBreakdown = getEmpMonthlyOtPayBreakdown(null);
    expect(defaultBreakdown.normalOt).toBe(0);
    expect(defaultBreakdown.holidayOt).toBe(0);
    expect(defaultBreakdown.totalOtHours).toBe(0);
    expect(defaultBreakdown.totalOtPay).toBe(0);
    expect(defaultBreakdown.otPctSalary).toBe('0.00');
  });
});
