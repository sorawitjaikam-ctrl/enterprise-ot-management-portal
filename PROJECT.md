# Project: Enterprise OT Management Portal — Mobile/Tablet Responsive, PWA & E2E Verification

## Architecture
- **Application Shell**: React 19 + TypeScript + Vite + Tailwind CSS v4.
- **Navigation & Layout**: Dynamic multi-tier header (`Navbar.tsx`), mobile sliding drawer with 11 functional views, responsive main container (`mt-16 sm:mt-20 lg:mt-28`, `p-3 sm:p-4 lg:p-8`).
- **PWA Infrastructure**: W3C Web App Manifest (`manifest.webmanifest`, `manifest.json`), 10 binary icon assets, 4-tier Service Worker (`sw.js`: shell, runtime, fonts, data), Client lifecycle manager (`registerServiceWorker.ts`), React hook (`usePWA.ts`), PWA UI components (`PWAComponents.tsx`).
- **Data Tables & Shift Scheduling**: Shift Matrix with sticky pinned worker column (`w-56`, `z-10`), `touch-pan-x` horizontal panning, dynamic day cell sizing, strict 368px desktop summary block (`56px + 64px + 80px + 96px + 72px`). Employee Roster with adaptive responsive sticky columns (1 col mobile, 2 col tablet, 5 col desktop).
- **Core Calculation Engine**: OT hours extractor (`getShiftOtHours`), Thai payroll breakdown (`getEmpMonthlyOtPayBreakdown`), Plan vs Actual diff engine (`isPlanActualMismatch`), Department 150k THB budget ceiling.
- **Data Export & Hub**: 6 CSV export routines with UTF-8 BOM `\ufeff` and RFC 4180 escaping, CSV Template Hub modal with 5 templates.
- **Test Infrastructure**: Vitest test runner, 4-tier test architecture (Tiers 1–4) + Tier 5 adversarial stress harnesses (176/176 tests passing).

