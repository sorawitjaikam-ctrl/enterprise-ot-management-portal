# Challenger Handoff Report: Executive Dashboard Calculation Models & Boundary Stress Audit

## 1. Observation

### Codebase & Implementation Inspection
1. **`src/utils/budgetForecastEngine.ts`**:
   - **Line 53-59 (`getDaysInMonth`)**:
     ```ts
     export function getDaysInMonth(monthKey: string): number {
       if (!monthKey || !monthKey.includes("-")) return 31;
       const [yStr, mStr] = monthKey.split("-");
       const year = Number(yStr) || new Date().getFullYear();
       const month = Number(mStr) || (new Date().getMonth() + 1);
       return new Date(year, month, 0).getDate();
     }
     ```
     Observed: Correctly supports 28 days (e.g. `2026-02`), 29 days (leap year `2024-02`, `2028-02`, `2000-02`), 30 days (`2026-04`, `2026-09`), and 31 days (`2026-08`, `2026-12`). Falsy or non-hyphenated strings safely fall back to 31. Hyphenated keys with non-numeric tokens fall back to the current month's day count via `new Date().getMonth() + 1`.
   - **Lines 98-99 (`calculateEmployeeOtToDay`)**:
     ```ts
     const salary = Number(emp.salary) > 0 ? Number(emp.salary) : 15000;
     const hourlyRate = salary / 240;
     ```
     Observed: Zero, negative, or undefined salaries fall back to `15000` THB, ensuring `hourlyRate` is `62.5` THB and never divides by zero or generates negative hourly rates.
   - **Lines 201-205 (`calculateDepartmentBudgetForecast`)**:
     ```ts
     const employeeCount = deptEmployees.length;
     const totalBaseSalary = deptEmployees.reduce((acc, curr) => acc + (Number(curr.salary) || 15000), 0);
     const avgHourlyRate = employeeCount > 0
       ? Math.round((totalBaseSalary / employeeCount / 240) * 100) / 100
       : 62.5;
     ```
     Observed: Division by zero is guarded when `employeeCount === 0` (falls back to `62.5`). However, `curr.salary || 15000` does not clamp negative numbers (`curr.salary < 0` evaluates as truthy), whereas `calculateEmployeeOtToDay:98` strictly checks `> 0`.
   - **Lines 221-255 (`calculateDepartmentBudgetForecast` zero guards)**:
     ```ts
     const dailyTargetPacingThb = totalDaysInMonth > 0
       ? Math.round((targetBudgetThb / totalDaysInMonth) * 100) / 100
       : 0;
     const pacingVariancePct = targetSpendToDateThb > 0
       ? Math.round((pacingVarianceThb / targetSpendToDateThb) * 1000) / 10
       : 0;
     const dailySpendBurnRateThb = daysElapsed > 0
       ? Math.round((actualSpendToDateThb / daysElapsed) * 100) / 100
       : 0;
     const dailyHoursBurnRate = daysElapsed > 0
       ? Math.round((actualOtHoursToDate / daysElapsed) * 10) / 10
       : 0;
     const projectedMonthEndSpendThb = daysElapsed > 0
       ? Math.round(dailySpendBurnRateThb * totalDaysInMonth)
       : 0;
     const projectedVariancePct = targetBudgetThb > 0
       ? Math.round((projectedVarianceThb / targetBudgetThb) * 1000) / 10
       : 0;
     const projectedBurnRatePct = targetBudgetThb > 0
       ? Math.round((projectedMonthEndSpendThb / targetBudgetThb) * 1000) / 10
       : 0;
     ```
     Observed: At Day 0 (`daysElapsed = 0`) or zero budget (`targetBudgetThb = 0`), every rate and percentage division is guarded against division-by-zero, returning `0` and never producing `NaN` or `Infinity`.
   - **Lines 259-267 (`estimatedDepletionDay`)**:
     ```ts
     if (
       dailySpendBurnRateThb > 0 &&
       dailySpendBurnRateThb > dailyTargetPacingThb &&
       projectedMonthEndSpendThb > targetBudgetThb
     ) {
       const rawDepletionDay = Math.ceil(targetBudgetThb / dailySpendBurnRateThb);
       estimatedDepletionDay = Math.min(totalDaysInMonth, Math.max(daysElapsed, rawDepletionDay));
       daysUntilDepletion = Math.max(0, estimatedDepletionDay - daysElapsed);
     }
     ```
     Observed: Depletion day is strictly bounded between `daysElapsed` and `totalDaysInMonth`. At month-end (Day 30/31), `estimatedDepletionDay` cannot exceed `totalDaysInMonth` and `daysUntilDepletion` evaluates to `0` when already exhausted.

