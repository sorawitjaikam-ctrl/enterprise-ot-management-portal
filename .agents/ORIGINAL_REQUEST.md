# Original User Request

## 2026-08-24T07:12:57Z

Overhaul the Enterprise OT Management Portal into an ultra-minimalist, executive industrial design adhering strictly to the provided 4-tone monochromatic blue palette, eliminate 100% of emojis across the entire application in favor of clean Lucide SVG icons and modern typography, and conduct a full end-to-end functionality audit and fix across all portal features.

Working directory: C:\Users\ssrwj\Documents\antigravity\mysterious-einstein
Integrity mode: development

## Requirements

### R1. Strict Minimalist Palette & Aesthetic Overhaul
- Transform the entire application styling (Navbar, Dashboard, Shift Matrix, Roster, Modals, Forms, and Badges) to strictly conform to the 4-tone industrial blue colorway:
  - Deep Navy Blue (`#0b1a3a` / primary dark & headers)
  - Royal Cobalt Blue (`#1d3ec7` / active accents & primary actions)
  - Soft Cornflower Blue (`#6d93fc` / secondary accents & highlights)
  - Light Ice Blue (`#a9cdfc` / subtle backgrounds, borders & pill badges)
  - Complemented by clean crisp white (`#ffffff`) and neutral minimalist grays (`#f8fafc` / `#e2e8f0`).
- Implement an ultra-minimalist design system: high typographic hierarchy, clean hairline borders, generous spacing, zero decorative clutter, and crisp focus states.

### R2. Complete Emoji Elimination Across 100% of Views & Components
- Eliminate all emojis (such as ⚡, 🏖️, 👤, 🟢, 🔴, 🏷️, 🌙, ⚠️, 🔄, ✅, 💡, 📊, 🚢, etc.) from all UI strings, tooltips, buttons, modal headers, toast notifications, badges, and export tables.
- Replace any necessary visual cues with crisp, minimalist vector icons (Lucide React) or clean text labels.

### R3. Comprehensive Functionality Audit & Flawless Execution
- Audit and verify all core portal workflows and ensure zero regressions:
  - **24H Shift & Time Scheduler**: Dynamic calculation across `M1..M24`, `A1..A24`, `N1..N24`, `D`, `OND`, `OFF`, full 24h shifts (08:00 to 08:00), cross-day overnight shifts (e.g. 20:00 to 08:00), clean reset, and database persistence.
  - **Shift Matrix Grid**: Smooth click interaction to open 24h scheduler, tooltip preview on hover, sticky left employee identity column, sticky day headers, Plan/Actual/Both toggle, and Department/Role/Month filters.
  - **Compliance & Notifications**: Labor law compliance auditing, bell notification dropdown in Navbar, and overtime threshold monitors.
  - **Vessel & Crane Schedule Integration**: Plan vs. Actual vessel scheduling timeline.
  - **Executive Analytics & Reports**: Department utilization, OT cost charts, and summary KPI metrics.
  - **Data Export & Import**: CSV template generation and shift exports.

### R4. Automated Verification & Quality Assurance
- Run complete test suite and verification commands.
- Verify `npm run build` compiles with 0 TypeScript and 0 Vite bundle errors.

## Acceptance Criteria

### Minimalist Design & Palette
- [ ] Application strictly adheres to the 4-tone blue palette with zero mismatched random rainbow colors.
- [ ] Interface exhibits a clean, distraction-free, professional executive aesthetic.

### Zero-Emoji Enforcement
- [ ] 0 emojis exist anywhere across the frontend UI, tooltips, modals, notifications, and navigation items.
- [ ] Clean Lucide vector icons or subtle typography labels are used wherever iconography is required.

### Functional Integrity
- [ ] All shift calculations (1..24h, overnight, 24h full shifts, day shifts, off days) work seamlessly.
- [ ] Shift matrix, roster, vessel schedule, reports, and modals open and operate with zero lag or screen flicker.
- [ ] `npm run build` compiles cleanly with zero errors.

## 2026-08-31T17:53:55+07:00

Comprehensive full-stack audit, UI/UX polish, calculation accuracy verification, performance optimization, and mobile/PWA enhancement for the Enterprise OT Management Portal.

Working directory: C:\Users\ssrwj\Documents\antigravity\mysterious-einstein
Integrity mode: development

## Requirements

### R1. Full Calm Editorial Visual Integrity & Responsive Polish
- Ensure 100% adherence to the calm editorial maritime design system (#0E3A66, #17538F, #2E90CB, #DCE4EA, #F3F6F8, #333B41) across all 11 views, modals, drawers, and form dialogs.
- Eliminate all leftover conflicting styles, neon glows, emoji icons, or overlapping typography.
- Perfect responsive adaptation across mobile (375px–430px), tablet (768px–1024px), and desktop (1440px+), including frozen sticky columns on small touch screens.

### R2. High-Performance Virtualization & Grid Responsiveness
- Optimize table rendering for large rosters (100+ employees x 31 days) with smooth 60fps scrolling.
- Optimize client-side calculation caching and state updates to ensure zero lag during rapid cell clicks and drag operations.

### R3. Calculation Accuracy & Labor Law Safety Compliance
- Validate all shift computation paths: standard 8h (M8/A8/N8), 12h OT (M12/A12/N12), 16h/24h shifts, overnight split shifts, and holiday multipliers (1.5x / 3.0x / 1.0x).
- Audit weekly safety limits (36h OT threshold and 6-consecutive-workday fatigue alerts).

### R4. Export/Import, PWA Offline Shell & Build Integrity
- Ensure CSV/Excel data export and template uploads operate reliably with robust validation feedback.
- Verify Service Worker caching and PWA installability on field devices.
- `npm run build` compiles cleanly with zero TypeScript errors.

## Acceptance Criteria

### Visual & UX Standards
- [ ] 100% of screens, headers, tables, charts, badges, and modals adhere strictly to the calm editorial style.
- [ ] Zero horizontal layout clipping or text overlap across mobile, tablet, and desktop viewports.

### Functionality & Precision
- [ ] All shift calculations, salary formulas, and diff metrics calculate accurately to 2 decimal places.
- [ ] Shift time picker modal, quick actions, vessel schedule, and roster operations function flawlessly.

### Performance & Build Verification
- [ ] `npm run build` passes with 0 errors.
- [ ] Service worker registers and caches app shell assets properly.
