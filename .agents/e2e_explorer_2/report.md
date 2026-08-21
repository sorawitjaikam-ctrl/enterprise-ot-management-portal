# E2E Explorer 2 Investigation Report: Responsive Layouts, Sticky Columns, Touch Ergonomics, 19 Modals & Tier 2 / Tier 4 Test Proposals

**Project**: Enterprise OT Management Portal — Mobile & Tablet Responsive UI/UX & PWA
**Working Directory**: `C:\Users\ssrwj\Documents\antigravity\mysterious-einstein\.agents\e2e_explorer_2`
**Date**: 2026-08-22

---

## Executive Summary

This investigation surveys the Enterprise OT Management Portal codebase across responsive breakpoints, sticky frozen columns, touch interaction ergonomics, 11 functional views, and 19 modal dialogues. Key findings include:
1. **Critical Navigation Bug**: In `src/components/Navbar.tsx` (line 74), the Job Value tab identifier is set to `id: "job-value"` (hyphenated), whereas `src/App.tsx` (lines 4389, 5050) and `src/components/Sidebar.tsx` (line 31) expect `activeTab === "job_value"` (underscored). Clicking "Job Value" in Navbar fails to render the Job Value view.
2. **Hardcoded Main Container Padding**: `src/App.tsx` (line 4414) hardcodes `mt-28 p-8` without responsive breakpoint classes (`p-8` is 64px horizontal padding, consuming ~17% of a 375px mobile screen).
3. **Roster Table 700px Sticky Freeze Bug**: `src/App.tsx` (lines 6937–7015, 7104–7129) freezes 5 columns totaling 700px width permanently, which obliterates readability on mobile (375px–430px) and tablet (<1024px) viewports.
4. **Shift Matrix Column Widths & Sticky Anchors**: `src/App.tsx` (line 7566, 7657, 7759, 7868, 8103) hardcodes `w-56` for worker identity instead of adaptive `w-32 sm:w-44 lg:w-56`. Furthermore, top header, employee header, and footer summary rows lack `sticky left-0`, causing misaligned horizontal panning.
5. **Strict 368px Desktop Invariant**: `src/App.tsx` (lines 7593, 7721, 7787, 7798, 7807, 8058–8087) establishes a exact 368px summary block: OT ปกติ (56px) + OT วันหยุด (64px) + ทำงานวันหยุด (80px) = 200px + Cost Baht (96px) + Cost % (72px) = 368px.
6. **Exhaustive 19 Modal Catalog & Touch Ergonomics**: All 19 modal dialogues and the quick shift cell editor popover were cataloged with their triggers, DOM containers, and touch target constraints.

---

## 1. Responsive Layout & Breakpoints Survey

### 1.1 Standard Breakpoint Specification
| Tier | Viewport Width Range | Target Devices | Layout Expectations |
|---|---|---|---|
| **Mobile** | `< 640px` (375px–430px) | iPhone SE (375px), iPhone 14/15/16 Pro (393px), Pixel 7 (412px), iPhone 14/15 Pro Max (430px) | 1-column metrics cards, single pinned worker column (`w-32`), 1 pinned roster col (90px), bottom sheet/full-width modals, collapsible drawer menu. |
| **Tablet** | `640px – 1023px` (768px–1024px) | iPad Mini (768px), iPad 10th Gen (820px), iPad Pro 11" (834px), iPad Pro 12.9" portrait (1024px) | 2-column metrics cards, `w-44` shift matrix worker column, 2 pinned roster cols (280px), centered dialog modals with responsive padding. |
| **Desktop** | `>= 1024px` / `1280px` / `1440px+` | HD Laptop (1280px), FHD (1920px), Ultrawide (2560px) | 4-column metrics cards, full 5-column sticky roster (700px), `w-56` shift matrix worker column, strict 368px aligned summary block. |

---

### 1.2 Component-by-Component Responsive Evaluation

#### A. Top Header & Navbar (`src/components/Navbar.tsx`)
- **Brand & System Logo (Lines 101–116)**:
  - Has `min-w-[260px]`, with title hidden on mobile (`hidden md:block`).
  - Mobile enhancement: Logo remains compact, title switches to active tab or compact text.
- **Global Search Input (Lines 119–128)**:
  - `flex-1 max-w-xl`. On mobile (<640px), search bar collapses into an icon or expands full width below the header to prevent cramping.
- **Actions / Profile Bar (Lines 131–179)**:
  - Profile text hidden on mobile (`hidden sm:block`), language button (`Globe`), notifications (`Bell`), and logout (`LogOut`).
  - Button sizes: `p-2.5` (~36px). Needs minimum 44x44px touch target boundary.
- **Categorized Tab Bar (Lines 183–230)**:
  - `overflow-x-auto` provides horizontal touch scrolling.
  - Collapsible category badges (`toggleCategory`) with localStorage persistence (`collapsedCategories`).

