# UX & Micro-Copy Radical Minimalism Audit & Survey Report

**Project**: Enterprise OT Management Portal  
**Scope**: Full UI/UX & Micro-Copy Survey across 11 Portal Views, Navigation, Modals, Dialogs, and Drawers  
**Date**: 2026-09-02  
**Status**: Completed (Read-Only Investigation)

---

## Executive Summary

This survey provides the complete architectural roadmap for the **Radical Minimalism Overhaul** of the Enterprise OT Management Portal. The investigation evaluated all 11 views against two primary operational goals:
1. **UX Strategy (R1)**: Eliminating cognitive overload, consolidating redundant controls, reducing interaction clicks for the top-5 user tasks by **50%–75%**, and achieving a **>=20% section reduction per view** (average reduction achieved: **37.6%**).
2. **Micro-Copy & Micro-Interaction Polish (R3)**: Enforcing ruthless brevity across all UI strings:
   - Button labels <= 4 words (target: 1–3 words)
   - Section headers <= 6 words
   - Placeholders < 5 words
   - 100% elimination of redundant helper copy, obvious explanatory subtitles, and bilingual clutter.

---

## Section 1: Comprehensive UX Strategy Audit (R1)

### 1.1 Portal Architecture & View Enumeration (All 11 Views)

The portal contains 11 primary functional views rendered via `src/App.tsx` and configured in `src/components/Sidebar.tsx` and `src/components/Navbar.tsx`:

| View ID | View Name (Thai) | Primary Function | Current Section Count | Target Section Count | Section Reduction |
|---|---|---|---|---|---|
| `dashboard` | ภาพรวม Dashboard | Real-time OT metrics, 10-month financial trend, department meters, risk contributors | 7 | 4 | **-42.8%** |
| `job_value` | โครงสร้าง Job Value | Job revenue/cost/profit evaluation, monthly financial breakdown, employee value table | 5 | 3 | **-40.0%** |
| `reports` | รายงานข้อมูลรายแผนก | OT vs spending correlation, peak heatmap, radar KPIs, cargo tonnage analytics, department table | 5 | 3 | **-40.0%** |
| `employees` | รายชื่อพนักงาน | Headcount stats, stacked area growth chart, employee master roster table | 4 | 3 | **-25.0%** |
| `shifts` | จัดตารางกะเทียบเรือ | 24H interactive shift matrix, vessel timeline, smart shift assistant, daily coverage & OT totals | 6 | 4 | **-33.3%** |
| `hr-editor` | ข้อมูล & รายได้ (HR Direct) | Online direct web editor for employee financials, salaries, and profit parameters | 3 | 2 | **-33.3%** |
| `ot-records` | ประวัติ OT จากกะทำงาน | Historical shift-derived OT logs, filtering, CSV export | 3 | 2 | **-33.3%** |
| `leave-records` | บันทึกวันลา | Leave analytics, leave type breakdown, top absentees, leave log table | 4 | 3 | **-25.0%** |
| `settings` | การตั้งค่าระบบ | Labor law limits, AI automation toggles, database administration | 5 | 3 | **-40.0%** |
| `admin-permissions` | สิทธิ์ผู้ใช้งาน | Account management, role assignment, password reset | 2 | 1 | **-50.0%** |
| `profile` | จัดการโปรไฟล์ส่วนตัว | User avatar preview, display name, password update | 2 | 1 | **-50.0%** |
| **Total / Average** | **11 Views** | | **46** | **29** | **-37.6%** |

---

### 1.2 View-by-View Redundancy & Consolidation Breakdown

#### View 1: Dashboard (`dashboard`)
- **Baseline Sections (7)**:
  1. *Editorial Header Banner*: Large descriptive title, long subtitle, CTA button to Shifts view.
  2. *Dashboard Filter Bar*: Month, Department, Role dropdowns, OT Requests button, Export CSV button.
  3. *Labor Compliance Warning Banner*: Fatigue employee callout (`fatiguedEmployees.length > 0`).
  4. *3-KPI Metric Cards Grid*: OT comparison %, Total OT pay ฿, % OT of base salary, with decorative sparkline bars.
  5. *Analytics Chart & Panel Grid*: Left 10-Month Grouped Bar Chart with 3 legend toggle buttons; Right Average Working Hours Highlight Card.
  6. *Department Breakdown Meters*: 6 department progress bars with informational footer note.
  7. *Employee OT Contribution Cards List*: 4 employee risk cards with "ดูตารางรายชื่อทั้งหมด" navigation button.
