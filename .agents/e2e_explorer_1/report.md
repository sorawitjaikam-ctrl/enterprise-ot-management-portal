# E2E Testing Track — Explorer 1 Investigation Report: Core OT Calculations, Payroll Engine, & CSV Export Routines

**Working Directory**: `C:\Users\ssrwj\Documents\antigravity\mysterious-einstein\.agents\e2e_explorer_1`  
**Date / Timestamp**: 2026-08-22T00:08:30+07:00  
**Target Focus**: Tier 1 Unit & Calculation Test Specs, Calculation Invariants, 6 CSV Export Routines, Boundary Conditions

---

## 1. Executive Summary

This report establishes the complete mathematical, algorithmic, and structural specifications for the Enterprise OT Management Portal's:
1. **OT Calculation & Payroll Engine** (`getEmpMonthlyOtPayBreakdown`, hourly rate math, 1.5x / 1.0x / 3.0x multipliers, OND on-duty shifts, Plan vs Actual diffs, and 150,000 THB budget utilization).
2. **6 CSV Export Routines** (Shift CSV, Employee CSV, Job Value CSV, Report CSV, OT Record CSV, and CSV Template Hub downloads).
3. **Comprehensive Tier 1 Test Case Catalog** with explicit inputs, expected outputs, mathematical proofs, and boundary condition matrices.

---

## 2. Core OT Calculations & Payroll Engine Analysis

### 2.1 Shift Definition & OT Hours Mapping (`getShiftOtHours`)
Implemented in `src/App.tsx:122-130`:

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

#### Shift Mapping Matrix:
| Shift Code | Description | Standard Hours | Regex Match | OT Hours Returned | Visual Style (`getShiftStyle`) |
|------------|-------------|----------------|-------------|-------------------|---------------------------------|
| `M8` | Morning Regular | 8 hrs | `8` | $\max(0, 8-8) = 0$ | Light blue (`#dce6f1`) |
| `A8` | Afternoon Regular | 8 hrs | `8` | $\max(0, 8-8) = 0$ | Light yellow (`#fff2cc`) |
| `N8` | Night Regular | 8 hrs | `8` | $\max(0, 8-8) = 0$ | Light peach (`#fce4d6`) |
| `M12` | Morning + 4h OT | 12 hrs | `12` | $\max(0, 12-8) = 4$ | Soft blue (`#ddebf7`, text `#4472c4`) |
| `A12` | Afternoon + 4h OT | 12 hrs | `12` | $\max(0, 12-8) = 4$ | Soft yellow (`#fff2cc`) |
| `N12` | Night + 4h OT | 12 hrs | `12` | $\max(0, 12-8) = 4$ | Soft peach (`#fce4d6`, text `#ff0000`) |
| `M16` | Morning + 8h OT | 16 hrs | `16` | $\max(0, 16-8) = 8$ | Dark blue (`#1f4e79`, text white) |
| `N16` | Night + 8h OT | 16 hrs | `16` | $\max(0, 16-8) = 8$ | Vivid red (`#ff0000`, text white) |
| `OND` | On Duty | 8 hrs | Explicit check | $8$ | Cyan (`#00ffff`, text black) |
| `D` | Anchored / Idle | 0 hrs | null | $0$ | Gray (`#aeaaaa`, text `#595959`) |
| `O` / `OFF`| Off Day | 0 hrs | null | $0$ | White (`#ffffff`, text slate-400) |
| `""` / `null` | Unassigned | 0 hrs | null | $0$ | Default slate |

---

### 2.2 Monthly OT & Payroll Breakdown Engine (`getEmpMonthlyOtPayBreakdown`)
Implemented in `src/App.tsx:185-234`:

#### Mathematical Formulas & Rates:
1. **Base Hourly Rate**:
   $$\text{hourlyRate} = \begin{cases} \frac{\text{salary}}{240} & \text{if } \text{salary} > 0 \\ 62.5 & \text{if } \text{salary} \le 0 \text{ or undefined} \end{cases}$$
   *(Note: 240 hours represents 30 days $\times$ 8 standard working hours per month. Default salary is 15,000 THB $\rightarrow 15000 / 240 = 62.50$ THB/hr).*

