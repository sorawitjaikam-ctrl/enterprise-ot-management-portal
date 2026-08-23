# Codebase Survey & Architectural Analysis: R3 & R4

## Executive Summary
This analysis investigates the Enterprise OT Management Portal codebase specifically for:
1. **R3: Circadian & Timeline Shift Visualizer** (24-Hour Timeline / Gantt Matrix view showing day/night circadian coverage across 24 hours; Live Overtime & Cost Simulation calculating real-time budget and weekly safety limits during painting/editing).
2. **R4: Comprehensive Automated Verification & Integrity** (Unit/integration test suites in `tests/`, Vitest config, test coverage across calculation engine, UI components, interaction hooks, and build pipeline).

The investigation verifies that the current test infrastructure is based on **Vitest v4.1.11** with JSDOM and currently executes **25 test files and 184 tests with 100% pass rate**, and the build pipeline compiles cleanly with zero TypeScript errors. However, while foundational calculation helpers and basic shift views exist, the advanced interactive capabilities (24-Hour Gantt Visualizer, Live Cost Simulation Engine during painting, Drag-to-Paint mass assignment, Keyboard Hotkeys, Shift Swap) require dedicated architectural modules, UI components, and automated test coverage.

---

## 1. R3: Circadian & Timeline Shift Visualizer Analysis

### 1.1 Current Architecture & Codebase Baseline
- **Location of Shift Logic**: `src/App.tsx` (lines 7590–8838 for shifts view) and `src/utils/shiftRecommendation.ts`.
- **Existing Shift Types & Circadian Categories** (`SHIFT_DEFINITIONS` in `src/utils/shiftRecommendation.ts`):
  | Code | Name / Description | Category | Time Window | Work Hrs | OT Hrs | Crosses Midnight? |
  |------|--------------------|----------|-------------|:--------:|:------:|:-----------------:|
  | `M8` | Morning Standard | morning | 07:00 – 15:00 | 8 | 0 | No |
  | `M12` | Morning + 4h OT | morning | 07:00 – 19:00 | 12 | 4 | No |
  | `M16` | Morning Double | morning | 07:00 – 23:00 | 16 | 8 | No |
  | `A8` | Afternoon Standard | afternoon | 15:00 – 23:00 | 8 | 0 | No |
  | `A12` | Afternoon + 4h OT | afternoon | 15:00 – 03:00 | 12 | 4 | **Yes (+1 day)** |
  | `N8` | Night Standard | night | 23:00 – 07:00 | 8 | 0 | **Yes (+1 day)** |
  | `N12` | Night Paired 12h | night | 19:00 – 07:00 | 12 | 4 | **Yes (+1 day)** |
  | `N16` | Night Double 16h | night | 19:00 – 11:00 | 16 | 8 | **Yes (+1 day)** |
  | `D` | Day Standby | full_day | 08:00 – 17:00 | 8 | 0 | No |
  | `OND`| On-Duty Holiday | full_day | 08:00 – 17:00 | 8 | 8 | No |
  | `O`/`OFF`| Rest / Off | off | - | 0 | 0 | No |

### 1.2 Required Architecture for 24-Hour Timeline / Gantt Matrix View
1. **Continuous 24-Hour Axis (00:00 to 24:00)**:
   - Time scale partitioned into 24 one-hour blocks (or 48 30-minute intervals).
   - Circadian Day/Night Bands:
     - **Night Watch 1**: `00:00 – 06:00` (Deep maritime night gradient, Moon & radar telemetry accents).
     - **Day Operations**: `06:00 – 18:00` (High visibility daytime cockpit lighting, Sun indicator).
     - **Night Watch 2**: `18:00 – 24:00` (Dusk / Night watch transition).
     - **Shift Handover Zones**: `06:30–07:00`, `14:30–15:00`, `18:30–19:00`, `22:30–23:00` marked with visual tactile beacon lines.
2. **Gantt Shift Bar Mapping & Midnight Splitting**:
   - For shifts staying within the day (e.g. `M12`: `07:00` to `19:00`), render a single continuous Gantt block spanning 50% of the 24-hour width from 29.17% (7/24) to 79.17% (19/24).
   - For night shifts spanning midnight (e.g. `N12`: `19:00` to `07:00`), render split segment 1 (`19:00` to `24:00`) on current day and segment 2 (`00:00` to `07:00`) on following day, or render continuous timeline with 24-hour wrapping visual connectors.
3. **Concurrent Staffing & Circadian Coverage Heatmap**:
   - For any selected day, calculate active headcount $C(h)$ for each hour $h \in [0, 23]$:
     $$C(h) = \sum_{e \in \text{Employees}} \mathbb{I}(e \text{ is working at hour } h)$$
   - Highlight **Coverage Gaps** ($C(h) = 0$ in red alert) and **Sub-optimal Staffing** ($C(h) = 1$ in amber warning).

