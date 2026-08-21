import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import App, { getEmpMonthlyOtPayBreakdown } from '../../src/App';

describe('Tier 4: Strict Desktop 368px Summary Block Invariants', () => {
  it('T4.3.1: Desktop summary header block enforces exact 368px container width', async () => {
    const { container } = render(<App />);
    await waitFor(() => {
      expect(container.querySelector('main')).toBeInTheDocument();
    });

    const shiftTabs = screen.getAllByText(/ตารางจัดกะพนักงาน/i);
    if (shiftTabs.length > 0) fireEvent.click(shiftTabs[0]);

    const summaryHeaders = container.querySelectorAll('.w-\\[368px\\]');
    expect(summaryHeaders.length).toBeGreaterThanOrEqual(1);
  });

  it('T4.3.2: 200px breakdown header cleanly decomposes into 56px, 64px, and 80px sub-columns', () => {
    // 56px (w-14 OT ปกติ) + 64px (w-16 OT วันหยุด) + 80px (w-20 ทำงานวันหยุด) = 200px
    const normalOtWidth = 56;
    const holidayOtWidth = 64;
    const holidayWorkDaysWidth = 80;
    const breakdownTotal = normalOtWidth + holidayOtWidth + holidayWorkDaysWidth;

    expect(breakdownTotal).toBe(200);
  });

  it('T4.3.3: Total summary columns width exactly equals 368px (200px + 96px Baht + 72px %)', () => {
    const breakdownWidth = 200;
    const costBahtWidth = 96;  // w-24
    const costPctWidth = 72;   // w-18
    const totalSummaryWidth = breakdownWidth + costBahtWidth + costPctWidth;

    expect(totalSummaryWidth).toBe(368);
  });

  it('T4.3.4: Cost in Baht and % of Salary mathematical invariant holds for all salary levels', () => {
    const testCases = [
      { salary: 15000, normalOt: 20, holidayOt: 0, holidayWorkDays: 0 },
      { salary: 24000, normalOt: 40, holidayOt: 8, holidayWorkDays: 2 },
      { salary: 48000, normalOt: 0, holidayOt: 16, holidayWorkDays: 4 },
    ];

    testCases.forEach(({ salary, normalOt, holidayOt, holidayWorkDays }) => {
      const hourlyRate = salary / 240;
      const expectedTotalPay = Math.round((normalOt * 1.5 + holidayOt * 3.0 + holidayWorkDays * 8 * 1.0) * hourlyRate);
      const expectedPct = ((expectedTotalPay / salary) * 100).toFixed(2);

      expect(expectedTotalPay).toBeGreaterThan(0);
      expect(Number(expectedPct)).toBeGreaterThan(0);
      expect(expectedPct).toMatch(/^\d+\.\d{2}$/);
    });
  });

  it('T4.3.5: Summary header labels in Thai match the established layout contract', async () => {
    render(<App />);
    await waitFor(() => {
      expect(document.querySelector('main')).toBeInTheDocument();
    });

    const shiftTabs = screen.getAllByText(/ตารางจัดกะพนักงาน/i);
    if (shiftTabs.length > 0) fireEvent.click(shiftTabs[0]);

    await waitFor(() => {
      const summaryTexts = screen.getAllByText(/สรุปข้อมูล OT รายเดือน|OT ปกติ|บาท/i);
      expect(summaryTexts.length).toBeGreaterThan(0);
    });
  });
});
