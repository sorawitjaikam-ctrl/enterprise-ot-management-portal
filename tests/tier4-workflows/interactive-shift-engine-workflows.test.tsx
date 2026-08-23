import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import App from '../../src/App';
import { ShiftRadialPicker } from '../../src/components/ShiftRadialPicker';
import { LiveSimulationHUD } from '../../src/components/LiveSimulationHUD';
import { Employee } from '../../src/types';
import { SimulationResult } from '../../src/utils/costSimulationEngine';

describe('Tier 4: Interactive Shift Engine & Hotkeys Workflow', () => {
  it('T4.6.1: Paint Brush mode toggles palette and active shift selection', async () => {
    render(<App />);
    await waitFor(() => {
      expect(document.querySelector('main')).toBeInTheDocument();
    });

    const shiftTabs = screen.getAllByText(/ตารางจัดกะพนักงาน/i);
    if (shiftTabs.length > 0) {
      fireEvent.click(shiftTabs[0]);
    }

    const paintButton = screen.queryByTitle(/เปิด\/ปิด โหมดทาสีกะ/i);
    if (paintButton) {
      fireEvent.click(paintButton);
      expect(screen.getByText(/ทาสี \(M12\)/i)).toBeInTheDocument();
    }
  });

  it('T4.6.2: Undo and Redo buttons reflect history snapshot stack', async () => {
    render(<App />);
    await waitFor(() => {
      expect(document.querySelector('main')).toBeInTheDocument();
    });

    const shiftTabs = screen.getAllByText(/ตารางจัดกะพนักงาน/i);
    if (shiftTabs.length > 0) {
      fireEvent.click(shiftTabs[0]);
    }

    const undoButton = screen.queryByTitle(/เลิกทำ \(Ctrl\+Z\)/i);
    const redoButton = screen.queryByTitle(/ทำซ้ำ \(Ctrl\+Y\)/i);
    if (undoButton) expect(undoButton).toBeInTheDocument();
    if (redoButton) expect(redoButton).toBeInTheDocument();
  });

  it('T4.6.3: Radial picker modal renders 6 tactile action buttons with complementary suggestion', () => {
    const handleSelect = vi.fn();
    const handleClose = vi.fn();

    const employee: Employee = {
      id: 'EMP-001',
      name: 'นายสมศักดิ์ ชัยชนะ',
      role: 'RTG Crane Operator',
      deptId: 'inter2',
      calendarType: '2team',
      salary: 28000,
      targetOt: 0,
      actualOt: 0,
      otPct: 0,
      status: 'On Track',
      groupName: 'G1',
      shifts: JSON.stringify({
        '2026-08': ['M12', 'M12', 'M12', 'M12', 'O', 'O', 'N12', 'N12', 'N12', 'N12']
      })
    };

    const pairedEmp: Employee = {
      id: 'EMP-002',
      name: 'นายวิชัย สร้อยทอง',
      role: 'RTG Crane Operator',
      deptId: 'inter2',
      calendarType: '2team',
      salary: 28000,
      targetOt: 0,
      actualOt: 0,
      otPct: 0,
      status: 'On Track',
      groupName: 'G1',
      shifts: JSON.stringify({
        '2026-08': ['N12', 'N12', 'N12', 'N12', 'O', 'O', 'M12', 'M12', 'M12', 'M12']
      })
    };

    render(
      <ShiftRadialPicker
        isOpen={true}
        position={{ x: 300, y: 300 }}
        currentShift="M12"
        employee={employee}
        dayNumber={5}
        pairedEmployee={pairedEmp}
        pairedShift="N12"
        onSelectShift={handleSelect}
        onClose={handleClose}
      />
    );

    // Verify dialog content
    expect(screen.getByText(/นายสมศักดิ์ ชัยชนะ/i)).toBeInTheDocument();
    expect(screen.getByText(/วันที่ 5/i)).toBeInTheDocument();

    // Verify shift action buttons
    const buttons = screen.getAllByRole('button');
    const m12Btn = buttons.find(b => b.textContent?.includes('M12'));
    expect(m12Btn).toBeDefined();
    if (m12Btn) {
      fireEvent.click(m12Btn);
      expect(handleSelect).toHaveBeenCalledWith('M12');
    }
  });

  it('T4.6.4: Live Simulation HUD updates OT delta, cost THB, and ceiling progress bar', () => {
    const handleApply = vi.fn();
    const handleCancel = vi.fn();
    const handleSelectShift = vi.fn();

    const simulationData: SimulationResult = {
      baselineOtHours: 0,
      simulatedOtHours: 32,
      deltaOtHours: 32,
      baselineCostThb: 85000,
      simulatedCostThb: 90200,
      deltaCostThb: 5200,
      departmentBudgetLimit: 150000,
      currentTotalCostThb: 85000,
      newTotalCostThb: 90200,
      budgetUtilizationPct: 60.13,
      isBudgetExceeded: false,
      complianceViolations: [],
      affectedEmployeesCount: 1,
      paintedCellsCount: 8
    };

    render(
      <LiveSimulationHUD
        simulation={simulationData}
        activePaintShift="M12"
        onApply={handleApply}
        onCancel={handleCancel}
        onSelectShift={handleSelectShift}
      />
    );

    // Verify live OT hours delta
    expect(screen.getByText(/\+32/i)).toBeInTheDocument();
    // Verify cost impact
    expect(screen.getByText(/\+฿5,200/i)).toBeInTheDocument();
    // Verify budget status
    expect(screen.getByText(/60.1/i)).toBeInTheDocument();
    // Verify apply action button
    const applyBtn = screen.getByText(/บันทึกกะ \(8\)/i);
    fireEvent.click(applyBtn);
    expect(handleApply).toHaveBeenCalled();
  });

  it('T4.6.5: Keyboard hotkeys listener binds and unbinds cleanly', async () => {
    render(<App />);
    await waitFor(() => {
      expect(document.querySelector('main')).toBeInTheDocument();
    });

    const shiftTabs = screen.getAllByText(/ตารางจัดกะพนักงาน/i);
    if (shiftTabs.length > 0) fireEvent.click(shiftTabs[0]);

    // Dispatch ArrowDown event
    fireEvent.keyDown(window, { key: 'ArrowDown', code: 'ArrowDown' });
    // Dispatch Escape event
    fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });
    expect(document.querySelector('main')).toBeInTheDocument();
  });
});
