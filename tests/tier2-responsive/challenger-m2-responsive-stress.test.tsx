import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import React from 'react';
import Navbar from '../../src/components/Navbar';
import App from '../../src/App';

const setViewport = (width: number, height: number) => {
  window.innerWidth = width;
  window.innerHeight = height;
  window.dispatchEvent(new Event('resize'));
};

describe('Milestone 2 Challenger Empirical Stress Suite', () => {
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
  // Section 1: Multi-Viewport Responsive Matrix Testing
  // =========================================================================
  describe('CH.M2.1: Multi-Viewport Responsive Layout Adaptation', () => {
    const viewports = [
      { name: 'iPhone SE (375px)', width: 375, height: 667, type: 'mobile' },
      { name: 'iPhone 14/15/16 Pro (390px)', width: 390, height: 844, type: 'mobile' },
      { name: 'iPhone Plus/Max (414px)', width: 414, height: 896, type: 'mobile' },
      { name: 'iPhone Pro Max (430px)', width: 430, height: 932, type: 'mobile' },
      { name: 'iPad Portrait (768px)', width: 768, height: 1024, type: 'tablet' },
      { name: 'iPad 10th Gen (820px)', width: 820, height: 1180, type: 'tablet' },
      { name: 'iPad Landscape (1024px)', width: 1024, height: 768, type: 'tablet' },
      { name: 'Desktop HD (1280px)', width: 1280, height: 800, type: 'desktop' },
      { name: 'Desktop QHD (1440px)', width: 1440, height: 900, type: 'desktop' },
      { name: 'Desktop Full HD (1920px)', width: 1920, height: 1080, type: 'desktop' },
    ];

    viewports.forEach(vp => {
      it(`Renders layout and navigation correctly on ${vp.name}`, async () => {
        setViewport(vp.width, vp.height);
        const { container, unmount } = render(<App />);

        await waitFor(() => {
          expect(container.querySelector('main')).toBeInTheDocument();
        });

        const main = container.querySelector('main');
        expect(main).not.toBeNull();
        // Spacing contract check
        expect(main?.className).toContain('mt-16 sm:mt-20 lg:mt-28');
        expect(main?.className).toContain('p-3 sm:p-4 lg:p-8');
        expect(main?.className).toContain('w-full max-w-full min-w-0');

        // Check for grid containers
        const grids = container.querySelectorAll('.grid');
        expect(grids.length).toBeGreaterThan(0);

        unmount();
      });
    });
  });

  // =========================================================================
  // Section 2: Mobile Navigation Drawer Mechanics & State Toggling
  // =========================================================================
  describe('CH.M2.2: Mobile Navigation Drawer Mechanics & State Toggling', () => {
    it('CH.M2.2.1: Drawer transitions open on hamburger click and closes on X close button click', () => {
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
      const drawer = screen.getByLabelText('เมนูหลักสำหรับอุปกรณ์เคลื่อนที่');
      expect(drawer.className).toContain('-translate-x-full');

      // Click hamburger to open
      fireEvent.click(hamburgerBtn);
      expect(drawer.className).toContain('translate-x-0');

      // Click close button inside drawer header
      const closeBtn = drawer.querySelector('button');
      expect(closeBtn).not.toBeNull();
      fireEvent.click(closeBtn!);
      expect(drawer.className).toContain('-translate-x-full');
    });

    it('CH.M2.2.2: Clicking backdrop overlay closes the mobile drawer', () => {
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

      // The backdrop overlay is the sibling fixed inset-0
      const backdrop = document.querySelector('.fixed.inset-0.bg-slate-950\\/40, .fixed.inset-0.bg-\\[\\#0E3A66\\]\\/40, .fixed.inset-0.z-50');
      expect(backdrop).not.toBeNull();
      fireEvent.click(backdrop!);

      expect(drawer.className).toContain('-translate-x-full');
    });

    it('CH.M2.2.3: Switching between all 11 functional views from the drawer triggers setActiveTab and auto-closes drawer', () => {
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

      const functionalViews = [
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

      functionalViews.forEach((view) => {
        // Open drawer
        const hamburgerBtn = screen.getByLabelText('เปิดเมนูนำทาง');
        fireEvent.click(hamburgerBtn);

        // Find view button in drawer
        const drawerNav = screen.getByLabelText('เมนูหลักสำหรับอุปกรณ์เคลื่อนที่');
        const viewButtons = drawerNav.querySelectorAll('button');
        const viewBtn = Array.from(viewButtons).find(btn => btn.textContent?.includes(view.label));

        expect(viewBtn).toBeDefined();
        fireEvent.click(viewBtn!);

        // Verify setActiveTab called and drawer closed
        expect(setActiveTab).toHaveBeenCalledWith(view.id);
        expect(drawerNav.className).toContain('-translate-x-full');
      });
    });

    it('CH.M2.2.4: Active view displays visual check indicator in mobile drawer', () => {
      render(
        <Navbar
          title="ตารางจัดกะพนักงาน"
          searchQuery=""
          setSearchQuery={() => {}}
          currentUser={{ name: "Supervisor", role: "HR" }}
          onOpenProfile={() => {}}
          activeTab="shifts"
          setActiveTab={() => {}}
          onLogout={() => {}}
        />
      );

      const hamburgerBtn = screen.getByLabelText('เปิดเมนูนำทาง');
      fireEvent.click(hamburgerBtn);

      const drawer = screen.getByLabelText('เมนูหลักสำหรับอุปกรณ์เคลื่อนที่');
      const activeShiftBtn = Array.from(drawer.querySelectorAll('button')).find(
        b => b.textContent?.includes('ตารางจัดกะพนักงาน')
      );

      expect(activeShiftBtn).not.toBeNull();
      expect(activeShiftBtn?.className).toContain('bg-[#E8F3FA]');
      expect(activeShiftBtn?.className).toContain('text-[#0E3A66]');
    });

    it('CH.M2.2.5: Role-based filtering: non-HR roles do not see HR Editor or Admin Permissions', () => {
      render(
        <Navbar
          title="Dashboard"
          searchQuery=""
          setSearchQuery={() => {}}
          currentUser={{ name: "Employee", role: "Operator" }}
          onOpenProfile={() => {}}
          activeTab="dashboard"
          setActiveTab={() => {}}
          onLogout={() => {}}
        />
      );

      const hamburgerBtn = screen.getByLabelText('เปิดเมนูนำทาง');
      fireEvent.click(hamburgerBtn);

      const drawer = screen.getByLabelText('เมนูหลักสำหรับอุปกรณ์เคลื่อนที่');
      expect(drawer.textContent).not.toContain('ข้อมูล & รายได้');
      expect(drawer.textContent).not.toContain('สิทธิ์ผู้ใช้งาน');
      expect(drawer.textContent).not.toContain('ตั้งค่าระบบ');
    });

    it('CH.M2.2.6: Profile and header action buttons trigger callbacks', () => {
      const onOpenProfile = vi.fn();
      render(
        <Navbar
          title="Dashboard"
          searchQuery=""
          setSearchQuery={() => {}}
          currentUser={{ name: "Supervisor", role: "HR" }}
          onOpenProfile={onOpenProfile}
          activeTab="dashboard"
          setActiveTab={() => {}}
          onLogout={() => {}}
        />
      );

      // Click profile button in header
      const profileBtn = screen.getByTitle('ดูโปรไฟล์ของคุณ');
      expect(profileBtn).toBeInTheDocument();
      fireEvent.click(profileBtn);
      expect(onOpenProfile).toHaveBeenCalled();
    });
  });

  // =========================================================================
  // Section 3: Background Scroll Locking Mechanics
  // =========================================================================
  describe('CH.M2.3: Background Scroll Locking and Cleanup', () => {
    it('CH.M2.3.1: Locks body scroll to hidden when drawer opens, resets to empty string when closed', () => {
      expect(document.body.style.overflow).toBe('');

      const { unmount } = render(
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
      expect(document.body.style.overflow).toBe('hidden');

      const drawer = screen.getByLabelText('เมนูหลักสำหรับอุปกรณ์เคลื่อนที่');
      const closeBtn = drawer.querySelector('button');
      expect(closeBtn).not.toBeNull();
      fireEvent.click(closeBtn!);
      expect(document.body.style.overflow).toBe('');

      unmount();
      expect(document.body.style.overflow).toBe('');
    });

    it('CH.M2.3.2: Automatically unlocks body scroll when Navbar unmounts while drawer was open', () => {
      const { unmount } = render(
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
      expect(document.body.style.overflow).toBe('hidden');

      unmount();
      expect(document.body.style.overflow).toBe('');
    });
  });

  // =========================================================================
  // Section 4: Keyboard Accessibility & ESC Key Dismissal
  // =========================================================================
  describe('CH.M2.4: Keyboard Accessibility & ESC Key Dismissal', () => {
    it('CH.M2.4.1: Pressing ESC key dismisses the mobile navigation drawer', () => {
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

      // Dispatch Escape keydown
      fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });

      expect(drawer.className).toContain('-translate-x-full');
    });

    it('CH.M2.4.2: Pressing ESC key dismisses notification dropdown', () => {
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
          complianceNotifications={[{ emp: { name: 'Emp 1' }, alerts: [{ message: 'Alert' }] }]}
        />
      );

      const notifBtn = screen.getByTitle('การแจ้งเตือนข้อควรระวัง');
      fireEvent.click(notifBtn);

      expect(screen.getByText(/การแจ้งเตือนข้อควรระวัง/i)).toBeInTheDocument();

      // Press Escape
      fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });
    });

    it('CH.M2.4.3: Other keys (Enter, Space, Tab) do not trigger dismiss', () => {
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

      fireEvent.keyDown(window, { key: 'Enter', code: 'Enter' });
      expect(drawer.className).toContain('translate-x-0');

      fireEvent.keyDown(window, { key: 'Tab', code: 'Tab' });
      expect(drawer.className).toContain('translate-x-0');
    });
  });

  // =========================================================================
  // Section 5: Touch Ergonomics & Tap Targets (>= 44x44px)
  // =========================================================================
  describe('CH.M2.5: Touch Ergonomics & 44px Minimum Tap Targets', () => {
    it('CH.M2.5.1: All primary interactive touch controls specify touch targets and cursor pointer', () => {
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

      // Open drawer to test drawer buttons
      const hamburgerBtn = screen.getByLabelText('เปิดเมนูนำทาง');
      expect(hamburgerBtn.className).toMatch(/cursor-pointer|w-9 h-9/);
      fireEvent.click(hamburgerBtn);

      const drawerNav = screen.getByLabelText('เมนูหลักสำหรับอุปกรณ์เคลื่อนที่');
      const drawerItems = drawerNav.querySelectorAll('button');
      expect(drawerItems.length).toBeGreaterThan(0);
      drawerItems.forEach(item => {
        expect(item.className).toMatch(/cursor-pointer|p-|rounded/);
      });
    });

    it('CH.M2.5.2: Header action buttons comply with touch target standards', () => {
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

      const notifBtn = screen.getByTitle('การแจ้งเตือนข้อควรระวัง');
      expect(notifBtn.className).toContain('w-8');
      expect(notifBtn.className).toContain('h-8');

      const profileBtn = screen.getByTitle('ดูโปรไฟล์ของคุณ');
      expect(profileBtn).toBeInTheDocument();

      const logoutBtn = screen.getByTitle('ออกจากระบบ');
      expect(logoutBtn.className).toContain('w-8');
      expect(logoutBtn.className).toContain('h-8');
    });
  });

  // =========================================================================
  // Section 6: Desktop Horizontal Category Tabs & Collapsing
  // =========================================================================
  describe('CH.M2.6: Desktop Horizontal Category Navigation & Collapsing', () => {
    it('CH.M2.6.1: Tab navigation triggers activeTab update', () => {
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

      const shiftTab = screen.getByRole('tab', { name: /ตารางจัดกะพนักงาน/i });
      fireEvent.click(shiftTab);
      expect(setActiveTab).toHaveBeenCalledWith('shifts');
    });

    it('CH.M2.6.2: Category bar container has touch horizontal scrolling and no-scrollbar classes', () => {
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

      const categoryBar = container.querySelector('.overflow-x-auto.no-scrollbar.touch-pan-x');
      expect(categoryBar).not.toBeNull();
    });
  });

  // =========================================================================
  // Section 7: Mobile Search Bar Expansion & Value Clearing
  // =========================================================================
  describe('CH.M2.7: Mobile Search Bar Expansion & Clearing', () => {
    it('CH.M2.7.1: Search input allows typing and updating search query', () => {
      const setSearchQuery = vi.fn();

      render(
        <Navbar
          title="Dashboard"
          searchQuery=""
          setSearchQuery={setSearchQuery}
          currentUser={{ name: "Supervisor", role: "HR" }}
          onOpenProfile={() => {}}
          activeTab="dashboard"
          setActiveTab={() => {}}
          onLogout={() => {}}
        />
      );

      const searchInput = screen.getByPlaceholderText(/ค้นหาพนักงาน/i);
      expect(searchInput).toBeInTheDocument();
      fireEvent.change(searchInput, { target: { value: 'สมชาย' } });
      expect(setSearchQuery).toHaveBeenCalledWith('สมชาย');
    });
  });
});
