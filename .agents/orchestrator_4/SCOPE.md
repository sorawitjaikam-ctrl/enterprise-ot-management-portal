# Scope: Executive Dashboard Refactoring

## Architecture
Refactoring the existing operational dashboard into an Executive Dashboard that prioritizes month-end budget forecasts, risk/fatigue alerts, and actionable triggers for C-level management while retaining an Operational Mode for supervisors.

### Key Components & Layout Structure
- **Dashboard Mode State**: `dashboardMode: "executive" | "operational"`.
- **URL Synchronization**: Synchronized with URL search parameter `?mode=executive` / `?mode=operational` via `window.history.replaceState`. Unaltered `activeTab === "dashboard"` and `TAB_TO_PATH["dashboard"] === "/"`.
- **Executive Mode View**:
  1. **Mode Switcher & Filter Bar**: Sleek segmented control (`Executive View` vs `Operational View`), Month filter.
  2. **Strategic Action Hub (R4)**: One-click batch approval for pending OT requests, one-click Board-Ready Executive Summary CSV export, and quick risk mitigation shortcut.
  3. **Executive KPI Bento (R2/Core)**: Total Overtime Spend, Month-End Budget Forecast, Daily Burn Rate Velocity, Labor Law Safety Margin.
  4. **Month-End Budget Forecast & Burn Rate (R2)**: Target vs Projected Trajectory, Daily Burn Rate (฿/day), Variance vs Budget Allocation, Estimated Depletion Day.
  5. **Advanced Risk & Fatigue Radar (R3)**: 5-Axis Radar Chart SVG, Proactive Risk Matrix (Critical/High/Moderate/Low), Understaffed Roles, Imminent Compliance Breaches.
  6. **Strategic Cost Drivers**: Shift-to-Cost Driver Tree (F3.1) and Department Cost Driver Variance Ranking (F3.2).
- **Operational Mode View**:
  - Retains existing operational workflow: 4 tactical KPI tiles, Fatigue & Compliance Telemetry Banner, 10-Month Financial Dynamics Chart, Department Overtime Allocation Progress Bars, Operating Roles Distribution, and Individual Top Overtime Contributors Watchlist cards.

## Feature Inventory
| # | Feature | Description | Milestone | Source | Status |
|---|---------|-------------|-----------|--------|--------|
| R1 | Executive Mode vs Operational Mode | Segmented mode toggle with deep-linking (`?mode=`) preserving `useUrlRouting` and pathname invariants | M_EXEC | ORIGINAL_REQUEST R1 | DONE |
| R2 | Month-End Budget Forecast & Burn Rate | Dynamic projections of monthly spend velocity, variance vs target, and budget depletion date | M_EXEC | ORIGINAL_REQUEST R2 | DONE |
| R3 | Advanced Risk & Fatigue Radar | 5-axis proactive radar chart and role/department risk matrix anticipating violations before they happen | M_EXEC | ORIGINAL_REQUEST R3 | DONE |
| R4 | Strategic Action Hub | Prominent 1-click batch approvals and Board-Ready Executive Summary CSV export | M_EXEC | ORIGINAL_REQUEST R4 | DONE |
| QA | Build & Invariant Test Pass | Zero TS/build errors, 100% test pass (48 test files, 423 tests passed), zero emojis | M_EXEC | Acceptance Criteria | DONE |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Survey & Architecture Exploration | Survey UI, routing, budget calculations, risk radar, and test baseline | None | DONE |
| 2 | Executive Dashboard Implementation | Implement R1–R4 in `src/` with dedicated engines, components, and integration in `App.tsx` | M1 | DONE |
| 3 | Multi-Agent Review, Verification & Audit | 2 Reviewers, 2 Challengers, 1 Forensic Auditor gate verification | M2 | DONE |
| 4 | Final Acceptance & Sentinel Reporting | Confirm build, test results, generate handoff report, notify Sentinel | M3 | IN_PROGRESS |

## Interface Contracts

