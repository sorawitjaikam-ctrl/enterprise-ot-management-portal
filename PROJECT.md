# Project: Enterprise OT Management Portal Redesign & Interactive Shift Scheduling Engine

## Architecture
- **Design System & Shell**: Bespoke Industrial Maritime Cockpit aesthetic in React 19 + TypeScript + Vite + Tailwind CSS v4. Custom maritime palette (deep abyssal navy `#070d18`, tactical slate `#0f172a`, ocean cyan `#06b6d4`, emergency amber `#f59e0b`, sonar green `#10b981`), high-contrast telemetry status badges, tactile toggle bars, radar sweep accents, and backdrop blur glassmorphism across all 11 application views.
- **Interactive Shift Scheduling Engine (`src/components/ShiftScheduler/` or `src/App.tsx`)**:
  - Drag-to-Paint & 2D Range Selection: Pointer drag events across consecutive days and worker rows with live rectangular bounding cues.
  - Keyboard Hotkeys: Arrow-key grid navigation (`ArrowUp/Down/Left/Right`, `Home`, `End`), single-key direct shift placement (`M` for M12/M8, `N` for N12/N8, `D` for Day, `O` for Off, `A` for Afternoon, `H` for Holiday), and undo/redo (`Ctrl+Z`, `Ctrl+Y`).
  - Radial / Floating Quick Picker: One-touch speed-dial circular interface anchored to active cell with 1-click complementary pair suggestions (`src/components/ShiftRadialPicker.tsx`).
  - Drag-and-Drop Shift Swap: HTML5 / pointer drag chip swapping between workers with instant safety compliance audit (`auditEmployeeShiftsCompliance`).
- **Circadian & Timeline Shift Visualizer (`src/utils/circadianEngine.ts` & `src/components/CircadianTimelineModal.tsx`)**:
  - 24-Hour Continuous Timeline / Gantt matrix showing day (08:00–20:00) vs night (20:00–08:00) circadian bands.
  - Cross-midnight shift segment splitting (e.g., N12: 20:00–24:00 + 00:00–08:00 next day).
  - Real-time hourly concurrent headcount density heatmap and understaffing threshold alerts.
- **Live Overtime & Cost Simulation Engine (`src/utils/costSimulationEngine.ts` & `src/components/LiveSimulationHUD.tsx`)**:
  - Real-time delta OT hours, monetary cost impact (THB) computed via hourly rate `salary/240` (1.5x, 3.0x, 1.0x), and department 150k THB budget ceiling tracking.
  - Real-time Thai labor law safety compliance check (rolling 7-day $\le 36\text{h}$ OT limit, consecutive workdays, rest intervals) displayed via live telemetry HUD during painting/editing.
- **Automated Verification Track**: Vitest test runner, 32 test files, 243 tests (100% pass rate), 0 TypeScript errors (`tsc --noEmit`), 0 build bundle errors (`npm run build`).

---

## Feature Inventory
| # | Feature | Description | Milestone | Source | Status |
|---|---------|-------------|-----------|--------|:------:|
| 1 | Maritime Cockpit Design Tokens & Surfaces | Abyssal navy theme, custom glassmorphism panels, tactile control bars, radar accents, and terminal typography | M1 | ORIGINAL_REQUEST §R1 | DONE |
| 2 | 11-View Industrial Maritime UI Overhaul | Complete visual redesign across all 11 views (Dashboard, Scheduler, Roster, Payroll, Attendance, Analytics, Approvals, Audit, Job Value, Export Hub, Settings) | M1 | ORIGINAL_REQUEST §R1 | DONE |
| 3 | Tactile Telemetry & Status Badges | Dynamic ocean radar indicators, high-contrast operational status badges, fluid press/hover states | M1 | ORIGINAL_REQUEST §R1 | DONE |
| 4 | Drag-to-Paint & Range Selection | Click-and-drag multi-cell shift assignment across consecutive days and worker rows with real-time visual bounds | M2 | ORIGINAL_REQUEST §R2 | DONE |
| 5 | Keyboard Hotkeys & Grid Navigation | Arrow key navigation + single-key hotkeys (`M`, `N`, `D`, `O`, `A`, `H`) and undo/redo support | M2 | ORIGINAL_REQUEST §R2 | DONE |
| 6 | Radial / Floating Quick Picker | One-touch radial speed-dial modal with instant smart complementary pair suggestions | M2 | ORIGINAL_REQUEST §R2 | DONE |
| 7 | Drag-and-Drop Shift Swap Engine | Interactive shift swapping between workers with instant labor compliance safety validation | M2 | ORIGINAL_REQUEST §R2 | DONE |
| 8 | 24-Hour Continuous Timeline / Gantt Matrix | 24-hour visualizer displaying circadian day/night bands, cross-midnight shift splits, and staffing heatmap | M3 | ORIGINAL_REQUEST §R3 | DONE |
| 9 | Live Overtime & Cost Simulation Engine | Real-time calculation of OT hours, THB cost impact, 150k department ceiling, and safety compliance HUD during painting | M3 | ORIGINAL_REQUEST §R3 | DONE |
| 10 | Unit & Integration Test Suite Pass (100%) | Automated Vitest test suites (32 test files, 243 tests) passing cleanly with 100% success rate | M4 | ORIGINAL_REQUEST §R4 | DONE |
| 11 | Production Build & TypeScript Clean Pass | Zero TypeScript compilation errors (`tsc --noEmit`) and clean production bundle compilation (`npm run build`) | M4 | ORIGINAL_REQUEST §R4 | DONE |