2. **Calendar Days & Weekend Detection**:
   - `totalDays = new Date(yr, mn, 0).getDate()` (automatically handles 28, 29, 30, 31 day months).
   - `isSunday = dayOfWeek === 0` (derived from Thai day names `dayNames[dateObj.getDay()].startsWith("อา")`).
   - `isOff = shift === "O" || shift === "OFF"`.

3. **Classification Rules**:
   - **Holiday Work Day** (`holidayWorkDays`): Incremented by 1 when the employee works on Sunday (`isSunday && !isOff`) or when shift is `OND` (regardless of day).
   - **Holiday OT Hours** (`holidayOt`):
     - On Sunday (`isSunday && !isOff`): `holidayOt += otHrs > 0 ? otHrs : (shift === "OND" ? 8 : 0)`.
     - On Weekday with `OND`: `holidayOt += 8`.
   - **Normal Weekday OT Hours** (`normalOt`):
     - On Monday–Saturday (non-Sunday) with non-`OND` shift: `normalOt += otHrs`.

4. **Total OT Pay (THB)**:
   $$\text{totalOtPay} = \text{Math.round}\left( \left( \text{normalOt} \times 1.5 + \text{holidayOt} \times 3.0 + \text{holidayWorkDays} \times 8 \times 1.0 \right) \times \text{hourlyRate} \right)$$
   - **1.5x Multiplier**: Standard weekday overtime hours.
   - **3.0x Multiplier**: Sunday / Holiday overtime hours (above 8 standard hours, or `OND`).
   - **1.0x Multiplier**: Sunday regular working hours (8 hours base wage for working on a rest day).

5. **Total OT Hours & Salary Ratio**:
   $$\text{totalOtHours} = \text{normalOt} + \text{holidayOt}$$
   $$\text{otPctSalary} = \begin{cases} \left( \frac{\text{totalOtPay}}{\text{salary}} \times 100 \right).\text{toFixed}(2) & \text{if } \text{salary} > 0 \\ \text{"0.00"} & \text{if } \text{salary} \le 0 \end{cases}$$

---

### 2.3 Plan vs Actual Difference Engine
Implemented in `src/App.tsx:249-255` and `src/App.tsx:8010-8089`:

1. **Shift Mismatch Detection (`isPlanActualMismatch`)**:
   ```typescript
   export const isPlanActualMismatch = (planShift: string, actualShift: string): boolean => {
     if (!planShift || !actualShift) return false;
     const p = planShift.trim();
     const a = actualShift.trim();
     return p !== "" && p !== "O" && p !== "OFF" && p !== a;
   };
   ```

2. **Diff Calculations (Actual - Plan)**:
   - $\Delta \text{NormalOt} = \text{actualData.normalOt} - \text{planData.normalOt}$
   - $\Delta \text{HolidayOt} = \text{actualData.holidayOt} - \text{planData.holidayOt}$
   - $\Delta \text{HolidayWorkDays} = \text{actualData.holidayWorkDays} - \text{planData.holidayWorkDays}$
   - $\Delta \text{TotalOtPay} = \text{actualData.totalOtPay} - \text{planData.totalOtPay}$
   - $\Delta \text{OtPctSalary} = (\text{actualData.otPctSalary} - \text{planData.otPctSalary}).\text{toFixed}(2)$

3. **Diff Rendering Contract (`renderDiff`)**:
   - $\Delta > 0$: Prefix `+`, formatted in **Red/Rose** (`text-rose-600` / `text-rose-700`), e.g., `+4`, `+1,500`.
   - $\Delta < 0$: No extra sign (already negative), formatted in **Emerald** (`text-emerald-600` / `text-emerald-700`), e.g., `-4`, `-1,500`.
   - $\Delta = 0$: Display `±0`, formatted in **Slate** (`text-slate-400` / `text-slate-500`).

---