### 1. Budget Forecast Engine (`src/utils/budgetForecastEngine.ts`)
```typescript
export interface DepartmentBudgetForecast {
  deptId: string;
  deptName: string;
  deptNameTh: string;
  employeeCount: number;
  totalBaseSalary: number;
  avgHourlyRate: number;
  targetBudgetThb: number;
  daysElapsed: number;
  totalDaysInMonth: number;
  elapsedProgressPct: number;
  actualOtHoursToDate: number;
  actualSpendToDateThb: number;
  targetSpendToDateThb: number;
  pacingVarianceThb: number;
  pacingVariancePct: number;
  dailySpendBurnRateThb: number;
  dailyHoursBurnRate: number;
  dailyTargetPacingThb: number;
  projectedMonthEndSpendThb: number;
  projectedMonthEndHours: number;
  projectedVarianceThb: number;
  projectedVariancePct: number;
  projectedBurnRatePct: number;
  estimatedDepletionDay: number | null;
  daysUntilDepletion: number | null;
  status: "surplus" | "on_track" | "warning" | "critical";
}

export interface ExecutiveMonthEndForecastSummary {
  monthKey: string;
  asOfDay: number;
  totalDays: number;
  elapsedPct: number;
  totalTargetBudgetThb: number;
  totalActualSpendToDateThb: number;
  totalTargetPacingToDateThb: number;
  totalDailyBurnRateThb: number;
  totalProjectedMonthEndSpendThb: number;
  totalProjectedVarianceThb: number;
  totalProjectedBurnRatePct: number;
  criticalDeptsCount: number;
  warningDeptsCount: number;
  onTrackDeptsCount: number;
  departments: DepartmentBudgetForecast[];
}
```

### 2. Proactive Risk Radar Engine (`src/utils/riskRadarEngine.ts`)
```typescript
export interface RoleRiskAssessment {
  role: string;
  department: string;
  totalHeadcount: number;
  activeHeadcount: number;
  minimumRequired: number;
  staffingShortfall: number;
  isUnderstaffed: boolean;
  projectedFatigueCount: number;
  consecutiveDaysNearBreach: number;
  restTurnaroundViolations: number;
  riskLevel: "CRITICAL" | "HIGH" | "MODERATE" | "LOW";
  riskScore: number;
  proactiveWarning: string;
  recommendedMitigation: string;
}

export interface DepartmentRiskAssessment {
  deptId: string;
  deptName: string;
  riskScore: number;
  riskLevel: "CRITICAL" | "HIGH" | "MODERATE" | "LOW";
  fatigueCount: number;
  staffingGap: number;
  warning: string;
}

export interface ProactiveRiskRadarSummary {
  overallRiskScore: number;
  riskStatus: "CRITICAL" | "HIGH" | "MODERATE" | "LOW";
  radarMetrics: {
    staffingSufficiency: number;  // 0 - 1
    weeklyOtSafety: number;       // 0 - 1
    restTurnaroundSafety: number; // 0 - 1
    workdayAdherence: number;     // 0 - 1
    rosterResilience: number;     // 0 - 1
  };
  roleAssessments: RoleRiskAssessment[];
  departmentAssessments: DepartmentRiskAssessment[];
}
```

## Code Layout
- `src/types.ts`: Global data models and domain types
- `src/utils/budgetForecastEngine.ts`: Pure budget forecast, burn rate, and depletion date calculations
- `src/utils/riskRadarEngine.ts`: Pure proactive risk radar, 5-axis metrics, and role hazard assessments
- `src/components/dashboard/ExecutiveDashboardView.tsx`: Executive mode component (Action Hub, Budget Forecast Card, Risk Radar Card, Strategic Cost Drivers)
- `src/components/dashboard/StrategicActionHub.tsx`: One-click batch approval and Board Summary export buttons
- `src/components/dashboard/MonthEndBudgetForecastCard.tsx`: Trajectory chart, velocity gauge, and department burn ranking
- `src/components/dashboard/AdvancedRiskRadarCard.tsx`: 5-axis Radar SVG, risk matrix, and understaffed role warnings
- `src/App.tsx`: Dashboard mode toggle (`dashboardMode`), URL query sync, and conditional rendering of Executive vs Operational view