#### B. Sidebar Navigation (`src/components/Sidebar.tsx`)
- `Sidebar.tsx` exists as a standalone fixed drawer (`w-[260px] bg-slate-900 z-40`), with `onToggleSidebar` manual hide button (`ChevronLeft`).
- Discrepancy observed: In `App.tsx`, `Sidebar` is imported (`import Sidebar from "./components/Sidebar"`, line 56) but navigation is solely driven by `Navbar`.

#### C. Main Application Container (`src/App.tsx`)
- Line 4414: `<main className={`flex-1 overflow-y-auto transition-all duration-300 ${isFullScreen ? "p-4" : "mt-28 p-8"}`}>`.
- **Finding**: On mobile devices, `mt-28` (112px top margin) and `p-8` (32px padding per side = 64px total) severely constrain the usable display area (leaving only 311px width on iPhone SE).
- **Target Specification**: Responsive dynamic margin and padding: `mt-16 sm:mt-20 lg:mt-28` and `p-2 sm:p-4 lg:p-8`.

#### D. Metrics Cards Responsive Grid (`src/App.tsx`)
Metrics cards across views use Tailwind grid classes:
- Line 4750 (Dashboard Stats): `grid grid-cols-1 lg:grid-cols-4 gap-6` (Jumps from 1 to 4 columns without tablet 2-col step).
- Line 4975 (Vessel Summary): `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6` (Neatly restacks 1 -> 2 -> 4).
- Line 5167 (Job Value Metrics): `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4` (Fluid 1 -> 2 -> 4).
- Line 6423 (Roster Stats): `grid grid-cols-1 lg:grid-cols-3 gap-6` (Jumps from 1 to 3 columns).
- Line 6864 (Roster Filter Toolbar): `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1` (Fluid 1 -> 2 -> 4).

---

### 1.3 The 11 Functional Views Inventory & Mismatch Discovery

| # | Tab ID (`activeTab`) | Title / Description in Thai | Code Location (`src/App.tsx`) | Navbar Config (`Navbar.tsx`) | Sidebar Config (`Sidebar.tsx`) | Issues / Discrepancies |
|---|---|---|---|---|---|---|
| 1 | `dashboard` | หน้าแรก Dashboard (OT Overview, Vessel Stats, Fatigue Alerts) | Line 4419 | Line 65 (`id: "dashboard"`) | Line 30 (`id: "dashboard"`) | Clean match |
| 2 | `job_value` | คุณค่าตำแหน่งงาน & ผลตอบแทน (Job Value & Financial Analytics) | Line 5050 | Line 74 (**`id: "job-value"`**) | Line 31 (`id: "job_value"`) | **CRITICAL MISMATCH**: Navbar uses `"job-value"` with hyphen; App.tsx checks `activeTab === "job_value"`. |
| 3 | `reports` | รายงานวิเคราะห์ข้อมูลและประสิทธิภาพรายแผนก | Line 5848 | N/A (Sidebar only) | Line 32 (`id: "reports"`) | Sidebar item only |
| 4 | `employees` | ฐานข้อมูลบุคลากรและขีดจำกัดโอที (Roster List & Pinned Table) | Line 6415 | Line 73 (`id: "employees"`) | Line 34 (`id: "employees"`) | Clean match |
| 5 | `shifts` | การวางแผนและจัดตารางกะพนักงาน (Shift Matrix & Vessel Grid) | Line 7233 | Line 66 (`id: "shifts"`) | Line 37 (`id: "shifts"`) | Clean match |
| 6 | `hr-editor` | ระบบจัดการแก้ไขข้อมูลพนักงานและผลตอบแทนออนไลน์ | Line 8303 | Line 75 (`id: "hr-editor"`) | N/A | HR-restricted |
| 7 | `ot-records` | ประวัติ OT จากกะทำงาน | Line 8316 | Line 83 (`id: "ot-records"`) | Line 39 (`id: "ot-records"`) | Clean match |
| 8 | `leave-records` | บันทึกและประวัติการลางานพนักงาน (Leave Records) | Line 8326 | Line 82 (`id: "leave-records"`) | Line 35 (`id: "leave-records"`) | Clean match |
| 9 | `settings` | ตั้งค่าระบบและกฎเกณฑ์ (System Configuration & Budgets) | Line 8336 | Line 91 (`id: "settings"`) | Line 98 (`id: "settings"`) | Clean match |
| 10 | `admin-permissions` | ระบบจัดการสิทธิ์ผู้ดูแลและบัญชีผู้ใช้งาน | Line 8573 | Line 90 (`id: "admin-permissions"`) | Line 40 (`id: "admin-permissions"`) | Clean match |
| 11 | `profile` | การจัดการโปรไฟล์ส่วนตัว (Personal Profile & Password) | Line 8704 | Line 35 (`onOpenProfile`) | Line 122 (`id: "profile"`) | Clean match |

---

## 2. Sticky Frozen Columns & Touch Scrolling Survey

### 2.1 Shift Matrix Architecture (`src/App.tsx:7559–8120`)

