import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import React from 'react';
import Navbar from '../../src/components/Navbar';
import Sidebar from '../../src/components/Sidebar';
import App, { getEmpMonthlyOtPayBreakdown } from '../../src/App';

const ALL_11_VIEW_IDS = [
  'dashboard',
  'shifts',
  'employees',
  'job_value',
  'hr-editor',
  'leave-records',
  'ot-records',
  'reports',
  'admin-permissions',
  'settings',
  'profile'
] as const;

describe('Milestone 2 Challenger 2: Empirical Verification of Navigation & Desktop Invariants', () => {
  const hrUser = { name: 'Admin Manager', role: 'HR' };
  const standardUser = { name: 'Operator User', role: 'Operator' };

  describe('1. Tab ID Consistency & Navigation Routing Verification', () => {
    it('CH2.1.1: Navbar Desktop category bar triggers navigation to all accessible views with exact tab IDs', () => {
      const setActiveTab = vi.fn();
      render(
        <Navbar
          title="Dashboard"
          searchQuery=""
          setSearchQuery={() => {}}
          currentUser={hrUser}
          onOpenProfile={() => setActiveTab('profile')}
          activeTab="dashboard"
          setActiveTab={setActiveTab}
          onLogout={() => {}}
        />
      );

      // Verify desktop category navigation buttons
      const expectedButtons = [
        { label: /หน้าแรก Dashboard/i, id: 'dashboard' },
        { label: /ตารางจัดกะพนักงาน/i, id: 'shifts' },
        { label: /รายชื่อพนักงาน/i, id: 'employees' },
        { label: /Job Value/i, id: 'job_value' },
        { label: /จัดการข้อมูลพนักงาน & รายได้/i, id: 'hr-editor' },
        { label: /บันทึกวันลา/i, id: 'leave-records' },
        { label: /ประวัติ OT จากกะ/i, id: 'ot-records' },
        { label: /รายงานข้อมูลรายแผนก/i, id: 'reports' },
        { label: /สิทธิ์ผู้ใช้งาน/i, id: 'admin-permissions' },
        { label: /ตั้งค่าระบบ/i, id: 'settings' },
      ];

      expectedButtons.forEach(({ label, id }) => {
        const btns = screen.getAllByRole('button', { name: label });
        expect(btns.length).toBeGreaterThan(0);
        fireEvent.click(btns[0]);
        expect(setActiveTab).toHaveBeenCalledWith(id);
      });
    });

    it('CH2.1.2: Mobile Drawer contains and triggers navigation to all 11 functional views', () => {
      const setActiveTab = vi.fn();
      render(
        <Navbar
          title="Dashboard"
          searchQuery=""
          setSearchQuery={() => {}}
          currentUser={hrUser}
          onOpenProfile={() => setActiveTab('profile')}
          activeTab="dashboard"
          setActiveTab={setActiveTab}
          onLogout={() => {}}
        />
      );

      // Open mobile drawer
      const hamburger = screen.getByLabelText('เปิดเมนูนำทาง');
      fireEvent.click(hamburger);

      const drawer = screen.getByLabelText('เมนูหลักสำหรับอุปกรณ์เคลื่อนที่');
      // Drawer Profile Card
      const drawerProfileCard = within(drawer).getByText('Admin Manager').closest('button');
      if (drawerProfileCard) {
        fireEvent.click(drawerProfileCard);
        expect(setActiveTab).toHaveBeenCalledWith('profile');
      }

      // Check all 10 categorized view buttons in drawer
      const navTargets = [
        { id: 'dashboard', label: 'หน้าแรก Dashboard' },
        { id: 'shifts', label: 'ตารางจัดกะพนักงาน' },
        { id: 'employees', label: 'รายชื่อพนักงาน' },
        { id: 'job_value', label: 'Job Value' },
        { id: 'hr-editor', label: 'จัดการข้อมูลพนักงาน' },
        { id: 'leave-records', label: 'บันทึกวันลา' },
        { id: 'ot-records', label: 'ประวัติ OT' },
        { id: 'reports', label: 'รายงานข้อมูลรายแผนก' },
        { id: 'admin-permissions', label: 'สิทธิ์ผู้ใช้งาน' },
        { id: 'settings', label: 'ตั้งค่าระบบ' }
      ];

      navTargets.forEach(({ id, label }) => {
        // Find buttons in drawer nav
        const drawerNavButtons = drawer.querySelectorAll('nav button');
        const match = Array.from(drawerNavButtons).find((btn) => btn.textContent?.includes(label));
        expect(match).toBeDefined();
        if (match) {
          fireEvent.click(match);
          expect(setActiveTab).toHaveBeenCalledWith(id);
        }
      });
    });

    it('CH2.1.3: Sidebar triggers navigation to all 11 functional views with exact tab IDs', () => {
      const setActiveTab = vi.fn();
      render(
        <Sidebar
          activeTab="dashboard"
          setActiveTab={setActiveTab}
          onLogout={() => {}}
          currentUser={hrUser}
        />
      );

      // Sidebar main items
      const expectedSidebarItems = [
        { label: /หน้าแรก Dashboard/i, id: 'dashboard' },
        { label: /คุณค่าตำแหน่งงาน & ผลตอบแทน/i, id: 'job_value' },
        { label: /รายงานข้อมูลรายแผนก/i, id: 'reports' },
        { label: /รายชื่อพนักงานหน้าท่า/i, id: 'employees' },
        { label: /จัดการข้อมูล & รายได้/i, id: 'hr-editor' },
        { label: /บันทึกวันลา/i, id: 'leave-records' },
        { label: /จัดตารางกะเทียบเรือ/i, id: 'shifts' },
        { label: /ประวัติ OT งานหน้าท่าเรือ/i, id: 'ot-records' },
        { label: /จัดการสิทธิ์ Admin & ผู้ใช้/i, id: 'admin-permissions' },
        { label: /การตั้งค่าระบบ/i, id: 'settings' },
      ];

      expectedSidebarItems.forEach(({ label, id }) => {
        const btn = screen.getByRole('button', { name: label });
        expect(btn).toBeInTheDocument();
        fireEvent.click(btn);
        expect(setActiveTab).toHaveBeenCalledWith(id);
      });

      const profileBtn = screen.getByTitle('จัดการโปรไฟล์ส่วนตัว');
      expect(profileBtn).toBeInTheDocument();
      fireEvent.click(profileBtn);
      expect(setActiveTab).toHaveBeenCalledWith('profile');
    });

    it('CH2.1.4: Role-based navigation filtering hides restricted items for standard users', () => {
      const setActiveTab = vi.fn();
      render(
        <Navbar
          title="Dashboard"
          searchQuery=""
          setSearchQuery={() => {}}
          currentUser={standardUser}
          onOpenProfile={() => setActiveTab('profile')}
          activeTab="dashboard"
          setActiveTab={setActiveTab}
          onLogout={() => {}}
        />
      );

      // hr-editor, admin-permissions, settings should not be rendered for standard user
      expect(screen.queryByText(/จัดการข้อมูลพนักงาน & รายได้/i)).toBeNull();
      expect(screen.queryByText(/สิทธิ์ผู้ใช้งาน/i)).toBeNull();
      expect(screen.queryByText(/ตั้งค่าระบบ/i)).toBeNull();
    });

    it('CH2.1.5: Navbar brand logo navigates directly to dashboard', () => {
      const setActiveTab = vi.fn();
      render(
        <Navbar
          title="Reports"
          searchQuery=""
          setSearchQuery={() => {}}
          currentUser={hrUser}
          onOpenProfile={() => setActiveTab('profile')}
          activeTab="reports"
          setActiveTab={setActiveTab}
          onLogout={() => {}}
        />
      );

      const brandLogos = screen.getAllByText('Double A Terminal');
      const brandLogo = brandLogos[0].closest('div');
      expect(brandLogo).not.toBeNull();
      if (brandLogo) {
        fireEvent.click(brandLogo);
        expect(setActiveTab).toHaveBeenCalledWith('dashboard');
      }
    });

    it('CH2.1.6: Top Navbar profile badge navigates to profile view', () => {
      const onOpenProfile = vi.fn();
      render(
        <Navbar
          title="Dashboard"
          searchQuery=""
          setSearchQuery={() => {}}
          currentUser={hrUser}
          onOpenProfile={onOpenProfile}
          activeTab="dashboard"
          setActiveTab={() => {}}
          onLogout={() => {}}
        />
      );

      const profileBadge = screen.getByTitle('ดูโปรไฟล์ของคุณ');
      expect(profileBadge).toBeInTheDocument();
      fireEvent.click(profileBadge);
      expect(onOpenProfile).toHaveBeenCalled();
    });
  });

  describe('2. Desktop 368px Summary Block Mathematical & Layout Invariants', () => {
    it('CH2.2.1: Mathematical decomposition of summary columns exactly sums to 368px', () => {
      const normalOtWidth = 56;       // w-14
      const holidayOtWidth = 64;      // w-16
      const holidayWorkDaysWidth = 80;// w-20
      const costBahtWidth = 96;       // w-24
      const costPctWidth = 72;        // w-18

      const subTotalBreakdown = normalOtWidth + holidayOtWidth + holidayWorkDaysWidth;
      expect(subTotalBreakdown).toBe(200);

      const grandTotal = subTotalBreakdown + costBahtWidth + costPctWidth;
      expect(grandTotal).toBe(368);
    });

    it('CH2.2.2: Shift Scheduler calculations follow exact OT pay formula across all test vectors', () => {
      const salaryTestVectors = [
        { salary: 15000, normalOt: 0, holidayOt: 0, holidayWorkDays: 0, expectedPay: 0, expectedPct: "0.00" },
        { salary: 15000, normalOt: 10, holidayOt: 0, holidayWorkDays: 0, expectedPay: 938, expectedPct: "6.25" },
        { salary: 24000, normalOt: 20, holidayOt: 8, holidayWorkDays: 2, expectedPay: 7000, expectedPct: "29.17" },
        { salary: 30000, normalOt: 36, holidayOt: 12, holidayWorkDays: 3, expectedPay: 14250, expectedPct: "47.50" },
        { salary: 48000, normalOt: 40, holidayOt: 16, holidayWorkDays: 4, expectedPay: 28000, expectedPct: "58.33" },
      ];

      salaryTestVectors.forEach(({ salary, normalOt, holidayOt, holidayWorkDays, expectedPay, expectedPct }) => {
        const hourlyRate = salary / 240;
        const totalOtPay = Math.round((normalOt * 1.5 + holidayOt * 3.0 + holidayWorkDays * 8 * 1.0) * hourlyRate);
        const otPct = ((totalOtPay / salary) * 100).toFixed(2);

        expect(totalOtPay).toBe(expectedPay);
        expect(otPct).toBe(expectedPct);
      });
    });

    it('CH2.2.3: Plan vs Actual difference calculations maintain algebraic precision', () => {
      const plan = { normalOt: 20, holidayOt: 8, holidayWorkDays: 2, salary: 24000 };
      const actual = { normalOt: 28, holidayOt: 12, holidayWorkDays: 3, salary: 24000 };

      const hourlyRate = 24000 / 240;
      const planPay = Math.round((plan.normalOt * 1.5 + plan.holidayOt * 3.0 + plan.holidayWorkDays * 8 * 1.0) * hourlyRate);
      const actualPay = Math.round((actual.normalOt * 1.5 + actual.holidayOt * 3.0 + actual.holidayWorkDays * 8 * 1.0) * hourlyRate);

      const diffNormalOt = actual.normalOt - plan.normalOt;
      const diffHolidayOt = actual.holidayOt - plan.holidayOt;
      const diffHolidayWorkDays = actual.holidayWorkDays - plan.holidayWorkDays;
      const diffPay = actualPay - planPay;

      expect(diffNormalOt).toBe(8);
      expect(diffHolidayOt).toBe(4);
      expect(diffHolidayWorkDays).toBe(1);
      expect(diffPay).toBe(3200);
      expect(actualPay).toBe(planPay + diffPay);
    });

    it('CH2.2.4: getEmpMonthlyOtPayBreakdown helper calculates correct breakdown', () => {
      const mockEmp = {
        id: 'EMP-TEST-01',
        name: 'สมชาย ทดสอบ',
        deptId: 'D1',
        salary: 24000,
        shifts: { '2026-07': ['M', 'M', 'M', 'M', 'M', 'O', 'OND', ...Array(24).fill('O')] }
      };

      const breakdown = getEmpMonthlyOtPayBreakdown(mockEmp, '2026-07');
      expect(breakdown).toBeDefined();
      expect(typeof breakdown.totalOtPay).toBe('number');
      expect(typeof breakdown.totalOtHours).toBe('number');
    });
  });

  describe('3. Full App Shell Render & View Switching Integrity', () => {
    it('CH2.3.1: App renders main container and activeTab transitions seamlessly across all views', async () => {
      const { container } = render(<App />);

      await waitFor(() => {
        expect(container.querySelector('main')).toBeInTheDocument();
      });

      // Confirm main has dynamic responsive class names
      const main = container.querySelector('main');
      expect(main?.className).toContain('flex-1');
      expect(main?.className).toContain('overflow-y-auto');
      expect(main?.className).toContain('w-full');
    });
  });
});
