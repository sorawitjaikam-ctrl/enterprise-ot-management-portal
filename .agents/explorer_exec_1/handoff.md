# Handoff Report — explorer_exec_1

## 1. Observation

### 1.1 Baseline System Integrity
- **Test Suite**: Executed `npx vitest run`. Result: **43 passed test files, 353 total tests passed** in 56.89s with 0 failures.
- **Production Build**: Executed `npm run build` (`vite build && esbuild server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs`). Result: compiled in 11.11s with **0 TypeScript and 0 Vite bundle errors**.

### 1.2 View Organization and Dashboard Layout in `src/App.tsx`
- In `src/App.tsx`, active view is tracked via state:
  ```typescript
  // src/App.tsx:2661-2662
  const [activeTab, setActiveTab] = useState<string>(getInitialTabFromUrl);
  useUrlRouting(activeTab, setActiveTab);
  ```
- The application renders views conditionally inside `<main id="main-content" ...>` (lines 5948–11350):
  - `activeTab === "dashboard"` (lines 5953–7063, ~1,110 lines)
  - `activeTab === "job_value" || activeTab === "jobValue"` (lines 7068–7744)
  - `activeTab === "reports"` (lines 7745–8318)
  - `activeTab === "employees"` (lines 8319–9206)
  - `activeTab === "shifts"` (lines 9207–10738)
  - `activeTab === "hr-editor"` (lines 10739–10758)
  - `activeTab === "ot-records"` (lines 10759–10768)
  - `activeTab === "leave-records"` (lines 10769–10778)
  - `activeTab === "settings"` (lines 10779–11209)
  - `activeTab === "admin-permissions"` (lines 11210–11342)
  - `activeTab === "profile"` (lines 11343–11400)
- Within `{activeTab === "dashboard" && (...)` (lines 5953–7063), the current dashboard layout consists of 7 major sections:
  1. **Control Header & Toolbar** (5956–6073): Title, Month filter, Department filter, Role filter, and 4 quick action buttons ("จัดตารางกะพนักงาน", "คำขอ OT", "ส่งออกรายงาน", "รายชื่อพนักงาน").
  2. **Row 1: 4 KPI Bento Tiles** (6193–6305): MoM Overtime Pay Comparison, Total Overtime Financial Spend (THB), Overtime Payroll Ratio (%), Average Overtime Workload (hrs/emp).
  3. **Row 2: Fatigue & Compliance Telemetry Banner** (6310–6349): Warning banner for workers exceeding 36h/week or 6 consecutive shifts.
  4. **Row 3: 10-Month Financial Dynamics Chart & Dept Overtime Allocation** (6355–6534): Grouped bar chart (Jan–Oct 2026) with interactive toggles + department progress bars.
  5. **Row 4: Operating Roles Distribution & Watchlist** (6539–6676): 10 operating roles OT distribution + top 4 individual employee contributor cards.
  6. **Row 5: Cause-and-Effect Driver Tree (F3.1)** (6678–6845): 4-tier cost flow (Shift distribution -> OT hours -> Multiplier engine -> Total financial outlay).
  7. **Row 6: Department Cost Driver Ranking (F3.2) & Coverage Gap Sensitivity (F3.3)** (6850–7056): Department variance (&Delta;THB, &Delta;%) vs budget + staffing coverage index & hazard levels (LOW, MODERATE, HIGH, CRITICAL).

### 1.3 URL Routing Mechanics in `src/hooks/useUrlRouting.ts`
- `src/hooks/useUrlRouting.ts` defines explicit bidirectional tab-to-path mappings:
  ```typescript
  // src/hooks/useUrlRouting.ts:3-15
  export const TAB_TO_PATH: Record<string, string> = {
    dashboard: "/",
    reports: "/reports",
    shifts: "/shifts",
    employees: "/employees",
    job_value: "/job-value",
    "leave-records": "/leave-records",
    "ot-records": "/ot-records",
    "hr-editor": "/hr-editor",
    "admin-permissions": "/admin-permissions",
    settings: "/settings",
    profile: "/profile",
  };
  ```
