import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import Navbar, { isStrictHrOrAdmin } from "../../src/components/Navbar";
import Sidebar from "../../src/components/Sidebar";
import DataLineageHubView from "../../src/components/DataLineageHubView";

describe("JV-Only Access Mode & Data Lineage Hub Verification", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("correctly identifies HR and Admin roles in isStrictHrOrAdmin", () => {
    expect(isStrictHrOrAdmin("HR")).toBe(true);
    expect(isStrictHrOrAdmin("HR Section Manager")).toBe(true);
    expect(isStrictHrOrAdmin("ผู้ดูแลระบบ")).toBe(true);
    expect(isStrictHrOrAdmin("Admin")).toBe(true);
    expect(isStrictHrOrAdmin("Co-admin")).toBe(true);
    expect(isStrictHrOrAdmin("Section Manager")).toBe(false);
    expect(isStrictHrOrAdmin("Operation Dir")).toBe(false);
    expect(isStrictHrOrAdmin("Operator")).toBe(false);
    expect(isStrictHrOrAdmin("User")).toBe(false);
  });

  it("renders non-JV tabs as dimmed with 'Coming Soon' badge for non-HR/Admin users and prevents navigating away from job_value", () => {
    const setActiveTab = vi.fn();
    render(
      <Navbar
        title="Job Value"
        searchQuery=""
        setSearchQuery={() => {}}
        currentUser={{ name: "Section Manager INTER2", role: "Section Manager" }}
        onOpenProfile={() => {}}
        activeTab="job_value"
        setActiveTab={setActiveTab}
        onLogout={() => {}}
        restrictToJvOnly={true}
      />
    );

    const comingSoonBadges = screen.getAllByText("Coming Soon");
    expect(comingSoonBadges.length).toBeGreaterThanOrEqual(7);

    // Clicking a locked tab redirects/stays on job_value
    const dashboardTabs = screen.getAllByRole("tab", { name: /ภาพรวม Dashboard/i });
    fireEvent.click(dashboardTabs[0]);
    expect(setActiveTab).toHaveBeenCalledWith("job_value");

    // Clicking Job Value tab works normally
    const jvTabs = screen.getAllByRole("tab", { name: /โครงสร้าง Job Value/i });
    fireEvent.click(jvTabs[0]);
    expect(setActiveTab).toHaveBeenCalledWith("job_value");
  });

  it("allows HR and Admin users full access to all tabs without Coming Soon badges even when restrictToJvOnly is true", () => {
    const setActiveTab = vi.fn();
    render(
      <Navbar
        title="Dashboard"
        searchQuery=""
        setSearchQuery={() => {}}
        currentUser={{ name: "HR Manager", role: "HR" }}
        onOpenProfile={() => {}}
        activeTab="dashboard"
        setActiveTab={setActiveTab}
        onLogout={() => {}}
        restrictToJvOnly={true}
      />
    );

    expect(screen.queryByText("Coming Soon")).toBeNull();
    const shiftsTabs = screen.getAllByRole("tab", { name: /ตารางจัดกะพนักงาน/i });
    fireEvent.click(shiftsTabs[0]);
    expect(setActiveTab).toHaveBeenCalledWith("shifts");
  });

  it("renders Sidebar with Coming Soon badges for non-HR/Admin users when restrictToJvOnly is true", () => {
    const setActiveTab = vi.fn();
    render(
      <Sidebar
        activeTab="job_value"
        setActiveTab={setActiveTab}
        onLogout={() => {}}
        currentUser={{ name: "Operator", role: "User" }}
        restrictToJvOnly={true}
      />
    );

    expect(screen.getAllByText("Coming Soon").length).toBeGreaterThan(0);
    const reportBtn = screen.getByRole("button", { name: /รายงานข้อมูลรายแผนก/i });
    fireEvent.click(reportBtn);
    expect(setActiveTab).toHaveBeenCalledWith("job_value");
  });

  it("renders DataLineageHubView with all 7 core data domains, sync rule toggles, and 1-click reconciliation", () => {
    const onReconcileAll = vi.fn();
    const onToggleRestrictToJvOnly = vi.fn();
    const mockState: any = {
      departments: [
        { id: "inter2", name: "INTER 2", nameTh: "แผนก INTER 2", manager: "Mgr", managerRole: "SM", managerImg: "", employeesCount: 1, otHours: 4, budgetUsed: 1200, budgetUsedChange: 0, budgetUsedChangePct: 0, budgetUtilization: 10, status: "On Track", icon: "ship" }
      ],
      employees: [
        {
          id: "EMP-101",
          name: "วสันต์ คุ้มคำ",
          deptId: "INTER 2",
          role: "O&M Specialist",
          targetOt: 36,
          actualOt: 0,
          otPct: 0,
          status: "On Track",
          groupName: "A",
          salary: 25000,
          shifts: { "1": "M12" }
        }
      ]
    };

    render(
      <DataLineageHubView
        state={mockState}
        onReconcileAll={onReconcileAll}
        restrictToJvOnly={true}
        onToggleRestrictToJvOnly={onToggleRestrictToJvOnly}
      />
    );

    expect(screen.getAllByText(/แผนกและสายงานหลัก/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/ทะเบียนบุคลากรหลัก/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/โครงสร้างอัตรากำลัง 2T\/3T/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/ตารางจัดกะพนักงาน 24 ชม\./i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/ประวัติ OT จากกะทำงาน/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/บันทึกและสถิติวันลา/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/โครงสร้าง Job Value \(27 คน\)/i).length).toBeGreaterThan(0);

    // Click 1-click reconcile button
    const syncBtn = screen.getByRole("button", { name: /ซิงโครไนซ์ข้อมูลทั้งหมดในคลิกเดียว/i });
    fireEvent.click(syncBtn);
    expect(onReconcileAll).toHaveBeenCalledTimes(1);
  });
});
