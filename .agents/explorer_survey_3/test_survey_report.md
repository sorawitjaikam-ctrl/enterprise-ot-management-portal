# Test & Build Infrastructure Survey Report

**Project**: Enterprise OT Management Portal — Mobile & Tablet Responsive UI/UX & PWA Capabilities  
**Investigator**: Survey Explorer 3  
**Date**: 2026-08-22  
**Working Directory**: `C:\Users\ssrwj\Documents\antigravity\mysterious-einstein\.agents\explorer_survey_3`  
**Workspace Root**: `C:\Users\ssrwj\Documents\antigravity\mysterious-einstein`  

---

## Executive Summary

This survey comprehensively audits the **build toolchain**, **test infrastructure**, **state management architecture**, **data models & business calculations**, **responsive/PWA gaps**, and provides a complete **4-Tier testing harness roadmap** for the Enterprise OT Management Portal.

| Survey Dimension | Current State | Target Enhancement / Remediation |
| :--- | :--- | :--- |
| **Build & Dev Toolchain** | Vite 6.2.3, React 19, Tailwind CSS 4, tsx, esbuild, Cloudflare D1/Worker | Fast Vite build (~5.4s), but `npm run lint` (`tsc --noEmit`) has 21 typing errors |
| **Test Suites & Runner** | **0 test files** (0% test coverage) | Introduce **Vitest** for Unit/Integration and **Playwright** for Responsive E2E & PWA |
| **State Management** | Centralized React 19 State in `App.tsx` + `localStorage` + REST/D1 APIs | Modularize state hooks, ensure offline fallback and local cache synchronization |
| **Business Logic & Calculations** | Shift OT calculation, Budget utilization, Plan vs Actual diff, 368px summary widgets | Lock down unit tests for single source of truth calculations |
| **Mobile & Tablet Responsive** | Desktop-centric layouts; horizontal clipping on mobile/tablet | Panning matrix with frozen sticky column (`w-56`), 44x44px touch targets |
| **PWA & Offline Capabilities** | Missing Web App Manifest, Service Worker, and App Icons | Add standards-compliant Manifest, Service Worker caching, and install prompt |

---

## 1. Build Scripts, Dependencies & TypeScript Configuration

### 1.1 Package Scripts (`package.json`)
```json
{
  "name": "react-example",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "tsx server.ts",
    "build": "vite build && esbuild server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs",
    "start": "node dist/server.cjs",
    "clean": "rm -rf dist server.js",
    "lint": "tsc --noEmit"
  }
}
```

#### Observations:
1. **Missing Test Script**: There is no `"test"` or `"test:e2e"` script defined in `package.json`.
2. **Hybrid Server/Frontend Architecture**:
   - Development runs `tsx server.ts` where Express mounts Vite in middleware mode (`server.ts:1614`).
   - Production build compiles the frontend with `vite build` into `dist/`, then compiles the backend with `esbuild` into `dist/server.cjs`.
   - Cloudflare Pages / Workers deployment uses `wrangler.jsonc` (`pages_build_output_dir: "./dist"`), `functions/api/[[path]].ts`, and `worker.ts`.

### 1.2 TypeScript Configuration (`tsconfig.json`)
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "experimentalDecorators": true,
    "useDefineForClassFields": false,
    "module": "ESNext",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "isolatedModules": true,
    "moduleDetection": "force",
    "allowJs": true,
    "jsx": "react-jsx",
    "paths": {
      "@/*": ["./*"]
    },
    "allowImportingTsExtensions": true,
    "noEmit": true
  }
}
```

### 1.3 TypeScript Lint Audit (`npm run lint` / `tsc --noEmit`)
When executing `npm run lint`, 21 TypeScript errors were identified that need resolution during development:
1. `functions/api/[[path]].ts:16`: `PagesFunction` missing type declaration (`@cloudflare/workers-types` needed or explicit ambient type).
2. `src/App.tsx:55`: Cannot find module `./assets/login-bg.jpg` (needs `/// <reference types="vite/client" />` or `env.d.ts` declaration).
3. `src/App.tsx:341-373` & `src/main.tsx:57`: Class `ErrorBoundary` accessing `.props` and `.state` without generic `Component<Props, State>` inheritance recognition.
4. `src/App.tsx:4385`: `Navbar` invoked with `isNavbarCollapsed` and `setIsNavbarCollapsed` which were omitted from `NavbarProps` interface in `src/components/Navbar.tsx`.
5. `src/App.tsx:501-607`: Property access on `unknown` types in leave records data processing.

