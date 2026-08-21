# Project: Enterprise OT Management Portal Mobile & Tablet Responsive UI/UX & PWA

## Architecture
- **Frontend Stack**: React 19 (`react` 19.0.1, `react-dom` 19.0.1), TypeScript 5.8.2, Vite 6.2.3, `@tailwindcss/vite` 4.1.14, Tailwind CSS v4, `lucide-react`, `motion`.
- **Backend / API**: Node.js Express server (`server.ts` bundled with esbuild into `dist/server.cjs`) + Cloudflare Pages D1 API functions (`functions/api/[[path]].ts`).
- **State & Data Flow**: Central state in `App.tsx` + `localStorage` fallback + REST synchronization.
- **PWA & Offline Architecture**: `manifest.webmanifest` / `manifest.json`, Service Worker `sw.js` with Cache-First strategy for static assets and Network-First for API data with offline fallback.
- **Responsive Breakpoints**:
  - Mobile: 375px–430px (e.g. iPhone SE, iPhone 14/15/16 Pro, Pixel, Galaxy)
  - Tablet: 768px–1024px (e.g. iPad Mini, iPad Air/Pro portrait & landscape)
  - Desktop: >=1024px / 1280px / 1440px+ (Standard workstation display)
- **Desktop Invariants**:
  - Shift Scheduler right-hand summary block strictly preserved at 368px (`w-[368px]`: 200px breakdown + 96px Cost in Baht + 72px Cost % of Salary).
  - Shift calculation engine (`getEmpMonthlyOtPayBreakdown`, hourly rate `salary/240 * 1.5`, Plan vs Actual diff, budget utilization vs 150k THB).
  - 6 CSV Export routines (Shift CSV, Employee CSV, Job Value CSV, Report CSV, OT Record CSV, CsvTemplateHubModal downloads).

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Web App Manifest | Standards-compliant manifest with name, short_name, icons, theme_color, background_color, display standalone | M1 | ORIGINAL_REQUEST §R3 |
| 2 | PWA Viewport & Meta Tags | Viewport configuration, Apple touch icon, apple-mobile-web-app-capable, theme-color in index.html | M1 | ORIGINAL_REQUEST §R3 |
| 3 | Service Worker Registration | Robust SW registration lifecycle in main.tsx / App.tsx with install/update handlers | M1 | ORIGINAL_REQUEST §R3 |
| 4 | Offline Shell Cache | Cache-First strategy for HTML, JS, CSS, images, and fonts ensuring instant offline launch | M1 | ORIGINAL_REQUEST §R3 |
| 5 | PWA Install Banner / Action | In-app "Add to Home Screen" prompt trigger and install status handling | M1 | ORIGINAL_REQUEST §R3 |
| 6 | Responsive Top Header | Responsive header bar adapting between desktop navigation and mobile compact bar | M2 | ORIGINAL_REQUEST §R1 |
| 7 | Mobile Navigation Drawer / Menu | Hamburger menu / collapsible drawer for mobile viewports to switch between 11 functional views | M2 | ORIGINAL_REQUEST §R1 |
| 8 | Fluid Category Nav Pills | Horizontal touch-scrollable category tabs with active indicators | M2 | ORIGINAL_REQUEST §R1 |
| 9 | Responsive Main Container Spacing | Dynamic margin-top and padding (`mt-16 sm:mt-20 lg:mt-28`, `p-2 sm:p-4 lg:p-8`) preventing navbar overlap | M2 | ORIGINAL_REQUEST §R1 |
| 10 | Metrics Cards Responsive Grid | Dynamic re-stacking from 1 column (mobile) to 2 columns (tablet) to 4 columns (desktop) without clipping | M2 | ORIGINAL_REQUEST §R1 |
| 11 | Dashboard & Analytics Responsive Views | Chart containers, summary widgets, and vessel schedules fluidly resizing across viewports | M2 | ORIGINAL_REQUEST §R1 |
| 12 | Shift Matrix Sticky Left Worker Column | Pinned worker ID/Name column with responsive width (`w-32 sm:w-44 lg:w-56`) remaining readable | M3 | ORIGINAL_REQUEST §R2 |
| 13 | Shift Matrix Sticky Header & Days Panning | Pinned days header and smooth horizontal touch panning across all monthly calendar days | M3 | ORIGINAL_REQUEST §R2 |
| 14 | Desktop 368px Summary Block Alignment | Strict preservation of 368px summary widget layout and calculations on desktop viewports | M3 | ORIGINAL_REQUEST Acceptance Criteria |
| 15 | Roster Table Adaptive Frozen Columns | Responsive sticky columns: 1 pinned col on mobile (<640px), 2 on tablet, 5 on desktop (fixing 700px freeze bug) | M3 | ORIGINAL_REQUEST §R2 |
| 16 | Roster Table Horizontal Panning | Smooth horizontal panning across all employee profile fields without layout distortion | M3 | ORIGINAL_REQUEST §R2 |
| 17 | Core OT Calculation Preservation | Weekday (1.5x), Holiday (1.0x), Holiday OT (3.0x), OND (8h), and hourly rate `salary/240 * 1.5` intact | M3 | ORIGINAL_REQUEST Acceptance Criteria |
| 18 | 6 CSV Export Routines Integrity | All 6 CSV export handlers remain 100% functional and payroll-accurate | M3 | ORIGINAL_REQUEST Acceptance Criteria |
| 19 | Touch Ergonomics (>=44x44px Targets) | All interactive buttons, action icons, tab switches, and filters satisfy minimum 44x44px tap targets | M4 | ORIGINAL_REQUEST §R4 |
| 20 | Touch Shift Cell Editor / Bottom Sheet | Interactive shift code picker popover transformed into touch-friendly modal / bottom sheet on mobile/tablet | M4 | ORIGINAL_REQUEST §R4 |
| 21 | Responsive Modals & Dialogues (19 Modals) | All 19 modals adapt to viewport (full-screen / bottom sheet on mobile, rounded modal on desktop, easy dismiss) | M4 | ORIGINAL_REQUEST §R4 |
| 22 | Form Controls & Date Pickers Touch Optimization | Touch-friendly input fields, date selectors, department dropdowns, and search bars | M4 | ORIGINAL_REQUEST §R4 |
| 23 | TypeScript Diagnostic Cleanliness | Resolve ambient type mismatches to ensure `npm run lint` and `npm run build` pass with 0 errors | M4 | ORIGINAL_REQUEST Acceptance Criteria |
| 24 | E2E Tier 1: Unit & Calculation Test Suite | Vitest tests for OT calculations, budget formulas, Plan vs Actual diff, and CSV generators | M5 | E2E Testing Track |
| 25 | E2E Tier 2: Responsive & Sticky Columns Suite | Component & DOM tests verifying 375px/768px/1024px responsive layouts and pinned table column styles | M5 | E2E Testing Track |
| 26 | E2E Tier 3: PWA Manifest & Service Worker Suite | Automated verification of manifest validity, SW lifecycle, and offline asset caching | M5 | E2E Testing Track |
| 27 | E2E Tier 4: Real-World Workflows & Regression Suite | End-to-end user workflows on mobile/tablet/desktop, 368px desktop alignment, and CSV export regressions | M5 | E2E Testing Track |
| 28 | E2E Tier 5: Adversarial Hardening | Challenger edge case stress testing for rapid touch gestures, offline toggling, and boundary viewport sizes | M5 | Phase 2 Hardening |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | PWA Infrastructure & Offline App Shell | Manifest, Service Worker, cache strategy, icons, meta tags | none | DONE |
| M2 | Responsive App Shell, Navigation & Layout Adaptation | Responsive Navbar, Mobile Drawer, Layout spacing, Metrics cards re-stacking | none | PLANNED |
| M3 | Touch Table Panning & Sticky Columns (Shift Matrix & Roster) | Pinned columns, touch scroll, adaptive Roster columns, desktop 368px & CSV integrity | M2 | PLANNED |
| M4 | Touch Ergonomics, Interactive Controls & Modals | >=44px tap targets, Shift picker bottom sheet, 19 responsive modals, TS cleanup | M2, M3 | PLANNED |
| M5 | Final Milestone: E2E Verification & Adversarial Hardening | 100% pass on E2E Test Suite (Tiers 1-4) + Tier 5 Challenger Adversarial Hardening | M1, M2, M3, M4, E2E Track | PLANNED |

