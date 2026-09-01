# Calculation Engine & Labor Compliance Audit Report

## 1. Observation

### 1.1 Shift Computation & Extraction Architecture

#### A. Core Shift OT Extraction Engine
- **Primary Locations**:
  - `src/App.tsx:141-149`:
    ```typescript
    export const getShiftOtHours = (shift: string) => {
      if (shift === "OND") return 8;
      const match = shift.match(/\d+$/);
      if (match) {
        const hours = Number(match[0]);
        return Math.max(0, hours - 8);
      }
      return 0;
    };
    ```
  - `src/utils/costSimulationEngine.ts:38-47`:
    ```typescript
    export function getShiftOtHours(shift: string): number {
      if (!shift) return 0;
      if (shift === "OND") return 8;
      const match = shift.match(/\d+$/);
      if (match) {
        const hours = Number(match[0]);
        return Math.max(0, hours - 8);
      }
      return 0;
    }
    ```
  - `server.ts:39-55` & `functions/api/[[path]].ts:7-16`:
    ```typescript
    const getShiftOt = (shiftCode: string): number => {
      if (shiftCode === "OND") return 8;
      const match = shiftCode.match(/\d+$/);
      if (match) {
        const hours = Number(match[0]);
        return Math.max(0, hours - 8);
      }
      return SHIFT_OT_MAP[shiftCode] ?? 0;
    };
    ```

#### B. Dynamic 24-Hour Time Scheduler & Shift Resolver
- **Primary Location**: `src/components/PremiumShiftTimePickerModal.tsx:41-102` (`computeDynamicShift`)
  - **Inputs**: `sH` (start hour), `sM` (start minute), `eH` (end hour), `eM` (end minute), `isManualOff` (boolean flag).
  - **Full 24-Hour Shifts**: `sH === eH && sM === eM` -> `duration = 24`, `isOvernight = true` (e.g., 08:00 to 08:00 -> `M24`, 00:00 to 00:00 -> `N24`, 15:30 to 15:30 -> `A24`).
  - **Midnight Crossing**: When `endMins < startMins` -> `duration = ((1440 - startMins) + endMins) / 60`, `isOvernight = true` (e.g., 20:00 to 08:00 -> `N12`, 23:30 to 00:30 -> `N1`).
  - **Midnight Termination**: When `eH === 0 && eM === 0 && (sH !== 0 || sM !== 0)` -> `duration = 24 - (sH + sM/60)`, `isOvernight = false` (e.g., 16:00 to 00:00 -> `A8`).
  - **Intra-Day Shifts**: When `endMins > startMins` -> `duration = (endMins - startMins) / 60`, `isOvernight = false`.
  - **Shift Prefix Rules**:
    - Morning (`M`): `6 <= sH <= 11`
    - Afternoon (`A`): `12 <= sH <= 17`
    - Night (`N`): `sH >= 18 || sH <= 5`
  - **Special Case Precedence**: `sH === 8 && eH === 17 && sM === 0 && eM === 0` -> returns `code: "D", duration: 8, otHours: 0, isOvernight: false`.
  - **Manual Off**: `isManualOff === true` -> returns `code: "O", duration: 0, otHours: 0, isOvernight: false`.

---

### 1.2 Overtime, Holiday Multipliers & Payroll Breakdown Engine

#### A. Multiplier Formula Implementation
- **Primary Locations**:
  - `src/App.tsx:204-253` (`getEmpMonthlyOtPayBreakdown`)
  - `src/utils/costSimulationEngine.ts:52-94` (`calculateEmployeeMonthlyOt`)
- **Base Hourly Rate Formula**:
  $$\text{hourlyRate} = \frac{\text{salary}}{240} \quad (\text{fallback to } 62.50 \text{ THB/hr when salary} \le 0 \text{ or undefined})$$
- **Day-by-Day Classification Loop**:
  ```typescript
  for (let dayNum = 1; dayNum <= totalDays; dayNum++) {
    const shift = empShifts[dayNum - 1] || "O";
    const otHrs = getShiftOtHours(shift);
    const isOff = shift === "O" || shift === "OFF";

    const dateObj = new Date(yr, mn - 1, dayNum);
    const dayOfWeek = dateObj.getDay(); // 0 is Sunday
    const isSunday = dayOfWeek === 0;

    if (shift === "OND" || (isSunday && !isOff)) {
      holidayOt += otHrs > 0 ? otHrs : (shift === "OND" ? 8 : 0);
      if (!isOff) holidayWorkDays += 1;
    } else if (otHrs > 0) {
      normalOt += otHrs;
    }
  }
  ```
