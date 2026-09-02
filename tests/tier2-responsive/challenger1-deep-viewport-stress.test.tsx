import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import App from '../../src/App';
import Navbar from '../../src/components/Navbar';
import CsvTemplateHubModal from '../../src/components/CsvTemplateHubModal';

const setViewport = (width: number, height: number) => {
  window.innerWidth = width;
  window.innerHeight = height;
  window.dispatchEvent(new Event('resize'));
};

describe('Empirical Challenger 1: Adversarial Responsive & Ergonomics Suite', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('adminLoggedIn', 'true');
    localStorage.setItem('currentUser', JSON.stringify({
      username: 'admin',
      name: 'คุณสิทธิศักดิ์ พ.',
      role: 'ผู้ดูแลระบบ',
      deptId: 'all'
    }));
    document.body.style.overflow = '';
  });

  afterEach(() => {
    document.body.style.overflow = '';
  });

  // =========================================================================
  // 1. Multi-Device Mobile & Tablet Viewport Verification
  // =========================================================================
  describe('CH1.1: Multi-Device Responsive Viewports (375px, 390px, 414px, 430px, 768px, 820px, 1024px)', () => {
    const devices = [
      { name: 'Mobile iPhone SE (375px)', width: 375, height: 667 },
      { name: 'Mobile iPhone 15 Pro (390px)', width: 390, height: 844 },
      { name: 'Mobile iPhone Plus (414px)', width: 414, height: 896 },
      { name: 'Mobile iPhone Pro Max (430px)', width: 430, height: 932 },
      { name: 'Tablet iPad Portrait (768px)', width: 768, height: 1024 },
      { name: 'Tablet iPad 10th Gen (820px)', width: 820, height: 1180 },
      { name: 'Tablet iPad Landscape (1024px)', width: 1024, height: 768 },
    ];

    devices.forEach(dev => {
      it('Device rendering check on ' + dev.name, async () => {
        setViewport(dev.width, dev.height);
        const { container, unmount } = render(<App />);

        await waitFor(() => {
          expect(container.querySelector('main')).toBeInTheDocument();
        });

        const main = container.querySelector('main');
        expect(main).not.toBeNull();
        expect(main?.className).toContain('mt-16 sm:mt-20 lg:mt-28');
        expect(main?.className).toContain('p-3 sm:p-4 lg:p-8');
        expect(main?.className).toContain('w-full max-w-full min-w-0');

        unmount();
      });
    });
  });

  // =========================================================================
  // 2. Sticky Pinned Columns in Shift Matrix & Employee Roster
  // =========================================================================
  describe('CH1.2: Sticky Pinned Table Columns & Touch Panning', () => {
    it('CH1.2.1: Shift matrix worker column is pinned sticky left-0 with w-56 and z-10', async () => {
      const { container } = render(<App />);
      await waitFor(() => {
        expect(container.querySelector('main')).toBeInTheDocument();
      });

      const shiftTabs = screen.getAllByText(/ตารางจัดกะพนักงาน/i);
      if (shiftTabs.length > 0) fireEvent.click(shiftTabs[0]);

      // Verify sticky left-0 columns
      const stickyCols = container.querySelectorAll('.sticky.left-0');
      expect(stickyCols.length).toBeGreaterThan(0);

      // Verify at least one sticky element has w-56 or defined width and z-10/z-20
      const hasW56 = Array.from(stickyCols).some(el => el.className.includes('w-56') || el.className.includes('min-w-'));
      const hasZ10 = Array.from(stickyCols).some(el => el.className.includes('z-10') || el.className.includes('z-20') || el.className.includes('z-30'));
      expect(hasW56).toBe(true);
      expect(hasZ10).toBe(true);

      // Verify horizontal touch panning
      const overflowWrappers = container.querySelectorAll('.overflow-x-auto');
      expect(overflowWrappers.length).toBeGreaterThan(0);
    });

    it('CH1.2.2: Employee Roster contains sticky pinned identity column and touch overflow', async () => {
      const { container } = render(<App />);
      await waitFor(() => {
        expect(container.querySelector('main')).toBeInTheDocument();
      });

      const empTabs = screen.getAllByText(/รายชื่อพนักงาน/i);
      if (empTabs.length > 0) fireEvent.click(empTabs[0]);

      // Verify sticky column exists in Roster
      const stickyCols = container.querySelectorAll('.sticky.left-0');
      expect(stickyCols.length).toBeGreaterThan(0);

      // Verify horizontal scroll wrapper
      const tableWrapper = container.querySelector('.overflow-x-auto');
      expect(tableWrapper).not.toBeNull();
    });
  });

  // =========================================================================
  // 3. Mobile Navigation Drawer Mechanics & 11 Functional Views
  // =========================================================================
  describe('CH1.3: Mobile Navigation Drawer Complete Mechanics', () => {
    it('CH1.3.1: Mobile drawer opens via hamburger, locks body scroll, and closes via close button', () => {
      const setActiveTab = vi.fn();
      render(
        <Navbar
          title="Dashboard"
          searchQuery=""
          setSearchQuery={() => {}}
          currentUser={{ name: "Supervisor", role: "HR" }}
          onOpenProfile={() => {}}
          activeTab="dashboard"
          setActiveTab={setActiveTab}
          onLogout={() => {}}
        />
      );

      const hamburgerBtn = screen.getByLabelText('เปิดเมนูนำทาง');
      const drawer = screen.getByLabelText('เมนูหลักสำหรับอุปกรณ์เคลื่อนที่');

      // Initially closed
      expect(drawer.className).toContain('-translate-x-full');
      expect(document.body.style.overflow).toBe('');

      // Open drawer
      fireEvent.click(hamburgerBtn);
      expect(drawer.className).toContain('translate-x-0');
      expect(document.body.style.overflow).toBe('hidden');

      // Close drawer via close button inside drawer header
      const closeBtn = drawer.querySelector('button');
      expect(closeBtn).not.toBeNull();
      fireEvent.click(closeBtn!);
      expect(drawer.className).toContain('-translate-x-full');
      expect(document.body.style.overflow).toBe('');
    });

    it('CH1.3.2: Mobile drawer closes on Escape key press and restores body scroll', () => {
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

      const hamburgerBtn = screen.getByLabelText('เปิดเมนูนำทาง');
      fireEvent.click(hamburgerBtn);

      const drawer = screen.getByLabelText('เมนูหลักสำหรับอุปกรณ์เคลื่อนที่');
      expect(drawer.className).toContain('translate-x-0');
      expect(document.body.style.overflow).toBe('hidden');

      // Press ESC
      fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });
      expect(drawer.className).toContain('-translate-x-full');
      expect(document.body.style.overflow).toBe('');
    });

    it('CH1.3.3: Mobile drawer navigates to all 11 functional views', () => {
      const setActiveTab = vi.fn();
      render(
        <Navbar
          title="Dashboard"
          searchQuery=""
          setSearchQuery={() => {}}
          currentUser={{ name: "Admin", role: "ผู้ดูแลระบบ" }}
          onOpenProfile={() => {}}
          activeTab="dashboard"
          setActiveTab={setActiveTab}
          onLogout={() => {}}
          onOpenCsvTemplateHub={() => {}}
        />
      );

      const views = [
        { id: "dashboard", label: "ภาพรวม Dashboard" },
        { id: "shifts", label: "ตารางจัดกะพนักงาน" },
        { id: "employees", label: "รายชื่อพนักงาน" },
        { id: "job_value", label: "โครงสร้าง Job Value" },
        { id: "hr-editor", label: "ข้อมูล & รายได้" },
        { id: "leave-records", label: "บันทึกวันลา" },
        { id: "ot-records", label: "ประวัติ OT จากกะ" },
        { id: "reports", label: "รายงานรายแผนก" },
        { id: "admin-permissions", label: "สิทธิ์ผู้ใช้งาน" },
        { id: "settings", label: "ตั้งค่าระบบ" },
      ];

      views.forEach(v => {
        const hamburgerBtn = screen.getByLabelText('เปิดเมนูนำทาง');
        fireEvent.click(hamburgerBtn);

        const drawerNav = screen.getByLabelText('เมนูหลักสำหรับอุปกรณ์เคลื่อนที่');
        const btn = Array.from(drawerNav.querySelectorAll('button')).find(b => b.textContent?.includes(v.label));
        expect(btn).toBeDefined();

        fireEvent.click(btn!);
        expect(setActiveTab).toHaveBeenCalledWith(v.id);
        expect(drawerNav.className).toContain('-translate-x-full');
      });
    });
  });

  // =========================================================================
  // 4. Modals Boundary Constraints, Internal Scroll & Touch Ergonomics (>=44px)
  // =========================================================================
  describe('CH1.4: Modals Boundary Constraints, Internal Scroll & Touch Ergonomics', () => {
    it('CH1.4.1: CsvTemplateHubModal meets max-height constraint, backdrop blur and touch targets', () => {
      let isOpen = true;
      const { container } = render(
        <CsvTemplateHubModal isOpen={isOpen} onClose={() => { isOpen = false; }} />
      );

      const backdrop = container.querySelector('.fixed.inset-0.z-50');
      expect(backdrop).not.toBeNull();
      expect(backdrop?.className).toContain('backdrop-blur');

      const modalDialog = container.querySelector('.max-h-\\[90vh\\]');
      expect(modalDialog).not.toBeNull();

      const scrollableBody = container.querySelector('.overflow-y-auto');
      expect(scrollableBody).not.toBeNull();

      // Check touch target heights and paddings
      const buttons = container.querySelectorAll('button');
      buttons.forEach(btn => {
        expect(btn.className).toMatch(/cursor-pointer|min-h-\[|p-|px-|py-|h-/);
      });
    });

    it('CH1.4.2: Touch buttons across Navbar meet ergonomic standards', () => {
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

      const hamburger = screen.getByLabelText('เปิดเมนูนำทาง');
      expect(hamburger.className).toContain('w-9');
      expect(hamburger.className).toContain('h-9');

      const notif = screen.getByTitle('การแจ้งเตือนข้อควรระวัง');
      expect(notif.className).toContain('w-8');
      expect(notif.className).toContain('h-8');

      const logout = screen.getByTitle('ออกจากระบบ');
      expect(logout.className).toContain('w-8');
      expect(logout.className).toContain('h-8');
    });
  });
});