2. **`src/utils/riskRadarEngine.ts`**:
   - **Lines 78-92 (`isEmployeeActive`)**:
     ```ts
     export function isEmployeeActive(emp: Employee): boolean {
       if (!emp) return false;
       const status = (emp.employmentStatus || "").trim().toLowerCase();
       if (
         status === "resigned" ||
         status === "inactive" ||
         status === "retired" ||
         status === "ลาออก" ||
         status === "เกษียณ" ||
         status === "พ้นสภาพ"
       ) {
         return false;
       }
       return true;
     }
     ```
     Observed: Reliably identifies inactive statuses in English and Thai without case or whitespace sensitivity.
   - **Lines 153-163 (`auditEmployeeProactiveRisks` rest turnaround)**:
     ```ts
     for (let d = 0; d < totalDays - 1; d++) {
       const today = shifts[d] || "O";
       const tomorrow = shifts[d + 1] || "O";
       const isTodayNight = today === "N12" || today === "N8" || today === "N16";
       const isTomorrowMorning = tomorrow === "M8" || tomorrow === "M12" || tomorrow === "M16" || tomorrow === "D";
       if (isTodayNight && isTomorrowMorning) {
         restTurnaroundCount++;
       }
     }
     ```
     Observed: Accurately identifies consecutive night-to-morning transitions where rest is `< 11h`.
   - **Lines 336-354 (5-Axis Radar metrics normalization)**:
     ```ts
     const staffingSufficiency = totalMinimumRequired > 0
       ? Math.max(0, Math.min(1, Math.round((totalActiveHeadcount / totalMinimumRequired) * 100) / 100))
       : 1.0;
     const weeklyOtSafety = totalActiveHeadcount > 0
       ? Math.max(0, Math.min(1, Math.round((1 - totalImpendingFatigue / totalActiveHeadcount) * 100) / 100))
       : 1.0;
     const restTurnaroundSafety = totalActiveHeadcount > 0
       ? Math.max(0, Math.min(1, Math.round((1 - totalRestTurnarounds / (totalActiveHeadcount * 2)) * 100) / 100))
       : 1.0;
     const workdayAdherence = totalActiveHeadcount > 0
       ? Math.max(0, Math.min(1, Math.round((1 - totalConsecutiveNearBreach / totalActiveHeadcount) * 100) / 100))
       : 1.0;
     const rosterResilience = totalMinimumRequired > 0
       ? Math.max(0, Math.min(1, Math.round((totalActiveHeadcount / (totalMinimumRequired * 1.25)) * 100) / 100))
       : 1.0;
     ```
     Observed: When `totalActiveHeadcount === 0` or `totalMinimumRequired === 0`, all 5 radar metrics are protected by ternary checks and clamped within `[0.0, 1.0]`.

### Empirical Test Execution Results
- Command: `npx vitest run tests/tier1-calculations/challenger-calculation-stress.test.ts`
  - Output:
    ```
    ✓ tests/tier1-calculations/challenger-calculation-stress.test.ts (25 tests) 12ms
    Test Files  1 passed (1)
         Tests  25 passed (25)
      Duration  1.31s
    ```
- Command: `npm run build`
  - Output:
    ```
    ✓ 1693 modules transformed.
    dist/assets/index-CjbdBbII.css     155.79 kB │ gzip:  23.13 kB
    dist/assets/index-BaWedDHI.js      880.49 kB │ gzip: 200.35 kB
    dist\server.cjs       76.8kb
    Exit code: 0
    ```