- **Redundancies & Clutter**:
  - Duplicate navigation affordances: "จัดตารางกะพนักงาน" in Header Banner and "ดูตารางรายชื่อทั้งหมด" in Contribution Cards duplicate Navbar tabs 02 and 03.
  - Sparkline decorations in all 3 KPI cards violate radical minimalism.
  - Informational note at bottom of Department Breakdown restates the obvious ("คำนวณจากกะการทำงานพนักงานตรงกับฐานข้อมูล D1 แบบ 100%").
  - Standalone Average Working Hours card creates asymmetric layout with the 10-month chart.
- **Proposed Radical Minimalist Structure (4 sections)**:
  1. *Integrated Header & Filter Toolbar*: Clean title + inline segmented month/department controls + quick action buttons.
  2. *Unified 4-Metric KPI Grid*: 4 equal-width Swiss metric cards (OT Compare %, Total Spent ฿, OT Ratio %, Avg Hours/Emp) without decorative sparklines.
  3. *Financial Performance Trend Panel*: Streamlined 10-Month Grouped Bar Chart with clean toggle legend.
  4. *Operational Breakdown Grid*: 2-column layout pairing Department OT Meters with Top Risk Contributors.

#### View 2: Job Value (`job_value`)
- **Baseline Sections (5)**:
  1. *Header Card*: Title, Year badge, 18-word explanatory subtitle, 4 action buttons.
  2. *4-KPI Metric Cards Grid*: Total Revenue, Total Cost, Profit 2026, Coverage Ratio.
  3. *Department Summary Cards*: 4 separate cards for INTER 2, 3, 5, 7.
  4. *Monthly Financial Breakdown 2026*: Department selector, Active/12m toggle, Trend/Bar toggle, SVG Chart/Bar Chart, and 6-column Monthly Number Pill Cards.
  5. *Job Value Records Table Card*: Table title, record count badge, Search box, Department dropdown, Clear filters button, full table.
- **Redundancies & Clutter**:
  - Duplicate Department filter in Section 4 and Section 5.
  - Monthly Numbers Pill Cards at bottom of chart replicate exact data points already visible in chart hover tooltips and table rows.
  - Department Summary Cards duplicate aggregated metrics already computed in the table.
- **Proposed Radical Minimalist Structure (3 sections)**:
  1. *Consolidated Header & Action Bar*: Single title + 4 concise buttons (แม่แบบ CSV, ส่งออก CSV, นำเข้า CSV, ล้างข้อมูล).
  2. *Financial Intelligence Panel*: 4-KPI Row + Toggleable Monthly Financial Trend/Bar Chart with single unified Department filter.
  3. *Job Value Data Table*: Search, Department filter, and clean tabular roster.

#### View 3: Department Reports (`reports`)
- **Baseline Sections (5)**:
  1. *Header Card*: Title, Subtitle, Month filter, Department filter, PDF Export button.
  2. *Main Chart Split*: Left OT vs Spending chart, Right Department Managers summary list.
  3. *Secondary Multi-Chart Grid*: Heatmap of peak OT hours, Key KPIs Radar chart, Operational Position OT Distribution.
  4. *Cargo Tonnage vs OT Analytics Card*: Total tonnage summary, OT rate / 1k tons, Vessel/Crane schedule cards.
  5. *Comprehensive Statistics Table*: Sorting dropdown, 6-department breakdown table, pagination footer.
- **Redundancies & Clutter**:
  - Overcrowded visualization grid (5 disparate chart widgets competing on one screen).
  - Material symbols class (`material-symbols-outlined`) leaks external font styles into table rows.
  - Department Manager sidebar duplicates data shown in Org Chart and Shift Scheduler.
- **Proposed Radical Minimalist Structure (3 sections)**:
  1. *Consolidated Header & Filter Toolbar*: Title, Month filter, Dept filter, PDF Export.
  2. *Executive Operational Analytics Grid*: 2 focused cards (Financial OT vs Budget Chart + Cargo Tonnage / Heatmap).
  3. *Department Performance Statistics Table*: Clean tabular breakdown with sort dropdown and key ratios.

#### View 4: Employees (`employees`)
- **Baseline Sections (4)**:
  1. *Org Chart Overview Section*: Total Employees Card + Resigned Card + Stacked Area Chart + 10-silhouette People Bar.
  2. *Employee Database Controls Header Card*: Title, Subtitle, Export CSV, Import CSV, CSV Template Hub, Add Employee button.
  3. *Status Tabs Bar*: Active Employees vs Resigned Archive.
  4. *Employee Roster Table Card*: Search, Dept, Division, Role dropdowns, Clear filter, 11-column table.
