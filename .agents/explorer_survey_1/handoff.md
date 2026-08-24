# UI & Design Architecture Survey Report (Explorer 1)

## 1. Observation

### 1.1 Frontend Styling & Technology Stack Setup
- **Framework & Tooling**:
  - React 19 (`react@19.0.1`, `react-dom@19.0.1`) with TypeScript (`typescript@~5.8.2`) and Vite 6 (`vite@6.2.3`).
  - Tailwind CSS v4 (`tailwindcss@^4.1.14` and `@tailwindcss/vite@^4.1.14`).
  - Iconography: `lucide-react@^0.546.0` already installed and extensively used across navigation and components.
  - Motion / Animations: `motion@^12.23.24`.
- **Global CSS Configuration (`src/index.css`)**:
  - Line 1-6: `@import "tailwindcss";` with `@theme` declaring `--font-sans: "Sarabun", "Noto Sans Thai", "Inter", ...` and `--font-mono: "JetBrains Mono", ...`.
  - Line 8-12: `body, html` configured with `background-color: #070d18` and `color: #f1f5f9` (dark cockpit base).
  - Line 20-33: Custom scrollbar styling with cyan accents `rgba(56, 189, 248, 0.25)`.
  - Line 36-50: Maritime glass morphism classes (`.maritime-glass-dark`, `.maritime-glass-light`) using cyan border `rgba(56, 189, 248, 0.2)`.
  - Line 53-66: Tactile bezel (`.cockpit-bezel`) and segmented switches (`.switch-track-recessed`).
  - Line 68-144: Wave, boat floating, radar sweep, and sonar pulse keyframe animations.
- **HTML & Typography Setup (`index.html`)**:
  - Google Fonts link (Line 38): Sarabun (weights 300-800), Inter (weights 400-700), Noto Sans Thai.
  - Unused Google Font (Line 39): Material Symbols Outlined (can be removed to streamline bundle).
  - Body tag (Line 41): `<body class="bg-slate-50 text-slate-900 antialiased font-sans">`.

---

### 1.2 Full UI Components & Pages Inventory

| View / Component | File Location | Key Purpose & UI Structures |
|---|---|---|
| **Navbar** | `src/components/Navbar.tsx` (592 lines) | Top brand header, global search bar, PWA offline/install badges, CSV hub button, Language switcher, Notification bell dropdown with compliance badge, User Profile trigger, Logout button, 11-view categorized navigation bar with category collapse, mobile navigation drawer. |
| **Sidebar** | `src/components/Sidebar.tsx` (147 lines) | Left drawer/sidebar with brand logo, 11 navigation links with active state indicator, settings link, support link, profile footer. |
| **Dashboard** | `src/App.tsx` (lines 5166–5796) | Executive maritime header banner, filter toolbar (Month, Department, Role), OT request quick link, CSV export, Fatigue warning banner, 3 summary KPI cards (Compare OT%, Total OT Pay THB, % OT to Salary), Grouped monthly bar chart (10 months Jan–Oct 2026), Department OT utilization gauges. |
| **Job Value** | `src/App.tsx` (lines 5797–6594) | Financial & Job Value KPI cards (Revenue, Cost, Profit 2026, Profit 2025), Multi-line interactive SVG chart (Revenue vs Cost vs Profit), Department/Search filters, Job Value table with pagination, CSV Import / Export / Template Hub triggers. |
| **Reports & Analytics** | `src/App.tsx` (lines 6595–7163) | Department performance reports, Month/Dept filters, PDF export trigger, SVG Spending Correlation & OT Hours composite bar chart, Department Budget vs Actual OT charts, Cargo Tonnage vs OT Analytics. |
| **Personnel Directory** | `src/App.tsx` (lines 7164–7998) | Employee roster table, Headcount KPI cards, Role/Dept/Search filters, Active vs Resigned employee tabs, Add Employee modal trigger, CSV Import / Export, Inline employee row actions (Edit, Delete, Resign). |
| **Shift Matrix Grid** | `src/App.tsx` (lines 7999–9339) | Shift scheduling core grid: Month navigator, Department tabs, Plan/Actual/Both toggle, Smart shift assistant panel, Sticky employee identity column (left), Sticky 31-day headers (top), Shift cells (M8..M24, A8..A24, N8..N24, D, OND, O) with rich tooltips, Rapid paint brush mode, LiveSimulationHUD, Batch schedule generators (4-on-2-off, 2-team, 3-team), Vessel & Crane timeline overlay. |
| **HR Web Direct Editor** | `src/App.tsx` (lines 1070–1560) | Live table editor for employee salary, OT hourly rate multipliers, probation dates, calendar types, direct inline cell updates, add new employee modal. |
| **OT Records View** | `src/App.tsx` (lines 837–1003) | Historical daily OT log table, date/employee filters, OT hours calculation, note badges. |
| **Leave Records View** | `src/App.tsx` (lines 434–836) | Employee leave management table, leave type chips (Sick, Annual, Business), approval status pills, add leave modal. |
| **Settings & Admin** | `src/App.tsx` (lines 9373–9869) | Admin user management table, user role permissions, department budget ceiling settings (150,000 THB ceiling), personal profile editor with password change. |
| **24H Scheduler Modal** | `src/components/PremiumShiftTimePickerModal.tsx` | Interactive 24-hour time picker modal: 24h steppers for start/end time, dynamic shift code calculation (`computeDynamicShift`), monthly calendar selector, AI complementary pair suggestion, Plan/Actual/Both target selector. |
| **Circadian Timeline Modal** | `src/components/CircadianTimelineModal.tsx` | 24-hour Gantt matrix modal: Hourly staffing density heatmap (00:00 to 23:00), Day/Night circadian bands, carryover segment from previous day, role filters, staffing gap alerts. |
| **Shift Radial Picker** | `src/components/ShiftRadialPicker.tsx` | Floating quick-picker popover at cell coordinates, 1-touch complementary shift recommendation, hotkeys (M, A, N, D, O, H). |
| **Live Simulation HUD** | `src/components/LiveSimulationHUD.tsx` | Real-time bottom floating HUD during paint mode: Delta OT hours, Delta THB cost, Department budget meter (150k limit), legal compliance violation alerts, Apply / Cancel buttons. |
| **CSV Template Hub** | `src/components/CsvTemplateHubModal.tsx` | Modal with 5 standardized downloadable CSV templates (Employee Roster, Job Value, Shift Schedule, Leave Records, OT History). |
| **PWA Components** | `src/components/PWAComponents.tsx` | PWAUpdateNotification toast, PWAInstallButton, PWAInstallBanner, PWAOfflineBadge. |

