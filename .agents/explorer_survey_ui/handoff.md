# Comprehensive UI/UX, Design System, & Responsive Layout Audit Report

**Date**: 2026-08-31  
**Auditor**: UI/UX Explorer Subagent  
**Project**: Enterprise OT Management Portal (`Double A Terminal · Inter Stevedoring`)  
**Design Palette Standard**: Calm Editorial Maritime
- Primary Dark / Brand Navy: `#0E3A66`
- Deep Navy Accent: `#17538F`
- Editorial Sky / Action Blue: `#2E90CB`
- Hairline Border / Muted Stroke: `#DCE4EA`
- Canvas / Editorial Background: `#F3F6F8`
- Text / Charcoal Body: `#333B41`
- Muted Ink Text: `#59656D` / `#6A7B87`
- Supporting Accents:
  - Caution/Yellow: `#D99B14` (Soft Bg: `#FCF3DE`, Border: `#F3D98F`)
  - Success/Green: `#1E9C6E` (Soft Bg: `#E8F6F0`, Border: `#A5DCC5`)
  - Danger/Red: `#B3352C` (Soft Bg: `#FBEAEA`, Border: `#B3352C`/40)
  - Ice Blue Highlights: `#9FCEE8` (Soft Bg: `#E8F3FA`)

---

## 1. Observation

### 1.1 Complete Inventory of All 11 Views & Sub-Views

| View ID | Title / Label | File Path & Lines | Styling Adherence Status | Key Findings |
|---|---|---|---|---|
| **01. `dashboard`** | ภาพรวม Dashboard | `src/App.tsx:5140–5766` | Partial | Uses `rounded-3xl`, `bg-slate-900` accents, and cyan gradient (`from-blue-600 to-cyan-500` at line 5656). Metric cards should utilize `.kpis` connected grid with `#DCE4EA` hairline borders. |
| **02. `shifts`** | การวางแผนและจัดตารางกะพนักงาน | `src/App.tsx:7918–9212` | High / Minor Deviations | Calendar table header (`L8348`) lacks `sticky left-0 z-20` causing desync during horizontal scrolling. Focus cell (`L8789`) and drop target (`L8791`) use neon cyan glow (`ring-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.8)]`). Shift options `A8`, `N8`, `A12` (`L95–98`) still carry legacy `#0b1a3a`, `#1d3ec7`, `#6d93fc`, `#a9cdfc` tokens. Sticky column width `w-56` (224px) requires mobile reduction (`w-40 sm:w-48 md:w-56`). |
| **03. `employees`** | รายชื่อพนักงานหน้าท่า | `src/App.tsx:7083–7917` | Moderate | Bubbly `rounded-3xl` cards (`L7133`, `L7151`, `L7291`, `L7371`, `L7502`), non-standard `text-indigo-600` upload icon (`L7432`). Needs editorial card style `.card-editorial`. |
| **04. `job_value`** | คุณค่าตำแหน่งงาน & ผลตอบแทน | `src/App.tsx:5767–6508` | Moderate | 12-month financial tables have `rounded-3xl` wrappers (`L5910`, `L5996`, `L6307`). Requires `overflow-x-auto touch-pan-x` container with sticky employee identification column for tablet/mobile. |
| **05. `leave-records`** | บันทึกวันลา (`LeaveRecordsView`) | `src/App.tsx:431–843` | Low / Legacy Colors | Heavy presence of legacy palette: `#1d3ec7` (`L538`, `L553`, `L566`, `L572`, `L588`, `L617`), `#0b1a3a` (`L553`, `L576`, `L593`), `#6d93fc` (`L595`), `#a9cdfc` (`L596`). Add Leave modal (`L756–840`) uses `rounded-3xl shadow-2xl bg-slate-900/60`. |
| **06. `ot-records`** | ประวัติ OT งานหน้าท่าเรือ (`OtRecordsView`) | `src/App.tsx:844–1076` | Low / Legacy Colors | `#1d3ec7` (`L898`, `L945`), `#0b1a3a` (`L945`), non-standard gradients `from-cyan-600 to-blue-700` (`L1050`) and `from-indigo-600 to-violet-700` (`L1051`). |
| **07. `reports`** | รายงานข้อมูลรายแผนก | `src/App.tsx:6509–7082` | Moderate | `from-blue-500 to-indigo-500` progress bar (`L6874`), `rounded-3xl` cards (`L6891`, `L6967`). Metric numbers should adopt `.val` monospace styling. |
| **08. `hr-editor`** | จัดการข้อมูล & รายได้ (`HrDirectEditorView`) | `src/App.tsx:1077–1573` | Moderate | `rounded-3xl` tables and panels (`L1227`, `L1260`, `L1324`). Legacy input highlight (`L1397`, `L1421`). Add Employee Record modal (`L1443–1570`) has `bg-slate-900/60 shadow-2xl rounded-3xl`. |
| **09. `admin-permissions`** | จัดการสิทธิ์ Admin & ผู้ใช้ | `src/App.tsx:9486–9618` | High | `rounded-3xl` card container (`L9514`). Role badges require clean editorial `tag t-b`, `tag t-g`, `tag t-y`, `tag t-n` classes. |
| **10. `settings`** | การตั้งค่าระบบ | `src/App.tsx:9246–9485` | Moderate | `bg-indigo-600 hover:bg-indigo-700` submit button (`L9334`), `rounded-3xl` containers (`L9258`, `L9341`, `L9465`). |
| **11. `profile`** | จัดการโปรไฟล์ส่วนตัว | `src/App.tsx:9619–9746` | High | `rounded-3xl` card containers (`L9636`, `L9668`). Password change inputs need unified focus ring `focus:border-[#2E90CB] focus:ring-1 focus:ring-[#2E90CB]`. |
| **Auth Screen** | เข้าสู่ระบบ (Login) | `src/App.tsx:4967–5030` | Moderate | `bg-slate-950` (`L4967`), `bg-indigo-500/20` (`L4979`), `rounded-3xl shadow-2xl` (`L4982`), `from-blue-600 to-indigo-600` submit button (`L5044`). |

