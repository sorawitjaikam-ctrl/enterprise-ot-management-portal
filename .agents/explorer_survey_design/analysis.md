# Visual Architecture & Design System Audit Report: Radical Minimalism Overhaul

**Target Project**: Enterprise OT Management Portal  
**Project Root**: `C:\Users\ssrwj\Documents\antigravity\mysterious-einstein`  
**Explorer Role**: Visual Architecture & Design System Survey Explorer  
**Date**: 2026-09-02  
**Status**: COMPLETE  

---

## 1. Executive Summary

A comprehensive read-only survey and visual architecture audit was conducted across the entire Enterprise OT Management Portal codebase (`src/App.tsx`, `src/index.css`, `src/components/*`, `src/utils/*`, `index.html`, and configuration files).

The current application exhibits a hybrid state: while recent efforts established a calm editorial CSS foundation (`src/index.css` with CSS variables `--navy`, `--blue`, `--line`, etc.), the actual JSX components and views still contain over **250+ legacy hardcoded hex codes**, **20+ gradient containers**, **40+ heavy box-shadow instances** (`shadow-2xl`, `shadow-xl`, custom multi-stop rgba shadows), **overly rounded container radii** (`rounded-3xl`, `rounded-2xl`), **up to 5 distinct font weights** (`medium`, `semibold`, `bold`, `extrabold`, `black`) and **6–8 distinct font sizes** within single screens.

Furthermore, several sub-modules (such as `CircadianTimelineModal.tsx`, `LiveSimulationHUD.tsx`, and `ShiftRadialPicker.tsx`) remain rendered in an incongruent dark sci-fi / cyberpunk neon aesthetic (`bg-slate-950`, `border-cyan-500`, `animate-pulse`, `animate-ping`, purple night bands), conflicting directly with the executive Swiss-style radical minimalism required.

---

## 2. Palette & Design Token Audit (R2 & R4)

### 2.1 Authorized Strict Minimalist Palette

| Token Role | Color Name | Hex Code | Purpose & Usage Guidelines |
|---|---|---|---|
| **Primary Base** | Deep Navy | `#0E3A66` | Primary brand color, main headers, primary CTA buttons, table active headers |
| **Supporting Blue 1** | Cobalt / Navy 2 | `#17538F` | Hover states on primary elements, secondary accents, active tab indicators |
| **Supporting Blue 2** | Cerulean Blue | `#2E90CB` | Focus rings, text links, active interactive outlines |
| **Supporting Blue 3** | Ice Blue Light | `#9FCEE8` | Light shift pill borders, subtle highlight containers |
| **Supporting Blue 4** | Mist Blue XL | `#E8F3FA` | Active row backgrounds, subtle card tints, table hover fills |
| **Semantic Accent** | Forest Green | `#1E9C6E` | Success badges, compliant status, positive profit metrics |
| **Semantic Accent** | Amber Gold | `#D99B14` | Warning badges, pending approvals, threshold warnings |
| **Semantic Accent** | Crimson Red | `#B3352C` | Error badges, labor law violation alerts, destructive actions |
| **Neutral 1** | Charcoal Ink | `#333B41` | Primary body typography, table text, form input text |
| **Neutral 2** | Steel Ink 2 | `#59656D` | Secondary body text, table subtext, input labels |
| **Neutral 3** | Muted Gray | `#6A7B87` | Tertiary text, placeholder text, icon default tint |
| **Neutral 4** | Border Gray Light | `#B4C1C9` | Disabled text, subtle hairline dividers |
| **Neutral 5** | Hairline Line | `#DCE4EA` | Primary structural border (`1px solid #DCE4EA`) |
| **Neutral 6** | Canvas Gray XL | `#F3F6F8` | Page background, input field background, neutral badge fill |
| **Neutral 7** | Pure White | `#FFFFFF` | Card surface, table cell surface, modal surface |

### 2.2 Inventory of Rogue Colors & Incongruent Themes

The survey identified significant rogue color usage across views and components:

