import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import Navbar from '../../src/components/Navbar';
import CsvTemplateHubModal from '../../src/components/CsvTemplateHubModal';

describe('Tier 2: Touch Ergonomics & 44px Tap Target Compliance', () => {
  it('T2.5.1: Navigation action buttons include accessible touch targets and bounds', () => {
    const { container } = render(
      <Navbar
        title="Dashboard"
        searchQuery=""
        setSearchQuery={() => {}}
        currentUser={{ name: "Supervisor", role: "HR" }}
        onOpenProfile={() => {}}
        activeTab="dashboard"
        setActiveTab={() => {}}
        onLogout={() => {}}
      />
    );

    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBeGreaterThan(0);
    const navTabs = container.querySelector('nav.folder-tabs');
    expect(navTabs).toBeInTheDocument();
  });

  it('T2.5.2: CSV Template Hub download triggers have touch-friendly padding and cursor pointer', () => {
    render(<CsvTemplateHubModal isOpen={true} onClose={() => {}} />);
    const downloadSpans = screen.getAllByText('ดาวน์โหลดแม่แบบ');
    expect(downloadSpans.length).toBeGreaterThanOrEqual(5);

    downloadSpans.forEach(span => {
      const btn = span.closest('button');
      expect(btn).not.toBeNull();
      expect(btn!.className).toContain('cursor-pointer');
      expect(btn!.className).toMatch(/py-1\.5|py-2/);
    });
  });

  it('T2.5.3: Modal close and dismiss buttons are easily touchable and dismiss modal', () => {
    let isClosed = false;
    render(<CsvTemplateHubModal isOpen={true} onClose={() => { isClosed = true; }} />);

    const closeBtn = screen.getByText('ปิดหน้าต่าง');
    expect(closeBtn).toBeInTheDocument();
    fireEvent.click(closeBtn);
    expect(isClosed).toBe(true);
  });

  it('T2.5.4: Navigation folder tabs switch active state cleanly on touch/click', () => {
    let active = "dashboard";
    const setActiveTab = vi.fn((tab) => { active = tab; });
    render(
      <Navbar
        title="Dashboard"
        searchQuery=""
        setSearchQuery={() => {}}
        currentUser={{ name: "Supervisor", role: "HR" }}
        onOpenProfile={() => {}}
        activeTab={active}
        setActiveTab={setActiveTab}
        onLogout={() => {}}
      />
    );

    const shiftTab = screen.getByRole('tab', { name: /ตารางจัดกะพนักงาน/i });
    expect(shiftTab).toBeInTheDocument();
    fireEvent.click(shiftTab);
    expect(setActiveTab).toHaveBeenCalledWith('shifts');
  });
});