- **Redundancies & Clutter**:
  - Dual header cards (Org Chart Overview Header followed immediately by Database Controls Header Card).
  - 10-people silhouette icon row adds no semantic value.
  - Inline raw SVGs in table action cells.
- **Proposed Radical Minimalist Structure (3 sections)**:
  1. *Workforce Headcount & Trend Bar*: Active/Resigned KPIs + Stacked Area Chart.
  2. *Unified Toolbar & Status Filter Bar*: Active/Resigned tabs, Search, Filters, CSV/Add actions.
  3. *Employee Master Table*: High-density tabular roster with Lucide icons.

#### View 5: Shifts / Matrix (`shifts`)
- **Baseline Sections (6)**:
  1. *Header Toolbar*: Department info, Worker count, Dept manager, Month indicator, Actions.
  2. *Sub-Toolbar Filter Bar*: Dept, Year, Month, Week, Role multi-select, Toggle Legend, Fullscreen.
  3. *Collapsible Shift Legend Card* (`showShiftLegend`).
  4. *Mismatch Info Callout Alert* (`Plan != Actual`).
  5. *Smart Shift Assistant Drawer / Panel* (`showSmartShiftDrawer`).
  6. *Master Calendar Grid Canvas*: Days Header, Vessel Timeline, Employee Rows, Daily Coverage Footer, Daily OT Footer, Monthly Totals.
- **Redundancies & Clutter**:
  - Double stacked toolbar rows waste vertical real estate.
  - Pulsing animated dots and dark gradient containers.
  - Redundant department/month indicators across both toolbar rows.
- **Proposed Radical Minimalist Structure (4 sections)**:
  1. *Unified Single-Row Shift Toolbar*: Dept, Month/Year, Week, Role, View Mode toggle [Plan/Actual/Both], Quick Actions, Fullscreen.
  2. *Contextual Shift Legend & Alert Bar*: Inline compact shift pills + Mismatch warning if active.
  3. *Smart Assistant Panel*: Clean flat drawer for AI pairing and bulk copy.
  4. *Master Shift Matrix Grid*: Vessel schedule rows, Employee shift cells, sticky headers, summary footer.

#### View 6: HR Direct Editor (`hr-editor`)
- **Baseline Sections (3)**: Header Card, Filter & Dept Selector Tabs Toolbar, Interactive Spreadsheet Table.
- **Proposed Structure (2 sections, -33.3%)**: Consolidated Header & Controls Bar + Interactive Direct Data Grid.

#### View 7: OT Records (`ot-records`)
- **Baseline Sections (3)**: Header Card, Filters Bar, Table Card.
- **Proposed Structure (2 sections, -33.3%)**: Consolidated Header & Filter Toolbar + OT Log Data Table.

#### View 8: Leave Records (`leave-records`)
- **Baseline Sections (4)**: Header Card, 3-Card Analytics Summary Grid, Filter Toolbar, Table Card.
- **Proposed Structure (3 sections, -25.0%)**: Consolidated Header & Analytics Summary + Filter & Search Toolbar + Leave Records Table.

#### View 9: Settings (`settings`)
- **Baseline Sections (5)**: Header Card, Labor Law Limits Card, AI Automation Card, User Permissions Card (Duplicate), Database Admin Card.
- **Redundancy**: Section 4 (User Permissions Table) is a 100% duplicate of View 10 (`admin-permissions`).
- **Proposed Structure (3 sections, -40.0%)**: Consolidated Header & Labor Policy Card + System & AI Automation Parameters Card + Data Maintenance & Database Administration Card.

#### View 10: Admin Permissions (`admin-permissions`)
- **Baseline Sections (2)**: Header Card, Users Table Card.
- **Proposed Structure (1 section, -50.0%)**: Unified User Management & Permissions Card.

#### View 11: Profile (`profile`)
- **Baseline Sections (2)**: Header Card, 2-Column Profile & Form Card Grid.
- **Proposed Structure (1 section, -50.0%)**: Unified Profile Management Card.

---

### 1.3 Top-5 User Task Click-Flow Analysis & Optimizations

