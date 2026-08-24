# Comprehensive Emoji & Content Audit Survey Report

## 1. Observation

A full-codebase recursive Unicode & Emoji audit was executed across all project directories (excluding `node_modules`, `.git`, `dist`, `.wrangler`, and agent logs). 

### Summary Statistics
- **Total Files Scanned**: 48 source, test, script, and config files
- **Total Occurrences Detected**: 136 instances containing emojis, dingbats, or raw unicode pictographs
- **Distribution by Target Scope**:
  - `src/App.tsx`: **99 occurrences** (Modals, Toasts, Tooltips, KPI Badges, Table Headers, Action Buttons, Dropdowns, Confirm Prompts)
  - `src/components/CircadianTimelineModal.tsx`: **7 occurrences** (Timeline navigation arrows, Coverage badges, Heatmap header, Sub-labels)
  - `src/components/LiveSimulationHUD.tsx`: **3 occurrences** (Simulation spinner, Warning indicator, Success indicator)
  - `src/components/PremiumShiftTimePickerModal.tsx`: **4 occurrences** (Overnight shift label generator, Time arrow, Overnight badge, 1-Click badge)
  - `src/components/ShiftRadialPicker.tsx`: **3 occurrences** (Close button, Recommendation header, 1-Touch badge)
  - `src/main.tsx`: **1 occurrence** (ErrorBoundary fallback alert)
  - `src/utils/circadianEngine.ts`: **2 occurrences** (Warning string generator)
  - `server.ts`: **4 occurrences** (Comments and generated markdown report text)
  - `tests/tier5-adversarial/shift-engine-stress.test.tsx`: **2 occurrences** (Test regex assertions targeting emoji strings)
  - `scripts/*.mjs`: **11 occurrences** (CLI terminal test reporting logs)

---

### Detailed Inventory Table

