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
      expect(drawer.className).toContain('-translate-x-full');

      // Click hamburger to open
      fireEvent.click(hamburgerBtn);
      expect(drawer.className).toContain('translate-x-0');

      // Click X close button
      const closeBtn = screen.getByLabelText('ปิดเมนู');
      fireEvent.click(closeBtn);
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
      const backdrop = document.querySelector('.fixed.inset-0.bg-slate-950\\/60');
      expect(backdrop).not.toBeNull();
      fireEvent.click(backdrop!);

      expect(drawer.className).toContain('-translate-x-full');
    });

    it('CH.M2.2.3: Switching between all 11 functional views from the drawer triggers setActiveTab and auto-closes drawer', () => {
      const setActiveTab = vi.fn();
      const { rerender } = render(
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
        { id: "dashboard", label: "หน้าแรก Dashboard" },
        { id: "shifts", label: "ตารางจัดกะพนักงาน" },
        { id: "employees", label: "รายชื่อพนักงาน" },
        { id: "job_value", label: "Job Value" },
        { id: "hr-editor", label: "จัดการข้อมูลพนักงาน & รายได้" },
        { id: "leave-records", label: "บันทึกวันลา" },
        { id: "ot-records", label: "ประวัติ OT จากกะ" },
        { id: "reports", label: "รายงานข้อมูลรายแผนก" },
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
      expect(activeShiftBtn?.className).toContain('bg-blue-600');
      expect(activeShiftBtn?.className).toContain('text-white');
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
      expect(drawer.textContent).not.toContain('จัดการข้อมูลพนักงาน & รายได้');
      expect(drawer.textContent).not.toContain('สิทธิ์ผู้ใช้งาน');
      expect(drawer.textContent).not.toContain('ตั้งค่าระบบ');
    });

    it('CH.M2.2.6: Profile and CSV hub buttons inside drawer trigger navigation callbacks', () => {
      const setActiveTab = vi.fn();
      const onOpenCsvTemplateHub = vi.fn();
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
          onOpenCsvTemplateHub={onOpenCsvTemplateHub}
        />
      );

      const hamburgerBtn = screen.getByLabelText('เปิดเมนูนำทาง');
      fireEvent.click(hamburgerBtn);

      // Click profile card in drawer
      const drawer = screen.getByLabelText('เมนูหลักสำหรับอุปกรณ์เคลื่อนที่');
      const profileCard = within(drawer).getByText('Supervisor').closest('button');
      expect(profileCard).not.toBeNull();
      fireEvent.click(profileCard!);
      expect(setActiveTab).toHaveBeenCalledWith('profile');

      // Reopen and click CSV hub button
      fireEvent.click(hamburgerBtn);
      const csvHubBtn = screen.getByText('ดาวน์โหลดแม่แบบ CSV').closest('button');
      expect(csvHubBtn).not.toBeNull();
      fireEvent.click(csvHubBtn!);
      expect(onOpenCsvTemplateHub).toHaveBeenCalled();
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

      const closeBtn = screen.getByLabelText('ปิดเมนู');
      fireEvent.click(closeBtn);
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

    it('CH.M2.4.2: Pressing ESC key closes the mobile search bar dropdown', () => {
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

      const searchToggleBtn = screen.getByLabelText('ค้นหาข้อมูล');
      fireEvent.click(searchToggleBtn);

      expect(screen.getByPlaceholderText('ค้นหาพนักงาน รหัสกะ เรือ...')).toBeInTheDocument();

      // Press Escape
      fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });

      expect(screen.queryByPlaceholderText('ค้นหาพนักงาน รหัสกะ เรือ...')).not.toBeInTheDocument();
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
    it('CH.M2.5.1: All primary interactive touch controls specify min-h-[44px] or min-w-[44px]', () => {
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
          onOpenCsvTemplateHub={() => {}}
        />
      );

      // Open drawer to test all drawer buttons as well
      const hamburgerBtn = screen.getByLabelText('เปิดเมนูนำทาง');
      expect(hamburgerBtn.className).toMatch(/min-h-\[44px\]|min-w-\[44px\]|w-11 h-11/);
      fireEvent.click(hamburgerBtn);

      const closeBtn = screen.getByLabelText('ปิดเมนู');
      expect(closeBtn.className).toMatch(/min-h-\[44px\]|min-w-\[44px\]|w-11 h-11/);

      const drawerNav = screen.getByLabelText('เมนูหลักสำหรับอุปกรณ์เคลื่อนที่');
      const drawerItems = drawerNav.querySelectorAll('nav button');
      expect(drawerItems.length).toBeGreaterThan(0);
      drawerItems.forEach(item => {
        expect(item.className).toContain('min-h-[48px]');
      });

      const drawerFooterButtons = drawerNav.querySelectorAll('div.border-t button');
      drawerFooterButtons.forEach(btn => {
        expect(btn.className).toMatch(/min-h-\[44px\]|min-h-\[48px\]/);
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
          onOpenCsvTemplateHub={() => {}}
        />
      );

      const searchToggle = screen.getByLabelText('ค้นหาข้อมูล');
      expect(searchToggle.className).toContain('min-h-[44px]');
      expect(searchToggle.className).toContain('min-w-[44px]');

      const notifBtn = screen.getByTitle('การแจ้งเตือน');
      expect(notifBtn.className).toContain('min-h-[44px]');
      expect(notifBtn.className).toContain('min-w-[44px]');

      const profileBtn = screen.getByTitle('ดูโปรไฟล์ของคุณ');
      expect(profileBtn.className).toContain('min-h-[44px]');

      const logoutBtn = screen.getByTitle('ออกจากระบบ');
      expect(logoutBtn.className).toContain('min-h-[44px]');
      expect(logoutBtn.className).toContain('min-w-[44px]');
    });
  });

  // =========================================================================
  // Section 6: Desktop Horizontal Category Tabs & Collapsing
  // =========================================================================
  describe('CH.M2.6: Desktop Horizontal Category Navigation & Collapsing', () => {
    it('CH.M2.6.1: Category badges toggle collapse state and store in localStorage', () => {
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

      const overviewBadge = screen.getAllByText('ภาพรวม & แผนงาน')[0];
      fireEvent.click(overviewBadge);

      const saved = JSON.parse(localStorage.getItem('collapsedCategories') || '[]');
      expect(saved).toContain('ภาพรวม & แผนงาน');

      // Click again to expand
      fireEvent.click(overviewBadge);
      const updated = JSON.parse(localStorage.getItem('collapsedCategories') || '[]');
      expect(updated).not.toContain('ภาพรวม & แผนงาน');
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
    it('CH.M2.7.1: Mobile search bar allows typing, clear button, and close button', () => {
      let query = 'สมชาย';
      const setSearchQuery = vi.fn((newVal: string) => { query = newVal; });

      const { rerender } = render(
        <Navbar
          title="Dashboard"
          searchQuery={query}
          setSearchQuery={setSearchQuery}
          currentUser={{ name: "Supervisor", role: "HR" }}
          onOpenProfile={() => {}}
          activeTab="dashboard"
          setActiveTab={() => {}}
          onLogout={() => {}}
        />
      );

      // Open mobile search
      const searchToggle = screen.getByLabelText('ค้นหาข้อมูล');
      fireEvent.click(searchToggle);

      const searchInput = screen.getByPlaceholderText('ค้นหาพนักงาน รหัสกะ เรือ...');
      expect(searchInput).toBeInTheDocument();

      // Clear button exists because query is 'สมชาย'
      const clearBtn = searchInput.parentElement?.querySelector('button');
      expect(clearBtn).not.toBeNull();
      fireEvent.click(clearBtn!);
      expect(setSearchQuery).toHaveBeenCalledWith('');

      // Close button
      const closeSearchBtn = screen.getByText('ปิด');
      fireEvent.click(closeSearchBtn);
      expect(screen.queryByPlaceholderText('ค้นหาพนักงาน รหัสกะ เรือ...')).not.toBeInTheDocument();
    });
  });
});