---

### 1.3 Detailed Color Usage & Rainbow Clutter Audit

Direct code references of mismatched colors across the codebase:
1. **Legacy Shift Style Palette (`src/App.tsx` lines 83–141)**:
   - `M8`, `M12`: `bg-[#dce6f1]` (light steel), `bg-[#ddebf7]` (ice blue), `border-[#b4c6e7]`, `text-[#4472c4]`.
   - `A8`, `A12`: `bg-[#fff2cc]` (pastel yellow), `border-[#ffd966]`, `text-black` ❌
   - `N8`, `N12`: `bg-[#fce4d6]` (peach/orange), `border-[#f8cbad]`, `text-[#ff0000]` (bright red) ❌
   - `M16`, `N16`: `bg-[#1f4e79]` (dark blue), `bg-[#ff0000]` (bright pure red) ❌
   - `D`: `bg-[#aeaaaa]` (dull gray), `border-[#7f7f7f]`, `text-[#595959]`
   - `OND`: `bg-[#00ffff]` (neon cyan), `border-[#00ffff]`, `text-black` ❌
   - Error/Overlimit: `bg-red-50 text-red-700 border-[#ff0000]` ❌
2. **Navbar Categorized Nav Pills (`src/components/Navbar.tsx` lines 112–158)**:
   - Category 1 (ภาพรวม): `bg-blue-50/90 text-blue-900 border-blue-200/90`
   - Category 2 (บุคลากร): `bg-emerald-50/90 text-emerald-900 border-emerald-200/90` ❌
   - Category 3 (วันลา & OT): `bg-amber-50/90 text-amber-900 border-amber-200/90` ❌
   - Category 4 (รายงาน): `bg-indigo-50/90 text-indigo-900 border-indigo-200/90` ❌
   - Category 5 (บริหาร): `bg-purple-50/90 text-purple-900 border-purple-200/90` ❌
3. **Vessel / Crane Schedule Colors (`src/App.tsx` lines 9987–9992)**:
   - Yellow `#fef08a`, Sky `#bfdbfe`, Purple `#f5d0fe`, Mint `#ccfbf1`, Orange `#fed7aa` ❌
4. **Job Value & Financial Multi-line Chart (`src/App.tsx` lines 6206–6274)**:
   - Revenue: `#10b981` (green) ❌
   - Cost: `#f43f5e` (rose/red) ❌
   - Profit: `#2563eb` (blue)
5. **Reports Composite Chart (`src/App.tsx` lines 6706–6738)**:
   - OT normal: `bg-blue-600`
   - OT overlimit: `bg-red-500` ❌
   - Spending budget: `bg-amber-500` ❌