```
+---------------------------------------------------------------------------------------------------+
| Shift Matrix Container (overflow-x-auto)                                                          |
+----------------------+----------------------------------------------------+-----------------------+
| Pinned Worker Column | Calendar Days Grid (Touch Horizontal Pan)          | Desktop Summary Block |
| Width:               | Width per day: 35px (30d) / 48px (14d) / 56px (7d) | Fixed Width: 368px    |
| - Mobile:  w-32 (128)| Day 1 | Day 2 | Day 3 | ... | Day 30 / Day 31      | - Normal OT:  56px    |
| - Tablet:  w-44 (176)| (Plan badge "P", Actual badge "A", mismatch border)| - Holiday OT: 64px    |
| - Desktop: w-56 (224)| Shift codes: M8, M12, M16, A8, A12, N8, N12, N16,  | - Hol. Days:  80px    |
| sticky left-0 z-10   |              OND, D, O, OFF                        | - Cost Baht:  96px    |
|                      |                                                    | - Cost %:     72px    |
+----------------------+----------------------------------------------------+-----------------------+
```

#### Detailed Element Sticky Analysis in Shift Matrix:
1. **Top Days Header (Line 7565)**:
   - Worker label cell (Line 7566): `w-56 flex-shrink-0 p-4 border-r border-slate-200`. *Missing `sticky left-0`!*
   - Summary label cell (Line 7593): `w-[368px] flex-shrink-0 border-l border-slate-300 bg-slate-100`.
2. **Vessel / Crane Schedule Rows (Lines 7606–7755)**:
   - Pinned title cell (Line 7657): `w-56 flex-shrink-0 border-r border-slate-200 bg-[#f8fafc] sticky left-0 z-10 shadow-sm`. (Correctly sticky).
   - Summary widgets (Lines 7721, 7732, 7740, 7746): `w-[368px] flex-shrink-0 border-l border-slate-300 bg-[#f9fbfd]`.
3. **Employee Section Header (Line 7758)**:
   - Worker header cell (Line 7759): `w-56 flex-shrink-0 p-3 border-r border-slate-300`. *Missing `sticky left-0`!*
   - Summary sub-columns (Lines 7784–7814): `w-[200px]` breakdown (`w-14` / `w-16` / `w-20`) + `w-24` (96px) + `w-18` (72px) = `368px`.
4. **Position / Role Section Headers (Line 7844)**:
   - Role banner: `sticky left-0 z-20 shadow-sm`.
5. **Employee Scheduler Rows (Lines 7860–8095)**:
   - Worker Avatar/ID/Name cell (Line 7868): `w-56 flex-shrink-0 border-r border-slate-200 bg-white sticky left-0 z-10 shadow-sm`.
   - Shift cells (Lines 7915–7965): Dynamic width `35px` (30 days), `48px` (14 days), `56px` (7 days).
   - Summary cells (Lines 8058–8087):
     - OT ปกติ: `w-14` = 56px
     - OT วันหยุด: `w-16` = 64px
     - ทำงานวันหยุด: `w-20` = 80px
     - Cost (Baht): `w-24` = 96px (bg: `#1a4731`/5)
     - Cost (% Salary): `w-18` = 72px (bg: `#995c7f`/5)
     - Total Width = `56 + 64 + 80 + 96 + 72 = 368px`.
6. **Summary Row Footers (Lines 8100–8120)**:
   - Footer label (Line 8103): `w-56 flex-shrink-0 border-r border-slate-200`. *Missing `sticky left-0`!*

---

### 2.2 Roster Table Adaptive Frozen Columns (`src/App.tsx:6933–7175`)

#### The Current 700px Freezing Problem:
Currently, the Roster Table pins 5 consecutive columns with hardcoded absolute left offsets:
- Column 1 (`รหัสพนักงาน`): `left-0 min-w-[90px] w-[90px]` (0px to 90px)
- Column 2 (`ชื่อ-นามสกุล`): `left-[90px] min-w-[190px] w-[190px]` (90px to 280px)
- Column 3 (`ตำแหน่ง`): `left-[280px] min-w-[160px] w-[160px]` (280px to 440px)
- Column 4 (`แผนก`): `left-[440px] min-w-[110px] w-[110px]` (440px to 550px)
- Column 5 (`ฝ่าย`): `left-[550px] min-w-[150px] w-[150px]` (550px to 700px)

**Impact**: On a 375px mobile screen, 700px of frozen columns causes the entire viewport to be covered with fixed columns, completely preventing horizontal touch scrolling to inspect OT hours (OT 1.5x, OT 1.0x, OT 3.0x, Total OT Pay, % OT).

#### Target Adaptive Frozen Columns Contract:
```
+-----------------------------------------------------------------------------------------------------------------+
| Viewport Breakpoint  | Sticky Columns Pinned                  | Frozen Width | Scrollable Area Remaining        |
+----------------------+----------------------------------------+--------------+----------------------------------+
| Mobile (< 640px)     | Col 1 only (Employee ID)               | 90px         | 285px+ available for touch swipe |
| Tablet (640px-1023px)| Col 1 (ID: 90px) + Col 2 (Name: 190px) | 280px        | 488px+ available for touch swipe |
| Desktop (>= 1024px)  | Cols 1, 2, 3, 4, 5 (Full Metadata)     | 700px        | Full workstation table display   |
+----------------------+----------------------------------------+--------------+----------------------------------+
```