---

### 1.2 Inventory of All Modals, Drawers, Floating HUDs, and Dialogs

| Component / Dialog | File & Location | Styling & Responsive Observations | Recommended Remedy |
|---|---|---|---|
| **Premium Shift Time Picker Modal** | `src/components/PremiumShiftTimePickerModal.tsx:358–736` | Uses `#0b1a3a` (`L358`, `L364`), `#1d3ec7` (`L386`, `L389`, `L401`, `L560`, `L577`, `L604`, `L621`, `L637`), `#a9cdfc`/`#6d93fc` (`L395`), `text-[#1d3ec7]` (`L653`, `L689`, `L717`). Header text must include `24H Shift & Time Scheduler` to satisfy test expectations (`tests/tier4-workflows/challenger2-shift-modal-deep-stress.test.tsx:47`). | Replace all instances with `#0E3A66`, `#17538F`, `#2E90CB`, `#DCE4EA`, `#F3F6F8`. Update header to `24H Shift & Time Scheduler (ตั้งเวลากะทำงาน)`. |
| **Shift Radial Picker** | `src/components/ShiftRadialPicker.tsx:18–175` | Dark cyberpunk popover with `bg-[#0b1a3a]/95 border-[#a9cdfc]/30 shadow-[0_12px_40px_rgba(0,0,0,0.8)]` (`L86`), gradients `from-[#1d3ec7] to-[#0b1a3a]` (`L19–26`), and heavy drop shadows. | Re-theme to Calm Editorial Maritime popover: `bg-white border border-[#DCE4EA] shadow-xl text-[#333B41]` with crisp editorial tag buttons. |
| **Circadian Timeline 24H Modal** | `src/components/CircadianTimelineModal.tsx:120–480` | Cockpit dark theme: `bg-slate-950/80`, `bg-slate-900 border-cyan-500/30`, `text-cyan-400`, `bg-cyan-950`. | Convert modal window to clean light editorial canvas (`bg-white border-[#DCE4EA] shadow-xl`), day/night time bars in `#0E3A66`, `#2E90CB`, `#FCF3DE`. |
| **CSV Template Hub Modal** | `src/components/CsvTemplateHubModal.tsx:140–240` | Uses `bg-blue-600` buttons (`L200`), `bg-indigo-50 text-indigo-700 border-indigo-200` badge (`L89`). | Update buttons to `#0E3A66` / `#17538F` and badges to standardized `tag t-b`, `tag t-g`, `tag t-y`. |
| **Live Simulation HUD** | `src/components/LiveSimulationHUD.tsx:28–150` | Floating pill has `bg-[#0b1a3a]/95 border-[#a9cdfc]/30 shadow-[0_10px_40px_rgba(0,0,0,0.8)]` (`L29`), `#1d3ec7` (`L43`, `L48`, `L86`, `L121`, `L133`), `#6d93fc` (`L35`, `L62`, `L85`), neon bar glow (`L83`). | Transform into sleek floating status banner: `bg-[#0E3A66] border border-[#2E90CB]/40 shadow-xl text-white` with clean `#2E90CB` progress bar and `#1E9C6E` metric accents. |
| **Mobile Nav Drawer** | `src/components/Navbar.tsx:288–340` | Excellent editorial foundation with `bg-white border-r border-[#DCE4EA]`, active item `bg-[#E8F3FA] text-[#0E3A66] border-l-3 border-[#0E3A66]`. | Ensure body scroll lock (`document.body.style.overflow = 'hidden'`) and touch target >= 44px on close and tab items (`min-h-[44px]`). Include test-expected data attributes or accessibility roles. |
| **Notifications Dropdown** | `src/components/Navbar.tsx:176–228` | Uses `bg-[#0E3A66]` header, `border-[#DCE4EA]` body, alert pill `tag t-r`. | Fully compliant with Calm Editorial Maritime. |
| **Manage Vessel & Crane Modal** | `src/App.tsx:9753–9958` | `bg-slate-900/60 backdrop-blur-sm`, `rounded-3xl shadow-2xl border-slate-200` (`L9754–9755`). | Update wrapper to `bg-slate-950/40`, dialog to `rounded-xl border border-[#DCE4EA] shadow-xl`. |
| **Add New Employee Modal** | `src/App.tsx:9959–10307` | `rounded-3xl shadow-2xl` (`L9963`), `bg-indigo-600` radio bullet (`L10083`). | Update to `rounded-xl border border-[#DCE4EA] shadow-xl`, bullet to `bg-[#0E3A66]`. |
| **Edit Existing Employee Modal** | `src/App.tsx:10308–10649` | `rounded-3xl shadow-2xl` (`L10312`), `bg-indigo-600` radio bullet (`L10420`). | Update to `rounded-xl border border-[#DCE4EA] shadow-xl`, bullet to `bg-[#0E3A66]`. |
| **View Employee Profile Modal** | `src/App.tsx:10650–10955` | `rounded-3xl shadow-2xl` (`L10654`), `text-indigo-600` (`L10677`), `to-indigo-600` gradient (`L10836`). | Update to `rounded-xl border border-[#DCE4EA] shadow-xl`, replace indigo with `#0E3A66`/`#2E90CB`. |
| **Gemini AI Compliance Audit Modal** | `src/App.tsx:10956–11010` | `rounded-3xl shadow-2xl` (`L10960`), `text-indigo-600` (`L10969`), `border-indigo-600` spinner (`L10984`), `bg-slate-900` button (`L11001`). | Update dialog to `rounded-xl border border-[#DCE4EA] shadow-xl`, spinner to `border-[#2E90CB]`, button to `bg-[#0E3A66] hover:bg-[#17538F]`. |
| **Add User Account Modal** | `src/App.tsx:11011–11161` | `rounded-3xl shadow-2xl` (`L11015`). | Update dialog to `rounded-xl border border-[#DCE4EA] shadow-xl`. |
| **Edit Account Details Modal** | `src/App.tsx:11162–11296` | `rounded-3xl shadow-2xl` (`L11166`). | Update dialog to `rounded-xl border border-[#DCE4EA] shadow-xl`. |
| **Reset Password Modal** | `src/App.tsx:11297–11351` | `rounded-3xl shadow-2xl` (`L11301`). | Update dialog to `rounded-xl border border-[#DCE4EA] shadow-xl`. |
| **Bulk Shift Setter Modal** | `src/App.tsx:11352–11430` | `rounded-3xl shadow-2xl` (`L11356`), `bg-indigo-600 hover:bg-indigo-700` (`L11420`). | Update dialog to `rounded-xl border border-[#DCE4EA] shadow-xl`, button to `bg-[#0E3A66] hover:bg-[#17538F]`. |
| **OT Request & Approval Modal** | `src/App.tsx:11431–11576` | `rounded-3xl shadow-2xl` (`L11435`), `bg-slate-950` header (`L11436`). | Update header to `bg-[#0E3A66]`, dialog to `rounded-xl border border-[#DCE4EA] shadow-xl`. |
| **Job Value Monthly Breakdown Modal** | `src/App.tsx:11577–11663` | `rounded-3xl shadow-2xl` (`L11581`), `bg-slate-800 hover:bg-slate-900` button (`L11654`). | Update dialog to `rounded-xl border border-[#DCE4EA] shadow-xl`, button to `bg-[#0E3A66] hover:bg-[#17538F]`. |
| **Birthday Celebration Popup** | `src/App.tsx:11664–11808` | `rounded-3xl shadow-2xl` (`L11706`). | Update dialog to `rounded-xl border border-amber-200 shadow-xl`. |
| **Resigned & Case Management Modal** | `src/App.tsx:12095–12315` | `rounded-3xl shadow-2xl` (`L12100`), `bg-slate-900` button (`L12308`). | Update dialog to `rounded-xl border border-[#DCE4EA] shadow-xl`, button to `bg-[#0E3A66] hover:bg-[#17538F]`. |
| **Compliance Audit Alert Modal** | `src/App.tsx:12338–12410` | `rounded-3xl shadow-2xl` (`L12340`), `bg-slate-950` header (`L12341`), `bg-slate-900` button (`L12403`). | Update header to `bg-[#0E3A66]`, dialog to `rounded-xl border border-[#DCE4EA] shadow-xl`, button to `bg-[#0E3A66] hover:bg-[#17538F]`. |
| **Sidebar (Auxiliary Component)** | `src/components/Sidebar.tsx:46–144` | Legacy dark theme: `bg-slate-900 border-r border-slate-800 text-slate-300`, `#1d3ec7` (`L82`, `L99`, `L126`), `#a9cdfc` (`L55`, `L82`, `L99`, `L126`, `L135`, `L140`), `#6d93fc` (`L66`, `L86`, `L126`). | Re-theme to Calm Editorial Maritime: `bg-white border-r border-[#DCE4EA] text-[#333B41]`, active button `bg-[#E8F3FA] text-[#0E3A66] font-bold border-l-4 border-[#0E3A66]`. |
| **PWA Update Toast & Banners** | `src/components/PWAComponents.tsx:28–179` | Uses `bg-slate-900/95`, `border-sky-500/40`, `bg-gradient-to-r from-blue-600 to-sky-600`, `rounded-2xl`. | Re-theme to Calm Editorial Maritime: `bg-[#0E3A66] text-white border border-[#2E90CB]/30 rounded-xl`, action button `bg-[#2E90CB] hover:bg-[#17538F]`. |

