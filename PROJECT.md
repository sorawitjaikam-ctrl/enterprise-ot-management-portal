# Project: Enterprise OT Management Portal — Comprehensive 4-Module System Upgrade

## Architecture
The Enterprise OT Management Portal is an executive-grade React + TypeScript application built for maritime port terminal workforce management, shift scheduling, overtime calculation, labor law safety compliance, and cost analytics.
- **Frontend Stack**: React 18, TypeScript, Tailwind CSS, Lucide React icons, Vitest.
- **Design System**: 12-token maritime design system (`#0E3A66`, `#17538F`, `#2E90CB`, `#9FCEE8`, `#E8F3FA`, Semantic `#1E9C6E`, `#D99B14`, `#B3352C`, Neutrals `#333B41` through `#FFFFFF`). Absolute zero emojis.
- **Backend/State**: Node/Express with SQLite (`better-sqlite3`), Cloudflare Workers/D1 backend with offline fallback (`appState` in `server.ts`).

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| F1.1 | Shift OT to Job Value Integration | Connect shift overtime outputs (1.5x normal OT, 3.0x holiday OT, 1.0x holiday 8h) with base salary ($salary/240$) and operational value-add | M1 | ORIGINAL_REQUEST R1 |
| F1.2 | Role-level Economic Ratios | Compute operational cost, revenue, profit, and revenue/cost ratio aggregated by role | M1 | ORIGINAL_REQUEST R1 |
| F1.3 | Transparent Calculation Breakdown Modal | Inspectable day-by-day shift audit trail explaining exact Baht computation from raw shift codes | M1 | ORIGINAL_REQUEST R1 |
| F2.1 | Employee Status Management | Seamless viewing, filtering, editing, and status management (`Active`, `On-Leave`, `Resigned`) across all departments and positions | M2 | ORIGINAL_REQUEST R2 |
| F2.2 | Employee Backend Persistence Fix | Ensure `employmentStatus`, `resignationDate`, and offline `leave-records` filtering persist properly in `server.ts` | M2 | Survey Mod 2 & ORIGINAL_REQUEST R2 |
| F2.3 | Individual Profile Telemetry Dashboard | Responsive Bento detail cards showing accumulated shift hours, accurate OT earnings, fatigue status, leave history, and compliance alerts | M2 | ORIGINAL_REQUEST R2 |
| F3.1 | Shift-to-Cost Driver Tree | Visual hierarchy on Dashboard 01 showing how shift distributions (Standard M8/A8/N8 vs OT M12/N12/M16/M24) drive total OT hours and payout | M3 | ORIGINAL_REQUEST R3 |
| F3.2 | Department Cost Driver Ranking | Identify and rank departments as primary drivers of overtime spend and plan-vs-actual variance ($\Delta\text{Hours}, \Delta\text{THB}, \Delta\%$) | M3 | ORIGINAL_REQUEST R3 |
| F3.3 | Coverage Gap & Fatigue Risk Sensitivity | Correlate role staffing shortfalls with employee fatigue rates (>36h/week or 6 consecutive days) and operational bottleneck risk | M3 | ORIGINAL_REQUEST R3 |
| F4.1 | Traditional & Company Holiday Configuration | Configure and maintain company-designated traditional holidays (13-15 days/year preset + custom add/delete/toggle) | M4 | ORIGINAL_REQUEST R4 |
| F4.2 | Weekly Rest Day Policy Configuration | Configure weekly rest day policies (Sunday, Sat+Sun, 6-day workweek rotation, or department-specific schedules) | M4 | ORIGINAL_REQUEST R4 |
| F4.3 | Automated Matrix & Payroll Synchronization | Dates marked as company holidays or rest days automatically trigger holiday OT rates in shift matrix, payroll engine, and cost simulation HUD | M4 | ORIGINAL_REQUEST R4 |
| F5.1 | Full Invariant & Test Suite Pass | Maintain 100% automated test suite pass rate (314/314 Vitest tests, 0 failed across 40 test files) | M5 | ORIGINAL_REQUEST R5 |
| F5.2 | Zero-Emoji & Design System Compliance | 0 emojis anywhere across UI text or codebase, adhering to 12-token maritime design system | M5 | ORIGINAL_REQUEST R5 |
| F5.3 | Build & TypeScript Integrity | 0 TypeScript errors (`tsc --noEmit`), clean production build (`npm run build`) | M5 | ORIGINAL_REQUEST R5 |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Overtime, Job Value & Compensation Engine | Connect shift OT multipliers (1.5x, 3.0x, 1.0x) with Job Value metrics, role ratios, and calculation breakdown audit modal | None | DONE |
| M2 | Employee Roster & Profile Telemetry Dashboard | Status management (Active, On-Leave, Resigned), backend persistence fix, and individual profile telemetry cards | None | PLANNED |
| M3 | Cause-and-Effect Dashboard 01 with Driver Tree | Shift-to-cost driver tree, department cost driver ranking, coverage gap & fatigue risk sensitivity matrix | M1 | PLANNED |
| M4 | Company Holidays & Weekly Rest Day Configuration | Traditional holidays (13-15 days/yr), weekly rest day policies, and automated matrix/payroll synchronization | None | PLANNED |
| M5 | Final Comprehensive Verification & Forensic Audit | Full test suite verification (314/314), zero-emoji scan, lint, build, and forensic integrity audit | M1, M2, M3, M4 | PLANNED |

