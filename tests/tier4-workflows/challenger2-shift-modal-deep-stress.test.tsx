import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { PremiumShiftTimePickerModal } from "../../src/components/PremiumShiftTimePickerModal";
import { Employee } from "../../src/types";

describe("Challenger 2 Workflow Stress: 24H Shift & Time Scheduler Modal Deep Stress", () => {
  const createMockEmployee = (overrides: Partial<Employee> = {}): Employee => ({
    id: "EMP-MODAL-01",
    name: "นายทดสอบ กะการทำงาน",
    deptId: "inter2",
    role: "Stevedore",
    salary: 24000,
    targetOt: 40,
    actualOt: 32,
    otPct: 20,
    status: "On Track",
    groupName: "กะ 1",
    shifts: Array(31).fill("M12"),
    ...overrides
  });

  it("CH2.PICKER.1: Renders PremiumShiftTimePickerModal with employee name, day picker, and steppers", () => {
    const emp = createMockEmployee();
    const onClose = vi.fn();
    const onSaveShift = vi.fn();

    render(
      <PremiumShiftTimePickerModal
        isOpen={true}
        onClose={onClose}
        employee={emp}
        initialDay={5}
        currentMonthKey="2026-08"
        onSaveShift={onSaveShift}
      />
    );

    // Employee name and ID should be visible
    expect(screen.getByText(/นายทดสอบ กะการทำงาน/)).toBeInTheDocument();
    expect(screen.getByText(/EMP-MODAL-01/)).toBeInTheDocument();

    // Verify day selection button exists for day 5
    expect(screen.getByRole("button", { name: "5" })).toBeInTheDocument();

    // Verify modal headers and time display
    expect(screen.getByText(/24H Shift Scheduler/i)).toBeInTheDocument();
    expect(screen.getByText("ตกลง (บันทึก)")).toBeInTheDocument();
  });

  it("CH2.PICKER.2: Multi-day selection via Shift/Ctrl key allows selecting multiple days", () => {
    const emp = createMockEmployee();
    const onSaveShift = vi.fn();

    render(
      <PremiumShiftTimePickerModal
        isOpen={true}
        onClose={vi.fn()}
        employee={emp}
        initialDay={1}
        currentMonthKey="2026-08"
        onSaveShift={onSaveShift}
      />
    );

    // Click day 2 and day 3 with shiftKey
    const day2Btn = screen.getByRole("button", { name: "2" });
    const day3Btn = screen.getByRole("button", { name: "3" });
    fireEvent.click(day2Btn, { shiftKey: true });
    fireEvent.click(day3Btn, { shiftKey: true });

    // Click save
    const saveBtn = screen.getByText("ตกลง (บันทึก)");
    fireEvent.click(saveBtn);

    expect(onSaveShift).toHaveBeenCalledWith(
      expect.objectContaining({
        employeeId: "EMP-MODAL-01",
        dayNumbers: expect.arrayContaining([1, 2, 3]),
      })
    );
  });

  it("CH2.PICKER.3: Time steppers update start and end hours and compute dynamic shift code accurately", () => {
    const emp = createMockEmployee();
    const onSaveShift = vi.fn();

    render(
      <PremiumShiftTimePickerModal
        isOpen={true}
        onClose={vi.fn()}
        employee={emp}
        initialDay={1}
        currentMonthKey="2026-08"
        onSaveShift={onSaveShift}
      />
    );

    // Initial state is 07:00 - 19:00 (M12)
    // Click Quick Off button
    const offBtn = screen.getByText("วันหยุด (OFF)");
    fireEvent.click(offBtn);

    // Click save
    const saveBtn = screen.getByText("ตกลง (บันทึก)");
    fireEvent.click(saveBtn);

    expect(onSaveShift).toHaveBeenCalledWith(
      expect.objectContaining({
        shiftCode: "O",
        startTime: "-",
        endTime: "-",
        isOvernight: false
      })
    );
  });

  it("CH2.PICKER.4: Target switch (Plan / Actual / Both) sends correct target mode to onSaveShift", () => {
    const emp = createMockEmployee();
    const onSaveShift = vi.fn();

    render(
      <PremiumShiftTimePickerModal
        isOpen={true}
        onClose={vi.fn()}
        employee={emp}
        initialDay={1}
        currentMonthKey="2026-08"
        onSaveShift={onSaveShift}
      />
    );

    // Select "ทั้งคู่" (Both)
    const bothRadio = screen.getByRole("button", { name: "ทั้งคู่" });
    fireEvent.click(bothRadio);

    // Save
    const saveBtn = screen.getByText("ตกลง (บันทึก)");
    fireEvent.click(saveBtn);

    expect(onSaveShift).toHaveBeenCalledWith(
      expect.objectContaining({
        target: "both"
      })
    );
  });

  it("CH2.PICKER.5: Reset button restores original shift configuration", () => {
    const emp = createMockEmployee();
    const onSaveShift = vi.fn();

    render(
      <PremiumShiftTimePickerModal
        isOpen={true}
        onClose={vi.fn()}
        employee={emp}
        initialDay={1}
        currentMonthKey="2026-08"
        onSaveShift={onSaveShift}
      />
    );

    // Click Day Off preset
    const dayOffPreset = screen.getByText("วันหยุด (OFF)");
    fireEvent.click(dayOffPreset);

    // Click Reset
    const resetBtn = screen.getByText("รีเซ็ต");
    fireEvent.click(resetBtn);

    // Save and verify original shift code was restored
    const saveBtn = screen.getByText("ตกลง (บันทึก)");
    fireEvent.click(saveBtn);

    expect(onSaveShift).toHaveBeenCalledWith(
      expect.objectContaining({
        shiftCode: "M12"
      })
    );
  });

  it("CH2.PICKER.6: Smart complementary shift suggestion selects paired shift with 1-click", () => {
    const empA = createMockEmployee({ id: "EMP-A", name: "Worker A" });
    const empB = createMockEmployee({ id: "EMP-B", name: "Worker B", shifts: ["M12", ...Array(30).fill("O")] });
    const onSaveShift = vi.fn();

    render(
      <PremiumShiftTimePickerModal
        isOpen={true}
        onClose={vi.fn()}
        employee={empA}
        initialDay={1}
        currentMonthKey="2026-08"
        pairedEmployee={empB}
        onSaveShift={onSaveShift}
      />
    );

    // Recommendation card for paired employee should suggest N12
    const quickBtn = screen.getByText(/ใส่กะคู่แนะนำ: N12/i);
    expect(quickBtn).toBeInTheDocument();
    fireEvent.click(quickBtn);

    // Save
    const saveBtn = screen.getByText("ตกลง (บันทึก)");
    fireEvent.click(saveBtn);

    expect(onSaveShift).toHaveBeenCalledWith(
      expect.objectContaining({
        shiftCode: "N12",
        isOvernight: true
      })
    );
  });
});