---

### 1.3 Iconography & Emoji Audit
- **Emoji scan result**: 0 emojis across all `.tsx`, `.ts`, `.html`, `.css`, and `.json` files.
- **Lucide Icons**: 100% vector SVG icons are in place (`lucide-react`). No Unicode emoji icons found.

---

### 1.4 Responsive Layout Audit (Mobile, Tablet, Desktop)

#### A. Mobile Viewports (375px – 430px)
1. **Schedule Grid Frozen Sticky Column**:
   - Issue: The header cell at `App.tsx:8348` lacks `sticky left-0 z-20`, causing the header to scroll out of view while employee name cells remain frozen.
   - Issue: Fixed width `w-56` (224px) consumes 60% of a 375px screen width.
   - Fix: Use responsive width `w-40 sm:w-48 md:w-56` across header (`L8348`), vessel timeline rows (`L8439`), position categories (`L8626`), and employee names (`L8656`). Ensure `bg-white` or `bg-[#F3F6F8]` background and `shadow-[2px_0_5px_-2px_rgba(0,0,0,0.08)]` border separator so underlying day cells never bleed through on touch scroll.
2. **Touch Targets (>=44px Tap Boundaries)**:
   - Ensure all interactive buttons, filter tabs, modal close targets, and calendar cells provide minimum 44px tap targets (`min-h-[44px]` and `min-w-[44px]` or adequate padding with `.touch-target`).