| ID | File & Line | Current Code / Text | Unicode Code Points | Category | Proposed Lucide Vector / Clean Typography Replacement |
|---|---|---|---|---|---|
| 1 | `scripts/challenge-m1-pwa.mjs:30` | `console.log(\`  ✅ PASS: ${name}\`);` | `✅` | CLI Script Logging | Standard text tags ([PASS], [FAIL], [INFO]) |
| 2 | `scripts/challenge-m1-pwa.mjs:33` | `const errMsg = \`❌ FAIL: ${name} -> ${err.message}\`;` | `❌` | CLI Script Logging | Standard text tags ([PASS], [FAIL], [INFO]) |
| 3 | `scripts/challenge-m1-pwa.mjs:103` | `console.log('🚀 CHALLENGER 2: EMPIRICAL PWA STRESS TEST SUITE (MILESTO...` | `🚀` | CLI Script Logging | Standard text tags ([PASS], [FAIL], [INFO]) |
| 4 | `scripts/challenge-m1-pwa.mjs:381` | `console.log(\`📊 CHALLENGER EMPIRICAL TEST SUMMARY:\`);` | `📊` | CLI Script Logging | Standard text tags ([PASS], [FAIL], [INFO]) |
| 5 | `scripts/challenge-m1-pwa.mjs:388` | `console.error(\`🚨 VERDICT: REJECT (${failedTests} failures detected)\...` | `🚨` | CLI Script Logging | Standard text tags ([PASS], [FAIL], [INFO]) |
| 6 | `scripts/challenge-m1-pwa.mjs:391` | `console.log(\`🎉 VERDICT: APPROVE (All ${passedTests} empirical stress...` | `🎉` | CLI Script Logging | Standard text tags ([PASS], [FAIL], [INFO]) |
| 7 | `scripts/challenger-sw-stress.mjs:162` | `console.log(\`  ✅ [PASS] ${title}\`);` | `✅` | CLI Script Logging | Standard text tags ([PASS], [FAIL], [INFO]) |
| 8 | `scripts/challenger-sw-stress.mjs:165` | `console.error(\`  ❌ [FAIL] ${title}\`);` | `❌` | CLI Script Logging | Standard text tags ([PASS], [FAIL], [INFO]) |
| 9 | `scripts/verify-pwa.mjs:6` | `console.error(\`❌ Assertion Failed: ${message}\`);` | `❌` | CLI Script Logging | Standard text tags ([PASS], [FAIL], [INFO]) |
| 10 | `scripts/verify-pwa.mjs:9` | `console.log(\`✅ Passed: ${message}\`);` | `✅` | CLI Script Logging | Standard text tags ([PASS], [FAIL], [INFO]) |
| 11 | `scripts/verify-pwa.mjs:96` | `console.log('\n🎉 ALL PWA VERIFICATION CHECKS PASSED PERFECTLY!');` | `🎉` | CLI Script Logging | Standard text tags ([PASS], [FAIL], [INFO]) |
| 12 | `server.ts:37` | `// Shift Code → OT Hours mapping` | `→` | Backend Comments & Generated Markdown | Clean text |
| 13 | `server.ts:862` | `// Save Shifts → auto-write OT daily records` | `→` | Backend Comments & Generated Markdown | Clean text |
| 14 | `server.ts:1588` | `const report = \`### 📊 รายงานวิเคราะห์การทำงานชั่วโมงเกิน (OT Audit R...` | `📊` | Backend Comments & Generated Markdown | Clean text |
| 15 | `server.ts:1593` | `${overOt.map(e => \`  - ⚠️ **${e.name}** (${e.deptId}): OT สะสม ${e.ac...` | `⚠️` | Backend Comments & Generated Markdown | Clean text |
| 16 | `src/App.tsx:139` | `if (shift === "⚠") return "bg-red-50 text-red-700 border-[#ff0000] fon...` | `⚠` | Shift Matrix Style Rule | None (Special code) |
| 17 | `src/App.tsx:379` | `⚠️` | `⚠️` | Alert / Status Indicator | <AlertTriangle className="w-4 h-4 text-amber-500" /> |
| 18 | `src/App.tsx:542` | `<span className="text-white text-lg">📝</span>` | `📝` | Card / Section Header Icon | <FileText className="w-5 h-5 text-white" /> |
| 19 | `src/App.tsx:567` | `<h4 className="text-xs font-bold text-slate-500 uppercase tracking-wid...` | `📊` | Section Title | <BarChart3 className="w-4 h-4 inline mr-1 text-[#1d3ec7]" /> |
| 20 | `src/App.tsx:586` | `<h4 className="text-xs font-bold text-slate-500 uppercase tracking-wid...` | `📈` | Section Title | <TrendingUp className="w-4 h-4 inline mr-1 text-[#1d3ec7]" /> |
| 21 | `src/App.tsx:612` | `<h4 className="text-xs font-bold text-slate-500 uppercase tracking-wid...` | `🏆` | Section Title | <Award className="w-4 h-4 inline mr-1 text-amber-500" /> |
| 22 | `src/App.tsx:708` | `<span className="text-4xl">📝</span>` | `📝` | Empty State Icon | <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" /> |
| 23 | `src/App.tsx:892` | `<span className="text-white text-lg">📋</span>` | `📋` | Card Header Icon | <ClipboardList className="w-5 h-5 text-white" /> |
| 24 | `src/App.tsx:941` | `<span>⬇</span>` | `⬇` | Button Icon | <Download className="w-4 h-4" /> |
| 25 | `src/App.tsx:968` | `<span className="text-4xl">📋</span>` | `📋` | Empty State Icon | <ClipboardList className="w-10 h-10 text-slate-300 mx-auto mb-2" /> |
| 26 | `src/App.tsx:1381` | `<option value="Active">🟢 ปฏิบัติงาน</option>` | `🟢` | Select Dropdown Option | Clean text: ปฏิบัติงาน (Active) |
| 27 | `src/App.tsx:1382` | `<option value="Inactive">🔴 พ้นสภาพ</option>` | `🔴` | Select Dropdown Option | Clean text: พ้นสภาพ (Inactive) |
| 28 | `src/App.tsx:1439` | `<h3 className="text-base font-black text-slate-900">➕ เพิ่มพนักงานและผ...` | `➕` | Modal Header Title | <UserPlus className="w-5 h-5 text-[#1d3ec7] inline mr-1.5" /> |
| 29 | `src/App.tsx:1444` | `✕` | `✕` | Modal Close Button | <X className="w-5 h-5 text-slate-400 hover:text-slate-600" /> |
| 30 | `src/App.tsx:1825` | `if (!window.confirm(\`⚠️ คุณแน่ใจหรือไม่ว่าต้องการลบบัญชี "${targetUse...` | `⚠️` | Confirmation Dialog | Clean prompt string |
| 31 | `src/App.tsx:2256` | `showToastMsg("↩ เลิกทำ (Undo) สำเร็จ");` | `↩` | Toast Notification | Clean toast message |
| 32 | `src/App.tsx:2268` | `showToastMsg("↪ ทำซ้ำ (Redo) สำเร็จ");` | `↪` | Toast Notification | Clean toast message |
| 33 | `src/App.tsx:2324` | `showToastMsg(\`⚡ จัดคู่กะ Day/Night อัจฉริยะสำหรับตำแหน่ง "${roleName}...` | `⚡` | Toast Notification | Clean toast message |
| 34 | `src/App.tsx:2394` | `showToastMsg(\`✨ จัดคู่กะ Day/Night และตารางทำงานอัตโนมัติครบทุกตำแหน่...` | `✨` | Toast Notification | Clean toast message |
| 35 | `src/App.tsx:2434` | `showToastMsg("🔄 คัดลอกตารางกะ Plan ไปเป็น Actual ทั้งแผนกเรียบร้อย");` | `🔄` | Toast Notification | Clean toast message |
| 36 | `src/App.tsx:2567` | `maxWeekOt <= 36 ? "ผ่าน (<= 36 ชม.)" : "เกินขีดจำกัด (> 36 ชม.) ⚠️",` | `⚠️` | Audit Rule Message | Clean text |
| 37 | `src/App.tsx:2569` | `maxConsecutive <= 6 ? "ผ่าน (ได้หยุดทุก 6 วัน)" : "เกิน 6 วันติดต่อกัน...` | `⚠️` | Audit Rule Message | Clean text |
| 38 | `src/App.tsx:2753` | `return \`👤 ${empName} (วันที่ ${dayNum})\n🏖️ วันหยุดพักผ่อน (OFF)\`;` | `👤🏖️` | Cell Hover Tooltip | Clean text |
| 39 | `src/App.tsx:2757` | `return \`👤 ${empName} (วันที่ ${dayNum})\n🟢 เวลาเข้างาน: ${def.start...` | `👤🟢🔴🏷️` | Cell Hover Tooltip | Clean text |
| 40 | `src/App.tsx:2765` | `return \`👤 ${empName} (วันที่ ${dayNum})\n🏷️ ${timeLabel} ${hours} ช...` | `👤🏷️` | Cell Hover Tooltip | Clean text |
| 41 | `src/App.tsx:2767` | `return \`👤 ${empName} (วันที่ ${dayNum})\n🏷️ กะ ${code}\`;` | `👤🏷️` | Cell Hover Tooltip | Clean text |
| 42 | `src/App.tsx:2819` | `showToastMsg(\`✨ บันทึกกะ ${shiftCode} ให้คุณ ${currentEmps.find(e => ...` | `✨` | Toast Notification | Clean toast message |
| 43 | `src/App.tsx:2850` | `showToastMsg(\`✅ ทาสีกะ ${shiftCode} จำนวน ${cells.length} ช่องสำเร็จ\...` | `✅` | Toast Notification | Clean toast message |
| 44 | `src/App.tsx:2890` | `showToastMsg(\`⚠️ สลับกะเรียบร้อย: ${sourceEmp.name} ⇄ ${targetEmp.nam...` | `⚠️⇄` | Toast Notification | Clean toast message |
| 45 | `src/App.tsx:2892` | `showToastMsg(\`⚡ สลับกะสำเร็จ: ${sourceEmp.name} (${sourceShifts[sourc...` | `⚡⇄` | Toast Notification | Clean toast message |
| 46 | `src/App.tsx:3356` | `<p className="text-red-500 text-3xl mb-2">⚠️</p>` | `⚠️` | Alert Callout | <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" /> |
| 47 | `src/App.tsx:3454` | `<span className="text-cyan-400">🌊 Maritime Port Sync</span>` | `🌊` | Section Header / Badge | <Ship className="w-4 h-4 text-[#1d3ec7] inline mr-1.5" /> |
| 48 | `src/App.tsx:3862` | `if (!window.confirm("⚠️ คุณแน่ใจหรือไม่ว่าต้องการล้างข้อมูลพนักงานและ ...` | `⚠️` | Confirmation Dialog | Clean prompt string |
| 49 | `src/App.tsx:4135` | `if (!window.confirm(\`⚠️ คุณแน่ใจหรือไม่ว่าต้องการนำเข้าพนักงานจำนวน $...` | `⚠️` | Confirmation Dialog | Clean prompt string |
| 50 | `src/App.tsx:4512` | `if (!window.confirm(\`⚠️ คุณแน่ใจหรือไม่ว่าต้องการคืนสภาพพนักงาน "${em...` | `⚠️` | Confirmation Dialog | Clean prompt string |
| 51 | `src/App.tsx:4552` | `showToast(\`คืนสภาพพนักงาน "${emp.name}" สำเร็จแล้ว! 🎉\`, "success");` | `🎉` | Toast Notification | Clean toast message |
| 52 | `src/App.tsx:5272` | `⚠️` | `⚠️` | Alert Status Icon | <AlertCircle className="w-4 h-4 text-amber-500" /> |
| 53 | `src/App.tsx:5647` | `{totalOtHrs > 0 ? (avgOtPerEmp > 36 ? "⚠️ เกินเป้าหมาย 36 ชม./เดือน" :...` | `⚠️✓` | KPI Status Text | Clean text + Lucide badge |
| 54 | `src/App.tsx:5965` | `<span>{diffPct >= 0 ? \`▲ +${diffPct}%\` : \`▼ ${diffPct}%\`}</span>` | `▲▼` | Trend Delta Display | Lucide TrendingUp / TrendingDown |
| 55 | `src/App.tsx:6473` | `<th className="px-3.5 py-3 text-center min-w-[130px]">ผลงาน 68 ➔ 69</t...` | `➔` | Table Header | <ArrowRight className="w-3 h-3 inline mx-1" /> |
| 56 | `src/App.tsx:6673` | `<span className="text-[10px] font-bold text-slate-500">เกินเป้าความปลอ...` | `⚠️` | Safety Badge | <AlertTriangle className="w-3 h-3 text-amber-500" /> |
| 57 | `src/App.tsx:6893` | `<span className="text-3xl mb-2">📊</span>` | `📊` | Empty State Icon | <BarChart3 className="w-10 h-10 text-slate-300 mx-auto mb-2" /> |
| 58 | `src/App.tsx:6981` | `<span>🚢</span> การวิเคราะห์ปริมาณงานเรือ/เครน (ตัน) กับ ชั่วโมง OT (C...` | `🚢` | Analytics Card Header | <Ship className="w-5 h-5 text-[#1d3ec7] inline mr-1.5" /> |
| 59 | `src/App.tsx:7033` | `<span className="text-slate-600">📦 ปริมาณงาน:</span>` | `📦` | Metric Label | <Package className="w-3.5 h-3.5 text-slate-500 inline mr-1" /> |
| 60 | `src/App.tsx:7037` | `<span className="text-slate-600">⏱️ OT สะสมแผนก:</span>` | `⏱️` | Metric Label | <Clock className="w-3.5 h-3.5 text-slate-500 inline mr-1" /> |
| 61 | `src/App.tsx:7660` | `<option value="ทุกฝ่าย">💼 ฝ่ายทั้งหมด (ทุกฝ่าย)</option>` | `💼` | Dropdown Option | Clean text |
| 62 | `src/App.tsx:7675` | `<option value="ทุกตำแหน่ง">👤 ตำแหน่งทั้งหมด (ทุกตำแหน่ง)</option>` | `👤` | Dropdown Option | Clean text |
| 63 | `src/App.tsx:8350` | `✕ ปิดแจ้งเตือน` | `✕` | Dismiss Alert Button | <X className="w-3.5 h-3.5 inline mr-1" /> |
| 64 | `src/App.tsx:8384` | `<span>{isAutoPairingLoading ? "กำลังคำนวณ..." : "⚡ จัดคู่กะ Day/Night ...` | `⚡` | Action Button | <Sparkles className="w-4 h-4 inline mr-1.5" /> |
| 65 | `src/App.tsx:8393` | `<span>คัดลอก Plan → Actual</span>` | `→` | Action Button | <ArrowRight className="w-3.5 h-3.5 inline mx-1 text-slate-400" /> |
| 66 | `src/App.tsx:8434` | `<p>💡 มี {emps.length} คนในตำแหน่งนี้: แนะนำแบ่งเข้าคู่กะ Day 12h (M12...` | `💡` | Guidance Tip Callout | <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" /> |
| 67 | `src/App.tsx:8436` | `<p>⚠️ มีพนักงาน 1 คน: แนะนำจัดกะเช้าเดี่ยว M12 / D หรือเพิ่มพนักงานคู่...` | `⚠️` | Guidance Warning Callout | <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" /> |
| 68 | `src/App.tsx:8770` | `<span>⚡ จับคู่กะ Day/Night อัตโนมัติ</span>` | `⚡` | Action Button | <Sparkles className="w-4 h-4 inline mr-1.5" /> |
| 69 | `src/App.tsx:8998` | `{actualShift !== "O" ? (actualShift === "⚠" ? "[เกินขีด]" : actualShif...` | `⚠` | Shift Matrix Cell Status | Clean text / [WARN] |
| 70 | `src/App.tsx:9558` | `✏️ แก้ไขข้อมูล` | `✏️` | Action Button | <Edit2 className="w-3.5 h-3.5 mr-1" /> |
| 71 | `src/App.tsx:9569` | `🔑 รีเซ็ตรหัสผ่าน` | `🔑` | Action Button | <Key className="w-3.5 h-3.5 mr-1" /> |
| 72 | `src/App.tsx:9576` | `🗑️ ลบ` | `🗑️` | Action Button | <Trash2 className="w-3.5 h-3.5 mr-1" /> |
| 73 | `src/App.tsx:9714` | `✏️ แก้ไขข้อมูล` | `✏️` | Action Button | <Edit2 className="w-3.5 h-3.5 mr-1" /> |
| 74 | `src/App.tsx:9725` | `🔑 รีเซ็ตรหัสผ่าน` | `🔑` | Action Button | <Key className="w-3.5 h-3.5 mr-1" /> |
| 75 | `src/App.tsx:9883` | `🚢` | `🚢` | Modal Header Icon | <Ship className="w-5 h-5 text-[#1d3ec7]" /> |
| 76 | `src/App.tsx:9894` | `✕` | `✕` | Modal Close Button | <X className="w-5 h-5" /> |
| 77 | `src/App.tsx:10039` | `📦 {Number(vs.tonnage).toLocaleString()} ตัน` | `📦` | Card Metric Badge | <Package className="w-3.5 h-3.5 inline mr-1" /> |
| 78 | `src/App.tsx:10055` | `🗑️` | `🗑️` | Action Button | <Trash2 className="w-4 h-4 text-rose-500" /> |
| 79 | `src/App.tsx:10094` | `✕` | `✕` | Modal Close Button | <X className="w-5 h-5" /> |
| 80 | `src/App.tsx:10297` | `🔒 เฉพาะสิทธิ์กลุ่ม HR` | `🔒` | Security Badge | <Lock className="w-3.5 h-3.5 inline mr-1" /> |
| 81 | `src/App.tsx:10414` | `<span className="text-sm animate-spin inline-block">🌐</span>` | `🌐` | Loading Spinner | <Loader2 className="w-4 h-4 animate-spin text-[#1d3ec7]" /> |
| 82 | `src/App.tsx:10445` | `✕` | `✕` | Modal Close Button | <X className="w-5 h-5" /> |
| 83 | `src/App.tsx:10633` | `🔒 เฉพาะสิทธิ์กลุ่ม HR` | `🔒` | Security Badge | <Lock className="w-3.5 h-3.5 inline mr-1" /> |
| 84 | `src/App.tsx:10807` | `✕` | `✕` | Modal Close Button | <X className="w-5 h-5" /> |
| 85 | `src/App.tsx:10941` | `🚨 MAX ({otSalaryPct}%)` | `🚨` | Overtime Limit Warning Badge | <AlertOctagon className="w-3.5 h-3.5 inline mr-1 text-red-500" /> |
| 86 | `src/App.tsx:10961` | `<span className="text-base">⚠️</span>` | `⚠️` | Warning Icon | <AlertTriangle className="w-4 h-4 text-amber-500 inline" /> |
| 87 | `src/App.tsx:10987` | `📈 โครงสร้างตำแหน่ง Job Value (Job Value Structure & Growth 68/69)` | `📈` | Section Title | <TrendingUp className="w-4 h-4 text-[#1d3ec7] inline mr-1.5" /> |
| 88 | `src/App.tsx:10991` | `🟢 ต่อยอด (+{diff.toLocaleString()})` | `🟢` | Growth Status Badge | <TrendingUp className="w-3.5 h-3.5 text-emerald-600 inline mr-1" /> |
| 89 | `src/App.tsx:10995` | `🔴 ไม่ต่อยอด (-{Math.abs(diff).toLocaleString()})` | `🔴` | Decline Status Badge | <TrendingDown className="w-3.5 h-3.5 text-rose-600 inline mr-1" /> |
| 90 | `src/App.tsx:11024` | `<span className="text-2xl">{isGrowth ? "🚀" : "📉"}</span>` | `🚀📉` | Growth Indicator Icon | {isGrowth ? <TrendingUp className="w-6 h-6 text-emerald-600" /> : <TrendingDown className="w-6 h-6 text-rose-600" />} |
| 91 | `src/App.tsx:11027` | `ผลการเปรียบเทียบกำไรปี 2568 ➔ 2569: {isGrowth ? "เติบโตต่อยอด (Positiv...` | `➔` | Growth Comparison Label | Clean text |
| 92 | `src/App.tsx:11037` | `{isGrowth ? \`🟢 ต่อยอด (+${diff.toLocaleString()})\` : \`🔴 ไม่ต่อยอด...` | `🟢🔴` | Growth Comparison Badge | Lucide TrendingUp / TrendingDown |
| 93 | `src/App.tsx:11055` | `✏️ แก้ไขข้อมูลโปรไฟล์` | `✏️` | Action Button | <Edit2 className="w-3.5 h-3.5 mr-1" /> |
| 94 | `src/App.tsx:11090` | `✕` | `✕` | Modal Close Button | <X className="w-5 h-5" /> |
| 95 | `src/App.tsx:11132` | `<h3 className="text-base font-extrabold text-slate-900">➕ เพิ่มผู้ใช้ง...` | `➕` | Modal Header Title | <UserPlus className="w-4 h-4 text-[#1d3ec7] inline mr-1.5" /> |
| 96 | `src/App.tsx:11139` | `✕` | `✕` | Modal Close Button | <X className="w-5 h-5" /> |
| 97 | `src/App.tsx:11263` | `➕ เพิ่มบัญชีผู้ใช้ใหม่` | `➕` | Action Button | <UserPlus className="w-3.5 h-3.5 mr-1" /> |
| 98 | `src/App.tsx:11279` | `<h3 className="text-base font-extrabold text-slate-900">✏️ แก้ไขข้อมูล...` | `✏️` | Modal Header Title | <Edit2 className="w-4 h-4 text-[#1d3ec7] inline mr-1.5" /> |
| 99 | `src/App.tsx:11286` | `✕` | `✕` | Modal Close Button | <X className="w-5 h-5" /> |
| 100 | `src/App.tsx:11411` | `<h3 className="text-base font-bold text-slate-900">🔑 รีเซ็ตรหัสผ่านบั...` | `🔑` | Modal Header Title | <Key className="w-4 h-4 text-[#1d3ec7] inline mr-1.5" /> |
| 101 | `src/App.tsx:11418` | `✕` | `✕` | Modal Close Button | <X className="w-5 h-5" /> |
| 102 | `src/App.tsx:11463` | `<span className="text-xl">⚡</span>` | `⚡` | Modal Header Icon | <Zap className="w-5 h-5 text-[#1d3ec7]" /> |
| 103 | `src/App.tsx:11469` | `<button onClick={() => setShowBulkShiftModal(false)} className="text-w...` | `✕` | Modal Close Button | <X className="w-5 h-5" /> |
| 104 | `src/App.tsx:11523` | `⚡ ปรับกะยกกลุ่ม` | `⚡` | Action Button | <Zap className="w-3.5 h-3.5 mr-1" /> |
| 105 | `src/App.tsx:11540` | `🔴` | `🔴` | Required Field Indicator / Dot | <span className="text-rose-500 font-bold">*</span> |
| 106 | `src/App.tsx:11548` | `✕` | `✕` | Modal Close Button | <X className="w-5 h-5" /> |
| 107 | `src/App.tsx:11557` | `<span>➕</span> ยื่นใบคำขอทำ OT ออนไลน์ใหม่` | `➕` | Action Button | <Plus className="w-4 h-4 inline mr-1.5" /> |
| 108 | `src/App.tsx:11610` | `📤 ยื่นคำขอทำ OT` | `📤` | Submit Button | <Send className="w-3.5 h-3.5 mr-1" /> |
| 109 | `src/App.tsx:11638` | `{req.status === "approved" ? "✅ อนุมัติแล้ว" : req.status === "rejecte...` | `✅❌⏳` | Request Status Badge | Lucide CheckCircle2 / XCircle / Clock |
| 110 | `src/App.tsx:11653` | `✅ อนุมัติ` | `✅` | Action Button | <Check className="w-3.5 h-3.5 mr-1" /> |
| 111 | `src/App.tsx:11659` | `❌ ปฏิเสธ` | `❌` | Action Button | <X className="w-3.5 h-3.5 mr-1" /> |
| 112 | `src/App.tsx:11694` | `✕` | `✕` | Modal Close Button | <X className="w-5 h-5" /> |
| 113 | `src/App.tsx:11816` | `✕` | `✕` | Modal Close Button | <X className="w-5 h-5" /> |
| 114 | `src/App.tsx:12236` | `<button onClick={() => setResignedSearchQuery("")} className="absolute...` | `✕` | Search Input Clear Button | <X className="w-3.5 h-3.5" /> |
| 115 | `src/components/CircadianTimelineModal.tsx:155` | `◀` | `◀` | Navigation Control Button | <ChevronLeft className="w-4 h-4" /> |
| 116 | `src/components/CircadianTimelineModal.tsx:172` | `▶` | `▶` | Navigation Control Button | <ChevronRight className="w-4 h-4" /> |
| 117 | `src/components/CircadianTimelineModal.tsx:212` | `✕` | `✕` | Modal Close Button | <X className="w-5 h-5" /> |
| 118 | `src/components/CircadianTimelineModal.tsx:252` | `{density.coverageWarnings.length === 0 ? "🟢 ครอบคลุม 100%" : \`⚠️ เตื...` | `🟢⚠️` | Coverage Status Badge | Lucide CheckCircle2 / AlertTriangle |
| 119 | `src/components/CircadianTimelineModal.tsx:263` | `<span>⚡</span> ความหนาแน่นกำลังพลรายชั่วโมง (Hourly Staffing Density H...` | `⚡` | Section Title | <Activity className="w-4 h-4 text-[#1d3ec7] inline mr-1.5" /> |
| 120 | `src/components/CircadianTimelineModal.tsx:388` | `<span className="truncate">◀ {seg.shiftCode} (ต่อกะดึก)</span>` | `◀` | Circadian Shift Segment Label | <CornerDownLeft className="w-3 h-3 inline mr-1" /> |
| 121 | `src/components/CircadianTimelineModal.tsx:432` | `<span>⚠️</span> ข้อความแจ้งเตือนความคุ้มครองกำลังพล` | `⚠️` | Alert Section Title | <AlertTriangle className="w-4 h-4 text-amber-500 inline mr-1.5" /> |
| 122 | `src/components/LiveSimulationHUD.tsx:35` | `<span className="animate-spin text-lg">⚙️</span>` | `⚙️` | Simulation Live Spinner | <Settings className="w-4 h-4 animate-spin text-[#1d3ec7]" /> |
| 123 | `src/components/LiveSimulationHUD.tsx:102` | `<span>⚠️</span>` | `⚠️` | Warning Icon | <AlertTriangle className="w-4 h-4 text-amber-500" /> |
| 124 | `src/components/LiveSimulationHUD.tsx:107` | `<span>🟢</span>` | `🟢` | Success Status Icon | <CheckCircle2 className="w-4 h-4 text-emerald-500" /> |
| 125 | `src/components/PremiumShiftTimePickerModal.tsx:109` | `const name = \`${timeLabel} ${roundedDuration} ชม.${isOvernight ? ' (�...` | `🌙` | Dynamic Shift Name Generator | Clean text: (กะข้ามคืน) |
| 126 | `src/components/PremiumShiftTimePickerModal.tsx:668` | `: \`${formattedStartTime} ➜ ${formattedEndTime} น.${dynamicShift.isOve...` | `➜` | Shift Time Range Display | Clean text / dash |
| 127 | `src/components/PremiumShiftTimePickerModal.tsx:672` | `🌙 กะข้ามคืน` | `🌙` | Overnight Indicator Badge | <Moon className="w-3.5 h-3.5 text-indigo-400 inline mr-1" /> |
| 128 | `src/components/PremiumShiftTimePickerModal.tsx:717` | `<span className="px-1.5 py-0.5 rounded bg-black/20 text-[9px] font-mon...` | `⚡` | Quick Action Badge | Clean text: 1-Click Quick |
| 129 | `src/components/ShiftRadialPicker.tsx:103` | `✕` | `✕` | Modal Close Button | <X className="w-4 h-4 text-slate-400 hover:text-slate-200" /> |
| 130 | `src/components/ShiftRadialPicker.tsx:112` | `⚡ แนะนำคู่กะอัตโนมัติ` | `⚡` | Radial Recommendation Header | <Sparkles className="w-3.5 h-3.5 text-amber-400 inline mr-1" /> |
| 131 | `src/components/ShiftRadialPicker.tsx:127` | `<span className="px-1.5 py-0.5 rounded bg-black/30 text-[10px] font-mo...` | `⚡` | Quick Touch Badge | Clean text: 1-Touch Auto |
| 132 | `src/main.tsx:35` | `⚠️` | `⚠️` | Error Boundary Fallback UI | <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-2" /> |
| 133 | `src/utils/circadianEngine.ts:362` | `coverageWarnings.push(\`⚠️ ช่องว่างกำลังพล: ไม่มีพนักงานปฏิบัติงานช่วง...` | `⚠️` | Warning Message Generator | Clean text string |
| 134 | `src/utils/circadianEngine.ts:364` | `coverageWarnings.push(\`⚡ กำลังพลขั้นต่ำ: มีพนักงานเพียง 1 คนช่วง ${s....` | `⚡` | Warning Message Generator | Clean text string |
| 135 | `tests/tier5-adversarial/shift-engine-stress.test.tsx:372` | `expect(screen.queryByText(/⚡ แนะนำคู่กะอัตโนมัติ/i)).not.toBeInTheDocu...` | `⚡` | Test Matcher Regex | Clean regex matcher |
| 136 | `tests/tier5-adversarial/shift-engine-stress.test.tsx:409` | `expect(screen.getByText(/⚡ แนะนำคู่กะอัตโนมัติ/i)).toBeInTheDocument()...` | `⚡` | Test Matcher Regex | Clean regex matcher |