1. **Previous Monochromatic Blue Hex Remnants (Must be eliminated)**:
   - `#0b1a3a` (Found in `App.tsx:95, 96, 553, 576, 593, 3403`, `Sidebar.tsx:46, 55`, `LiveSimulationHUD.tsx:29, 35`, `PremiumShiftTimePickerModal.tsx:358, 364`, `ShiftRadialPicker.tsx:19-29, 86`): Rogue dark navy. Must be replaced by `#0E3A66` or `#333B41`.
   - `#1d3ec7` (Found in `App.tsx:98, 538, 553, 566, 572, 588, 594, 617, 626, 635, 688, 898, 940, 945, 1397, 1421, 1447`, `Sidebar.tsx:82, 99, 126`, `LiveSimulationHUD.tsx:43, 47, 86, 121, 133`, `PremiumShiftTimePickerModal.tsx:387, 389, 396, 400, 429, 439, 487, 499, 535, 545, 560, 577, 604, 621, 637, 654, 689, 696, 717`, `ShiftRadialPicker.tsx:19-28, 113, 121, 125, 149`): Saturated royal blue. Must be replaced with `#0E3A66` / `#17538F` / `#2E90CB`.
   - `#6d93fc` (Found in `App.tsx:98, 595`, `Sidebar.tsx:66, 86, 126`, `LiveSimulationHUD.tsx:36, 43, 62, 85, 86, 133`, `PremiumShiftTimePickerModal.tsx:395`, `ShiftRadialPicker.tsx:19, 21, 23, 24, 26, 92`): Cornflower blue accent. Must be replaced with `#2E90CB` or `#9FCEE8`.
   - `#a9cdfc` (Found in `App.tsx:95, 96, 596`, `Sidebar.tsx:55, 82, 99, 126, 135, 140`, `LiveSimulationHUD.tsx:29, 35, 40, 43, 55`, `PremiumShiftTimePickerModal.tsx:395`, `ShiftRadialPicker.tsx:20, 22, 25, 28, 86, 96, 171`): Soft ice blue. Must be replaced with `#9FCEE8` or `#E8F3FA`.
   - `#ddebf7`, `#dce6f1`, `#b4c6e7`, `#fff2cc`, `#fce4d6`, `#1f4e79`, `#aeaaaa`, `#00ffff` (Found in `App.tsx:8157-8167` shift legend and `App.tsx:98`): Rainbow pastel styling. Must strictly conform to semantic shift styles.

2. **Tailwind Standard Slate/Blue/Emerald/Amber/Rose Classes in UI surfaces**:
   - `bg-slate-50`, `bg-slate-100`, `bg-slate-200`, `bg-slate-800`, `bg-slate-900`, `bg-slate-950` across cards and modals.
   - `bg-blue-50`, `bg-blue-600`, `bg-blue-700`, `text-blue-600`, `border-blue-200`.
   - `bg-emerald-50`, `text-emerald-700`, `bg-emerald-600`.
   - `bg-amber-50`, `text-amber-700`, `bg-amber-600`.
   - `bg-red-50`, `bg-rose-50`, `text-red-600`, `text-rose-600`, `bg-rose-600`.
   - `bg-indigo-50`, `bg-indigo-600`, `text-indigo-700`, `bg-purple-50`, `text-purple-700`.

3. **Sci-Fi Cyan/Purple Night Theme in `CircadianTimelineModal.tsx`**:
   - `bg-slate-950/80 backdrop-blur-md`
   - `bg-slate-900 border border-cyan-500/30 rounded-xl text-slate-100`
   - `bg-cyan-950 border border-cyan-500/40 text-cyan-400`
   - `text-cyan-400`, `text-sky-400`, `text-amber-400`, `text-purple-400`, `text-emerald-400`
   - `bg-purple-950`, `bg-sky-950`, `bg-red-950`, `bg-amber-950`
   - `bg-purple-600/80 border border-purple-400`
   - *Requirement*: Needs full restyling to calm editorial white/light canvas with `#0E3A66`, `#17538F`, and `#DCE4EA` borders.

4. **Gradient Containers & Ornamental Backgrounds**:
   - `App.tsx:1061`: Avatar gradient `bg-gradient-to-br ${selectedGradient}`
   - `App.tsx:3344`: Loading screen `bg-gradient-to-b from-[#020b18] via-[#05182e] to-[#021020]`
   - `App.tsx:3396`: `bg-gradient-to-tr from-blue-600/30 via-cyan-500/30 to-teal-400/20 blur-xl animate-pulse`
   - `App.tsx:3403`: `bg-gradient-to-b from-[#0e2540] to-[#071322] shadow-[0_8px_32px_rgba(6,182,212,0.3)]`
   - `App.tsx:3421`: `bg-gradient-to-r from-blue-600 via-cyan-400 to-teal-300`
   - `App.tsx:4975`: Login overlay `bg-gradient-to-br from-slate-950/70 via-blue-950/65 to-slate-900/75`
   - `App.tsx:5044`: Login CTA button `bg-gradient-to-r from-blue-600 to-indigo-600`
   - `App.tsx:5656`: Dashboard meter `bg-gradient-to-r from-blue-600 to-cyan-500`
   - `App.tsx:6874`: Reports meter `bg-gradient-to-r from-blue-500 to-indigo-500`
   - `App.tsx:6891`: Reports card `bg-gradient-to-r from-amber-500/5 via-amber-500/10 to-orange-500/5`
   - `App.tsx:8227`: Shifts recommendation drawer `bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950`
   - `App.tsx:8248`: Drawer button `bg-gradient-to-r from-blue-600 to-indigo-600`
   - `App.tsx:10836`: Modal bar `bg-gradient-to-r from-rose-500 via-red-600 to-rose-700`
   - `App.tsx:10962`: Quick Actions header `bg-gradient-to-r from-blue-50 to-indigo-50`
   - `App.tsx:11936`: Modal CTA `bg-gradient-to-r from-blue-600 to-indigo-600`
   - `App.tsx:12138`: Modal header `bg-gradient-to-r from-rose-50/80 via-white to-slate-50`
   - `CsvTemplateHubModal.tsx:141`: Modal header `bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900`
   - `LiveSimulationHUD.tsx:86`: Meter `bg-gradient-to-r from-[#1d3ec7] to-[#6d93fc]`
   - `PWAComponents.tsx:85, 98, 143`: PWA action banners `bg-gradient-to-r from-blue-600 to-sky-600`
   - `ShiftRadialPicker.tsx:148`: Buttons `bg-gradient-to-b ${shift.color}`

