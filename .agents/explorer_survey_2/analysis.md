# Architectural & Technical Survey: R2 Advanced Interactive Shift Entry & Scheduling Engine

**Author**: `explorer_survey_2`  
**Date**: 2026-08-23  
**Status**: Investigation Complete  
**Scope**: Requirements Specification R2 (Drag-to-Paint, Hotkeys, Radial/Floating Quick Picker, Drag-and-Drop Shift Swap)

---

## 1. Executive Summary & Problem Boundary

The Enterprise OT Management Portal currently manages 11 operational views, with the Shift Scheduler serving as the central operational hub for maritime terminal departments (INTER 2, INTER 3, INTER 5, INTER 7, Heavy Machine, ECC).

While the current system has basic shift rendering, single-cell click popovers, and an automated rule engine (`src/utils/shiftRecommendation.ts`), it lacks high-throughput, tactile interactive scheduling mechanics. Supervisors planning schedules for 30–50 workers across 30 days are forced into repetitive single-cell clicks or cumbersome multi-step modal forms.

Requirement **R2** mandates modernizing this experience into an **industrial maritime tactile cockpit scheduling engine**:
1. **Drag-to-Paint & Range Selection**: Effortlessly mass-assign shifts across consecutive days and workers via pointer drag.
2. **Keyboard Hotkeys & Grid Navigation**: Rapid single-key shift entry (`M`, `N`, `D`, `O`, `A`, `H`, etc.) with fluid arrow-key grid traversal and undo/redo.
3. **Radial / Floating Quick Picker**: Bespoke one-touch tactile dial centered over the cell with smart complementary pair suggestions.
4. **Drag-and-Drop Shift Swap**: Seamless interactive shift swapping between paired colleagues with immediate labor compliance and rest-period validation.

---

## 2. Codebase Investigation & Existing Inventory

### 2.1 File Inventory & Architecture

| File Path | Lines | Responsibilities & Current State |
|---|---|---|
| `src/App.tsx` | 12,280 | Monolithic container housing all 11 tabs, 19 modals, shift state (`state.employees`, `tempEmployees`, `isEditingShifts`), shift rendering (lines 7590–8839), modal shift editor (lines 11363–11650), popover cell editor (lines 11653–11790), direct save handler `handleDirectSaveShift` (lines 2457–2530), and bulk setter modal `handleApplyBulkShift` (lines 3229–3261). |
| `src/utils/shiftRecommendation.ts` | 308 | Core shift definitions (`SHIFT_DEFINITIONS`), complementary pair rules (`getComplementaryShift`), rotating schedule generators (`generateTwoTeamPairSchedules`, `generateThreeTeamRotatingSchedules`, `generate4On2OffSchedule`), and compliance checks (`auditEmployeeShiftsCompliance`, `analyzeDepartmentShiftCoverage`). |
| `src/types.ts` | 114 | Core data models: `Employee` (with `shifts: any`, `planShifts?: any`), `ShiftConfig`, `Department`, `AppState`. |
| `src/components/Navbar.tsx` | 515 | Navigation bar with keyboard listener for `Escape` only. |
| `tests/tier1-calculations/*` & `tests/tier4-workflows/*` | 33 files | 184 tests verifying OT calculations (1.5x/3.0x/1.0x, salary/240), Plan vs Actual diffs, 368px desktop summary invariant (`56px + 64px + 80px + 96px + 72px`), sticky worker column (`w-56`, `z-10`), and modal lifecycles. |

---

### 2.2 Existing Shift Data Model & Mutation Patterns

In `src/App.tsx`, employee shifts are represented in two possible internal formats:
1. An array of shift code strings: `["M12", "M12", "O", "N12", ...]`.
2. A serialized or parsed JSON object keyed by month: `{"2026-08": ["M12", "M12", ...]}` stored in `emp.shifts` and `emp.planShifts`.

Key helper functions in `src/App.tsx`:
- `getEmpShiftsArray(emp.shifts, monthKey, calendarType)`: Normalizes shift format to a 31-element string array.
- `getEmpPlanShiftsArray(emp, monthKey)`: Retrieves or falls back to plan shifts array.
- `getShiftOtHours(shift)`: Computes overtime hours (e.g. `M8 -> 0`, `M12 -> 4`, `M16 -> 8`, `OND -> 8`, `OFF/O/D -> 0`).
- `getEmpMonthlyOtPayBreakdown(emp, shifts, year, month)`: Calculates Thai labor OT payroll (`normalOt * 1.5 + holidayOt * 3.0 + holidayWorkDays * 8 * 1.0) * (salary / 240)`).
- `handleDirectSaveShift(emp, dayIdx, target, newShiftCode)`: Updates employee shifts in state and posts to `/api/save-shifts`.

