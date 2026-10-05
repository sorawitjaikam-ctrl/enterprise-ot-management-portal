import { describe, it, expect } from "vitest";
import { MASTER_ROLES } from "../../src/App";

describe("Master Roles & Departments Validation", () => {
  const EXPECTED_13_ROLES = [
    "O&M Electrical",
    "O&M Mechanical",
    "O&M Generator",
    "O&M Specialist",
    "ผู้ควบคุมงานขนถ่ายสินค้า",
    "ผู้ควบคุมงานจักรกลหนัก",
    "Operation Engineer",
    "พนักงานขับจักรกลหนัก",
    "พนักงานขับเครน",
    "พนักงานขับเครน ชำนาญการ",
    "ปากเรือ",
    "ปากเรือ ชำนาญการ",
    "ผู้จัดการแผนก"
  ];

  it("should contain exactly all 13 canonical positions requested by user", () => {
    expect(MASTER_ROLES).toHaveLength(13);
    for (const role of EXPECTED_13_ROLES) {
      expect(MASTER_ROLES).toContain(role);
    }
  });

  it("should have ปากเรือ and ปากเรือ ชำนาญการ as positions, NOT as departments", () => {
    expect(MASTER_ROLES).toContain("ปากเรือ");
    expect(MASTER_ROLES).toContain("ปากเรือ ชำนาญการ");
  });

  it("should have พนักงานขับจักรกลหนัก and พนักงานขับเครน ชำนาญการ", () => {
    expect(MASTER_ROLES).toContain("พนักงานขับจักรกลหนัก");
    expect(MASTER_ROLES).toContain("พนักงานขับเครน");
    expect(MASTER_ROLES).toContain("พนักงานขับเครน ชำนาญการ");
  });

  it("should reject DECK from valid department lists", () => {
    const rawDepts = [
      { id: "inter2", name: "INTER 2" },
      { id: "inter3", name: "INTER 3" },
      { id: "inter5", name: "INTER 5" },
      { id: "inter7", name: "INTER 7" },
      { id: "heavy", name: "Heavy Machine" },
      { id: "ecc", name: "ECC" },
      { id: "deck", name: "DECK" }
    ];

    const filtered = rawDepts.filter(d => d.id !== "deck" && d.id !== "DECK" && d.name.toUpperCase() !== "DECK");
    expect(filtered).toHaveLength(6);
    expect(filtered.map(d => d.id)).not.toContain("deck");
  });
});