---

## 3. Typography Audit (Hierarchies, Sizes & Weights)

### 3.1 Global Typography Architecture

- **Primary Sans-Serif**: `"Poppins", "Sarabun", "Noto Sans Thai", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif` (Configured in `src/index.css:4` and `index.html:38`).
- **Monospace Font**: `"JetBrains Mono", "Fira Code", ui-monospace, SFMono-Regular, Menlo, Monaco, monospace` (For shift codes, numerical amounts, dates, employee IDs).

### 3.2 Font Weights Audit & Rule Enforcement

**Observed Weights Across Views**:
- `font-medium` (500)
- `font-semibold` (600)
- `font-bold` (700)
- `font-extrabold` (800)
- `font-black` (900)

**Violation**: Views currently utilize 4 to 5 distinct font weights simultaneously (e.g. `font-medium` for subtext, `font-bold` for labels, `font-extrabold` for badges, `font-black` for numbers/headings).

**Prescribed Standard (Maximum 3 Font Weights per View)**:
1. **Regular (`font-normal` / 400)**: Descriptive subtext, secondary table cell data, tooltips, footer metadata.
2. **Medium (`font-medium` / 500)**: Standard table cell data, body text, dropdown select options, button labels.
3. **Bold (`font-bold` / 600 or 700)**: Section headers, view titles, KPI numbers, uppercase tags, active tabs.
*(Rule: Permanently eliminate all instances of `font-extrabold` and `font-black`).*

### 3.3 Font Sizes Audit & Scale Consolidation

**Observed Font Sizes in Single Views**:
- `text-[8px]`, `text-[9px]`, `text-[10px]`, `text-[11px]`, `text-[11.5px]`, `text-xs` (12px), `text-sm` (14px), `text-base` (16px), `text-lg` (18px), `text-xl` (20px), `text-2xl` (24px), `text-3xl` (30px), `text-4xl` (36px).
- Many views mix 6–8 distinct font sizes.

**Prescribed Standard (Maximum 3 Font Sizes per View / Surface)**:
1. **Micro / Metadata (`text-xs` / 12px or `text-[11px]`)**: Table headers, badge labels, metadata, eyebrow tags, secondary captions.
2. **Body / Interface (`text-sm` / 14px)**: Table cell content, form inputs, button text, body paragraphs, dropdown options.
3. **Display / Headline (`text-base` / 16px or `text-lg` / 18px / `text-2xl` for KPI numbers)**: View titles, modal titles, primary KPI metric figures.

---

## 4. Spacing & 8pt Grid System Audit

### 4.1 Adherence to 8pt Grid (4px / 8px Tailwind Scale)

- **Compliant Values**:
  - `p-1` (4px), `p-2` (8px), `p-3` (12px), `p-4` (16px), `p-5` (20px), `p-6` (24px), `p-8` (32px).
  - `gap-1` (4px), `gap-2` (8px), `gap-3` (12px), `gap-4` (16px), `gap-6` (24px).
  - `space-y-2` (8px), `space-y-4` (16px), `space-y-6` (24px).

- **Non-Compliant / Irregular Spacing Identified**:
  - `p-2.5` (10px), `p-3.5` (14px), `p-7` (28px) in cards and headers.
  - `h-8.5` (34px) in `App.tsx:8013, 8024, 8029, 8033, 8043, 8123, 8133`.
  - `w-18 h-18` (72px) in `App.tsx:3403`.
  - Inconsistent row heights in tables (e.g. `py-3.5`, `py-2.5`, `py-1.5`, `h-[19px]`).

**Standardization Rule**:
- All component paddings: `p-2` (8px), `p-3` (12px), `p-4` (16px), `p-6` (24px).
- All button & input heights: `h-8` (32px) for compact, `h-9` (36px) or `h-10` (40px) for standard, min 44px on touch viewports via `touch-target`.
- Card padding: exactly `p-4` (mobile) / `p-5` or `p-6` (desktop).

---

## 5. Borders, Shadows & Container Elevations Audit

### 5.1 Heavy Box Shadows & Glows to Eliminate