---

### 1.3 Required Architecture for Live Overtime & Cost Simulation Engine
1. **Real-Time Simulation Formulae**:
   - Let baseline OT pay be $P_0$ and baseline OT hours be $H_0$.
   - When user is painting or selecting a set of candidate shift cells $S_{\text{sim}} = \{(e_i, d_j, c_{ij})\}$:
     - Calculate simulated monthly shifts for each affected employee $e_i$.
     - Recompute monthly OT breakdown:
       $$\text{HourlyRate}_i = \frac{\text{Salary}_i}{240}$$
       $$\text{OTPay}_i = (\text{NormalOT}_i \times 1.5 + \text{HolidayOT}_i \times 3.0 + \text{HolidayDays}_i \times 8 \times 1.0) \times \text{HourlyRate}_i$$
     - Compute simulation deltas:
       $$\Delta H = \sum H_{\text{sim}} - H_0, \quad \Delta P = \sum P_{\text{sim}} - P_0$$
     - Compute department budget impact:
       $$\text{SimulatedBudgetUsed} = \text{CurrentBudgetUsed} + \Delta P$$
       $$\text{BudgetUtilizationPct} = \left(\frac{\text{SimulatedBudgetUsed}}{150000}\right) \times 100\%$$
2. **Live Safety & Labor Law Compliance Engine**:
   - Audit simulated shifts across three strict criteria:
     1. **Weekly OT Limit**: $\text{OT}_{\text{week } w} > 36 \text{ hrs} \implies \text{DANGER ALERT}$.
     2. **Consecutive Work Days**: $\text{ConsecutiveDays} > 6 \text{ days} \implies \text{WARNING ALERT}$.
     3. **Rest Turnaround**: Transition from Night ($N8, N12, N16$) to Morning ($M8, M12, M16, D$) next day $\implies <11\text{h Rest } \implies \text{DANGER ALERT}$.
3. **Tactile Live Simulation HUD (Industrial Cockpit)**:
   - Pinned floating telemetry bar appearing during drag-to-paint / editing mode:
     - Live Cell Count: `4 Cells Selected`
     - OT Hours Delta: `+16.0 hrs`
     - Real-Time Cost Delta: `+฿2,400 THB`
     - Dept 150k Ceiling Progress: `฿134,200 / ฿150,000 (89.5%) [ON TRACK]`
     - Compliance Status: `🟢 0 Violations` or `🔴 Danger: Over 36h Weekly Limit`

---

## 2. R4: Automated Verification & Integrity Analysis

### 2.1 Current Test Infrastructure Overview
- **Runner**: Vitest v4.1.11 (`vitest run` / `vitest`)
- **Environment**: `jsdom` with custom polyfills in `tests/setup.ts` (matchMedia, ResizeObserver, IntersectionObserver, CacheStorage, fetch).
- **Configuration** (`vitest.config.ts`):
  - Setup file: `tests/setup.ts`
  - Globals: `true`
  - Timeout: `10000ms`
  - Alias: `@` $\to$ project root

### 2.2 Existing Test Suite Inventory (184 Tests across 25 Files)
| Tier | Directory | Test Files | Total Tests | Status |
|------|-----------|:----------:|:-----------:|:------:|
| **Tier 1** | `tests/tier1-calculations/` | 6 | 40 | **100% PASS** |
| **Tier 2** | `tests/tier2-responsive/` | 8 | 73 | **100% PASS** |
| **Tier 3** | `tests/tier3-pwa/` | 6 | 46 | **100% PASS** |
| **Tier 4** | `tests/tier4-workflows/` | 5 | 25 | **100% PASS** |
| **Total** | | **25** | **184** | **100% PASS** |

#### Key Test Breakdown:
- `tests/tier1-calculations/shift-ot-hours.test.ts`: 7 tests verifying `getShiftOtHours` for M8, M12, M16, OND, D, OFF, custom codes.
- `tests/tier1-calculations/payroll-breakdown.test.ts`: 7 tests verifying `getEmpMonthlyOtPayBreakdown` (1.5x weekday OT, 3.0x Sunday OT, 1.0x holiday base work, 15k fallback salary, leap years).
- `tests/tier1-calculations/plan-actual-diff.test.ts`: 6 tests verifying plan vs actual diffs.
- `tests/tier1-calculations/budget-utilization.test.ts`: 6 tests verifying 150k department budget ceiling calculation.
- `tests/tier1-calculations/csv-exports.test.ts`: 6 tests verifying 6 UTF-8 BOM CSV export functions.
- `tests/tier1-calculations/smart-shift-recommendations.test.ts`: 8 tests verifying complementary pair recommendations and compliance checks.
- `tests/tier2-responsive/*`: 8 test suites validating responsive viewports (375px, 768px, 1024px), sticky worker column `w-56`, adaptive roster columns, touch targets $\ge 44\text{px}$.
- `tests/tier3-pwa/*`: 6 test suites validating PWA manifest, service worker caching, lifecycle, offline fallbacks.
- `tests/tier4-workflows/*`: 5 test suites validating supervisor workflow, employee roster workflow, modal lifecycles, and desktop 368px invariants.