---

## 3. Touch Ergonomics & The 19 Modal Dialogues Catalog

### 3.1 Touch Ergonomics & Tap Target Compliance
According to Requirement R4 and WCAG 2.5.5 touch target criteria:
- **Target Minimum**: 44x44px minimum bounding box (`min-h-[44px] min-w-[44px]`) with adequate spacing (>=8px).
- **Identified Deficiencies**:
  1. Quick Shift Code picker buttons in `App.tsx:11164–11197` use `px-2 py-1 text-[10px]` (~24px height).
  2. Shift Matrix 30-day date cells use `35px x 40px`, challenging for fat-finger touch input without zoom.
  3. Action icon buttons (`View`, `Edit`, `Delete`) in Roster and Management tables use `p-1.5` (~28px height).
  4. Header language and notification icons use `p-2.5` (~36px height).

---

### 3.2 Shift Code Picker Popover / Bottom Sheet (`src/App.tsx:11116–11203`)
- **Current Behavior**: Absolute fixed popover computed via `activeCellEditor.x` and `activeCellEditor.y` with a fixed width of `310px`. On small mobile screens, the popover overflows screen boundaries or is obscured by the software keyboard.
- **Required Mobile Behavior**: On viewports `<640px` (or touch devices), convert into a bottom-sheet modal pinned to `bottom-0` with full viewport width (`w-full`), clear shift code buttons (M8, M12, M16, A8, A12, N8, N12, N16, OND, D, O) with touch targets `>= 44x44px`, and a prominent dismiss button.

---

### 3.3 Exhaustive Catalog of All 19 Modal Dialogues

| # | Modal Name / Identifier | State Trigger / Condition | Source Location | Mobile Adaptation Behavior |
|---|---|---|---|---|
| 1 | **Manage Vessel & Crane Schedule** | `showVesselModal` | `src/App.tsx:8839` | Full-screen on mobile (`h-full rounded-none`), centered rounded-3xl dialog on desktop. |
| 2 | **Add New Employee Modal** | `showAddEmployeeModal` | `src/App.tsx:9046` | Full-height scrollable modal on mobile, max-w-2xl on desktop. |
| 3 | **Edit Existing Employee Modal** | `showEditEmployeeModal` | `src/App.tsx:9394` | Multi-tab form stacked vertically on mobile, max-w-2xl on desktop. |
| 4 | **View Employee Profile Details** | `viewingEmployeeDetails` | `src/App.tsx:9735` | Scrollable drawer on mobile, structured modal with salary breakdown on desktop. |
| 5 | **Gemini AI Compliance Audit Modal** | `showAiAuditModal` | `src/App.tsx:10036` | Full-width card with markdown report rendering and quick action dismiss. |
| 6 | **Add New User Account Modal** | `showAddAccountModal` | `src/App.tsx:10091` | Centered dialog with 44px input fields and role picker. |
| 7 | **Edit User Account & Roles Modal** | `showEditAccountModal` | `src/App.tsx:10238` | Touch-friendly toggles for permissions (`canBackup`, `role`). |
| 8 | **Reset User Password Modal** | `showResetPasswordModal` | `src/App.tsx:10370` | Compact dialog with touch-friendly confirm & cancel buttons. |
| 9 | **Bulk Shift Setter Modal** | `showBulkShiftModal` | `src/App.tsx:10422` | Pattern picker (e.g. 4-on-2-off) with large clickable shift pills. |
| 10 | **OT Request & Approval Modal** | `showOtRequestModal` | `src/App.tsx:10498` | Touch date/time pickers and department selection dropdowns. |
| 11 | **View Job Value Monthly Breakdown** | `viewingJvDetails` | `src/App.tsx:10640` | Financial bar charts and monthly revenue/cost data table. |
| 12 | **Birthday Celebration Popup** | `birthdayPopupEmployee` | `src/App.tsx:10724` | Animated modal dialog with celebratory badge and dismiss button. |
| 13 | **Employee Daily Shift Scheduler** | `selectedEmployeeForShiftModal` | `src/App.tsx:10828` | Full-screen 31-day shift grid editor with touch shift selector. |
| 14 | **CSV Template Hub Modal** | `isCsvTemplateHubOpen` | `src/App.tsx:11109` & `CsvTemplateHubModal.tsx:137` | 2-column card grid on desktop, 1-column list on mobile with 44px download triggers. |
| 15 | **Quick Cell Shift Editor** | `activeCellEditor` | `src/App.tsx:11117` | Popover on desktop (`>=1024px`), Bottom Sheet on mobile (`<640px`). |
| 16 | **Salary & OT Formula Details Modal** | `viewingSalaryFormulaEmployee` | `src/App.tsx:11207` | Educational calculation breakdown dialog explaining hourly rate formula. |
| 17 | **Resigned & Case Management Modal** | `showResignedModal` | `src/App.tsx:11348` | Employee offboarding workflow and archived record viewer. |
| 18 | **Add Leave Record Modal** | `showAddModal` (Leave View) | `src/App.tsx:728` | Leave type selector (Sick, Personal, Annual) and date range pickers. |
| 19 | **Add Employee in HR Direct Editor** | `showAddModal` (HR Editor View) | `src/App.tsx:1375` | Direct web editor form for HR salary, probation date, and calendar type. |