| File & Line | Observed Shadow Class | Issue | Minimal Replacement |
|---|---|---|---|
| `App.tsx:374` | `shadow-xl` | Error boundary card | Remove shadow, use `border border-[#DCE4EA]` |
| `App.tsx:758` | `shadow-2xl` | Leave records modal | `shadow-lg border border-[#DCE4EA]` |
| `App.tsx:1444` | `shadow-2xl` | HR editor add employee modal | `shadow-lg border border-[#DCE4EA]` |
| `App.tsx:3384` | `shadow-[0_0_25px_rgba(6,182,212,0.25)]` | Sci-fi pill glow | Remove entirely |
| `App.tsx:3403` | `shadow-[0_8px_32px_rgba(6,182,212,0.3)]` | Boat logo glow | Remove entirely |
| `App.tsx:3421` | `shadow-[0_0_16px_rgba(6,182,212,0.8)]` | Progress bar glow | Remove entirely |
| `App.tsx:4982` | `shadow-2xl` | Login card container | `border border-[#DCE4EA] shadow-md` |
| `App.tsx:7674, 7811` | `lg:shadow-[4px_0_6px_-2px_rgba(0,0,0,0.08)]` | Employee sticky column double shadow | `border-r border-[#DCE4EA]` |
| `App.tsx:8227` | `shadow-xl` | Smart shift recommendation drawer | Remove shadow, use `border border-[#DCE4EA]` |
| `App.tsx:8789` | `shadow-[0_0_10px_rgba(6,182,212,0.8)]` | Shift cell focused glow | `ring-1 ring-[#2E90CB]` |
| `App.tsx:9010` | `shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]` | Shift table sticky footer shadow | `border-t border-[#DCE4EA]` |
| `App.tsx:9755, 9963, 10312, 10654, 10960, 11015, 11166, 11301, 11356, 11435, 11581, 11995, 12136, 12376` | `shadow-2xl` / `shadow-[0_20px_50px...]` | 14 Modals | `border border-[#DCE4EA] shadow-lg` |
| `CircadianTimelineModal.tsx:125` | `shadow-2xl` | Circadian Gantt Modal | `border border-[#DCE4EA] shadow-lg` |
| `CsvTemplateHubModal.tsx:138` | `shadow-2xl` | CSV Template Hub Modal | `border border-[#DCE4EA] shadow-lg` |
| `LiveSimulationHUD.tsx:29` | `shadow-[0_10px_40px_rgba(0,0,0,0.8)]` | Floating simulator HUD | `border border-[#DCE4EA] shadow-md` |
| `LiveSimulationHUD.tsx:83` | `shadow-[0_0_8px_rgba(244,63,94,0.8)]` | Budget bar glow | Remove glow |
| `ShiftRadialPicker.tsx:86` | `shadow-[0_12px_40px_rgba(0,0,0,0.8)]` | Radial picker popover | `border border-[#DCE4EA] shadow-md` |
| `PWAComponents.tsx:31` | `shadow-2xl` | PWA update toast | `border border-[#DCE4EA] shadow-md` |
| `Sidebar.tsx:46` | `shadow-xl` | Sidebar drawer | `border-r border-[#DCE4EA]` |

### 5.2 Excessive Border-Radius Standardizations

- **Current Chaos**: Mix of `rounded-3xl` (24px), `rounded-2xl` (16px), `rounded-xl` (12px), `rounded-lg` (8px), `rounded-full` (9999px) on standard cards, tables, headers, and buttons.
- **Radical Minimalist Standard**:
  - Main Cards, Panels & Modals: `rounded` (`4px` / `0.25rem`) or `rounded-md` (`6px`).
  - Buttons & Inputs: `rounded` (`4px` / `0.25rem`).
  - Tag Pills & Small Status Badges: `rounded-[2px]` or `rounded` (`3px`).
  - Strict Rule: Ban all `rounded-3xl` and `rounded-2xl` from cards, tables, dialogs, and filters.

---

## 6. Iconography & Visual Noise Audit

### 6.1 Emoji Elimination Verification
- Verified 0 unicode emoji literals remain in the UI markup. All previous emojis have been cleaned out.

### 6.2 Non-Lucide Icon System Identified
- **Google Material Symbols Outlined** is linked in `index.html:39` (`<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined..." rel="stylesheet" />`) and rendered in `App.tsx:7006`:
  ```tsx
  <span className="material-symbols-outlined text-lg">{dept.icon}</span>
  ```
  Where `dept.icon` holds string values `"precision_manufacturing"`, `"settings"`, `"electrical_services"` (`App.tsx:3063-3068`).
- **Action Required**: Remove the Google Material Symbols font link from `index.html`, remove string icon references from `types.ts` / `App.tsx`, and use Lucide React icons (`Building2`, `Wrench`, `Zap`, `Ship`, etc.) mapped through a clean icon dictionary.