---

### 2.3 Gap Analysis: Missing Test Coverage for R1–R4

| Requirement Area | Feature / Engine | Missing Test Cases to Implement |
|------------------|------------------|---------------------------------|
| **R2: Rapid Entry & Interaction** | **Drag-to-Paint & Range Selection** | - Multi-day continuous range selection<br>- Multi-worker rectangular range selection<br>- Mass-assignment commit and rollback on cancel<br>- Touch and mouse drag event handlers |
| **R2: Rapid Entry & Interaction** | **Keyboard Hotkeys & Navigation** | - Arrow key grid navigation (Up, Down, Left, Right)<br>- Single-key hotkeys ('M' $\to$ M12, 'N' $\to$ N12, 'A' $\to$ A8, 'D' $\to$ D, 'O' $\to$ O)<br>- Hotkey input on active cell and Escape dismiss |
| **R2: Rapid Entry & Interaction** | **Shift Swap Engine** | - Swap shifts between two employees on the same date<br>- Validation of role compatibility and compliance check post-swap |
| **R3: Visualizer & Simulation** | **24-Hour Circadian Gantt Engine** | - 24-Hour slot calculations (0–23h)<br>- Midnight-spanning shift bar segment calculation<br>- Hourly staffing density & coverage gap detection |
| **R3: Visualizer & Simulation** | **Live Cost & Safety Simulation** | - Real-time delta OT hours calculation during paint selection<br>- Real-time delta OT pay calculation (THB)<br>- 150,000 THB department ceiling delta impact<br>- Rolling 7-day weekly OT compliance check (>36h)<br>- Consecutive days check (>6 days) and turnaround rest check (<11h) |
| **R3: Visualizer & Simulation** | **Visualizer UI Components** | - Rendering 24-Hour Timeline / Gantt Matrix view<br>- Switching between Calendar Matrix and 24-Hour Timeline views<br>- Rendering Live Simulation Telemetry HUD during active selection |

---

## 3. Test Runner & Build Verification Commands

### Test Execution Commands:
- Full Test Suite: `npm test`
- Tier 1 (Calculations & Simulation): `npm run test:tier1`
- Tier 2 (Responsive & Matrix UI): `npm run test:tier2`
- Tier 3 (PWA & Offline): `npm run test:tier3`
- Tier 4 (Workflows & Lifecycle): `npm run test:tier4`

### Build & Integrity Commands:
- Type Check: `npm run lint` (`tsc --noEmit`)
- Production Build: `npm run build` (`vite build && esbuild server.ts ...`)

### Performance & Time Budget:
- Current full test suite runs in ~34 seconds (JSDOM environment setup + 25 test files).
- Production build finishes in ~15 seconds.

---

## 4. Architectural Recommendations for Implementation

1. **Modular Engine Extraction**:
   - Create `src/utils/circadianEngine.ts`: pure functions for 24-hour hour slot calculation, midnight-split Gantt segments, circadian Day/Night category detection, and hourly headcount aggregation.
   - Create `src/utils/costSimulationEngine.ts`: pure functions for incremental delta cost computation, 150k ceiling utilization impact, and live compliance auditing during cell painting.
2. **Interactive Shift Visualizer & Scheduler Component**:
   - Create `src/components/CircadianTimelineVisualizer.tsx`: 24-hour Gantt matrix with Day/Night radar cockpit styling, hourly coverage density bar, and interactive day selector.
   - Create `src/components/LiveSimulationHud.tsx`: industrial maritime telemetry HUD showing live OT delta, budget impact, and safety alerts during drag/paint.
3. **Comprehensive Unit & Integration Test Suites**:
   - `tests/tier1-calculations/cost-simulation-engine.test.ts`: validating simulated cost and budget calculations.
   - `tests/tier1-calculations/circadian-gantt-engine.test.ts`: validating 24-hour slots and headcount coverage.
   - `tests/tier4-workflows/circadian-visualizer-workflow.test.tsx`: validating visualizer switching, live simulation telemetry, and rapid hotkey interaction.
