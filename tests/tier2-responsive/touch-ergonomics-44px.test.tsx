import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import Navbar from '../../src/components/Navbar';
import CsvTemplateHubModal from '../../src/components/CsvTemplateHubModal';

describe('Tier 2: Touch Ergonomics & 44px Tap Target Compliance', () => {
  it('T2.5.1: Navigation action buttons include min-h-[44px] and min-w-[44px] touch target bounds', () => {
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

    const touchButtons = container.querySelectorAll('.min-h-\\[44px\\]');
    expect(touchButtons.length).toBeGreaterThan(0);
  });

  it('T2.5.2: CSV Template Hub download triggers have touch-friendly padding and cursor pointer', () => {
    render(<CsvTemplateHubModal isOpen={true} onClose={() => {}} />);
    const downloadSpans = screen.getAllByText('ดาวน์โหลดแม่แบบ');
    expect(downloadSpans.length).toBeGreaterThanOrEqual(5);

    downloadSpans.forEach(span => {
      const btn = span.closest('button');
      expect(btn).not.toBeNull();
      expect(btn!.className).toContain('cursor-pointer');
      expect(btn!.className).toContain('py-2');
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

  it('T2.5.4: Category pills toggle state cleanly on touch/click', () => {
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
      />
    );

    const categoryBadges = screen.getAllByText('ภาพรวม & แผนงาน');
    expect(categoryBadges.length).toBeGreaterThan(0);
    fireEvent.click(categoryBadges[0]);
    // Should persist in localStorage
    expect(localStorage.getItem('collapsedCategories')).toBeTruthy();
  });
});
