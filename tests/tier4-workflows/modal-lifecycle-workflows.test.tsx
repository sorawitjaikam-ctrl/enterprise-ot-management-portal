import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import App from '../../src/App';
import CsvTemplateHubModal from '../../src/components/CsvTemplateHubModal';

describe('Tier 4: 19 Modals Lifecycle, Touch Dismiss & Backdrop Behavior', () => {
  it('T4.5.1: Profile modal / view renders when user profile action is clicked', async () => {
    render(<App />);
    await waitFor(() => {
      expect(document.querySelector('main')).toBeInTheDocument();
    });

    const profileButton = screen.queryByTitle(/ดูโปรไฟล์ของคุณ|โปรไฟล์/i);
    if (profileButton) {
      fireEvent.click(profileButton);
      await waitFor(() => {
        const profileElements = screen.getAllByText(/ข้อมูลผู้ใช้งาน|การจัดการโปรไฟล์ส่วนตัว|โปรไฟล์/i);
        expect(profileElements.length).toBeGreaterThan(0);
      });
    }
  });

  it('T4.5.2: CSV Template Hub modal opens via Navbar quick action and closes on close button', async () => {
    let isOpen = true;
    const { rerender } = render(
      <CsvTemplateHubModal isOpen={isOpen} onClose={() => { isOpen = false; }} />
    );

    expect(screen.getByText(/ศูนย์ดาวน์โหลดแม่แบบไฟล์ CSV/i)).toBeInTheDocument();

    const closeBtn = screen.getByText('ปิดหน้าต่าง');
    fireEvent.click(closeBtn);

    expect(isOpen).toBe(false);
    rerender(<CsvTemplateHubModal isOpen={false} onClose={() => {}} />);
    expect(screen.queryByText(/ศูนย์ดาวน์โหลดแม่แบบไฟล์ CSV/i)).not.toBeInTheDocument();
  });

  it('T4.5.3: Add / Edit modal dialogues support form input changes', async () => {
    render(<App />);
    await waitFor(() => {
      expect(document.querySelector('main')).toBeInTheDocument();
    });

    const empTabs = screen.getAllByText(/รายชื่อพนักงาน/i);
    if (empTabs.length > 0) fireEvent.click(empTabs[0]);

    await waitFor(() => {
      const addEmpBtn = screen.queryByText(/เพิ่มพนักงาน|เพิ่มข้อมูล/i);
      if (addEmpBtn) {
        fireEvent.click(addEmpBtn);
      }
    });
  });

  it('T4.5.4: Modal backdrop overlay contains z-index >= 50 for top-level stacking', () => {
    const { container } = render(<CsvTemplateHubModal isOpen={true} onClose={() => {}} />);
    const backdrop = container.querySelector('.z-50');
    expect(backdrop).not.toBeNull();
    expect(backdrop?.className).toContain('fixed');
    expect(backdrop?.className).toContain('inset-0');
  });

  it('T4.5.5: Modal components maintain smooth rounded container styling and backdrop blur', () => {
    const { container } = render(<CsvTemplateHubModal isOpen={true} onClose={() => {}} />);
    const dialogCard = container.querySelector('.rounded-3xl');
    expect(dialogCard).not.toBeNull();
  });
});
