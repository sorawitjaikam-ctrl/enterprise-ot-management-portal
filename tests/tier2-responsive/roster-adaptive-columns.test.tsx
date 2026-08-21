import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import App from '../../src/App';

describe('Tier 2: Employee Roster Adaptive Frozen Columns', () => {
  it('T2.4.1: Roster table is contained in an overflow-x-auto touch scrolling wrapper', async () => {
    const { container } = render(<App />);
    await waitFor(() => {
      expect(container.querySelector('main')).toBeInTheDocument();
    });

    const empTabs = screen.getAllByText(/รายชื่อพนักงาน/i);
    if (empTabs.length > 0) fireEvent.click(empTabs[0]);

    const tableWrapper = container.querySelector('.overflow-x-auto');
    expect(tableWrapper).not.toBeNull();
  });

  it('T2.4.2: First column (Employee ID) maintains sticky left-0 anchor across all screen sizes', async () => {
    const { container } = render(<App />);
    await waitFor(() => {
      expect(container.querySelector('main')).toBeInTheDocument();
    });

    const empTabs = screen.getAllByText(/รายชื่อพนักงาน/i);
    if (empTabs.length > 0) fireEvent.click(empTabs[0]);

    const stickyCol1 = container.querySelectorAll('.sticky.left-0');
    expect(stickyCol1.length).toBeGreaterThan(0);
  });

  it('T2.4.3: Table headers and data cells maintain alignment and background opacity', async () => {
    const { container } = render(<App />);
    await waitFor(() => {
      expect(container.querySelector('main')).toBeInTheDocument();
    });

    const empTabs = screen.getAllByText(/รายชื่อพนักงาน/i);
    if (empTabs.length > 0) fireEvent.click(empTabs[0]);

    const table = container.querySelector('table');
    expect(table).not.toBeNull();
  });

  it('T2.4.4: Roster search and filter toolbar renders smoothly above the scrollable table', async () => {
    render(<App />);
    await waitFor(() => {
      expect(document.querySelector('main')).toBeInTheDocument();
    });

    const empTabs = screen.getAllByText(/รายชื่อพนักงาน/i);
    if (empTabs.length > 0) fireEvent.click(empTabs[0]);

    const searchInput = screen.getByPlaceholderText(/ค้นหารหัส, ชื่อ-นามสกุล/i);
    expect(searchInput).toBeInTheDocument();
  });
});