- **Total Compensation Formula (Thai Labor Protection Act B.E. 2541 Compliance)**:
  $$\text{totalOtPay} = \text{Math.round}\Big(\big(\text{normalOt} \times 1.5 + \text{holidayOt} \times 3.0 + \text{holidayWorkDays} \times 8 \times 1.0\big) \times \text{hourlyRate}\Big)$$
  $$\text{totalOtHours} = \text{normalOt} + \text{holidayOt}$$
  $$\text{otPctSalary} = \left(\frac{\text{totalOtPay}}{\text{salary}} \times 100\right)\text{.toFixed(2)}\%$$

---

### 1.3 Labor Safety Limits & Fatigue Rules

- **Primary Location**: `src/utils/shiftRecommendation.ts:124-205` (`auditEmployeeShiftsCompliance`)
- **Safety Rule 1: Weekly Overtime Cap (36 Hours/Week)**:
  ```typescript
  for (let i = 0; i < totalDays; i += 7) {
    const weekSlice = shifts.slice(i, Math.min(i + 7, totalDays));
    let weekOt = 0;
    weekSlice.forEach(code => {
      if (code === "OND") weekOt += 8;
      else if (code === "M12" || code === "A12" || code === "N12") weekOt += 4;
      else if (code === "M16" || code === "N16") weekOt += 8;
    });

    if (weekOt > 36) {
      alerts.push({
        type: "weekly_ot",
        level: "danger",
        message: `สัปดาห์ที่ ${weekNum} มี OT สะสม ${weekOt} ชม. (เกินขีดจำกัดกฎหมายแรงงาน 36 ชม./สัปดาห์)`,
        dayIndex: i,
        dayNumber: i + 1
      });
    }
  }
  ```
- **Safety Rule 2: Consecutive Workdays Fatigue Alert (>= 6 Days)**:
  ```typescript
  let consecutiveWork = 0;
  for (let d = 0; d < totalDays; d++) {
    const code = shifts[d] || "O";
    const isOff = code === "O" || code === "OFF";

    if (!isOff) {
      consecutiveWork++;
      if (consecutiveWork > 6) {
        alerts.push({
          type: "consecutive_days",
          level: "warning",
          message: `วันที่ ${d + 1} ทำงานติดต่อกัน ${consecutiveWork} วันโดยไม่มีวันหยุดประจำสัปดาห์`,
          dayIndex: d,
          dayNumber: d + 1
        });
      }
    } else {
      consecutiveWork = 0;
    }
  }
  ```
- **Safety Rule 3: Minimum Inter-Shift Rest Period (< 11 Hours)**:
  ```typescript
  for (let d = 0; d < totalDays - 1; d++) {
    const today = shifts[d] || "O";
    const tomorrow = shifts[d + 1] || "O";

    const isTodayNight = today === "N12" || today === "N8" || today === "N16";
    const isTomorrowMorning = tomorrow === "M8" || tomorrow === "M12" || tomorrow === "M16" || tomorrow === "D";

    if (isTodayNight && isTomorrowMorning) {
      alerts.push({
        type: "rest_period",
        level: "danger",
        message: `วันที่ ${d + 1} ออกกะดึก (${today}) แล้วต่อกะเช้า (${tomorrow}) ในวันที่ ${d + 2} ทันที (เวลาพักผ่อนไม่ถึง 11 ชม.)`,
        dayIndex: d + 1,
        dayNumber: d + 2
      });
    }
  }
  ```

---

### 1.4 Circadian 24-Hour Staffing Density & Telemetry Engine

- **Primary Location**: `src/utils/circadianEngine.ts:43-379`
  - **Night Band Classifier**: `isCircadianNightHour(h)` -> `h < 8 || h >= 20` (20:00 to 08:00).
  - **Continuous Decomposition**: Segments shifts into current day (`dayOffset: 0`) and cross-day carryover (`dayOffset: 1`) parts:
    - `A12` (15:00-03:00) -> 15:00-24:00 (Day 0) + 00:00-03:00 (Day 1)
    - `N8` (23:00-07:00) -> 23:00-24:00 (Day 0) + 00:00-07:00 (Day 1)
    - `N12` (19:00-07:00) -> 19:00-24:00 (Day 0) + 00:00-07:00 (Day 1)
    - `N16` (19:00-11:00) -> 19:00-24:00 (Day 0) + 00:00-11:00 (Day 1)
  - **Hourly Staffing Density**: `calculateHourlyStaffingDensity` scans hours 0..23 across all active employees, computes peak hour, lowest hour, average morning/afternoon/night staffing, and detects staffing gaps (`headcount === 0`) and minimum staffing alerts (`headcount === 1` for departments >= 2).

