# Comprehensive Codebase Architecture, UI Hierarchy & Responsive Layout Survey Report

**Project**: Enterprise OT Management Portal — Mobile & Tablet Responsive UI/UX & PWA Capabilities  
**Explorer Agent**: Explorer Survey 1 (`explorer_survey_1`)  
**Working Directory**: `C:\Users\ssrwj\Documents\antigravity\mysterious-einstein\.agents\explorer_survey_1`  
**Date**: 2026-08-22  

---

## 1. Executive Summary & Core Architectural Findings

The **Enterprise OT Management Portal** is a high-performance single-page enterprise web application for port and berth logistics operations (Double A Terminal). It manages shift scheduling across 6 port departments, overtime (OT) pay calculations, labor law fatigue compliance, and financial job value analytics.

### Key Architectural Characteristics:
1. **Frontend Core**: React 19 (`react` 19.0.1, `react-dom` 19.0.1) using modern TypeScript (`typescript` ~5.8.2) and Vite 6 (`vite` ^6.2.3, `@vitejs/plugin-react` ^5.0.4).
2. **Styling System**: Tailwind CSS v4 (`tailwindcss` ^4.1.14, `@tailwindcss/vite` ^4.1.14) configured with modern `@import "tailwindcss";` and `@theme` in `src/index.css`. Thai typography uses Google Fonts (`Sarabun`, `Noto Sans Thai`, `Inter`).
3. **Application Topology**:
   - `src/App.tsx` (11,598 lines): Houses the primary operational state, multi-view routing (`activeTab`), shift scheduling canvas, employee roster, calculation engines, and interactive modals.
   - `src/components/Navbar.tsx`: Two-tier top navigation header with brand identity, global search, user profile, and collapsible category pills.
   - `src/components/Sidebar.tsx`: Alternate drawer sidebar navigation.
   - `src/components/CsvTemplateHubModal.tsx`: Comprehensive CSV template generation and download hub.
   - `src/types.ts`: TypeScript domain models (`Employee`, `Department`, `JobValueRecord`, `LeaveRecord`, `VesselSchedule`, `AppState`).
   - `server.ts` & `functions/api/[[path]].ts`: Express & Cloudflare Pages D1 backend with REST API endpoints.
4. **Current Layout Constraints**:
   - Desktop-first layout with fixed top navbar (`mt-28` = 112px top spacing).
   - The Shift Scheduler matrix uses a fixed 224px (`w-56`) sticky left worker head and a rigid 368px aligned summary widget panel on the right.
   - The Employee Roster table features **5 sticky frozen columns** totaling 700px width (`left-0`, `left-[90px]`, `left-[280px]`, `left-[440px]`, `left-[550px]`), which requires responsive collapsing/panning optimization for mobile (375px–430px) and tablet (768px–1024px) screens.
   - Zero PWA assets currently exist (no `manifest.json`, no Service Worker, no touch icons, no mobile safe-area meta tags).

---

## 2. Framework, Build Tools & Dependency Landscape

### Package Dependencies (`package.json`)
```json
{
  "dependencies": {
    "@google/genai": "^2.4.0",
    "@tailwindcss/vite": "^4.1.14",
    "@vitejs/plugin-react": "^5.0.4",
    "dotenv": "^17.2.3",
    "express": "^4.21.2",
    "lucide-react": "^0.546.0",
    "motion": "^12.23.24",
    "react": "^19.0.1",
    "react-dom": "^19.0.1",
    "vite": "^6.2.3"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/node": "^22.14.0",
    "autoprefixer": "^10.4.21",
    "esbuild": "^0.25.0",
    "tailwindcss": "^4.1.14",
    "tsx": "^4.21.0",
    "typescript": "~5.8.2"
  }
}
```

### Build & Compilation Pipeline
- **Vite Config (`vite.config.ts`)**: Integrates `@vitejs/plugin-react` and `@tailwindcss/vite`, path aliases (`@ -> .`), and AI Studio HMR configuration.
- **Build Command (`npm run build`)**: Executes `vite build && esbuild server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs`. Compiles cleanly with zero bundle errors.
- **HTML Entry (`index.html`)**:
  - Sets `<html lang="th">` with `<meta name="viewport" content="width=device-width, initial-scale=1.0" />`.
  - Imports Google Fonts: `Sarabun`, `Inter`, `Noto Sans Thai`, and `Material Symbols Outlined`.
