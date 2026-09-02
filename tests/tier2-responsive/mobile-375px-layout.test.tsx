import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import Navbar from '../../src/components/Navbar';
import App from '../../src/App';

const setViewport = (width: number, height = 667) => {
  window.innerWidth = width;
  window.innerHeight = height;
  window.dispatchEvent(new Event('resize'));
};

describe('Tier 2: Mobile 375px Layout Adaptation', () => {
  beforeEach(() => {
    setViewport(375, 667); // iPhone SE dimensions
  });

  it('T2.1.1: Navbar renders hamburger menu button on mobile viewport', () => {
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
    expect(hamburgerBtn).toBeInTheDocument();
  });

  it('T2.1.2: Clicking hamburger opens mobile navigation drawer with navigation items', () => {
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

    // Mobile drawer should be visible with navigation tabs
    const drawer = screen.getByLabelText('เมนูหลักสำหรับอุปกรณ์เคลื่อนที่');
    expect(drawer).toBeInTheDocument();
    expect(drawer.className).toContain('translate-x-0');
    expect(screen.getByText('เมนูนำทางระบบ')).toBeInTheDocument();
    expect(screen.getAllByText(/ภาพรวม Dashboard/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/ตารางจัดกะพนักงาน/i).length).toBeGreaterThan(0);
  });

  it('T2.1.3: Navigation categories tab bar has horizontal overflow scroll container', () => {
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

    const overflowNav = container.querySelector('.overflow-x-auto');
    expect(overflowNav).not.toBeNull();
  });

  it('T2.1.4: Search bar input handles search query updates', () => {
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

  it('T2.1.5: Main application container renders with responsive spacing', async () => {
    const { container } = render(<App />);
    await waitFor(() => {
      expect(container.querySelector('main')).toBeInTheDocument();
    });
    const main = container.querySelector('main');
    expect(main).not.toBeNull();
    // Verify main element has responsive padding classes or flex-1 layout
    expect(main?.className).toContain('flex-1');
  });
});