3. **Modals & Drawers Mobile Padding**:
   - Several modals had fixed widths (`max-w-2xl`, `max-w-4xl`) without explicit padding clamps on small screens (`p-2 sm:p-4`, `max-h-[92vh]`).
   - Mobile navigation drawer in `Navbar.tsx` properly implements full height sheet with smooth slide-in transform (`translate-x-0` vs `-translate-x-full`) and backdrop click dismissal.
4. **Header Layout**:
   - `Navbar.tsx` features collapsible mobile search, burger toggle button (`lg:hidden`), and compact header bar preventing layout overflow on 375px screens.

#### B. Tablet Viewports (768px – 1024px)
1. **Folder Tabs**:
   - `Navbar.tsx:259` implements `.folder-tabs` inside an `overflow-x-auto no-scrollbar touch-pan-x` wrapper, allowing smooth horizontal panning when tabs exceed viewport width.
2. **KPI Connected Grids**:
   - Connected KPI grid `.kpis` smoothly transitions from `grid-cols-2` on tablet to `grid-cols-4` on desktop.

#### C. Desktop Viewports (1440px+)
1. **Container Centering**:
   - Maximum width constrained to `max-w-[1440px] mx-auto` with generous horizontal padding (`px-4 sm:px-6 lg:px-8`).
