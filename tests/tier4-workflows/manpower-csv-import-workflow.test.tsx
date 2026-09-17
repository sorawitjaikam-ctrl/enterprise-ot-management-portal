import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import ManpowerDashboard from "../../src/components/ManpowerDashboard";

describe("Tier 4: Manpower Dashboard CSV Import Workflow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    window.confirm = vi.fn().mockReturnValue(true);
    global.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, positions: [] })
      })
    );
  });

  it("T4.MP.1: Hidden CSV file input exists and is bound to file picker ref", () => {
    render(<ManpowerDashboard />);

    const fileInput = screen.getByTestId("manpower-csv-file-input") as HTMLInputElement;
    expect(fileInput).toBeInTheDocument();
    expect(fileInput.type).toBe("file");
    expect(fileInput.className).toContain("hidden");
    expect(fileInput.accept).toContain(".csv");
  });

  it("T4.MP.2: Clicking Import CSV button triggers click on hidden file input", () => {
    render(<ManpowerDashboard />);

    const fileInput = screen.getByTestId("manpower-csv-file-input") as HTMLInputElement;
    const clickSpy = vi.spyOn(fileInput, "click");

    const importButtons = screen.getAllByRole("button").filter(b => 
      b.textContent?.includes("Import CSV") || b.textContent?.includes("นำเข้าไฟล์ CSV")
    );
    expect(importButtons.length).toBeGreaterThanOrEqual(1);

    fireEvent.click(importButtons[0]);
    expect(clickSpy).toHaveBeenCalledTimes(1);
  });

  it("T4.MP.3: Uploading a valid UTF-8 BOM CSV parses positions and updates list", async () => {
    render(<ManpowerDashboard />);

    const fileInput = screen.getByTestId("manpower-csv-file-input") as HTMLInputElement;

    const csvData = "\uFEFFEmployee ID,Name,Role,Unit,Level,OC Type,Status\r\n" +
      "EMP-991,สมคิด พัฒนา,Crane Operator,INTER 2,Worker - Skill,NEW,Active\r\n" +
      "EMP-992,วิชัย ชำนาญการ,Technician,INTER 3,Worker - General,OLD,Active";

    const file = new File([csvData], "test_manpower.csv", { type: "text/csv" });

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByDisplayValue("สมคิด พัฒนา")).toBeInTheDocument();
      expect(screen.getByDisplayValue("วิชัย ชำนาญการ")).toBeInTheDocument();
    });
  });

  it("T4.MP.4: Uploading semicolon-delimited CSV parses cleanly", async () => {
    render(<ManpowerDashboard />);

    const fileInput = screen.getByTestId("manpower-csv-file-input") as HTMLInputElement;

    const csvData = "Employee ID;Name;Role;Unit;Level;OC Type;Status\r\n" +
      "EMP-993;กมล สายตรวจ;Inspector;INTER 5;Staff;NEW;Active";

    const file = new File([csvData], "test_semicolon.csv", { type: "text/csv" });

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByDisplayValue("กมล สายตรวจ")).toBeInTheDocument();
    });
  });
});