---

## 3. Deep Feature Gap Analysis & Technical Design

### 3.1 Feature 1: Drag-to-Paint & Range Selection

#### Current Status
- **0% implemented**.
- Existing bulk assignment is done via a static modal dialogue (`showBulkShiftModal`) where users select numeric start/end days from dropdowns and apply to entire groups.
- Clicking any cell currently triggers the single-cell popup `activeCellEditor`.

#### Required Capabilities
1. **Drag-to-Paint Mode (Brush Tool)**:
   - User activates a "Paint Brush" palette from the toolbar with a selected shift code (e.g. `M12`, `N12`, `O`, `OND`).
   - Pointer down on any cell paints that cell immediately and initiates active painting.
   - Moving the pointer across adjacent day cells or adjacent worker rows paints the selected shift code into all traversed cells in real time with audio/tactile feedback.
   - Pointer up commits the batch paint into the active shift state and history stack.
2. **Range / Marquee Selection Mode (Box Drag)**:
   - When not in paint brush mode, click-and-drag creates a 2D selection rectangle: `[startWorkerIndex, startDay] -> [currentWorkerIndex, currentDay]`.
   - Visual marquee overlay highlights all selected cells with a semi-transparent cyan/blue wash and glowing border (`ring-2 ring-blue-500/80 bg-blue-500/15`).
   - Floating Action Bar / Quick Batch Toolbar appears near selection with single-click mass-assign pills: `[ M12 ] [ N12 ] [ M8 ] [ A8 ] [ N8 ] [ D ] [ O ] [ OND ] [ Clear ]`.
   - Pressing any hotkey (e.g. `M`, `N`, `O`) fills the entire selected rectangular range instantly.

#### Technical Implementation Architecture
```typescript
interface SelectionRange {
  startEmpId: string;
  startEmpIdx: number;
  startDayIdx: number;
  endEmpId: string;
  endEmpIdx: number;
  endDayIdx: number;
}

interface DragPaintState {
  isDragging: boolean;
  mode: "paint" | "select";
  paintCode: string | null;
  originEmpId: string | null;
  originDayIdx: number | null;
  currentEmpId: string | null;
  currentDayIdx: number | null;
  selectedCellKeys: Set<string>; // `${empId}:${dayIdx}`
}
```
- **Pointer Event Pipeline**:
  - Grid container attaches `onPointerDown`, `onPointerMove`, `onPointerUp`, `onPointerCancel` with `setPointerCapture` support to guarantee drag tracking even if the cursor moves outside individual cell boundaries.
  - Touch support via `touch-action: none` on drag handles, while preserving horizontal scrolling when dragging outside active cells.
  - Micro-batch state updates to prevent layout thrashing.

---

### 3.2 Feature 2: Keyboard Hotkeys & Arrow-Key Grid Navigation

#### Current Status
- **0% implemented**.
- Matrix cells have no `tabIndex`, no focus state management, and no keyboard event listeners.

#### Required Capabilities
1. **Arrow Key Matrix Traversal**:
   - `ArrowUp` / `ArrowDown`: Moves active cursor to previous/next worker row.
   - `ArrowLeft` / `ArrowRight`: Moves active cursor to previous/next day column (1 to 31).
   - `Home` / `End`: Jumps to Day 1 / Last day of month.
   - `PageUp` / `PageDown`: Jumps up/down by 5 worker rows.
   - `Tab` / `Shift+Tab`: Cycles through cells sequentially.
2. **Single-Key Rapid Shift Entry**:
   - `m` or `M`: Sets `M12` (subsequent presses cycle `M12 -> M8 -> M16 -> M12`).
   - `n` or `N`: Sets `N12` (subsequent presses cycle `N12 -> N8 -> N16 -> N12`).
   - `a` or `A`: Sets `A8` (subsequent presses cycle `A8 -> A12 -> A8`).
   - `d` or `D`: Sets `D` (Day standby).
   - `o` or `O` or `Backspace` or `Delete`: Sets `O` (Off).
   - `h` or `H`: Sets `OND` (Holiday On-Duty).
   - `Space` or `Enter`: Opens the Radial / Floating Quick Picker at the focused cell.
   - `Ctrl+Z` / `Cmd+Z`: Undo last shift edit or batch paint.
   - `Ctrl+Y` / `Cmd+Shift+Z`: Redo shift edit.
   - `Escape`: Deselects current cell / closes active picker.