### 2.4 Department Budget & Utilization Metrics
Implemented across `server.ts:751-755`, `functions/api/[[path]].ts:217-232`, and `src/App.tsx:3999-4010`:

1. **Default Budget Limit**: `DEFAULT_BUDGET_MAX = 150,000` THB per department per month.
2. **Default OT Rate**: `DEFAULT_OT_RATE = 300` THB/hr (or employee-specific salary rate in detailed aggregation).
3. **Formulas**:
   $$\text{budgetUsed} = \text{otHours} \times \text{otRatePerHour}$$
   $$\text{budgetUtilization} = \min\left(100, \text{Math.round}\left( \frac{\text{budgetUsed}}{\text{budgetMax}} \times 100 \right)\right)$$
   $$\text{status} = \begin{cases} \text{"Warning"} & \text{if } \text{budgetUtilization} > 95 \text{ (or } > 90 \text{ in UI)} \\ \text{"On Track"} & \text{otherwise} \end{cases}$$

---

## 3. Comprehensive Analysis of the 6 CSV Export Routines

| # | Handler Name | Source File & Line | Trigger UI Location | Output Filename Format | Number of Columns |
|---|--------------|--------------------|---------------------|------------------------|-------------------|
| 1 | `handleExportShiftsCsv` | `src/App.tsx:3815` | Shift Matrix tab: "CSV ทำจ่าย OT" | `แบบสรุปทำจ่ายค่าล่วงเวลา_{month}_{dept}.csv` | 12 base + Days in Month (31 max $\rightarrow$ 43 cols) |
| 2 | `handleExportEmployees` | `src/App.tsx:3136` | Employee Roster tab: "ส่งออกข้อมูล (Export CSV)" | `employees_database_{YYYY-MM-DD}.csv` | 19 columns |
| 3 | `handleExportJobValueCsv` | `src/App.tsx:2452` | Job Value view: "ส่งออกข้อมูล (Export CSV)" | `JobValue_Export_{YYYY-MM-DD}.csv` | 45 columns |
| 4 | `handleExportCsvReport` | `src/App.tsx:4341` | Dashboard / Report: "ส่งออกรายงานรวม" | `OT_Executive_Report_{month}.csv` | 6 columns |
| 5 | `handleExportOtRecordsCsv` | `src/App.tsx:840` | OT Records view: "ส่งออก CSV" | `OT_Records_{year}_{month}_{dept}.csv` | 6 columns |
| 6 | `downloadCsvFile` / Templates Hub | `src/components/CsvTemplateHubModal.tsx:9` | Modal: "ดาวน์โหลดแม่แบบ" | Template specific (e.g. `employee_roster_template.csv`) | 10 to 45 columns |

---

### 3.1 Detailed CSV Handler Specifications

#### 1. `handleExportShiftsCsv` (`src/App.tsx:3815-3893`)
- **Encoding & BOM**: Prepends UTF-8 Byte Order Mark (`\ufeff`) for Microsoft Excel Thai character compatibility.
- **Header Structure**:
  ```csv
  รหัสพนักงาน,ชื่อ-นามสกุล,แผนก,ตำแหน่ง,ฐานเงินเดือน (บาท),อัตราค่าจ้างต่อ ชม. (บาท),OT วันทำงานปกติ 1.5x (ชม.),ทำงานวันหยุด 1.0x (วัน),OT วันหยุด 3.0x (ชม.),ยอดรวม ชม. OT ทั้งเดือน (ชม.),ยอดเงินทำจ่ายค่าล่วงเวลา (บาท),% เทียบฐานเงินเดือน,"1 (จ-ส)","2 (อา)",...,"31 (จ-ส)"
  ```
- **Escaping**: `esc = (v) => '"' + String(v ?? "").replace(/"/g, '""') + '"'`
- **Data Mapping**:
  - `hourlyRate`: `(salary / 240).toFixed(2)`
  - `totalOtHoursMonth`: `breakdown.normalOt + breakdown.holidayOt + (breakdown.holidayWorkDays * 8)`
  - `dailyOtHours`: Extracts daily OT for each day (OND $\rightarrow$ 8, Sunday M12 $\rightarrow$ 4, Weekday M12 $\rightarrow$ 4, OFF $\rightarrow$ 0).