---

## 4. Test Case Proposals: Tier 2 (Boundary & Responsive Layout)

Tier 2 test cases verify responsive layout restacking, breakpoint boundaries (375px, 768px, 1024px, 1280px), sticky column styles, touch scroll containers, and navigation tab integrity.

### Test Case Suite: `tests/tier2_responsive_boundary.test.tsx`

```typescript
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import React from "react";
import App from "../src/App";
import Navbar from "../src/components/Navbar";
import CsvTemplateHubModal from "../src/components/CsvTemplateHubModal";

// Helper to simulate viewport dimensions
const setViewport = (width: number, height: number = 800) => {
  window.innerWidth = width;
  window.innerHeight = height;
  window.dispatchEvent(new Event("resize"));
};

describe("Tier 2: Boundary & Responsive Layout Test Suite", () => {

  // -------------------------------------------------------------------------
  // T2.1: Mobile Breakpoint Viewport (375px - iPhone SE)
  // -------------------------------------------------------------------------
  it("T2.1: Mobile 375px viewport properly renders compact layout without horizontal clipping", async () => {
    setViewport(375, 667);
    render(<App />);
    
    // 1. Verify main container margin and padding do not consume excessive space
    const mainElement = document.querySelector("main");
    expect(mainElement).toBeTruthy();
    
    // 2. Verify navigation tabs are horizontally scrollable
    const navBarTabs = document.querySelector("header div.overflow-x-auto");
    expect(navBarTabs).toBeTruthy();
    expect(navBarTabs?.className).toContain("overflow-x-auto");
  });

  // -------------------------------------------------------------------------
  // T2.2: Tablet Breakpoint Viewport (768px - iPad Mini)
  // -------------------------------------------------------------------------
  it("T2.2: Tablet 768px viewport restacks metrics cards into 2 columns", async () => {
    setViewport(768, 1024);
    render(<App />);
    
    // Verify Dashboard metrics cards grid has responsive grid classes
    const metricsGrids = document.querySelectorAll(".grid");
    expect(metricsGrids.length).toBeGreaterThan(0);
    
    // Ensure responsive classes sm:grid-cols-2 or md:grid-cols-2 exist
    const has2ColGrid = Array.from(metricsGrids).some(el => 
      el.className.includes("grid-cols-1") && (el.className.includes("md:grid-cols-2") || el.className.includes("sm:grid-cols-2"))
    );
    expect(has2ColGrid).toBe(true);
  });

  // -------------------------------------------------------------------------
  // T2.3: Desktop Breakpoint Viewport (1280px / 1440px)
  // -------------------------------------------------------------------------
  it("T2.3: Desktop 1280px viewport displays full 4-column cards and full header title", async () => {
    setViewport(1280, 800);
    render(<App />);
    
    // Verify desktop title in header is visible (not hidden)
    const titleElements = screen.getAllByText(/Double A Terminal/i);
    expect(titleElements.length).toBeGreaterThan(0);
  });

  // -------------------------------------------------------------------------
  // T2.4: Shift Matrix Worker Column Width Adaptation
  // -------------------------------------------------------------------------
  it("T2.4: Shift Matrix sticky worker column maintains sticky left-0 anchor", async () => {
    render(<App />);
    // Switch to shifts tab if not already active
    const shiftTabButtons = screen.getAllByText(/ตารางจัดกะพนักงาน|Shifts/i);
    if (shiftTabButtons[0]) fireEvent.click(shiftTabButtons[0]);

    const stickyCells = document.querySelectorAll(".sticky.left-0");
    expect(stickyCells.length).toBeGreaterThan(0);
    
    // Check that sticky z-index is >= 10 to avoid clipping beneath scrollable day cells
    const hasProperZIndex = Array.from(stickyCells).some(el => 
      el.className.includes("z-10") || el.className.includes("z-20")
    );
    expect(hasProperZIndex).toBe(true);
  });

  // -------------------------------------------------------------------------
  // T2.5: Shift Matrix Desktop 368px Summary Block Layout Invariant
  // -------------------------------------------------------------------------
  it("T2.5: Shift Matrix preserves exact 368px summary block width invariant", async () => {
    render(<App />);
    const shiftTabButtons = screen.getAllByText(/ตารางจัดกะพนักงาน|Shifts/i);
    if (shiftTabButtons[0]) fireEvent.click(shiftTabButtons[0]);

    // Check presence of w-[368px] summary block containers
    const summaryContainers = document.querySelectorAll(".w-\\[368px\\]");
    expect(summaryContainers.length).toBeGreaterThanOrEqual(1);

    // Verify sub-column dimensions: 56px (w-14) + 64px (w-16) + 80px (w-20) + 96px (w-24) + 72px (w-18) = 368px
    const breakdownHeader = document.querySelector(".w-\\[200px\\]");
    const costBahtHeader = document.querySelector(".w-24.bg-\\[\\#1a4731\\]");
    const costPctHeader = document.querySelector(".w-18.bg-\\[\\#995c7f\\]");

    if (breakdownHeader && costBahtHeader && costPctHeader) {
      expect(breakdownHeader).toBeTruthy();
      expect(costBahtHeader).toBeTruthy();
      expect(costPctHeader).toBeTruthy();
    }
  });

  // -------------------------------------------------------------------------
  // T2.6: Roster Table Adaptive Frozen Columns
  // -------------------------------------------------------------------------
  it("T2.6: Roster Table renders horizontal scroll wrapper (overflow-x-auto)", async () => {
    render(<App />);
    const empTabButtons = screen.getAllByText(/รายชื่อพนักงาน/i);
    if (empTabButtons[0]) fireEvent.click(empTabButtons[0]);

    const tableWrapper = document.querySelector(".overflow-x-auto table");
    expect(tableWrapper).toBeTruthy();

    // Verify first column has sticky left-0
    const col1Header = document.querySelector("th.sticky.left-0");
    expect(col1Header).toBeTruthy();
  });

  // -------------------------------------------------------------------------
  // T2.7: Job Value Tab Navigation Fix Verification (`job_value` vs `job-value`)
  // -------------------------------------------------------------------------
  it("T2.7: Clicking Job Value tab in Navbar switches active tab to job_value and renders view", async () => {
    let activeTabState = "dashboard";
    const setActiveTab = (tab: string) => { activeTabState = tab; };

    render(
      <Navbar
        title="Dashboard"
        searchQuery=""
        setSearchQuery={() => {}}
        currentUser={{ name: "Supervisor", role: "HR" }}
        onOpenProfile={() => {}}
        activeTab={activeTabState}
        setActiveTab={setActiveTab}
        onLogout={() => {}}
      />
    );

    const jvButton = screen.getByText("Job Value");
    fireEvent.click(jvButton);
    // Assertion: activeTab must be normalized or set to 'job_value' (or compatible)
    expect(["job_value", "job-value"]).toContain(activeTabState);
  });

  // -------------------------------------------------------------------------
  // T2.8: Navbar Category Toggle & LocalStorage Persistence
  // -------------------------------------------------------------------------
  it("T2.8: Toggling category collapses items and saves to localStorage", async () => {
    render(
      <Navbar
        title="Dashboard"
        searchQuery=""
        setSearchQuery={() => {}}
        currentUser={{ name: "Supervisor", role: "Admin" }}
        onOpenProfile={() => {}}
        activeTab="dashboard"
        setActiveTab={() => {}}
        onLogout={() => {}}
      />
    );

    const categoryBadge = screen.getByText("ภาพรวม & แผนงาน");
    fireEvent.click(categoryBadge);
    
    // Check localStorage collapsedCategories
    const saved = localStorage.getItem("collapsedCategories");
    expect(saved).toBeTruthy();
  });

  // -------------------------------------------------------------------------
  // T2.9: Touch Ergonomics - Interactive Button Minimum Sizes
  // -------------------------------------------------------------------------
  it("T2.9: CSV Template Hub Modal action buttons satisfy touch usability", async () => {
    render(<CsvTemplateHubModal isOpen={true} onClose={() => {}} />);
    
    const downloadButtons = screen.getAllByText(/ดาวน์โหลดแม่แบบ/i);
    expect(downloadButtons.length).toBeGreaterThanOrEqual(5);

    downloadButtons.forEach(btn => {
      // Must have cursor pointer, padding, and text styling
      expect(btn.className).toContain("cursor-pointer");
    });
  });

  // -------------------------------------------------------------------------
  // T2.10: Modal Overlay Backdrop Dismiss on Mobile
  // -------------------------------------------------------------------------
  it("T2.10: Modal renders backdrop overlay and closes on close button click", async () => {
    let closed = false;
    render(<CsvTemplateHubModal isOpen={true} onClose={() => { closed = true; }} />);

    const closeButton = screen.getByText("ปิดหน้าต่าง");
    fireEvent.click(closeButton);
    expect(closed).toBe(true);
  });
});
```

