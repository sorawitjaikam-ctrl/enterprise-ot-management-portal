import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import App from '../../src/App';

describe('Tier 2: Shift Matrix Sticky Columns & Panning', () => {
  it('T2.3.1: Shift matrix contains sticky left-0 worker identity columns', async () => {
    const { container } = render(<App />);
    await waitFor(() => {
      expect(container.querySelector('main')).toBeInTheDocument();
    });

    const shiftTabs = screen.getAllByText(/ตารางจัดกะพนักงาน/i);
    if (shiftTabs.length > 0) fireEvent.click(shiftTabs[0]);

    const stickyLeftElements = container.querySelectorAll('.sticky.left-0');
    expect(stickyLeftElements.length).toBeGreaterThan(0);
  });

  it('T2.3.2: Sticky columns utilize z-index >= 10 to avoid clipping underneath day cells', async () => {
    const { container } = render(<App />);
    await waitFor(() => {
      expect(container.querySelector('main')).toBeInTheDocument();
    });

    const shiftTabs = screen.getAllByText(/ตารางจัดกะพนักงาน/i);
    if (shiftTabs.length > 0) fireEvent.click(shiftTabs[0]);

    const stickyCells = container.querySelectorAll('.sticky.left-0');
    const hasProperZIndex = Array.from(stickyCells).some(el =>
      el.className.includes('z-10') || el.className.includes('z-20') || el.className.includes('z-30')
    );
    expect(hasProperZIndex).toBe(true);
  });

  it('T2.3.3: Calendar days table wrapper is wrapped in overflow-x-auto container', async () => {
    const { container } = render(<App />);
    await waitFor(() => {
      expect(container.querySelector('main')).toBeInTheDocument();
    });

    const shiftTabs = screen.getAllByText(/ตารางจัดกะพนักงาน/i);
    if (shiftTabs.length > 0) fireEvent.click(shiftTabs[0]);

    const overflowContainers = container.querySelectorAll('.overflow-x-auto');
    expect(overflowContainers.length).toBeGreaterThan(0);
  });

  it('T2.3.4: Worker column has defined width constraints for stable alignment', async () => {
    const { container } = render(<App />);
    await waitFor(() => {
      expect(container.querySelector('main')).toBeInTheDocument();
    });

    const shiftTabs = screen.getAllByText(/ตารางจัดกะพนักงาน/i);
    if (shiftTabs.length > 0) fireEvent.click(shiftTabs[0]);

    const stickyCells = container.querySelectorAll('.sticky.left-0');
    const hasWidthClass = Array.from(stickyCells).some(el =>
      el.className.includes('w-') || el.className.includes('min-w-')
    );
    expect(hasWidthClass).toBe(true);
  });

  it('T2.3.5: All table rows (Header, Roster Header Bar, Employee Rows, Footers) enforce sticky left-0 on identity columns to prevent desync', async () => {
    const { container } = render(<App />);
    await waitFor(() => {
      expect(container.querySelector('main')).toBeInTheDocument();
    });

    const shiftTabs = screen.getAllByText(/ตารางจัดกะพนักงาน/i);
    if (shiftTabs.length > 0) fireEvent.click(shiftTabs[0]);

    await waitFor(() => {
      expect(screen.getByText(/รายชื่อพนักงานจัดกะ/i)).toBeInTheDocument();
    });

    // Check Employee Roster Header Bar
    const rosterHeaderCol = screen.getByText(/รายชื่อพนักงานจัดกะ/i).closest('div');
    expect(rosterHeaderCol?.className).toMatch(/sticky.*left-0/);

    // Check Days Labels Header
    const daysHeaderCol = screen.getByText(/พนักงานสังกัด \/ รายชื่อ/i);
    expect(daysHeaderCol.className).toMatch(/sticky.*left-0/);

    // Check Footer Summary rows
    const coverageFooter = screen.getByText(/สรุปความคุ้มครอง/i);
    expect(coverageFooter.className).toMatch(/sticky.*left-0/);

    const dailyOtFooter = screen.getByText(/สรุปชั่วโมง OT รายวัน/i);
    expect(dailyOtFooter.className).toMatch(/sticky.*left-0/);
  });
});