## Interface Contracts
### PWA Service Worker ↔ Client Application
- Service Worker file: `/sw.js` registered at root scope `/`.
- Cache Name: `ot-portal-v1-shell`.
- Manifest link: `<link rel="manifest" href="/manifest.webmanifest" />` in `index.html`.
- Theme Color: `#0f172a` (slate-900 matching enterprise dark palette).

### Responsive Viewport Breakpoints Contract
- Mobile (< 640px, `sm`): Single column cards, compact sticky columns (1 col on roster, w-32 on shift matrix), full-width / bottom sheet modals.
- Tablet (640px - 1023px, `md`/`lg`): Two column cards, 2 pinned cols on roster, w-44 on shift matrix, centered dialog modals.
- Desktop (>= 1024px / 1280px, `xl`): Standard 4-column cards, full 5-column sticky roster, w-56 shift matrix, 368px summary widgets.

### Calculation Engine & Desktop 368px Contract
- Shift Matrix summary block: Exactly 368px width (`w-[368px]`) composed of 200px monthly breakdown + 96px Cost (Baht) + 72px Cost (% of Salary).
- `getEmpMonthlyOtPayBreakdown(emp, shifts, year, month)` must return exact mathematical values matching existing payroll rules.
- All CSV download routines must produce valid RFC 4180 CSV files with identical headers and data rows.

## Code Layout
- `src/App.tsx`: Main portal application, view router, modals, shift matrix, roster table, calculations.
- `src/components/Navbar.tsx`: Top header navigation and mobile navigation drawer.
- `src/components/Sidebar.tsx`: Side navigation menu.
- `src/components/CsvTemplateHubModal.tsx`: CSV templates download hub.
- `src/sw.ts` / `public/sw.js`: Service worker implementation and caching rules.
- `public/manifest.webmanifest` / `public/manifest.json`: Web App Manifest.
- `public/icons/`: PWA icon assets (192x192, 512x512, apple-touch-icon).
- `src/index.css`: Tailwind CSS v4 directives and custom touch/scrollbar utility classes.
- `tests/`: E2E test suites (Tier 1 unit, Tier 2 responsive, Tier 3 PWA, Tier 4 workflows).
