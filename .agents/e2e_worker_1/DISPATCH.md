## 2026-08-21T17:09:46Z
You are the Test Implementation Worker for the E2E Testing Track of the Enterprise OT Management Portal project.
Your working directory: C:\Users\ssrwj\Documents\antigravity\mysterious-einstein\.agents\e2e_worker_1

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Read the following reference documents:
1. ORIGINAL_REQUEST: C:\Users\ssrwj\Documents\antigravity\mysterious-einstein\.agents\ORIGINAL_REQUEST.md
2. PROJECT: C:\Users\ssrwj\Documents\antigravity\mysterious-einstein\PROJECT.md
3. TEST_INFRA: C:\Users\ssrwj\Documents\antigravity\mysterious-einstein\TEST_INFRA.md
4. Explorer 1 Report: C:\Users\ssrwj\Documents\antigravity\mysterious-einstein\.agents\e2e_explorer_1\report.md
5. Explorer 2 Report: C:\Users\ssrwj\Documents\antigravity\mysterious-einstein\.agents\e2e_explorer_2\report.md
6. Explorer 3 Report: C:\Users\ssrwj\Documents\antigravity\mysterious-einstein\.agents\e2e_explorer_3\report.md

Your Task:
1. Test Runner & Dependencies Setup:
   - Install devDependencies: `npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom @types/jsdom`
   - Update `package.json` scripts with `"test": "vitest run"`, `"test:watch": "vitest"`, `"test:tier1": "vitest run tests/tier1-calculations"`, `"test:tier2": "vitest run tests/tier2-responsive"`, `"test:tier3": "vitest run tests/tier3-pwa"`, `"test:tier4": "vitest run tests/tier4-workflows"`.
   - Create `vitest.config.ts` (with `@/*` path alias, jsdom environment, globals: true, setupFiles: ['./tests/setup.ts']).
   - Create `tests/setup.ts` with required polyfills: `window.matchMedia`, `ResizeObserver`, `IntersectionObserver`, `URL.createObjectURL`/`revokeObjectURL`, `MockCacheStorage` (window.caches), and `beforeEach` mock clearing.
   - Create `tests/mocks/mockData.ts` and `tests/mocks/mockServiceWorker.ts`.

2. Implement Complete 4-Tier Test Suite (minimum 104+ test cases total):
   - Tier 1 (`tests/tier1-calculations/`):
     - `shift-ot-hours.test.ts` (≥ 7 tests: M8, M12, M16, A8, A12, N8, N12, N16, OND, D, O, invalid codes)
     - `payroll-breakdown.test.ts` (≥ 6 tests: hourlyRate salary/240, 1.5x weekday, 3.0x Sunday OT, 1.0x Sunday regular work, OND on weekday/Sunday, zero salary fallback 15000, 28/29/30/31 days)
     - `plan-actual-diff.test.ts` (≥ 5 tests: isPlanActualMismatch, diff calculations, positive/negative/zero signs and styling classes)
     - `budget-utilization.test.ts` (≥ 5 tests: 150k THB budget limit, budgetUsed calculation, budgetUtilization %, Warning vs On Track)
     - `csv-exports.test.ts` (≥ 5 tests: all 6 CSV export handlers, UTF-8 BOM `\ufeff`, column count, quote escaping)
   - Tier 2 (`tests/tier2-responsive/`):
     - `mobile-375px-layout.test.tsx` (≥ 5 tests: 375px mobile viewport, compact navigation, container spacing, horizontal scroll)
     - `tablet-768px-layout.test.tsx` (≥ 5 tests: 768px tablet viewport, 2-column metrics cards, sidebar drawer)
     - `shift-matrix-sticky.test.tsx` (≥ 4 tests: w-32/w-44/w-56 sticky left-0 columns, z-index layering)
     - `roster-adaptive-columns.test.tsx` (≥ 4 tests: Roster adaptive frozen columns: 1 col mobile, 2 tablet, 5 desktop)
     - `touch-ergonomics-44px.test.tsx` (≥ 4 tests: >=44x44px interactive tap targets, bottom sheet editor, backdrop dismiss)
   - Tier 3 (`tests/tier3-pwa/`):
     - `manifest-schema.test.ts` (6 tests: manifest JSON syntax, name, short_name, icons, standalone, theme_color)
     - `html-meta-tags.test.ts` (5 tests: index.html meta tags, apple-touch-icon, theme-color, viewport-fit=cover)
     - `service-worker-lifecycle.test.ts` (5 tests: SW registration, install, skipWaiting, activate cache pruning, claim)
     - `offline-caching-strategy.test.ts` (5 tests: Cache-First static assets, Network-First API, offline fallback)
     - `pwa-install-prompt.test.tsx` (5 tests: beforeinstallprompt event handling, install banner & offline badge)
   - Tier 4 (`tests/tier4-workflows/`):
     - `supervisor-shift-workflow.test.tsx` (≥ 5 tests: Shift editing, monthly breakdown recalculation, Plan vs Actual toggle)
     - `employee-roster-workflow.test.tsx` (≥ 5 tests: Employee roster search, multi-filter, modal editing)
     - `desktop-368px-invariants.test.tsx` (≥ 5 tests: Strict 368px desktop summary widget alignment verification: 56+64+80=200 + 96 + 72 = 368px)
     - `csv-template-hub-workflow.test.tsx` (≥ 5 tests: CSV Template Hub downloads and CSV schema regressions)
     - `modal-lifecycle-workflows.test.tsx` (≥ 5 tests: 19 modals lifecycle, touch dismiss, backdrop scroll lock)

3. Verify Test Suite:
   - Run `npm test` (or `npx vitest run`) and ensure all test files compile and pass with 0 errors.
   - Run `npm run build` and ensure TypeScript builds cleanly.

4. Handoff:
   - Write full report with commands and passing output to C:\Users\ssrwj\Documents\antigravity\mysterious-einstein\.agents\e2e_worker_1\report.md and create handoff.md.
   - Send completion message to parent.
