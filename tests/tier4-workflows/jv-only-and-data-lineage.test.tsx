import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import Navbar, { isStrictHrOrAdmin, DEFAULT_ENABLED_TABS } from "../../src/components/Navbar";
import Sidebar from "../../src/components/Sidebar";
import DataLineageHubView, { RealtimeTabVisibilityPanel } from "../../src/components/DataLineageHubView";
import JobValueSpreadsheetView from "../../src/components/JobValueSpreadsheetView";

describe("JV-Only Access Mode, Realtime 01-08 Tab Visibility & Data Lineage Hub Verification", () => {
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
        enabledTabs={{ ...DEFAULT_ENABLED_TABS, job_value: true }}
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

  it("dynamically unlocks individual tabs (01-08) in Realtime when Admin enables them in enabledTabs", () => {
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
        enabledTabs={{ ...DEFAULT_ENABLED_TABS, job_value: true, shifts: true }}
      />
    );

    // Shifts (03) is now unlocked in Realtime, so clicking it navigates to "shifts"
    const shiftsTabs = screen.getAllByRole("tab", { name: /ตารางจัดกะพนักงาน/i });
    fireEvent.click(shiftsTabs[0]);
    expect(setActiveTab).toHaveBeenCalledWith("shifts");
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

  it("renders RealtimeTabVisibilityPanel and triggers 3-state mode (open / coming_soon / hidden) and per-person target user selection", () => {
    const onSetTabMode = vi.fn();
    const onSelectTargetUser = vi.fn();
    render(
      <RealtimeTabVisibilityPanel
        restrictToJvOnly={true}
        enabledTabs={{ ...DEFAULT_ENABLED_TABS, job_value: true }}
        onToggleRestrictToJvOnly={() => {}}
        onSetTabMode={onSetTabMode}
        selectedTargetUser="__GLOBAL__"
        onSelectTargetUser={onSelectTargetUser}
        accounts={[
          { username: "op_dir", name: "Operation Dir", role: "Operation Dir", deptId: "all" },
          { username: "inter2_mgr", name: "INTER2 Manager", role: "Section Manager", deptId: "inter2" },
        ]}
      />
    );

    // Select a specific user ("op_dir")
    const userSelect = screen.getByRole("combobox", { name: /เลือกผู้ใช้งานที่ต้องการกำหนดการมองเห็น/i });
    fireEvent.change(userSelect, { target: { value: "op_dir" } });
    expect(onSelectTargetUser).toHaveBeenCalledWith("op_dir");

    // Click "ซ่อนไปเลย" for 03 ตารางจัดกะพนักงาน
    const hideShiftsBtn = screen.getByRole("button", { name: /ตั้งค่า 03 ตารางจัดกะพนักงาน เป็น ซ่อนไปเลย/i });
    fireEvent.click(hideShiftsBtn);
    expect(onSetTabMode).toHaveBeenCalledWith("__GLOBAL__", "shifts", "hidden");
  });

  it("completely hides tabs set to 'hidden' (ซ่อนไปเลย) and applies per-person userTabOverrides in Navbar and Sidebar", () => {
    const setActiveTab = vi.fn();
    const userOverrides = {
      inter2_mgr: {
        dashboard: "hidden" as const,
        manpower: "hidden" as const,
        shifts: "open" as const,
        job_value: "open" as const,
        employees: "coming_soon" as const,
      },
    };

    render(
      <Navbar
        title="Job Value"
        searchQuery=""
        setSearchQuery={() => {}}
        currentUser={{ username: "inter2_mgr", name: "INTER2 Manager", role: "Section Manager" }}
        onOpenProfile={() => {}}
        activeTab="job_value"
        setActiveTab={setActiveTab}
        onLogout={() => {}}
        restrictToJvOnly={true}
        userTabOverrides={userOverrides}
      />
    );

    // "dashboard" and "manpower" are set to "hidden" for inter2_mgr -> completely removed from DOM!
    expect(screen.queryByRole("tab", { name: /ภาพรวม Dashboard/i })).toBeNull();
    expect(screen.queryByRole("tab", { name: /วิเคราะห์อัตรากำลัง/i })).toBeNull();

    // "shifts" is set to "open" for inter2_mgr -> visible and clickable!
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

  it("renders Executive Operational Dashboard in JobValueSpreadsheetView without Master Sheet, with Cloudflare D1 Per-Year Upload, Dept/Person filters, 4 KPI cards, 2 charts, and summary table", async () => {
    render(
      <JobValueSpreadsheetView
        currentUser={{ username: "admin", name: "Admin", role: "Admin" }}
        isHrOrFullAccess={true}
      />
    );

    expect(screen.getByText("Executive Operational Dashboard")).toBeDefined();
    expect(screen.queryByText(/Cloudflare D1 Storage/i)).toBeNull();
    expect(screen.queryByText(/ซิงก์ล่าสุด/i)).toBeNull();
    expect(screen.queryByText(/มาสเตอร์ชีตเต็ม/i)).toBeNull();
    expect(screen.getByText(/Revenue \(Avg\)/i)).toBeDefined();
    expect(screen.getByText(/Expenses \(Avg\)/i)).toBeDefined();
    expect(screen.getByText(/Gross Profit \(2569\)/i)).toBeDefined();
    expect(screen.getByText(/Performance Status/i)).toBeDefined();
    expect(screen.getByText(/แนวโน้มกำไรรายเดือน/i)).toBeDefined();
    expect(screen.getByText(/เปรียบเทียบกำไร \(Yearly Comparison\)/i)).toBeDefined();
    expect(screen.getByText(/รายละเอียดผลงานตามกลุ่มตัวอย่าง/i)).toBeDefined();

    // Open Per-Year Upload Panel (Cloudflare D1)
    const uploadPanelBtn = screen.getByRole("button", { name: /อัปโหลดข้อมูลแยกปี \(Cloudflare D1\)/i });
    fireEvent.click(uploadPanelBtn);
    expect(screen.getByText(/ระบบจัดเก็บและอัปโหลดข้อมูล Job Value แยกตามปี/i)).toBeDefined();
    const uploadYearSelect = screen.getByRole("combobox", { name: /เลือกปีที่ต้องการอัปโหลดเข้าฐานข้อมูล/i });
    fireEvent.change(uploadYearSelect, { target: { value: "2570" } });
    expect((uploadYearSelect as HTMLSelectElement).value).toBe("2570");

    // Filter by department INTER 3
    const deptSelect = screen.getByRole("combobox", { name: /หน่วยงาน \/ แผนก/i });
    fireEvent.change(deptSelect, { target: { value: "INTER 3" } });
    expect(screen.getByText(/แสดงรายชื่อพนักงานในกลุ่มที่เลือก/i)).toBeDefined();

    // Filter by specific employee "48835" (วสันต์ คุ้มคำ) -> PERSON viewMode hides Yearly Comparison & Summary Table
    const empSelect = screen.getByRole("combobox", { name: /รายชื่อพนักงาน/i });
    fireEvent.change(empSelect, { target: { value: "48835" } });
    expect(screen.queryByText(/เปรียบเทียบกำไร \(Yearly Comparison\)/i)).toBeNull();
    expect(screen.queryByText(/รายละเอียดผลงานตามกลุ่มตัวอย่าง/i)).toBeNull();

    // Reset filters
    const resetBtn = screen.getByRole("button", { name: /ล้างค่า/i });
    fireEvent.click(resetBtn);
    expect(screen.getByText(/เปรียบเทียบกำไร \(Yearly Comparison\)/i)).toBeDefined();

    // Verify delete actually empties year 2568 data (0 people) instead of resetting back to 27
    if (!screen.queryByText(/ระบบจัดเก็บและอัปโหลดข้อมูล Job Value แยกตามปี/i)) {
      fireEvent.click(screen.getByRole("button", { name: /อัปโหลดข้อมูลแยกปี \(Cloudflare D1\)/i }));
    }
    const deleteBtn2568 = screen.getByTitle(/ลบข้อมูลปี 2568/i);
    fireEvent.click(deleteBtn2568);
    await waitFor(() => {
      expect(screen.getByText(/ลบข้อมูลปี 2568 ออกจาก Cloudflare D1 เรียบร้อยแล้ว \(0 คน\)/i)).toBeDefined();
    });
    expect(screen.getAllByText(/ปี 2568/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/\(0 คน\)/i).length).toBeGreaterThan(0);
  });

  it("strictly restricts Job Value Cloudflare D1 upload and delete to Co-admin and Admin, hiding upload from Section Manager (ผจก)", () => {
    // 1. Section Manager (ผจก) should NOT see the upload button
    const { unmount } = render(
      <JobValueSpreadsheetView
        currentUser={{ username: "mgr", name: "Manager", role: "Section Manager" }}
        isHrOrFullAccess={false}
      />
    );
    expect(screen.queryByRole("button", { name: /อัปโหลดข้อมูลแยกปี \(Cloudflare D1\)/i })).toBeNull();
    unmount();

    // 2. Co-admin role CAN see and access the upload button
    render(
      <JobValueSpreadsheetView
        currentUser={{ username: "coadmin", name: "Co Admin User", role: "Co-admin" }}
        isHrOrFullAccess={true}
      />
    );
    expect(screen.getByRole("button", { name: /อัปโหลดข้อมูลแยกปี \(Cloudflare D1\)/i })).toBeDefined();
  });
});
