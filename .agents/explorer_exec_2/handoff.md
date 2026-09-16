# Handoff Report: Month-End Budget Forecast & Burn Rate Survey (Requirement R2)

**Agent**: `explorer_exec_2`  
**Working Directory**: `C:\Users\ssrwj\.gemini\antigravity\worktrees\mysterious-einstein\fix_dashboard_layout_highlighting\.agents\explorer_exec_2`  
**Parent**: `orchestrator_4` (`a9b53a21-a7e4-46e8-a2f1-fa981ad03218`)  
**Type**: Hard Handoff (Investigation Complete)  
**Date**: 2026-09-12  

---

## 1. Observation

### 1.1 Existing Budget & Cost Modeling in Codebase

1. **`src/utils/costSimulationEngine.ts` (lines 4–33, 52–94, 138–245)**:
   - **Shift OT calculation (`getShiftOtHours`)**:
     - `OND`: 8 hours OT (holiday).
     - Codes ending in digits (e.g., `M12` -> 4h, `M16` -> 8h, `N12` -> 4h, `A12` -> 4h): `Math.max(0, hours - 8)`.
     - Standard 8h shifts (`M8`, `A8`, `N8`, `D`, `O`, `OFF`): 0h OT.
   - **Payroll Rate (`calculateEmployeeMonthlyOt`)**:
     - Hourly rate: `hourlyRate = (salary > 0 ? salary : 15000) / 240`.
     - Normal OT hours: 1.5x multiplier.
     - Sunday / Holiday OT hours: 3.0x multiplier.
     - Holiday work days: 1.0x multiplier on 8 hours base work (`8 * 1.0 * hourlyRate`).
     - Total OT Pay: `Math.round((normalOt * 1.5 + holidayOt * 3.0 + holidayWorkDays * 8 * 1.0) * hourlyRate)`.
   - **Department Budget Ceiling**:
     - `departmentBudgetLimit: number = 150000` (THB per department per month).
     - `budgetUtilizationPct = (newTotalCostThb / departmentBudgetLimit) * 100`.
     - `isBudgetExceeded = newTotalCostThb > departmentBudgetLimit`.
     - Flags `budget_exceeded` compliance violation when threshold is exceeded.

2. **`src/App.tsx` (lines 275–346, 5513–5545, 5675–5685, 6850–6883)**:
   - **Employee Monthly OT Pay Breakdown (`getEmpMonthlyOtPayBreakdown`)**:
     - Evaluates day 1 to `totalDays` for an employee's shifts against `CompanyHoliday[]` and `DepartmentRestDayPolicy[]`.
     - Provides `normalOt`, `holidayOt`, `holidayWorkDays`, `totalOtHours`, `hourlyRate`, `totalOtPay`, `otPctSalary`.
   - **Department Cost Driver Ranking (`deptDriverStats` lines 6851–6883)**:
     - Calculates actual OT spend:
       ```typescript
       const actualSpendThb = Math.round(
         deptEmps.reduce((s, e) => s + activeMonthsList.reduce((mSum, mKey) => mSum + getEmpCalculatedOtPay(e, mKey), 0), 0)
       );
       ```
     - Calculates planned budget:
       ```typescript
       const plannedTargetHours = deptEmps.reduce((s, e) => s + (e.targetOt || 48), 0) * activeMonthsList.length;
       const avgHourly = deptEmps.length > 0 ? deptEmps.reduce((s, e) => s + ((e.salary || 15000) / 240), 0) / deptEmps.length : 62.5;
       const plannedBudgetThb = Math.round(plannedTargetHours * 1.5 * avgHourly);
       ```
     - Compares actual spend vs planned budget:
       ```typescript
       const varianceHours = Math.round((actualOtHours - plannedTargetHours) * 10) / 10;
       const varianceSpendThb = actualSpendThb - plannedBudgetThb;
       const variancePct = plannedBudgetThb > 0 ? Math.round((varianceSpendThb / plannedBudgetThb) * 100) : 0;
       ```
   - **Operational Budget Fallback (`server.ts` & `App.tsx` line 5532)**:
     - Fallback estimated rate when hourly salary is unavailable: `DEFAULT_OT_RATE = 300` THB/hr.
     - Default monthly department budget ceiling: `DEFAULT_BUDGET_MAX = 150000` THB/month.

3. **Existing Test Baseline & Invariants**:
   - `tests/tier1-calculations/budget-utilization.test.ts`: Enforces 150,000 THB default ceiling, warning at > 95% utilization.
   - `tests/tier1-calculations/cost-simulation-engine.test.ts`: Validates `salary / 240`, 1.5x / 3.0x / 1.0x multipliers, delta cost calculations.
   - `tests/tier2-responsive/url-routing.test.tsx`: Validates 11 views bidirectionally mapped in `TAB_TO_PATH` / `PATH_TO_TAB` (`dashboard: "/"`).
   - Entire tier2 and tier4 test suites: 21 test files, 140 passing tests verified on local machine.

---

## 2. Logic Chain