---

### Breakdowns by Functional Surface

#### A. Toast Notifications (`showToast` / `showToastMsg`)
1. `src/App.tsx:2256`: `showToastMsg("↩ เลิกทำ (Undo) สำเร็จ")` -> `showToastMsg("เลิกทำ (Undo) สำเร็จ")` (Use Lucide `Undo2` in toast container)
2. `src/App.tsx:2268`: `showToastMsg("↪ ทำซ้ำ (Redo) สำเร็จ")` -> `showToastMsg("ทำซ้ำ (Redo) สำเร็จ")` (Use Lucide `Redo2` in toast container)
3. `src/App.tsx:2324`: `showToastMsg("⚡ จัดคู่กะ Day/Night...")` -> `showToastMsg("จัดคู่กะ Day/Night...")`
4. `src/App.tsx:2394`: `showToastMsg("✨ จัดคู่กะ Day/Night และตารางทำงานอัตโนมัติ...")` -> `showToastMsg("จัดคู่กะ Day/Night และตารางทำงานอัตโนมัติ...")`
5. `src/App.tsx:2434`: `showToastMsg("🔄 คัดลอกตารางกะ Plan ไปเป็น Actual...")` -> `showToastMsg("คัดลอกตารางกะ Plan ไปเป็น Actual...")`
6. `src/App.tsx:2819`: `showToastMsg("✨ บันทึกกะ...")` -> `showToastMsg("บันทึกกะ...")`
7. `src/App.tsx:2850`: `showToastMsg("✅ ทาสีกะ...")` -> `showToastMsg("ทาสีกะ...")`
8. `src/App.tsx:2890`: `showToastMsg("⚠️ สลับกะเรียบร้อย: ... ⇄ ...")` -> `showToastMsg("สลับกะเรียบร้อย: ... <-> ...")`
9. `src/App.tsx:2892`: `showToastMsg("⚡ สลับกะสำเร็จ: ... ⇄ ...")` -> `showToastMsg("สลับกะสำเร็จ: ... <-> ...")`
10. `src/App.tsx:4552`: `showToast("คืนสภาพพนักงาน ... สำเร็จแล้ว! 🎉", "success")` -> `showToast("คืนสภาพพนักงาน ... สำเร็จแล้ว", "success")`

