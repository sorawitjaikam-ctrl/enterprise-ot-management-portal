## 2026-08-21T17:06:25Z
You are Explorer 1 for the E2E Testing Track of the Enterprise OT Management Portal project.
Your working directory: C:\Users\ssrwj\Documents\antigravity\mysterious-einstein\.agents\e2e_explorer_1

Read the following requirement and project files:
1. ORIGINAL_REQUEST: C:\Users\ssrwj\Documents\antigravity\mysterious-einstein\.agents\ORIGINAL_REQUEST.md
2. PROJECT: C:\Users\ssrwj\Documents\antigravity\mysterious-einstein\PROJECT.md

Investigate the codebase for:
1. OT Calculations & Payroll Core:
   - Identify where `getEmpMonthlyOtPayBreakdown`, hourly rate `salary/240 * 1.5`, OT rates 1.5x (weekday), 1.0x (holiday), 3.0x (holiday OT), OND (8h), budget limit (150,000 THB), Plan vs Actual diff, budget utilization % are implemented in `src/App.tsx` or other modules.
   - Note exact formula inputs, types, default values, edge cases (zero salary, missing shifts, leap years, negative diffs, budget overflow >150k THB).
2. CSV Export Routines:
   - Identify all 6 CSV export handlers (Shift CSV, Employee CSV, Job Value CSV, Report CSV, OT Record CSV, CsvTemplateHubModal downloads).
   - Document the CSV headers, escaping rules, data formats, and download mechanisms.
3. Test Case Proposals:
   - Propose at least 5 Tier 1 test cases per feature (covering calculations, budget formulas, diff calculations, CSV structure).
   - Propose boundary cases (0 salary, 0 hours, high salary, 150k THB budget edge, 31-day months, special characters in names for CSV).

Write your findings to C:\Users\ssrwj\Documents\antigravity\mysterious-einstein\.agents\e2e_explorer_1\report.md and create a handoff.md.
Send a completion message back when done.