---

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Web App Manifest & Meta Tags | W3C compliant manifest (standalone mode, theme #0f172a, shortcuts), viewport-fit=cover, iOS & Win tiles | M1 | ORIGINAL_REQUEST §R3 |
| 2 | PWA Icon Suite | 10 binary icons (192, 512, maskable, apple-touch, SVG, favicons) | M1 | ORIGINAL_REQUEST §R3 |
| 3 | Service Worker & Offline Caching | 4 cache tiers (shell, runtime, fonts, data), pre-caching, SPA offline navigation, 503 API fallback, cache invalidation | M1 | ORIGINAL_REQUEST §R3 |
| 4 | Client SW Lifecycle & Update UX | Deferred registration, Vite HMR safety, controllerchange auto-reload, `usePWA` hook, install button, offline badge, update toast | M1 | ORIGINAL_REQUEST §R3 |
| 5 | Responsive Shell & Spacing | Dynamic navbar and main spacing (`mt-16 sm:mt-20 lg:mt-28`, `p-3 sm:p-4 lg:p-8`) across 375px–1024px+ | M2 | ORIGINAL_REQUEST §R1 |
| 6 | Mobile Navigation Drawer | Sliding drawer with 11 functional views, scroll lock, Escape dismissal, >=44px tap targets | M2 | ORIGINAL_REQUEST §R1 |
| 7 | Responsive Metric Grids & Views | Grid breakpoints (1/2/3/4 cols) across Dashboard, Reports, Job Value, and Roster summary cards | M2 | ORIGINAL_REQUEST §R1 |
| 8 | Modals Viewport Bounds & Touch | 19 application dialogs with max-h constraints (85–92vh), backdrop dismiss, internal scrolling | M2 | ORIGINAL_REQUEST §R1 |
| 9 | Shift Matrix Sticky Columns & Panning | Worker column `sticky left-0` (`w-56`, `z-10`), `touch-pan-x` scrolling, dynamic cell sizing (35px, 48px, 56px) | M3 | ORIGINAL_REQUEST §R2 |
| 10 | Employee Roster Adaptive Columns | Adaptive sticky frozen columns (1 col mobile, 2 col tablet, 5 col desktop) eliminating 700px mobile freeze bug | M3 | ORIGINAL_REQUEST §R2 |
| 11 | Desktop 368px Summary Invariant | Strict 368px summary block geometry (`56px + 64px + 80px + 96px + 72px`) preserved on desktop | M3 | ORIGINAL_REQUEST §R2, Acceptance Criteria |
| 12 | Shift OT Hours Calculation | `getShiftOtHours` logic (M8->0, M12->4, M16->8, OND->8, OFF/O/D->0, dynamic regex) | M4 | ORIGINAL_REQUEST §R4 |
| 13 | Monthly OT Payroll Calculation | `getEmpMonthlyOtPayBreakdown` (hourly rate `salary/240`, 1.5x weekday, 3.0x holiday OT, 1.0x holiday work) | M4 | ORIGINAL_REQUEST §R4 |
| 14 | Plan vs Actual Diff Engine | `isPlanActualMismatch` active shift delta detection and color-coded visual cues | M4 | ORIGINAL_REQUEST §R4 |
| 15 | Department 150k Budget Engine | 150k THB ceiling per department, warning thresholds (>95%), utilization calculation | M4 | ORIGINAL_REQUEST §R4 |
| 16 | 6 CSV Export Routines & Template Hub | 6 export routines + CsvTemplateHubModal with UTF-8 BOM `\ufeff` and RFC 4180 compliance | M4 | ORIGINAL_REQUEST §R4 |
| 17 | E2E 4-Tier Test Suite & Pass (100%) | Tiers 1–4 test suite execution, fixing test nits, 100% pass across all test suites (176/176 tests pass) | M5 | ORIGINAL_REQUEST §R4 |
| 18 | Adversarial Coverage Hardening (Tier 5) | White-box challenger stress tests, edge cases, zero regressions, clean audit verification | M5 | Dual-Track Architecture |

---

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | PWA & Service Worker Hardening | Manifest, 10 icon assets, sw.js 4-cache architecture, registerServiceWorker, usePWA, PWA UI components | none | DONE |
| M2 | Responsive UI/UX Layouts & Navigation | App shell spacing, mobile hamburger drawer (11 views), search dropdown, metric card grids, 19 modals touch/scroll bounds | none | DONE |
| M3 | Touch Tables & Adaptive Frozen Columns | Shift matrix sticky worker column (`w-56`), touch panning, adaptive roster frozen columns, desktop 368px invariant | M2 | DONE |
| M4 | Core Calculations, CSVs & Desktop Invariants | OT formulas (1.5x/3.0x/1.0x, salary/240), Plan/Actual diffs, 150k budget limit, 6 UTF-8 BOM CSV exports | none | DONE |
| M5 | E2E Test Suite Pass & Adversarial Hardening | Phase 1: 100% pass across Tiers 1–4 tests. Phase 2: Tier 5 adversarial stress verification and forensic integrity audit | M1, M2, M3, M4 | DONE |

---

## Interface Contracts

### Shift Scheduler & Payroll Engine (`src/App.tsx`)
- `getShiftOtHours(shift: string): number`
  - Input: shift code string (e.g., `"M12"`, `"N16"`, `"OND"`, `"OFF"`).
  - Output: integer OT hours (e.g., 4, 8, 8, 0).
- `getEmpMonthlyOtPayBreakdown(emp: Employee, shifts: Record<string, string>, year: number, month: number, customSalary?: number): OtPayBreakdown`
  - Returns: `{ normalOt: number, holidayOt: number, holidayWorkDays: number, totalOtHours: number, salary: number, hourlyRate: number, totalOtPay: number, otPctSalary: string }`
  - Hourly rate formula: `salary > 0 ? salary / 240 : 62.5`
- `isPlanActualMismatch(planShift: string, actualShift: string): boolean`
  - Returns true if `planShift` is an active scheduled shift (`!== ""` and `!== "O"` and `!== "OFF"`) and does not equal `actualShift`.

### PWA Controller & Hooks (`src/pwa/registerServiceWorker.ts` & `src/hooks/usePWA.ts`)
- `registerServiceWorker(options?: { enableInDev?: boolean }): Promise<ServiceWorkerRegistration | null>`
- `skipWaitingAndReload(registration?: ServiceWorkerRegistration | null): void`
- `usePWA(): { isInstallable: boolean, isInstalled: boolean, isOffline: boolean, updateAvailable: boolean, promptInstall: () => Promise<void>, applyUpdate: () => void }`

---

## Code Layout
- `public/manifest.webmanifest`, `public/manifest.json`: Web App Manifest files.
- `public/icons/*`: PWA icon assets (192, 512, maskable, apple-touch, SVG, favicon).
- `public/sw.js`: Service worker caching implementation.
- `src/pwa/registerServiceWorker.ts`: Client service worker lifecycle manager.
- `src/hooks/usePWA.ts`: React PWA state and install/update hook.
- `src/components/PWAComponents.tsx`: PWA UI badges, banners, and update toasts.
- `src/components/Navbar.tsx`: Header, mobile drawer, navigation tabs, search dropdown.
- `src/components/CsvTemplateHubModal.tsx`: CSV Template download modal.
- `src/App.tsx`: Main application shell, 11 functional views, Shift Scheduler, Roster, 19 modals, calculation engines, CSV exports.
- `tests/tier1-calculations/*`: Calculation and CSV export unit tests.
- `tests/tier2-responsive/*`: Responsive layout, sticky table, and touch tests.
- `tests/tier3-pwa/*`: Manifest, service worker, and caching tests.
- `tests/tier4-workflows/*`: Real-world workflows, modals, and desktop invariant tests.
- `scripts/*`: Standalone verification and challenger stress scripts.
