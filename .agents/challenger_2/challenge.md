# Adversarial Challenge Report — R3: Circadian Timeline & Live Cost Simulation

## Challenge Summary

**Overall risk assessment**: MEDIUM (Core calculation domain and interactive UI components are robust and mathematically sound under intense stress; however, 8 TypeScript type errors exist in worker test files preventing clean `tsc --noEmit` pass).

---

## Challenges

### [Medium] Challenge 1: Incomplete Mock Typings in Vitest Workflows Trigger `tsc --noEmit` Failures

- **Assumption challenged**: `npm run lint` (`tsc --noEmit`) passes cleanly with 0 TypeScript compilation errors as required by PROJECT.md and ORIGINAL_REQUEST.md.
- **Attack scenario**: Running static type validation via `npm run lint` or `npx tsc --noEmit` on the codebase.
- **Blast radius**: While Vite ignores TypeScript types during production bundling (`npm run build` succeeds) and Vitest passes all 243 tests (100%), CI pipelines that enforce strict typechecking (`tsc --noEmit`) will fail.
- **Root Cause & Code Locations**:
  1. `tests/tier4-workflows/circadian-timeline-workflows.test.tsx` (lines 48, 68, 88, 104, 120): Mock employee literals are missing required `Employee` properties `targetOt`, `actualOt`, `otPct`, `status`, `groupName`.
  2. `tests/tier4-workflows/interactive-shift-engine-workflows.test.tsx` (lines 71, 73): Mock employee objects missing `Employee` properties `targetOt`, `actualOt`, `otPct`, `status`, `groupName`, `shifts`.
  3. `tests/tier4-workflows/interactive-shift-engine-workflows.test.tsx` (line 114): Mock `SimulationResult` object missing properties `baselineOtHours`, `simulatedOtHours`, `baselineCostThb`, `simulatedCostThb`, `deltaCostThb`, `affectedEmployeesCount`.
- **Mitigation**: Update mock employee declarations and mock `SimulationResult` objects in those test files with complete type fields or use a helper factory like `createMockEmployee(overrides)`.

---

### [Low] Challenge 2: Cross-Midnight Shift Category Attribution for Afternoon Shifts (`A12`)

- **Assumption challenged**: All shifts carrying over past midnight into 00:00–08:00 are attributed to the "night" category in hourly density metrics.
- **Attack scenario**: Employee works `A12` (15:00–03:00) on Day $N-1$, carrying over into Day $N$ at 00:00–03:00.
- **Observations & Behavior**:
  * `circadianEngine.ts` uses `SHIFT_DEFINITIONS[seg.shiftCode].category` which maps `A12` to `"afternoon"`.
  * At 00:00, `isEmployeeActiveAtHour` correctly returns `active: true` with category `"afternoon"`.
  * `calculateHourlyStaffingDensity` correctly increments `afternoonCount` and total `headcount`, while `nightCount` tracks night-category shifts (`N8`, `N12`, `N16`). Total headcount aggregation is 100% accurate (e.g. 3 Night + 1 Afternoon = 4 total workers).
- **Blast radius**: None; hourly headcount total is completely accurate and correctly distinguishes afternoon shift personnel working overtime past midnight.
- **Mitigation**: None needed; domain behavior is mathematically correct.

---

## Stress Test Results

| # | Stress Scenario | Expected Behavior | Actual Behavior | Result |
|---|----------------|-------------------|-----------------|:------:|
| 1 | **Edge Hours Evaluation (00:00, 23:59, 24:00, -1, 25)** | Hours `< 8` and `>= 20` categorized as night band; shift segments cleanly split | `isCircadianNightHour` and `getShiftCircadianSegments` behave deterministically | **PASS** |
| 2 | **Cross-Month & Cross-Midnight Day 1 Carryover** | Day 1 at 00:00–07:00/11:00 reflects carryover from Day 31 shifts (`N12`, `N8`, `A12`, `N16`) | All 4 carryover workers active at 00:00; drops to 3 at 03:00 (A12 ends), drops to 1 at 07:00 (N16 continues) | **PASS** |
| 3 | **Missing / Malformed Previous Day Shifts** | Missing `prevDayShifts` or invalid shift codes handled gracefully without exception | Zero carryover assumed, totalActiveStaff calculated cleanly without crash | **PASS** |
| 4 | **Massive 20-Worker Simultaneous Overlap & Heatmap** | Aggregates 20 workers with mixed M12, N12, A12, M16, OND, O; calculates peak, lowest, averages | Peak at 15:00 (13 workers), lowest at 03:00 (5 workers), accurate morning/afternoon/night averages | **PASS** |
| 5 | **Zero & Negative Salary Robustness** | Falls back to default 15,000 THB base salary; no `NaN` or division-by-zero | Fallback hourly rate 62.5 THB/hr used; OT calculated cleanly | **PASS** |
| 6 | **High Salary Stress (2,400,000 THB/mo)** | Calculates high OT costs (10,000 THB/hr) without precision loss or overflow | Correctly computed 120,000 THB for 8h normal OT | **PASS** |
| 7 | **Holiday vs Weekday Mixed Painting** | Applies 1.5x (normal OT), 3.0x (holiday OT), and 1.0x (holiday work days) | Sunday and OND OT calculations match Thai labor law formulas exactly | **PASS** |
| 8 | **150k THB Budget Threshold Crossings (94.9% vs 95.1% vs 100.0% vs 100.1%)** | Threshold `< 100%` does not exceed; `> 100%` flags `isBudgetExceeded: true` and violation | Accurately triggers `budget_exceeded` compliance violation when cost exceeds 150,000 THB | **PASS** |
| 9 | **Rolling 7-Day 36h OT Limit & Safety Audits** | 36h OT passes; 40h OT triggers `weekly_ot`; 7 consecutive workdays triggers `consecutive_days`; Night into Morning triggers `rest_period` | All three labor compliance audit rules fire accurately with descriptive Thai alerts | **PASS** |
| 10 | **Painting Delta Edge Inputs** | Handles duplicate day overrides, out-of-range days (0, 32), non-existent employees, empty arrays | Overwrites idempotently, ignores out-of-bounds days, computes delta cleanly | **PASS** |
| 11 | **CircadianTimelineModal Workflow Stress** | Modal renders 24-hr matrix, navigates days, filters roles, triggers onSelectCell | Telemetry cards, day navigation buttons, dropdown, and cell click handlers operate smoothly | **PASS** |
| 12 | **LiveSimulationHUD Workflow Stress** | Floating HUD shows live cell count, delta OT, delta cost, budget progress bar, violations badge | Displays positive/negative deltas, meter width, violation count, and triggers apply/cancel | **PASS** |
| 13 | **Full Vitest Test Suite Execution** | All test suites across Tiers 1–5 pass (100%) | 32 test files, 243 tests pass (0 failures) | **PASS** |
| 14 | **Production Build (`npm run build`)** | Clean Vite production bundle and esbuild server build | Compiles cleanly in 3.6s (`dist/index.html`, `dist/server.cjs`) | **PASS** |
| 15 | **TypeScript Lint (`npm run lint` / `tsc --noEmit`)** | Zero TypeScript compilation errors across codebase | 8 type errors detected in test mock objects | **FAIL** |

---

## Unchallenged Areas

- **Backend Multi-Node Clustered State**: In-memory server caching under multi-instance horizontal scaling was not stress-tested as the portal operates as a single-instance node service with client-side state management.