#### B. Grid Cell Hover Tooltips (`title` attributes)
1. `src/App.tsx:2753`: `👤 ${empName} (วันที่ ${dayNum})\n🏖️ วันหยุดพักผ่อน (OFF)` -> `${empName} (วันที่ ${dayNum})\nวันหยุดพักผ่อน (OFF)`
2. `src/App.tsx:2757`: `👤 ${empName} (วันที่ ${dayNum})\n🟢 เวลาเข้างาน: ...\n🔴 เวลาออกงาน: ...\n🏷️ ...` -> `${empName} (วันที่ ${dayNum})\nเวลาเข้างาน: ...\nเวลาออกงาน: ...\n...`
3. `src/App.tsx:2765`: `👤 ${empName} (วันที่ ${dayNum})\n🏷️ ...` -> `${empName} (วันที่ ${dayNum})\n...`
4. `src/App.tsx:2767`: `👤 ${empName} (วันที่ ${dayNum})\n🏷️ กะ ${code}` -> `${empName} (วันที่ ${dayNum})\nกะ ${code}`

#### C. Modal Close Buttons (`✕` character)
All raw unicode `✕` buttons across modals must be standardized to Lucide `<X className="w-5 h-5" />` or `<X className="w-4 h-4" />`:
- `src/App.tsx:1444` (Add Employee Modal)
- `src/App.tsx:8350` (Compliance Mismatch Alert Banner)
- `src/App.tsx:9894` (Vessel Modal)
- `src/App.tsx:10094` (Role Modal)
- `src/App.tsx:10445` (Salary Formula Modal)
- `src/App.tsx:10807` (Job Value Modal)
- `src/App.tsx:11090` (User Profile Modal)
- `src/App.tsx:11139` (Add Admin Modal)
- `src/App.tsx:11286` (Edit Admin Modal)
- `src/App.tsx:11418` (Reset Password Modal)
- `src/App.tsx:11469` (Bulk Shift Modal)
- `src/App.tsx:11548` (OT Request Modal)
- `src/App.tsx:11694` (Admin Approval Modal)
- `src/App.tsx:11816` (Birthday Modal)
- `src/App.tsx:12236` (Resigned Employee Search Clear Button)
- `src/components/CircadianTimelineModal.tsx:212` (Circadian Modal Close)
- `src/components/ShiftRadialPicker.tsx:103` (Radial Quick Picker Close)

