# Handoff Report: R2 Advanced Interactive Shift Entry & Scheduling Engine Survey

**Agent**: `explorer_survey_2`  
**Date**: 2026-08-23  
**Working Directory**: `C:\Users\ssrwj\Documents\antigravity\mysterious-einstein\.agents\explorer_survey_2`  
**Target Milestone**: Survey & Architectural Design for R2 (Advanced Interactive Shift Entry & Scheduling Engine)

---

## 1. Observation

1. **Shift Matrix & Rendering Code**:
   - `src/App.tsx` (lines 7590–8839) contains the active Shift Scheduler interface rendering.
   - Day cells are rendered at lines 8435–8504 using fixed dimensions:
     - 30 days: `35px` width, `40px` height
     - 14 days: `48px` width, `48px` height
     - 7 days: `56px` width, `56px` height
   - Cell interactions are currently limited to a single `onClick` handler (line 8454) that sets `activeCellEditor` state with coordinates (`x`, `y`), `emp`, and `dayIdx`.
   - The worker identity column is pinned sticky at `sticky left-0` with `w-56` and `z-10` (line 8379).
   - The department summary column block is strictly fixed at `w-[368px]` (lines 8093, 8295–8314) matching the five sub-columns: `56px + 64px + 80px + 96px + 72px`.

2. **Existing Cell Popover Editor**:
   - Lines 11653–11790 in `src/App.tsx` render `activeCellEditor` as a floating dark modal (`bg-slate-900/95`, `width: 310px`) positioned at `activeCellEditor.x`, `activeCellEditor.y`.
   - It contains a smart pair suggestion (lines 11699–11743) querying `getComplementaryShift(peerShift)` from `src/utils/shiftRecommendation.ts`, plus rows of shift buttons (`M8`, `M12`, `M16`, `A8`, `A12`, `N8`, `N12`, `N16`, `OND`, `D`, `O`) calling `handleDirectSaveShift`.

3. **Current Missing Interactive Capabilities**:
   - **Drag-to-Paint & Range Selection**: 0% present. `onPointerDown`, `onPointerEnter`, `onPointerUp`, and marquee rectangle drag selection do NOT exist anywhere in the shift matrix.
   - **Keyboard Hotkeys & Navigation**: 0% present. There are no `keydown` event listeners for grid navigation (arrow keys) or single-key hotkey shift entry (`M`, `N`, `D`, `O`, `A`, `H`) in the matrix. The only `keydown` listener in the entire app is in `Navbar.tsx` (lines 70–79) for `Escape`.
   - **Radial Quick Picker**: The current picker is a standard rectangular popover, not a one-touch radial/dock speed-dial.
   - **Drag-and-Drop Shift Swap**: 0% present. There is no `draggable` attribute or drop target handler on shift cells for swapping shifts between colleagues.

4. **Recommendation & Compliance Engine**:
   - `src/utils/shiftRecommendation.ts` (lines 1–308) already exports robust calculation and audit routines:
     - `SHIFT_DEFINITIONS` (line 16)
     - `getComplementaryShift(sourceShift)` (line 34)
     - `generateTwoTeamPairSchedules(totalDays)` (line 85)
     - `generateThreeTeamRotatingSchedules(totalDays)` (line 103)
     - `auditEmployeeShiftsCompliance(shifts, monthKey)` (line 132) — audits >36h weekly OT, >6 consecutive work days, and <11h rest gap
     - `analyzeDepartmentShiftCoverage(departmentEmployees, monthKey)` (line 221)
     - `generate4On2OffSchedule(totalDays, shiftCode, startOffset)` (line 296)

5. **Test Infrastructure Baseline**:
   - Vitest test suite (`npm test`) executed successfully with **184 passing tests across 25 test suites (100% pass rate)**.

---

## 2. Logic Chain

1. **Mass Shift Scheduling Bottleneck**:
   - Scheduling a month for a department with 10–20 workers requires entering 300–600 shift cells.
   - Because `App.tsx` only offers single-cell click popovers or an unwieldy modal form with numeric input fields, manual scheduling is slow and prone to fatigue.
   - Therefore, implementing pointer-based **Drag-to-Paint** and **2D Range Selection** directly on the grid matrix is essential to achieving high-speed data entry.