### 6.3 Decorative Visual Noise to Eliminate
- **Pulsing / Pinging Animations**:
  - `animate-ping` in `App.tsx:5223` (OT request button), `App.tsx:7961` (Manager status), `App.tsx:8149` (Shift legend), `App.tsx:8231` (Sparkles), `CircadianTimelineModal.tsx:135`, `PWAComponents.tsx:119`, `ShiftRadialPicker.tsx:92`.
- **Decorative Sparklines**:
  - `App.tsx:5397-5404`: 6 mini-bar divs in Card 1.
  - `App.tsx:5426-5433`: 6 mini-bar divs in Card 2.
  - `App.tsx:5453-5460`: 6 mini-bar divs in Card 3.
- **Decorative Icons with Zero Semantic Utility**:
  - Redundant duplicate icons inside nested badge boxes across Shift toolbar (`Building2`, `Users`, `UserCheck`, `Calendar` in top toolbar).
  - Floating boat illustration with 3 layered gradient wave paths in Login loading screen (`App.tsx:3360-3380`).

---

## 7. Reusable Component Inventory & Unified Minimal Design Patterns

Below are the canonical, unified specifications for the core design system components:

### 7.1 Card Component (`.card-editorial`)
```tsx
// Pattern: Clean Flat Editorial Card
<div className="bg-white border border-[#DCE4EA] rounded p-4 sm:p-5">
  <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#DCE4EA]">
    <h3 className="text-xs font-bold uppercase tracking-wider text-[#0E3A66]">Card Title</h3>
    <span className="text-xs text-[#6A7B87]">Action / Badge</span>
  </div>
  <div>{/* Content */}</div>
</div>
```

### 7.2 KPI Grid & Tile Component (`.kpis`, `.kpi`)
```tsx
// Pattern: Connected Baseline KPI Grid
<div className="kpis grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
  <div className="kpi">
    <span className="lbl">ตัวชี้วัดหลัก</span>
    <span className="val">1,240 <span className="text-xs font-normal text-[#6A7B87]">ชม.</span></span>
    <span className="sub">เปรียบเทียบเดือนก่อนหน้า</span>
  </div>
  <div className="kpi g">
    <span className="lbl">ความปลอดภัย</span>
    <span className="val">100%</span>
    <span className="sub">ผ่านเกณฑ์กฎหมายแรงงาน</span>
  </div>
</div>
```

### 7.3 Table & Table Row Architecture
```tsx
// Pattern: Clean Hairline Data Table
<div className="overflow-x-auto border border-[#DCE4EA] rounded bg-white">
  <table className="w-full text-left text-xs border-collapse">
    <thead>
      <tr className="bg-[#F3F6F8] border-b border-[#DCE4EA] text-[#6A7B87] font-bold text-[11px] uppercase tracking-wider">
        <th className="px-3 py-2.5">รหัส</th>
        <th className="px-3 py-2.5">ชื่อ-นามสกุล</th>
        <th className="px-3 py-2.5">ตำแหน่ง</th>
        <th className="px-3 py-2.5 text-right">ชั่วโมง OT</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-[#DCE4EA] text-[#333B41]">
      <tr className="hover:bg-[#E8F3FA] transition-colors">
        <td className="px-3 py-2 font-mono font-medium text-[#0E3A66]">EMP-101</td>
        <td className="px-3 py-2 font-medium">สมชาย สายงาน</td>
        <td className="px-3 py-2 text-[#59656D]">ผู้ควบคุมงานขนถ่ายสินค้า</td>
        <td className="px-3 py-2 text-right font-mono font-bold">48.0</td>
      </tr>
    </tbody>
  </table>
</div>
```

### 7.4 Modal Dialog Pattern
```tsx
// Pattern: Crisp Minimal Modal Dialog
<div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0E3A66]/40 backdrop-blur-xs p-4 overflow-y-auto" role="dialog" aria-modal="true">
  <div className="bg-white rounded border border-[#DCE4EA] max-w-xl w-full shadow-lg overflow-hidden flex flex-col font-sans">
    {/* Header */}
    <div className="px-5 py-3.5 border-b border-[#DCE4EA] bg-white flex items-center justify-between">
      <h3 className="text-xs font-bold uppercase tracking-wider text-[#0E3A66]">หัวข้อหน้าต่าง</h3>
      <button type="button" onClick={onClose} className="p-1 rounded text-[#6A7B87] hover:text-[#0E3A66] hover:bg-[#F3F6F8] cursor-pointer">
        <X className="w-4 h-4" />
      </button>
    </div>
    {/* Body */}
    <div className="p-5 space-y-4 bg-white text-xs text-[#333B41]">
      {/* Essential inputs only */}
    </div>
    {/* Footer */}
    <div className="px-5 py-3 border-t border-[#DCE4EA] bg-[#F3F6F8] flex items-center justify-end gap-2">
      <button type="button" onClick={onClose} className="px-3 py-1.5 bg-white hover:bg-[#F3F6F8] text-[#59656D] border border-[#DCE4EA] rounded text-xs font-medium cursor-pointer">
        ยกเลิก
      </button>
      <button type="button" onClick={onConfirm} className="px-3 py-1.5 bg-[#0E3A66] hover:bg-[#17538F] text-white rounded text-xs font-bold cursor-pointer">
        บันทึกข้อมูล
      </button>
    </div>
  </div>
</div>
```