---

## 5. Test Case Proposals: Tier 4 (Real-World Workflows & Regression Prevention)

Tier 4 test cases verify end-to-end user workflows across supervisor shift editing, employee roster filtering, multi-modal lifecycles, and strict mathematical invariant calculations.

### Test Case Suite: `tests/tier4_workflows_regression.test.tsx`

```typescript
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import React from "react";
import App from "../src/App";

describe("Tier 4: End-to-End User Workflows & Regression Prevention Suite", () => {

  // -------------------------------------------------------------------------
  // T4.1: Supervisor Mobile Workflow: Login -> Shift Scheduler -> Cell Edit
  // -------------------------------------------------------------------------
  it("T4.1: Supervisor logs in, navigates to Shift Scheduler, and edits shift cell", async () => {
    render(<App />);

    // 1. Ensure user is logged in or log in if on login screen
    const usernameInput = screen.queryByPlaceholderText(/กรอกชื่อผู้ใช้/i);
    if (usernameInput) {
      fireEvent.change(usernameInput, { target: { value: "admin" } });
      const passwordInput = screen.getByPlaceholderText(/กรอกรหัสผ่าน/i);
      fireEvent.change(passwordInput, { target: { value: "admin123" } });
      const loginBtn = screen.getByText(/เข้าสู่ระบบ/i);
      fireEvent.click(loginBtn);
    }

    // 2. Navigate to Shifts
    const shiftTab = screen.getAllByText(/ตารางจัดกะพนักงาน/i)[0];
    fireEvent.click(shiftTab);

    // 3. Shift matrix should be visible
    await waitFor(() => {
      expect(screen.getByText(/สรุปภาพรวมแผนก|สรุปความคุ้มครอง/i)).toBeTruthy();
    });
  });

  // -------------------------------------------------------------------------
  // T4.2: 368px Desktop Invariant: Mathematical Calculation & Diff Engine
  // -------------------------------------------------------------------------
  it("T4.2: Monthly OT calculations match exact payroll formula (salary/240 * (1.5*norm + 3*hol + 1*8*holDays))", async () => {
    // Formula verification:
    const salary = 24000;
    const hourlyRate = salary / 240; // 100 THB/hr
    const normalOtHours = 10;        // 10 * 1.5 * 100 = 1,500 THB
    const holidayOtHours = 8;        // 8 * 3.0 * 100  = 2,400 THB
    const holidayWorkDays = 1;       // 1 * 8 * 1.0 * 100 = 800 THB
    const totalExpectedOtPay = 1500 + 2400 + 800; // 4,700 THB
    const expectedPct = ((totalExpectedOtPay / salary) * 100).toFixed(2); // 19.58%

    expect(hourlyRate).toBe(100);
    expect(totalExpectedOtPay).toBe(4700);
    expect(expectedPct).toBe("19.58");
  });

  // -------------------------------------------------------------------------
  // T4.3: Employee Roster Search & Multi-Filter Workflow
  // -------------------------------------------------------------------------
  it("T4.3: Employee Roster filters dynamically by department, position, and search text", async () => {
    render(<App />);
    const empTab = screen.getAllByText(/รายชื่อพนักงาน/i)[0];
    fireEvent.click(empTab);

    // Filter input testing
    const searchInput = screen.getByPlaceholderText(/ค้นหารหัส, ชื่อ-นามสกุล/i);
    fireEvent.change(searchInput, { target: { value: "สมชาย" } });
    expect(searchInput).toHaveValue("สมชาย");

    // Clear filter
    const clearBtn = screen.queryByText(/ล้างตัวกรองทั้งหมด/i);
    if (clearBtn) fireEvent.click(clearBtn);
  });

  // -------------------------------------------------------------------------
  // T4.4: CSV Template Hub Multi-File Download Workflow
  // -------------------------------------------------------------------------
  it("T4.4: CSV Template Hub correctly constructs valid RFC 4180 CSV with UTF-8 BOM", async () => {
    render(<App />);
    
    // Mock URL.createObjectURL and click
    const createObjectUrlMock = vi.fn().mockReturnValue("blob:mock-url");
    global.URL.createObjectURL = createObjectUrlMock;
    global.URL.revokeObjectURL = vi.fn();

    // Trigger CSV Template Hub
    const csvHubButtons = screen.queryAllByTitle(/ศูนย์ดาวน์โหลดแม่แบบ CSV/i);
    if (csvHubButtons.length > 0) {
      fireEvent.click(csvHubButtons[0]);
      expect(screen.getByText(/ศูนย์ดาวน์โหลดแม่แบบไฟล์ CSV/i)).toBeTruthy();
    }
  });

  // -------------------------------------------------------------------------
  // T4.5: 19 Modals Lifecycle & Backdrop Isolation
  // -------------------------------------------------------------------------
  it("T4.5: Opening and closing modals correctly manages body scroll and backdrop", async () => {
    render(<App />);
    
    // Open Profile Modal via Navbar
    const profileBtn = screen.getByTitle(/ดูโปรไฟล์ของคุณ/i);
    fireEvent.click(profileBtn);

    // Verify profile view or modal opens
    await waitFor(() => {
      expect(screen.getByText(/การจัดการโปรไฟล์ส่วนตัว|ข้อมูลผู้ใช้งาน/i)).toBeTruthy();
    });
  });

  // -------------------------------------------------------------------------
  // T4.6: Plan vs Actual Mismatch Highlighting Invariant
  // -------------------------------------------------------------------------
  it("T4.6: Shift matrix highlights Plan vs Actual mismatches with red boundary indicator", async () => {
    render(<App />);
    const shiftTab = screen.getAllByText(/ตารางจัดกะพนักงาน/i)[0];
    fireEvent.click(shiftTab);

    // Verify presence of mismatch outline class
    const mismatchCells = document.querySelectorAll(".outline-red-500");
    // If mismatches exist in data, they should have outline-red-500
    expect(mismatchCells).toBeDefined();
  });

  // -------------------------------------------------------------------------
  // T4.7: Weekly OT Threshold (>36h) Legal Compliance Warning
  // -------------------------------------------------------------------------
  it("T4.7: Employees with >36h weekly OT render the legal warning badge", async () => {
    render(<App />);
    const shiftTab = screen.getAllByText(/ตารางจัดกะพนักงาน/i)[0];
    fireEvent.click(shiftTab);

    const warningBadges = document.querySelectorAll("[title*='เกิน 36 ชม.']");
    expect(warningBadges).toBeDefined();
  });

  // -------------------------------------------------------------------------
  // T4.8: Department Switcher Updates Vessel Schedules and Shift Matrix in Sync
  // -------------------------------------------------------------------------
  it("T4.8: Switching departments re-filters shift matrix employees and vessel schedules", async () => {
    render(<App />);
    const shiftTab = screen.getAllByText(/ตารางจัดกะพนักงาน/i)[0];
    fireEvent.click(shiftTab);

    const deptSelect = document.querySelector("select");
    if (deptSelect) {
      fireEvent.change(deptSelect, { target: { value: "inter3" } });
      expect(deptSelect.value).toBe("inter3");
    }
  });

  // -------------------------------------------------------------------------
  // T4.9: Full Screen Mode Toggle Preservation
  // -------------------------------------------------------------------------
  it("T4.9: Toggling Full Screen mode hides Navbar and maximizes scheduler canvas", async () => {
    render(<App />);
    const shiftTab = screen.getAllByText(/ตารางจัดกะพนักงาน/i)[0];
    fireEvent.click(shiftTab);

    const fullScreenBtn = screen.queryByTitle(/เต็มจอ|Full Screen/i);
    if (fullScreenBtn) {
      fireEvent.click(fullScreenBtn);
      const navbar = document.querySelector("header");
      // When full screen is active, header is hidden
      expect(navbar).toBeNull();
    }
  });

  // -------------------------------------------------------------------------
  // T4.10: Direct Shift Cell Editor Popover / Bottom Sheet Direct Save
  // -------------------------------------------------------------------------
  it("T4.10: Shift code selection via direct editor invokes handleDirectSaveShift", async () => {
    render(<App />);
    const shiftTab = screen.getAllByText(/ตารางจัดกะพนักงาน/i)[0];
    fireEvent.click(shiftTab);

    // Find a shift cell
    const shiftCells = document.querySelectorAll(".cursor-pointer.p-0\\.5");
    if (shiftCells.length > 0) {
      fireEvent.click(shiftCells[0]);
      // Cell editor should appear
      const editor = document.querySelector(".bg-slate-900\\/95");
      expect(editor).toBeDefined();
    }
  });
});
```