- In `src/hooks/useUrlRouting.ts:74-82`:
  ```typescript
  const targetPath = TAB_TO_PATH[activeTab] || `/${activeTab}`;
  const currentPath = normalizePathname(window.location.pathname);
  if (currentPath !== targetPath && currentTab !== activeTab) {
    window.history.pushState({ tab: activeTab }, "", targetPath);
  }
  ```
- In `tests/tier2-responsive/url-routing.test.tsx`:
  - `it("maps all 11 views bidirectionally")` verifies `TAB_TO_PATH["dashboard"] === "/"` and `PATH_TO_TAB["/"] === "dashboard"`.
  - `it("supports alias /dashboard for dashboard tab")` verifies `PATH_TO_TAB["/dashboard"] === "dashboard"`.
  - `it("pushes state when activeTab changes")` asserts `pushState({ tab: "shifts" }, "", "/shifts")`.
  - `it("responds to popstate events")` asserts popstate back/forward transitions.

### 1.4 Design System and Constraint Invariants
- `tests/tier1-calculations/radical-minimalism-design-tokens.test.ts`:
  - `it("R1.1: 0 emojis exist anywhere across frontend UI and codebase")`: Enforces regex `/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1FA00}-\u{1FAFF}]|[\u{2300}-\u{23FF}]|[\u{2B50}]|[\u{1F004}]/u` across all `.ts`, `.tsx`, and `.css` files in `src/`. Zero emojis permitted.
  - `it("R1.2: 0 Google Material Symbols or raw material-icons exist in reusable components")`: Requires Lucide React vector icons exclusively.
  - `it("R1.3: Component styles conform to the 12-token maritime design system palette")`:
    - Navy Primary: `#0E3A66`, Supporting Blues: `#17538F`, `#2E90CB`, `#9FCEE8`, `#E8F3FA`
    - Semantic Accents: Green `#1E9C6E`, Yellow `#D99B14`, Red `#B3352C`
    - Semantic Variants: `#FCF3DE`, `#F3D98F`, `#E8F6F0`, `#A5DCC5`, `#FBEAEA`, `#F4B8B4`
    - Neutrals: `#333B41`, `#59656D`, `#6A7B87`, `#B4C1C9`, `#DCE4EA`, `#F3F6F8`, `#FFFFFF`
  - `it("R1.4: Design enforces hairline borders (1px solid #DCE4EA) and flat minimal surfaces")`
  - `it("R1.5: Micro-copy enforces ruthless brevity on standard UI action triggers (<= 4 words)")`
  - `it("R1.6: Section headers enforce concise editorial typography (<= 6 words)")`
  - `it("R1.7: Form placeholders enforce compact descriptions (< 5 words)")`

---

## 2. Logic Chain

1. **Routing Compatibility**:
   - `TAB_TO_PATH` and `PATH_TO_TAB` cannot change without breaking `tests/tier2-responsive/url-routing.test.tsx:61-85`.
   - `activeTab` must remain `"dashboard"` when viewing either Executive or Operational mode.
   - Therefore, the distinction between Executive and Operational modes cannot be a new top-level tab in `TAB_TO_PATH`.
   - Instead, the mode must be handled as a sub-mode of the `"dashboard"` view (e.g., `dashboardMode: "executive" | "operational"`).

2. **URL Synchronization Mechanism**:
   - `useUrlRouting` inspects only `window.location.pathname` via `normalizePathname(window.location.pathname)`.
   - When `activeTab === "dashboard"`, `targetPath` is `"/"`.
   - Appending or parsing URL search parameters (such as `/?mode=executive` or `/?mode=operational`) does NOT change `window.location.pathname` (which remains `"/"`).
   - In `src/App.tsx:2662`, `currentPath !== targetPath && currentTab !== activeTab` evaluates to `false` when on `"/"` with query parameters. Thus, `useUrlRouting` does not overwrite or wipe query params.
   - When the user toggles the mode, using `window.history.replaceState({ tab: "dashboard", mode: newMode }, "", "/?mode=" + newMode)` smoothly synchronizes the URL without adding an unwanted browser history jump, while preserving deep linking, bookmarks, and refresh persistence.
   - On initial load:
     ```typescript
     const [dashboardMode, setDashboardMode] = useState<"executive" | "operational">(() => {
       if (typeof window !== "undefined") {
         const modeParam = new URLSearchParams(window.location.search).get("mode");
         if (modeParam === "operational" || modeParam === "executive") return modeParam;
       }
       return "executive"; // Default per prompt mandate
     });
     ```