### 7.5 Button Hierarchy Patterns
```tsx
// Primary Action
<button className="px-3.5 py-1.5 bg-[#0E3A66] hover:bg-[#17538F] text-white text-xs font-bold rounded transition-colors cursor-pointer flex items-center gap-1.5">
  <Plus className="w-3.5 h-3.5" />
  <span>เพิ่มพนักงาน</span>
</button>

// Secondary / Neutral Action
<button className="px-3.5 py-1.5 bg-white hover:bg-[#F3F6F8] text-[#333B41] border border-[#DCE4EA] text-xs font-medium rounded transition-colors cursor-pointer flex items-center gap-1.5">
  <Download className="w-3.5 h-3.5 text-[#6A7B87]" />
  <span>ส่งออก CSV</span>
</button>

// Destructive Action
<button className="px-3.5 py-1.5 bg-white hover:bg-[#FBEAEA] text-[#B3352C] border border-[#DCE4EA] text-xs font-medium rounded transition-colors cursor-pointer flex items-center gap-1.5">
  <Trash2 className="w-3.5 h-3.5 text-[#B3352C]" />
  <span>ลบข้อมูล</span>
</button>
```

### 7.6 Tag & Badge Patterns (`.tag`)
```tsx
// Success / Active
<span className="tag t-g">ปฏิบัติงาน</span>

// Info / Blue
<span className="tag t-b">กะเช้า M8</span>

// Warning / Pending
<span className="tag t-y">รอตรวจสอบ</span>

// Danger / Alert
<span className="tag t-r">เกิน 36 ชม.</span>

// Neutral / Inactive
<span className="tag t-n">วันหยุด OFF</span>
```

### 7.7 Form Inputs & Filter Selects
```tsx
// Text Input
<input
  type="text"
  className="w-full px-3 py-1.5 bg-[#F3F6F8] focus:bg-white border border-[#DCE4EA] focus:border-[#2E90CB] rounded text-xs text-[#333B41] placeholder-[#6A7B87] focus:outline-none transition-colors"
  placeholder="ค้นหา..."
/>

// Filter Select
<select
  className="px-3 py-1.5 bg-white border border-[#DCE4EA] hover:border-[#B4C1C9] rounded text-xs text-[#333B41] font-medium focus:outline-none focus:border-[#2E90CB] cursor-pointer transition-colors"
>
  <option value="all">ทุกแผนก</option>
  <option value="inter2">INTER 2</option>
</select>
```

---

## 8. View-by-View Audit (11 Views + Login + Overlays)

### 8.1 Login Screen (`App.tsx:3340-3500 & 4960-5060`)
- **Issues Observed**:
  - Sci-fi gradient backdrop `bg-gradient-to-b from-[#020b18] via-[#05182e] to-[#021020]`, glowing cyan badges, layered SVG animated wave paths, animated boat illustration with drop shadows.
  - Form submit button uses saturated gradient `bg-gradient-to-r from-blue-600 to-indigo-600` with `rounded-2xl` and `shadow-lg shadow-blue-500/20`.
- **Target Minimal Design**: Clean, quiet maritime executive login. Pure white or warm bone container on calm Navy backdrop (`#0E3A66`), crisp typography, single Double A Terminal brand header, hairline bordered inputs, solid `#0E3A66` button with `rounded` (4px).

### 8.2 Dashboard View (`activeTab === 'dashboard'`, `App.tsx:5140-5766`)
- **Issues Observed**:
  - Verbose 3-sentence banner subtitle.
  - Redundant filter bar with 3 nested select boxes.
  - Top 3 stat cards have multi-color left borders (`sky-400`, `blue-600`, `slate-800`), 3 distinct icon box fills, and 18 decorative sparkline divs.
  - Grouped bar chart has 3 toggle pills with strike-through labels.
  - Department breakdown meters use cyan-blue gradients.
- **Target Minimal Design**: 
  - Top: Concise headline with period badge.
  - Connected 4-column `.kpis` grid replacing top cards and highlight card.
  - Clean monochrome/supporting blue bar chart without decorative sparklines.
  - Flat tabular department OT distribution with hairline bars.

### 8.3 Job Value View (`activeTab === 'job_value'`, `App.tsx:5767-6508`)
- **Issues Observed**:
  - Header card mixes 4 action buttons with diverse background colors (`bg-blue-50`, `bg-slate-100`, `bg-blue-600`, `bg-rose-50`).
  - Department summary cards use `rounded-2xl`, multiple font weights (`font-extrabold`, `font-bold`, `font-sans`, `font-mono`).
  - Financial breakdown chart has redundant filter controls.