#### D. Dropdown Select Options (`<option>`)
Native HTML `<option>` cannot render SVG icons; clean typography strings must be used:
- `src/App.tsx:1381`: `<option value="Active">🟢 ปฏิบัติงาน</option>` -> `<option value="Active">ปฏิบัติงาน (Active)</option>`
- `src/App.tsx:1382`: `<option value="Inactive">🔴 พ้นสภาพ</option>` -> `<option value="Inactive">พ้นสภาพ (Inactive)</option>`
- `src/App.tsx:7660`: `<option value="ทุกฝ่าย">💼 ฝ่ายทั้งหมด (ทุกฝ่าย)</option>` -> `<option value="ทุกฝ่าย">ฝ่ายทั้งหมด (ทุกฝ่าย)</option>`
- `src/App.tsx:7675`: `<option value="ทุกตำแหน่ง">👤 ตำแหน่งทั้งหมด (ทุกตำแหน่ง)</option>` -> `<option value="ทุกตำแหน่ง">ตำแหน่งทั้งหมด (ทุกตำแหน่ง)</option>`

#### E. Browser Dialogs (`window.confirm`)
Browser native dialogs must use clean, crisp Thai typography:
- `src/App.tsx:1825`: Remove `⚠️`
- `src/App.tsx:3862`: Remove `⚠️`
- `src/App.tsx:4135`: Remove `⚠️`
- `src/App.tsx:4512`: Remove `⚠️`