### 2.1 Problem Definition (Requirement R2)
- Executive leadership requires **proactive forward-looking foresight** rather than purely retrospective backward-looking tracking.
- The system must answer three core management questions:
  1. *At the current spending velocity, where will each department end the month financially?*
  2. *Is the current burn rate exceeding the target allocation, and by what margin?*
  3. *If current trajectory continues, on what exact date will the budget be completely depleted?*

### 2.2 Mathematical Trajectory & Burn Rate Model

#### Step 1: Calendar Progress & Time Slicing
Let the evaluation month be specified by year $Y$ and month $M$ (e.g. `2026-08`).
- Total days in month:
  $$D_{\text{total}} = \text{new Date}(Y, M, 0)\text{.getDate()} \quad (\text{e.g. } 31 \text{ days})$$
- Evaluation day ($D_{\text{asOf}}$):
  - In live operation: $D_{\text{asOf}} = \min(D_{\text{total}}, \max(1, \text{current calendar day}))$.
  - In historical or simulated review: selectable via an executive day scrubber / stepper $1 \le D_{\text{asOf}} \le D_{\text{total}}$ (defaults to last day with logged shift data, or day 15/20 if full month exists).
- Elapsed calendar ratio:
  $$\text{ProgressRatio} = \frac{D_{\text{asOf}}}{D_{\text{total}}}, \quad \text{ElapsedPct} = \text{ProgressRatio} \times 100\%$$

#### Step 2: Elapsed Actuals Accumulation (Days $1 \ldots D_{\text{asOf}}$)
For each employee $e$ in department $d$:
- Hourly rate: $HR_e = \frac{\max(e.\text{salary}, 15000)}{240}$.
- For each day $k \in [1, D_{\text{asOf}}]$:
  - Daily OT Pay $Pay_{e,k}$ calculated using verified legal multipliers:
    - Normal weekday OT ($1.5 \times HR_e \times \text{otHours}$)
    - Sunday / Holiday OT ($3.0 \times HR_e \times \text{otHours}$)
    - Holiday work day ($1.0 \times HR_e \times 8\text{h}$)
- Department actual OT spend to date:
  $$S_{\text{elapsed}} = \sum_{e \in d} \sum_{k=1}^{D_{\text{asOf}}} Pay_{e,k}$$
- Department actual OT hours to date:
  $$H_{\text{elapsed}} = \sum_{e \in d} \sum_{k=1}^{D_{\text{asOf}}} \text{otHours}_{e,k}$$

#### Step 3: Target Budget Allocation & Linear Pacing
- Department target budget $B_{\text{target}}$:
  - Primary: Department budget limit $150,000$ THB (or explicit `dept.budgetLimit`).
  - Secondary/Planned: $\sum_{e \in d} (e.\text{targetOt} \mathbin{||} 48) \times 1.5 \times HR_e$.
- Target daily pacing velocity:
  $$\text{DailyTargetPacing} = \frac{B_{\text{target}}}{D_{\text{total}}} \quad (\text{THB/day})$$
- Benchmark target spend to date (where spend *should* be today):
  $$S_{\text{benchmark}} = B_{\text{target}} \times \left(\frac{D_{\text{asOf}}}{D_{\text{total}}}\right) = \text{DailyTargetPacing} \times D_{\text{asOf}}$$
- Pacing Variance (Pacing delta to date):
  $$\Delta S_{\text{pacing}} = S_{\text{elapsed}} - S_{\text{benchmark}}$$
  - If $\Delta S_{\text{pacing}} > 0$: Department is burning budget faster than calendar progression.

#### Step 4: Daily Burn Rate & Month-End Projection
- Actual daily spend burn rate:
  $$\text{DailyBurnRate} = \frac{S_{\text{elapsed}}}{D_{\text{asOf}}} \quad (\text{THB/day})$$
- Actual daily hours burn rate:
  $$\text{DailyHoursBurnRate} = \frac{H_{\text{elapsed}}}{D_{\text{asOf}}} \quad (\text{Hours/day})$$
- Projected month-end total spend ($S_{\text{projected}}$):
  $$S_{\text{projected}} = S_{\text{elapsed}} + \text{DailyBurnRate} \times (D_{\text{total}} - D_{\text{asOf}}) = \text{DailyBurnRate} \times D_{\text{total}} = S_{\text{elapsed}} \times \left(\frac{D_{\text{total}}}{D_{\text{asOf}}}\right)$$
- Projected variance from target allocation:
  $$\Delta S_{\text{projected}} = S_{\text{projected}} - B_{\text{target}}$$
  $$\text{VariancePct} = \left(\frac{\Delta S_{\text{projected}}}{B_{\text{target}}}\right) \times 100\%$$
- Expected month-end burn rate (% of budget):
  $$\text{ProjectedBurnRatePct} = \left(\frac{S_{\text{projected}}}{B_{\text{target}}}\right) \times 100\%$$

#### Step 5: Depletion / Zero-Budget Day Prediction
If $\text{DailyBurnRate} > \text{DailyTargetPacing}$ and $S_{\text{projected}} > B_{\text{target}}$:
- Projected day of the month when budget is 100% exhausted:
  $$D_{\text{depleted}} = \min\left(D_{\text{total}}, \max\left(D_{\text{asOf}}, \left\lceil \frac{B_{\text{target}}}{\text{DailyBurnRate}} \right\rceil\right)\right)$$
