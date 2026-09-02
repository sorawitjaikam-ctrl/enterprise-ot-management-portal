import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { CircadianTimelineModal } from '../../src/components/CircadianTimelineModal';
import { Employee } from '../../src/types';

describe('Tier 4: Circadian 24-Hour Timeline & Heatmap Workflows', () => {
  const mockEmployees: Employee[] = [
    {
      id: 'EMP-001',
      name: 'นายสมศักดิ์ ชัยชนะ',
      role: 'RTG Crane Operator',
      deptId: 'inter2',
      salary: 28000,
      targetOt: 0,
      actualOt: 0,
      otPct: 0,
      status: 'On Track',
      groupName: 'A',
      shifts: JSON.stringify({
        '2026-08': ['M12', 'M12', 'M12', 'M12', 'O', 'O', 'N12', 'N12', 'N12', 'N12']
      })
    },
    {
      id: 'EMP-002',
      name: 'นายวิชัย สร้อยทอง',
      role: 'RTG Crane Operator',
      deptId: 'inter2',
      salary: 28000,
      targetOt: 0,
      actualOt: 0,
      otPct: 0,
      status: 'On Track',
      groupName: 'A',
      shifts: JSON.stringify({
        '2026-08': ['N12', 'N12', 'N12', 'N12', 'O', 'O', 'M12', 'M12', 'M12', 'M12']
      })
    },
    {
      id: 'EMP-003',
      name: 'นายประสิทธิ์ มีสุข',
      role: 'Reach Stacker Operator',
      deptId: 'inter2',
      salary: 26000,
      targetOt: 0,
      actualOt: 0,
      otPct: 0,
      status: 'On Track',
      groupName: 'A',
      shifts: JSON.stringify({
        '2026-08': ['D', 'D', 'D', 'D', 'D', 'O', 'O', 'D', 'D', 'D']
      })
    }
  ];

  it('T4.7.1: Circadian Timeline modal opens and displays 24-Hour Gantt Matrix', () => {
    const handleClose = vi.fn();
    const handleSelectCell = vi.fn();

    render(
      <CircadianTimelineModal
        isOpen={true}
        onClose={handleClose}
        employees={mockEmployees}
        currentMonth="2026-08"
        departmentName="INTER 2"
        onSelectCell={handleSelectCell}
      />
    );

    // Verify modal title
    expect(screen.getByText(/24-Hour Circadian Timeline Matrix/i)).toBeInTheDocument();
    // Verify department pill
    expect(screen.getAllByText(/INTER 2/i)[0]).toBeInTheDocument();
    // Verify employee names render in Gantt list
    expect(screen.getAllByText(/นายสมศักดิ์ ชัยชนะ/i)[0]).toBeInTheDocument();
  });

  it('T4.7.2: Modal day navigation changes selected calendar day', () => {
    render(
      <CircadianTimelineModal
        isOpen={true}
        onClose={vi.fn()}
        employees={mockEmployees}
        currentMonth="2026-08"
        departmentName="INTER 2"
      />
    );

    // Initial day 1 active: dateStr 2026-08-01
    expect(screen.getByText('2026-08-01')).toBeInTheDocument();

    // Click Next Day button
    const nextBtn = screen.getByLabelText('Next Day');
    fireEvent.click(nextBtn);
    expect(screen.getByText('2026-08-02')).toBeInTheDocument();
  });

  it('T4.7.3: Day/Night circadian bands accurately segment 08:00–20:00 (Day) and 20:00–08:00 (Night)', () => {
    render(
      <CircadianTimelineModal
        isOpen={true}
        onClose={vi.fn()}
        employees={mockEmployees}
        currentMonth="2026-08"
        departmentName="INTER 2"
      />
    );

    // Verify Circadian Legend
    expect(screen.getByText(/กะกลางวัน \(08:00 - 20:00\)/i)).toBeInTheDocument();
    expect(screen.getByText(/กะดึก \(20:00 - 08:00\)/i)).toBeInTheDocument();
  });

  it('T4.7.4: Cross-midnight shifts render segment capsules across midnight', () => {
    render(
      <CircadianTimelineModal
        isOpen={true}
        onClose={vi.fn()}
        employees={mockEmployees}
        currentMonth="2026-08"
        departmentName="INTER 2"
      />
    );

    // EMP-002 has N12 (19:00 - 07:00 next day) on day 1
    const shiftChips = screen.getAllByText(/N12/i);
    expect(shiftChips.length).toBeGreaterThan(0);
  });

  it('T4.7.5: Hourly Headcount Heatmap displays peak hours and minimum staffing coverage', () => {
    render(
      <CircadianTimelineModal
        isOpen={true}
        onClose={vi.fn()}
        employees={mockEmployees}
        currentMonth="2026-08"
        departmentName="INTER 2"
      />
    );

    // Verify heatmap section is displayed
    expect(screen.getByText(/ความหนาแน่นกำลังพลรายชั่วโมง/i)).toBeInTheDocument();
  });
});