6. **LiveSimulationHUD & Modals**:
   - Heavy usage of cyan (`border-cyan-500`), purple (`bg-purple-950`), amber (`text-amber-400`), emerald (`bg-emerald-950`), rose (`bg-rose-50`), indigo (`border-indigo-500`).

---

### 1.4 Comprehensive Emoji Inventory Across the Codebase

| Location | Line(s) | Exact String / JSX with Emoji | Proposed Lucide / Clean Text Replacement |
|---|---|---|---|
| `App.tsx` | 139 | `if (shift === "⚠")` | `if (shift === "ALERT" \|\| shift === "!")` (clean badge styling) |
| `App.tsx` | 379, 5272 | `⚠️` in headers & fatigue card | `<AlertTriangle className="w-4 h-4 text-slate-700" />` |
| `App.tsx` | 1825, 3862, 4135, 4512 | `window.confirm('⚠️ คุณแน่ใจหรือไม่...')` | `window.confirm('แจ้งเตือน: คุณแน่ใจหรือไม่...')` |
| `App.tsx` | 1381 | `<option value="Active">🟢 ปฏิบัติงาน</option>` | `<option value="Active">ปฏิบัติงาน (Active)</option>` |
| `App.tsx` | 2256 | `showToastMsg("↩ เลิกทำ (Undo) สำเร็จ")` | `showToastMsg("เลิกทำ (Undo) สำเร็จ")` with `<Undo2 />` icon in toast UI |
| `App.tsx` | 2268 | `showToastMsg("↪ ทำซ้ำ (Redo) สำเร็จ")` | `showToastMsg("ทำซ้ำ (Redo) สำเร็จ")` with `<Redo2 />` icon in toast UI |
| `App.tsx` | 2324, 8384, 8770 | `⚡ จัดคู่กะ Day/Night อัจฉริยะ...` | `จัดคู่กะ Day/Night อัจฉริยะ` + `<Zap className="w-3.5 h-3.5 text-blue-600" />` |
| `App.tsx` | 2394, 2819 | `✨ จัดคู่กะ... / ✨ บันทึกกะ...` | Clean text "จัดคู่กะสำเร็จ" / "บันทึกกะสำเร็จ" |
| `App.tsx` | 2434 | `🔄 คัดลอกตารางกะ Plan ไปเป็น Actual...` | Clean text "คัดลอกตารางกะ Plan ไปเป็น Actual เรียบร้อย" |
| `App.tsx` | 2567, 2569 | `เกินขีดจำกัด (> 36 ชม.) ⚠️`, `เกิน 6 วันติดต่อกัน ⚠️` | Text: `เกินขีดจำกัด (> 36 ชม.) [ระวัง]` / `เกิน 6 วันติดต่อกัน [ระวัง]` |
| `App.tsx` | 2753 | `🏖️ วันหยุดพักผ่อน (OFF)` (Tooltip) | `วันหยุดพักผ่อน (OFF)` |
| `App.tsx` | 2757 | `👤 ${empName}... 🟢 เวลาเข้างาน: ... 🔴 เวลาออกงาน: ... 🏷️ ${def.name}` | Clean multi-line tooltip with standard text: `พนักงาน: ${empName}\nเวลาเข้างาน: ...\nเวลาออกงาน: ...\nกะ: ${def.name}` |
| `App.tsx` | 2765, 2767 | `👤 ${empName}... 🏷️ ${timeLabel}` | Clean text tooltip: `พนักงาน: ${empName}\nกะ: ${timeLabel}` |
| `App.tsx` | 2850 | `✅ ทาสีกะ ${shiftCode}...` | Clean text: `บันทึกทาสีกะ ${shiftCode} จำนวน ${cells.length} ช่องสำเร็จ` |
| `App.tsx` | 2890, 2892 | `⚠️ สลับกะเรียบร้อย...`, `⚡ สลับกะสำเร็จ...` | Clean text: `สลับกะเรียบร้อย...`, `สลับกะสำเร็จ (สอดคล้องกฎหมาย 100%)` |
| `App.tsx` | 3356 | `<p className="text-red-500 text-3xl mb-2">⚠️</p>` | `<AlertTriangle className="w-8 h-8 text-slate-700 mb-2" />` |
| `App.tsx` | 5647 | `⚠️ เกินเป้าหมาย 36 ชม./เดือน` | `เกินเป้าหมาย (36 ชม./เดือน)` |
| `App.tsx` | 6673 | `เกินเป้าความปลอดภัย ⚠️` | `เกินเป้าความปลอดภัย (แจ้งเตือน)` |
| `App.tsx` | 6893 | `📊` (Empty state icon) | `<BarChart3 className="w-8 h-8 text-slate-400 mb-2" />` |
| `App.tsx` | 6981 | `<span>🚢</span> การวิเคราะห์...` | `<Ship className="w-4 h-4 text-blue-600 shrink-0 inline-block mr-1.5" />` |
| `App.tsx` | 7033 | `📦 ปริมาณงาน:` | `<Briefcase className="w-3.5 h-3.5 inline mr-1" /> ปริมาณงาน:` |
| `App.tsx` | 8350, 9894, 10094, 10445, 10807, 11090, 11139, 11286, 11418, 11469, 11548, 11694, 11816, 12236 | `✕` (unicode text cross in buttons) | `<X className="w-4 h-4" />` |
| `App.tsx` | 8434 | `💡 มี {emps.length} คนในตำแหน่งนี้...` | `<Info className="w-3.5 h-3.5 inline text-blue-600 mr-1" />` + text |
| `App.tsx` | 8436 | `⚠️ มีพนักงาน 1 คน: แนะนำ...` | `<AlertTriangle className="w-3.5 h-3.5 inline text-slate-600 mr-1" />` + text |
| `App.tsx` | 9576 | `🗑️ ลบ` | `<Trash2 className="w-3.5 h-3.5 inline mr-1" /> ลบ` |
| `App.tsx` | 9883 | `🚢` (Vessel modal header) | `<Ship className="w-5 h-5 text-white" />` |
| `App.tsx` | 10039 | `📦 {Number(vs.tonnage).toLocaleString()} ตัน` | `{Number(vs.tonnage).toLocaleString()} ตัน` |
| `App.tsx` | 10055 | `🗑️` (Vessel delete button) | `<Trash2 className="w-4 h-4 text-slate-500 hover:text-slate-900" />` |
| `App.tsx` | 10961 | `⚠️` (Job value variance alert) | `<AlertTriangle className="w-4 h-4 text-slate-700" />` |
| `App.tsx` | 10991, 11037 | `🟢 ต่อยอด (+...)`, `🔴 ไม่ต่อยอด (-...)` | `ต่อยอด (+...)` / `ไม่ต่อยอด (-...)` with typography & crisp badges |
| `App.tsx` | 11463, 11523 | `⚡`, `⚡ ปรับกะยกกลุ่ม` | `<Zap className="w-4 h-4 text-white" />` / `ปรับกะยกกลุ่ม` |
| `App.tsx` | 11638 | `✅ อนุมัติแล้ว`, `❌ ไม่อนุมัติ`, `⏳ รอพิจารณา` | Status badges: `อนุมัติแล้ว`, `ไม่อนุมัติ`, `รอพิจารณา` with `<Check />`, `<X />`, `<Clock />` |
| `App.tsx` | 11653, 11659 | `✅ อนุมัติ`, `❌ ปฏิเสธ` | `<Check className="w-3.5 h-3.5 inline mr-1" /> อนุมัติ` / `<X className="w-3.5 h-3.5 inline mr-1" /> ปฏิเสธ` |
| `CircadianTimelineModal.tsx` | 155, 173 | `◀`, `▶` (unicode arrows) | `<ChevronLeft className="w-3.5 h-3.5" />`, `<ChevronRight className="w-3.5 h-3.5" />` |
| `CircadianTimelineModal.tsx` | 212 | `✕` | `<X className="w-4 h-4" />` |
| `CircadianTimelineModal.tsx` | 252, 432 | `🟢 ครอบคลุม 100%`, `⚠️ เตือน`, `⚠️ ข้อความแจ้งเตือน` | `<CheckCircle2 className="w-3.5 h-3.5 text-blue-600 inline mr-1" /> ครอบคลุม 100%`, `<AlertTriangle className="w-3.5 h-3.5 text-slate-700 inline mr-1" /> แจ้งเตือน` |
| `CircadianTimelineModal.tsx` | 263 | `<span>⚡</span> ความหนาแน่น...` | `<Zap className="w-3.5 h-3.5 text-blue-600 inline mr-1" /> ความหนาแน่น...` |
| `CircadianTimelineModal.tsx` | 388 | `◀ {seg.shiftCode} (ต่อกะดึก)` | `ต่อกะดึก: {seg.shiftCode}` |
| `LiveSimulationHUD.tsx` | 35 | `<span className="animate-spin text-lg">⚙️</span>` | `<Settings className="w-5 h-5 text-[#1d3ec7] animate-spin" />` |
| `LiveSimulationHUD.tsx` | 102, 107 | `<span>⚠️</span>`, `<span>🟢</span>` | `<AlertTriangle className="w-3.5 h-3.5 text-slate-700" />`, `<CheckCircle2 className="w-3.5 h-3.5 text-[#1d3ec7]" />` |
| `PremiumShiftTimePickerModal.tsx` | 109, 672 | `(🌙 คร่อมวัน)`, `🌙 กะข้ามคืน` | `(ข้ามคืน +1 วัน)` with `<Clock className="w-3 h-3 inline text-slate-700" />` |
| `PremiumShiftTimePickerModal.tsx` | 717 | `1-Click ⚡` | `1-Click Quick Select` |
| `ShiftRadialPicker.tsx` | 103 | `✕` | `<X className="w-4 h-4" />` |
| `ShiftRadialPicker.tsx` | 112, 127 | `⚡ แนะนำคู่กะอัตโนมัติ`, `1-Touch ⚡` | `แนะนำคู่กะอัตโนมัติ` + `<Zap className="w-3.5 h-3.5" />`, `1-Touch Auto` |
| `circadianEngine.ts` | 362, 364 | `⚠️ ช่องว่างกำลังพล...`, `⚡ กำลังพลขั้นต่ำ...` | `[แจ้งเตือน] ช่องว่างกำลังพล...`, `[แจ้งเตือน] กำลังพลขั้นต่ำ...` |
| `main.tsx` | 35 | `⚠️` | `<AlertTriangle className="w-8 h-8 text-slate-700 mb-2" />` |

