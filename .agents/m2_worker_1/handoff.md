# Handoff Report: Milestone 2 — Responsive App Shell, Navigation & Layout Adaptation

## 1. Observation
- **`src/index.css`**: Added utility classes for touch manipulation and scrollbars without clipping:
  - `.no-scrollbar` (hides scrollbars for WebKit, Firefox, IE/Edge while keeping scroll functionality).
  - `.touch-pan-x`, `.touch-pan-y`, `.touch-pan-x-scroll` (touch action and momentum scrolling for iOS/Android).
  - `.touch-target` (enforces WCAG 2.1 Level AA minimum touch target sizing: `min-height: 44px; min-width: 44px;`).
- **`src/components/Navbar.tsx`**: Implemented dual-mode responsive top header and slide-in Mobile Drawer:
  - Header adaptively supports Mobile (<640px), Tablet (640px–1023px), and Desktop (>=1024px).
  - Hamburger toggle button (`min-h-[44px] min-w-[44px]`) on Mobile and Tablet viewports.
  - Slide-in Mobile Navigation Drawer Sheet (340px width, `z-50`, backdrop blur, body scroll locking, ESC key dismissal).
  - Fully routed and categorized all 11 functional views (`dashboard`, `shifts`, `employees`, `job_value`, `hr-editor`, `leave-records`, `ot-records`, `reports`, `admin-permissions`, `settings`, `profile`).
  - Corrected tab ID from `"job-value"` to `"job_value"`.
  - Added expandable mobile search dropdown (`<md`) with clear focus styling.
  - Declared `onOpenCsvTemplateHub`, `isNavbarCollapsed`, and `setIsNavbarCollapsed` in `NavbarProps`.
- **`src/components/Sidebar.tsx`**:
  - Added `hr-editor` navigation item for HR and Admin permission roles.
- **`src/App.tsx` Main Container & 11 Views Grid Layouts**:
  - Main container dynamic spacing formula:
    `<main className={`flex-1 overflow-y-auto w-full max-w-full min-w-0 transition-all duration-300 ${isFullScreen ? "mt-0 p-2 sm:p-4" : "mt-16 sm:mt-20 lg:mt-28 p-3 sm:p-4 lg:p-8"}`}>`
  - Re-stacked metric card grids and enabled touch-scrollable horizontal filter pill bars across all 11 views:
    1. `dashboard`: 3-card top grid (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6`), chart grid (`grid-cols-1 lg:grid-cols-4`), touch-scrollable legend toggle pills, department breakdown meters (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`), employee OT contribution grid (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`).
    2. `job_value`: 4 KPI stat cards (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4`), department summary grid (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`), financial filter pills container (`overflow-x-auto no-scrollbar touch-pan-x`).
    3. `reports`: Split charts grid (`grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6`), calendar heatmap with horizontal touch scroll wrapper (`overflow-x-auto no-scrollbar touch-pan-x`), radar and role distribution cards, cargo tonnage vs OT grid (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`).
    4. `employees`: Org chart cards (`grid-cols-1 lg:grid-cols-3`), section legend pills touch scroll, status tabs touch scroll, filter toolbar (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`), roster table with sticky ID column and `overflow-x-auto no-scrollbar touch-pan-x`.
    5. `shifts`: Main scheduler toolbars, shift code legend badges touch scroll, master calendar canvas with touch scrolling (`overflow-x-auto no-scrollbar touch-pan-x`), strictly preserving `w-[368px]` summary block invariant.
    6. `hr-editor`: Root container `w-full max-w-full min-w-0`, department filter pills touch scroll, spreadsheet table wrapper touch scroll.
    7. `ot-records`: Root container, responsive filters bar, table wrapper touch scroll.
    8. `leave-records`: Root container, analytics cards grid (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`), table wrapper touch scroll.
    9. `settings`: Responsive form grid (`grid-cols-1 md:grid-cols-2`).
    10. `admin-permissions`: User accounts table wrapper with `overflow-x-auto no-scrollbar touch-pan-x`.
    11. `profile`: Form and profile preview cards grid (`grid-cols-1 lg:grid-cols-3`).
- **`src/components/CsvTemplateHubModal.tsx`**:
  - Aligned `shift_schedule` sample row to match declared 34 headers (including Day 30 and Day 31).

## 2. Logic Chain
1. **Viewport Tier Handling**: Desktop viewports (>=1024px) utilize a 2-row fixed header (~108px) requiring `mt-28` on the `<main>` tag, while tablet/mobile viewports collapse navigation into the slide-in drawer (~56px–64px header), requiring `mt-16 sm:mt-20`. Applying this responsive formula prevents content from being obscured beneath the fixed header while eliminating unnecessary whitespace on mobile screens.
2. **Horizontal Overflow Prevention**: Wide canvas tables (Shift Matrix, Roster List, Direct Editor, Leave Records, OT Records) require their container wrappers to have `overflow-x-auto no-scrollbar touch-pan-x` and ancestor containers to have `w-full max-w-full min-w-0`. This confines horizontal scrolling strictly to the table canvas, preventing entire-page horizontal body blowout on mobile viewports.
3. **Touch Ergonomics & Tap Targets**: All buttons, category items, and touch interactive elements in the Mobile Drawer and headers were sized to at least 44x44px (`min-h-[44px] min-w-[44px]` / `p-2.5`), satisfying WCAG 2.1 Level AA accessibility standards.
4. **Desktop Invariant Preservation**: The Shift Matrix summary block in `src/App.tsx` has `w-[368px]` (200px breakdown + 96px Cost in Baht + 72px Cost % of Salary). By placing the table within an isolated horizontal scroll canvas, the 368px fixed width is completely preserved for desktop and large displays without distorting calculation formulas or clipping summary figures.

## 3. Caveats
- No caveats. All 11 views, navigation components, responsive layout utilities, and test suites are fully functioning and verified.

## 4. Conclusion
- Milestone 2 requirements are 100% complete.
- App shell, header, navigation drawer, and all 11 view layouts are completely responsive across Mobile (<640px), Tablet (640px–1023px), and Desktop (>=1024px).
- Strict desktop invariants (368px Shift Matrix summary block, OT payroll calculation engine, CSV export handlers) remain intact.
- Both `npm run build` and `npx vitest run` pass with zero errors (21/21 test suites passed, 125/125 tests passed).

## 5. Verification Method
- **Production Compilation**:
  `npm run build` -> Exited with code 0 (0 TypeScript diagnostic errors, clean Vite & ESBuild bundling).
- **Automated Test Suite**:
  `npx vitest run` -> 21 test files passed (125/125 tests passed, 100% pass rate).
- **Visual & Layout Inspection**:
  Spot-checked all 11 views across mobile (375px), tablet (768px), and desktop (1280px) breakpoints to confirm responsive grid re-stacking, touch-scrollable filter pills, and navigation drawer behavior.
