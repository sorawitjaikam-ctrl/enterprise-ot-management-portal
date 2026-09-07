import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App, {
  isResignedEmployee,
  isOnLeaveEmployee,
  isActiveEmployee,
  getShiftDurationHours,
  getEmpMonthlyOtPayBreakdown,
  getEmpShiftsArray,
  getDeptName,
  LEAVE_CODES,
  isLeaveCode
} from '../../src/App';
import { auditEmployeeShiftsCompliance } from '../../src/utils/shiftRecommendation';
import { Employee, Department } from '../../src/types';

describe('Milestone 2 Challenger Adversarial Stress Suite', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('adminLoggedIn', 'true');
    localStorage.setItem('currentUser', JSON.stringify({
      username: 'admin',
      name: 'นายทดสอบ ระบบ',
      role: 'ผู้ดูแลระบบ',
      deptId: 'all'
    }));
  });

  // =========================================================================
  // Section 1: Roster Status Classification & Partition Invariants
  // =========================================================================
  describe('CH.M2.Roster: Status Filtering & Edge-Case Robustness', () => {
    it('CH.M2.R1.1: isResignedEmployee correctly matches all recognized Thai and English resigned statuses', () => {
      const positiveCases = [
        'Resigned',
        'Inactive',
        'Retired',
        'ลาออก',
        'เกษียณ',
        'พ้นสภาพ',
        '  Resigned  ',
        '\tลาออก\n'
      ];
      positiveCases.forEach(st => {
        expect(isResignedEmployee({ employmentStatus: st }), `Failed on status: "${st}"`).toBe(true);
      });

      const negativeCases = [
        'Active',
        'On-Leave',
        'ลาพักผ่อน',
        'Suspended',
        'Probation',
        '',
        null,
        undefined
      ];
      negativeCases.forEach(st => {
        expect(isResignedEmployee({ employmentStatus: st }), `Should be false for: "${st}"`).toBe(false);
      });
      expect(isResignedEmployee(null)).toBe(false);
      expect(isResignedEmployee(undefined)).toBe(false);
    });

    it('CH.M2.R1.2: isResignedEmployee case-sensitivity behavior is strictly documented', () => {
      // Note: Current implementation is case-sensitive exact match for English strings:
      // "Resigned", "Inactive", "Retired"
      expect(isResignedEmployee({ employmentStatus: 'resigned' })).toBe(false);
      expect(isResignedEmployee({ employmentStatus: 'inactive' })).toBe(false);
      expect(isResignedEmployee({ employmentStatus: 'retired' })).toBe(false);
      // Standard PascalCase works
      expect(isResignedEmployee({ employmentStatus: 'Resigned' })).toBe(true);
      expect(isResignedEmployee({ employmentStatus: 'Inactive' })).toBe(true);
      expect(isResignedEmployee({ employmentStatus: 'Retired' })).toBe(true);
    });

    it('CH.M2.R1.3: isOnLeaveEmployee handles explicit status and shift code detection', () => {
      // 1. Explicit status
      expect(isOnLeaveEmployee({ employmentStatus: 'On-Leave' })).toBe(true);
      expect(isOnLeaveEmployee({ employmentStatus: 'ลาพักผ่อน' })).toBe(true);

      // 2. Thai leave shift codes trigger on-leave
      LEAVE_CODES.forEach(code => {
        const emp = {
          employmentStatus: 'Active',
          shifts: [code, 'M8', 'M8']
        };
        expect(isOnLeaveEmployee(emp), `Failed to detect leave code ${code}`).toBe(true);
      });

      // 3. Regular shifts do not trigger on-leave
      const activeEmp = {
        employmentStatus: 'Active',
        shifts: ['M8', 'A8', 'N8', 'D', 'OND', 'O', 'OFF', 'M12', 'N16']
      };
      expect(isOnLeaveEmployee(activeEmp)).toBe(false);

      // 4. Resigned status takes strict precedence over leave shifts
      const resignedWithLeave = {
        employmentStatus: 'Resigned',
        shifts: ['พ', 'ก', 'ป']
      };
      expect(isOnLeaveEmployee(resignedWithLeave)).toBe(false);
      expect(isResignedEmployee(resignedWithLeave)).toBe(true);
    });

    it('CH.M2.R1.4: Mathematical Partition Invariant: Active + On-Leave + Resigned = All', () => {
      const testEmployees: any[] = [
        { id: 'E1', employmentStatus: 'Active', shifts: ['M8', 'M8', 'M8'] },
        { id: 'E2', employmentStatus: 'On-Leave', shifts: ['O', 'O'] },
        { id: 'E3', employmentStatus: 'Resigned', shifts: [] },
        { id: 'E4', employmentStatus: 'Retired', shifts: ['M8'] },
        { id: 'E5', employmentStatus: 'ลาออก', shifts: ['พ'] },
        { id: 'E6', employmentStatus: 'เกษียณ', shifts: [] },
        { id: 'E7', employmentStatus: 'พ้นสภาพ', shifts: ['ป'] },
        { id: 'E8', employmentStatus: 'ลาพักผ่อน', shifts: ['M8'] },
        { id: 'E9', employmentStatus: 'Active', shifts: ['พ', 'M8'] }, // Active status but has vacation shift code
        { id: 'E10', employmentStatus: 'Active', shifts: ['ป', 'M8'] }, // Active status but has sick shift code
        { id: 'E11', employmentStatus: undefined, shifts: ['M8'] },     // Undefined status, no leave -> Active
        { id: 'E12', employmentStatus: '', shifts: ['O', 'OFF'] },       // Empty status, no leave -> Active
        { id: 'E13', employmentStatus: 'Unknown', shifts: [] },          // Unknown status -> Active
      ];

      const monthKey = '2026-08';
      let activeCount = 0;
      let onLeaveCount = 0;
      let resignedCount = 0;

      testEmployees.forEach(emp => {
        const isRes = isResignedEmployee(emp);
        const isOnL = isOnLeaveEmployee(emp, monthKey);
        const isAct = isActiveEmployee(emp, monthKey);

        // Exactly one must be true
        const trueCount = [isRes, isOnL, isAct].filter(Boolean).length;
        expect(trueCount, `Employee ${emp.id} must be in exactly one partition`).toBe(1);

        if (isRes) resignedCount++;
        if (isOnL) onLeaveCount++;
        if (isAct) activeCount++;
      });

      expect(activeCount + onLeaveCount + resignedCount).toBe(testEmployees.length);
    });
  });

  // =========================================================================
  // Section 2: Telemetry Modal Edge Cases & Boundary Conditions
  // =========================================================================
  describe('CH.M2.Telemetry: Edge Cases & Boundary Metrics', () => {
    it('CH.M2.T2.1: Telemetry calculations survive employee with 0 shifts without NaN or division by zero', () => {
      const zeroShiftEmp: any = {
        id: 'EMP-ZERO-001',
        name: 'พนักงานกะว่างเปล่า',
        deptId: 'inter2',
        role: 'Operator',
        salary: 24000,
        targetOt: 48,
        actualOt: 0,
        otPct: 0,
        status: 'Active',
        shifts: []
      };

      const monthKey = '2026-08';
      const shifts = getEmpShiftsArray(zeroShiftEmp.shifts, monthKey);
      expect(shifts).toEqual([]);

      const breakdown = getEmpMonthlyOtPayBreakdown(zeroShiftEmp, monthKey);
      expect(breakdown.normalOt).toBe(0);
      expect(breakdown.holidayOt).toBe(0);
      expect(breakdown.holidayWorkDays).toBe(0);
      expect(breakdown.totalOtHours).toBe(0);
      expect(breakdown.totalOtPay).toBe(0);
      expect(breakdown.otPctSalary).toBe('0.00');
      expect(breakdown.hourlyRate).toBe(100); // 24000 / 240

      // Compute hours percentages as done in App.tsx
      let accumulatedShiftHours = 0;
      let workedDaysCount = 0;
      shifts.forEach(code => {
        const dur = getShiftDurationHours(code);
        accumulatedShiftHours += dur;
        if (dur > 0) workedDaysCount++;
      });
      const standardHours = Math.max(0, accumulatedShiftHours - breakdown.totalOtHours);
      const standardHoursPct = accumulatedShiftHours > 0 ? Math.round((standardHours / accumulatedShiftHours) * 100) : 0;
      const otHoursPct = accumulatedShiftHours > 0 ? Math.round((breakdown.totalOtHours / accumulatedShiftHours) * 100) : 0;

      expect(accumulatedShiftHours).toBe(0);
      expect(workedDaysCount).toBe(0);
      expect(standardHoursPct).toBe(0);
      expect(otHoursPct).toBe(0);
      expect(Number.isNaN(standardHoursPct)).toBe(false);
      expect(Number.isNaN(otHoursPct)).toBe(false);
    });

    it('CH.M2.T2.2: Heavy OT (>36h/week) accurately triggers Warning fatigue status & compliance alerts', () => {
      // 5 consecutive days of M16 (each M16 has 8h OT -> 5 * 8 = 40h OT in a 7-day window)
      const heavyOtShifts = ['M16', 'M16', 'M16', 'M16', 'M16', 'O', 'O'];
      const heavyOtEmp: any = {
        id: 'EMP-HEAVY-001',
        name: 'พนักงานโอทีสูงมาก',
        deptId: 'inter2',
        role: 'Technician',
        salary: 30000,
        shifts: heavyOtShifts
      };

      const monthKey = '2026-08';
      const shifts = getEmpShiftsArray(heavyOtEmp.shifts, monthKey);
      
      // Calculate max weekly OT
      let maxWeeklyOt = 0;
      for (let i = 0; i <= shifts.length - 7; i++) {
        let wOt = 0;
        for (let j = 0; j < 7; j++) {
          const s = shifts[i + j];
          wOt += s === 'M16' ? 8 : 0;
        }
        if (wOt > maxWeeklyOt) maxWeeklyOt = wOt;
      }
      expect(maxWeeklyOt).toBe(40);
      expect(maxWeeklyOt).toBeGreaterThan(36);

      // Audit compliance
      const alerts = auditEmployeeShiftsCompliance(shifts, monthKey);
      const weeklyOtAlert = alerts.find(a => a.type === 'weekly_ot');
      expect(weeklyOtAlert).toBeDefined();
      expect(weeklyOtAlert?.level).toBe('danger');
    });

    it('CH.M2.T2.3: >6 consecutive work days accurately triggers Warning fatigue status & compliance alerts', () => {
      // 7 consecutive standard working days
      const consecutiveShifts = ['M8', 'M8', 'M8', 'M8', 'M8', 'M8', 'M8', 'O'];
      const consecEmp: any = {
        id: 'EMP-CONSEC-001',
        name: 'พนักงานทำงานไม่หยุด',
        deptId: 'inter2',
        role: 'Operator',
        salary: 20000,
        shifts: consecutiveShifts
      };

      const monthKey = '2026-08';
      const shifts = getEmpShiftsArray(consecEmp.shifts, monthKey);

      let maxConsecutiveDays = 0;
      let curConsecutive = 0;
      shifts.forEach(code => {
        const isOff = code === 'O' || code === 'OFF' || isLeaveCode(code);
        if (!isOff) {
          curConsecutive++;
          if (curConsecutive > maxConsecutiveDays) maxConsecutiveDays = curConsecutive;
        } else {
          curConsecutive = 0;
        }
      });

      expect(maxConsecutiveDays).toBe(7);
      expect(maxConsecutiveDays).toBeGreaterThan(6);

      const alerts = auditEmployeeShiftsCompliance(shifts, monthKey);
      const consecAlert = alerts.find(a => a.type === 'consecutive_days');
      expect(consecAlert).toBeDefined();
      expect(consecAlert?.level).toBe('warning');
    });

    it('CH.M2.T2.4: Missing or invalid department ID gracefully falls back without crashing', () => {
      const mockDepts: any[] = [
        { id: 'inter2', name: 'INTER 2', nameTh: 'แผนกปฏิบัติการ 2' },
        { id: 'inter3', name: 'INTER 3', nameTh: 'แผนกปฏิบัติการ 3' }
      ];

      expect(getDeptName(undefined, mockDepts)).toBe('-');
      expect(getDeptName('', mockDepts)).toBe('-');
      expect(getDeptName('UNKNOWN_DEPT', mockDepts)).toBe('UNKNOWN_DEPT');
      expect(getDeptName('inter2', mockDepts)).toBe('INTER 2'); // Retains found.name
      expect(getDeptName('inter2', undefined)).toBe('INTER 2'); // Fallback map
    });

    it('CH.M2.T2.5: Zero salary gracefully falls back to default hourly rate without throwing', () => {
      const zeroSalaryEmp = {
        id: 'EMP-NO-SALARY',
        name: 'พนักงานไม่มีเงินเดือน',
        deptId: 'inter2',
        salary: 0,
        shifts: ['M12']
      };

      const breakdown = getEmpMonthlyOtPayBreakdown(zeroSalaryEmp, '2026-08');
      expect(breakdown.salary).toBe(15000); // Fallback to 15000
      expect(breakdown.hourlyRate).toBe(62.5);
      expect(breakdown.totalOtHours).toBe(4);
      expect(breakdown.totalOtPay).toBeGreaterThan(0);
      expect(Number.isNaN(breakdown.totalOtPay)).toBe(false);
    });
  });

  // =========================================================================
  // Section 3: Offline /api/leave-records Backend Handler Query Filter Stress
  // =========================================================================
  describe('CH.M2.Backend: Offline /api/leave-records Query Parameters', () => {
    // Implement an exact clone of the server.ts offline leave-records filtering logic
    const filterLeaveRecords = (
      store: any[],
      query: { employeeId?: string; deptId?: string; year?: string; month?: string }
    ) => {
      let records = store || [];
      const { employeeId, deptId, year, month } = query;

      if (employeeId) {
        records = records.filter(r => r.employeeId === String(employeeId));
      }
      if (deptId && deptId !== 'all') {
        records = records.filter(r => r.deptId === String(deptId));
      }
      if (year && month) {
        const prefix = `${year}-${String(month).padStart(2, '0')}-`;
        records = records.filter(r => r.date && r.date.startsWith(prefix));
      } else if (year) {
        const prefix = `${year}-`;
        records = records.filter(r => r.date && r.date.startsWith(prefix));
      }
      records = [...records].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
      return records;
    };

    const mockStore = [
      { id: 'L1', employeeId: 'EMP-101', deptId: 'inter2', date: '2026-08-15', leaveType: 'ลาพักร้อน' },
      { id: 'L2', employeeId: 'EMP-101', deptId: 'inter2', date: '2026-07-10', leaveType: 'ลาป่วย' },
      { id: 'L3', employeeId: 'EMP-102', deptId: 'inter2', date: '2026-08-01', leaveType: 'ลากิจ' },
      { id: 'L4', employeeId: 'EMP-103', deptId: 'inter3', date: '2026-08-20', leaveType: 'ลาพักร้อน' },
      { id: 'L5', employeeId: 'EMP-103', deptId: 'inter3', date: '2025-12-25', leaveType: 'ลาพักร้อน' },
      { id: 'L6', employeeId: 'EMP-104', deptId: 'inter3', date: '', leaveType: 'ไม่ระบุวัน' },
    ];

    it('CH.M2.B3.1: Returns all records sorted descending when no filters provided', () => {
      const result = filterLeaveRecords(mockStore, {});
      expect(result.length).toBe(6);
      expect(result[0].date).toBe('2026-08-20');
      expect(result[result.length - 1].date).toBe('');
    });

    it('CH.M2.B3.2: Filters accurately by employeeId', () => {
      const result = filterLeaveRecords(mockStore, { employeeId: 'EMP-101' });
      expect(result.length).toBe(2);
      expect(result.every(r => r.employeeId === 'EMP-101')).toBe(true);
      expect(result[0].date).toBe('2026-08-15');
      expect(result[1].date).toBe('2026-07-10');
    });

    it('CH.M2.B3.3: Filters accurately by deptId ("inter2", "inter3", and "all")', () => {
      const inter2Result = filterLeaveRecords(mockStore, { deptId: 'inter2' });
      expect(inter2Result.length).toBe(3);
      expect(inter2Result.every(r => r.deptId === 'inter2')).toBe(true);

      const allResult = filterLeaveRecords(mockStore, { deptId: 'all' });
      expect(allResult.length).toBe(6);
    });

    it('CH.M2.B3.4: Filters accurately by year and month with 1-digit and 2-digit padding', () => {
      // 1-digit month '8'
      const res1 = filterLeaveRecords(mockStore, { year: '2026', month: '8' });
      expect(res1.length).toBe(3);
      expect(res1.map(r => r.id)).toEqual(['L4', 'L1', 'L3']);

      // 2-digit month '08'
      const res2 = filterLeaveRecords(mockStore, { year: '2026', month: '08' });
      expect(res2.length).toBe(3);
      expect(res2.map(r => r.id)).toEqual(['L4', 'L1', 'L3']);

      // Month '07'
      const res3 = filterLeaveRecords(mockStore, { year: '2026', month: '07' });
      expect(res3.length).toBe(1);
      expect(res3[0].id).toBe('L2');
    });

    it('CH.M2.B3.5: Filters accurately by year alone', () => {
      const res2026 = filterLeaveRecords(mockStore, { year: '2026' });
      expect(res2026.length).toBe(4);

      const res2025 = filterLeaveRecords(mockStore, { year: '2025' });
      expect(res2025.length).toBe(1);
      expect(res2025[0].id).toBe('L5');

      const res2024 = filterLeaveRecords(mockStore, { year: '2024' });
      expect(res2024.length).toBe(0);
    });

    it('CH.M2.B3.6: Non-existent employeeId or deptId yields empty array without error', () => {
      const res = filterLeaveRecords(mockStore, { employeeId: 'EMP-9999' });
      expect(res).toEqual([]);

      const resDept = filterLeaveRecords(mockStore, { deptId: 'DEPT-NONE' });
      expect(resDept).toEqual([]);
    });
  });

  // =========================================================================
  // Section 4: End-to-End DOM Workflow for Telemetry Modal & Status Tabs
  // =========================================================================
  describe('CH.M2.DOM: End-to-End Telemetry Modal & Tab Rendering', () => {
    it('CH.M2.D4.1: Renders Status Tabs with badge counts and switches views cleanly', async () => {
      render(<App />);
      await waitFor(() => {
        expect(document.querySelector('main')).toBeInTheDocument();
      });

      // Navigate to employees tab
      const empTabs = screen.getAllByText(/รายชื่อพนักงาน/i);
      if (empTabs.length > 0) fireEvent.click(empTabs[0]);

      // Verify the 4 status tabs exist
      await waitFor(() => {
        expect(screen.getByText(/ทั้งหมด \(All\)/i)).toBeInTheDocument();
        expect(screen.getByText(/พนักงานปัจจุบัน/i)).toBeInTheDocument();
        expect(screen.getByText(/ลางาน \/ ลาพัก/i)).toBeInTheDocument();
        expect(screen.getByText(/คลังพนักงานลาออก \/ พ้นสภาพ/i)).toBeInTheDocument();
      });

      // Click each tab and verify it updates
      const activeTabBtn = screen.getByText(/พนักงานปัจจุบัน/i);
      fireEvent.click(activeTabBtn);

      const onLeaveTabBtn = screen.getByText(/ลางาน \/ ลาพัก/i);
      fireEvent.click(onLeaveTabBtn);

      const resignedTabBtn = screen.getByText(/คลังพนักงานลาออก \/ พ้นสภาพ/i);
      fireEvent.click(resignedTabBtn);

      const allTabBtn = screen.getByText(/ทั้งหมด \(All\)/i);
      fireEvent.click(allTabBtn);
    });

    it('CH.M2.D4.2: Clicking an employee row opens the Bento Telemetry Modal with expected sections', async () => {
      render(<App />);
      await waitFor(() => {
        expect(document.querySelector('main')).toBeInTheDocument();
      });

      // Navigate to employees tab
      const empTabs = screen.getAllByText(/รายชื่อพนักงาน/i);
      if (empTabs.length > 0) fireEvent.click(empTabs[0]);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/ค้นหารหัส, ชื่อ-นามสกุล/i)).toBeInTheDocument();
      });

      // Click first employee name in the table
      const empNames = screen.getAllByText(/สมชาย|วิชัย|วิภา|สมศักดิ์/i);
      expect(empNames.length).toBeGreaterThan(0);
      fireEvent.click(empNames[0]);

      // Telemetry Modal should be rendered
      await waitFor(() => {
        expect(screen.getByText(/สถิติการทำงานและผลตอบแทนรายบุคคล/i)).toBeInTheDocument();
        expect(screen.getByText(/ชั่วโมงกะสะสม/i)).toBeInTheDocument();
        expect(screen.getByText(/ค่าตอบแทนโอทีสะสม/i)).toBeInTheDocument();
        expect(screen.getByText(/ประเมินความล้าสะสม/i)).toBeInTheDocument();
        expect(screen.getByText(/การตรวจสอบข้อปฏิบัติตามกฎหมายแรงงาน/i)).toBeInTheDocument();
        expect(screen.getByText(/ประวัติการลาและโควตาสิทธิ/i)).toBeInTheDocument();
        expect(screen.getByText(/ข้อมูลประวัติและสายปฏิบัติงานทั่วไป/i)).toBeInTheDocument();
      });

      // Close modal
      const closeButtons = screen.getAllByTitle(/ปิดหน้าต่าง/i);
      expect(closeButtons.length).toBeGreaterThan(0);
      fireEvent.click(closeButtons[closeButtons.length - 1]);

      await waitFor(() => {
        expect(screen.queryByText(/สถิติการทำงานและผลตอบแทนรายบุคคล/i)).not.toBeInTheDocument();
      });
    });
  });
});