- **Target Minimal Design**:
  - Standard `.card-editorial` container with standardized secondary action buttons.
  - Connected `.kpis` for revenue, cost, profit, coverage.
  - Clean data table with sticky left identity column, right-aligned monetary figures, hairline dividers.

### 8.4 Reports View (`activeTab === 'reports'`, `App.tsx:6509-7082`)
- **Issues Observed**:
  - Non-Lucide Google Material Symbols (`material-symbols-outlined`) in department sidebar (`App.tsx:7006`).
  - Complex dual-axis chart with cluttered legend pills.
  - Summary card with gradient background `bg-gradient-to-r from-amber-500/5...`.
- **Target Minimal Design**:
  - Replace Material Symbols with clean Lucide React icons.
  - Unified report table with clean progress indicators using `#0E3A66` and `#2E90CB`.
  - Streamlined PDF export action.

### 8.5 Employees View (`activeTab === 'employees'`, `App.tsx:7083-7917`)
- **Issues Observed**:
  - Stacked area SVG chart has high visual complexity and heavy label chrome.
  - Main table uses sticky columns with heavy drop shadow (`lg:shadow-[4px_0_6px_-2px_rgba(0,0,0,0.08)]`).
  - Filter bar has multiple overflowing horizontal tab bars.
- **Target Minimal Design**:
  - Clean headcount telemetry bar.
  - Consolidated filter bar (Search, Department, Role, Status).
  - High-density data table with frozen ID/Name columns separated by `border-r border-[#DCE4EA]`.

### 8.6 Shifts & Shift Matrix Grid (`activeTab === 'shifts'`, `App.tsx:7918-9212`)
- **Issues Observed**:
  - Top toolbar has 4 large nested metric cards with 4 different icon background colors and pulsing green dots.
  - Shift legend displays rainbow color palette (`#dce6f1`, `#fff2cc`, `#fce4d6`, `#ddebf7`, `#1f4e79`, `#ff0000`, `#aeaaaa`, `#00ffff`).
  - AI Assistant drawer uses dark multi-stop gradient `from-slate-900 via-slate-800 to-indigo-950`.
  - Shift matrix cell focus and drag targets use neon cyan rings and pulsing glows (`ring-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.8)]`).
- **Target Minimal Design**:
  - Consolidated single-row toolbar: Department select, Month picker, View toggle (Plan / Actual / Both), Action buttons.
  - Clean shift color mapping conforming to `#0E3A66` (M16/N16), `#FCF3DE` / `#F3D98F` (M12/N12), `#E8F3FA` / `#9FCEE8` (M8/A8/N8), `#E8F6F0` / `#A5DCC5` (D), `#17538F` (OND), white (OFF).
  - Clean hairline matrix grid with crisp 1px borders, subtle cell focus outline (`ring-1 ring-[#2E90CB]`), zero pulsing animations.

### 8.7 HR Direct Editor View (`activeTab === 'hr-editor'`, `App.tsx:1077-1573 & 9213-9225`)
- **Issues Observed**:
  - Saturated action buttons (`bg-blue-600`, `bg-blue-50 text-[#1d3ec7]`).
  - Inconsistent table row padding and inputs.
- **Target Minimal Design**: Unified tabular editor with clean inline inputs (`bg-[#F3F6F8] focus:bg-white border border-[#DCE4EA]`).

### 8.8 OT Records View (`activeTab === 'ot-records'`, `App.tsx:844-1010 & 9226-9235`)
- **Issues Observed**:
  - Redundant stat badges with `bg-blue-50 text-[#1d3ec7]`.
  - Heavy table borders.
- **Target Minimal Design**: Clean historical table with search, month filter, and `.tag` badges.

### 8.9 Leave Records View (`activeTab === 'leave-records'`, `App.tsx:431-843 & 9236-9245`)
- **Issues Observed**:
  - Multi-colored leave type badges (`#0b1a3a`, `#1d3ec7`, `#6d93fc`, `#a9cdfc`).
  - Heavy 3xl add leave modal.
- **Target Minimal Design**: Standard `.tag` styling (`.t-b`, `.t-y`, `.t-g`, `.t-n`), clean 4px rounded modal.

### 8.10 Settings View (`activeTab === 'settings'`, `App.tsx:9246-9485`)
- **Issues Observed**:
  - Redundant duplication: The entire "User & Permissions Management" table is embedded here AND exists as a standalone view in `admin-permissions`.
  - Verbose configuration helper text and `rounded-3xl` cards.
- **Target Minimal Design**: Streamlined parameters grid (Thai labor laws, safety limits, notifications), remove duplicated user management table from settings.

### 8.11 Admin Permissions View (`activeTab === 'admin-permissions'`, `App.tsx:9486-9618`)
- **Issues Observed**:
  - `rounded-3xl` card, `bg-blue-50` and `bg-amber-50` action buttons.
