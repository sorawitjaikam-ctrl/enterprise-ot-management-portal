import { describe, it, expect } from "vitest";
import { getCanonicalShiftCode, getShiftStyle, getShiftDurationHours } from "../../src/App";

describe("OT Records: Canonical M, A, N Shift Codes and Invariants", () => {
  it("maps night shift 00:00-08:00 to canonical code N", () => {
    expect(getCanonicalShiftCode("00:00-08:00", "OT-1X", 8)).toBe("N");
    expect(getCanonicalShiftCode("00:00-08:00")).toBe("N");
    expect(getCanonicalShiftCode("0:00-8:00")).toBe("N");
  });

  it("maps morning shift 08:00-16:00 to canonical code M", () => {
    expect(getCanonicalShiftCode("08:00-16:00", "OT-3X", 8)).toBe("M");
    expect(getCanonicalShiftCode("08:00-16:00")).toBe("M");
    expect(getCanonicalShiftCode("8:00-16:00")).toBe("M");
  });

  it("maps afternoon shift 16:00-24:00 or 16:00-00:00 to canonical code A", () => {
    expect(getCanonicalShiftCode("16:00-24:00", "OT-1.5X", 8)).toBe("A");
    expect(getCanonicalShiftCode("16:00-00:00")).toBe("A");
    expect(getCanonicalShiftCode("16:00 - 24:00")).toBe("A");
  });

  it("preserves non-OT standard matrix shift codes", () => {
    expect(getCanonicalShiftCode("08:00-16:00", "M8", 8)).toBe("M8");
    expect(getCanonicalShiftCode("16:00-24:00", "A8", 8)).toBe("A8");
    expect(getCanonicalShiftCode("00:00-08:00", "N8", 8)).toBe("N8");
    expect(getCanonicalShiftCode("08:00-20:00", "M12", 12)).toBe("M12");
  });

  it("renders distinct badges for M, A, and N shifts in maritime design system", () => {
    const styleM = getShiftStyle("M");
    const styleA = getShiftStyle("A");
    const styleN = getShiftStyle("N");

    expect(styleM).toContain("bg-[#CFE2F3]");
    expect(styleA).toContain("bg-[#FFF2CC]");
    expect(styleN).toContain("bg-[#FCE5CD]");
  });

  it("calculates 8-hour shift duration for M, A, N", () => {
    expect(getShiftDurationHours("M")).toBe(8);
    expect(getShiftDurationHours("A")).toBe(8);
    expect(getShiftDurationHours("N")).toBe(8);
  });
});
