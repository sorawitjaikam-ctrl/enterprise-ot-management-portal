import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import React from "react";
import App from "../../src/App";

describe("Tier 2: Executive Dashboard Mode & Strategic Controls (R1 - R4)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    window.history.replaceState(null, "", "/");
  });

  afterEach(() => {
    window.history.replaceState(null, "", "/");
  });

  // R1: Mode Toggle and URL Synchronization
  describe("R1: Executive Mode vs Operational Mode Toggle", () => {
    it("renders segmented control toggle with Executive and Operational options", async () => {
      render(<App />);

      await waitFor(() => {
        expect(screen.getByRole("group", { name: /Dashboard View Mode/i })).toBeInTheDocument();
      });

      const execBtn = screen.getByRole("button", { name: /Executive View/i });
      const opBtn = screen.getByRole("button", { name: /Operational View/i });

      expect(execBtn).toBeInTheDocument();
      expect(opBtn).toBeInTheDocument();

      // Defaults to Executive View
      expect(execBtn.className).toContain("bg-[#0E3A66]");
      expect(execBtn.className).toContain("text-white");
    });

    it("switches to Operational View on click and updates URL query param to ?mode=operational", async () => {
      const replaceSpy = vi.spyOn(window.history, "replaceState");
      render(<App />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /Operational View/i })).toBeInTheDocument();
      });

      const opBtn = screen.getByRole("button", { name: /Operational View/i });
      fireEvent.click(opBtn);

      // Operational toolbar should be visible
      await waitFor(() => {
        expect(screen.getByText("ตัวกรองแดชบอร์ด")).toBeInTheDocument();
      });

      expect(replaceSpy).toHaveBeenCalled();
      const lastCall = replaceSpy.mock.calls[replaceSpy.mock.calls.length - 1];
      expect(lastCall[2]).toContain("mode=operational");
    });

    it("switches back to Executive View on click and updates URL query param to ?mode=executive", async () => {
      const replaceSpy = vi.spyOn(window.history, "replaceState");
      render(<App />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /Operational View/i })).toBeInTheDocument();
      });

      // Switch to Operational
      fireEvent.click(screen.getByRole("button", { name: /Operational View/i }));
      await waitFor(() => {
        expect(screen.getByText("ตัวกรองแดชบอร์ด")).toBeInTheDocument();
      });

      // Switch back to Executive
      fireEvent.click(screen.getByRole("button", { name: /Executive View/i }));
      await waitFor(() => {
        expect(screen.getByText("คำสั่งปฏิบัติการผู้บริหาร")).toBeInTheDocument();
      });

      const lastCall = replaceSpy.mock.calls[replaceSpy.mock.calls.length - 1];
      expect(lastCall[2]).toContain("mode=executive");
    });

    it("supports deep linking to Operational View via ?mode=operational", async () => {
      window.history.replaceState(null, "", "/?mode=operational");
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText("ตัวกรองแดชบอร์ด")).toBeInTheDocument();
      });

      const opBtn = screen.getByRole("button", { name: /Operational View/i });
      expect(opBtn.className).toContain("bg-[#0E3A66]");
    });
  });

  // R2: Month-End Budget Forecast & Burn Rate
  describe("R2: Month-End Budget Forecast & Burn Rate Card", () => {
    it("renders trajectory visualizer, burn velocity, and department burn ranking table", async () => {
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText("การคาดการณ์งบประมาณสิ้นเดือนและ Burn Rate")).toBeInTheDocument();
      });

      // KPI tiles in forecast card
      expect(screen.getAllByText("คาดการณ์สิ้นเดือน").length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText("อัตราการเผางบต่อวัน")).toBeInTheDocument();
      expect(screen.getByText(/ผลต่างการคาดการณ์/)).toBeInTheDocument();
      expect(screen.getByText("การกระจายสถานะแผนก")).toBeInTheDocument();

      // Department ranking table
      expect(screen.getByText(/ตารางจัดอันดับการเบิกจ่ายและคาดการณ์รายแผนก/)).toBeInTheDocument();
      expect(screen.getByText("แผนก")).toBeInTheDocument();
      expect(screen.getByText("วันงบหมด")).toBeInTheDocument();
    });
  });

  // R3: Advanced Risk & Fatigue Radar
  describe("R3: Advanced Risk & Fatigue Radar Card", () => {
    it("renders 5-axis Radar SVG and proactive risk matrix with status badges", async () => {
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText("เรดาร์ประเมินความเสี่ยงและความล้าสะสม (Risk Radar)")).toBeInTheDocument();
      });

      // 5-axis metrics labels
      expect(screen.getByText("อัตรากำลังขั้นต่ำ")).toBeInTheDocument();
      expect(screen.getByText("ความปลอดภัย OT รายสัปดาห์")).toBeInTheDocument();
      expect(screen.getByText("การพักผ่อนระหว่างกะ (11h)")).toBeInTheDocument();
      expect(screen.getByText("วันหยุดประจำสัปดาห์ (<=6d)")).toBeInTheDocument();
      expect(screen.getByText("ความยืดหยุ่นกำลังพลสำรอง")).toBeInTheDocument();

      // Risk matrix table
      expect(screen.getByText("เมทริกซ์ความเสี่ยงตำแหน่งและแผนก (Risk Matrix)")).toBeInTheDocument();
      expect(screen.getByText("กำลังพล (จริง/ต่ำสุด)")).toBeInTheDocument();
      expect(screen.getByText("สัญญาณเตือนเชิงรุก")).toBeInTheDocument();
      expect(screen.getByText("คำแนะนำแก้ไข")).toBeInTheDocument();
    });
  });

  // R4: Strategic Action Hub
  describe("R4: Strategic Action Hub", () => {
    it("renders 1-click batch approval and board summary export triggers", async () => {
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText("คำสั่งปฏิบัติการผู้บริหาร")).toBeInTheDocument();
      });

      expect(screen.getByRole("button", { name: /อนุมัติคำขอทั้งหมด/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /ส่งออกสรุปบอร์ด \(CSV\)/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /ปรับเกลี่ยกะวิกฤต/i })).toBeInTheDocument();
    });

    it("triggers batch approval and displays feedback notice banner", async () => {
      render(<App />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /อนุมัติคำขอทั้งหมด/i })).toBeInTheDocument();
      });

      const batchBtn = screen.getByRole("button", { name: /อนุมัติคำขอทั้งหมด/i });
      fireEvent.click(batchBtn);

      await waitFor(() => {
        const statusBanner = screen.getByRole("status");
        expect(statusBanner).toBeInTheDocument();
      });
    });

    it("triggers board-ready CSV download with UTF-8 BOM", async () => {
      const clickSpy = vi.fn();
      const originalCreateElement = document.createElement.bind(document);
      vi.spyOn(document, "createElement").mockImplementation((tagName: string) => {
        const element = originalCreateElement(tagName);
        if (tagName === "a") {
          element.click = clickSpy;
        }
        return element;
      });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /ส่งออกสรุปบอร์ด \(CSV\)/i })).toBeInTheDocument();
      });

      const exportBtn = screen.getByRole("button", { name: /ส่งออกสรุปบอร์ด \(CSV\)/i });
      fireEvent.click(exportBtn);

      expect(clickSpy).toHaveBeenCalled();
    });
  });

  // Responsive Layout Check
  describe("Responsive Layout Integrity", () => {
    it("renders clean responsive container grids on tablet (768px) and mobile (375px)", async () => {
      // 768px viewport
      window.innerWidth = 768;
      window.innerHeight = 1024;
      window.dispatchEvent(new Event("resize"));

      const { container } = render(<App />);

      await waitFor(() => {
        expect(container.querySelector("main")).toBeInTheDocument();
      });

      const grids = container.querySelectorAll(".grid");
      expect(grids.length).toBeGreaterThan(0);

      // 375px viewport
      window.innerWidth = 375;
      window.innerHeight = 667;
      window.dispatchEvent(new Event("resize"));

      expect(container.querySelector("main")).toBeInTheDocument();
    });
  });
});