- **CSS Architecture (`src/index.css`)**:
  - Defines `@import "tailwindcss";` and `@theme { --font-sans: "Sarabun", "Noto Sans Thai", "Inter", ui-sans-serif, system-ui, sans-serif; }`.
  - Custom scrollbar styling (`::-webkit-scrollbar` with width/height 6px).
  - Maritime ocean wave keyframe animations (`animate-wave-1`, `animate-wave-2`, `animate-wave-3`, `animate-float-boat`, `animate-water-pulse`).

---

## 3. UI Component Hierarchy & View Layout Architecture

### 3.1 Header / Navbar / Navigation
- **File Path**: `src/components/Navbar.tsx` (234 lines) & `src/components/Sidebar.tsx` (146 lines)
- **Component**: `Navbar({ title, searchQuery, setSearchQuery, currentUser, onOpenProfile, activeTab, setActiveTab, onLogout, onOpenCsvTemplateHub }: NavbarProps)`
- **DOM Hierarchy**:
  - `header.fixed.top-0.left-0.right-0.z-40.bg-white/95.backdrop-blur-md.border-b`
    - **Top Row (Brand & Utility Bar, ~56px)**:
      - Brand Logo: "Double A Terminal" (`w-10 h-10` gradient badge) + Title subtitle.
      - Global Search Bar: `Search` icon input with placeholder `ค้นหาพนักงาน รหัสกะ เรือสินค้า...`.
      - Actions: Language selector (`TH` dropdown), Notifications bell with pulse badge, User Profile avatar button, Logout button (`LogOut`).
    - **Bottom Row (Categorized Menu Bar, ~44px)**:
      - Horizontal scrollable flex bar (`overflow-x-auto bg-slate-100/70`).
      - 4 Distinct Categories:
        1. **ภาพรวม & แผนงาน** (Blue): `dashboard` (หน้าแรก Dashboard), `shifts` (ตารางจัดกะพนักงาน).
        2. **การจัดการบุคลากร** (Emerald): `employees` (รายชื่อพนักงาน), `job-value` (Job Value), `hr-editor` (จัดการข้อมูลพนักงาน & รายได้ - HR only).
        3. **วันลา & ประวัติ OT** (Amber): `leave-records` (บันทึกวันลา), `ot-records` (ประวัติ OT จากกะ).
        4. **บริหารจัดการระบบ** (Purple - HR only): `admin-permissions` (สิทธิ์ผู้ใช้งาน), `settings` (ตั้งค่าระบบ).
      - Category badges can be toggled/collapsed individually, stored in `localStorage.collapsedCategories`.
- **Active Tab Router in `src/App.tsx` (Line 4419–8829)**:
  - Conditionally renders view containers based on `activeTab` state:
    - `"dashboard"`: Maritime Executive Dashboard (`App.tsx:4419`)
    - `"job_value"`: Job Value & Financial Analysis (`App.tsx:5050`)
    - `"reports"`: Department Analytics & Heatmaps (`App.tsx:5848`)
    - `"employees"`: Organization Chart & Employee Roster Table (`App.tsx:6415`)
    - `"shifts"`: Monthly Shift Scheduler Matrix (`App.tsx:7233`)
    - `"hr-editor"`: HR Web Direct Editor (`App.tsx:8303`)
    - `"ot-records"`: OT Daily Records View (`App.tsx:8316`)
    - `"leave-records"`: Leave Records & Analytics View (`App.tsx:8326`)
    - `"settings"`: System Settings & Overtime Rules (`App.tsx:8336`)
    - `"admin-permissions"`: User Accounts & Role Permissions (`App.tsx:8573`)
    - `"profile"`: Personal Profile Management (`App.tsx:8704`)

---