```
Task 1: Assign Shift
[Current: 4-5 clicks] -> [Optimized: 1-2 clicks] (60-75% reduction)
Step 1: Open Shifts view
Step 2: Hover/Click cell -> Instant 1-click radial popover or direct hotkey ('M' for M12, 'N' for N12, 'O' for OFF)
Alternative: Drag-paint multiple cells in a single continuous stroke

Task 2: View OT Summary
[Current: 3-4 steps] -> [Optimized: 1 click] (50-75% reduction)
Step 1: Open Dashboard -> Metrics and department OT progress immediately visible above the fold

Task 3: Filter by Department
[Current: 2 clicks via select dropdown] -> [Optimized: 1 click] (50% reduction)
Step 1: Click direct segmented department tab ([All] [INTER 2] [INTER 3] [INTER 5] [INTER 7] [HVM] [ECC])

Task 4: Export CSV Report
[Current: 3-4 clicks] -> [Optimized: 1 click] (66% reduction)
Step 1: Click quick-export icon directly in the unified table header

Task 5: Check Compliance Alerts
[Current: 3-4 clicks] -> [Optimized: 1-2 clicks] (50% reduction)
Step 1: Click notification indicator -> Direct side sheet with inline resolution actions
```

---

## Section 2: Comprehensive Micro-Copy Audit (R3)

### 2.1 Micro-Copy Scanning & Flagged Violations

All UI strings were audited against strict radical minimalism length and clarity rules:
1. **Button Labels**: Flagged any label > 4 words.
2. **Section Headers**: Flagged any header > 6 words.
3. **Placeholders**: Flagged any placeholder >= 5 words.
4. **Helper Paragraphs**: Flagged any verbose subtitles restating obvious functionality.

### 2.2 Complete Replacement Dictionary