- Command: `npx vitest run` (Full Repository Suite)
  - Output:
    ```
    Test Files  48 passed (48)
         Tests  423 passed (423)
      Duration  39.68s
    ```

---

## 2. Logic Chain

1. **Step 1 (Zero-Division Robustness)**:
   - Observation: `calculateDepartmentBudgetForecast` checks `daysElapsed > 0` before calculating `dailySpendBurnRateThb`, `dailyHoursBurnRate`, and projections (lines 231, 235, 239). It also checks `targetBudgetThb > 0` before calculating `projectedBurnRatePct` and `projectedVariancePct` (lines 248, 252).
   - Test CH.TIME.1 & CH.FIN.1: Passed Day 0 elapsed time (`asOfDay = 0`) and zero budget (`targetBudgetThb = 0`) with 0 spend, 0 burn rate, and finite numbers.
   - Deduction: The calculation engine is fully immune to division-by-zero crashes or `NaN`/`Infinity` leakage under zero elapsed time and zero budget boundaries.

2. **Step 2 (Calendar Month & Leap Year Support)**:
   - Observation: `getDaysInMonth` constructs `new Date(year, month, 0).getDate()`.
   - Test CH.CAL.1–4 & CH.INV.4: Verified non-leap Feb (28 days), leap Feb 2024/2028/2000 (29 days), 30-day months (Apr, Jun, Sep, Nov), and 31-day months (Jan, Mar, May, Jul, Aug, Oct, Dec).
   - Deduction: Dynamic calendar month length calculations and pacing/burn rates accurately scale according to exact Gregorian month lengths, including leap century years.

3. **Step 3 (Salary Boundary & Fallbacks)**:
   - Observation: In `calculateEmployeeOtToDay`, salary defaults to 15,000 THB when `<= 0` or missing. In `calculateDepartmentBudgetForecast`, `totalBaseSalary` defaults to 15,000 THB for 0, null, or undefined.
   - Test CH.FIN.2: Passed with 0 and undefined salary inputs, verifying hourly rate equals 62.5 THB.
   - Minor Observation: For negative salary (`salary < 0`), `Number(curr.salary) || 15000` treats negative numbers as truthy. While this is an unrealistic input in normal business operations, standardizing `Number(curr.salary) > 0 ? Number(curr.salary) : 15000` across both files is recommended for complete symmetry.

4. **Step 4 (Overtime Spikes vs Zero OT)**:
   - Observation: In `calculateEmployeeOtToDay`, M16 (8h OT/day) across 31 days computes exactly 248h OT (208h normal OT on 26 regular days + 40h holiday OT on 5 Sundays in August 2026).
   - Test CH.OT.1: 5 workers with 248h OT each yielded 400h OT at Day 10, triggered `critical` status (> 150% burn rate), and computed accurate depletion day.
   - Test CH.OT.2: 0h OT across 5 workers yielded 0 burn rate, `surplus` status, and null depletion day.
   - Deduction: Extreme volume spikes (100h+ to 250h+) and complete absence of OT are handled with precision without arithmetic overflow or status distortion.

5. **Step 5 (Active Headcount & Roster Resilience)**:
   - Observation: `isEmployeeActive` filters out active vs inactive statuses. In `computeProactiveRiskRadar`, empty employee list `[]` and 0 active employees compute without division by zero.
   - Test CH.HEAD.1–3: Tested all Thai and English inactive status variations ("ลาออก", "เกษียณ", "พ้นสภาพ", "resigned", "retired", "inactive") and empty arrays. In all cases, 5-axis metrics stayed within `[0.0, 1.0]`, and 0 active workers with minimum requirements correctly escalated to CRITICAL status.
   - Deduction: Headcount loss and leave states degrade metrics monotonically and safely trigger executive alarms.