---

## 2. Logic Chain

1. **Premise 1**: The user requires a strict, ultra-minimalist, executive industrial design adhering 100% to the 4-tone monochromatic blue palette (`#0b1a3a`, `#1d3ec7`, `#6d93fc`, `#a9cdfc`) complemented by crisp white (`#ffffff`) and neutral minimalist grays (`#f8fafc` / `#e2e8f0`).
2. **Premise 2**: Current UI components use disparate, ad-hoc rainbow colors (Excel yellow `#fff2cc`, peach `#fce4d6`, cyan `#00ffff`, pure red `#ff0000`, emerald green `#10b981`, amber `#f59e0b`, rose `#f43f5e`, purple `#8b5cf6`). This creates visual distraction, breaks executive minimalism, and violates R1.
3. **Premise 3**: Current UI strings and components contain over 45 instances of emojis (⚡, 🏖️, 👤, 🟢, 🔴, 🏷️, 🌙, ⚠️, 🔄, ✅, 💡, 📊, 🚢, 📦, 🗑️, ⚙️, ✕, ◀, ▶) embedded in tooltips, badges, toasts, alerts, and modal dialogs.
4. **Inference 1**: To achieve an executive industrial aesthetic, we must define Tailwind color tokens for the 4 monochromatic blue tones and replace all rainbow utility classes across every page, component, table, card, badge, and chart.
5. **Inference 2**: Shift Matrix badges (`SHIFT_OPTIONS` and `getShiftStyle`) can be cleanly segmented into our 4 monochromatic tones based on shift intensity and duration:
   - **8h standard shifts (M8, A8, N8)**: Subtle Light Ice Blue fill (`bg-[#a9cdfc]/25 text-[#0b1a3a] border-[#a9cdfc]/60`).
   - **12h OT shifts (M12, A12, N12)**: Royal Cobalt Blue accent (`bg-[#ddebf7] text-[#1d3ec7] border-[#6d93fc]/60`).
   - **16h double shifts (M16, N16)**: Deep Navy Blue solid fill (`bg-[#0b1a3a] text-white border-[#0b1a3a]`).
   - **Full day normal (D)**: Minimalist gray (`bg-slate-100 text-slate-800 border-slate-300`).
   - **On Duty holiday (OND)**: Royal Cobalt solid fill (`bg-[#1d3ec7] text-white border-[#1d3ec7]`).
   - **Off duty / Rest day (O / OFF)**: Crisp white (`bg-white text-slate-400 border-slate-200`).