## Interface Contracts

### M1 ↔ Core Calculation & Types (`src/types.ts`, `src/App.tsx`) [VERIFIED & IMPLEMENTED]
- `EmployeeJobValueBreakdown`:
  - `employeeId: string`
  - `baseSalary: number`
  - `hourlyRate: number` ($salary / 240$)
  - `monthlyOtHours: number`
  - `monthlyOtPay: number`
  - `totalLaborCost: number` ($\text{baseSalary} + \text{monthlyOtPay}$)
  - `monthlyRevenue: number`
  - `operationalValueAdd: number` ($\text{monthlyRevenue} - \text{totalLaborCost}$)
  - `revenueCostRatio: number` ($\text{monthlyRevenue} / \text{totalLaborCost}$)
- `DailyShiftAuditRow`:
  - `day: number`
  - `dateStr: string`
  - `dayOfWeekTh: string`
  - `isHolidayOrRestDay: boolean`
  - `shiftCode: string`
  - `normalOtHours: number`
  - `holidayWorkHours: number`
  - `holidayOtHours: number`
  - `dailyPayThb: number`
  - `explanation: string`

### M4 ↔ Calendar, Shift Matrix & Payroll Synchronization
- `CompanyHoliday`:
  - `id: string`
  - `date: string` (YYYY-MM-DD)
  - `nameTh: string`
  - `nameEn: string`
  - `isCustom?: boolean`
- `DepartmentRestDayPolicy`:
  - `deptId: string`
  - `policyType: "sunday_only" | "sat_sun" | "rotating_6_1" | "custom"`
  - `customRestDays?: number[]` (0=Sun, 1=Mon, ..., 6=Sat)
- Multiplier functions accept optional `holidays?: CompanyHoliday[]` and `restDayPolicy?: DepartmentRestDayPolicy` with defaults ensuring 100% backward compatibility for all 314 tests.

### M2 ↔ Employee Data & Backend Persistence (`server.ts`, `src/App.tsx`)
- `Employee.employmentStatus`: `"Active" | "On-Leave" | "Resigned"`
- `server.ts` `/api/edit-employee` accepts and persists `employmentStatus` and `resignationDate`.
- `server.ts` `/api/leave-records` filters `appState.leaveRecords` by `employeeId` in offline mode.

### M3 ↔ Dashboard 01 Telemetry (`src/App.tsx`)
- Shift-to-Cost Driver Tree:
  - Tier 1: Total Shift Headcount / Days Worked
  - Tier 2: Distribution of shifts (Standard M8/A8/N8 vs Overtime M12/N12/M16/M24 vs OND/Splits)
  - Tier 3: Accumulation into Normal OT Hours ($1.5\times$), Holiday Work ($1.0\times$), Holiday OT ($3.0\times$)
  - Tier 4: Total Financial Outlay (THB) & Overtime-to-Payroll Ratio
- Department Cost Driver Ranking:
  - Ranked by `totalOtSpendThb` descending with `varianceHours`, `varianceCostThb`, `variancePct` (Plan vs Actual)
- Coverage Gap & Fatigue Risk Sensitivity:
  - Staffing Coverage Index ($(\text{Required} - \text{Actual}) / \text{Required}$)
  - Fatigue Concentration Rate (% exceeding 36h/week or 6 consecutive days)
  - Bottleneck Hazard Level: Low, Moderate, High, Critical

## Code Layout
- `src/App.tsx`: Main application shell, state management, Dashboard 01 view, Employees view, Modals
- `src/types.ts`: Global data models and domain types
- `src/utils/costSimulationEngine.ts`: Simulation engine, shift overtime calculation, department budget simulation
- `src/utils/shiftRecommendation.ts`: Shift code definitions, hours mapping, fatigue and labor law compliance audit
- `server.ts`: Backend Express server with SQLite and in-memory `appState`
- `tests/`: 40 test files in Tiers 1 through 5
