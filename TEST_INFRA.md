# E2E Test Infra: Enterprise OT Management Portal Mobile & Tablet Responsive UI/UX & PWA

## 1. Test Philosophy
- **Requirement-Driven & Opaque-Box**: All test suites are derived directly from `ORIGINAL_REQUEST.md` specifications, user workflows, and payroll calculation standards, independent of internal module refactorings.
- **Methodology**: Systematic 4-tier testing combining Category-Partition, Boundary Value Analysis (BVA), Pairwise Combinatorial Testing, and Real-World Workload Simulation.
- **Progressive Testability**: Verification mechanisms do not depend on features more complex than what is being tested. Tier 1 calculations verify pure business math; Tier 2 validates responsive DOM breakpoints; Tier 3 asserts PWA contracts; Tier 4 validates end-to-end user journeys and regression prevention.
- **Robustness & Integrity**: Strict assertions prevent false positives, hardcoded bypasses, and layout overflow regressions.

---

## 2. Feature Inventory & Test Mapping Matrix

| # | Feature Area | Requirement Source | Tier 1 (Unit & Calcs) | Tier 2 (Boundary & Responsive) | Tier 3 (PWA & Offline) | Tier 4 (Workflows & Regression) |
|---|---|---|:---:|:---:|:---:|:---:|
| 1 | **OT Hours Extraction (`getShiftOtHours`)** | ORIGINAL_REQUEST §R2 | 7 tests | - | - | 2 tests |
| 2 | **Monthly OT Pay Breakdown Engine** | ORIGINAL_REQUEST Acceptance Criteria | 6 tests | - | - | 3 tests |
| 3 | **Plan vs Actual Difference Engine** | ORIGINAL_REQUEST Acceptance Criteria | 5 tests | - | - | 2 tests |
| 4 | **Department Budget (150k THB Limit)** | ORIGINAL_REQUEST Acceptance Criteria | 5 tests | - | - | 2 tests |
| 5 | **6 CSV Export Routines** | ORIGINAL_REQUEST Acceptance Criteria | 5 tests | - | - | 3 tests |
| 6 | **Mobile Viewport (375px–430px)** | ORIGINAL_REQUEST §R1 | - | 5 tests | - | 2 tests |
| 7 | **Tablet Viewport (768px–1024px)** | ORIGINAL_REQUEST §R1 | - | 5 tests | - | 2 tests |
| 8 | **Desktop Viewport (>=1024px / 1280px)** | ORIGINAL_REQUEST §R1 | - | 3 tests | - | 3 tests |
| 9 | **Shift Matrix Sticky Worker Column** | ORIGINAL_REQUEST §R2 | - | 4 tests | - | 2 tests |
| 10 | **Shift Matrix 368px Summary Invariant** | ORIGINAL_REQUEST Acceptance Criteria | - | 3 tests | - | 2 tests |
| 11 | **Roster Table Adaptive Frozen Columns** | ORIGINAL_REQUEST §R2 | - | 4 tests | - | 2 tests |
| 12 | **Touch Ergonomics & Tap Targets (>=44px)** | ORIGINAL_REQUEST §R4 | - | 4 tests | - | 2 tests |
| 13 | **Web App Manifest Schema & Meta Tags** | ORIGINAL_REQUEST §R3 | - | - | 11 tests | - |
| 14 | **Service Worker Lifecycle & Caching** | ORIGINAL_REQUEST §R3 | - | - | 10 tests | - |
| 15 | **PWA Install Prompt & Offline Badge** | ORIGINAL_REQUEST §R3 | - | - | 5 tests | 2 tests |
| 16 | **19 Modal Dialogues & Responsive Ergonomics**| ORIGINAL_REQUEST §R4 | - | 3 tests | - | 5 tests |
| 17 | **End-to-End Operational Workflows** | ORIGINAL_REQUEST Acceptance Criteria | - | - | - | 6 tests |

---

## 3. Test Architecture & Runner Setup

### 3.1 Test Framework
- **Harness**: **Vitest 3** with `jsdom` environment and `@testing-library/react` (v16) for DOM simulation.
- **Invocation Command**: `npm test` or `npx vitest run`
- **Pass / Fail Semantics**: Zero failures, exit code 0.
- **Configuration File**: `vitest.config.ts`

