import { describe, it, expect, vi, beforeEach } from "vitest";
import { matchesEmpJv, isJvDepartment, isJvRole } from "../../src/App";

describe("Tier 4: Job Value CSV Import & Employee Normalization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe("matchesEmpJv Employee Matching", () => {
    it("matches identical IDs regardless of case", () => {
      expect(matchesEmpJv({ empId: "EMP-101" }, { id: "emp-101" })).toBe(true);
      expect(matchesEmpJv({ id: "688172" }, { id: "688172" })).toBe(true);
    });

    it("matches IDs with and without EMP- prefix", () => {
      expect(matchesEmpJv({ empId: "101" }, { id: "EMP-101" })).toBe(true);
      expect(matchesEmpJv({ empId: "EMP-101" }, { id: "101" })).toBe(true);
      expect(matchesEmpJv({ empId: "688172" }, { id: "EMP-688172" })).toBe(true);
    });

    it("matches by employee name with and without Thai prefixes", () => {
      expect(matchesEmpJv({ empName: "สมชาย ใจดี" }, { name: "นายสมชาย ใจดี" })).toBe(true);
      expect(matchesEmpJv({ empName: "นายสมชาย ใจดี" }, { name: "สมชาย ใจดี" })).toBe(true);
      expect(matchesEmpJv({ empName: "วิภา รักงาน" }, { name: "นางสาววิภา รักงาน" })).toBe(true);
    });

    it("returns false for completely different employees", () => {
      expect(matchesEmpJv({ empId: "EMP-101", empName: "สมชาย" }, { id: "EMP-102", name: "วิชัย" })).toBe(false);
    });
  });

  describe("isJvDepartment & isJvRole Invariants", () => {
    it("isJvDepartment accepts departments without dropping non-berth roles", () => {
      expect(isJvDepartment("inter2")).toBe(true);
      expect(isJvDepartment("INTER 2")).toBe(true);
      expect(isJvDepartment("heavy")).toBe(true);
      expect(isJvDepartment("Control Center")).toBe(true);
      expect(isJvDepartment("")).toBe(true);
    });

    it("isJvRole accepts all operational and uploaded roles without silently hiding data", () => {
      expect(isJvRole("Operator")).toBe(true);
      expect(isJvRole("Technician")).toBe(true);
      expect(isJvRole("ผู้ควบคุมงานขนถ่ายสินค้า")).toBe(true);
      expect(isJvRole("O&M - Specialist")).toBe(true);
      expect(isJvRole("")).toBe(true);
    });
  });
});