6. **Inference 3**: Charts in Job Value, Dashboard, and Reports must be refactored from red/green/yellow into monochromatic blue gradients:
   - Primary metric (Profit / Revenue / OT Hours): Royal Cobalt Blue (`#1d3ec7`).
   - Secondary metric (Target / Standard / Cost): Soft Cornflower Blue (`#6d93fc`) or Deep Navy (`#0b1a3a`).
   - Background gridlines and axes: Hairline neutral gray (`#e2e8f0`).
7. **Inference 4**: Every emoji must be replaced with corresponding Lucide SVG icons or clean, legible typographic labels, preserving 100% functional data attributes and test IDs.

---

## 3. Caveats

1. **Test Infrastructure & Shift Code Invariants**:
   - Automated tests in `tests/tier1-calculations/` verify shift codes like `"M8"`, `"M12"`, `"A8"`, `"A12"`, `"N8"`, `"N12"`, `"M16"`, `"N16"`, `"D"`, `"OND"`, `"O"`, `"OFF"`, and dynamic codes `"M1".."M24"`, `"A1".."A24"`, `"N1".."N24"`. The string values of these codes must NEVER be altered—only their CSS styling (`className` / styles) should be overhauled.
2. **Critical Test Suite Finding (`Navbar.tsx` Notification Bell title)**:
   - In `src/components/Navbar.tsx` line 263, the notification bell button has `title="การแจ้งเตือนข้อควรระวังและกฎหมายแรงงาน"`. Three responsive test suites (`tablet-768px-layout.test.tsx`, `challenger1-deep-viewport-stress.test.tsx`, `challenger-m2-responsive-stress.test.tsx`) expect `screen.getByTitle('การแจ้งเตือน')`. Standardizing the title to `title="การแจ้งเตือน"` will resolve these 3 test failures immediately.