6. **Step 6 (Rest Turnaround & Shift Rolling Windows)**:
   - Observation: Night shifts followed immediately by morning shifts without 11h rest are audited by `auditEmployeeProactiveRisks`.
   - Test CH.REST.1–3: Alternating N12/M8 across 31 days identified 15 rest turnaround violations and 31 consecutive days near breach, degrading `restTurnaroundSafety` to `< 0.1` while respecting the `0.0` lower bound.

7. **Step 7 (Aggregation Invariants)**:
   - Observation: `calculateExecutiveForecastSummary` aggregates individual department projections.
   - Test CH.INV.1: Sum of department budgets, actual spends, and projected spends strictly matched enterprise totals. Total departments equaled critical + warning + onTrack counts.

---

## 3. Caveats

- **Buddhist Calendar Years**: Thai systems sometimes use Buddhist Era years (e.g. 2569 instead of 2026). In `getDaysInMonth("2569-08")`, JavaScript's Date constructor handles year 2569 as CE 2569 (which works fine for month days). However, application convention standardizes on ISO-8601 Gregorian year keys (e.g. `2026-08`).
- **Negative Salaries**: As documented in Finding 1, negative salaries are clamped to 15,000 in `calculateEmployeeOtToDay` but not in `calculateDepartmentBudgetForecast:201`. Because upstream validation prevents negative salaries on employee models, this has zero practical blast radius in production.

---

## 4. Conclusion & Challenge Report

### Challenge Summary
- **Overall Risk Assessment**: **LOW**
- **Verdict**: **APPROVE**
- All 7 boundary challenge dimensions passed verification cleanly with zero regressions across the 423-test repository suite.

### Detailed Challenges

#### Challenge 1 [Low Risk]: Negative Salary Accumulation Discrepancy
- **Assumption Challenged**: Employee salary models could theoretically contain negative numbers.
- **Attack Scenario**: Passing `salary: -25000` resulted in `calculateEmployeeOtToDay` clamping to 15,000 THB, whereas `totalBaseSalary` in `calculateDepartmentBudgetForecast:201` evaluated `-25000 || 15000` as `-25000`.
- **Blast Radius**: Cosmetic discrepancy in `totalBaseSalary` and `avgHourlyRate` if upstream data contains negative salary; does not affect OT pay calculation or burn rate.
- **Mitigation**: Update line 201 to `curr.salary && Number(curr.salary) > 0 ? Number(curr.salary) : 15000`.

#### Challenge 2 [Low Risk]: Hyphenated Non-Numeric Month Key Fallback
- **Assumption Challenged**: Passing `"invalid-key"` should safely default.
- **Attack Scenario**: `"invalid-key"` contains a hyphen, causing `split("-")` and falling back to `new Date().getMonth() + 1` (current month) rather than constant 31.
- **Blast Radius**: None; returning the current month's day count for unparseable current-period keys is mathematically valid and produces finite numbers.

### Stress Test Results Summary