3. **Cockpit Visual Focus Reticle**:
   - High-contrast glowing focus outline (`ring-2 ring-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.6)]`).
   - Coordinate HUD indicator showing: `[ Worker Name • Day X (Weekday) • Current Shift: M12 • OT: 4h ]`.
   - Collapsible Keyboard Shortcut Cheat Sheet pill in the scheduler toolbar.

---

### 3.3 Feature 3: Radial / Floating Quick Picker

#### Current Status
- Currently, clicking a cell opens `activeCellEditor` (`App.tsx:11653-11790`), which is a rectangular popover with text and a basic recommendation box.
- Layout is generic rectangular card rather than a bespoke one-touch radial/dock picker.

#### Required Capabilities
1. **Radial / Speed-Dial Cockpit Architecture**:
   - Triggered on single click or `Space`/`Enter` on focused cell.
   - Spawns a circular or arc speed-dial directly centered around the cell coordinates.
   - Core shift buttons positioned equidistant in high-frequency ergonomic order:
     - Top: `M12` (Cyan Morning 12h)
     - Top-Right: `M8` (Morning 8h)
     - Right: `A8` / `A12` (Amber Afternoon)
     - Bottom-Right: `N8` (Night 8h)
     - Bottom: `N12` (Crimson Night 12h)
     - Bottom-Left: `OND` (Cyan Holiday On-Duty)
     - Left: `D` (Steel Standby Day)
     - Center/Top-Left: `O` (Dim Slate Off)
2. **Instant Complementary Pair AI Suggestion**:
   - Inspects the worker's paired colleague(s) in the same role for that specific day.
   - If colleague has `M12`, prominent hero badge at the top of the picker highlights:
     `⚡ คู่กะ [สมชาย] เข้า M12 -> แนะนำ N12 (ครอบคลุม 24 ชม.) [คลิกเดียวใส่ทันที]`.
   - If colleague is `O`, suggests `M12` to maintain coverage.
   - Real-time safety validation indicator: displays green checkmark if safe, or warning badge if assigning this shift causes weekly OT > 36h or rest period < 11h.
3. **Micro-Interactions**:
   - Fluid spring opening using `motion/react`.
   - Keyboard accelerator shortcuts visible on each radial wedge.

---

### 3.4 Feature 4: Drag-and-Drop Shift Swap

#### Current Status
- **0% implemented**.
- Swapping shifts between workers currently requires manually opening Worker 1's cell, changing shift, opening Worker 2's cell, and changing shift.

#### Required Capabilities
1. **Interactive Drag & Drop Mechanics**:
   - Any populated shift cell can be dragged (`draggable={true}` or Pointer Drag).
   - Dragging a shift chip (e.g. Worker A, Day 5: `M12`) over another worker's shift cell (e.g. Worker B, Day 5: `N12`) displays:
     - Animated ghost preview of the drag chip with blue halo.
     - Target cell pulsing amber/cyan drop zone (`border-dashed border-2 border-cyan-400 bg-cyan-500/20`).
2. **Immediate Pre-Drop Validation Engine (`validateShiftSwap`)**:
   - Before the drop is committed (and on hover over target cell), the engine evaluates:
     1. **Rest Period Conflict**: Does swapping `N12` to Worker A leave < 11h rest before or after adjacent days?
     2. **Weekly OT Cap**: Does the swap cause Worker A or Worker B to exceed 36 hours of OT in that 7-day window?
     3. **Consecutive Days**: Does either worker exceed 6 consecutive work days without a rest day?
     4. **Department Role Coverage**: Does the swap maintain the required daily role coverage?
3. **Visual Feedback & Execution**:
   - Floating Swap Validation Pill appears above the cursor:
     - ✅ **Green**: `สลับกะปลอดภัย (M12 ⇄ N12) • ชั่วโมง OT สอดคล้องกฎหมาย`
     - ⚠️ **Amber/Red**: `เตือน: สมชาย จะมี OT เกิน 36 ชม./สัปดาห์ (38 ชม.)`
   - On drop: Atomically swaps both shift values in `state.employees`, recalculates monthly overtime payroll and department budget immediately, and registers the action in the undo history stack.

---

## 4. Architectural Design & State Management

### 4.1 Component Modularization Strategy