2. **Keyboard Ergonomics for Power Users**:
   - Supervisors and planners working on desktop devices expect arrow-key matrix navigation and single-key shortcuts (e.g. `M` for Morning, `N` for Night, `O` for Off).
   - Adding a focused cell coordinate state `[focusedEmpId, focusedDayIdx]` and listening to `keydown` events will enable planners to navigate and populate an entire month's shifts without touching the mouse.

3. **Radial / Speed-Dial vs Rectangular Popover**:
   - A radial speed-dial centered exactly over the clicked/focused cell minimizes mouse travel distance to equidistant radial wedges.
   - Coupling the radial picker with the existing `getComplementaryShift()` logic creates a 1-touch auto-pair experience with visual safety feedback.

4. **Safety-Guarded Shift Swapping**:
   - Shift swaps between paired workers happen frequently in maritime port operations due to leaves or overtime adjustments.
   - A drag-and-drop mechanism between cells with real-time pre-drop validation using `auditEmployeeShiftsCompliance` guarantees that supervisors cannot accidentally assign illegal schedules (>36h OT or <11h rest gap).

5. **Modular Architecture Necessity**:
   - `src/App.tsx` currently spans 12,280 lines. Adding complex pointer drag handlers, keyboard listeners, and drag-and-drop state directly into `App.tsx` would create maintenance debt and re-render performance bottlenecks.
   - Extracting the Shift Scheduler into dedicated modular components under `src/components/ShiftScheduler/` isolates state updates and guarantees maintainability while preserving all existing test contracts.

---

## 3. Caveats

1. **Touch Device Drag vs Scroll Invariant**:
   - On mobile/tablet devices, horizontal touch panning (`touch-pan-x`) is required to scroll across 30 days.
   - Drag-to-paint and drag-and-drop swap on touch screens must use explicit drag handles or toggleable paint modes so they do not conflict with natural touch scrolling.
2. **Desktop 368px Summary Invariant**:
   - Existing invariant tests (`tests/tier4-workflows/desktop-368px-invariants.test.tsx`) enforce exact 368px container width (`56px + 64px + 80px + 96px + 72px`) for the summary block on desktop. Any grid changes must strictly preserve this geometry.
3. **Database Sync Debouncing**:
   - Rapid drag-to-paint or hotkey entry can generate dozens of cell updates per second. State must update instantly in React state, while persistence calls to `/api/save-shifts` must be debounced or batched to prevent overwhelming the server.

---

## 4. Conclusion

1. **Existing Baseline**:
   - The codebase has foundational data structures, Thai labor calculations, and compliance audit functions, but **0% of the interactive drag/paint/hotkey/swap engine is currently implemented**.
2. **Implementation Roadmap for R2**:
   - **Component Decomposition**: Create `src/components/ShiftScheduler/` containing `ShiftSchedulerContainer`, `ShiftMatrixGrid`, `ShiftCell`, `ShiftRadialPicker`, and `ShiftPaintBar`.
   - **Custom Hooks**:
     - `useShiftGridSelection`: Drag-to-paint across days/workers & marquee selection.
     - `useShiftHotkeys`: Arrow navigation, single-key hotkeys (`M`, `N`, `D`, `O`, `A`, `H`), and undo/redo (`Ctrl+Z`, `Ctrl+Y`).
     - `useShiftDragSwap`: Drag-and-drop shift chip swapping with instant compliance validation.
   - **Radial Speed-Dial**: Replace rectangular popover with a bespoke tactile maritime radial speed-dial with 1-touch complementary pair suggestions.
   - **Comprehensive Automated Tests**: Add test suites covering drag-to-paint, hotkeys, radial picker, and shift swapping.

---

## 5. Verification Method

To independently verify the survey findings:

1. **Verify Baseline Test Pass**:
   ```bash
   npm test
   ```
   *Expected*: All 184 tests pass cleanly with 0 errors.

2. **Verify Absence of Drag & Hotkey Handlers**:
   - Check `src/App.tsx` for `onPointerDown`, `onDragStart`, or `keydown` in the shift matrix section (lines 7590–8839): None exist.
   - Check cell `onClick` handler (line 8454): Only sets `activeCellEditor`.

3. **Verify Shift Recommendation Engine**:
   - Inspect `src/utils/shiftRecommendation.ts` (lines 34–80, 124–205) to verify `getComplementaryShift` and `auditEmployeeShiftsCompliance` are available and ready to power R2 features.

4. **Verify Detailed Design Documentation**:
   - Inspect `C:\Users\ssrwj\Documents\antigravity\mysterious-einstein\.agents\explorer_survey_2\analysis.md`.
