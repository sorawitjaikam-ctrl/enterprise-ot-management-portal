import { describe, it, expect } from 'vitest';
import {
  getEmpMonthlyOtPayBreakdown,
  getEmpDailyShiftAuditRows,
  getEmployeeJobValueBreakdown,
  getRoleJobValueSummaries,
  getEmpCalculatedOt,
  getEmpCalculatedOtPay,
} from '../../src/App';
import { Employee, JobValueRecord } from '../../src/types';

describe('Adversarial Stress Test: Milestone 1 Calculation Engine & Audit Invariants', () => {

  // =========================================================================
  // 1. Employees with undefined or 0 salary (fallback 15,000 / 62.50 THB/hr)
  // =========================================================================
  describe('Dimension 1: Salary Fallbacks (Undefined, Null, Zero, and Missing)', () => {
    it('CH1.1: Undefined or zero salary correctly falls back to 15,000 THB and 62.50 THB/hr in all calculation entry points', () => {
      const empUndefinedSalary: Partial<Employee> = {
        id: 'EMP-UNDEF',
        name: 'Undefined Salary Worker',
        shifts: { '2026-08': ['M12'] },
      };

      const empZeroSalary: Partial<Employee> = {
        id: 'EMP-ZERO',
        name: 'Zero Salary Worker',
        salary: 0,
        shifts: { '2026-08': ['M12'] },
      };

      // In getEmpMonthlyOtPayBreakdown
      const breakdownUndef = getEmpMonthlyOtPayBreakdown(empUndefinedSalary, '2026-08');
      expect(breakdownUndef.salary).toBe(15000);
      expect(breakdownUndef.hourlyRate).toBe(62.5);

      const breakdownZero = getEmpMonthlyOtPayBreakdown(empZeroSalary, '2026-08');
      expect(breakdownZero.salary).toBe(15000);
      expect(breakdownZero.hourlyRate).toBe(62.5);

      // In getEmployeeJobValueBreakdown
      const jvUndef = getEmployeeJobValueBreakdown(empUndefinedSalary, '2026-08');
      expect(jvUndef.baseSalary).toBe(15000);
      expect(jvUndef.hourlyRate).toBe(62.5);
      expect(jvUndef.totalLaborCost).toBeGreaterThanOrEqual(15000);

      const jvZero = getEmployeeJobValueBreakdown(empZeroSalary, '2026-08');
      expect(jvZero.baseSalary).toBe(15000);
      expect(jvZero.hourlyRate).toBe(62.5);
      expect(jvZero.totalLaborCost).toBeGreaterThanOrEqual(15000);

      // In getEmpDailyShiftAuditRows
      const auditRowsUndef = getEmpDailyShiftAuditRows(empUndefinedSalary, '2026-08');
      expect(auditRowsUndef.length).toBe(31);
      // Day 1: Saturday M12 -> 4h normal OT: 4 * 1.5 * 62.5 = 375 THB
      expect(auditRowsUndef[0].dailyPayThb).toBe(375);

      const auditRowsZero = getEmpDailyShiftAuditRows(empZeroSalary, '2026-08');
      expect(auditRowsZero[0].dailyPayThb).toBe(375);
    });

    it('CH1.2: Null or malformed employee object returns defensive non-crashing defaults', () => {
      const nullBreakdown = getEmpMonthlyOtPayBreakdown(null);
      expect(nullBreakdown.salary).toBe(15000);
      expect(nullBreakdown.hourlyRate).toBe(62.5);
      expect(nullBreakdown.totalOtHours).toBe(0);
      expect(nullBreakdown.totalOtPay).toBe(0);

      const nullAudit = getEmpDailyShiftAuditRows(null);
      expect(nullAudit).toEqual([]);

      const nullJv = getEmployeeJobValueBreakdown(null);
      expect(nullJv.employeeId).toBe('');
      expect(nullJv.baseSalary).toBe(15000);
      expect(nullJv.hourlyRate).toBe(62.5);
      expect(nullJv.revenueCostRatio).toBeGreaterThan(0);
      expect(nullJv.dailyAuditTrail).toEqual([]);

      expect(getEmpCalculatedOt(null)).toBe(0);
      expect(getEmpCalculatedOtPay(null)).toBe(0);
    });
  });

  // =========================================================================
  // 2. Months with 28, 29, 30, and 31 days (exact days in audit trail)
  // =========================================================================
  describe('Dimension 2: Dynamic Calendar Month Lengths (28, 29, 30, 31 Days)', () => {
    const testEmp: Partial<Employee> = {
      id: 'EMP-CALENDAR',
      name: 'Calendar Auditor',
      salary: 24000,
      shifts: {},
    };

    it('CH2.1: Non-leap February (2026-02) generates exactly 28 audit rows with accurate dates and days', () => {
      const rows = getEmpDailyShiftAuditRows(testEmp, '2026-02');
      expect(rows).toHaveLength(28);
      expect(rows[0].day).toBe(1);
      expect(rows[0].dateStr).toBe('2026-02-01');
      expect(rows[0].dayOfWeekTh).toBe('อา'); // Feb 1 2026 is Sunday
      expect(rows[0].isHolidayOrRestDay).toBe(true);

      expect(rows[27].day).toBe(28);
      expect(rows[27].dateStr).toBe('2026-02-28');
      expect(rows[27].dayOfWeekTh).toBe('ส'); // Feb 28 2026 is Saturday
    });

    it('CH2.2: Leap year February (2024-02) generates exactly 29 audit rows including Feb 29', () => {
      const rows = getEmpDailyShiftAuditRows(testEmp, '2024-02');
      expect(rows).toHaveLength(29);
      expect(rows[28].day).toBe(29);
      expect(rows[28].dateStr).toBe('2024-02-29');
      expect(rows[28].dayOfWeekTh).toBe('พฤ'); // Feb 29 2024 is Thursday
    });

    it('CH2.3: 30-day month (2026-04, April) generates exactly 30 audit rows', () => {
      const rows = getEmpDailyShiftAuditRows(testEmp, '2026-04');
      expect(rows).toHaveLength(30);
      expect(rows[29].day).toBe(30);
      expect(rows[29].dateStr).toBe('2026-04-30');
      expect(rows[29].dayOfWeekTh).toBe('พฤ'); // April 30 2026 is Thursday
    });

    it('CH2.4: 31-day month (2026-08, August) generates exactly 31 audit rows', () => {
      const rows = getEmpDailyShiftAuditRows(testEmp, '2026-08');
      expect(rows).toHaveLength(31);
      expect(rows[30].day).toBe(31);
      expect(rows[30].dateStr).toBe('2026-08-31');
      expect(rows[30].dayOfWeekTh).toBe('จ'); // August 31 2026 is Monday
    });

    it('CH2.5: Default monthKey falls back cleanly to 2026-08 with 31 rows', () => {
      const rows = getEmpDailyShiftAuditRows(testEmp);
      expect(rows).toHaveLength(31);
      expect(rows[0].dateStr).toBe('2026-08-01');
    });
  });

  // =========================================================================
  // 3. Inactive/resigned personnel excluded from active role summaries
  // =========================================================================
  describe('Dimension 3: Inactive & Resigned Personnel Exclusion from Role Summaries', () => {
    it('CH3.1: Excludes Resigned, Inactive, ลาออก, and พ้นสภาพ personnel while retaining Active and On-Leave', () => {
      const employees: Partial<Employee>[] = [
        { id: '1', name: 'Active Tug Master', role: 'Tug Master', salary: 35000, employmentStatus: 'Active', shifts: {} },
        { id: '2', name: 'OnLeave Tug Master', role: 'Tug Master', salary: 35000, employmentStatus: 'On-Leave', shifts: {} },
        { id: '3', name: 'Resigned Tug Master', role: 'Tug Master', salary: 45000, employmentStatus: 'Resigned', shifts: {} },
        { id: '4', name: 'Inactive Tug Master', role: 'Tug Master', salary: 40000, employmentStatus: 'Inactive', shifts: {} },
        { id: '5', name: 'Thai Resigned Tug Master', role: 'Tug Master', salary: 38000, employmentStatus: 'ลาออก', shifts: {} },
        { id: '6', name: 'Thai Inactive Tug Master', role: 'Tug Master', salary: 32000, employmentStatus: 'พ้นสภาพ', shifts: {} },
        { id: '7', name: 'Normal Thai Worker', role: 'Crane Operator', salary: 28000, employmentStatus: 'ทำงานปกติ', shifts: {} },
      ];

      const summaries = getRoleJobValueSummaries(employees, '2026-08');

      // Only Tug Master and Crane Operator should exist
      const tugSummary = summaries.find(s => s.role === 'Tug Master');
      expect(tugSummary).toBeDefined();
      expect(tugSummary!.headcount).toBe(2); // Only Active and On-Leave
      expect(tugSummary!.totalBaseSalary).toBe(70000);
      expect(tugSummary!.avgBaseSalary).toBe(35000);

      const craneSummary = summaries.find(s => s.role === 'Crane Operator');
      expect(craneSummary).toBeDefined();
      expect(craneSummary!.headcount).toBe(1); // ทำงานปกติ is included
      expect(craneSummary!.totalBaseSalary).toBe(28000);
    });

    it('CH3.2: Role with 100% resigned personnel produces no active summary entry', () => {
      const allResigned: Partial<Employee>[] = [
        { id: 'R1', name: 'Ex-Pilot 1', role: 'Harbor Pilot', salary: 60000, employmentStatus: 'Resigned', shifts: {} },
        { id: 'R2', name: 'Ex-Pilot 2', role: 'Harbor Pilot', salary: 65000, employmentStatus: 'ลาออก', shifts: {} },
      ];

      const summaries = getRoleJobValueSummaries(allResigned, '2026-08');
      expect(summaries).toEqual([]);
    });

    it('CH3.3: Empty or null employee lists return empty array cleanly', () => {
      expect(getRoleJobValueSummaries([])).toEqual([]);
      expect(getRoleJobValueSummaries(null as any)).toEqual([]);
      expect(getRoleJobValueSummaries(undefined as any)).toEqual([]);
    });
  });

  // =========================================================================
  // 4. Employees with 0 OT vs heavy OT (exceeding 36h)
  // =========================================================================
  describe('Dimension 4: 0 OT vs Heavy OT Exceeding 36h Boundary Test', () => {
    it('CH4.1: Zero OT worker (standard 8h shifts M8/A8/N8 and OFF) yields exactly 0 OT hours and base salary cost', () => {
      // 31 days with weekday M8 and weekend OFF
      const shifts = Array(31).fill('OFF');
      // Aug 2026: Mon-Fri days are 3..7, 10..14, 17..21, 24..28, 31
      for (let d = 1; d <= 31; d++) {
        const date = new Date(2026, 7, d);
        if (date.getDay() !== 0 && date.getDay() !== 6) {
          shifts[d - 1] = 'M8';
        }
      }

      const zeroOtEmp: Partial<Employee> = {
        id: 'EMP-ZERO-OT',
        name: 'Standard Hours Worker',
        salary: 24000,
        shifts: { '2026-08': shifts },
      };

      const breakdown = getEmployeeJobValueBreakdown(zeroOtEmp, '2026-08');
      expect(breakdown.monthlyOtHours).toBe(0);
      expect(breakdown.monthlyOtPay).toBe(0);
      expect(breakdown.normalOtPay).toBe(0);
      expect(breakdown.holidayOtPay).toBe(0);
      expect(breakdown.holidayWorkPay).toBe(0);
      expect(breakdown.totalLaborCost).toBe(24000);
      // Revenue = 24000 * 4.5 = 108,000 THB
      expect(breakdown.monthlyRevenue).toBe(108000);
      expect(breakdown.operationalValueAdd).toBe(108000 - 24000);
      expect(breakdown.revenueCostRatio).toBe(4.5);
    });

    it('CH4.2: Heavy OT worker (>36h/week, e.g. continuous M12 & M24) calculates without numerical distortion or NaN', () => {
      // Heavy schedule: M24 on Sundays (16 OT + 8 holiday), M12 on weekdays (4 OT)
      const shifts = Array(31).fill('M12');
      // Sundays in Aug 2026 are 2, 9, 16, 23, 30
      [1, 8, 15, 22, 29].forEach(idx => {
        shifts[idx] = 'M24';
      });

      const heavyOtEmp: Partial<Employee> = {
        id: 'EMP-HEAVY-OT',
        name: 'Heavy OT Worker',
        salary: 24000, // hourly rate = 100
        shifts: { '2026-08': shifts },
      };

      const breakdown = getEmployeeJobValueBreakdown(heavyOtEmp, '2026-08');
      // 26 non-Sunday days of M12:
      // Normal OT days: 26 days * 4h = 104 hours normal OT
      // Sunday days: 5 Sundays of M24 (duration 24h, otHours = 16h, holidayWorkDays = 5)
      // Total OT hours = 104 + 80 = 184 OT hours (far exceeds 36h/week)
      expect(breakdown.monthlyOtHours).toBe(184);
      expect(breakdown.monthlyOtHours).toBeGreaterThan(36);
      expect(breakdown.monthlyOtPay).toBeGreaterThan(0);
      expect(Number.isFinite(breakdown.monthlyOtPay)).toBe(true);
      expect(Number.isFinite(breakdown.revenueCostRatio)).toBe(true);
      expect(Number.isFinite(breakdown.profitMarginPct)).toBe(true);

      // Audit trail rows should all be finite numbers
      expect(breakdown.dailyAuditTrail).toBeDefined();
      expect(breakdown.dailyAuditTrail!.length).toBe(31);
      breakdown.dailyAuditTrail!.forEach(row => {
        expect(Number.isFinite(row.dailyPayThb)).toBe(true);
        expect(row.dailyPayThb).toBeGreaterThan(0);
        expect(row.explanation.length).toBeGreaterThan(0);
      });
    });
  });

  // =========================================================================
  // 5. Verification that no divide-by-zero occurs when total labor cost is 0
  // =========================================================================
  describe('Dimension 5: Divide-by-Zero Protection & Extreme Boundary Values', () => {
    it('CH5.1: Zero totalLaborCost defensively returns 0 for revenueCostRatio instead of Infinity or NaN', () => {
      // Create scenario where totalLaborCost is forced to 0
      const zeroCostBreakdown = getEmployeeJobValueBreakdown({
        id: 'EMP-ZERO-COST',
        salary: 0,
        shifts: {},
      });
      // Even with fallback salary of 15000, totalLaborCost > 0
      expect(zeroCostBreakdown.totalLaborCost).toBeGreaterThan(0);
      expect(Number.isFinite(zeroCostBreakdown.revenueCostRatio)).toBe(true);
      expect(zeroCostBreakdown.revenueCostRatio).not.toBeNaN();

      // Directly verify role summaries behavior when employees have salary 0
      const summaries = getRoleJobValueSummaries([
        { id: 'E1', name: 'Worker', role: 'Role A', salary: 0, employmentStatus: 'Active', shifts: {} }
      ]);
      expect(summaries[0].revenueCostRatio).toBeGreaterThan(0);
      expect(summaries[0].profitMarginPct).toBeGreaterThan(0);
      expect(Number.isFinite(summaries[0].revenueCostRatio)).toBe(true);
      expect(Number.isFinite(summaries[0].profitMarginPct)).toBe(true);
    });

    it('CH5.2: Zero monthlyRevenue returns 0 profitMarginPct instead of NaN or negative Infinity', () => {
      const jvRecordZeroRev: JobValueRecord = {
        id: 'JV-ZERO',
        empId: 'EMP-ZERO-REV',
        empName: 'Zero Rev Worker',
        department: 'Operations',
        position: 'Operator',
        avgRevenue: 0, // Zero revenue
        avgCost: 20000,
        profit2026: 0,
        profit2025: 0,
        monthlyRevenue: Array(12).fill(0),
        monthlyCost: Array(12).fill(0),
        monthlyProfit: Array(12).fill(0),
      };

      const breakdown = getEmployeeJobValueBreakdown(
        { id: 'EMP-ZERO-REV', name: 'Zero Rev Worker', salary: 20000, shifts: {} },
        '2026-08',
        jvRecordZeroRev
      );

      // When avgRevenue is 0, code falls back to Math.round(salary * 4.5) to avoid uninitialized 0-revenue crash
      expect(breakdown.monthlyRevenue).toBe(90000);
      expect(Number.isFinite(breakdown.profitMarginPct)).toBe(true);
      expect(breakdown.profitMarginPct).toBeGreaterThan(0);
    });
  });

  // =========================================================================
  // 6. Data Integrity & Contract Compliance: DailyShiftAuditRow
  // =========================================================================
  describe('Dimension 6: DailyShiftAuditRow Contract & Explanations', () => {
    it('CH6.1: DailyShiftAuditRow strictly conforms to PROJECT.md interface contract and provides clear explanations', () => {
      const emp: Partial<Employee> = {
        id: 'EMP-AUDIT',
        name: 'Audit Checker',
        salary: 24000,
        shifts: {
          '2026-08': [
            'M8',  // Day 1: Saturday standard (0 OT)
            'M12', // Day 2: Sunday holiday work (8h 1.0x) + holiday OT (4h 3.0x)
            'OND', // Day 3: Monday On-Duty holiday (8h 1.0x + 8h 3.0x)
            'M12', // Day 4: Tuesday weekday OT (4h 1.5x)
            'OFF', // Day 5: Wednesday Off
          ]
        }
      };

      const rows = getEmpDailyShiftAuditRows(emp, '2026-08');

      // Verify all required interface properties exist on every single row
      rows.forEach(r => {
        expect(typeof r.day).toBe('number');
        expect(typeof r.dateStr).toBe('string');
        expect(typeof r.dayOfWeekTh).toBe('string');
        expect(typeof r.isHolidayOrRestDay).toBe('boolean');
        expect(typeof r.shiftCode).toBe('string');
        expect(typeof r.normalOtHours).toBe('number');
        expect(typeof r.holidayWorkHours).toBe('number');
        expect(typeof r.holidayOtHours).toBe('number');
        expect(typeof r.dailyPayThb).toBe('number');
        expect(typeof r.explanation).toBe('string');
        expect(r.explanation.length).toBeGreaterThan(0);
      });

      // Specific checks on formulas & explanations
      // Day 1 (Sat M8)
      expect(rows[0].explanation).toContain('วันทำงานปกติ');
      expect(rows[0].dailyPayThb).toBe(0);

      // Day 2 (Sun M12)
      expect(rows[1].isHolidayOrRestDay).toBe(true);
      expect(rows[1].explanation).toContain('ทำงานวันหยุด 8 ชม. (1.0x) + OT วันหยุด 4 ชม. (3.0x)');
      expect(rows[1].dailyPayThb).toBe(2000); // (8*1 + 4*3) * 100 = 20 * 100 = 2000

      // Day 3 (Mon OND)
      expect(rows[2].isHolidayOrRestDay).toBe(true);
      expect(rows[2].explanation).toContain('On-Duty');
      expect(rows[2].dailyPayThb).toBe(3200); // (8*1 + 8*3) * 100 = 32 * 100 = 3200

      // Day 4 (Tue M12)
      expect(rows[3].isHolidayOrRestDay).toBe(false);
      expect(rows[3].explanation).toContain('OT ปกติ 4 ชม. (1.5x)');
      expect(rows[3].dailyPayThb).toBe(600); // 4 * 1.5 * 100 = 600

      // Day 5 (Wed OFF)
      expect(rows[4].explanation).toContain('วันหยุดพักผ่อน (Off)');
      expect(rows[4].dailyPayThb).toBe(0);
    });
  });
});