3. **Modal and Component Test Selectors**:
   - Automated tests in `tests/tier4-workflows/` search for DOM elements via `data-testid="circadian-timeline-modal"`, `data-testid="shift-radial-picker"`, `data-testid="live-simulation-hud"`, role attributes, and aria labels. All `data-testid` attributes and form element names must remain strictly intact.
4. **Thai Language Typography**:
   - Text strings in Thai must maintain precise wording (e.g. "กะเช้า 8 ชม.", "กะบ่าย 12 ชม.", "กะดึก", "วันหยุดประจำสัปดาห์") while cleanly stripping out emoji prefixes/suffixes.
5. **No Direct Code Alterations During Survey**:
   - In accordance with the Teamwork Explorer protocol, this report is strictly read-only analysis and architectural planning. Code implementation is reserved for the implementation phase.

---

## 4. Conclusion & Complete Refactoring Blueprint

### 4.1 Master 4-Tone Industrial Palette Specification

| Tone | Hex Code | Semantic Role | Specific Component Applications |
|---|---|---|---|
| **Tone 1: Deep Navy Blue** | `#0b1a3a` | Primary Dark & Headers | Header navigation background, modal title banners, table `thead` bars, 16h double shift badges (`M16`, `N16`), dark cockpit container backgrounds, high-contrast display text. |
| **Tone 2: Royal Cobalt Blue** | `#1d3ec7` | Active Accents & Primary Actions | Primary action buttons (`bg-[#1d3ec7] hover:bg-[#0b1a3a]`), active navigation tabs, active date selectors, 12h OT shift text (`M12`, `A12`, `N12`), holiday on-duty badge (`OND`), primary KPI chart lines. |
| **Tone 3: Soft Cornflower Blue** | `#6d93fc` | Secondary Accents & Highlights | Secondary badge borders, focus ring glows (`ring-[#6d93fc]/40`), secondary chart paths, hover state highlights, helper vector icons, link highlights. |
| **Tone 4: Light Ice Blue** | `#a9cdfc` | Subtle Fills, Borders & Pill Badges | Pill badge backgrounds (`bg-[#a9cdfc]/20`), 8h regular shifts (`M8`, `A8`, `N8`: `bg-[#a9cdfc]/25 border-[#a9cdfc]/60`), table row hover tints (`hover:bg-[#a9cdfc]/10`), hairline focus borders, quick action button borders. |
| **Neutral White** | `#ffffff` | Crisp Surface Base | Card surface backgrounds, modal dialog bodies, input backgrounds, off-duty shift cells (`O`, `OFF`). |
| **Minimalist Grays** | `#f8fafc` / `#e2e8f0` / `#0f172a` | Layout Canvas & Hairlines | App body canvas (`bg-[#f8fafc]`), subtle hairline dividers (`border-[#e2e8f0]`), muted typography (`text-slate-500`), day shift badge (`D`: `bg-slate-100 border-slate-300`). |

---

### 4.2 Component-by-Component Refactoring Blueprint

#### A. Global Styles & Tailwind Config (`src/index.css`)
- Configure CSS variables under `@theme`:
  ```css
  @theme {
    --font-sans: "Sarabun", "Noto Sans Thai", "Inter", ui-sans-serif, system-ui, sans-serif;
    --font-mono: "JetBrains Mono", "Fira Code", ui-monospace, monospace;
    --color-navy-dark: #0b1a3a;
    --color-cobalt-royal: #1d3ec7;
    --color-cornflower-soft: #6d93fc;
    --color-ice-light: #a9cdfc;
  }
  ```
- Replace custom scrollbar thumb colors with Light Ice Blue tint `rgba(169, 205, 252, 0.3)`.
- Update `.maritime-glass-dark` border to `rgba(169, 205, 252, 0.15)` and `.maritime-glass-light` border to `rgba(226, 232, 240, 0.9)`.