---

## 2. Test Infrastructure & Coverage Analysis

### 2.1 Existing Test Suite Inventory
- **Unit Tests**: `0` files.
- **Integration Tests**: `0` files.
- **E2E Tests**: `0` files.
- **Test Framework**: None installed in `node_modules` or `package.json`.

### 2.2 Recommended Test Toolchain
To achieve enterprise-grade test automation without bundle overhead:

1. **Vitest (`vitest`)**:
   - Seamlessly uses existing `vite.config.ts` and aliases (`@/*`).
   - Native ESM and TypeScript support with near-instant execution.
   - Compatible with `@testing-library/react` and `jsdom`.
2. **Playwright (`@playwright/test`)**:
   - Multi-device viewport testing (Mobile Chrome 375x667, 393x852, iPad 768x1024, Desktop 1440x900).
   - Native touch gesture emulation (touch panning, swipe, tap targets).
   - Service Worker and PWA offline simulation.

---

## 3. State Management & Data Models Analysis

### 3.1 State Architecture Overview
The application utilizes **hybrid client-server state management**:

```
┌─────────────────────────────────────────────────────────────┐
│                       React 19 State                        │
│   (useState in App.tsx, Navbar.tsx, CsvTemplateHubModal)    │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
        Sync / Fetch                    Persist / Cache
               ▼                              ▼
┌─────────────────────────────┐  ┌────────────────────────────┐
│      REST / D1 Database     │  │   Browser LocalStorage     │
│   • /api/portal-state       │  │   • currentUser            │
│   • /api/save-shifts        │  │   • isLoggedIn             │
│   • /api/save-ot-request    │  │   • collapsedCategories    │
│   • /api/job-value          │  │   • shiftRoleFilter        │
│   • /api/vessel-schedules   │  │   • shiftViewMode          │
└─────────────────────────────┘  └────────────────────────────┘
```

### 3.2 Data Models (`src/types.ts`)
1. **Department**: ID, name, Thai name, manager, headcount, OT hours, budget used, budget utilization percentage, status (`"On Track" | "Warning"`), icon.
2. **Employee**: ID, name, deptId, role, targetOt, actualOt, otPct, status, groupName, shifts (`string[]` or record by month), planShifts (`string[]`), salary, prefix, firstName, lastName, nickname, division, birthday, age, calculatedAge, startDate, tenure, probationDate, calendarType, resignationDate, employmentStatus (`"Active" | "Resigned"`).
3. **ShiftConfig**: `pattern`, `currentMonth`, `currentDept`.
4. **OtTrendData**: `months`, `lastYear`, `currentYear`.
5. **JobValueRecord**: `avgRevenue`, `avgCost`, `profit2026`, `profit2025`, `monthlyRevenue`, `monthlyCost`, `monthlyProfit`.
6. **LeaveRecord**: `employeeId`, `deptId`, `date`, `leaveType`, `note`.
7. **VesselSchedule**: `type` (`"vessel" | "crane"`), `planType` (`"plan" | "actual"`), `name`, `startDate`, `endDate`, `deptId`, `color`, `tonnage`.

### 3.3 Core Business Calculations & Constraints

#### 1. Shift Code to OT Hours Mapping (`App.tsx:122-130`, `server.ts:39-55`):
- `M8`, `A8`, `N8`: `0` OT hours (8-hour standard shifts).
- `M12`, `A12`, `N12`: `4` OT hours (12-hour shifts = 8h normal + 4h OT).
- `M16`, `N16`: `8` OT hours (16-hour shifts = 8h normal + 8h OT).
- `OND` (On Duty): `8` OT hours.
- `D` (ทอดสมอ), `O` (Off): `0` OT hours.
- Dynamic fallback: Any shift code matching `/\d+$/` computes `Math.max(0, hours - 8)`.

