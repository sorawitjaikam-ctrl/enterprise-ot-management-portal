import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { CircadianTimelineModal } from "../../src/components/CircadianTimelineModal";
import { LiveSimulationHUD } from "../../src/components/LiveSimulationHUD";
import { Employee } from "../../src/types";
import { SimulationResult } from "../../src/utils/costSimulationEngine";

describe("Challenger 2 Workflow Stress: Circadian Timeline & Live Simulation HUD Components", () => {
  const createMockEmployee = (overrides: Partial<Employee>): Employee => ({
    id: "EMP-001",
    name: "นายสมศักดิ์ มุ่งมั่น",
    deptId: "inter2",
    role: "ผู้ควบคุมงานขนถ่ายสินค้า",
    salary: 24000,
    targetOt: 40,
    actualOt: 32,
    otPct: 20,
    status: "On Track",
    groupName: "กะ 1",
    shifts: [
      "M12", "M12", "N12", "N12", "O", "O", "M8", "M8", "A8", "A8",
      "O", "O", "N8", "N8", "M16", "M16", "O", "O", "OND", "D",
      "O", "O", "A12", "A12", "N16", "N16", "O", "O", "M12", "M12", "O"
    ],
    ...overrides
  });

  // =========================================================================
  // 1. CIRCADIAN TIMELINE MODAL STRESS TESTS
  // =========================================================================
  describe("1. CircadianTimelineModal Stress", () => {
    it("CH2.MODAL.1: Renders 24-Hour Gantt Timeline with telemetry cards and handles date navigation", () => {
      const emp1 = createMockEmployee({ id: "E1", name: "Somchai", role: "Driver" });
      const emp2 = createMockEmployee({ id: "E2", name: "Sombat", role: "Technician" });
      const onClose = vi.fn();
      const onSelectCell = vi.fn();

      render(
        <CircadianTimelineModal
          isOpen={true}
          onClose={onClose}
          employees={[emp1, emp2]}
          currentMonth="2026-08"
          departmentName="ฝ่ายปฏิบัติการเทียบเรือ 2"
          onSelectCell={onSelectCell}
        />
      );

      // Verify modal container exists
      expect(screen.getByTestId("circadian-timeline-modal")).toBeInTheDocument();
      expect(screen.getByText("24-Hour Circadian Timeline Matrix")).toBeInTheDocument();
      expect(screen.getByText(/ฝ่ายปฏิบัติการเทียบเรือ 2/)).toBeInTheDocument();

      // Verify telemetry summary cards
      expect(screen.getByText("พนักงานปฏิบัติงาน")).toBeInTheDocument();
      expect(screen.getByText("ช่วงกะเช้า (07-15)")).toBeInTheDocument();
      expect(screen.getByText("ช่วงกะบ่าย (15-23)")).toBeInTheDocument();
      expect(screen.getByText("ช่วงกะดึก (23-07)")).toBeInTheDocument();
      expect(screen.getByText("กำลังพลสูงสุด (Peak)")).toBeInTheDocument();

      // Verify Next Day button changes day
      const nextDayBtn = screen.getByLabelText("Next Day");
      fireEvent.click(nextDayBtn);
      expect(screen.getByText("2026-08-02")).toBeInTheDocument();

      // Verify Previous Day button works
      const prevDayBtn = screen.getByLabelText("Previous Day");
      fireEvent.click(prevDayBtn);
      expect(screen.getByText("2026-08-01")).toBeInTheDocument();

      // Verify Close button invokes onClose
      const closeBtn = screen.getByLabelText("Close");
      fireEvent.click(closeBtn);
      expect(onClose).toHaveBeenCalled();
    });

    it("CH2.MODAL.2: Role Filtering and Cell Selection Callbacks", () => {
      const emp1 = createMockEmployee({ id: "E1", name: "Somchai", role: "Driver" });
      const emp2 = createMockEmployee({ id: "E2", name: "Sombat", role: "Technician" });
      const onSelectCell = vi.fn();

      render(
        <CircadianTimelineModal
          isOpen={true}
          onClose={vi.fn()}
          employees={[emp1, emp2]}
          currentMonth="2026-08"
          onSelectCell={onSelectCell}
        />
      );

      // Verify employee names render in identity column
      expect(screen.getByText("Somchai")).toBeInTheDocument();
      expect(screen.getByText("Sombat")).toBeInTheDocument();

      // Find shift pill for Somchai and click it
      const shiftPills = screen.getAllByTitle("คลิกเพื่อแก้ไขกะ");
      expect(shiftPills.length).toBeGreaterThan(0);
      fireEvent.click(shiftPills[0]);
      expect(onSelectCell).toHaveBeenCalledWith("E1", 1);
    });

    it("CH2.MODAL.3: Returns null when isOpen is false", () => {
      const { container } = render(
        <CircadianTimelineModal
          isOpen={false}
          onClose={vi.fn()}
          employees={[]}
          currentMonth="2026-08"
        />
      );
      expect(container.firstChild).toBeNull();
    });
  });

  // =========================================================================
  // 2. LIVE SIMULATION HUD STRESS TESTS
  // =========================================================================
  describe("2. LiveSimulationHUD Stress", () => {
    it("CH2.HUD.1: Renders telemetry HUD with delta OT, cost, budget bar, and passing status", () => {
      const mockSim: SimulationResult = {
        baselineOtHours: 0,
        simulatedOtHours: 8,
        deltaOtHours: 8,
        baselineCostThb: 0,
        simulatedCostThb: 1200,
        deltaCostThb: 1200,
        departmentBudgetLimit: 150000,
        currentTotalCostThb: 0,
        newTotalCostThb: 1200,
        budgetUtilizationPct: 0.8,
        isBudgetExceeded: false,
        complianceViolations: [],
        affectedEmployeesCount: 1,
        paintedCellsCount: 2
      };

      const onApply = vi.fn();
      const onCancel = vi.fn();
      const onSelectShift = vi.fn();

      render(
        <LiveSimulationHUD
          simulation={mockSim}
          activePaintShift="M12"
          onApply={onApply}
          onCancel={onCancel}
          onSelectShift={onSelectShift}
        />
      );

      expect(screen.getByTestId("live-simulation-hud")).toBeInTheDocument();
      expect(screen.getByText("2 ช่องที่เลือก")).toBeInTheDocument();
      expect(screen.getByText("กะที่เลือก: M12")).toBeInTheDocument();
      expect(screen.getByText("+8 ชม.")).toBeInTheDocument();
      expect(screen.getByText("+฿1,200")).toBeInTheDocument();
      expect(screen.getByText("0.8%")).toBeInTheDocument();
      expect(screen.getByText("ผ่านเกณฑ์กฎหมาย")).toBeInTheDocument();

      // Test Apply button
      const applyBtn = screen.getByText("บันทึกกะ (2)");
      fireEvent.click(applyBtn);
      expect(onApply).toHaveBeenCalled();

      // Test Cancel button
      const cancelBtn = screen.getByText("ยกเลิก");
      fireEvent.click(cancelBtn);
      expect(onCancel).toHaveBeenCalled();
    });

    it("CH2.HUD.2: Renders budget violation warning and error badge when ceiling is exceeded", () => {
      const mockSimExceeded: SimulationResult = {
        baselineOtHours: 200,
        simulatedOtHours: 250,
        deltaOtHours: 50,
        baselineCostThb: 140000,
        simulatedCostThb: 165000,
        deltaCostThb: 25000,
        departmentBudgetLimit: 150000,
        currentTotalCostThb: 140000,
        newTotalCostThb: 165000,
        budgetUtilizationPct: 110.0,
        isBudgetExceeded: true,
        complianceViolations: [
          {
            empId: "DEPT_BUDGET",
            empName: "แผนก",
            reason: "งบประมาณเกินเพดาน ฿150,000",
            type: "budget_exceeded"
          }
        ],
        affectedEmployeesCount: 2,
        paintedCellsCount: 5
      };

      render(
        <LiveSimulationHUD
          simulation={mockSimExceeded}
          activePaintShift="N16"
          onApply={vi.fn()}
          onCancel={vi.fn()}
        />
      );

      expect(screen.getByText("110.0%")).toBeInTheDocument();
      expect(screen.getByText(/พบข้อผิดพลาด \(1\)/)).toBeInTheDocument();
    });

    it("CH2.HUD.3: Returns null when simulation is null or paintedCellsCount is 0", () => {
      const { rerender, container } = render(
        <LiveSimulationHUD simulation={null} />
      );
      expect(container.firstChild).toBeNull();

      const emptySim: SimulationResult = {
        baselineOtHours: 0,
        simulatedOtHours: 0,
        deltaOtHours: 0,
        baselineCostThb: 0,
        simulatedCostThb: 0,
        deltaCostThb: 0,
        departmentBudgetLimit: 150000,
        currentTotalCostThb: 0,
        newTotalCostThb: 0,
        budgetUtilizationPct: 0,
        isBudgetExceeded: false,
        complianceViolations: [],
        affectedEmployeesCount: 0,
        paintedCellsCount: 0
      };

      rerender(<LiveSimulationHUD simulation={emptySim} />);
      expect(container.firstChild).toBeNull();
    });
  });
});