To keep code maintainable, performant, and clean, the Shift Scheduler should be structured under `src/components/ShiftScheduler/`:

```
src/components/ShiftScheduler/
├── ShiftSchedulerContainer.tsx      # Main wrapper, toolbar, KPI metrics, view toggles
├── ShiftMatrixGrid.tsx              # Sticky grid container, day headers, department summary columns
├── ShiftRoleGroup.tsx               # Collapsible/organized role section
├── ShiftRow.tsx                     # Individual worker row with avatar, alerts, summary cells
├── ShiftCell.tsx                    # Individual day cell (drag handle, focus cursor, mismatch styles)
├── ShiftRadialPicker.tsx            # Radial / floating quick picker speed dial
├── ShiftPaintBar.tsx                # Tactile paint brush tool & active palette selector
├── ShiftSwapPreviewModal.tsx        # Pre-swap confirmation / audit warning dialog
├── hooks/
│   ├── useShiftGridHotkeys.ts       # Arrow key navigation & single-key hotkey dispatcher
│   ├── useShiftDragPaint.ts         # Drag-to-paint & marquee selection manager
│   ├── useShiftDragSwap.ts          # HTML5/Pointer drag-and-drop shift swap manager
│   └── useShiftHistory.ts           # Undo/Redo stack manager (Ctrl+Z / Ctrl+Y)
└── utils/
    ├── shiftValidation.ts           # Swap validation, rest-gap rules, 36h weekly OT checks
    └── shiftCalculations.ts         # Reusable payroll, OT hours, diff calculation helpers
```

---

### 4.2 State Flow & Undo/Redo Engine

```
[ User Input Action ]
  ├── Drag-to-Paint (multi-cell)
  ├── Keyboard Hotkey (focused cell)
  ├── Radial Quick Picker (single cell / complementary pair)
  └── Drag-and-Drop Swap (atomic 2-cell swap)
          │
          ▼
[ Shift Action Dispatcher ]
  ├── Push previous state snapshot to Undo Stack
  ├── Clear Redo Stack
  ├── Apply immutable shift mutation
  │     ├── Update employees[].shifts / employees[].planShifts
  │     └── Recalculate OT hours, holiday days, payroll breakdown
          │
          ▼
[ UI Update & Feedback ]
  ├── Real-time grid re-render (< 16ms frame budget)
  ├── Live budget utilization calculation update
  ├── Sound/Tactile micro-interaction feedback
          │
          ▼
[ Background Persistence ]
  └── Debounced POST /api/save-shifts to Cloudflare D1
```

---

## 5. Verification & Test Plan for R2

To guarantee 100% test pass rate and prevent regressions against existing Tiers 1–4 tests:

| Test Category | Target Suite | Test Scenarios |
|---|---|---|
| **Drag-to-Paint & Range Selection** | `tests/tier4-workflows/shift-drag-paint.test.tsx` | - Dragging across 5 consecutive days paints `M12` to all 5 cells.<br>- 2D marquee selection selects rectangular block of 3 workers x 4 days.<br>- Mass-assigning `N12` to selected range updates all cells and recalculates OT. |
| **Keyboard Navigation & Hotkeys** | `tests/tier4-workflows/shift-keyboard-hotkeys.test.tsx` | - Arrow keys navigate across cells (up, down, left, right).<br>- Pressing `M` sets `M12`, pressing `N` sets `N12`, pressing `O` sets `O`.<br>- Pressing `Ctrl+Z` reverses previous hotkey edit.<br>- Pressing `Space` opens radial picker. |
| **Radial Quick Picker** | `tests/tier4-workflows/shift-radial-picker.test.tsx` | - Opens radial picker at cell coordinates.<br>- Complementary pair suggestion displays correct counter-shift (e.g. `N12` for `M12`).<br>- Clicking smart pair button assigns suggested shift immediately. |
| **Drag-and-Drop Shift Swap** | `tests/tier4-workflows/shift-drag-swap.test.tsx` | - Dragging Worker A Day 3 (`M12`) onto Worker B Day 3 (`N12`) swaps their shifts.<br>- Validates against >36h weekly OT rule and emits warning if violated.<br>- Atomic rollback when swap is invalid or cancelled. |
| **Non-Regression Invariants** | Existing test suites (`tier1-calculations`, `tier2-responsive`, `tier4-workflows`) | - Preserves strict 368px desktop summary width.<br>- Preserves sticky left worker column (`w-56`, `z-10`).<br>- 184/184 tests continue to pass with 0 errors. |

---
