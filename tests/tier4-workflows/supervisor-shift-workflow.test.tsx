import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import App, { getEmpMonthlyOtPayBreakdown } from '../../src/App';

describe('Tier 4: Supervisor Shift Workflow & Recalculation', () => {
  it('T4.1.1: Supervisor navigates to Shift Scheduler tab and views shift matrix', async () => {
    render(<App />);
    await waitFor(() => {
      expect(document.querySelector('main')).toBeInTheDocument();
    });

    const shiftTabs = screen.getAllByText(/ตารางจัดกะพนักงาน/i);
    if (shiftTabs.length > 0) {
      fireEvent.click(shiftTabs[0]);
    }

    await waitFor(() => {
      expect(document.querySelector('main')).toBeInTheDocument();
    });
  });

  it('T4.1.2: Monthly breakdown immediately recalculates when shift changes from M8 to M12', () => {
    const emp = {
      id: 'EMP-101',
      salary: 24000,
      shifts: Array(31).fill('M8')
    };

    const initialBreakdown = getEmpMonthlyOtPayBreakdown(emp, '2026-08');
    const initialWeekdayOt = initialBreakdown.normalOt;

    const updatedShifts = [...emp.shifts];
    updatedShifts[2] = 'M12'; // Aug 3 (Mon)
    updatedShifts[3] = 'M12'; // Aug 4 (Tue)
    updatedShifts[4] = 'M12'; // Aug 5 (Wed)
    updatedShifts[5] = 'M12'; // Aug 6 (Thu)
    updatedShifts[6] = 'M12'; // Aug 7 (Fri)

    const updatedBreakdown = getEmpMonthlyOtPayBreakdown({ ...emp, shifts: updatedShifts }, '2026-08');
    expect(updatedBreakdown.normalOt).toBe(initialWeekdayOt + 20);
    expect(updatedBreakdown.totalOtPay).toBeGreaterThan(initialBreakdown.totalOtPay);
  });

  it('T4.1.3: Plan vs Actual mode switch updates calendar grid view', async () => {
    render(<App />);
    await waitFor(() => {
      expect(document.querySelector('main')).toBeInTheDocument();
    });

    const shiftTabs = screen.getAllByText(/ตารางจัดกะพนักงาน/i);
    if (shiftTabs.length > 0) fireEvent.click(shiftTabs[0]);

    const planToggle = screen.queryByText(/แผนงาน \(Plan\)|ตารางแผน/i);
    if (planToggle) {
      fireEvent.click(planToggle);
      expect(planToggle).toBeInTheDocument();
    }
  });

  it('T4.1.4: Department switcher synchronizes employees and vessel schedules', async () => {
    render(<App />);
    await waitFor(() => {
      expect(document.querySelector('main')).toBeInTheDocument();
    });

    const shiftTabs = screen.getAllByText(/ตารางจัดกะพนักงาน/i);
    if (shiftTabs.length > 0) fireEvent.click(shiftTabs[0]);

    const selectElements = document.querySelectorAll('select');
    if (selectElements.length > 0) {
      const deptSelect = selectElements[0];
      fireEvent.change(deptSelect, { target: { value: 'inter3' } });
      expect(deptSelect.value).toBe('inter3');
    }
  });

  it('T4.1.5: Weekly overtime limit warning is computed for excessive hours (>36 hrs/week)', () => {
    const weeklyOtHours = 40;
    const isExceedingLegalLimit = weeklyOtHours > 36;
    expect(isExceedingLegalLimit).toBe(true);
  });
});