#### 2. Overtime Cost & Budget Utilization Formula (`functions/api/[[path]].ts:218-223`, `App.tsx:7870-7910`):
$$\text{Hourly OT Rate} = \frac{\text{Salary}}{240} \times 1.5$$
$$\text{Department OT Cost} = \sum_{\text{employee}} (\text{Actual OT Hours} \times \text{Hourly OT Rate})$$
$$\text{Budget Utilization \%} = \frac{\text{Department OT Cost}}{150,000 \text{ THB}} \times 100$$

#### 3. Plan vs Actual Shift Comparison & Plan Accuracy (`App.tsx:7620-7638`):
- Plan accuracy tracks whether `actualShift === planShift` on active operational days:
$$\text{Plan Accuracy \%} = \frac{\text{Matching Days}}{\text{Total Tracked Operational Days}} \times 100$$

#### 4. The 368px Desktop Layout Rule:
In the Shift Scheduling matrix (`App.tsx:7593, 7721-7746, 7784-7814`), the summary header and monthly breakdown columns are rigidly calibrated to **368px total width**:
- Monthly breakdown sub-columns (`w-[200px]`): Regular OT (`w-14` = 56px) + Holiday OT (`w-16` = 64px) + Holiday Work Days (`w-20` = 80px).
- Cost in Baht column (`w-24` = 96px).
- Cost % column (`w-18` = 72px).
- Total: $200\text{px} + 96\text{px} + 72\text{px} = 368\text{px}$.
- **Acceptance Criterion**: Desktop layout and the 368px summary widgets must remain 100% pixel-perfect without regression while adapting for mobile/tablet.

---

## 4. Mobile, Tablet & PWA Test Gaps

### 4.1 Responsive Viewport Gaps
1. **Mobile (375px–430px)**:
   - Top navigation bar (`Navbar.tsx`) is 2-row fixed desktop layout with overflow-x scrolling and fixed min-widths (`min-w-[260px]`). On iPhone SE (375px) and iPhone 14 (393px), search bar and profile badges cram together.
   - Shift matrix table requires horizontal panning container with frozen left identity column (`w-56`).
   - Cards and summary widgets must stack vertically (`grid-cols-1`).
2. **Tablet (768px–1024px)**:
   - Sidebar drawer toggle / overlay navigation needed to maximize horizontal scheduling workspace.
   - Summary cards need responsive 2-column or 3-column auto-wrapping (`md:grid-cols-2 lg:grid-cols-4`).

### 4.2 Touch Ergonomics Gaps
- Interactive shift picker cells and table buttons must maintain minimum **44x44px tap targets** (`min-h-[44px] min-w-[44px]`) to comply with Apple iOS Human Interface Guidelines and Google Material Design.
- Modals (`CsvTemplateHubModal.tsx`, Add/Edit Employee, Shift bulk edit) require easy swipe-down or large close action buttons accessible on mobile screens.

### 4.3 PWA & Offline Shell Gaps
1. **Manifest File**: Missing `manifest.webmanifest` / `public/manifest.json` with app title, short_name, icons (192px, 512px, maskable), theme color (`#0f172a`), display standalone mode.
2. **Service Worker**: Missing Service Worker registration in `src/main.tsx` and service worker caching script for static assets (`Cache-First`) and offline state (`Stale-While-Revalidate`).
3. **HTML Meta Configuration**: Missing mobile viewport enhancements (`viewport-fit=cover`, `mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`).
4. **Installability**: Missing "Add to Home Screen" prompt trigger and offline connectivity status badge.

---

## 5. Actionable 4-Tier Test Harness & Suite Recommendations