#### F. Section Header & Empty State Icons
- Leave Statistics (`App.tsx:542, 567, 586, 612, 708`): Replace with `<FileText />`, `<BarChart3 />`, `<TrendingUp />`, `<Award />`
- Shift Matrix (`App.tsx:892, 968`): Replace with `<ClipboardList />`
- Vessel / Crane Analytics (`App.tsx:6981, 7033, 7037`): Replace with `<Ship />`, `<Package />`, `<Clock />`
- Job Value Growth (`App.tsx:10987, 11024, 11037`): Replace with `<TrendingUp />`, `<TrendingDown />`

---

## 2. Logic Chain

1. **Premise 1: Zero-Emoji Mandate (§R2)**: All UI strings, tooltips, buttons, modal headers, toast notifications, badges, export tables, and mock data must have 0% emojis.
2. **Premise 2: 4-Tone Industrial Blue Palette Compatibility (§R1)**: Replaced vector icons must utilize crisp Lucide React components styled with the exact palette:
   - Primary accents / interactive: `#1d3ec7` (`text-[#1d3ec7]` or `bg-[#1d3ec7]`)
   - Structural darks: `#0b1a3a`
   - Soft highlights: `#6d93fc`
   - Subtle backgrounds/borders: `#a9cdfc` / `bg-blue-50` / `border-blue-200`
   - Status indicators: Semantic emerald for success (`text-emerald-600`, `CheckCircle2`), amber for warnings (`text-amber-500`, `AlertTriangle`), rose for errors/inactive (`text-rose-600`, `XCircle`, `Trash2`).