3. **Content Segmentation (Executive vs Operational)**:
   - **Executive Mode** (Mandated by R1, R2, R3, R4):
     - Targets C-level management, terminal directors, and financial controllers.
     - **R4 Strategic Action Hub**: One-click batch approvals for pending OT requests, one-click Board Summary export ("รายงานสรุป C-Level"), and quick risk remediation shortcut.
     - **R2 Month-End Budget Forecast & Burn Rate**: Trajectory projection card comparing daily spend velocity (฿/day) against total monthly budget cap, projected month-end spend, and variance forecast.
     - **R3 Advanced Risk & Fatigue Radar**: Proactive risk matrix categorizing departments and key roles (CRITICAL, HIGH, MODERATE, LOW) by staffing coverage index, fatigue velocity, and projected safety violations before they occur.
     - **Strategic Cost Drivers**: 4 Core KPI tiles + Cause-and-Effect Driver Tree (F3.1) + Department Cost Driver Ranking (F3.2).
     - *Excludes*: Individual worker cards, raw daily hour tables, and tactical shift configuration buttons.
   - **Operational Mode**:
     - Targets shift supervisors, planners, and dispatchers.
     - **Tactical Overview**: 4 tactical KPI tiles + Operational filters (Month, Department, Role).
     - **Fatigue & Compliance Telemetry Banner**: Real-time worker-level fatigue alerts (>36h, >6 consecutive days).
     - **Workload & Hours Distribution**: 10-Month Financial Dynamics Chart + Department Overtime Allocation Progress Bars (raw hours & headcount).
     - **Tactical Roster Surveillance**: 10 Operating Roles Distribution + Top Overtime Contributors Watchlist (individual employee cards with actual vs target 48h limit).
     - **Operational Sensitivity**: Coverage Gap & Fatigue Sensitivity Analysis (F3.3).

4. **Responsive Layout Design**:
   - Toggle control: Designed as a sleek segmented control button group (`role="group"`, `aria-label="Dashboard View Mode"`) styled with `#0E3A66` active state, `#DCE4EA` borders, and `#6A7B87` inactive text.
   - On desktop (1024px+): Flex row layout beside control toolbar; buttons display full labels with Lucide icons (`Briefcase` for Executive, `Activity` for Operational).
   - On mobile (375px–430px): Full-width toggle row with `flex-1` buttons, touch-friendly min-height (`min-h-[38px]`), ensuring clean wrapping without text clipping.
   - Bento layout: Uses Tailwind grid `grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 lg:gap-6` adhering strictly to tests verifying `.grid`, `grid-cols-1`, and `md:grid-cols-...` (`tests/tier2-responsive/tablet-768px-layout.test.tsx:18-32`).

---

## 3. Caveats

1. **Inline Rendering vs Modular Component Decomposition**:
   - `src/App.tsx` is currently 14,717 lines. While all dashboard code currently resides inline in `App.tsx` (lines 5953–7063), inlining the entire new Executive view directly in `App.tsx` would add hundreds of lines to an already large file.
   - *Recommendation*: Implement dedicated sub-components in `src/components/dashboard/` (or clean components in `src/components/`, e.g., `ExecutiveDashboardView.tsx`, `OperationalDashboardView.tsx`, or modular cards: `BudgetForecastCard.tsx`, `RiskRadarCard.tsx`, `StrategicActionHub.tsx`) and import them into `App.tsx`.
2. **State Dependencies**:
   - The dashboard relies on `state.employees`, `state.departments`, `state.shiftConfig.currentMonth`, `otRequests`, and helper functions (`getEmpCalculatedOt`, `getEmpCalculatedOtPay`, `getEmpShiftsArray`, `normalizeDeptId`, `getDeptName`).
   - When refactoring into modular components or functions, all calculation helpers must be passed as props or imported from shared utilities (`src/utils/`) to prevent duplicate calculation drift.