### 3.2 Directory Hierarchy
```
tests/
├── setup.ts                                # Polyfills (matchMedia, ResizeObserver, MockCache, URL)
├── mocks/
│   ├── mockData.ts                         # Department, Employee, Shift, and Vessel fixtures
│   └── mockServiceWorker.ts                # CacheStorage and navigator.serviceWorker mocks
├── tier1-calculations/
│   ├── shift-ot-hours.test.ts              # Shift code OT hours (M8, M12, M16, N16, OND, D, O)
│   ├── payroll-breakdown.test.ts           # Hourly rate (salary/240), 1.5x/3.0x/1.0x multipliers
│   ├── plan-actual-diff.test.ts            # Plan vs Actual diff, mismatch flags, visual sign classes
│   ├── budget-utilization.test.ts          # Department 150k THB budget limits & warning thresholds
│   └── csv-exports.test.ts                 # 6 CSV export handlers, UTF-8 BOM, RFC 4180 escaping
├── tier2-responsive/
│   ├── mobile-375px-layout.test.tsx        # Mobile compact layout, no horizontal clipping
│   ├── tablet-768px-layout.test.tsx        # Tablet 2-column metrics cards & sidebar drawer
│   ├── shift-matrix-sticky.test.tsx        # Shift matrix w-32/w-44/w-56 sticky left-0 columns
│   ├── roster-adaptive-columns.test.tsx    # Roster adaptive frozen columns (1 col mobile, 2 tablet, 5 desktop)
│   └── touch-ergonomics-44px.test.tsx      # Interactive controls min 44x44px tap targets
├── tier3-pwa/
│   ├── manifest-schema.test.ts             # Web App Manifest JSON validity, name, icons, standalone
│   ├── html-meta-tags.test.ts              # index.html meta tags, apple-touch-icon, theme-color
│   ├── service-worker-lifecycle.test.ts    # SW install, skipWaiting, activate, cache purging, claim
│   ├── offline-caching-strategy.test.ts    # Cache-First static assets, Network-First API, offline fallback
│   └── pwa-install-prompt.test.tsx         # beforeinstallprompt event handling, install banner & offline badge
└── tier4-workflows/
    ├── supervisor-shift-workflow.test.tsx  # Shift editing, monthly breakdown recalculation, mismatch toggle
    ├── employee-roster-workflow.test.tsx   # Employee roster search, multi-filter, modal editing
    ├── desktop-368px-invariants.test.tsx   # Strict 368px desktop summary widget alignment verification
    ├── csv-template-hub-workflow.test.tsx  # CSV Template Hub downloads and CSV schema regressions
    └── modal-lifecycle-workflows.test.tsx  # 19 modals lifecycle, touch dismiss, backdrop scroll lock
```

---

## 4. Real-World Application Scenarios (Tier 4)

| # | Scenario Identifier | Workflow Description | Features Exercised |
|---|---|---|---|
| 1 | `RW-SUPERVISOR-SHIFT-EDIT` | Port supervisor logs in on mobile device, navigates to Shift Scheduler, selects employee, opens bottom-sheet cell editor, updates shift from M8 to M12, verifies recalculation of 1.5x OT hours and budget diff. | F1, F2, F3, F6, F9, F12 |
| 2 | `RW-DESKTOP-368PX-INVARIANT` | Workstation operator loads monthly shift grid on desktop (1440px), asserts exact 368px summary widget geometry (`56px + 64px + 80px + 96px + 72px`), validates Thai currency and percentage calculations. | F2, F8, F10 |
| 3 | `RW-ROSTER-ADAPTIVE-COLUMNS` | Field supervisor searches for staff by nickname/department on mobile (375px), verifies only ID column is frozen with smooth horizontal panning across 19 profile fields. | F6, F11, F16 |
| 4 | `RW-CSV-EXPORT-INTEGRITY` | HR manager exports Monthly Shift Payroll CSV and Employee Database CSV, validates UTF-8 BOM `\ufeff`, column count, and RFC 4180 double-quote escaping. | F5, F16 |
| 5 | `RW-PWA-OFFLINE-RESTORATION` | Supervisor launches PWA in airplane mode, verifies static app shell loads from Cache-First cache, displays offline notification badge, and gracefully handles cached data. | F13, F14, F15 |
| 6 | `RW-19-MODALS-TOUCH-DISMISS` | Interactive touch testing of all 19 modal dialogues ensuring responsive sizing, >=44px tap targets, and smooth backdrop dismissal. | F12, F16 |

---

## 5. Coverage Thresholds
- **Tier 1 (Feature & Calculation Coverage)**: ≥ 28 test cases across all calculation and CSV routines.
- **Tier 2 (Boundary & Responsive Layout)**: ≥ 25 test cases across 375px/768px/1024px viewports and sticky tables.
- **Tier 3 (PWA & Offline Shell)**: 26 test cases across manifest, meta tags, and Service Worker caching.
- **Tier 4 (Real-World Workflows & Invariants)**: ≥ 25 test cases across end-to-end user scenarios and desktop invariants.
- **Total Minimum Threshold**: **≥ 104 test cases**.