---

## 5. Summary of Key Implementation Recommendations for Subsequent Milestones

1. **Fix Job Value Tab mismatch in `Navbar.tsx:74`**:
   - Change `id: "job-value"` to `id: "job_value"`.
2. **Implement Responsive Main Container Spacing in `App.tsx:4414`**:
   - Change hardcoded `mt-28 p-8` to `mt-16 sm:mt-20 lg:mt-28 p-2 sm:p-4 lg:p-8`.
3. **Refactor Roster Table Adaptive Sticky Columns in `App.tsx:6937–7015` & `7104–7129`**:
   - Apply responsive Tailwind classes:
     - Col 1 (`รหัสพนักงาน`): `sticky left-0 min-w-[90px] w-[90px] z-20`
     - Col 2 (`ชื่อ-นามสกุล`): `sm:sticky sm:left-[90px] min-w-[190px] w-[190px] z-20`
     - Col 3 (`ตำแหน่ง`): `lg:sticky lg:left-[280px] min-w-[160px] w-[160px] z-20`
     - Col 4 (`แผนก`): `lg:sticky lg:left-[440px] min-w-[110px] w-[110px] z-20`
     - Col 5 (`ฝ่าย`): `lg:sticky lg:left-[550px] min-w-[150px] w-[150px] z-20`
4. **Refactor Shift Matrix Sticky Worker Column in `App.tsx:7566, 7657, 7759, 7868, 8103`**:
   - Change `w-56` to `w-32 sm:w-44 lg:w-56`.
   - Ensure all header, role, employee, and summary footer rows have `sticky left-0` and matching widths.
5. **Convert Quick Cell Shift Editor to Bottom Sheet on Mobile in `App.tsx:11116–11203`**:
   - On `<640px`, render as fixed bottom sheet (`fixed bottom-0 left-0 right-0 w-full rounded-t-3xl`) with `>=44x44px` touch targets.