- **Download Mechanism**: `Blob` with `type: "text/csv;charset=utf-8;"`, `URL.createObjectURL`, programmatic link click and cleanup.

#### 2. `handleExportEmployees` (`src/App.tsx:3136-3224`)
- **Encoding & BOM**: `\ufeff` BOM.
- **19 Columns**:
  `รหัสพนักงาน`, `คำนำหน้า`, `ชื่อ`, `นามสกุล`, `ชื่อเล่น`, `ตำแหน่ง`, `แผนก`, `ฝ่าย`, `ฐานเงินเดือน ปี 2568`, `วันเกิด`, `อายุตัว`, `คำนวณอายุตัว`, `วันเริ่มงาน`, `อายุงาน`, `วันที่ผ่านทดลองงาน`, `ปฏิทินทำงาน`, `เป้าหมาย OT`, `กลุ่มการทำงาน`, `รหัสกะรายวัน`
- **Department Normalization**: Maps `inter2` $\rightarrow$ "INTER 2", `inter3` $\rightarrow$ "INTER 3", `inter5` $\rightarrow$ "INTER 5", `inter7` $\rightarrow$ "INTER 7", `heavy` $\rightarrow$ "Heavy Machine", `ecc` $\rightarrow$ "ECC".
- **Shifts Column**: Serialized as comma-delimited shift codes inside quoted string (e.g. `"M12,M12,A12,A12,OFF,OFF"`).

#### 3. `handleExportJobValueCsv` (`src/App.tsx:2452-2486`)
- **45 Columns**:
  1–5: `empId`, `empName`, `Department`, `Position`, `Status`  
  6–9: `Avg_Revenue`, `Avg_Cost`, `Profit_2026`, `Profit_2025`  
  10–21: `Revenue_Jan` ... `Revenue_Dec` (12 months)  
  22–33: `Cost_Jan` ... `Cost_Dec` (12 months)  
  34–45: `Profit_Jan` ... `Profit_Dec` (12 months)  
- **Download URI**: Data URI string `data:text/csv;charset=utf-8,\uFEFF` with `encodeURI()`.

#### 4. `handleExportCsvReport` (`src/App.tsx:4341-4369`)
- **Encoding & BOM**: `\ufeff` BOM.
- **6 Columns**:
  `แผนก`, `จำนวนพนักงาน (คน)`, `ชั่วโมง OT รวม (ชม.)`, `งบประมาณที่ใช้จริง (บาท)`, `สัดส่วนการใช้งบ (%)`, `สถานะงบประมาณ`
- **Rows**: Iterates `reportDepartments`, pulls `getDynamicDeptOt` and `budgetUtilization%`.

#### 5. `handleExportOtRecordsCsv` (`src/App.tsx:840-858`)
- **Encoding & BOM**: `\ufeff` BOM.
- **6 Columns**:
  `วันที่`, `รหัสพนักงาน`, `ชื่อพนักงาน`, `แผนก`, `รหัสกะ`, `ชั่วโมง OT`
- **Formatting**: Dates in ISO format `YYYY-MM-DD`, dept mapped from `DEPT_LABELS`.

#### 6. `CsvTemplateHubModal` (`src/components/CsvTemplateHubModal.tsx:9-131`)
- **5 Standard Import Templates**:
  1. `employee_roster_template.csv` (20 ingestion keys matching Roster importer)
  2. `job_value_financials_template.csv` (45 headers matching Job Value importer)
  3. `shift_schedule_roster_template.csv` (`empId`, `empName`, `deptId`, `Day1` ... `Day31`)
  4. `leave_records_template.csv` (10 headers: `id`, `empId`, `empName`, `deptId`, `leaveType`, `startDate`, `endDate`, `totalDays`, `reason`, `status`)
  5. `ot_daily_records_template.csv` (8 headers: `id`, `date`, `employeeId`, `employeeName`, `deptId`, `shiftCode`, `otHours`, `note`)
