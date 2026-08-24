const fs = require('fs');
const path = require('path');

const inventory = JSON.parse(fs.readFileSync(path.join(__dirname, 'complete_inventory.json'), 'utf8'));

let md = `# Comprehensive Emoji & Content Audit Survey Report

## 1. Observation

A full-codebase recursive Unicode & Emoji audit was executed across all project directories (excluding \`node_modules\`, \`.git\`, \`dist\`, \`.wrangler\`, and agent logs). 

### Summary Statistics
- **Total Files Scanned**: 48 source, test, script, and config files
- **Total Occurrences Detected**: 136 instances containing emojis, dingbats, or raw unicode pictographs
- **Distribution by Target Scope**:
  - \`src/App.tsx\`: **99 occurrences** (Modals, Toasts, Tooltips, KPI Badges, Table Headers, Action Buttons, Dropdowns, Confirm Prompts)
  - \`src/components/CircadianTimelineModal.tsx\`: **7 occurrences** (Timeline navigation arrows, Coverage badges, Heatmap header, Sub-labels)
  - \`src/components/LiveSimulationHUD.tsx\`: **3 occurrences** (Simulation spinner, Warning indicator, Success indicator)
  - \`src/components/PremiumShiftTimePickerModal.tsx\`: **4 occurrences** (Overnight shift label generator, Time arrow, Overnight badge, 1-Click badge)
  - \`src/components/ShiftRadialPicker.tsx\`: **3 occurrences** (Close button, Recommendation header, 1-Touch badge)
  - \`src/main.tsx\`: **1 occurrence** (ErrorBoundary fallback alert)
  - \`src/utils/circadianEngine.ts\`: **2 occurrences** (Warning string generator)
  - \`server.ts\`: **4 occurrences** (Comments and generated markdown report text)
  - \`tests/tier5-adversarial/shift-engine-stress.test.tsx\`: **2 occurrences** (Test regex assertions targeting emoji strings)
  - \`scripts/*.mjs\`: **11 occurrences** (CLI terminal test reporting logs)

---

### Detailed Inventory Table

| ID | File & Line | Current Code / Text | Unicode Code Points | Category | Proposed Lucide Vector / Clean Typography Replacement |
|---|---|---|---|---|---|
`;