#### B. Navbar (`src/components/Navbar.tsx`)
- Refactor the 5 category badges from rainbow colors to clean monochromatic blue & gray pills:
  - Active category: `bg-[#1d3ec7] text-white border-[#1d3ec7]`
  - Inactive category: `bg-slate-50 text-slate-700 border-slate-200 hover:bg-[#a9cdfc]/15`
  - Active item: `bg-[#0b1a3a] text-white shadow-xs`
  - Inactive item: `text-slate-600 hover:text-[#1d3ec7] hover:bg-[#a9cdfc]/15`
- Compliance notification badge: `bg-[#0b1a3a] text-white border-2 border-white` with `<AlertTriangle className="w-3 h-3 text-[#6d93fc]" />` and `title="การแจ้งเตือน"`.
- Strip any emoji from title or tooltip strings.

#### C. Sidebar (`src/components/Sidebar.tsx`)
- Replace cyan/sky highlights (`text-sky-400`, `border-sky-400`) with Royal Cobalt Blue (`text-[#1d3ec7]`, `bg-[#1d3ec7]/10`, `border-l-[#1d3ec7]`).
- Clean logout button to use subtle slate hover (`text-slate-400 hover:text-white hover:bg-slate-800`).

#### D. Shift Matrix & Shift Options (`src/App.tsx`)
- Refactor `SHIFT_OPTIONS` and `getShiftStyle`:
  ```typescript
  export const SHIFT_OPTIONS = [
    { code: "M8", label: "M8", desc: "กะเช้า 8 ชม.", bg: "bg-[#a9cdfc]/25", border: "border-[#a9cdfc]/60", text: "text-[#0b1a3a]" },
    { code: "A8", label: "A8", desc: "กะบ่าย 8 ชม.", bg: "bg-[#a9cdfc]/25", border: "border-[#a9cdfc]/60", text: "text-[#0b1a3a]" },
    { code: "N8", label: "N8", desc: "กะดึก 8 ชม.", bg: "bg-[#a9cdfc]/25", border: "border-[#a9cdfc]/60", text: "text-[#0b1a3a]" },
    { code: "M12", label: "M12", desc: "กะเช้า8 OT 4", bg: "bg-[#ddebf7]", border: "border-[#6d93fc]/60", text: "text-[#1d3ec7]" },
    { code: "A12", label: "A12", desc: "กะบ่าย8 OT 4", bg: "bg-[#ddebf7]", border: "border-[#6d93fc]/60", text: "text-[#1d3ec7]" },
    { code: "N12", label: "N12", desc: "กะดึก8 OT 4", bg: "bg-[#ddebf7]", border: "border-[#6d93fc]/60", text: "text-[#1d3ec7]" },
    { code: "M16", label: "M16", desc: "กะเช้า8 OT 8", bg: "bg-[#0b1a3a]", border: "border-[#0b1a3a]", text: "text-white font-bold" },
    { code: "N16", label: "N16", desc: "กะดึก8 OT 8", bg: "bg-[#0b1a3a]", border: "border-[#0b1a3a]", text: "text-white font-bold" },
    { code: "D", label: "D", desc: "กะกลางวันปกติ", bg: "bg-slate-100", border: "border-slate-300", text: "text-slate-700" },
    { code: "OND", label: "OND", desc: "ON DUTY (วันหยุด)", bg: "bg-[#1d3ec7]", border: "border-[#1d3ec7]", text: "text-white font-bold" },
    { code: "O", label: "O", desc: "วันหยุดพักผ่อน", bg: "bg-white", border: "border-slate-200", text: "text-slate-400" }
  ];
  ```
- Tooltips: Replace emoji-laden strings with clean structured text layout.
- Action Buttons: Unify all toolbar buttons (CSV Export, Vessel Schedule, AI Assist) into crisp `#1d3ec7` / `#0b1a3a` / `#f8fafc` button designs with hairline borders.

#### E. Dashboard, Job Value & Reports Charts (`src/App.tsx`)
- **Dashboard**:
  - Unify KPI Cards with Deep Navy and Royal Cobalt border accents (`border-l-[#1d3ec7]`, `border-l-[#0b1a3a]`).
  - Bar charts series: Cobalt Blue (`#1d3ec7`), Cornflower Blue (`#6d93fc`), and Deep Navy (`#0b1a3a`).
- **Job Value**:
  - Replace SVG chart stroke colors: Profit line (`#1d3ec7` with gradient fill `rgba(29,62,199,0.15)`), Revenue line (`#6d93fc`), Cost line (`#0b1a3a` dashed).
  - KPI Stat cards: Use Light Ice Blue badge pills (`bg-[#a9cdfc]/20 text-[#1d3ec7]`).