3. **Premise 3: Component Syntax Constraints**:
   - In JSX elements: Replace emoji spans with Lucide React vector components (e.g. `<Sparkles className="w-4 h-4 mr-1 text-[#1d3ec7]" />`).
   - In `title` / Tooltip attributes: Tooltip strings are plain text; emojis must simply be removed to produce clean, professional executive tooltips.
   - In `<select><option>`: Native option elements cannot hold React JSX elements; emojis must be eliminated in favor of clean bilingual text.
   - In Toast / Alert strings: Strip emojis from string literals and allow the parent notification system (which renders Lucide icons) to provide the iconography.
4. **Premise 4: Test & Backend Invariant Safety**:
   - In `tests/tier5-adversarial/shift-engine-stress.test.tsx`, lines 372 and 409 assert on `/⚡ แนะนำคู่กะอัตโนมัติ/i`. When the emoji is removed from `ShiftRadialPicker.tsx`, the test regex must be updated to `/แนะนำคู่กะอัตโนมัติ/i` so test assertions remain synchronized.

---

## 3. Caveats

1. **Shift Code Indicator `"⚠"` in `App.tsx:139` and `App.tsx:8998`**: 
   - `"⚠"` is checked as a raw string shift state (indicating an overtime warning status). To maintain 100% compliance with zero-emoji guidelines, this should be rendered in the matrix with `<AlertTriangle className="w-3.5 h-3.5 text-amber-500 mx-auto" />` or stylized badge `[WARN]` rather than raw unicode.