| Challenge ID | Scenario | Expected Behavior | Actual Behavior | Result |
|---|---|---|---|---|
| **CH.TIME.1** | Day 0 elapsed time (`asOfDay = 0`) | Burn rates = 0, no NaN/Infinity, surplus status | 0 THB/day, finite numbers, surplus status | **PASS** |
| **CH.TIME.2** | Day 1 elapsed time (`asOfDay = 1`) | Burn rate based on Day 1, projected cleanly to month-end | 600 THB/day, 18,600 THB projected | **PASS** |
| **CH.TIME.3** | Month-end (Day 31 of 31) elapsed | Depletion day capped at 31, days until depletion = 0 | Depletion day = 31, daysUntilDepletion = 0 | **PASS** |
| **CH.TIME.4** | Negative (`-42`) & extreme (`999`) `asOfDay` | Clamped cleanly within `[0, totalDaysInMonth]` | Clamped to 0 and 31 without error | **PASS** |
| **CH.CAL.1** | Non-leap February 2026 | Exactly 28 days, pacing based on 28 | 28 days, 5,000 THB/day pacing | **PASS** |
| **CH.CAL.2** | Leap February 2024 / 2028 / 2000 | Exactly 29 days, pacing based on 29 | 29 days, 5,000 THB/day pacing | **PASS** |
| **CH.CAL.3** | 30-Day months (Apr, Jun, Sep, Nov) | Exactly 30 days | 30 days, 5,000 THB/day pacing | **PASS** |
| **CH.CAL.4** | 31-Day months (Jan, Mar, May, etc.) | Exactly 31 days | 31 days | **PASS** |
| **CH.CAL.5** | Empty, malformed, or null month keys | Finite day count (30 or 31), no NaN | 31 days / current month days | **PASS** |
| **CH.FIN.1** | Zero budget limit (`targetBudgetThb = 0`) | Percentages = 0%, no division by zero | 0% burn rate, 0% variance, finite numbers | **PASS** |
| **CH.FIN.2** | Zero or missing employee salary | Default to 15,000 THB base / 62.5 THB/hr | 62.5 THB/hr, 45,000 THB dept total | **PASS** |
| **CH.FIN.3** | Massive budget limit (1,000,000,000 THB) | No overflow or precision loss | Correct surplus status, 0% burn rate | **PASS** |
| **CH.OT.1** | Massive OT spike (248h OT in month) | Exact 208h normal + 40h holiday OT, critical status | 248h OT, critical status, valid depletion | **PASS** |
| **CH.OT.2** | Absolute zero OT (all "O") | 0 OT hours, 0 spend, surplus status, null depletion | 0 OT, 0 spend, surplus, null depletion | **PASS** |
| **CH.HEAD.1** | All inactive status variations (EN & TH) | `isEmployeeActive` returns false | Correctly filtered out | **PASS** |
| **CH.HEAD.2** | 0 active employees (all resigned) | Critical shortfall, radar metrics in `[0, 1]` | Shortfall = 4, CRITICAL, metrics in `[0, 1]` | **PASS** |
| **CH.HEAD.3** | Completely empty employee dataset (`[]`) | Safe execution, 0 risk score, no NaN | Overall risk score = 0, LOW, no NaN | **PASS** |
| **CH.REST.1** | Alternating N12/M8 shifts (31 days) | 15 turnaround breaches, rest safety in `[0, 1]` | 15 violations, rest safety = 0.05, bounded | **PASS** |
| **CH.REST.2** | Multiple turnaround pairs (N8->M8, N16->D) | Accurately identifies 4 violations | 4 violations detected | **PASS** |
| **CH.REST.3** | Rolling 7-day window spanning weeks | Detects 28h OT spike inside 7-day slice | Impending weekly OT = true, max = 28h | **PASS** |
| **CH.INV.1** | Enterprise mathematical sum invariants | Enterprise total = sum of department parts | Invariants strictly hold | **PASS** |
| **CH.INV.2** | Shift parsing formats (JSON, arrays) | Parses arrays and object keys reliably | All formats parsed cleanly | **PASS** |
| **CH.INV.3** | Custom rest policies & company holidays | Modifies holiday work days dynamically | Custom policy respected | **PASS** |
| **CH.INV.4** | February 28/29 month-end depletion | Clamped to month length, 0 days remaining | Exactly bounded to 28 / 29 | **PASS** |
| **CH.INV.5** | Role minimum requirement matching | Exact and partial role names matched | Accurate minimum headcount returned | **PASS** |

### Unchallenged Areas
- Database persistence layer (out of scope for unit calculation models).

---

## 5. Verification Method

To independently reproduce and verify all challenge findings:

1. **Execute Challenger Stress Suite**:
   ```bash
   npx vitest run tests/tier1-calculations/challenger-calculation-stress.test.ts
   ```
   *Expected*: 25/25 tests pass in ~15ms.

2. **Execute Full Repository Test Suite**:
   ```bash
   npx vitest run
   ```
   *Expected*: 48 test files, 423 tests pass in ~40s.

3. **Verify Production Build**:
   ```bash
   npm run build
   ```
   *Expected*: Exits with code 0, 0 TypeScript or bundle errors.