- **Reports**:
  - Spending correlation bar chart: OT normal (`#1d3ec7`), Budget spending (`#6d93fc`), Safety threshold indicator (`#0b1a3a`).
  - Eliminate all emoji labels.

#### F. Modals & Overlays
- **24H Scheduler (`PremiumShiftTimePickerModal.tsx`)**:
  - Replace indigo/purple/rose styling with Royal Cobalt (`#1d3ec7`) header capsule, Ice Blue (`#a9cdfc`) active day indicator, and Deep Navy (`#0b1a3a`) save button.
  - Eliminate `(🌙 คร่อมวัน)` and `1-Click ⚡` emojis.
- **Circadian Matrix (`CircadianTimelineModal.tsx`)**:
  - Replace cyan/purple glow styles with Deep Navy header, Ice Blue timeline segments, Royal Cobalt peak badges, and Lucide vector icons (`<ChevronLeft />`, `<ChevronRight />`, `<X />`).
- **LiveSimulationHUD (`LiveSimulationHUD.tsx`)**:
  - Replace cyan/red HUD styling with Deep Navy glass background (`bg-[#0b1a3a]/95 border-[#a9cdfc]/30`), Cobalt Blue delta counters, and `<Settings />` / `<CheckCircle2 />` icons.
- **Radial Picker (`ShiftRadialPicker.tsx`)**:
  - Replace rainbow gradient buttons with monochromatic blue tones (`#0b1a3a`, `#1d3ec7`, `#6d93fc`, `#a9cdfc`, `#ffffff`).
  - Replace `⚡` with `<Zap className="w-3.5 h-3.5" />`.
- **Vessel & Crane Modal (`showVesselModal`)**:
  - Replace yellow/orange/pink color pickers with 4 monochromatic blue tones + 1 neutral slate tone (`#0b1a3a`, `#1d3ec7`, `#6d93fc`, `#a9cdfc`, `#64748b`).
  - Replace `🚢`, `📦`, `🗑️`, `✕` with Lucide icons.

#### G. Hairline Borders & Typographic Hierarchy System
- **Hairline Borders**:
  - Uniform ultra-fine borders: `border border-slate-200/80` or `border border-[#a9cdfc]/30`.
  - Shift matrix cells: `border border-slate-200/60` for razor-sharp grid lines without heavy borders.
  - Modals and cards: `rounded-3xl border border-slate-200/80 shadow-sm`.
- **Typographic Scale**:
  - Header Titles: `font-black text-xl sm:text-2xl tracking-tight text-[#0b1a3a]`
  - Section Titles: `font-extrabold text-sm uppercase tracking-wider text-[#0b1a3a]`
  - Body Text / Table Content: `font-sans text-xs font-bold text-slate-700`
  - Values / Counts / Times / Money: `font-mono font-black text-sm text-[#0b1a3a]`
  - Metadata / Subtitles: `font-medium text-xs text-slate-500`

---

## 5. Verification Method

To independently verify the survey findings and validate future implementations:

1. **Automated Unit & Workflow Test Suite**:
   ```bash
   npm test
   ```
   Ensures all 41 test suites (Tier 1 calculation engines, Tier 2 responsive layouts, Tier 3 PWA service worker lifecycle, Tier 4 workflow interactions, Tier 5 adversarial stress) pass with 100% success once `Navbar.tsx` notification title is aligned to `title="การแจ้งเตือน"`.

2. **TypeScript Typecheck**:
   ```bash
   npm run lint
   ```
   Verifies 0 TypeScript diagnostics or type discrepancies across all `.tsx` and `.ts` files.

3. **Vite Production Build Compilation**:
   ```bash
   npm run build
   ```
   Confirms clean production asset bundling and zero bundle errors.

4. **Zero-Emoji Automated Verification Scan**:
   ```bash
   grep -P "[\x{1F300}-\x{1F9FF}\x{2600}-\x{26FF}\x{2700}-\x{27BF}\x{1F600}-\x{1F64F}\x{1F680}-\x{1F6FF}]" -r src/
   ```
   Must return 0 occurrences across all files in `src/`.

5. **Color System Compliance Check**:
   Inspect `src/index.css`, `src/App.tsx`, and all `src/components/*` files to verify zero leftover legacy rainbow classes (`bg-[#fff2cc]`, `bg-[#fce4d6]`, `bg-[#00ffff]`, `bg-[#ff0000]`, `bg-emerald-50`, `bg-amber-50`, `bg-purple-50`, `bg-rose-50`).