- **Download Routine**: `downloadCsvFile(filename, headers, rows)` uses RFC 4180 quote escaping, UTF-8 BOM, and staggered setTimeout for batch download.

---

## 4. Tier 1 Test Case Catalog Proposals

### Suite 1: Shift OT Extraction (`getShiftOtHours`)

| Test ID | Input `shift` | Expected Return | Rule / Rationale |
|---------|---------------|-----------------|------------------|
| `T1-OT-01` | `"M8"` | `0` | Standard 8-hour shift, 0 OT |
| `T1-OT-02` | `"M12"` | `4` | $12 - 8 = 4$ OT hours |
| `T1-OT-03` | `"N16"` | `8` | $16 - 8 = 8$ OT hours |
| `T1-OT-04` | `"OND"` | `8` | On-Duty shift explicitly grants 8 OT hours |
| `T1-OT-05` | `"OFF"` / `"O"` / `"D"` | `0` | Rest / anchor days grant 0 OT hours |
| `T1-OT-06` | `"A12"` | `4` | Afternoon 12-hour shift grants 4 OT hours |
| `T1-OT-07` | `"INVALID_CODE"` | `0` | Unrecognized strings without digits return 0 |

---

### Suite 2: Monthly OT Pay Breakdown (`getEmpMonthlyOtPayBreakdown`)

| Test ID | Employee Setup | Month Key | Expected Breakdown Output | Mathematical Proof |
|---------|----------------|-----------|---------------------------|---------------------|
| `T1-PAY-01` | `salary: 24000`, 10x `M12` (weekday), rest `OFF` | `"2026-08"` | `normalOt: 40, holidayOt: 0, holidayWorkDays: 0, totalOtHours: 40, hourlyRate: 100, totalOtPay: 6000, otPctSalary: "25.00"` | Hourly rate $= 24000/240 = 100$.<br>Pay $= (40 \times 1.5 + 0 + 0) \times 100 = 6,000$.<br>Pct $= (6000 / 24000) \times 100 = 25.00\%$. |
| `T1-PAY-02` | `salary: 15000`, 4x `M12` on Sundays, rest `OFF` | `"2026-08"` | `normalOt: 0, holidayOt: 16, holidayWorkDays: 4, totalOtHours: 16, hourlyRate: 62.5, totalOtPay: 5000, otPctSalary: "33.33"` | Hourly rate $= 15000/240 = 62.5$.<br>Pay $= (0 + 16 \times 3.0 + 4 \times 8 \times 1.0) \times 62.5 = (48 + 32) \times 62.5 = 80 \times 62.5 = 5,000$.<br>Pct $= (5000/15000) \times 100 = 33.33\%$. |
| `T1-PAY-03` | `salary: 30000`, 2x `OND` on weekdays, rest `OFF` | `"2026-08"` | `normalOt: 0, holidayOt: 16, holidayWorkDays: 2, totalOtHours: 16, hourlyRate: 125, totalOtPay: 8000, otPctSalary: "26.67"` | Hourly rate $= 30000/240 = 125$.<br>Pay $= (0 + 16 \times 3.0 + 2 \times 8 \times 1.0) \times 125 = (48 + 16) \times 125 = 64 \times 125 = 8,000$.<br>Pct $= (8000/30000) \times 100 = 26.67\%$. |
| `T1-PAY-04` | `salary: 0` (boundary), 5x `M12` (weekday) | `"2026-08"` | `salary: 15000, hourlyRate: 62.5, normalOt: 20, totalOtPay: 1875, otPctSalary: "12.50"` | Fallback salary $= 15,000$, hourly rate $= 62.5$.<br>Pay $= (20 \times 1.5) \times 62.5 = 30 \times 62.5 = 1,875$. |
| `T1-PAY-05` | `salary: 48000`, mixed 10x `M12` (weekday) + 2x `M16` (Sunday) | `"2026-08"` | `normalOt: 40, holidayOt: 16, holidayWorkDays: 2, totalOtHours: 56, hourlyRate: 200, totalOtPay: 24800, otPctSalary: "51.67"` | Hourly rate $= 48000/240 = 200$.<br>Pay $= (40 \times 1.5 + 16 \times 3.0 + 2 \times 8 \times 1.0) \times 200 = (60 + 48 + 16) \times 200 = 124 \times 200 = 24,800$.<br>Pct $= (24800/48000) \times 100 = 51.67\%$. |

