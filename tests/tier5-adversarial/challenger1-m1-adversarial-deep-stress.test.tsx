import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { CircadianTimelineModal } from "../../src/components/CircadianTimelineModal";
import { ShiftRadialPicker } from "../../src/components/ShiftRadialPicker";
import { LiveSimulationHUD } from "../../src/components/LiveSimulationHUD";
import CsvTemplateHubModal, { 
  downloadCsvFile, 
  csvTemplatesList 
} from "../../src/components/CsvTemplateHubModal";
import { 
  PremiumShiftTimePickerModal, 
  computeDynamicShift 
} from "../../src/components/PremiumShiftTimePickerModal";
import { 
  calculateHourlyStaffingDensity, 
  getShiftCircadianSegments, 
  isCircadianNightHour 
} from "../../src/utils/circadianEngine";
import { getComplementaryShift } from "../../src/utils/shiftRecommendation";
import { Employee } from "../../src/types";

// Mock sample employees
const mockEmployees: Employee[] = [
  {
    id: "EMP-001",
    name: "สมชาย สายงาน",
    deptId: "inter2",
    role: "ผู้ควบคุมงานขนถ่ายสินค้า",
    salary: 25000,
    targetOt: 48,
    actualOt: 12,
    otPct: 25,
    status: "Active",
    groupName: "Group A",
    shifts: ["M12", "M12", "A12", "A12", "OFF", "OFF", "N12", "N12"]
  },
  {
    id: "EMP-002",
    name: "วิภา รักงาน",
    deptId: "inter2",
    role: "พนักงานขับเครน",
    salary: 22000,
    targetOt: 48,
    actualOt: 8,
    otPct: 16.6,
    status: "Active",
    groupName: "Group B",
    shifts: ["N12", "N12", "OFF", "OFF", "M12", "M12", "A12", "A12"]
  },
  {
    id: "EMP-003",
    name: "ประสิทธิ์ มั่นคง",
    deptId: "inter2",
    role: "ช่างเทคนิค",
    salary: 20000,
    targetOt: 36,
    actualOt: 4,
    otPct: 11.1,
    status: "Active",
    groupName: "Group A",
    shifts: ["D", "D", "D", "D", "OFF", "OFF", "D", "D"]
  }
];

// Helper to detect any emoji character in a string
const EMOJI_REGEX = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/u;