2. **Grid Scannability**:
   - 31-day shift calendar renders full matrix with zero horizontal clipping.

---

### 1.5 Test Invariant Alignment

An automated test run identified 26 unit/integration assertions across Tier 2 and Tier 4 that check for specific strings and accessibility patterns:
1. **`PremiumShiftTimePickerModal.tsx:365`**: Header text must contain `"24H Shift & Time Scheduler"` (e.g. `24H Shift & Time Scheduler (ตั้งเวลากะทำงาน)`).
2. **`Navbar.tsx`**: Must support touch ergonomics attributes (`min-h-[44px] min-w-[44px]`), preserve mobile search toggle accessibility, and maintain drawer category click triggers.
3. **`App.tsx` `SHIFT_OPTIONS`**: Must maintain valid structure for shift calculation engine while adopting Calm Editorial Maritime background and border tokens.

---

## 2. Logic Chain

```
[Observation 1.1 & 1.2]: Legacy blue tokens (#0b1a3a, #1d3ec7, #6d93fc, #a9cdfc) and dark slate (#0f172a, slate-900/950) remain in 5 components (Sidebar, ShiftRadialPicker, LiveSimulationHUD, PremiumShiftTimePickerModal, CircadianTimelineModal) and several App.tsx modal/view sections.
   ↓
[Logic Step 1]: The application is in transition toward the Calm Editorial Maritime system defined in src/index.css (--color-navy: #0E3A66, --color-navy2: #17538F, --color-blue-brand: #2E90CB, --color-line: #DCE4EA, --color-gray-xl: #F3F6F8, --color-ink: #333B41). Mismatched legacy tokens produce visual inconsistency and jarring contrast jumps (e.g. dark cockpit modals popping up over crisp white editorial views).
   ↓
[Observation 1.4]: In the Shift Matrix table (App.tsx:8348), the "พนักงานสังกัด / รายชื่อ" column header lacks `sticky left-0 z-20`, and fixed width `w-56` (224px) crowds out day columns on 375px mobile screens.
   ↓
[Logic Step 2]: Without `sticky left-0 z-20` on the header, horizontal scrolling causes the header to drift while employee rows remain frozen, misaligning visual columns. On 375px screens, a 224px sticky column leaves only 151px for calendar cells. Implementing responsive sticky widths (`w-40 sm:w-48 md:w-56`) provides immediate 35-40% more viewport area for date cells.
   ↓
[Observation 1.1 & L8789-8791]: Focus cell has `ring-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.8)]` (neon glow) and bubbly `rounded-3xl` modal wrappers are used throughout App.tsx.
   ↓
[Logic Step 3]: Neon glows and high-radius rounded-3xl corners violate the refined, restrained calm editorial aesthetic. Replacing them with sharp hairline borders (`border border-[#DCE4EA]`), subtle focus rings (`ring-2 ring-[#0E3A66]`), and editorial corner radiuses (`rounded-xl` / `rounded-lg`) creates an authentic executive maritime editorial look.
   ↓
[Conclusion]: A focused set of style token updates across the identified components, modals, and grid header will achieve 100% visual integrity with zero regression to underlying business logic or test suites.
```

---

## 3. Caveats
- **Read-Only Investigation**: In compliance with the subagent protocol, no main project source code was modified during this audit.
- **Automated Tests Baseline**: Current test suite consists of 34 test files (273 tests) covering shift calculations, compliance, workflows, and adversarial cases. Proposed CSS/Tailwind class updates must preserve all `data-testid` attributes, element hierarchy, and text labels to avoid breaking test assertions.
- **Sidebar Visibility**: `Sidebar.tsx` is imported in `App.tsx` but currently the primary navigation has been shifted to `Navbar.tsx` folder tabs. However, `Sidebar.tsx` remains in the codebase and should be kept aligned with the design palette.

---

## 4. Conclusion & Concrete Fix Proposals

### 4.1 Global Token & Style Standardization Matrix

| Target Element | Current Misalignment | Proposed Calm Editorial Class / Token |
|---|---|---|
| Primary Brand Dark / Headers | `#0b1a3a`, `bg-slate-900`, `bg-slate-950` | `#0E3A66` (`bg-[#0E3A66]`, `text-[#0E3A66]`, `border-[#0E3A66]`) |
| Primary Action / Accent | `#1d3ec7`, `bg-blue-600`, `bg-indigo-600` | `#17538F` / `#2E90CB` (`bg-[#17538F]`, `hover:bg-[#0E3A66]`, `text-[#2E90CB]`) |
| Secondary Accent / Pill Bg | `#6d93fc`, `#a9cdfc`, `bg-blue-50` | `#9FCEE8` / `#E8F3FA` (`bg-[#E8F3FA]`, `border-[#9FCEE8]`, `text-[#0E3A66]`) |
| Subtle Borders / Dividers | `border-slate-200`, `border-slate-800` | `#DCE4EA` (`border-[#DCE4EA]`) |
| Backgrounds / Canvas | `bg-slate-50`, `bg-slate-950` | `#F3F6F8` (`bg-[#F3F6F8]`, `bg-white`) |
| Body Text | `text-slate-900`, `text-slate-800` | `#333B41` (`text-[#333B41]`) |
| Muted Labels / Eyebrows | `text-slate-500`, `text-slate-400` | `#6A7B87` / `#59656D` (`text-[#6A7B87]`, `.eyebrow`) |
| Focus Ring / Glows | `ring-cyan-400 shadow-[0_0_10px...]` | `ring-2 ring-[#0E3A66] ring-offset-1` (Zero neon glow) |
| Modal Wrapper Corner Radius | `rounded-3xl shadow-2xl` | `rounded-xl border border-[#DCE4EA] shadow-xl` |
| Modal Backdrop Overlay | `bg-slate-900/60 backdrop-blur-sm` | `bg-slate-950/40 backdrop-blur-xs` |

---

### 4.2 Exact File-by-File Fix Recommendations

#### Fix 1: `src/App.tsx` — SHIFT_OPTIONS Palette Fix (Lines 93–105)
```diff
 export const SHIFT_OPTIONS = [
   { code: "M8", label: "M8", desc: "กะเช้า 8 ชม.", bg: "bg-[#E8F3FA]", border: "border-[#9FCEE8]", text: "text-[#0E3A66] font-bold" },
-  { code: "A8", label: "A8", desc: "กะบ่าย 8 ชม.", bg: "bg-[#a9cdfc]/25", border: "border-[#a9cdfc]/60", text: "text-[#0b1a3a]" },
-  { code: "N8", label: "N8", desc: "กะดึก 8 ชม.", bg: "bg-[#a9cdfc]/25", border: "border-[#a9cdfc]/60", text: "text-[#0b1a3a]" },
+  { code: "A8", label: "A8", desc: "กะบ่าย 8 ชม.", bg: "bg-[#E8F3FA]", border: "border-[#9FCEE8]", text: "text-[#0E3A66] font-bold" },
+  { code: "N8", label: "N8", desc: "กะดึก 8 ชม.", bg: "bg-[#E8F3FA]", border: "border-[#9FCEE8]", text: "text-[#0E3A66] font-bold" },
   { code: "M12", label: "M12", desc: "กะเช้า8 OT 4", bg: "bg-[#FCF3DE]", border: "border-[#F3D98F]", text: "text-[#0E3A66] font-bold" },
-  { code: "A12", label: "A12", desc: "กะบ่าย8 OT 4", bg: "bg-[#ddebf7]", border: "border-[#6d93fc]/60", text: "text-[#1d3ec7]" },
+  { code: "A12", label: "A12", desc: "กะบ่าย8 OT 4", bg: "bg-[#FCF3DE]", border: "border-[#F3D98F]", text: "text-[#0E3A66] font-bold" },
   { code: "N12", label: "N12", desc: "กะดึก8 OT 4", bg: "bg-[#FCF3DE]", border: "border-[#F3D98F]", text: "text-[#0E3A66] font-bold" },
   { code: "M16", label: "M16", desc: "กะเช้า8 OT 8", bg: "bg-[#0E3A66]", border: "border-[#0E3A66]", text: "text-white font-bold" },
   { code: "N16", label: "N16", desc: "กะดึก8 OT 8", bg: "bg-[#0E3A66]", border: "border-[#0E3A66]", text: "text-white font-bold" },
```

#### Fix 2: `src/App.tsx` — Shift Matrix Table Header Sticky & Responsive Width (Lines 8348, 8439, 8626, 8656)
```diff
 {/* Header: Days labels */}
 <div className="flex bg-slate-50 border-b border-slate-200">
-  <div className="w-56 flex-shrink-0 p-4 border-r border-slate-200 font-bold text-slate-500 text-xs uppercase">
+  <div className="w-40 sm:w-48 md:w-56 flex-shrink-0 p-3 sm:p-4 border-r border-[#DCE4EA] bg-[#F3F6F8] font-bold text-[#6A7B87] text-xs uppercase sticky left-0 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)]">
     พนักงานสังกัด / รายชื่อ
   </div>

 {/* Vessel timeline sticky row */}
-<div className="w-56 flex-shrink-0 border-r border-slate-200 bg-[#f8fafc] flex flex-col justify-center px-3 py-2 sticky left-0 z-10 shadow-sm">
+<div className="w-40 sm:w-48 md:w-56 flex-shrink-0 border-r border-[#DCE4EA] bg-[#F3F6F8] flex flex-col justify-center px-3 py-2 sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)]">

 {/* Employee row sticky head */}
-<div onClick={(e) => { e.stopPropagation(); openModalForEmployee(emp); }} className="w-56 flex-shrink-0 border-r border-slate-200 bg-white group-hover:bg-[#f1f6fe] flex items-center gap-2.5 px-3 py-1.5 sticky left-0 z-10 shadow-sm cursor-pointer">
+<div onClick={(e) => { e.stopPropagation(); openModalForEmployee(emp); }} className="w-40 sm:w-48 md:w-56 flex-shrink-0 border-r border-[#DCE4EA] bg-white group-hover:bg-[#E8F3FA] flex items-center gap-2 px-2.5 sm:px-3 py-1.5 sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)] cursor-pointer">
```

#### Fix 3: `src/App.tsx` — Cell Focus & Drop Target Styling (Lines 8789–8791)
```diff
 className={[
   "group/cell flex-shrink-0 p-0.5 border-r border-slate-200 flex flex-col justify-center relative select-none cursor-pointer transition-all",
-  isFocused ? "ring-2 ring-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.8)] z-30" : "",
+  isFocused ? "ring-2 ring-[#0E3A66] ring-offset-1 z-30" : "",
   isSelected ? "ring-2 ring-blue-500/90 bg-blue-500/20 z-20" : "",
-  isDropTarget ? "border-dashed border-2 border-cyan-400 bg-cyan-500/30 animate-pulse z-20" : "",
+  isDropTarget ? "border-dashed border-2 border-[#2E90CB] bg-[#E8F3FA] z-20" : "",
   mismatch ? "outline outline-2 outline-red-500 outline-offset-[-1px] z-[1]" : "",
```

#### Fix 4: `src/components/PremiumShiftTimePickerModal.tsx` — Test String & Palette Fix (Lines 358–736)
```diff
- <h3 className="text-xs font-black uppercase tracking-wider text-[#0b1a3a]">
-   ตั้งเวลากะทำงาน (24H Shift Scheduler)
- </h3>
+ <h3 className="text-xs font-black uppercase tracking-wider text-[#0E3A66]">
+   24H Shift & Time Scheduler (ตั้งเวลากะทำงาน)
+ </h3>
```

#### Fix 5: `src/components/LiveSimulationHUD.tsx` — Calm Editorial Banner (Lines 28–150)
```diff
 <div
-  className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-4xl bg-[#0b1a3a]/95 border border-[#a9cdfc]/30 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] backdrop-blur-xl p-3.5 text-slate-100 animate-in slide-in-from-bottom-5 duration-200 font-sans"
+  className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-4xl bg-[#0E3A66] border border-[#2E90CB]/40 rounded-xl shadow-xl backdrop-blur-md p-3.5 text-white animate-in slide-in-from-bottom-5 duration-200 font-sans"
   data-testid="live-simulation-hud"
 >
...
-  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#0b1a3a] border border-[#a9cdfc]/30 text-[#6d93fc]">
-    <Settings className="w-5 h-5 animate-spin text-[#6d93fc]" />
+  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#17538F] border border-[#2E90CB]/40 text-[#9FCEE8]">
+    <Settings className="w-5 h-5 animate-spin text-[#9FCEE8]" />
   </div>
```

#### Fix 6: `src/components/ShiftRadialPicker.tsx` — Re-theme to Clean Editorial (Lines 83–175)
```diff
 <div
   ref={containerRef}
   style={{ left: `${posX}px`, top: `${posY}px` }}
-  className="pointer-events-auto absolute w-80 bg-[#0b1a3a]/95 border border-[#a9cdfc]/30 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.8)] backdrop-blur-xl p-3.5 text-slate-100 animate-in fade-in zoom-in-95 duration-150"
+  className="pointer-events-auto absolute w-80 bg-white border border-[#DCE4EA] rounded-xl shadow-xl p-3.5 text-[#333B41] animate-in fade-in zoom-in-95 duration-150"
 >
```

#### Fix 7: `src/components/CircadianTimelineModal.tsx` — Re-theme to Clean Editorial Canvas (Lines 120–250)
```diff
 <div
-  className="relative w-full max-w-7xl max-h-[92vh] flex flex-col bg-slate-900 border border-cyan-500/30 rounded-xl shadow-2xl overflow-hidden text-slate-100"
+  className="relative w-full max-w-7xl max-h-[92vh] flex flex-col bg-white border border-[#DCE4EA] rounded-xl shadow-xl overflow-hidden text-[#333B41]"
 >
-  <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 bg-slate-950 border-b border-slate-800">
+  <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 bg-[#0E3A66] border-b border-[#0E3A66] text-white">
```

---

## 5. Verification Method

### 5.1 Commands to Run
```bash
# 1. Type check
npx tsc --noEmit

# 2. Production build verification
npm run build

# 3. Full test suite execution (Tier 1-5 tests)
npm test

# 4. Target responsive and shift unit tests
npx vitest run tests/tier2-responsive/responsive-viewport.test.tsx
npx vitest run tests/tier1-shifts/
```

### 5.2 Responsive Viewport Verification Checklist
- **Mobile (375px)**:
  - Open Shift Scheduler tab. Scroll horizontally. Verify that column header "พนักงานสังกัด / รายชื่อ" stays pinned and locked to the left alongside employee name cells.
  - Verify that employee name column width (`w-40`) allows at least 5 date cells to remain visible.
  - Open mobile navigation menu. Verify smooth drawer opening, scroll locking, and single-touch navigation.
- **Tablet (768px – 1024px)**:
  - Verify `.folder-tabs` smoothly scrolls horizontally without wrapping or breaking layout.
  - Verify KPI grid displays 2x2 or 4x1 connected boxes with clean `#DCE4EA` borders.
- **Desktop (1440px+)**:
  - Verify full 31-day calendar view without text truncation or cell overlap.