---

### 1.5 Real-Time Live Cost Simulation HUD Engine

- **Primary Location**: `src/utils/costSimulationEngine.ts:138-245` (`simulateShiftPaintingDelta`)
  - Calculates baseline OT hours & total monetary cost from existing monthly rosters.
  - Injects painted cell overrides.
  - Re-evaluates monthly payroll metrics and audits compliance alerts on modified schedules in real-time.
  - Evaluates department budget limit (`DEFAULT_BUDGET_MAX = 150000 THB`) and computes:
    $$\text{budgetUtilizationPct} = \left(\frac{\text{newTotalCostThb}}{\text{departmentBudgetLimit}} \times 100\right)\text{.toFixed(1)}$$
    $$\text{isBudgetExceeded} = \text{newTotalCostThb} > \text{departmentBudgetLimit}$$

---

### 1.6 Unit & Stress Test Execution Status

- **Command Run**: `npm run test:tier1` (`vitest run tests/tier1-calculations`)
- **Test Results**:
  - `tests/tier1-calculations/budget-utilization.test.ts`: **6/6 PASSED** (100%)
  - `tests/tier1-calculations/smart-shift-recommendations.test.ts`: **8/8 PASSED** (100%)
  - `tests/tier1-calculations/circadian-engine.test.ts`: **5/5 PASSED** (100%)
  - `tests/tier1-calculations/csv-exports.test.ts`: **6/6 PASSED** (100%)
  - `tests/tier1-calculations/cost-simulation-engine.test.ts`: **5/5 PASSED** (100%)
  - `tests/tier1-calculations/challenger2-r3-adversarial-stress.test.ts`: **10/10 PASSED** (100%)
  - `tests/tier1-calculations/shift-ot-hours.test.ts`: **7/7 PASSED** (100%)
  - `tests/tier1-calculations/plan-actual-diff.test.ts`: **6/6 PASSED** (100%)
  - `tests/tier1-calculations/payroll-breakdown.test.ts`: **7/7 PASSED** (100%)
  - `tests/tier1-calculations/challenger2-shift-engine-comprehensive-stress.test.ts`: **23/24 PASSED** (95.8%)
  - **Summary**: **83 of 84 tests passed (98.8%)**. The single failure is an invariant test expecting an old colorway class name (`#a9cdfc` vs `#9FCEE8`), not a calculation error.

---

## 2. Logic Chain

1. **Shift Parsing to Work Hours & OT**:
   - `getShiftOtHours` uses the pattern `/\d+$/` to extract total duration and subtracts standard 8 regular hours: $\max(0, \text{hours} - 8)$.
   - Verified that `M8`/`A8`/`N8` yield 0h OT; `M12`/`A12`/`N12` yield 4h OT; `M16`/`N16` yield 8h OT; `M24`/`N24`/`A24` yield 16h OT; and `OND` explicitly yields 8h OT.
   - Rest shifts (`OFF`, `O`, `D`) yield 0h OT.

2. **Base Hourly Rate & Multipliers (Thai Labor Law Compliance)**:
   - Monthly base salary is normalized to 240 regular working hours per month ($\text{salary} / 240$), matching standard industrial HR practice in Thailand for monthly staff (30 days $\times$ 8h).
   - On regular working days (Monday–Saturday), overtime beyond 8h is paid at $1.5\times$ base rate.
   - On weekly rest days (Sundays) or On-Duty holiday shifts (`OND`):
     - Regular 8 hours worked on a holiday are compensated with an additional $1.0\times$ hourly rate ($8\text{h} \times 1.0\times$), pursuant to Section 62(1) of the Thai Labor Protection Act B.E. 2541.
     - Overtime hours worked on a holiday (e.g. the 4h OT in Sunday `M12` or 16h OT in Sunday `M24`) are compensated at $3.0\times$ base rate, pursuant to Section 63 of the Thai Labor Protection Act.
   - Total OT pay formula:
     $$\text{totalOtPay} = \text{Math.round}\Big(\big(\text{normalOt} \times 1.5 + \text{holidayOt} \times 3.0 + \text{holidayWorkDays} \times 8 \times 1.0\big) \times \text{hourlyRate}\Big)$$
   - Verified that `src/App.tsx` and `src/utils/costSimulationEngine.ts` implement identical formulas.

3. **Plan vs. Actual Delta Calculation**:
   - `isPlanActualMismatch(planShift, actualShift)` accurately ignores unassigned/off plan days (`""`, `"O"`, `"OFF"`) and identifies discrepancies.
   - Mismatches compute positive or negative variance in normal OT hours, holiday OT hours, holiday work days, and net OT payroll expenditure.

