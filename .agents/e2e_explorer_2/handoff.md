# Handoff Report: E2E Explorer 2 (Responsive Layouts, Sticky Columns, 19 Modals & Tier 2 / Tier 4 Test Proposals)

## 1. Observation
1. **Job Value Tab Key Mismatch**:
   - `src/components/Navbar.tsx` (line 74): `{ id: "job-value", label: "Job Value", icon: TrendingUp },`
   - `src/components/Sidebar.tsx` (line 31): `{ id: "job_value", label: "คุณค่าตำแหน่งงาน & ผลตอบแทน", icon: TrendingUp },`
   - `src/App.tsx` (lines 4389, 5050): `activeTab === "job_value" ? "Job Value" :` and `{activeTab === "job_value" && (`.
   - Result: Clicking the Job Value tab in Navbar sets `activeTab` to `"job-value"`, failing the equality check in `App.tsx` and preventing the Job Value view from rendering.

2. **Hardcoded Main App Container Padding & Margin**:
   - `src/App.tsx` (line 4414): `<main className={`flex-1 overflow-y-auto transition-all duration-300 ${isFullScreen ? "p-4" : "mt-28 p-8"}`}>`
   - On a 375px mobile screen, `p-8` (64px horizontal padding) leaves only 311px of usable content width.

3. **Roster Table 700px 5-Column Freeze Bug**:
   - `src/App.tsx` (lines 6937–7015, 7104–7129): All 5 metadata columns are pinned with absolute left offsets:
     - Col 1 (รหัสพนักงาน): `left-0 min-w-[90px] w-[90px]`
     - Col 2 (ชื่อ-นามสกุล): `left-[90px] min-w-[190px] w-[190px]`
     - Col 3 (ตำแหน่ง): `left-[280px] min-w-[160px] w-[160px]`
     - Col 4 (แผนก): `left-[440px] min-w-[110px] w-[110px]`
     - Col 5 (ฝ่าย): `left-[550px] min-w-[150px] w-[150px]`
     - Total frozen width = 700px. On mobile (<640px) or tablet (768px), this obscures the entire viewport and prevents touch scrolling.

4. **Shift Matrix Column Width & Sticky Anchor Inconsistencies**:
   - Worker ID/Name column width is hardcoded to `w-56` in lines 7566, 7657, 7759, 7868, 8103 instead of responsive `w-32 sm:w-44 lg:w-56`.
   - Lines 7566 (Top table header), 7759 (Employee section header), and 8103 (Summary footer) lack `sticky left-0`, causing headers to scroll away from pinned worker cells.

5. **Desktop 368px Summary Block Invariant**:
   - Verified exact width breakdown in lines 7593, 7721, 7787, 7798, 7807, 8058–8087:
     - OT ปกติ (w-14 = 56px) + OT วันหยุด (w-16 = 64px) + ทำงานวันหยุด (w-20 = 80px) = 200px.
     - Cost Baht (w-24 = 96px).
     - Cost % of Salary (w-18 = 72px).
     - Total width = `56 + 64 + 80 + 96 + 72 = 368px`.

6. **All 19 Modal Dialogues Cataloged**:
   - Vessel Modal (`showVesselModal`, line 8839), Add Employee (`showAddEmployeeModal`, line 9046), Edit Employee (`showEditEmployeeModal`, line 9394), Profile Details (`viewingEmployeeDetails`, line 9735), AI Audit (`showAiAuditModal`, line 10036), Add Account (`showAddAccountModal`, line 10091), Edit Account (`showEditAccountModal`, line 10238), Reset Password (`showResetPasswordModal`, line 10370), Bulk Shift (`showBulkShiftModal`, line 10422), OT Request (`showOtRequestModal`, line 10498), Job Value Breakdown (`viewingJvDetails`, line 10640), Birthday Popup (`birthdayPopupEmployee`, line 10724), Shift Editor (`selectedEmployeeForShiftModal`, line 10828), CSV Template Hub (`isCsvTemplateHubOpen` / `CsvTemplateHubModal.tsx`), Resigned Case (`showResignedModal`, line 11348), Quick Shift Picker (`activeCellEditor`, line 11117), Formula Details (`viewingSalaryFormulaEmployee`, line 11207), Add Leave (`showAddModal`, line 728), Add HR Record (`showAddModal`, line 1375).

---

## 2. Logic Chain
1. **From Observation 1**: Because `Navbar.tsx` dispatches `setActiveTab("job-value")` while `App.tsx` evaluates `activeTab === "job_value"`, the equality check fails. Thus, clicking Job Value in the Navbar causes the view container to remain unrendered.
2. **From Observation 2**: Because `mt-28 p-8` is hardcoded on `<main>` without breakpoint modifiers (`sm:`, `lg:`), mobile devices render 32px of margin/padding on each side, squeezing data tables and metrics cards into horizontal clipping.
3. **From Observation 3**: Because 5 columns in Roster Table are pinned to `left: 0..700px`, on any screen width under 700px (including all standard mobile devices 375px–430px), the frozen columns consume 100%+ of the screen, hiding the dynamic OT and payroll columns.
4. **From Observation 4**: In the Shift Matrix, hardcoding `w-56` (224px) on a 375px screen leaves only 151px for date cells. Missing `sticky left-0` on table headers causes header labels to decouple from the body worker cells during horizontal touch pan.
5. **From Observation 5**: The 368px summary block width is mathematically exact and invariant across headers, vessel widgets, and employee rows. Any mobile optimization must preserve this exact desktop invariant on `>=1024px` viewports.

---

## 3. Caveats
- No changes to source code were made (read-only investigation).
- Tests proposed are opaque-box Vitest / React Testing Library specifications ready for implementation in Tier 2 and Tier 4 suites.
- No caveats regarding unexplored areas within the assigned scope.

---

## 4. Conclusion
The codebase is structurally well-organized, with clean single-source-of-truth OT calculations and a complete suite of 11 functional views and 19 modal dialogues. To meet all requirements in `ORIGINAL_REQUEST.md` and `PROJECT.md`, the implementation track should apply the 5 targeted layout and sticky column adjustments identified, and implement the Tier 2 and Tier 4 test suites as proposed in `report.md`.

---

## 5. Verification Method
1. Inspect `report.md` at `C:\Users\ssrwj\Documents\antigravity\mysterious-einstein\.agents\e2e_explorer_2\report.md` for full breakdown and test case definitions.
2. Verify TypeScript typecheck:
   ```bash
   npm run lint
   ```
3. Run Vite build verification:
   ```bash
   npm run build
   ```