### 3.2 Shift Scheduler Matrix (`activeTab === "shifts"`)
- **File Path**: `src/App.tsx` (Lines 7233–8298)
- **Container Structure**:
  - Outer Wrapper: `div.space-y-4` with fullscreen toggle support (`isFullScreen ? "fixed inset-0 z-50 bg-white overflow-auto p-4" : ""`).
  - **Header Toolbar (`App.tsx:7237–7516`)**:
    - Department info badge (`currentDeptObj`), Workforce count (`กำลังพล`), Planner manager badge (`ผู้จัดแผนงาน`), Period month badge.
    - View Mode Switcher: 3-way toggle button group (`"plan"`, `"actual"`, `"both"`).
    - Quick Action Buttons: "CSV ทำจ่าย OT" (`handleExportShiftsCsv`), "ตารางเรือ/เครน" (`setShowVesselModal(true)`), Save/Cancel buttons during active edit mode.
    - Sub-toolbar filters: Department dropdown, Year dropdown, Month dropdown, Week filter (`all`, `W1`, `W2`, `W3`, `W4`, `W5`), Multi-select Position/Role dropdown (`selectedShiftRoleFilters`), Shift legend toggle (`showShiftLegend`), Fullscreen toggle.
  - **Shift Legend Panel (`App.tsx:7479–7516`)**:
    - 11 Shift Code chips: `M8` (กะเช้า 8 ชม.), `A8` (กะบ่าย 8 ชม.), `N8` (กะดึก 8 ชม.), `M12` (กะเช้า 8 OT 4), `A12` (กะบ่าย 8 OT 4), `N12` (กะดึก 8 OT 4), `M16` (กะเช้า 8 OT 8), `N16` (กะดึก 8 OT 8), `D` (ทอดสมอ), `OND` (ON DUTY), `O` (วันหยุด).
  - **Plan vs Actual Mismatch Banner (`App.tsx:7520–7557`)**:
    - Real-time detection of mismatch between plan shift and actual shift (`isPlanActualMismatch(plan, actual)`). Highlights cells with a red outline (`outline outline-2 outline-red-500`).
  - **Master Calendar Grid Canvas (`App.tsx:7560–8296`)**:
    - `div.overflow-x-auto` containing `div.inline-block.min-w-full`:
      1. **Days Header Row (`App.tsx:7564–7596`)**:
         - Pinned Left: `w-56 flex-shrink-0 p-4 border-r font-bold text-slate-500` (224px).
         - Day Number Columns: Width calculated dynamically (`35px` for 30-day view, `48px` for 14-day view, `56px` for 7-day view).
         - Pinned Right Header: `w-[368px] flex-shrink-0 border-l bg-slate-100` ("สรุปภาพรวมแผนก").
      2. **Vessel & Ship Crane Schedule Section (`App.tsx:7599–7755`)**:
         - 4 Schedule tracks: `vessel/plan`, `vessel/actual`, `crane/plan`, `crane/actual`.
         - Left Column: `w-56 flex-shrink-0 sticky left-0 z-10 bg-[#f8fafc]` (224px).
         - Spanning Bars: Dynamic horizontal continuous colored blocks with start/end date badges.
         - **Summary Widgets (368px aligned)**:
           * Row 0: Plan Accuracy % (`w-[368px] flex-shrink-0 border-l bg-[#f9fbfd]` with progress bar).
           * Row 1: Department Total OT Hours (`w-[368px] flex-shrink-0 border-l bg-[#f9fbfd]` with blue badge).
           * Row 2: Avg Workers per Day (`w-[368px] flex-shrink-0 border-l bg-[#f9fbfd]` with indigo badge).
           * Row 3: Total Active Staff (`w-[368px] flex-shrink-0 border-l bg-[#f9fbfd]` with amber badge).
      3. **Dedicated Employee Roster Header Bar (`App.tsx:7758–7815`)**:
         - Left: `w-56 flex-shrink-0 sticky left-0 z-10 bg-blue-50/80`.
         - Day labels: Days 1–31.
         - Right Sub-headers (368px Total):
           * `w-[200px]` Navy header: `MONTHLY (PLAN / ACTUAL / DIFF)` divided into "OT ปกติ" (`w-14` = 56px), "OT วันหยุด" (`w-16` = 64px), "ทำงานวันหยุด" (`w-20` = 80px).
           * `w-24` (96px) Dark Green header: "สรุปผลค่าล่วงเวลา (บาท)".
           * `w-18` (72px) Purple header: "สรุปผลค่าล่วงเวลา %".
           * `200px + 96px + 72px = 368px` total exact alignment.
      4. **Employee Shift Rows Grouped by Role (`App.tsx:7817–8097`)**:
         - Role Category Header: `sticky left-0 z-20 bg-slate-100/90`.
         - Individual Employee Row:
           * Worker Column: `w-56 flex-shrink-0 sticky left-0 z-10 bg-white` with Avatar, Name, ID, and `>36h` weekly warning badge.
           * Shift Matrix Cells: Width `35px`/`48px`/`56px`, height `40px`/`48px`/`56px`. Clicking opens `activeCellEditor` popover for direct editing.
           * Summary Cells: Width `368px` divided into:
             - `w-14` (56px): Normal OT hours (with diff badge in `"both"` mode).
             - `w-16` (64px): Holiday OT hours (with diff badge).
             - `w-20` (80px): Holiday Work days (with diff badge).
             - `w-24` (96px): Total OT Pay in THB (with diff badge).
             - `w-18` (72px): % of Base Salary (with diff badge).
      5. **Sticky Bottom Summary Rows (`App.tsx:8099–8294`)**:
         - Pinned to bottom: `sticky bottom-0 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]`.
         - Row 1: Coverage Summary (M/A/N daily staffing counts with low coverage warning).
         - Row 2: Daily Department OT Hours sum + Total monthly summary badges.