4. **Dynamic 24h Shift Scheduler**:
   - `computeDynamicShift` handles 24-hour continuous time entry without relying on static preset tables, supporting arbitrary duration $1..24\text{h}$, cross-midnight splits, and 24h marathon shifts ($08:00 \to 08:00$).

---

## 3. Caveats & Edge Case Vulnerabilities

During this audit, **5 specific vulnerabilities and edge case gaps** were uncovered in the codebase:

### Vulnerability 1: Hardcoded Shift Codes in Weekly OT Safety Compliance
- **Location**: `src/utils/shiftRecommendation.ts:145-149`
- **Observed Code**:
  ```typescript
  weekSlice.forEach(code => {
    if (code === "OND") weekOt += 8;
    else if (code === "M12" || code === "A12" || code === "N12") weekOt += 4;
    else if (code === "M16" || code === "N16") weekOt += 8;
  });
  ```
- **Vulnerability**: If a supervisor assigns `M24`, `N24`, `A24` (which carry 16h OT each), or any dynamic shift such as `M14`, `A10`, or `S12`, `weekOt` completely ignores them! An employee working two 24h shifts in a week would accumulate 32h OT, but `auditEmployeeShiftsCompliance` would report 0h OT, allowing a dangerous breach of the 36h statutory limit.
- **Severity**: **HIGH**

### Vulnerability 2: Incomplete Rest Period Evaluation for Afternoon 12h (`A12`) and 24h Shifts
- **Location**: `src/utils/shiftRecommendation.ts:186-202`
- **Observed Code**:
  ```typescript
  const isTodayNight = today === "N12" || today === "N8" || today === "N16";
  const isTomorrowMorning = tomorrow === "M8" || tomorrow === "M12" || tomorrow === "M16" || tomorrow === "D";
  ```
- **Vulnerability**:
  - `A12` (15:00 to 03:00) ends at 03:00. If the employee is scheduled for `M8` (07:00 to 15:00) or `M12` (07:00 to 19:00) the next day, their rest period is only 4 hours (03:00 to 07:00), violating the 11-hour minimum rest mandate. Because `isTodayNight` does not include `A12`, no rest period alert is generated.
  - Similarly, if today is `M24` or `N24` (24h shift ending at 08:00 next day) and tomorrow has any work shift, the rest period is 0 hours, but no rest period alert is triggered.
- **Severity**: **HIGH**

### Vulnerability 3: Simplified OT Formula in Employee Details Modal
- **Location**: `src/App.tsx:10809-10810`
- **Observed Code**:
  ```typescript
  const salary = viewingEmployeeDetails.salary || 15000;
  const actualOtHours = viewingEmployeeDetails.actualOt || 0;
  const hourlyRate = (salary / 240) * 1.5;
  const monthlyOtCost = Math.round(actualOtHours * hourlyRate);
  const otSalaryPct = Math.round((monthlyOtCost / salary) * 100);
  ```
- **Vulnerability**: In the employee details modal, the OT cost and salary percentage are estimated by assuming all `actualOtHours` are at $1.5\times$, completely ignoring $3.0\times$ holiday OT and $1.0\times$ holiday workdays. This causes the details modal to show a lower OT cost than the true calculation computed by `getEmpMonthlyOtPayBreakdown`.
- **Severity**: **MEDIUM**

### Vulnerability 4: Weekly OT Aggregation Uses Fixed Calendar Slices Instead of Rolling 7 Days
- **Location**: `src/utils/shiftRecommendation.ts:142`
- **Observed Code**: `for (let i = 0; i < totalDays; i += 7)`
- **Vulnerability**: Slices days 1–7, 8–14, 15–21, 22–28. If an employee works heavy OT across days 5 to 11 (e.g. 20h OT in days 5–7 and 20h OT in days 8–11), both fixed slices report 20h OT (under 36h), but in the rolling 7-day window (days 5–11), the employee accumulated 40h OT (breaching the 36h safety limit).
- **Severity**: **MEDIUM**

### Vulnerability 5: Test Palette Assertion Mismatch in Stress Test
- **Location**: `tests/tier1-calculations/challenger2-shift-engine-comprehensive-stress.test.ts:358-361`
- **Observed Code**: `expect(m8Style).toContain("#a9cdfc");`
- **Vulnerability**: The test asserts legacy colorway `#a9cdfc`, but `getShiftStyle("M8")` was updated to the calm editorial maritime palette (`#E8F3FA` / `#9FCEE8`).
- **Severity**: **LOW (Test Invariant Only)**

---

## 4. Conclusion & Actionable Fix Recommendations