---

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|:------:|
| M1 | Bespoke Industrial Maritime UI/UX Overhaul | Maritime cockpit tokens, tactile controls, radar telemetry, 11-view visual redesign | none | DONE |
| M2 | Advanced Interactive Shift Entry & Scheduling Engine | Drag-to-paint, keyboard hotkeys & navigation, radial speed-dial picker, drag-and-drop swap | M1 | DONE |
| M3 | Circadian 24-Hour Timeline Visualizer & Live Cost Simulator | 24-hr Gantt matrix, circadian bands, midnight shift splitting, live OT & cost simulation HUD | M2 | DONE |
| M4 | Comprehensive Verification & Build Integrity | Tiers 1–4 + Tier 5 test suite pass (243/243 tests pass), clean TypeScript, zero-error production build | M1, M2, M3 | DONE |

---

## Interface Contracts

### Circadian Timeline Engine (`src/utils/circadianEngine.ts`)
- `getShiftCircadianSegments(shiftCode: string, dateStr: string): CircadianSegment[]`
  - Returns array of active hour segments `[startHour, endHour, isNight, otHours]`.
- `calculateHourlyStaffingDensity(shifts: Record<string, string>, dateStr: string, employees: Employee[]): HourlyStaffingHeatmap`
  - Returns 24-hour array with headcount per hour, morning/afternoon/night distribution, and coverage warnings.

### Live OT & Cost Simulation Engine (`src/utils/costSimulationEngine.ts`)
- `simulateShiftPaintingDelta(currentShifts: Record<string, string>, paintedCells: Array<{ empId: string, dateStr: string, newShift: string }>, employees: Employee[], year: number, month: number, departmentBudgetLimit: number): SimulationResult`
  - Returns:
    * `deltaOtHours`: number
    * `deltaCostThb`: number
    * `newTotalCostThb`: number
    * `budgetUtilizationPct`: number
    * `isBudgetExceeded`: boolean
    * `complianceViolations`: Array<{ empId: string, empName: string, reason: string }>

### Shift Drag & Hotkey Engine
- `handleBatchAssignShifts(selectedCells: Array<{ empId: string, dayIdx: number }>, shiftCode: string): void`
- `handleShiftSwap(sourceEmpId: string, sourceDayIdx: number, targetEmpId: string, targetDayIdx: number): { success: boolean, reason?: string }`
- `handleGridKeyDown(e: KeyboardEvent): void`

---

## Code Layout
- `src/App.tsx`: Main application shell, view routing, state orchestration.
- `src/components/Navbar.tsx`: Maritime cockpit telemetry header, search bar, navigation drawer.
- `src/components/CircadianTimelineModal.tsx`: 24-Hour Gantt timeline matrix and hourly heatmap.
- `src/components/LiveSimulationHUD.tsx`: Real-time live cost & compliance simulation HUD.
- `src/components/ShiftRadialPicker.tsx`: Radial speed-dial shift selector.
- `src/utils/circadianEngine.ts`: 24-hour shift splitting and hourly density calculations.
- `src/utils/costSimulationEngine.ts`: Delta OT hours, monetary cost, and labor compliance simulation.
- `src/utils/shiftRecommendation.ts`: Shift definitions, complementary pair algorithms, and compliance audits.
- `src/index.css`: Maritime industrial styling, radar animations, glassmorphism surface tokens.
- `tests/tier1-calculations/*`: Core math, circadian, and cost simulation unit tests.
- `tests/tier2-responsive/*`: Responsive layouts and viewport stress tests.
- `tests/tier3-pwa/*`: PWA, service worker, and manifest tests.
- `tests/tier4-workflows/*`: Interactive shift scheduling, hotkeys, drag-to-paint, timeline, and modal workflows.
- `tests/tier5-adversarial/*` (or within tier2/tier4): Adversarial stress verification suites.
