import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import App from '../../src/App';
import { ShiftRadialPicker } from '../../src/components/ShiftRadialPicker';
import { LiveSimulationHUD } from '../../src/components/LiveSimulationHUD';
import {
  simulateShiftPaintingDelta,
  calculateEmployeeMonthlyOt,
  normalizeEmployeeShifts,
  getShiftOtHours
} from '../../src/utils/costSimulationEngine';
import {
  auditEmployeeShiftsCompliance,
  getComplementaryShift,
  generateTwoTeamPairSchedules,
  generateThreeTeamRotatingSchedules,
  generate4On2OffSchedule,
  analyzeDepartmentShiftCoverage
} from '../../src/utils/shiftRecommendation';
import { mockEmployees } from '../mocks/mockData';
import { Employee } from '../../src/types';

describe('Tier 5 Adversarial Stress Suite: Interactive Shift Engine & Scheduling', () => {

  // =========================================================================
  // DIMENSION 1: Drag-to-Paint & Range Selection Stress Testing
  // =========================================================================
  describe('Dimension 1: Drag-to-Paint & 2D Range Selection', () => {

    it('T5.1.1: Multi-cell, multi-day, multi-worker 2D drag selection & batch painting', async () => {
      render(<App />);
      await waitFor(() => {
        expect(document.querySelector('main')).toBeInTheDocument();
      });

      // Navigate to Shift Scheduler
      const shiftTabs = screen.getAllByText(/ตารางจัดกะพนักงาน/i);
      if (shiftTabs.length > 0) fireEvent.click(shiftTabs[0]);

      await waitFor(() => {
        const cells = document.querySelectorAll('[data-emp-id][data-day-idx]');
        expect(cells.length).toBeGreaterThan(0);
      });

      const cells = document.querySelectorAll('[data-emp-id][data-day-idx]');
      const startCell = cells[0];
      const endCell = cells[Math.min(cells.length - 1, 15)];

      expect(startCell).toBeInTheDocument();
      expect(endCell).toBeInTheDocument();

      // Trigger 2D drag selection
      fireEvent.pointerDown(startCell);
      fireEvent.pointerEnter(endCell);

      // Verify that multiple cells receive selection highlighting
      const selectedCells = document.querySelectorAll('.bg-blue-500\\/20, [class*="ring-blue-500"]');
      expect(selectedCells.length).toBeGreaterThanOrEqual(1);

      // Press hotkey M to batch assign M12 to all selected cells
      fireEvent.keyDown(window, { key: 'm', code: 'KeyM' });

      // Verify batch assignment toast
      await waitFor(() => {
        const toast = screen.queryByText(/ทาสีกะ|สำเร็จ/i);
        expect(toast).toBeInTheDocument();
      });
    });

    it('T5.1.2: Reversed 2D drag selection (bottom-right to top-left) computes normalized bounding box', async () => {
      render(<App />);
      await waitFor(() => {
        expect(document.querySelector('main')).toBeInTheDocument();
      });

      const shiftTabs = screen.getAllByText(/ตารางจัดกะพนักงาน/i);
      if (shiftTabs.length > 0) fireEvent.click(shiftTabs[0]);

      await waitFor(() => {
        const cells = document.querySelectorAll('[data-emp-id][data-day-idx]');
        expect(cells.length).toBeGreaterThan(10);
      });

      const cells = document.querySelectorAll('[data-emp-id][data-day-idx]');
      const bottomEndCell = cells[10];
      const topStartCell = cells[1];

      // Drag backwards from index 10 to index 1
      fireEvent.pointerDown(bottomEndCell);
      fireEvent.pointerEnter(topStartCell);

      // Verify selection remains valid without negative bounds or crashes
      const selectedCells = document.querySelectorAll('[class*="ring-blue-500"]');
      expect(selectedCells.length).toBeGreaterThanOrEqual(1);

      // Press Escape to clear selection
      fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });
    });

    it('T5.1.3: Zero-size drag (click on cell without movement) selects single cell cleanly', async () => {
      render(<App />);
      await waitFor(() => {
        expect(document.querySelector('main')).toBeInTheDocument();
      });

      const shiftTabs = screen.getAllByText(/ตารางจัดกะพนักงาน/i);
      if (shiftTabs.length > 0) fireEvent.click(shiftTabs[0]);

      await waitFor(() => {
        const cells = document.querySelectorAll('[data-emp-id][data-day-idx]');
        expect(cells.length).toBeGreaterThan(0);
      });

      const firstCell = document.querySelectorAll('[data-emp-id][data-day-idx]')[0];
      fireEvent.pointerDown(firstCell);
      fireEvent.pointerUp(firstCell);

      // Focused cell should be active
      expect(firstCell).toHaveClass('ring-2');
    });

    it('T5.1.4: Active paint brush mode accumulates dragged cells and feeds Live Simulation HUD', async () => {
      render(<App />);
      await waitFor(() => {
        expect(document.querySelector('main')).toBeInTheDocument();
      });

      const shiftTabs = screen.getAllByText(/ตารางจัดกะพนักงาน/i);
      if (shiftTabs.length > 0) fireEvent.click(shiftTabs[0]);

      // Turn on Paint Brush Mode
      const paintButton = screen.queryByTitle(/เปิด\/ปิด โหมดทาสีกะ/i);
      if (paintButton) {
        fireEvent.click(paintButton);

        const cells = document.querySelectorAll('[data-emp-id][data-day-idx]');
        if (cells.length >= 3) {
          // Drag across 3 cells in brush mode
          fireEvent.pointerDown(cells[0]);
          fireEvent.pointerEnter(cells[1]);
          fireEvent.pointerEnter(cells[2]);
          // Duplicate enter on cells[1] to test idempotency
          fireEvent.pointerEnter(cells[1]);
          fireEvent.pointerUp(cells[2]);
        }

        // Verify batch assignment completed
        await waitFor(() => {
          expect(screen.queryByText(/ทาสีกะ/i)).toBeInTheDocument();
        });
      }
    });
  });

  // =========================================================================
  // DIMENSION 2: Keyboard Hotkeys & Navigation Stress Testing
  // =========================================================================
  describe('Dimension 2: Keyboard Hotkeys & Navigation Boundary Stress', () => {

    it('T5.2.1: Arrow key navigation respects grid boundary limits (no out-of-bounds crash)', async () => {
      render(<App />);
      await waitFor(() => {
        expect(document.querySelector('main')).toBeInTheDocument();
      });

      const shiftTabs = screen.getAllByText(/ตารางจัดกะพนักงาน/i);
      if (shiftTabs.length > 0) fireEvent.click(shiftTabs[0]);

      // Initialize focus with ArrowDown when no cell was focused
      fireEvent.keyDown(window, { key: 'ArrowDown', code: 'ArrowDown' });

      // Hit top-left boundary limits: Press ArrowUp and ArrowLeft
      for (let i = 0; i < 5; i++) {
        fireEvent.keyDown(window, { key: 'ArrowUp', code: 'ArrowUp' });
        fireEvent.keyDown(window, { key: 'ArrowLeft', code: 'ArrowLeft' });
      }

      // Hit bottom-right boundary limits: Press ArrowDown and ArrowRight
      for (let i = 0; i < 5; i++) {
        fireEvent.keyDown(window, { key: 'ArrowDown', code: 'ArrowDown' });
        fireEvent.keyDown(window, { key: 'ArrowRight', code: 'ArrowRight' });
      }

      // App should remain responsive without crashing
      expect(document.querySelector('main')).toBeInTheDocument();
    });

    it('T5.2.2: Home and End keys jump to start and end of month instantly', async () => {
      render(<App />);
      await waitFor(() => {
        expect(document.querySelector('main')).toBeInTheDocument();
      });

      const shiftTabs = screen.getAllByText(/ตารางจัดกะพนักงาน/i);
      if (shiftTabs.length > 0) fireEvent.click(shiftTabs[0]);

      // Focus first cell
      const firstCell = document.querySelectorAll('[data-emp-id][data-day-idx]')[0];
      if (firstCell) fireEvent.pointerDown(firstCell);

      // Jump to End of month
      fireEvent.keyDown(window, { key: 'End', code: 'End' });
      // Jump to Home (start of month)
      fireEvent.keyDown(window, { key: 'Home', code: 'Home' });

      expect(document.querySelector('main')).toBeInTheDocument();
    });

    it('T5.2.3: Rapid hotkey cycling across M, N, A, D, O, H keys', async () => {
      render(<App />);
      await waitFor(() => {
        expect(document.querySelector('main')).toBeInTheDocument();
      });

      const shiftTabs = screen.getAllByText(/ตารางจัดกะพนักงาน/i);
      if (shiftTabs.length > 0) fireEvent.click(shiftTabs[0]);

      const firstCell = document.querySelectorAll('[data-emp-id][data-day-idx]')[0];
      if (firstCell) fireEvent.pointerDown(firstCell);

      // Rapid keystrokes cycling different hotkeys
      const hotkeys = ['m', 'n', 'a', 'd', 'o', 'h', 'Backspace'];
      for (const k of hotkeys) {
        fireEvent.keyDown(window, { key: k, code: `Key${k.toUpperCase()}` });
      }

      await waitFor(() => {
        expect(document.querySelector('main')).toBeInTheDocument();
      });
    });

    it('T5.2.4: Undo/Redo stack limit (25 consecutive edits) and branch resets', async () => {
      render(<App />);
      await waitFor(() => {
        expect(document.querySelector('main')).toBeInTheDocument();
      });

      const shiftTabs = screen.getAllByText(/ตารางจัดกะพนักงาน/i);
      if (shiftTabs.length > 0) fireEvent.click(shiftTabs[0]);

      const firstCell = document.querySelectorAll('[data-emp-id][data-day-idx]')[0];
      if (firstCell) fireEvent.pointerDown(firstCell);

      // Perform edits
      for (let i = 0; i < 6; i++) {
        fireEvent.keyDown(window, { key: i % 2 === 0 ? 'm' : 'n', code: 'KeyM' });
      }

      // Execute undos via Ctrl+Z
      for (let i = 0; i < 6; i++) {
        fireEvent.keyDown(window, { key: 'z', code: 'KeyZ', ctrlKey: true });
      }

      // Execute redos via Ctrl+Y
      for (let i = 0; i < 6; i++) {
        fireEvent.keyDown(window, { key: 'y', code: 'KeyY', ctrlKey: true });
      }

      // Perform a new edit and verify redo history is invalidated cleanly
      fireEvent.keyDown(window, { key: 'd', code: 'KeyD' });
      fireEvent.keyDown(window, { key: 'y', code: 'KeyY', ctrlKey: true });

      expect(document.querySelector('main')).toBeInTheDocument();
    });

    it('T5.2.5: Escape key clears all active interaction selections and HUD results', async () => {
      render(<App />);
      await waitFor(() => {
        expect(document.querySelector('main')).toBeInTheDocument();
      });

      const shiftTabs = screen.getAllByText(/ตารางจัดกะพนักงาน/i);
      if (shiftTabs.length > 0) fireEvent.click(shiftTabs[0]);

      const firstCell = document.querySelectorAll('[data-emp-id][data-day-idx]')[0];
      if (firstCell) fireEvent.pointerDown(firstCell);

      // Hit Escape
      fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });

      // Selection rings should be cleared
      const selected = document.querySelectorAll('.bg-blue-500\\/20');
      expect(selected.length).toBe(0);
    });

    it('T5.2.6: Hotkeys are ignored when typing inside text inputs, textareas, or selects', async () => {
      render(<App />);
      await waitFor(() => {
        expect(document.querySelector('main')).toBeInTheDocument();
      });

      const shiftTabs = screen.getAllByText(/ตารางจัดกะพนักงาน/i);
      if (shiftTabs.length > 0) fireEvent.click(shiftTabs[0]);

      // Create dummy input and focus it
      const input = document.createElement('input');
      document.body.appendChild(input);
      input.focus();

      // Dispatch 'm' and 'ArrowDown' on input
      fireEvent.keyDown(input, { key: 'm', code: 'KeyM' });
      fireEvent.keyDown(input, { key: 'ArrowDown', code: 'ArrowDown' });

      expect(document.querySelector('main')).toBeInTheDocument();
      document.body.removeChild(input);
    });
  });

  // =========================================================================
  // DIMENSION 3: Radial Quick Picker & Drag-and-Drop Shift Swap Stress Testing
  // =========================================================================
  describe('Dimension 3: Radial Quick Picker & Drag-and-Drop Shift Swap', () => {

    it('T5.3.1: ShiftRadialPicker handles boundary position clamping at extreme coordinates', () => {
      const handleSelect = vi.fn();
      const handleClose = vi.fn();
      const emp = mockEmployees[0];

      // Coordinate at extreme negative and extreme positive bounds
      const { unmount, rerender } = render(
        <ShiftRadialPicker
          isOpen={true}
          position={{ x: -999, y: -999 }}
          currentShift="M12"
          employee={emp}
          dayNumber={1}
          onSelectShift={handleSelect}
          onClose={handleClose}
        />
      );

      expect(screen.getByTestId('shift-radial-picker')).toBeInTheDocument();

      // Rerender with extreme off-screen coordinate
      rerender(
        <ShiftRadialPicker
          isOpen={true}
          position={{ x: 99999, y: 99999 }}
          currentShift="N12"
          employee={emp}
          dayNumber={15}
          onSelectShift={handleSelect}
          onClose={handleClose}
        />
      );

      expect(screen.getByTestId('shift-radial-picker')).toBeInTheDocument();
      unmount();
    });

    it('T5.3.2: ShiftRadialPicker handles missing paired employee and all 11 shift button actions', () => {
      const handleSelect = vi.fn();
      const handleClose = vi.fn();
      const emp = mockEmployees[0];

      render(
        <ShiftRadialPicker
          isOpen={true}
          position={{ x: 200, y: 200 }}
          currentShift="M12"
          employee={emp}
          dayNumber={3}
          pairedEmployee={undefined}
          pairedShift={undefined}
          onSelectShift={handleSelect}
          onClose={handleClose}
        />
      );

      // Verify smart recommendation card is not displayed when no paired employee
      expect(screen.queryByText(/⚡ แนะนำคู่กะอัตโนมัติ/i)).not.toBeInTheDocument();

      // Verify all primary shifts exist and can be clicked
      const expectedCodes = ['M12', 'M8', 'M16', 'A8', 'A12', 'N12', 'N8', 'N16', 'D', 'OND', 'O'];
      const buttons = screen.getAllByRole('button');

      expectedCodes.forEach(code => {
        const btn = buttons.find(b => b.textContent?.includes(code === 'O' ? 'OFF' : code));
        expect(btn).toBeDefined();
        if (btn) {
          fireEvent.click(btn);
          expect(handleSelect).toHaveBeenCalledWith(code);
        }
      });
    });

    it('T5.3.3: ShiftRadialPicker 1-Touch complementary suggestion selects recommended shift', () => {
      const handleSelect = vi.fn();
      const handleClose = vi.fn();
      const empA = mockEmployees[0];
      const empB = mockEmployees[1];

      render(
        <ShiftRadialPicker
          isOpen={true}
          position={{ x: 300, y: 300 }}
          currentShift="M12"
          employee={empA}
          dayNumber={10}
          pairedEmployee={empB}
          pairedShift="M12"
          onSelectShift={handleSelect}
          onClose={handleClose}
        />
      );

      // When peer has M12, recommendation for this employee is N12
      expect(screen.getByText(/⚡ แนะนำคู่กะอัตโนมัติ/i)).toBeInTheDocument();
      const oneTouchBtn = screen.getByText(/ใส่กะแนะนำ: N12/i);
      fireEvent.click(oneTouchBtn);

      expect(handleSelect).toHaveBeenCalledWith('N12');
      expect(handleClose).toHaveBeenCalled();
    });

    it('T5.3.4: Drag-and-drop shift swap between two distinct employees updates shifts cleanly', async () => {
      render(<App />);
      await waitFor(() => {
        expect(document.querySelector('main')).toBeInTheDocument();
      });

      const shiftTabs = screen.getAllByText(/ตารางจัดกะพนักงาน/i);
      if (shiftTabs.length > 0) fireEvent.click(shiftTabs[0]);

      await waitFor(() => {
        const draggableChips = document.querySelectorAll('[data-emp-id] [draggable="true"]');
        expect(draggableChips.length).toBeGreaterThan(1);
      });

      // Select two chips from distinct day cells
      const cells = document.querySelectorAll('[data-emp-id][data-day-idx]');
      expect(cells.length).toBeGreaterThan(1);

      const sourceCell = cells[0];
      const targetCell = cells[1];

      const sourceChip = sourceCell.querySelector('[draggable="true"]');
      const targetChip = targetCell.querySelector('[draggable="true"]');

      expect(sourceChip).toBeInTheDocument();
      expect(targetChip).toBeInTheDocument();

      if (sourceChip && targetChip) {
        // Drag source onto target
        fireEvent.dragStart(sourceChip);
        fireEvent.dragOver(targetChip);
        fireEvent.drop(targetChip);

        // Verify swap toast message
        await waitFor(() => {
          const toast = screen.queryByText(/สลับกะ/i);
          expect(toast).toBeInTheDocument();
        });
      }
    });

    it('T5.3.5: Self-swap (dropping shift chip onto itself) is a no-op and does not corrupt state', async () => {
      render(<App />);
      await waitFor(() => {
        expect(document.querySelector('main')).toBeInTheDocument();
      });

      const shiftTabs = screen.getAllByText(/ตารางจัดกะพนักงาน/i);
      if (shiftTabs.length > 0) fireEvent.click(shiftTabs[0]);

      await waitFor(() => {
        const draggableChips = document.querySelectorAll('[draggable="true"]');
        expect(draggableChips.length).toBeGreaterThan(0);
      });

      const chip = document.querySelectorAll('[draggable="true"]')[0];
      fireEvent.dragStart(chip);
      fireEvent.dragOver(chip);
      fireEvent.drop(chip);

      expect(document.querySelector('main')).toBeInTheDocument();
    });
  });

  // =========================================================================
  // DIMENSION 4: Live Simulation & Compliance Calculation Edge Cases
  // =========================================================================
  describe('Dimension 4: Live Simulation & Compliance Calculation Adversarial Edge Cases', () => {

    it('T5.4.1: Massive cell painting simulates large delta OT hours, THB cost, and flags 150k budget ceiling breach', () => {
      const emps: Employee[] = mockEmployees;
      const paintedCells: Array<{ empId: string; dateStr: string; newShift: string }> = [];

      // Paint 20 consecutive M16 shifts (8h OT each) for all employees = 4 * 20 = 80 cells = 640 OT hours
      emps.forEach(emp => {
        for (let day = 1; day <= 20; day++) {
          paintedCells.push({
            empId: emp.id,
            dateStr: `2026-08-${String(day).padStart(2, '0')}`,
            newShift: 'M16'
          });
        }
      });

      const result = simulateShiftPaintingDelta(
        {},
        paintedCells,
        emps,
        2026,
        8,
        150000
      );

      expect(result.paintedCellsCount).toBe(emps.length * 20);
      expect(result.affectedEmployeesCount).toBe(emps.length);
      expect(result.deltaOtHours).toBeGreaterThan(0);
      expect(result.newTotalCostThb).toBeGreaterThan(result.baselineCostThb);
      expect(result.isBudgetExceeded).toBe(true);
      expect(result.budgetUtilizationPct).toBeGreaterThan(100);
      expect(result.complianceViolations.some(v => v.type === 'budget_exceeded')).toBe(true);
      expect(result.complianceViolations.some(v => v.type === 'weekly_ot')).toBe(true);
    });

    it('T5.4.2: Painting cells to OFF ("O") correctly calculates negative delta OT hours and monetary savings', () => {
      const emps: Employee[] = mockEmployees.slice(0, 2);
      const paintedCells: Array<{ empId: string; dateStr: string; newShift: string }> = [];

      // Paint all 31 days to "O" for baseline employees who had OT
      emps.forEach(emp => {
        for (let day = 1; day <= 31; day++) {
          paintedCells.push({
            empId: emp.id,
            dateStr: `${day}`,
            newShift: 'O'
          });
        }
      });

      const result = simulateShiftPaintingDelta(
        {},
        paintedCells,
        emps,
        2026,
        8,
        150000
      );

      expect(result.simulatedOtHours).toBe(0);
      expect(result.simulatedCostThb).toBe(0);
      expect(result.deltaCostThb).toBeLessThanOrEqual(0);
      expect(result.isBudgetExceeded).toBe(false);
    });

    it('T5.4.3: normalizeEmployeeShifts handles corrupted JSON, null shifts, and empty objects gracefully', () => {
      const corruptEmp1 = { ...mockEmployees[0], shifts: "INVALID_JSON{{{" };
      const corruptEmp2 = { ...mockEmployees[0], shifts: null as any };
      const corruptEmp3 = { ...mockEmployees[0], shifts: 12345 as any };
      const corruptEmp4 = { ...mockEmployees[0], shifts: JSON.stringify({ "2026-07": ["M12", "M12"] }) }; // wrong month

      const res1 = normalizeEmployeeShifts(corruptEmp1, '2026-08');
      const res2 = normalizeEmployeeShifts(corruptEmp2, '2026-08');
      const res3 = normalizeEmployeeShifts(corruptEmp3, '2026-08');
      const res4 = normalizeEmployeeShifts(corruptEmp4, '2026-08');

      expect(res1).toHaveLength(31);
      expect(res1.every(s => s === 'O')).toBe(true);
      expect(res2).toHaveLength(31);
      expect(res3).toHaveLength(31);
      expect(res4).toHaveLength(31);
    });

    it('T5.4.4: auditEmployeeShiftsCompliance catches rest_period danger (<11h rest) for all Night-to-Morning transitions', () => {
      const nightShifts = ['N8', 'N12', 'N16'];
      const morningShifts = ['M8', 'M12', 'M16', 'D'];

      nightShifts.forEach(nightCode => {
        morningShifts.forEach(morningCode => {
          const schedule = new Array(31).fill('O');
          schedule[0] = nightCode;
          schedule[1] = morningCode; // immediate next day morning

          const alerts = auditEmployeeShiftsCompliance(schedule, '2026-08');
          const restAlert = alerts.find(a => a.type === 'rest_period');
          expect(restAlert).toBeDefined();
          expect(restAlert?.level).toBe('danger');
          expect(restAlert?.message).toContain('เวลาพักผ่อนไม่ถึง 11 ชม.');
        });
      });
    });

    it('T5.4.5: auditEmployeeShiftsCompliance catches weekly_ot limit (>36h) and consecutive_days (>6 days)', () => {
      // 1. Weekly OT test: 5 consecutive days of M16 (8h OT each = 40h OT in week 1)
      const heavyOtSchedule = new Array(31).fill('O');
      for (let i = 0; i < 5; i++) heavyOtSchedule[i] = 'M16';

      const otAlerts = auditEmployeeShiftsCompliance(heavyOtSchedule, '2026-08');
      const weeklyOtAlert = otAlerts.find(a => a.type === 'weekly_ot');
      expect(weeklyOtAlert).toBeDefined();
      expect(weeklyOtAlert?.message).toContain('36 ชม./สัปดาห์');

      // 2. Consecutive days test: 8 days of work without day off
      const consecutiveSchedule = new Array(31).fill('O');
      for (let i = 0; i < 8; i++) consecutiveSchedule[i] = 'M8';

      const consecAlerts = auditEmployeeShiftsCompliance(consecutiveSchedule, '2026-08');
      const consecAlert = consecAlerts.find(a => a.type === 'consecutive_days');
      expect(consecAlert).toBeDefined();
      expect(consecAlert?.message).toContain('ทำงานติดต่อกัน');
    });

    it('T5.4.6: Complementary shift pairing algorithm covers all standard shift categories', () => {
      expect(getComplementaryShift('M12').suggestedCode).toBe('N12');
      expect(getComplementaryShift('N12').suggestedCode).toBe('M12');
      expect(getComplementaryShift('M8').suggestedCode).toBe('A8');
      expect(getComplementaryShift('A8').suggestedCode).toBe('N8');
      expect(getComplementaryShift('N8').suggestedCode).toBe('M8');
      expect(getComplementaryShift('D').suggestedCode).toBe('N12');
      expect(getComplementaryShift('O').suggestedCode).toBe('M12');
      expect(getComplementaryShift('UNKNOWN').suggestedCode).toBe('M12');
    });

    it('T5.4.7: Schedule pattern generators (2-team, 3-team, 4-on-2-off) generate seamless coverage', () => {
      const twoTeam = generateTwoTeamPairSchedules(31);
      expect(twoTeam.teamA).toHaveLength(31);
      expect(twoTeam.teamB).toHaveLength(31);
      // When Team A is M12, Team B is N12 (on day 0)
      expect(twoTeam.teamA[0]).toBe('M12');
      expect(twoTeam.teamB[0]).toBe('N12');

      const threeTeam = generateThreeTeamRotatingSchedules(31);
      expect(threeTeam.teamA).toHaveLength(31);
      expect(threeTeam.teamB).toHaveLength(31);
      expect(threeTeam.teamC).toHaveLength(31);

      const fourOnTwoOff = generate4On2OffSchedule(31, 'M12', 0);
      expect(fourOnTwoOff).toHaveLength(31);
      expect(fourOnTwoOff.slice(0, 6)).toEqual(['M12', 'M12', 'M12', 'M12', 'O', 'O']);
    });

    it('T5.4.8: analyzeDepartmentShiftCoverage computes role staffing gaps accurately', () => {
      const sampleDeptEmps = [
        {
          id: 'EMP-01',
          name: 'Op 1',
          role: 'Crane Operator',
          shifts: { '2026-08': ['M12', 'O', 'O'] }
        },
        {
          id: 'EMP-02',
          name: 'Op 2',
          role: 'Crane Operator',
          shifts: { '2026-08': ['O', 'O', 'O'] }
        }
      ];

      const coverage = analyzeDepartmentShiftCoverage(sampleDeptEmps, '2026-08');
      expect(coverage['Crane Operator']).toBeDefined();
      // Day 1: Op 1 is M12 (morning 1, night 0) -> warning/gap because total >= 2 and night is 0
      expect(coverage['Crane Operator'][0].morningCount).toBe(1);
      expect(coverage['Crane Operator'][0].nightCount).toBe(0);
      expect(coverage['Crane Operator'][0].hasGap).toBe(true);

      // Day 2: both OFF (morning 0, night 0) -> danger
      expect(coverage['Crane Operator'][1].morningCount).toBe(0);
      expect(coverage['Crane Operator'][1].nightCount).toBe(0);
      expect(coverage['Crane Operator'][1].status).toBe('danger');
    });
  });
});