| Component / Area | Location (File & Line) | Current Verbose String | Word Count | Ruthless Brevity Replacement | Target Word Count |
|---|---|---|---|---|---|
| **Sidebar / Navbar** | `Sidebar.tsx:30` | หน้าแรก Dashboard | 2 | Dashboard | 1 |
| **Sidebar / Navbar** | `Sidebar.tsx:31` | คุณค่าตำแหน่งงาน & ผลตอบแทน | 4 | Job Value | 2 |
| **Sidebar / Navbar** | `Sidebar.tsx:32` | รายงานข้อมูลรายแผนก | 3 | รายงานแผนก | 2 |
| **Sidebar / Navbar** | `Sidebar.tsx:34` | รายชื่อพนักงานหน้าท่า | 3 | รายชื่อพนักงาน | 2 |
| **Sidebar / Navbar** | `Sidebar.tsx:35` | จัดการข้อมูล & รายได้ (HR Direct) | 6 | แก้ไขข้อมูล HR | 2 |
| **Sidebar / Navbar** | `Sidebar.tsx:38` | จัดตารางกะเทียบเรือ (Shifts) | 4 | ตารางกะ | 1 |
| **Sidebar / Navbar** | `Sidebar.tsx:40` | ประวัติ OT งานหน้าท่าเรือ | 4 | ประวัติ OT | 2 |
| **Sidebar / Navbar** | `Sidebar.tsx:41` | จัดการสิทธิ์ Admin & ผู้ใช้ | 4 | สิทธิ์ผู้ใช้ | 2 |
| **Dashboard Banner** | `App.tsx:5147` | ระบบบริหารการปฏิบัติงานเทียบเรือ และจัดการเวลา OT หน้าท่า | 8 | บริหารการปฏิบัติงานและ OT | 4 |
| **Dashboard Banner** | `App.tsx:5149` | ติดตามการทำงานล่วงเวลา สรุปสถิติจำนวนชั่วโมงกะ และงบประมาณโลจิสติกส์... | 21 | *(Remove helper text)* | 0 |
| **Dashboard Button** | `App.tsx:5159` | จัดตารางกะพนักงาน | 2 | จัดกะ | 1 |
| **Dashboard Button** | `App.tsx:5233` | ส่งออกรายงานรวม | 2 | ส่งออกรายงาน | 2 |
| **Dashboard Alert** | `App.tsx:5245` | ตรวจพบพนักงานกลุ่มเสี่ยงความล้าสะสม ({count} คน) | 5 | เสี่ยงความล้าสะสม ({count}) | 3 |
| **Dashboard Button** | `App.tsx:5257` | ตรวจสอบรายชื่อพนักงานกลุ่มเสี่ยง | 3 | ดูรายชื่อ | 1 |
| **Dashboard Header** | `App.tsx:5628` | ปริมาณชั่วโมง OT แยกตามแผนก (ข้อมูลเรียลไทม์) | 6 | ชั่วโมง OT รายแผนก | 3 |
| **Dashboard Header** | `App.tsx:5678` | วิเคราะห์การจัดสรร OT รายบุคคล (Employee Contribution) | 6 | สถิติ OT รายบุคคล | 3 |
| **Dashboard Button** | `App.tsx:5687` | ดูตารางรายชื่อทั้งหมด | 3 | ดูทั้งหมด | 2 |
| **Job Value Header** | `App.tsx:5781` | ตรวจสอบคุณค่าตำแหน่งงาน ประเมินรายได้ (Revenue) ต้นทุน (Cost)... | 18 | *(Remove helper text)* | 0 |
| **Job Value Button** | `App.tsx:5807` | ส่งออกข้อมูล (Export CSV) | 4 | ส่งออก CSV | 2 |
| **Job Value Button** | `App.tsx:5816` | อัพโหลดข้อมูล (Import CSV) | 4 | นำเข้า CSV | 2 |
| **Job Value Button** | `App.tsx:5836` | ล้างข้อมูลใน D1 (Clear All) | 6 | ล้างข้อมูล | 1 |
| **Job Value Header** | `App.tsx:5915` | สรุปข้อมูลคุณค่าตำแหน่งงาน (Job Value) และผลตอบแทน แยกรายแผนก | 9 | สรุป Job Value รายแผนก | 4 |
| **Job Value Header** | `App.tsx:6001` | เปรียบเทียบผลประกอบการรายเดือน (Monthly Financial Breakdown 2026) | 7 | ผลประกอบการรายเดือน | 2 |
| **Job Value Button** | `App.tsx:6066` | กราฟแนวโน้ม (Trend Line) | 4 | กราฟแนวโน้ม | 1 |
| **Job Value Button** | `App.tsx:6078` | กราฟแท่ง (Bar) | 3 | กราฟแท่ง | 1 |
| **Job Value Header** | `App.tsx:6312` | ตารางข้อมูลคุณค่าตำแหน่งงานและผลตอบแทนรายพนักงาน | 5 | ตาราง Job Value | 3 |
| **Reports Chart** | `App.tsx:6568` | เปรียบเทียบชั่วโมงทำโอทีกับความสัมพันธ์ด้านงบประมาณ (OT vs Spending) | 8 | OT เทียบงบประมาณ | 3 |
| **Reports Heatmap** | `App.tsx:6737` | ช่วงเวลาที่มีการทำโอทีหนาแน่นที่สุด (Heatmap) | 6 | ความหนาแน่น OT | 2 |
| **Reports Radar** | `App.tsx:6800` | ตัวชี้วัดประสิทธิภาพหลัก (Key KPIs) | 4 | ตัวชี้วัดหลัก | 2 |
| **Reports Cargo** | `App.tsx:6896` | การวิเคราะห์ปริมาณงานเรือ/เครน (ตัน) กับ ชั่วโมง OT (Cargo Tonnage vs OT Analytics) | 12 | ปริมาณงานเทียบ OT | 3 |
| **Employees Header** | `App.tsx:7411` | ฐานข้อมูลและชั่วโมงการทำงานสะสมของพนักงาน | 5 | ฐานข้อมูลพนักงาน | 2 |
| **Employees Button** | `App.tsx:7424` | ส่งออกข้อมูล (Export CSV) | 4 | ส่งออก CSV | 2 |
| **Employees Button** | `App.tsx:7433` | นำเข้าข้อมูล (Import CSV) | 4 | นำเข้า CSV | 2 |
| **Employees Tab** | `App.tsx:7477` | พนักงานปัจจุบัน (Active) | 3 | ปฏิบัติงาน | 1 |
| **Employees Tab** | `App.tsx:7492` | คลังพนักงานลาออก / พ้นสภาพ / เกษียณ | 6 | พ้นสภาพ | 1 |
| **Shifts Section** | `App.tsx:8384` | ตารางเทียบเรือ & เครนตักสินค้า (Vessel & Ship Crane Schedule) | 9 | ตารางเทียบเรือและเครน | 3 |
| **Shifts Button** | `App.tsx:8251` | จัดคู่กะ Day/Night ครบทุกตำแหน่ง | 6 | จัดคู่กะทั้งหมด | 2 |
| **Shifts Button** | `App.tsx:8260` | คัดลอก Plan → Actual | 4 | คัดลอก Plan | 2 |
| **Shifts Button** | `App.tsx:8643` | จับคู่กะ Day/Night อัตโนมัติ | 5 | จัดคู่กะอัตโนมัติ | 2 |
| **HR Editor Header** | `App.tsx:1231` | ศูนย์จัดการแก้ไขข้อมูลพนักงานและผลตอบแทนออนไลน์ (HR Web Direct Editor) | 9 | จัดการข้อมูลพนักงาน | 2 |
| **HR Editor Button** | `App.tsx:1254` | บันทึกการแก้ไขไปยัง D1 Database | 6 | บันทึกข้อมูล | 1 |
| **Leave Header** | `App.tsx:542` | ประวัติและการวิเคราะห์การลางานพนักงาน (Leave Analytics) | 6 | สถิติการลางาน | 2 |
| **Leave Header** | `App.tsx:618` | พนักงานที่มีสถิติการลางานสูงสุด (Top Absentees) | 6 | สถิติลาสูงสุด | 2 |
| **Settings Header** | `App.tsx:9250` | การตั้งค่ากฎเกณฑ์และการวิเคราะห์ของระบบ | 5 | ตั้งค่าระบบ | 1 |
| **Settings Card** | `App.tsx:9260` | กฎหมายแรงงานไทยและพารามิเตอร์ความปลอดภัย | 4 | เกณฑ์ความปลอดภัย | 2 |
| **Settings Card** | `App.tsx:9302` | การรวมกำลังพลระบบ AI และการวิเคราะห์อัจฉริยะ | 6 | การตั้งค่า AI | 2 |
| **Settings Button** | `App.tsx:9336` | ยืนยันตัวตนและการอัปเกรด | 3 | บันทึกการตั้งค่า | 2 |
| **Settings Card** | `App.tsx:9344` | ระบบการจัดการบัญชีและสิทธิ์ผู้สวมบทบาท (Users & Permissions) | 7 | จัดการสิทธิ์ผู้ใช้ | 2 |
| **Settings Button** | `App.tsx:9474` | ล้างข้อมูลพนักงานและใบคำขอทั้งหมด | 4 | ล้างข้อมูลระบบ | 2 |
| **Admin Perms** | `App.tsx:9490` | ระบบการจัดการบัญชีและสิทธิ์ผู้สวมบทบาท (Admin Permissions) | 7 | จัดการสิทธิ์ผู้ใช้ | 2 |
| **Profile Header** | `App.tsx:9627` | จัดการข้อมูลโปรไฟล์ส่วนตัว | 3 | โปรไฟล์ส่วนตัว | 2 |
| **Modal Title** | `PremiumShiftTimePickerModal.tsx:365` | ตั้งเวลากะทำงาน (24H Shift Scheduler) | 5 | จัดตารางกะ | 1 |
| **Modal Title** | `App.tsx:9764` | จัดการตารางเทียบเรือ & เครนตักสินค้า | 5 | ตารางเทียบเรือและเครน | 3 |
| **Modal Title** | `App.tsx:9966` | เพิ่มพนักงานเข้าสู่แผนภูมิระบบ | 3 | เพิ่มพนักงาน | 1 |
| **Placeholder** | `App.tsx:6344` | ค้นหารหัสพนักงาน, ชื่อ-นามสกุล, ตำแหน่ง... | 4 | ค้นหา... | 1 |
| **Placeholder** | `App.tsx:9820` | เช่น Disch. Wheat MV "Golden Friend" | 5 | เช่น MV Golden Friend | 4 |

---

## Section 3: Implementation Guidelines for Subsequent Roles

1. **UI & Visual Architect**:
   - Enforce 8pt grid alignment on all container padding and card margins (`p-4 sm:p-6 rounded-2xl`).
   - Eliminate heavy shadows (`shadow-2xl`, `shadow-xl`) in favor of hairline borders (`1px solid #DCE4EA`) and subtle `shadow-xs` / `shadow-sm`.
   - Remove background gradient banners (`bg-gradient-to-br from-slate-900 ...`, `from-amber-500/5 ...`).
   - Remove animated pulsing dots and raw SVGs in table cells.
2. **Micro-Copywriter & Voice of Simplicity**:
   - Apply the replacement dictionary directly across `src/App.tsx`, `Sidebar.tsx`, `Navbar.tsx`, and modals.
   - Ban all helper text that explains self-evident UI features.
3. **Design Systems QA**:
   - Verify `npm run build` compiles with 0 TypeScript and 0 Vite bundle errors.
   - Ensure all 10 data tables maintain sticky columns on mobile/touch viewports.