---

### Suite 3: Plan vs Actual Diff Calculations

| Test ID | Plan Shifts | Actual Shifts | Expected Diff Metrics | Visual Display Sign & Color |
|---------|-------------|---------------|-----------------------|------------------------------|
| `T1-DIFF-01` | 5x `M8` (0 OT) | 5x `M12` (20 OT) | `diffNormalOt: +20`, `diffTotalOtPay: > 0` | Prefix `+`, Rose color (`text-rose-600`) |
| `T1-DIFF-02` | 5x `M12` (20 OT) | 5x `M8` (0 OT) | `diffNormalOt: -20`, `diffTotalOtPay: < 0` | Negative sign, Emerald color (`text-emerald-600`) |
| `T1-DIFF-03` | 5x `M12` (20 OT) | 5x `M12` (20 OT) | `diffNormalOt: 0`, `diffTotalOtPay: 0` | Text `±0`, Slate color (`text-slate-400`) |
| `T1-DIFF-04` | 0 Sunday work | 1x `M12` on Sunday | `diffHolidayWorkDays: +1`, `diffHolidayOt: +4` | Prefix `+`, Rose color (`text-rose-600`) |
| `T1-DIFF-05` | `isPlanActualMismatch("M8", "M12")` | N/A | Returns `true` | Cell gets red border outline (`outline-red-500`) |

---

### Suite 4: Department Budget Utilization & Status

| Test ID | Total OT Hours | Emp Count | Budget Limit | Expected `budgetUsed` | Expected `budgetUtilization` | Expected `status` |
|---------|----------------|-----------|--------------|-----------------------|------------------------------|-------------------|
| `T1-BDG-01` | `100 hrs` | 10 | 150,000 THB | 30,000 THB | $20\%$ | `"On Track"` |
| `T1-BDG-02` | `450 hrs` | 10 | 150,000 THB | 135,000 THB | $90\%$ | `"On Track"` (or UI limit edge) |
| `T1-BDG-03` | `500 hrs` | 10 | 150,000 THB | 150,000 THB | $100\%$ | `"Warning"` ($>95\%$) |
| `T1-BDG-04` | `600 hrs` | 10 | 150,000 THB | 180,000 THB | $100\%$ (capped at 100%) | `"Warning"` |
| `T1-BDG-05` | `0 hrs` | 10 | 150,000 THB | 0 THB | $0\%$ | `"On Track"` |

---

### Suite 5: CSV Export Generator Structure & RFC 4180 Compliance

| Test ID | CSV Handler | Test Objective | Assertion |
|---------|-------------|----------------|-----------|
| `T1-CSV-01` | `handleExportShiftsCsv` | Verify BOM and Thai headers | Starts with `\ufeff`, includes `รหัสพนักงาน`, `ฐานเงินเดือน (บาท)`, `OT วันทำงานปกติ 1.5x (ชม.)` |
| `T1-CSV-02` | `handleExportEmployees` | Verify 19-column structure | Header row has exactly 19 comma-delimited columns, correctly escapes quotes in name/address |
| `T1-CSV-03` | `handleExportJobValueCsv` | Verify 45 financial columns | Header row has 45 columns, includes 12-month revenue/cost/profit columns |
| `T1-CSV-04` | `handleExportCsvReport` | Verify executive summary fields | Contains `แผนก`, `จำนวนพนักงาน (คน)`, `ชั่วโมง OT รวม (ชม.)`, `งบประมาณที่ใช้จริง (บาท)`, `สัดส่วนการใช้งบ (%)`, `สถานะงบประมาณ` |
| `T1-CSV-05` | `downloadCsvFile` (Hub) | RFC 4180 Escaping with quotes & commas | Text `นาย "สมชาย" ใจดี, คุมงาน` $\rightarrow$ `"""นาย """"สมชาย"""" ใจดี, คุมงาน"""` |