---

### 3.3 Analytics Dashboards

#### A. Main Executive Dashboard (`activeTab === "dashboard"`, `App.tsx:4419–5045`)
- **Banner**: Maritime Terminal Header Banner with Double A Terminal branding and quick shift navigation button.
- **Filter Toolbar**: Period filter (`"เดือนปัจจุบัน"`, `"3 เดือนที่ผ่านมา"`, `"6 เดือนย้อนหลัง"`), Department selector, Role selector, OT requests trigger, Export CSV button.
- **Labor Compliance Banner**: Alerts on fatigued staff with OT >36h/week or >6 consecutive workdays.
- **KPI Stat Cards (3 Cards, Grid `grid-cols-1 md:grid-cols-3 gap-6`)**:
  1. Card 1 (Sky Blue): Overtime Comparison % (`otComparePct`) with sparkline bar chart.
  2. Card 2 (Royal Blue): Total Overtime Pay (`totalSpent` THB) with sparkline bar chart.
  3. Card 3 (Slate/Navy): Overtime to Base Salary Ratio % (`otSalaryPct`).
- **Main Chart Grid (`grid-cols-1 lg:grid-cols-4 gap-6`)**:
  - Left Panel (`lg:col-span-3`): 10-Month Grouped Bar Chart (Jan–Oct 2026) with interactive toggle series pills (`compare`, `spent`, `pct`).
  - Right Panel (`lg:col-span-1`): Average Working Hours highlight card (`avgOtPerEmp` hrs per employee).
- **Department OT Meters**: Real-time progress bars for each department's OT usage.
- **Employee OT Contribution Cards (`grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6`)**: Mini cards showing top individual OT contributors with quota progress bars.

#### B. Department Reports & Heatmaps (`activeTab === "reports"`, `App.tsx:5848–6414`)
- **Top Row**: Spending correlation bar chart (`lg:col-span-8`) + Department Managers list (`lg:col-span-4`).
- **Bottom Row**: Hourly Peak Heatmap (`lg:col-span-6`, 7 days x 3 time bands), Position distribution breakdown, and PDF export trigger (`window.print()`).

#### C. Job Value Executive View (`activeTab === "job_value"`, `App.tsx:5050–5847`)
- **KPI Cards (4 Cards, `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4`)**: Total Revenue, Total Cost, Net Profit 2026, Coverage Ratio.
- **Department Summary Grid (`grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4`)**: INTER 2, INTER 3, INTER 5, INTER 7 with 2025 vs 2026 growth comparison badges.
- **Monthly Financial Trend Chart**: Revenue, Cost, Profit across 12 months with Trend Line / Bar Chart toggle.
- **Job Value Records Table**: Employee-level revenue/cost/profit records with modal detail viewer.

---

### 3.4 Employee Roster Table (`activeTab === "employees"`)
- **File Path**: `src/App.tsx` (Lines 6415–7228)
- **Organization Chart Overview Header (`App.tsx:6418–6737`)**:
  - Grid: `grid-cols-1 lg:grid-cols-3 gap-6`:
    - Left Column (1/3): Current Total Employees Card (`activeEmps`/`totalEmps`) + Case & Resigned Card.
    - Right Column (2/3): 10-Month Stacked Area Chart (SVG polygons) + 10 People Icon Silhouette ratio bar.
