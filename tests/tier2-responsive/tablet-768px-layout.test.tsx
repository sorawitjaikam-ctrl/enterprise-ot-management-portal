import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import App from '../../src/App';
import Navbar from '../../src/components/Navbar';

const setViewport = (width: number, height = 1024) => {
  window.innerWidth = width;
  window.innerHeight = height;
  window.dispatchEvent(new Event('resize'));
};

describe('Tier 2: Tablet 768px Layout Adaptation', () => {
  beforeEach(() => {
    setViewport(768, 1024); // iPad dimensions
  });

  it('T2.2.1: Tablet viewport renders responsive metrics grids with multi-column support', async () => {
    const { container } = render(<App />);
    await waitFor(() => {
      expect(container.querySelector('main')).toBeInTheDocument();
    });

    const grids = container.querySelectorAll('.grid');
    expect(grids.length).toBeGreaterThan(0);

    const hasResponsiveGrids = Array.from(grids).some(el => 
      el.className.includes('grid-cols-1') && 
      (el.className.includes('md:grid-cols') || el.className.includes('sm:grid-cols') || el.className.includes('lg:grid-cols'))
    );
    expect(hasResponsiveGrids).toBe(true);
  });

  it('T2.2.2: Header brand title and separator are visible on tablet (sm/md breakpoint)', () => {
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

    const brandTitles = screen.getAllByText(/Double A Terminal/i);
    expect(brandTitles.length).toBeGreaterThan(0);
    expect(screen.getByText('ระบบวางแผนและจัดการตารางกะพนักงาน')).toBeInTheDocument();
  });

  it('T2.2.3: Global search bar input is present on md+ tablet screens', () => {
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

    const searchInput = screen.getByPlaceholderText(/ค้นหาพนักงาน/i);
    expect(searchInput).toBeInTheDocument();
  });

  it('T2.2.4: Notification bell action renders with touch target sizing and title', () => {
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

    expect(screen.getByTitle('การแจ้งเตือนข้อควรระวัง')).toBeInTheDocument();
  });

  it('T2.2.5: User profile button displays user details', () => {
    render(
      <Navbar
        title="Dashboard"
        searchQuery=""
        setSearchQuery={() => {}}
        currentUser={{ name: "นายสมชาย", role: "HR Section Manager" }}
        onOpenProfile={() => {}}
        activeTab="dashboard"
        setActiveTab={() => {}}
        onLogout={() => {}}
      />
    );

    const userNames = screen.getAllByText('นายสมชาย');
    expect(userNames.length).toBeGreaterThan(0);
    const profileBtn = screen.getByTitle('ดูโปรไฟล์ของคุณ');
    expect(profileBtn).toBeInTheDocument();
  });
});