- Days remaining until budget depletion:
  $$\text{DaysUntilDepletion} = D_{\text{depleted}} - D_{\text{asOf}}$$
- If $S_{\text{projected}} \le B_{\text{target}}$, $D_{\text{depleted}} = \text{null}$ ("งบเพียงพอตลอดทั้งเดือน").

#### Step 6: Risk Rating Categorization
| Status | Burn Rate % | Depletion Risk | Maritime Color Token | Action Recommendation |
|---|---|---|---|---|
| **Under-burn (Surplus)** | $< 85\%$ | None | Text: `#1E9C6E`, Bg: `#E8F6F0` | Reallocate surplus capacity |
| **On Track** | $85\% - 100\%$ | None | Text: `#0E3A66`, Bg: `#E8F3FA` | Normal monitoring |
| **Warning (Pacing Alert)** | $100\% - 115\%$ | Days 27–31 | Text: `#D99B14`, Bg: `#FCF3DE` | Freeze optional OT shifts |
| **Critical Overburn** | $> 115\%$ | Day $< 27$ | Text: `#B3352C`, Bg: `#FBEAEA` | Cap shifts, trigger approval |

---

## 3. Caveats

1. **Unassigned Roster Days**:
   - In forward-looking schedules, future days may contain empty cells or default `"O"` until supervisors assign shifts. The velocity projection model (Model A: Run-rate extrapolation) correctly assumes historical velocity continues. If planned shifts are present in `emp.planShifts`, a hybrid calculation can show both Run-Rate Trajectory and Plan-Adjusted Trajectory.
2. **First Few Days of Month Sensitivity**:
   - For $D_{\text{asOf}} < 3$, daily burn rate can be noisy if heavy weekend shifts fall on days 1–2. A smoothing guard (`if (daysElapsed < 3) burnRate = weighted blend with planned target pacing`) prevents wild variance spikes.
3. **Multi-Month Filter Consistency**:
   - When the user selects "3 เดือนที่ผ่านมา" or "6 เดือนย้อนหลัง", historical completed months have $D_{\text{asOf}} = D_{\text{total}}$ (100% completed), while the current month shows active burn trajectory.

---

## 4. Conclusion & Recommended Blueprint

### 4.1 Data Contracts (To be added to `src/types.ts`)

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

### 4.2 Architecture & File Organization
1. **Engine File**: Create `src/utils/budgetForecastEngine.ts` containing pure, side-effect-free calculation functions:
   - `calculateDepartmentBudgetForecast(employees, dept, monthKey, asOfDay, targetBudgetThb)`
   - `calculateExecutiveForecastSummary(employees, departments, monthKey, asOfDay)`
2. **Executive UI Component**:
   - Add Month-End Budget Forecast & Burn Rate card to the Executive Mode layout of Dashboard.
   - Includes:
     - Enterprise KPI Summary Bento (Total Projected Spend vs Target, Daily Enterprise Burn Velocity, Elapsed Time Bar).
     - Target vs Current Trajectory visualizer (SVG/CSS line chart with Target benchmark, Current Actual, and Projected Trajectory with Depletion marker).
     - Department Burn Rate Ranking Table/Grid with progress bars, &Delta;THB, &Delta;%, and depletion day badges.
     - One-click action trigger: "จำกัดกะ OT แผนกวิกฤต" (Cap OT for Critical Depts) and "ส่งออกสรุปงบประมาณ (CSV)".

---

## 5. Verification Method

To independently verify the implementation and mathematics:

1. **Unit Test Creation (`tests/tier1-calculations/budget-forecast-engine.test.ts`)**:
   - Verify linear run-rate projection formula:
     - 10 days elapsed, 31 days total, 50,000 THB spent -> `DailyBurn = 5,000 THB/day`, `Projected = 155,000 THB`.
     - Target = 150,000 THB -> `Variance = +5,000 THB (+3.3%)`, `BurnRate = 103.3%` (Warning).
     - Depletion day = $\lceil 150,000 / 5,000 \rceil = 30$ (Depleted on day 30, 20 days remaining).
   - Verify on-track boundary:
     - 15 days elapsed, 30 days total, 60,000 THB spent -> `DailyBurn = 4,000 THB/day`, `Projected = 120,000 THB` vs 150,000 THB (`BurnRate = 80.0%`, Status: Surplus, Depletion: null).
   - Verify edge cases:
     - 0 days elapsed -> graceful fallback to 0 spend, 0% burn rate.
     - Day 1 boundary -> handles 1 day elapsed cleanly.
     - Zero budget limit -> avoids division by zero.

2. **Automated Suite Run**:
   ```bash
   npx vitest run tests/tier1-calculations
   npx vitest run tests/tier2-responsive tests/tier4-workflows
   ```
   *Expectation: 100% tests pass (140 existing + new tier1 forecast tests).*

3. **TypeScript & Build Verification**:
   ```bash
   npm run build
   ```
   *Expectation: Compiles with 0 TypeScript and 0 Vite bundle errors.*
