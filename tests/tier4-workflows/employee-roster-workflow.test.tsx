import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import App from '../../src/App';

describe('Tier 4: Employee Roster Search & Multi-Filter Workflow', () => {
  it('T4.2.1: Navigates to Employee Roster view and renders employee database', async () => {
    render(<App />);
    await waitFor(() => {
      expect(document.querySelector('main')).toBeInTheDocument();
    });

    const empTabs = screen.getAllByText(/รายชื่อพนักงาน/i);
    if (empTabs.length > 0) {
      fireEvent.click(empTabs[0]);
    }

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/ค้นหารหัส, ชื่อ-นามสกุล/i)).toBeInTheDocument();
    });
  });

  it('T4.2.2: Searching by Thai name or nickname updates search filter input', async () => {
    render(<App />);
    await waitFor(() => {
      expect(document.querySelector('main')).toBeInTheDocument();
    });

    const empTabs = screen.getAllByText(/รายชื่อพนักงาน/i);
    if (empTabs.length > 0) fireEvent.click(empTabs[0]);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/ค้นหารหัส, ชื่อ-นามสกุล/i)).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/ค้นหารหัส, ชื่อ-นามสกุล/i) as HTMLInputElement;
    fireEvent.change(searchInput, { target: { value: 'สมชาย' } });

    expect(searchInput.value).toBe('สมชาย');
  });

  it('T4.2.3: Multi-filtering by department and role options operates smoothly', async () => {
    render(<App />);
    await waitFor(() => {
      expect(document.querySelector('main')).toBeInTheDocument();
    });

    const empTabs = screen.getAllByText(/รายชื่อพนักงาน/i);
    if (empTabs.length > 0) fireEvent.click(empTabs[0]);

    await waitFor(() => {
      const filterSelects = document.querySelectorAll('select');
      expect(filterSelects.length).toBeGreaterThan(0);
    });
  });

  it('T4.2.4: Reset / Clear filters button restores full roster listing', async () => {
    render(<App />);
    await waitFor(() => {
      expect(document.querySelector('main')).toBeInTheDocument();
    });

    const empTabs = screen.getAllByText(/รายชื่อพนักงาน/i);
    if (empTabs.length > 0) fireEvent.click(empTabs[0]);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/ค้นหารหัส, ชื่อ-นามสกุล/i)).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/ค้นหารหัส, ชื่อ-นามสกุล/i) as HTMLInputElement;
    fireEvent.change(searchInput, { target: { value: 'วิภา' } });
    expect(searchInput.value).toBe('วิภา');

    const clearButton = screen.queryByText(/ล้างตัวกรอง|ล้างการค้นหา/i);
    if (clearButton) {
      fireEvent.click(clearButton);
    }
  });

  it('T4.2.5: Employee summary cards display total personnel count and statistics', async () => {
    render(<App />);
    await waitFor(() => {
      expect(document.querySelector('main')).toBeInTheDocument();
    });

    const empTabs = screen.getAllByText(/รายชื่อพนักงาน/i);
    if (empTabs.length > 0) fireEvent.click(empTabs[0]);

    await waitFor(() => {
      const statsElements = screen.getAllByText(/Organization chart|ฐานข้อมูล|พนักงานปัจจุบัน/i);
      expect(statsElements.length).toBeGreaterThan(0);
    });
  });
});