- **Database Action Bar (`App.tsx:6739–6795`)**:
  - Export CSV (`handleExportEmployees`), Import CSV (`handleImportEmployees`), CSV Template Hub, Add Employee button.
- **Status Tabs**: `"Active"` (พนักงานปัจจุบัน) vs `"Resigned"` (คลังพนักงานลาออก / พ้นสภาพ / เกษียณ).
- **Filter Toolbar (`App.tsx:6863–6931`)**:
  - 4 Inputs (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3`): Quick search box, Department dropdown, Division dropdown, Role dropdown.
- **Roster Table Column Structure & Frozen Column Specs (`App.tsx:6934–7224`)**:
  - Table element: `table.w-full.min-w-[1000px]`.
  - **5 Pinned Sticky Columns (Total 700px Left Width)**:
    1. **Col 1 (รหัสพนักงาน)**: `sticky left-0 z-20 min-w-[90px] w-[90px]` (Sortable).
    2. **Col 2 (ชื่อ-นามสกุล)**: `sticky left-[90px] z-20 min-w-[190px] w-[190px]` (Sortable, with avatar).
    3. **Col 3 (ตำแหน่ง)**: `sticky left-[280px] z-20 min-w-[160px] w-[160px]` (Sortable).
    4. **Col 4 (แผนก)**: `sticky left-[440px] z-20 min-w-[110px] w-[110px]` (Sortable).
    5. **Col 5 (ฝ่าย)**: `sticky left-[550px] z-20 min-w-[150px] w-[150px] border-r-2 border-slate-300 shadow-[4px_0_6px_-2px_rgba(0,0,0,0.08)]` (Sortable).
  - **Scrollable Data Columns**:
    6. **OT วันทำงาน (x1.5)**: Normal weekday overtime hours.
    7. **OT ทำงานในวันหยุด (x1)**: Holiday regular work hours.
    8. **OT ในวันหยุด (x3)**: Holiday overtime hours.
    9. **ผลรวมค่าล่วงเวลา**: Total calculated overtime pay in THB.
    10. **% ค่าล่วงเวลา**: Overtime pay percentage of base salary.
    11. **การจัดการ**: View Profile details modal button, Edit employee modal button, Delete employee button.

---

### 3.5 Summary Widgets & Mathematical Calculation Engine

#### 368px Aligned Summary Panel Breakdown
In the Shift Scheduler matrix, the right-hand panel maintains an exact **368px width alignment** across all header, vessel schedule, employee, and footer rows:
```
Total Width: 368px
├── Monthly Breakdown Columns: 200px
│   ├── OT ปกติ (Normal OT): 56px (w-14)
│   ├── OT วันหยุด (Holiday OT): 64px (w-16)
│   └── ทำงานวันหยุด (Holiday Work): 80px (w-20)
├── Cost in Baht (สรุปผลค่าล่วงเวลา บาท): 96px (w-24)
└── Cost % of Salary (สรุปผลค่าล่วงเวลา %): 72px (w-18)
Sum: 56px + 64px + 80px + 96px + 72px = 368px
```

#### Core Calculation Functions in `src/App.tsx`:
1. `getShiftOtHours(shift: string): number` (`App.tsx:122`):
   - `OND` returns 8.
   - Shifts ending with numbers: `hours - 8` (e.g. `M12` -> 4h, `M16` -> 8h, `M8` -> 0h).
2. `getEmpMonthlyOtPayBreakdown(emp: Employee, monthKey?: string)` (`App.tsx:185`):
   - Normal OT: Sum of overtime hours on regular weekdays (Monday–Saturday).
   - Holiday OT: Sum of overtime hours on Sundays or `OND` shifts (calculated at **3.0x**).
   - Holiday Regular Work Days: Count of Sunday work shifts (calculated at **1.0x** regular 8h pay).
   - Hourly Rate: `salary > 0 ? salary / 240 : 62.5`.
   - Total OT Pay: `Math.round((normalOt * 1.5 + holidayOt * 3.0 + holidayWorkDays * 8 * 1.0) * hourlyRate)`.
   - OT % of Salary: `((totalOtPay / salary) * 100).toFixed(2)`.
3. `isPlanActualMismatch(planShift: string, actualShift: string): boolean` (`App.tsx:249`):
   - Returns true if `planShift !== "" && planShift !== "O" && planShift !== "OFF" && planShift !== actualShift`.

#### Comprehensive CSV Export Catalog:
| Function Name | Location | Trigger Button | Headers & Content | Output Filename |
|---|---|---|---|---|
| `handleExportShiftsCsv` | `App.tsx:3815` | "CSV ทำจ่าย OT" in Shift Matrix | Payroll-ready: ID, Name, Dept, Role, Base Salary, Hourly Rate, Normal OT 1.5x, Holiday Work 1.0x, Holiday OT 3.0x, Total OT Hours, Total Pay (THB), % Salary, Day 1..Day 31 daily OT | `แบบสรุปทำจ่ายค่าล่วงเวลา_{month}_{dept}.csv` |
| `handleExportEmployees` | `App.tsx:3136` | "ส่งออกข้อมูล (Export CSV)" in Employee Roster | 19 Columns: ID, Prefix, First/Last/Nick Name, Role, Dept, Division, Salary, Birthday, Age, Start Date, Tenure, Probation, Calendar Type, Target OT, Shifts | `employees_backup_{date}.csv` |
| `handleExportJobValueCsv` | `App.tsx:2452` | "ส่งออกข้อมูล (Export CSV)" in Job Value | 41 Columns: ID, Name, Dept, Position, Status, Avg Revenue, Avg Cost, Profit 2026/2025, 12-month Revenue, Cost, Profit | `JobValue_Export_{date}.csv` |
| `handleExportCsvReport` | `App.tsx:4341` | "ส่งออกรายงานรวม" in Dashboard | Executive Dept Report: แผนก, จำนวนพนักงาน, ชั่วโมง OT รวม, งบประมาณที่ใช้จริง, สัดส่วนการใช้งบ %, สถานะ | `OT_Executive_Report_{month}.csv` |
| `handleExportOtRecordsCsv` | `App.tsx:840` | "ส่งออก CSV" in OT Records View | วันที่, รหัสพนักงาน, ชื่อพนักงาน, แผนก, รหัสกะ, ชั่วโมง OT | `OT_Records_{year}_{month}_{dept}.csv` |
| `downloadCsvFile` | `CsvTemplateHubModal.tsx:9` | "ดาวน์โหลดแม่แบบ" in CSV Hub | Pre-formatted UTF-8 standard templates for all 5 business domains | `{template_name}_template.csv` |

---

### 3.6 Modals & Dialogs Catalog

All modals in the codebase use fixed backdrop overlays (`fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4`):

1. **`CsvTemplateHubModal` (`src/components/CsvTemplateHubModal.tsx`)**:
   - Downloads standardized templates for Employee Roster, Job Value Financials, Shift Schedule Roster, Leave Records, and OT Daily Records.
2. **`showAddEmployeeModal` (`App.tsx:9045–9388`)**:
   - 4-section employee enrollment form: General Profile, Organization & Roles, Employment & Quota, Resignation Status.
3. **`showEditEmployeeModal` (`App.tsx:9393–9729`)**:
   - Full 4-section editor for updating employee personal, departmental, and payroll attributes.
4. **`viewingEmployeeDetails` (`App.tsx:9734–10030`)**:
   - Full employee profile viewer with leave quota summary, OT salary ratio gauge, and Job Value 2025/2026 growth comparison.
5. **`showVesselModal` (`App.tsx:8838–9040`)**:
   - CRUD interface for Vessel berthing and ship crane operations schedules with color picker.
6. **`showBulkShiftModal` (`App.tsx:10421–10492`)**:
   - Batch assigns shift codes (`M12`, `A12`, `N12`, `M16`, `N16`, `OND`, `M8`, `O`) across a date range (`bulkStartDay` to `bulkEndDay`).
7. **`showOtRequestModal` (`App.tsx:10497–10634`)**:
   - OT request submission and manager approval/rejection pipeline.
8. **`viewingJobValueModal` (`App.tsx:10640–10721`)**:
   - 12-month Revenue, Cost, Profit tabular breakdown modal.
9. **`editingEmployeeShiftsModal` (`App.tsx:10827–11106`)**:
   - Day-by-day shift editor with 2-Team (12h) and 3-Team (8-8-8) preset generator toolbars.
10. **`activeCellEditor` Popover (`App.tsx:11117–11203`)**:
    - Floating quick shift code selector positioned near clicked cell (`z-[991]`).
11. **`viewingSalaryFormulaEmployee` (`App.tsx:11206–11342`)**:
    - Step-by-step mathematical explanation modal for Weekday OT (1.5x), Holiday OT (3.0x), and Holiday Work (1.0x).
12. **`showResignedModal` (`App.tsx:11347–11562`)**:
    - Resigned / inactive employee case management, filtering, and one-click active restoration.
13. **`showAddAccountModal` & `showEditAccountModal` & `showResetPasswordModal` (`App.tsx:10090–10416`)**:
    - User account creation, role assignment, and password reset dialogs.
14. **`showAiAuditModal` (`App.tsx:10035–10085`)**:
    - Gemini AI Live compliance and labor risk audit report dialog.
15. **Birthday Celebration Popup (`App.tsx:10725–10822`)**:
    - Daily birthday notification popup for team members.

---

## 4. Current Desktop Layout Rules, Viewport Constraints & Mobile Adaptation Gaps

### 4.1 Layout Boundaries & Container Rules
- **Desktop Grid/Flex Structure**:
  - Fixed Top Navbar (`Navbar.tsx`): Fixed height of ~112px.
  - Main Body (`App.tsx:4414`): `<main className="flex-1 overflow-y-auto transition-all duration-300 mt-28 p-8">`.
  - Content containers use `max-w` cards or `space-y-6` stack layouts.

### 4.2 Critical Mobile & Tablet Adaptation Gaps (Requirements Matrix)

| Area | Current Desktop Implementation | Mobile (375px–430px) & Tablet (768px–1024px) Issues | Required Responsive Adaptation |
|---|---|---|---|
| **Navbar & Header** | Fixed 2-row navbar (~112px tall) with rigid horizontal category pills. | Obscures up to 30% of mobile screen height; category pills overflow horizontally; no mobile hamburger drawer. | Collapsible mobile header / hamburger sheet menu; compact brand logo; touch-friendly tab bar. |
| **Shift Scheduler Matrix** | Fixed `w-56` (224px) worker column + variable day cells + fixed `w-[368px]` summary widgets. | On mobile (375px–430px), 224px left column leaves only 151px for days, squishing cells and causing layout clipping. | Compact sticky frozen left column (e.g. 110px–130px with stacked avatar/name on mobile); smooth touch panning (`-webkit-overflow-scrolling: touch`); horizontal swipe gestures for calendar days; preserved 368px desktop alignment. |
| **Employee Roster Table** | **5 Pinned Sticky Columns** totaling **700px** (`left-0`, `left-[90px]`, `left-[280px]`, `left-[440px]`, `left-[550px]`). | Completely breaks on screens <768px as 700px exceeds viewport width, completely hiding all data columns. | Collapse sticky columns on mobile/tablet to single sticky identity column (`ID + Name`, max 140px); allow remaining columns to pan smoothly with frozen header. |
| **Summary & Metric Cards** | Desktop grid `grid-cols-1 md:grid-cols-3` or `grid-cols-1 lg:grid-cols-4`. | Stacks neatly on mobile, but gap/padding (`p-6`, `p-8`) is too wide for small screens. | Fluid responsive padding (`p-3 sm:p-6`); compact KPI cards; touch-scrollable horizontal carousel on small mobile. |
| **Modals & Dialogs** | Fixed width modals (`max-w-2xl`, `max-w-4xl`, `max-h-[90vh]`). | Action buttons and long forms may get cut off on mobile virtual keyboards. | Bottom-sheet drawer on mobile viewports; full-width scrollable modal body with sticky footer actions; minimum 44x44px touch targets (`min-h-[44px]`). |
| **PWA Capabilities** | Missing `manifest.json`, missing Service Worker, no offline caching. | Application cannot be installed to Home Screen on mobile/field tablets; fails offline loading on port berths. | Create Web App Manifest (`manifest.webmanifest`), configure viewport meta (`viewport-fit=cover`, theme-color `#0f172a`), register Service Worker for app shell caching. |

---

## 5. Architectural Map & File Reference Index

```
C:\Users\ssrwj\Documents\antigravity\mysterious-einstein\
├── index.html                        # Main HTML template (Needs PWA manifest link & meta tags)
├── package.json                      # Dependencies (React 19, Tailwind v4, Vite 6, Lucide)
├── vite.config.ts                    # Vite config with React & Tailwind plugins
├── tsconfig.json                     # TypeScript configuration
├── server.ts                         # Node/Express API server & DB controllers
├── schema.sql                        # SQLite / D1 database schema
├── public/
│   └── login-bg.jpg                  # Background asset
└── src/
    ├── main.tsx                      # App entry point with GlobalErrorBoundary
    ├── App.tsx                       # Master Application (Routing, Scheduler, Roster, Modals, State)
    │   ├── Lines 61–120              # SHIFT_OPTIONS & getShiftStyle
    │   ├── Lines 122–247             # OT & Pay Calculation Engine
    │   ├── Lines 412–814             # LeaveRecordsView
    │   ├── Lines 815–981             # OtRecordsView
    │   ├── Lines 1009–1502           # HrDirectEditorView
    │   ├── Lines 1503–4380           # App Root State, Login, Handlers, CSV Exports
    │   ├── Lines 4419–5045           # Dashboard View
    │   ├── Lines 5050–5847           # Job Value View
    │   ├── Lines 5848–6414           # Reports View
    │   ├── Lines 6415–7228           # Employee Roster View (5 Sticky Columns)
    │   ├── Lines 7233–8298           # Shift Scheduler Matrix (368px Aligned Panel)
    │   └── Lines 8838–11598          # Modals & Dialogs Overlays
    ├── types.ts                      # Domain TypeScript interfaces
    ├── index.css                     # Tailwind v4 styles, fonts & keyframe animations
    └── components/
        ├── Navbar.tsx                # Fixed Top 2-Tier Header & Category Pills
        ├── Sidebar.tsx               # Alternate Drawer Navigation
        └── CsvTemplateHubModal.tsx   # 5-Domain CSV Template Generation & Download
```

---

## 6. Recommendations for Implementation Phase

1. **PWA Shell Implementation**:
   - Add `public/manifest.webmanifest` with Double A Terminal identity, `standalone` display mode, and high-resolution icons (192x192, 512x512).
   - Implement `public/sw.js` (or Vite PWA service worker) with Cache-First strategy for static assets and Network-First for API data.
   - Update `index.html` with `<meta name="theme-color" content="#0f172a">`, `<meta name="apple-mobile-web-app-capable" content="yes">`, and `<link rel="manifest" href="/manifest.webmanifest">`.
2. **Mobile Navigation Overhaul**:
   - Introduce a mobile bottom navigation bar or compact top app bar with a slide-out hamburger drawer for mobile viewports (`<768px`).
   - Reduce desktop `mt-28` to dynamic responsive margin (`mt-16 sm:mt-28`) to recover vertical mobile real estate.
3. **Table & Sticky Column Refactoring**:
   - In `activeTab === "employees"`: Make the 5-column sticky frozen left stack responsive (on screens `<1024px`, collapse columns 3–5 into scrollable space and keep only ID+Name sticky).
   - In `activeTab === "shifts"`: Allow the 224px worker head to compact down to 120px on mobile with touch swipe horizontal scroll. Preserve the 368px desktop alignment cleanly.
4. **Touch Targets & Modals Ergonomics**:
   - Enforce `min-h-[44px]` and `min-w-[44px]` for all buttons, shift selector options, filters, and table pagination controls.
   - Convert complex dialogs to bottom-sheet drawers with sticky bottom dismiss/save bars on mobile screens.
5. **Zero Regression Guarantee**:
   - Maintain 100% exact parity for all 6 CSV export routines (`handleExportShiftsCsv`, `handleExportEmployees`, `handleExportJobValueCsv`, `handleExportCsvReport`, `handleExportOtRecordsCsv`, `downloadCsvFile`).
   - Preserve all mathematical formulas in `getEmpMonthlyOtPayBreakdown` (1.5x normal, 3.0x holiday OT, 1.0x holiday work days).
   - Ensure clean build verification with `npm run build`.

---
*Report compiled and verified by Explorer Survey 1.*