2. **Test Suite Invariants**:
   - Only `tests/tier5-adversarial/shift-engine-stress.test.tsx` contains an emoji in its test query. All other 40 test files are emoji-free.
3. **No Caveats in Core Calculations**:
   - Shift calculation math (`circadianEngine.ts`, `costSimulationEngine.ts`, `shiftRecommendation.ts`) does not rely on emojis for parsing or computation keys. Strings in `coverageWarnings` are display messages only.

---

## 4. Conclusion

A 100% complete map of all 136 emoji and unicode symbol occurrences across 11 files has been generated and validated. 

### Implementation Action Plan for Coder Agent:
1. **`src/App.tsx`**:
   - Add missing Lucide imports: `Key, Edit2, Package, Moon, Lightbulb, Loader2, UserPlus, TrendingDown, AlertCircle` to the existing `lucide-react` import statement.
   - Replace 99 identified emoji instances using the exact line-by-line inventory in Section 1.
2. **`src/components/CircadianTimelineModal.tsx`**:
   - Import `ChevronLeft, ChevronRight, X, CheckCircle2, AlertTriangle, Activity, CornerDownLeft` from `lucide-react`.
   - Replace 7 unicode arrow / emoji instances.
3. **`src/components/LiveSimulationHUD.tsx`**:
   - Replace 3 instances (spinning gear, warning, green circle) with Lucide `Settings, AlertTriangle, CheckCircle2`.
4. **`src/components/PremiumShiftTimePickerModal.tsx`**:
   - Replace 4 instances with clean text and Lucide `Moon`.
5. **`src/components/ShiftRadialPicker.tsx`**:
   - Replace 3 instances with Lucide `X, Sparkles` and clean text.
6. **`src/main.tsx`**:
   - Replace 1 `⚠️` with Lucide `AlertTriangle`.
7. **`src/utils/circadianEngine.ts`**:
   - Remove `⚠️` and `⚡` from generated warning strings.
8. **`server.ts`**:
   - Remove emojis from generated OT audit report markdown.
9. **`tests/tier5-adversarial/shift-engine-stress.test.tsx`**:
   - Synchronize test regex queries from `/⚡ แนะนำคู่กะอัตโนมัติ/i` to `/แนะนำคู่กะอัตโนมัติ/i`.
10. **`scripts/*.mjs`**:
    - Clean CLI output logs to use executive text tags `[PASS]`, `[FAIL]`, `[INFO]`.

---

## 5. Verification Method

### 1. Verification Script
Run the automated non-ASCII / emoji scanner:
```bash
node C:\Users\ssrwj\Documents\antigravity\mysterious-einstein\.agents\explorer_survey_2\scan_all_emojis.cjs
```
**Expected Result**: 0 occurrences in `src/`, `public/`, and `index.html`.

### 2. TypeScript & Build Verification
```bash
npm run build
```
**Expected Result**: Compiles with 0 TypeScript and 0 Vite bundle errors.

### 3. Full Test Suite Verification
```bash
npm test -- --run
```
**Expected Result**: 100% of tests (41 test suites) PASS.

### 4. Invalidation Conditions
- If any emoji glyph (`⚡, 🏖️, 👤, 🟢, 🔴, 🏷️, 🌙, ⚠️, 🔄, ✅, 💡, 📊, 🚢, ⚙️, 📤, ❌, ⏳, 📝, 📋, 🏆, 💼, 🔑, ✏️, 🗑️, 🔒, 🚨, 📈, 🚀, 📉, ➕`) appears in the browser rendered DOM or tooltips.
- If any button or modal header renders broken raw characters.