inventory.forEach((item, idx) => {
  const cleanLineContent = item.lineContent.replace(/\|/g, '\\|').replace(/`/g, '\\`');
  const cleanReplacement = item.replacementIcon.replace(/\|/g, '\\|').replace(/`/g, '\\`');
  const cleanRationale = item.rationale.replace(/\|/g, '\\|');
  md += `| ${idx + 1} | \`${item.file}:${item.line}\` | \`${cleanLineContent.slice(0, 70)}${cleanLineContent.length > 70 ? '...' : ''}\` | \`${item.characters}\` | ${item.category} | ${cleanReplacement} |\n`;
});

md += `
---

### Breakdowns by Functional Surface

#### A. Toast Notifications (\`showToast\` / \`showToastMsg\`)
1. \`src/App.tsx:2256\`: \`showToastMsg("↩ เลิกทำ (Undo) สำเร็จ")\` -> \`showToastMsg("เลิกทำ (Undo) สำเร็จ")\` (Use Lucide \`Undo2\` in toast container)
2. \`src/App.tsx:2268\`: \`showToastMsg("↪ ทำซ้ำ (Redo) สำเร็จ")\` -> \`showToastMsg("ทำซ้ำ (Redo) สำเร็จ")\` (Use Lucide \`Redo2\` in toast container)
3. \`src/App.tsx:2324\`: \`showToastMsg("⚡ จัดคู่กะ Day/Night...")\` -> \`showToastMsg("จัดคู่กะ Day/Night...")\`
4. \`src/App.tsx:2394\`: \`showToastMsg("✨ จัดคู่กะ Day/Night และตารางทำงานอัตโนมัติ...")\` -> \`showToastMsg("จัดคู่กะ Day/Night และตารางทำงานอัตโนมัติ...")\`
5. \`src/App.tsx:2434\`: \`showToastMsg("🔄 คัดลอกตารางกะ Plan ไปเป็น Actual...")\` -> \`showToastMsg("คัดลอกตารางกะ Plan ไปเป็น Actual...")\`
6. \`src/App.tsx:2819\`: \`showToastMsg("✨ บันทึกกะ...")\` -> \`showToastMsg("บันทึกกะ...")\`
7. \`src/App.tsx:2850\`: \`showToastMsg("✅ ทาสีกะ...")\` -> \`showToastMsg("ทาสีกะ...")\`
8. \`src/App.tsx:2890\`: \`showToastMsg("⚠️ สลับกะเรียบร้อย: ... ⇄ ...")\` -> \`showToastMsg("สลับกะเรียบร้อย: ... <-> ...")\`
9. \`src/App.tsx:2892\`: \`showToastMsg("⚡ สลับกะสำเร็จ: ... ⇄ ...")\` -> \`showToastMsg("สลับกะสำเร็จ: ... <-> ...")\`
10. \`src/App.tsx:4552\`: \`showToast("คืนสภาพพนักงาน ... สำเร็จแล้ว! 🎉", "success")\` -> \`showToast("คืนสภาพพนักงาน ... สำเร็จแล้ว", "success")\`

#### B. Grid Cell Hover Tooltips (\`title\` attributes)
1. \`src/App.tsx:2753\`: \`👤 \${empName} (วันที่ \${dayNum})\\n🏖️ วันหยุดพักผ่อน (OFF)\` -> \`\${empName} (วันที่ \${dayNum})\\nวันหยุดพักผ่อน (OFF)\`
2. \`src/App.tsx:2757\`: \`👤 \${empName} (วันที่ \${dayNum})\\n🟢 เวลาเข้างาน: ...\\n🔴 เวลาออกงาน: ...\\n🏷️ ...\` -> \`\${empName} (วันที่ \${dayNum})\\nเวลาเข้างาน: ...\\nเวลาออกงาน: ...\\n...\`
3. \`src/App.tsx:2765\`: \`👤 \${empName} (วันที่ \${dayNum})\\n🏷️ ...\` -> \`\${empName} (วันที่ \${dayNum})\\n...\`
4. \`src/App.tsx:2767\`: \`👤 \${empName} (วันที่ \${dayNum})\\n🏷️ กะ \${code}\` -> \`\${empName} (วันที่ \${dayNum})\\nกะ \${code}\`

#### C. Modal Close Buttons (\`✕\` character)
All raw unicode \`✕\` buttons across modals must be standardized to Lucide \`<X className="w-5 h-5" />\` or \`<X className="w-4 h-4" />\`:
- \`src/App.tsx:1444\` (Add Employee Modal)
- \`src/App.tsx:8350\` (Compliance Mismatch Alert Banner)
- \`src/App.tsx:9894\` (Vessel Modal)
- \`src/App.tsx:10094\` (Role Modal)
- \`src/App.tsx:10445\` (Salary Formula Modal)
- \`src/App.tsx:10807\` (Job Value Modal)
- \`src/App.tsx:11090\` (User Profile Modal)
- \`src/App.tsx:11139\` (Add Admin Modal)
- \`src/App.tsx:11286\` (Edit Admin Modal)
- \`src/App.tsx:11418\` (Reset Password Modal)
- \`src/App.tsx:11469\` (Bulk Shift Modal)
- \`src/App.tsx:11548\` (OT Request Modal)
- \`src/App.tsx:11694\` (Admin Approval Modal)
- \`src/App.tsx:11816\` (Birthday Modal)
- \`src/App.tsx:12236\` (Resigned Employee Search Clear Button)
- \`src/components/CircadianTimelineModal.tsx:212\` (Circadian Modal Close)
- \`src/components/ShiftRadialPicker.tsx:103\` (Radial Quick Picker Close)

#### D. Dropdown Select Options (\`<option>\`)
Native HTML \`<option>\` cannot render SVG icons; clean typography strings must be used:
- \`src/App.tsx:1381\`: \`<option value="Active">🟢 ปฏิบัติงาน</option>\` -> \`<option value="Active">ปฏิบัติงาน (Active)</option>\`
- \`src/App.tsx:1382\`: \`<option value="Inactive">🔴 พ้นสภาพ</option>\` -> \`<option value="Inactive">พ้นสภาพ (Inactive)</option>\`
- \`src/App.tsx:7660\`: \`<option value="ทุกฝ่าย">💼 ฝ่ายทั้งหมด (ทุกฝ่าย)</option>\` -> \`<option value="ทุกฝ่าย">ฝ่ายทั้งหมด (ทุกฝ่าย)</option>\`
- \`src/App.tsx:7675\`: \`<option value="ทุกตำแหน่ง">👤 ตำแหน่งทั้งหมด (ทุกตำแหน่ง)</option>\` -> \`<option value="ทุกตำแหน่ง">ตำแหน่งทั้งหมด (ทุกตำแหน่ง)</option>\`

#### E. Browser Dialogs (\`window.confirm\`)
Browser native dialogs must use clean, crisp Thai typography:
- \`src/App.tsx:1825\`: Remove \`⚠️\`
- \`src/App.tsx:3862\`: Remove \`⚠️\`
- \`src/App.tsx:4135\`: Remove \`⚠️\`
- \`src/App.tsx:4512\`: Remove \`⚠️\`

#### F. Section Header & Empty State Icons
- Leave Statistics (\`App.tsx:542, 567, 586, 612, 708\`): Replace with \`<FileText />\`, \`<BarChart3 />\`, \`<TrendingUp />\`, \`<Award />\`
- Shift Matrix (\`App.tsx:892, 968\`): Replace with \`<ClipboardList />\`
- Vessel / Crane Analytics (\`App.tsx:6981, 7033, 7037\`): Replace with \`<Ship />\`, \`<Package />\`, \`<Clock />\`
- Job Value Growth (\`App.tsx:10987, 11024, 11037\`): Replace with \`<TrendingUp />\`, \`<TrendingDown />\`

---

## 2. Logic Chain

1. **Premise 1: Zero-Emoji Mandate (§R2)**: All UI strings, tooltips, buttons, modal headers, toast notifications, badges, export tables, and mock data must have 0% emojis.
2. **Premise 2: 4-Tone Industrial Blue Palette Compatibility (§R1)**: Replaced vector icons must utilize crisp Lucide React components styled with the exact palette:
   - Primary accents / interactive: \`#1d3ec7\` (\`text-[#1d3ec7]\` or \`bg-[#1d3ec7]\`)
   - Structural darks: \`#0b1a3a\`
   - Soft highlights: \`#6d93fc\`
   - Subtle backgrounds/borders: \`#a9cdfc\` / \`bg-blue-50\` / \`border-blue-200\`
   - Status indicators: Semantic emerald for success (\`text-emerald-600\`, \`CheckCircle2\`), amber for warnings (\`text-amber-500\`, \`AlertTriangle\`), rose for errors/inactive (\`text-rose-600\`, \`XCircle\`, \`Trash2\`).
3. **Premise 3: Component Syntax Constraints**:
   - In JSX elements: Replace emoji spans with Lucide React vector components (e.g. \`<Sparkles className="w-4 h-4 mr-1 text-[#1d3ec7]" />\`).
   - In \`title\` / Tooltip attributes: Tooltip strings are plain text; emojis must simply be removed to produce clean, professional executive tooltips.
   - In \`<select><option>\`: Native option elements cannot hold React JSX elements; emojis must be eliminated in favor of clean bilingual text.
   - In Toast / Alert strings: Strip emojis from string literals and allow the parent notification system (which renders Lucide icons) to provide the iconography.
4. **Premise 4: Test & Backend Invariant Safety**:
   - In \`tests/tier5-adversarial/shift-engine-stress.test.tsx\`, lines 372 and 409 assert on \`/⚡ แนะนำคู่กะอัตโนมัติ/i\`. When the emoji is removed from \`ShiftRadialPicker.tsx\`, the test regex must be updated to \`/แนะนำคู่กะอัตโนมัติ/i\` so test assertions remain synchronized.

---

## 3. Caveats

1. **Shift Code Indicator \`"⚠"\` in \`App.tsx:139\` and \`App.tsx:8998\`**: 
   - \`"⚠"\` is checked as a raw string shift state (indicating an overtime warning status). To maintain 100% compliance with zero-emoji guidelines, this should be rendered in the matrix with \`<AlertTriangle className="w-3.5 h-3.5 text-amber-500 mx-auto" />\` or stylized badge \`[WARN]\` rather than raw unicode.
2. **Test Suite Invariants**:
   - Only \`tests/tier5-adversarial/shift-engine-stress.test.tsx\` contains an emoji in its test query. All other 40 test files are emoji-free.
3. **No Caveats in Core Calculations**:
   - Shift calculation math (\`circadianEngine.ts\`, \`costSimulationEngine.ts\`, \`shiftRecommendation.ts\`) does not rely on emojis for parsing or computation keys. Strings in \`coverageWarnings\` are display messages only.

---

## 4. Conclusion

A 100% complete map of all 136 emoji and unicode symbol occurrences across 11 files has been generated and validated. 

### Implementation Action Plan for Coder Agent:
1. **\`src/App.tsx\`**:
   - Add missing Lucide imports: \`Key, Edit2, Package, Moon, Lightbulb, Loader2, UserPlus, TrendingDown, AlertCircle\` to the existing \`lucide-react\` import statement.
   - Replace 99 identified emoji instances using the exact line-by-line inventory in Section 1.
2. **\`src/components/CircadianTimelineModal.tsx\`**:
   - Import \`ChevronLeft, ChevronRight, X, CheckCircle2, AlertTriangle, Activity, CornerDownLeft\` from \`lucide-react\`.
   - Replace 7 unicode arrow / emoji instances.
3. **\`src/components/LiveSimulationHUD.tsx\`**:
   - Replace 3 instances (spinning gear, warning, green circle) with Lucide \`Settings, AlertTriangle, CheckCircle2\`.
4. **\`src/components/PremiumShiftTimePickerModal.tsx\`**:
   - Replace 4 instances with clean text and Lucide \`Moon\`.
5. **\`src/components/ShiftRadialPicker.tsx\`**:
   - Replace 3 instances with Lucide \`X, Sparkles\` and clean text.
6. **\`src/main.tsx\`**:
   - Replace 1 \`⚠️\` with Lucide \`AlertTriangle\`.
7. **\`src/utils/circadianEngine.ts\`**:
   - Remove \`⚠️\` and \`⚡\` from generated warning strings.
8. **\`server.ts\`**:
   - Remove emojis from generated OT audit report markdown.
9. **\`tests/tier5-adversarial/shift-engine-stress.test.tsx\`**:
   - Synchronize test regex queries from \`/⚡ แนะนำคู่กะอัตโนมัติ/i\` to \`/แนะนำคู่กะอัตโนมัติ/i\`.
10. **\`scripts/*.mjs\`**:
    - Clean CLI output logs to use executive text tags \`[PASS]\`, \`[FAIL]\`, \`[INFO]\`.

---

## 5. Verification Method

### 1. Verification Script
Run the automated non-ASCII / emoji scanner:
\`\`\`bash
node C:\\Users\\ssrwj\\Documents\\antigravity\\mysterious-einstein\\.agents\\explorer_survey_2\\scan_all_emojis.cjs
\`\`\`
**Expected Result**: 0 occurrences in \`src/\`, \`public/\`, and \`index.html\`.

### 2. TypeScript & Build Verification
\`\`\`bash
npm run build
\`\`\`
**Expected Result**: Compiles with 0 TypeScript and 0 Vite bundle errors.

### 3. Full Test Suite Verification
\`\`\`bash
npm test -- --run
\`\`\`
**Expected Result**: 100% of tests (41 test suites) PASS.

### 4. Invalidation Conditions
- If any emoji glyph (\`⚡, 🏖️, 👤, 🟢, 🔴, 🏷️, 🌙, ⚠️, 🔄, ✅, 💡, 📊, 🚢, ⚙️, 📤, ❌, ⏳, 📝, 📋, 🏆, 💼, 🔑, ✏️, 🗑️, 🔒, 🚨, 📈, 🚀, 📉, ➕\`) appears in the browser rendered DOM or tooltips.
- If any button or modal header renders broken raw characters.
`;

fs.writeFileSync(path.join(__dirname, 'handoff.md'), md);
console.log('Successfully wrote handoff.md');