---

## 5. Boundary Conditions & Edge Cases Matrix

```
┌──────────────────────────────────────┬────────────────────────────────────────────────────────┬──────────────────────────────────────────┐
│ Edge Case Category                   │ Input Condition                                        │ Expected System Behavior                 │
├──────────────────────────────────────┼────────────────────────────────────────────────────────┼──────────────────────────────────────────┤
│ Zero / Negative Salary               │ `salary: 0` or `salary: -5000` or `undefined`          │ Fallback to 15,000 THB base wage,        │
│                                      │                                                        │ hourlyRate = 62.5 THB/hr, otPct = "0.00" │
├──────────────────────────────────────┼────────────────────────────────────────────────────────┼──────────────────────────────────────────┤
│ Zero Hours / All OFF                 │ 31 days of `"OFF"` or `"O"`                            │ normalOt=0, holidayOt=0, pay=0, pct=0.00 │
├──────────────────────────────────────┼────────────────────────────────────────────────────────┼──────────────────────────────────────────┤
│ Ultra-High Salary                    │ `salary: 300,000` THB/mo                               │ hourlyRate = 1,250 THB/hr, pay calculated│
│                                      │                                                        │ with exact integer rounding              │
├──────────────────────────────────────┼────────────────────────────────────────────────────────┼──────────────────────────────────────────┤
│ Exact Budget Edge                    │ `budgetUsed = 150,000` THB                             │ utilization = 100%, status = "Warning"   │
├──────────────────────────────────────┼────────────────────────────────────────────────────────┼──────────────────────────────────────────┤
│ Budget Overflow                      │ `budgetUsed = 220,000` THB (>150k THB)                 │ utilization capped at 100%, status =     │
│                                      │                                                        │ "Warning", full baht value preserved     │
├──────────────────────────────────────┼────────────────────────────────────────────────────────┼──────────────────────────────────────────┤
│ Month Day Counts (Leap Year)         │ Month "2024-02" (29 days) vs "2026-02" (28 days)       │ Dynamic `Date(yr, mn, 0).getDate()`      │
│                                      │ vs "2026-08" (31 days)                                 │ iterates exactly total month days        │
├──────────────────────────────────────┼────────────────────────────────────────────────────────┼──────────────────────────────────────────┤
│ Missing / Corrupt Shifts Object      │ `emp.shifts = null` / `"{invalid json"`                │ Falls back to calendarType cycle pattern │
│                                      │                                                        │ or safe empty array without crashing     │
├──────────────────────────────────────┼────────────────────────────────────────────────────────┼──────────────────────────────────────────┤
│ Special Characters in CSV            │ Name: `นายสมชาย "หัวหน้ากะ", ฝ่ายช่าง (A&B)`          │ Properly double-quoted and escaped in    │
│                                      │                                                        │ CSV output to avoid column shifting      │
└──────────────────────────────────────┴────────────────────────────────────────────────────────┴──────────────────────────────────────────┘
```

---

## 6. Recommendations for Test Implementation

1. **Vitest Unit Test File**: Create `tests/e2e/tier1_calculations.test.ts` to execute all 25 proposed Tier 1 test cases directly against the exported functions in `src/App.tsx` (`getShiftOtHours`, `getEmpMonthlyOtPayBreakdown`, `getEmpCalculatedOt`, `isPlanActualMismatch`, `downloadCsvFile`).
2. **Deterministic Time Fixtures**: Standardize month keys (`"2026-08"` for 31-day, `"2026-02"` for 28-day, `"2024-02"` for 29-day leap year) to avoid ambient timezone or clock drift during CI test runs.
3. **CSV Export Mocking**: In test environments where `document.createElement("a")` or `URL.createObjectURL` is called, mock `Blob` and DOM anchor triggers to assert exact CSV text content and BOM presence.