- **Target Minimal Design**: Dedicated user permission matrix table with standard select dropdowns and hairline borders.

### 8.12 Profile View (`activeTab === 'profile'`, `App.tsx:9619-9750`)
- **Issues Observed**:
  - `rounded-3xl` card, `shadow-sm`, `bg-blue-50` icon container.
- **Target Minimal Design**: Clean 2-column layout: left minimal user identity summary, right streamlined form inputs with hairline borders.

### 8.13 Standalone Modals & Auxiliary Components
1. **`CircadianTimelineModal.tsx`**:
   - Strip dark sci-fi theme (`bg-slate-950`, `border-cyan-500/30`, `animate-pulse`, `animate-ping`).
   - Re-architect into clean executive white modal with `#0E3A66` headers and hairline 24-column grid.
2. **`CsvTemplateHubModal.tsx`**:
   - Strip gradient header `bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900`.
   - Standardize template cards with hairline borders, remove rainbow badges (`bg-indigo-50`, `bg-purple-50`, `bg-emerald-50`, `bg-amber-50`).
3. **`LiveSimulationHUD.tsx`**:
   - Strip dark `bg-[#0b1a3a]/95`, `shadow-[0_10px_40px...]`, glowing rose shadow `shadow-[0_0_8px_rgba(244,63,94,0.8)]`.
   - Convert to clean bottom docked telemetry strip: `bg-white border border-[#DCE4EA] shadow-md rounded p-3 text-[#333B41]`.
4. **`PremiumShiftTimePickerModal.tsx`**:
   - Strip `#0b1a3a`, `#1d3ec7`, `#6d93fc`, `#a9cdfc` hex codes.
   - Use `#0E3A66` for active date selection, `#DCE4EA` for calendar grid borders, clean stepper buttons.
5. **`ShiftRadialPicker.tsx`**:
   - Strip `bg-[#0b1a3a]/95`, `bg-gradient-to-b`, `animate-ping`.
   - Clean popover container: `bg-white border border-[#DCE4EA] shadow-md rounded p-3 text-[#333B41]`.
6. **`PWAComponents.tsx`**:
   - Strip gradients `bg-gradient-to-r from-blue-600 to-sky-600`, glowing borders `border-sky-500/40`, `animate-bounce`, `animate-spin`.
   - Clean minimal install button and offline status badge.
7. **`Sidebar.tsx`**:
   - Currently unused in `App.tsx` (navigation is handled by `Navbar.tsx`'s `.folder-tabs`).
   - Unused dark sidebar code should either be aligned with the white/navy palette or cleaned up to avoid confusion.

---

## 9. Actionable Recommendations for Implementation Agents

1. **Global CSS & Tokens (`src/index.css` & `index.html`)**:
   - Verify all CSS variables strictly point to the authorized palette.
   - Remove Google Material Symbols `<link>` from `index.html`.
   - Replace `<meta name="theme-color" content="#0f172a" />` in `index.html` with `#0E3A66`.
   - Remove `bg-slate-50 text-slate-900` from `index.html:41` `<body>`.

2. **Source Code Color Replacement**:
   - Replace all `#0b1a3a` -> `#0E3A66` (or `#333B41`).
   - Replace all `#1d3ec7` -> `#0E3A66` (CTA) / `#17538F` (hover) / `#2E90CB` (focus/active).
   - Replace all `#6d93fc` -> `#2E90CB` / `#9FCEE8`.
   - Replace all `#a9cdfc` -> `#9FCEE8` / `#E8F3FA`.
   - Replace all `bg-slate-900`, `bg-slate-950` in modals with `bg-white` and `bg-[#0E3A66]/40` backdrops.

3. **Border, Shadow & Radius Replacement**:
   - Replace all `shadow-2xl`, `shadow-xl`, `shadow-lg`, and custom shadow brackets with flat hairline borders `border border-[#DCE4EA]`.
   - Replace all `rounded-3xl` and `rounded-2xl` with `rounded` (`4px`).
   - Replace all `border-l-4` color strips on cards with unified hairline borders.

4. **Typography & Animation Cleanup**:
   - Replace all `font-extrabold` and `font-black` with `font-bold` (700) or `font-semibold` (600).
   - Eliminate `animate-ping`, `animate-pulse`, `animate-bounce` on static UI elements.
   - Eliminate 18 decorative sparkline divs in Dashboard.
   - Remove Google Material Symbols `span` in `App.tsx:7006` and use Lucide icons.

5. **Component Re-architecting**:
   - Convert `CircadianTimelineModal.tsx` from dark cyan/purple theme to calm editorial white/navy theme.
   - Convert `LiveSimulationHUD.tsx` and `ShiftRadialPicker.tsx` to white/navy theme.
   - Convert `CsvTemplateHubModal.tsx` to flat editorial theme.
   - Deduplicate User Management table between Settings and Admin Permissions.