3. **Preservation of Existing Test Invariants**:
   - Several responsive tests (`tablet-768px-layout.test.tsx`, `challenger-m2-responsive-stress.test.tsx`) render `<App />` and check for the presence of responsive grid containers (`.grid`, `grid-cols-1`, `md:grid-cols-...`). Both Executive and Operational layouts MUST maintain responsive grid classes so tests pass regardless of initial mode.

---

## 4. Conclusion

1. **Mode Toggle Integration**:
   - Implement `const [dashboardMode, setDashboardMode] = useState<"executive" | "operational">("executive")` in `src/App.tsx`.
   - Synchronize with the URL via `window.history.replaceState` using query parameter `?mode=executive` / `?mode=operational`.
   - Preserve `TAB_TO_PATH["dashboard"] = "/"` and `PATH_TO_TAB["/"] = "dashboard"` untouched to ensure zero regressions in `useUrlRouting` and its 7 unit tests.

2. **Executive Mode Architecture**:
   - Implement the Executive Mode layout prioritizing:
     1. **R4 Strategic Action Hub**: One-click batch approval for pending OT requests, one-click Board Summary export, and risk remediation shortcut.
     2. **R2 Month-End Budget Forecast & Burn Rate**: Real-time burn rate velocity gauge (฿/day), projected month-end OT expenditure vs monthly budget cap, and overrun risk classification.
     3. **R3 Advanced Risk & Fatigue Radar**: Proactive risk matrix categorizing departments (CRITICAL, HIGH, MODERATE, LOW) by staffing coverage index, fatigue accumulation rate, and imminent labor law breach warnings.
     4. **Strategic Cost Drivers**: 4 High-Level Bento KPI Tiles, Shift-to-Cost Driver Tree (F3.1), and Department Variance Ranking (F3.2).

3. **Operational Mode Architecture**:
   - Retain the tactical operational components: tactical filters, 4 tactical KPI tiles, 10-month financial dynamics bar chart, department raw OT hours, 10 operating roles distribution, top individual worker watchlist cards, and operational fatigue alerts.

4. **Maritime Design & Zero Emoji Standard**:
   - 100% adherence to the 12-token maritime design system palette (`#0E3A66`, `#17538F`, `#2E90CB`, `#9FCEE8`, `#E8F3FA`, `#1E9C6E`, `#D99B14`, `#B3352C`, `#333B41`, `#59656D`, `#6A7B87`, `#DCE4EA`, `#F3F6F8`).
   - Zero emojis across all code, strings, tooltips, and exports, strictly using Lucide React icons.

---

## 5. Verification Method

### 5.1 Verification Commands
1. **Full Test Suite Execution**:
   ```pwsh
   npx vitest run
   ```
   *Expected Result*: All 43 test files and >=353 tests pass with 0 failures.

2. **Specific Route & Responsive Invariant Tests**:
   ```pwsh
   npx vitest run tests/tier2-responsive/url-routing.test.tsx
   npx vitest run tests/tier2-responsive/tablet-768px-layout.test.tsx
   npx vitest run tests/tier2-responsive/mobile-375px-layout.test.tsx
   npx vitest run tests/tier2-responsive/challenger2-navigation-invariants.test.tsx
   ```
   *Expected Result*: All navigation, routing, and responsive tests pass 100%.

3. **Zero-Emoji and Design Token Verification**:
   ```pwsh
   npx vitest run tests/tier1-calculations/radical-minimalism-design-tokens.test.ts
   ```
   *Expected Result*: 0 emojis and 0 raw material icons detected across `src/`.

4. **TypeScript & Production Build Verification**:
   ```pwsh
   npm run build
   ```
   *Expected Result*: Exit code 0, 0 TypeScript compilation errors, 0 Vite build errors.

### 5.2 Files to Inspect
- `src/App.tsx` (state declarations, dashboard mode toggle, conditional rendering)
- `src/hooks/useUrlRouting.ts` (routing mappings unchanged)
- `src/components/Navbar.tsx` (tab definitions unchanged)
- `src/index.css` (design token classes unchanged)

### 5.3 Invalidation Conditions
- Any change to `TAB_TO_PATH["dashboard"]` that does not equal `"/"`.
- Any failure in `npx vitest run` or `npm run build`.
- Insertion of any unicode emoji into `src/`.