To guarantee 100% quality, reliability, and regression protection, we recommend implementing the following 4-Tier test suite:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   Tier 4: End-to-End User Journeys                     │
│  Playwright: Full Login, Shift Plan/Actual Toggle, CSV Export/Import   │
├────────────────────────────────────────────────────────────────────────┤
│                 Tier 3: PWA & Offline Shell Validation                 │
│  Playwright & Vitest: Manifest schema, SW caching, Offline shell       │
├────────────────────────────────────────────────────────────────────────┤
│             Tier 2: Mobile & Tablet Responsive Layout Tests            │
│  Playwright (375px/768px/1024px) & RTL: Touch targets, Sticky column   │
├────────────────────────────────────────────────────────────────────────┤
│              Tier 1: Core Calculation & Data Model Unit Tests          │
│  Vitest: Shift OT parsing, Salary formulas, Plan accuracy, 368px math  │
└────────────────────────────────────────────────────────────────────────┘
```

### Tier 1: Core Calculation & Data Model Unit Tests (Vitest)
- **Target File**: `src/__tests__/calculations.test.ts`
- **Scope**:
  1. `getShiftOt(code)` / `getShiftOtHours(code)` for all standard codes (`M8`, `A8`, `N8`, `M12`, `A12`, `N12`, `M16`, `N16`, `OND`, `D`, `O`) and arbitrary regex numbers (`M14` -> 6h, `N20` -> 12h).
  2. Hourly OT rate: `salary / 240 * 1.5`.
  3. Total OT cost & department budget utilization calculation.
  4. Employee age & tenure computation from birthdate and start date.
  5. Plan vs Actual shift variance calculation and Plan Accuracy percentage.
  6. Single source of truth validation for multi-month shifts JSON parsing (`getEmpShiftsArray`, `getEmpPlanShiftsArray`).

### Tier 2: Component & Responsive Layout Tests (Vitest + RTL & Playwright)
- **Target Files**: `src/__tests__/responsive-layout.spec.ts`, `src/__tests__/components/Navbar.test.tsx`
- **Scope**:
  1. **Mobile Viewport (375px - 430px)**:
     - Header brand, search input, and profile badge wrap cleanly without horizontal scroll blowout.
     - Collapsible category navigation expands/collapses properly on touch.
     - Touch targets for all buttons and interactive controls meet or exceed 44x44px.
  2. **Tablet Viewport (768px - 1024px)**:
     - Sidebar collapses cleanly or operates as an off-canvas drawer.
     - Metric cards re-flow into 2-column or 3-column grid.
  3. **Shift Matrix Frozen Sticky Columns**:
     - Panning horizontal container retains `sticky left-0` position on the employee identity column (`w-56`) during scroll.
     - Matrix header days align precisely with employee shift cells.

### Tier 3: PWA & Offline Verification Tests (Vitest + Playwright)
- **Target Files**: `src/__tests__/pwa-manifest.test.ts`, `src/__tests__/service-worker.spec.ts`
- **Scope**:
  1. `manifest.webmanifest` contains valid JSON, `name`, `short_name`, `start_url`, `display: standalone`, `theme_color`, `background_color`, and valid icon paths (192px, 512px).
  2. HTML `<head>` links `manifest.webmanifest`, `<meta name="theme-color">`, and Apple touch icons.
  3. Service Worker registration executes without error in browser environments.
  4. Offline test: Disconnecting network serves cached app shell (`index.html`, stylesheets, scripts) and displays offline fallback indicator.

### Tier 4: E2E User Flow & Desktop Integrity Regression Tests (Playwright)
- **Target File**: `src/__tests__/e2e-workflow.spec.ts`
- **Scope**:
  1. **Authentication Flow**: Login as Admin (`admin`/`admin123`) and Section Manager (`inter2_mgr`/`i2mgr1234`), role-based UI restriction verification.
  2. **Shift Management Flow**: Switch departments, edit shifts, switch between "Plan" and "Actual" views, verify Plan Accuracy metric update.
  3. **Desktop 368px Widget Alignment Integrity**:
     - Verify desktop view (>1280px) preserves exactly 368px summary widgets (`200px + 96px + 72px = 368px`).
     - Verify header summary column width equals 368px.
  4. **CSV Export & Import**:
     - Trigger `CsvTemplateHubModal`, download employee roster / shift schedule template, verify UTF-8 BOM encoding.
     - Test CSV upload and verify data updates without crashing.

---

## 6. Implementation Readiness Checklist

- [x] TypeScript compiler check executed and error catalog documented (21 errors identified).
- [x] Production build process verified (`vite build` + `esbuild server.ts` builds cleanly in ~5.4s).
- [x] State management and data models documented (`AppState`, `Employee`, `ShiftConfig`, `JobValueRecord`).
- [x] Core calculation algorithms and 368px alignment invariants cataloged.
- [x] Gaps for mobile (375–430px), tablet (768–1024px), touch ergonomics (44x44px), and PWA/Service Worker identified.
- [x] 4-Tier test harness architecture and test file specifications delivered.