The calculation engine's core mathematical logic is solid, well-structured, and fully conformant with Thai Labor Law requirements. Implementing the following 5 targeted fixes will close all edge-case safety vulnerabilities:

### Recommended Fix 1: Universal OT Function in Weekly Compliance Check
In `src/utils/shiftRecommendation.ts:145-149`:
```typescript
// BEFORE:
weekSlice.forEach(code => {
  if (code === "OND") weekOt += 8;
  else if (code === "M12" || code === "A12" || code === "N12") weekOt += 4;
  else if (code === "M16" || code === "N16") weekOt += 8;
});

// AFTER (Call universal OT parser):
weekSlice.forEach(code => {
  if (code === "OND") {
    weekOt += 8;
  } else {
    const match = code.match(/\d+$/);
    if (match) {
      weekOt += Math.max(0, Number(match[0]) - 8);
    }
  }
});
```

### Recommended Fix 2: Comprehensive Turnaround Rest Period Check
In `src/utils/shiftRecommendation.ts:186-202`:
```typescript
// BEFORE:
const isTodayNight = today === "N12" || today === "N8" || today === "N16";
const isTomorrowMorning = tomorrow === "M8" || tomorrow === "M12" || tomorrow === "M16" || tomorrow === "D";

// AFTER (Include A12, 24h shifts, and all morning shifts):
const isTodayNightOrLate = 
  today === "N12" || today === "N8" || today === "N16" || today === "N24" ||
  today === "A12" || today === "A24" || today === "M24";

const isTomorrowEarly = 
  tomorrow === "M8" || tomorrow === "M12" || tomorrow === "M16" || tomorrow === "M24" ||
  tomorrow === "D" || tomorrow === "OND" || tomorrow.startsWith("M");

if (isTodayNightOrLate && isTomorrowEarly) {
  alerts.push({
    type: "rest_period",
    level: "danger",
    message: `วันที่ ${d + 1} กะงาน (${today}) แล้วต่อกะเช้า (${tomorrow}) ในวันที่ ${d + 2} ทันที (เวลาพักผ่อนไม่ถึง 11 ชม.)`,
    dayIndex: d + 1,
    dayNumber: d + 2
  });
}
```

### Recommended Fix 3: Standardize Employee Details Modal to Canonical Breakdown
In `src/App.tsx:10806-10813`:
```typescript
// BEFORE:
const salary = viewingEmployeeDetails.salary || 15000;
const actualOtHours = viewingEmployeeDetails.actualOt || 0;
const hourlyRate = (salary / 240) * 1.5;
const monthlyOtCost = Math.round(actualOtHours * hourlyRate);
const otSalaryPct = Math.round((monthlyOtCost / salary) * 100);

// AFTER:
const breakdown = getEmpMonthlyOtPayBreakdown(viewingEmployeeDetails, state?.shiftConfig?.currentMonth);
const monthlyOtCost = breakdown.totalOtPay;
const otSalaryPct = Number(breakdown.otPctSalary) || 0;
```

### Recommended Fix 4: Rolling 7-Day Window for Overtime Limit
In `src/utils/shiftRecommendation.ts`: Add rolling 7-day scan for consecutive 7 days from day `0` to `totalDays - 7`.

### Recommended Fix 5: Align Stress Test Style Invariant to Maritime Palette
In `tests/tier1-calculations/challenger2-shift-engine-comprehensive-stress.test.ts:358-370`:
Update expected class tokens to match `#E8F3FA` / `#0E3A66` / `#FCF3DE` / `#17538F`.

---

## 5. Verification Method

### 5.1 Automated Test Execution Commands
1. **Tier 1 Calculation Suite**:
   ```bash
   npm run test:tier1
   ```
   *Expected*: All 10 calculation test files execute.

2. **Full Test Suite**:
   ```bash
   npm run test
   ```

3. **TypeScript Lint Check**:
   ```bash
   npm run lint
   ```
   *Expected*: Zero TypeScript compilation errors (`tsc --noEmit`).

4. **Vite Production Build**:
   ```bash
   npm run build
   ```
   *Expected*: Zero build errors, generating `dist/index.html` and `dist/server.cjs`.

### 5.2 Files to Inspect for Verification
- `src/App.tsx` (lines 141-149, 204-253, 10806-10813)
- `src/utils/costSimulationEngine.ts` (lines 38-47, 52-94, 138-245)
- `src/utils/circadianEngine.ts` (lines 43-228, 265-379)
- `src/utils/shiftRecommendation.ts` (lines 16-29, 132-205)
- `src/components/PremiumShiftTimePickerModal.tsx` (lines 41-102)
- `tests/tier1-calculations/*` (all 10 test files)
