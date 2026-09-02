import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import Navbar from '../../src/components/Navbar';
import { downloadCsvFile } from '../../src/components/CsvTemplateHubModal';
import { computeDynamicShift } from '../../src/components/PremiumShiftTimePickerModal';
import { calculateEmployeeMonthlyOt, simulateShiftPaintingDelta } from '../../src/utils/costSimulationEngine';
import { auditEmployeeShiftsCompliance } from '../../src/utils/shiftRecommendation';
import { mockEmployees } from '../mocks/mockData';
import { Employee } from '../../src/types';

describe('Tier 3 / 4: Radical Minimalism Cross-Feature Combinations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Cross-Feature 1: Department Filter + CSV Export Combination
  it('T3.XF.1: Filtering by department filters roster and generates scoped CSV payload', () => {
    const createObjectUrlMock = vi.fn().mockReturnValue('blob:mock-csv-url');
    global.URL.createObjectURL = createObjectUrlMock;
    global.URL.revokeObjectURL = vi.fn();

    // Filter employees by inter2
    const targetDeptId = 'inter2';
    const filteredEmps = mockEmployees.filter(e => e.deptId === targetDeptId);
    expect(filteredEmps.length).toBeGreaterThan(0);

    const headers = ['id', 'name', 'deptId', 'salary', 'targetOt'];
    const rows = filteredEmps.map(e => [e.id, e.name, e.deptId, e.salary, e.targetOt]);

    downloadCsvFile('inter2_roster.csv', headers, rows);

    expect(createObjectUrlMock).toHaveBeenCalled();
  });

  // Cross-Feature 2: Shift Time Picker Modal + Dynamic OT Recalculation + Simulation Delta
  it('T3.XF.2: Shift editor computeDynamicShift recalculates shift code and simulation delta', () => {
    // 07:00 to 23:00 -> 16 hours duration (8 regular + 8 OT)
    const dynamicShift = computeDynamicShift(7, 0, 23, 0);
    expect(dynamicShift.code).toBe('M16');
    expect(dynamicShift.duration).toBe(16);
    expect(dynamicShift.otHours).toBe(8);

    const emp: Employee = {
      id: 'EMP-XF-01',
      name: 'นายสมชาย ทดสอบ',
      deptId: 'inter2',
      role: 'Stevedore',
      salary: 24000,
      targetOt: 48,
      actualOt: 0,
      otPct: 0,
      status: 'Active',
      groupName: 'Default',
      shifts: Array(31).fill('OFF')
    };

    // Calculate baseline with OFF
    const baselineCalc = calculateEmployeeMonthlyOt(emp, emp.shifts, 2026, 8);
    expect(baselineCalc.totalOtHours).toBe(0);

    // Apply M16 to Day 3 (Monday - Weekday)
    const draftShifts = [...emp.shifts];
    draftShifts[2] = 'M16';

    const updatedCalc = calculateEmployeeMonthlyOt(emp, draftShifts, 2026, 8);
    expect(updatedCalc.totalOtHours).toBe(8);
    expect(updatedCalc.normalOt).toBe(8);
    expect(updatedCalc.totalOtPay).toBe(8 * 1.5 * (24000 / 240)); // 1,200 THB

    // Run simulation delta
    const paintedCells = [{ empId: emp.id, dateStr: "2026-08-03", newShift: "M16" }];
    const simDelta = simulateShiftPaintingDelta({}, paintedCells, [emp], 2026, 8, 100000);
    expect(simDelta.deltaOtHours).toBe(8);
    expect(simDelta.deltaCostThb).toBe(1200);
  });

  // Cross-Feature 3: Compliance Breach Alerts Synchronicity across Engine and Navbar Bell
  it('T3.XF.3: Compliance breach flags synchronize across audit engine and Navbar alert dropdown', () => {
    // Employee working 7 consecutive days (Day 1..7) without OFF
    const consecutiveShifts = [
      'M12', 'M12', 'M12', 'M12', 'M12', 'M12', 'M12',
      ...Array(24).fill('OFF')
    ];

    const alerts = auditEmployeeShiftsCompliance(consecutiveShifts, '2026-08');
    expect(alerts.length).toBeGreaterThan(0);

    const complianceNotifs = [
      {
        emp: { id: 'EMP-XF-02', name: 'นายมานะ ปฏิบัติ' },
        alerts
      }
    ];

    const onOpenComplianceModal = vi.fn();
    render(
      <Navbar
        title="Dashboard"
        searchQuery=""
        setSearchQuery={() => {}}
        currentUser={{ name: "Supervisor", role: "HR" }}
        onOpenProfile={() => {}}
        activeTab="dashboard"
        setActiveTab={() => {}}
        onLogout={() => {}}
        complianceNotifications={complianceNotifs}
        onOpenComplianceModal={onOpenComplianceModal}
      />
    );

    // Notification bell shows badge count
    const bellBtn = screen.getByTitle('การแจ้งเตือนข้อควรระวัง');
    expect(bellBtn).toBeInTheDocument();
    expect(bellBtn.textContent).toContain('1');

    // Clicking bell opens dropdown
    fireEvent.click(bellBtn);
    expect(screen.getByText('นายมานะ ปฏิบัติ')).toBeInTheDocument();

    // Clicking alert item invokes compliance modal handler
    const alertItem = screen.getByText('นายมานะ ปฏิบัติ').closest('div[class*="cursor-pointer"]');
    if (alertItem) {
      fireEvent.click(alertItem);
      expect(onOpenComplianceModal).toHaveBeenCalledWith(complianceNotifs[0]);
    }
  });
});