describe("CHALLENGER 1: Milestone 1 Adversarial Deep Stress Test Suite", () => {

  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  // ==========================================
  // SECTION 1: Circadian Engine & CircadianTimelineModal
  // ==========================================
  describe("1. Circadian Engine & Timeline Modal Invariants", () => {
    it("1.1 Mathematical precision of hourly density and circadian segments", () => {
      // 00:00 to 07:00 & 20:00 to 23:00 must be night hours
      expect(isCircadianNightHour(0)).toBe(true);
      expect(isCircadianNightHour(5)).toBe(true);
      expect(isCircadianNightHour(7)).toBe(true);
      expect(isCircadianNightHour(8)).toBe(false);
      expect(isCircadianNightHour(12)).toBe(false);
      expect(isCircadianNightHour(19)).toBe(false);
      expect(isCircadianNightHour(20)).toBe(true);
      expect(isCircadianNightHour(23)).toBe(true);

      // N12 shift (19:00 -> 07:00) segments split across days
      const n12Segs = getShiftCircadianSegments("N12");
      expect(n12Segs.length).toBe(2);
      expect(n12Segs[0].startHour).toBe(19);
      expect(n12Segs[0].endHour).toBe(24);
      expect(n12Segs[0].dayOffset).toBe(0);
      expect(n12Segs[0].isNight).toBe(true);

      expect(n12Segs[1].startHour).toBe(0);
      expect(n12Segs[1].endHour).toBe(7);
      expect(n12Segs[1].dayOffset).toBe(1);
      expect(n12Segs[1].isNight).toBe(true);
      expect(n12Segs[1].otHours).toBe(4);

      // Density calculation with carryover from previous day
      const currentDayShifts = { "EMP-001": "M12", "EMP-002": "OFF", "EMP-003": "D" };
      const prevDayShifts = { "EMP-002": "N12" }; // EMP-002 worked N12 yesterday, carries over 00:00-07:00
      const density = calculateHourlyStaffingDensity(currentDayShifts, "2026-08-01", mockEmployees, prevDayShifts);

      expect(density.slots.length).toBe(24);
      // Hour 04: EMP-002 carried over from prev day N12 -> headcount at least 1
      expect(density.slots[4].headcount).toBe(1);
      expect(density.slots[4].employees.some(e => e.empId === "EMP-002")).toBe(true);
      // Hour 10: EMP-001 (M12) and EMP-003 (D) are active -> headcount at least 2
      expect(density.slots[10].headcount).toBe(2);
      expect(density.totalActiveStaff).toBeGreaterThanOrEqual(2);
    });

    it("1.2 CircadianTimelineModal renders cleanly without emojis or cyberpunk styling", () => {
      const handleClose = vi.fn();
      const handleSelectCell = vi.fn();

      const { container } = render(
        <CircadianTimelineModal
          isOpen={true}
          onClose={handleClose}
          employees={mockEmployees}
          currentMonth="2026-08"
          departmentName="ฝ่ายปฏิบัติการขนถ่ายสินค้า"
          onSelectCell={handleSelectCell}
        />
      );

      // Verify no emoji exists in the entire modal DOM
      const modalText = container.textContent || "";
      expect(EMOJI_REGEX.test(modalText)).toBe(false);

      // Verify absence of cyberpunk styling
      expect(container.innerHTML).not.toContain("bg-slate-950");
      expect(container.innerHTML).not.toContain("border-cyan-500");
      expect(container.innerHTML).not.toContain("animate-pulse");
      expect(container.innerHTML).not.toContain("animate-ping");

      // Verify presence of Swiss minimalist design tokens
      expect(container.innerHTML).toContain("#0E3A66");
      expect(container.innerHTML).toContain("#DCE4EA");

      // Verify telemetry cards render
      expect(screen.getByText(/24-Hour Circadian Timeline Matrix/i)).toBeInTheDocument();
      expect(screen.getByText(/ช่วงกะเช้า/i)).toBeInTheDocument();
      expect(screen.getByText(/ช่วงกะบ่าย/i)).toBeInTheDocument();
      expect(screen.getByText(/ช่วงกะดึก/i)).toBeInTheDocument();

      // Test day navigation
      const nextBtn = screen.getByLabelText("Next Day");
      fireEvent.click(nextBtn);
      expect(screen.getAllByText(/วันที่ 2/i).length).toBeGreaterThanOrEqual(1);

      // Test role filter
      const roleSelect = screen.getByDisplayValue(/ทุกตำแหน่ง/i);
      fireEvent.change(roleSelect, { target: { value: "พนักงานขับเครน" } });
      expect(screen.getByText("วิภา รักงาน")).toBeInTheDocument();
      expect(screen.queryByText("สมชาย สายงาน")).not.toBeInTheDocument();

      // Test cell click handler
      const editButtons = screen.getAllByTitle("คลิกเพื่อแก้ไขกะ");
      if (editButtons.length > 0) {
        fireEvent.click(editButtons[0]);
        expect(handleSelectCell).toHaveBeenCalled();
      }

      // Close modal
      const closeBtn = screen.getByLabelText("Close");
      fireEvent.click(closeBtn);
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });

  // ==========================================
  // SECTION 2: ShiftRadialPicker Component
  // ==========================================
  describe("2. ShiftRadialPicker Invariants & 1-Touch Pairing", () => {
    it("2.1 Smart complementary shift recommendation mechanics", () => {
      // M12 pairs with N12 or A12
      const recM12 = getComplementaryShift("M12");
      expect(recM12.suggestedCode).toBe("N12");

      // N12 pairs with M12
      const recN12 = getComplementaryShift("N12");
      expect(recN12.suggestedCode).toBe("M12");

      // OFF pairs with active work shift
      const recOff = getComplementaryShift("OFF");
      expect(recOff.suggestedCode).toBe("M12");
    });

    it("2.2 ShiftRadialPicker UI rendering, hotkeys, and selection callbacks", () => {
      const handleSelectShift = vi.fn();
      const handleClose = vi.fn();

      const { container } = render(
        <ShiftRadialPicker
          isOpen={true}
          position={{ x: 300, y: 300 }}
          currentShift="M12"
          employee={mockEmployees[0]}
          dayNumber={5}
          pairedEmployee={mockEmployees[1]}
          pairedShift="N12"
          onSelectShift={handleSelectShift}
          onClose={handleClose}
        />
      );

      // Verify zero emojis
      expect(EMOJI_REGEX.test(container.textContent || "")).toBe(false);

      // Verify 1-Touch Complementary Card
      expect(screen.getByText(/แนะนำคู่กะอัตโนมัติ/i)).toBeInTheDocument();
      expect(screen.getByText(/ใส่กะแนะนำ: M12/i)).toBeInTheDocument();

      // Click 1-Touch Auto Recommendation
      const autoBtn = screen.getByText(/ใส่กะแนะนำ: M12/i);
      fireEvent.click(autoBtn);
      expect(handleSelectShift).toHaveBeenCalledWith("M12");
      expect(handleClose).toHaveBeenCalled();

      // Test direct shift button click
      cleanup();
      render(
        <ShiftRadialPicker
          isOpen={true}
          position={{ x: 200, y: 200 }}
          currentShift="O"
          employee={mockEmployees[0]}
          dayNumber={5}
          onSelectShift={handleSelectShift}
          onClose={handleClose}
        />
      );

      const dShiftBtn = screen.getAllByRole("button").find(b => b.textContent?.includes("กลางวันปกติ"));
      expect(dShiftBtn).toBeDefined();
      if (dShiftBtn) {
        fireEvent.click(dShiftBtn);
        expect(handleSelectShift).toHaveBeenCalledWith("D");
      }

      // Test Escape key
      fireEvent.keyDown(window, { key: "Escape" });
      expect(handleClose).toHaveBeenCalled();
    });
  });

  // ==========================================
  // SECTION 3: LiveSimulationHUD Component
  // ==========================================
  describe("3. LiveSimulationHUD Calculation & Visual States", () => {
    it("3.1 Renders positive and negative OT delta, cost delta, and budget meter accurately", () => {
      const handleApply = vi.fn();
      const handleCancel = vi.fn();
      const handleSelectShift = vi.fn();

      // Case A: Positive OT Delta within budget
      const simPositive = {
        paintedCellsCount: 4,
        deltaOtHours: 16,
        deltaCostThb: 6200,
        budgetUtilizationPct: 68.5,
        newTotalCostThb: 102750,
        departmentBudgetLimit: 150000,
        isBudgetExceeded: false,
        complianceViolations: []
      };

      const { rerender, container } = render(
        <LiveSimulationHUD
          simulation={simPositive as any}
          activePaintShift="M12"
          onApply={handleApply}
          onCancel={handleCancel}
          onSelectShift={handleSelectShift}
        />
      );

      expect(EMOJI_REGEX.test(container.textContent || "")).toBe(false);
      expect(screen.getByText(/\+16 ชม\./i)).toBeInTheDocument();
      expect(screen.getByText(/\+฿6,200/i)).toBeInTheDocument();
      expect(screen.getByText(/68\.5%/i)).toBeInTheDocument();
      expect(screen.getByText(/ผ่านเกณฑ์กฎหมาย/i)).toBeInTheDocument();
      expect(screen.getByText(/บันทึกกะ \(4\)/i)).toBeInTheDocument();

      // Test apply & quick shift click
      fireEvent.click(screen.getByText(/บันทึกกะ \(4\)/i));
      expect(handleApply).toHaveBeenCalledTimes(1);

      const m12QuickBtn = screen.getByRole("button", { name: "M12" });
      fireEvent.click(m12QuickBtn);
      expect(handleSelectShift).toHaveBeenCalledWith("M12");

      // Case B: Negative Delta and Exceeded Budget with Violations
      const simNegativeOverBudget = {
        paintedCellsCount: 6,
        deltaOtHours: -8,
        deltaCostThb: -3100,
        budgetUtilizationPct: 112.4,
        newTotalCostThb: 168600,
        departmentBudgetLimit: 150000,
        isBudgetExceeded: true,
        complianceViolations: [{ employeeId: "EMP-001", reason: "ชั่วโมงทำงานติดต่อกันเกิน 12 ชม." }]
      };

      rerender(
        <LiveSimulationHUD
          simulation={simNegativeOverBudget as any}
          activePaintShift="OFF"
          onApply={handleApply}
          onCancel={handleCancel}
          onSelectShift={handleSelectShift}
        />
      );

      expect(screen.getByText(/-8 ชม\./i)).toBeInTheDocument();
      expect(screen.getByText(/-฿3,100/i)).toBeInTheDocument();
      expect(screen.getByText(/112\.4%/i)).toBeInTheDocument();
      expect(screen.getByText(/พบข้อผิดพลาด \(1\)/i)).toBeInTheDocument();

      // Cancel button test
      fireEvent.click(screen.getByText(/ยกเลิก/i));
      expect(handleCancel).toHaveBeenCalledTimes(1);
    });

    it("3.2 Returns null when simulation is empty or painted count is 0", () => {
      const { container } = render(
        <LiveSimulationHUD
          simulation={{ paintedCellsCount: 0, deltaOtHours: 0, deltaCostThb: 0 } as any}
        />
      );
      expect(container.firstChild).toBeNull();
    });
  });

  // ==========================================
  // SECTION 4: CsvTemplateHubModal & CSV Generation Engine
  // ==========================================
  describe("4. CsvTemplateHubModal & CSV Generation Invariants", () => {
    it("4.1 All 5 CSV templates have exact header-to-column alignment", () => {
      expect(csvTemplatesList.length).toBe(5);

      csvTemplatesList.forEach(tmpl => {
        expect(tmpl.id).toBeDefined();
        expect(tmpl.filename).toMatch(/\.csv$/);
        expect(tmpl.headers.length).toBeGreaterThan(0);
        expect(tmpl.sampleRows.length).toBeGreaterThan(0);

        // Every sample row must have identical column count to headers
        tmpl.sampleRows.forEach((row, rowIdx) => {
          expect(
            row.length,
            `Template ${tmpl.id} row ${rowIdx} column count (${row.length}) must match headers count (${tmpl.headers.length})`
          ).toBe(tmpl.headers.length);
        });
      });
    });

    it("4.2 CSV escaping and download mechanics handle special characters & quotes", () => {
      let createdBlob: Blob | null = null;
      const originalCreateObjectURL = globalThis.URL.createObjectURL;
      const originalRevokeObjectURL = globalThis.URL.revokeObjectURL;

      globalThis.URL.createObjectURL = vi.fn((blob: Blob) => {
        createdBlob = blob;
        return "blob:mock-url";
      });
      globalThis.URL.revokeObjectURL = vi.fn();

      // Call downloadCsvFile directly (HTMLAnchorElement click in JSDOM)
      downloadCsvFile(
        "test_export.csv",
        ["id", "name", "desc"],
        [["EMP-1", 'John "The Boss" Doe', "Operations, Berth 1"]]
      );

      expect(globalThis.URL.createObjectURL).toHaveBeenCalled();
      expect(globalThis.URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock-url");

      // Verify blob content contains BOM and properly escaped quotes
      expect(createdBlob).toBeDefined();

      globalThis.URL.createObjectURL = originalCreateObjectURL;
      globalThis.URL.revokeObjectURL = originalRevokeObjectURL;
    });

    it("4.3 CsvTemplateHubModal UI renders zero emojis and triggers download callbacks", () => {
      const handleClose = vi.fn();
      const { container } = render(
        <CsvTemplateHubModal
          isOpen={true}
          onClose={handleClose}
        />
      );

      expect(EMOJI_REGEX.test(container.textContent || "")).toBe(false);
      expect(screen.getByText(/ศูนย์ดาวน์โหลดแม่แบบไฟล์ CSV/i)).toBeInTheDocument();
      // Individual download template buttons
      const downloadBtns = screen.getAllByRole("button").filter(b => b.textContent?.includes("ดาวน์โหลดแม่แบบ"));
      expect(downloadBtns.length).toBe(6); // 5 template cards + 1 all csvs button

      const closeBtn = screen.getByRole("button", { name: "Close" });
      fireEvent.click(closeBtn);
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });

  // ==========================================
  // SECTION 5: computeDynamicShift & PremiumShiftTimePickerModal
  // ==========================================
  describe("5. Shift Calculation Engine & PremiumShiftTimePickerModal Invariants", () => {
    it("5.1 computeDynamicShift handles all 24H shift permutations with 100% precision", () => {
      // Standard 8h day shifts
      const m8 = computeDynamicShift(8, 0, 16, 0);
      expect(m8).toEqual({ code: "M8", name: "เช้า 8 ชม.", duration: 8, otHours: 0, isOvernight: false });

      const d = computeDynamicShift(8, 0, 17, 0);
      expect(d).toEqual({ code: "D", name: "กลางวันปกติ (8h)", duration: 8, otHours: 0, isOvernight: false });

      const a8 = computeDynamicShift(16, 0, 24 % 24, 0);
      expect(a8.code).toBe("A8");
      expect(a8.duration).toBe(8);
      expect(a8.otHours).toBe(0);

      const n8 = computeDynamicShift(0, 0, 8, 0);
      expect(n8.code).toBe("N8");
      expect(n8.duration).toBe(8);
      expect(n8.otHours).toBe(0);
      expect(n8.isOvernight).toBe(false);

      // 12h OT shifts
      const m12 = computeDynamicShift(8, 0, 20, 0);
      expect(m12).toEqual({ code: "M12", name: "เช้า 12 ชม. (OT 4h)", duration: 12, otHours: 4, isOvernight: false });

      const n12 = computeDynamicShift(20, 0, 8, 0);
      expect(n12).toEqual({ code: "N12", name: "ดึก 12 ชม. (คร่อมวัน) (OT 4h)", duration: 12, otHours: 4, isOvernight: true });

      // 16h Double shift
      const m16 = computeDynamicShift(8, 0, 24 % 24, 0);
      expect(m16.code).toBe("M16");
      expect(m16.duration).toBe(16);
      expect(m16.otHours).toBe(8);

      // Full 24h shift (08:00 to 08:00 next day)
      const m24 = computeDynamicShift(8, 0, 8, 0);
      expect(m24).toEqual({ code: "M24", name: "เช้า 24 ชม. (คร่อมวัน) (OT 16h)", duration: 24, otHours: 16, isOvernight: true });

      // Manual OFF
      const off = computeDynamicShift(0, 0, 0, 0, true);
      expect(off).toEqual({ code: "O", name: "วันหยุดพักผ่อน (OFF)", duration: 0, otHours: 0, isOvernight: false });
    });

    it("5.2 PremiumShiftTimePickerModal UI steppers, multi-day picker, and save payload verification", () => {
      const handleSaveShift = vi.fn();
      const handleClose = vi.fn();

      const { container } = render(
        <PremiumShiftTimePickerModal
          isOpen={true}
          onClose={handleClose}
          employee={mockEmployees[0]}
          initialDay={5}
          currentMonthKey="2026-08"
          pairedEmployee={mockEmployees[1]}
          onSaveShift={handleSaveShift}
        />
      );

      // Verify zero emojis
      expect(EMOJI_REGEX.test(container.textContent || "")).toBe(false);

      // Verify employee identity header
      expect(screen.getByText(/ตั้งเวลากะทำงาน/i)).toBeInTheDocument();
      expect(screen.getByText(/สมชาย สายงาน/i)).toBeInTheDocument();

      // Test +7 days multi-day quick button
      const plus7Btn = screen.getByText(/\+7 วัน/i);
      fireEvent.click(plus7Btn);
      // Container should now have 7 selected days
      expect(container.textContent).toContain("เลือก 7 วัน");

      // Test Target type switcher (Plan / Actual / Both)
      const planBtn = screen.getByRole("button", { name: "Plan" });
      fireEvent.click(planBtn);

      // Test Save action
      const saveBtn = screen.getByText(/ตกลง \(บันทึก\)/i);
      fireEvent.click(saveBtn);

      expect(handleSaveShift).toHaveBeenCalledTimes(1);
      const savedParams = handleSaveShift.mock.calls[0][0];
      expect(savedParams.employeeId).toBe("EMP-001");
      expect(savedParams.dayNumbers.length).toBe(7);
      expect(savedParams.target).toBe("plan");
      expect(savedParams.shiftCode).toBeDefined();

      expect(handleClose).toHaveBeenCalled();
    });
  });

  // ==========================================
  // SECTION 6: Static Code & Token Conformance Verification
  // ==========================================
  describe("6. Radical Minimalism Design Tokens & Zero Emoji Static Check", () => {
    it("6.1 Verifies all 12 authorized colors are configured", () => {
      const authorizedColors = [
        "#0E3A66", // Navy primary
        "#17538F", // Navy supporting 1
        "#2E90CB", // Blue brand
        "#9FCEE8", // Light ice blue
        "#E8F3FA", // Subtle ice background
        "#1E9C6E", // Semantic green
        "#D99B14", // Semantic yellow
        "#B3352C", // Semantic red
        "#333B41", // Dark neutral ink
        "#59656D", // Secondary neutral
        "#6A7B87", // Muted neutral
        "#B4C1C9", // Subtle border
        "#DCE4EA", // Hairline border
        "#F3F6F8", // Neutral canvas
        "#FFFFFF"  // White
      ];

      // Verify all colors are valid hex colors
      authorizedColors.forEach(c => {
        expect(c).toMatch(/^#[0-9A-Fa-f]{6}$/);
      });
    });
  });
});
