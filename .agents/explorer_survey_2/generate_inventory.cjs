const fs = require('fs');
const path = require('path');

const audit = JSON.parse(fs.readFileSync(path.join(__dirname, 'exhaustive_audit.json'), 'utf8'));

// Filter out ORIGINAL_REQUEST.md
const cleanAudit = audit.filter(a => !a.file.includes('ORIGINAL_REQUEST.md'));

// We want to generate detailed mapping for every item
const mappedItems = cleanAudit.map((item, idx) => {
  let category = 'UI String';
  let replacementIcon = 'N/A';
  let cleanCode = '';
  let rationale = '';

  const { file, line, lineContent, characters } = item;

  // Analysis based on file and content
  if (file === 'src/App.tsx') {
    if (line === 139) {
      category = 'Shift Matrix Style Rule';
      replacementIcon = 'None (Special code)';
      cleanCode = 'if (shift === "WARN" || shift === "!") ...';
      rationale = 'The "⚠" character is used as a shift status code for overtime warnings. Should be normalized or styled with AlertTriangle.';
    } else if (line === 379) {
      category = 'Alert / Status Indicator';
      replacementIcon = '<AlertTriangle className="w-4 h-4 text-amber-500" />';
      cleanCode = '<AlertTriangle className="w-4 h-4 text-amber-500" />';
      rationale = 'Replace raw ⚠️ with Lucide AlertTriangle vector icon.';
    } else if (line === 542) {
      category = 'Card / Section Header Icon';
      replacementIcon = '<FileText className="w-5 h-5 text-white" />';
      cleanCode = '<FileText className="w-5 h-5 text-white" />';
      rationale = 'Replace 📝 in Leave Request Header with Lucide FileText icon.';
    } else if (line === 567) {
      category = 'Section Title';
      replacementIcon = '<BarChart3 className="w-4 h-4 inline mr-1 text-[#1d3ec7]" />';
      cleanCode = '<h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5"><BarChart3 className="w-4 h-4 text-[#1d3ec7]" /> สถิติรวมการลางาน</h4>';
      rationale = 'Replace 📊 with Lucide BarChart3.';
    } else if (line === 586) {
      category = 'Section Title';
      replacementIcon = '<TrendingUp className="w-4 h-4 inline mr-1 text-[#1d3ec7]" />';
      cleanCode = '<h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5"><TrendingUp className="w-4 h-4 text-[#1d3ec7]" /> สัดส่วนประเภทการลา (Leave Types)</h4>';
      rationale = 'Replace 📈 with Lucide TrendingUp.';
    } else if (line === 612) {
      category = 'Section Title';
      replacementIcon = '<Award className="w-4 h-4 inline mr-1 text-amber-500" />';
      cleanCode = '<h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5"><Award className="w-4 h-4 text-amber-500" /> พนักงานที่มีสถิติการลางานสูงสุด (Top Absentees)</h4>';
      rationale = 'Replace 🏆 with Lucide Award.';
    } else if (line === 708) {
      category = 'Empty State Icon';
      replacementIcon = '<FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />';
      cleanCode = '<FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />';
      rationale = 'Replace 📝 empty state placeholder with clean Lucide FileText.';
    } else if (line === 892) {
      category = 'Card Header Icon';
      replacementIcon = '<ClipboardList className="w-5 h-5 text-white" />';
      cleanCode = '<ClipboardList className="w-5 h-5 text-white" />';
      rationale = 'Replace 📋 with Lucide ClipboardList.';
    } else if (line === 941) {
      category = 'Button Icon';
      replacementIcon = '<Download className="w-4 h-4" />';
      cleanCode = '<Download className="w-4 h-4" />';
      rationale = 'Replace raw unicode ⬇ with Lucide Download icon.';
    } else if (line === 968) {
      category = 'Empty State Icon';
      replacementIcon = '<ClipboardList className="w-10 h-10 text-slate-300 mx-auto mb-2" />';
      cleanCode = '<ClipboardList className="w-10 h-10 text-slate-300 mx-auto mb-2" />';
      rationale = 'Replace 📋 empty state placeholder with Lucide ClipboardList.';
    } else if (line === 1381) {
      category = 'Select Dropdown Option';
      replacementIcon = 'Clean text: ปฏิบัติงาน (Active)';
      cleanCode = '<option value="Active">ปฏิบัติงาน (Active)</option>';
      rationale = 'Remove 🟢 emoji from native <option> text.';
    } else if (line === 1382) {
      category = 'Select Dropdown Option';
      replacementIcon = 'Clean text: พ้นสภาพ (Inactive)';
      cleanCode = '<option value="Inactive">พ้นสภาพ (Inactive)</option>';
      rationale = 'Remove 🔴 emoji from native <option> text.';
    } else if (line === 1439) {
      category = 'Modal Header Title';
      replacementIcon = '<UserPlus className="w-5 h-5 text-[#1d3ec7] inline mr-1.5" />';
      cleanCode = '<h3 className="text-base font-black text-slate-900 flex items-center gap-2"><UserPlus className="w-5 h-5 text-[#1d3ec7]" /> เพิ่มพนักงานและผลตอบแทนใหม่</h3>';
      rationale = 'Replace ➕ with Lucide UserPlus icon.';
    } else if (line === 1444) {
      category = 'Modal Close Button';
      replacementIcon = '<X className="w-5 h-5 text-slate-400 hover:text-slate-600" />';
      cleanCode = '<button onClick={() => setShowAddEmpModal(false)} className="text-slate-400 hover:text-slate-600 p-1"><X className="w-5 h-5" /></button>';
      rationale = 'Replace ✕ unicode symbol with Lucide X component.';
    } else if (line === 1825) {
      category = 'Confirmation Dialog';
      replacementIcon = 'Clean prompt string';
      cleanCode = 'if (!window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบบัญชี "${targetUsername}" ออกจากระบบ?`)) {';
      rationale = 'Remove ⚠️ emoji from window.confirm message.';
    } else if (line === 2256) {
      category = 'Toast Notification';
      replacementIcon = 'Clean toast message';
      cleanCode = 'showToastMsg("เลิกทำ (Undo) สำเร็จ");';
      rationale = 'Remove ↩ emoji; toast component can use Lucide Undo2.';
    } else if (line === 2268) {
      category = 'Toast Notification';
      replacementIcon = 'Clean toast message';
      cleanCode = 'showToastMsg("ทำซ้ำ (Redo) สำเร็จ");';
      rationale = 'Remove ↪ emoji; toast component can use Lucide Redo2.';
    } else if (line === 2324) {
      category = 'Toast Notification';
      replacementIcon = 'Clean toast message';
      cleanCode = 'showToastMsg(`จัดคู่กะ Day/Night อัจฉริยะสำหรับตำแหน่ง "${roleName}" สำเร็จ (${empsInRole.length} คน)`);';
      rationale = 'Remove ⚡ emoji from toast string.';
    } else if (line === 2394) {
      category = 'Toast Notification';
      replacementIcon = 'Clean toast message';
      cleanCode = 'showToastMsg(`จัดคู่กะ Day/Night และตารางทำงานอัตโนมัติครบทุกตำแหน่งในแผนกเรียบร้อย (${deptEmps.length} คน)`);';
      rationale = 'Remove ✨ emoji from toast string.';
    } else if (line === 2434) {
      category = 'Toast Notification';
      replacementIcon = 'Clean toast message';
      cleanCode = 'showToastMsg("คัดลอกตารางกะ Plan ไปเป็น Actual ทั้งแผนกเรียบร้อย");';
      rationale = 'Remove 🔄 emoji from toast string.';
    } else if (line === 2567) {
      category = 'Audit Rule Message';
      replacementIcon = 'Clean text';
      cleanCode = 'maxWeekOt <= 36 ? "ผ่าน (<= 36 ชม.)" : "เกินขีดจำกัด (> 36 ชม.)",';
      rationale = 'Remove ⚠️ emoji from compliance status text.';
    } else if (line === 2569) {
      category = 'Audit Rule Message';
      replacementIcon = 'Clean text';
      cleanCode = 'maxConsecutive <= 6 ? "ผ่าน (ได้หยุดทุก 6 วัน)" : "เกิน 6 วันติดต่อกัน",';
      rationale = 'Remove ⚠️ emoji from compliance status text.';
    } else if (line === 2753) {
      category = 'Cell Hover Tooltip';
      replacementIcon = 'Clean text';
      cleanCode = 'return `${empName} (วันที่ ${dayNum})\nวันหยุดพักผ่อน (OFF)`;';
      rationale = 'Remove 👤 and 🏖️ emojis from matrix cell title/tooltip.';
    } else if (line === 2757) {
      category = 'Cell Hover Tooltip';
      replacementIcon = 'Clean text';
      cleanCode = 'return `${empName} (วันที่ ${dayNum})\nเวลาเข้างาน: ${def.startTime} น.\nเวลาออกงาน: ${def.endTime} น.\n${def.name} (${def.startTime} - ${def.endTime})${def.otHours > 0 ? ` • OT ${def.otHours} ชม.` : \'\'}`;';
      rationale = 'Remove 👤, 🟢, 🔴, 🏷️ emojis from matrix cell title/tooltip.';
    } else if (line === 2765) {
      category = 'Cell Hover Tooltip';
      replacementIcon = 'Clean text';
      cleanCode = 'return `${empName} (วันที่ ${dayNum})\n${timeLabel} ${hours} ชม.${ot > 0 ? ` • OT ${ot} ชม.` : \'\'} (${code})`;';
      rationale = 'Remove 👤, 🏷️ emojis from matrix cell title/tooltip.';
    } else if (line === 2767) {
      category = 'Cell Hover Tooltip';
      replacementIcon = 'Clean text';
      cleanCode = 'return `${empName} (วันที่ ${dayNum})\nกะ ${code}`;';
      rationale = 'Remove 👤, 🏷️ emojis from matrix cell title/tooltip.';
    } else if (line === 2819) {
      category = 'Toast Notification';
      replacementIcon = 'Clean toast message';
      cleanCode = 'showToastMsg(`บันทึกกะ ${shiftCode} ให้คุณ ${currentEmps.find(e => e.id === employeeId)?.name || employeeId} (${dayNumbers.length} วัน) สำเร็จ`);';
      rationale = 'Remove ✨ emoji from toast message.';
    } else if (line === 2850) {
      category = 'Toast Notification';
      replacementIcon = 'Clean toast message';
      cleanCode = 'showToastMsg(`ทาสีกะ ${shiftCode} จำนวน ${cells.length} ช่องสำเร็จ`);';
      rationale = 'Remove ✅ emoji from toast message.';
    } else if (line === 2890) {
      category = 'Toast Notification';
      replacementIcon = 'Clean toast message';
      cleanCode = 'showToastMsg(`สลับกะเรียบร้อย: ${sourceEmp.name} <-> ${targetEmp.name} (พบข้อควรระวัง ${sourceAlerts.length + targetAlerts.length} ข้อ)`);';
      rationale = 'Remove ⚠️ and ⇄ unicode symbols from toast string.';
    } else if (line === 2892) {
      category = 'Toast Notification';
      replacementIcon = 'Clean toast message';
      cleanCode = 'showToastMsg(`สลับกะสำเร็จ: ${sourceEmp.name} (${sourceShifts[source.dayIdx]}) <-> ${targetEmp.name} (${targetShifts[target.dayIdx]}) สอดคล้องกฎหมาย 100%`);';
      rationale = 'Remove ⚡ and ⇄ unicode symbols from toast string.';
    } else if (line === 3356) {
      category = 'Alert Callout';
      replacementIcon = '<AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />';
      cleanCode = '<AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />';
      rationale = 'Replace ⚠️ with Lucide AlertTriangle.';
    } else if (line === 3454) {
      category = 'Section Header / Badge';
      replacementIcon = '<Ship className="w-4 h-4 text-[#1d3ec7] inline mr-1.5" />';
      cleanCode = '<span className="text-[#1d3ec7] flex items-center gap-1.5"><Ship className="w-4 h-4" /> Maritime Port Sync</span>';
      rationale = 'Replace 🌊 with Lucide Ship.';
    } else if (line === 3862) {
      category = 'Confirmation Dialog';
      replacementIcon = 'Clean prompt string';
      cleanCode = 'if (!window.confirm("คุณแน่ใจหรือไม่ว่าต้องการล้างข้อมูลพนักงานและ OT records ทั้งหมด? การกระทำนี้จะไม่สามารถเรียกคืนข้อมูลกลับมาได้")) {';
      rationale = 'Remove ⚠️ emoji from window.confirm prompt.';
    } else if (line === 4135) {
      category = 'Confirmation Dialog';
      replacementIcon = 'Clean prompt string';
      cleanCode = 'if (!window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการนำเข้าพนักงานจำนวน ${parsedEmployees.length} คน จากไฟล์ CSV? ข้อมูลรายชื่อและกะทำงานเดิมจะถูกล้างและแทนที่ทั้งหมด`)) {';
      rationale = 'Remove ⚠️ emoji from window.confirm prompt.';
    } else if (line === 4512) {
      category = 'Confirmation Dialog';
      replacementIcon = 'Clean prompt string';
      cleanCode = 'if (!window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการคืนสภาพพนักงาน "${emp.name}" กลับเป็นพนักงานปกติ (Active)?`)) {';
      rationale = 'Remove ⚠️ emoji from window.confirm prompt.';
    } else if (line === 4552) {
      category = 'Toast Notification';
      replacementIcon = 'Clean toast message';
      cleanCode = 'showToast(`คืนสภาพพนักงาน "${emp.name}" สำเร็จแล้ว`, "success");';
      rationale = 'Remove 🎉 emoji from toast message.';
    } else if (line === 5272) {
      category = 'Alert Status Icon';
      replacementIcon = '<AlertCircle className="w-4 h-4 text-amber-500" />';
      cleanCode = '<AlertCircle className="w-4 h-4 text-amber-500" />';
      rationale = 'Replace ⚠️ with Lucide AlertCircle.';
    } else if (line === 5647) {
      category = 'KPI Status Text';
      replacementIcon = 'Clean text + Lucide badge';
      cleanCode = '{totalOtHrs > 0 ? (avgOtPerEmp > 36 ? "เกินเป้าหมาย 36 ชม./เดือน" : "อยู่ในเกณฑ์มาตรฐาน") : "(ไม่มีชั่วโมงสะสมในเดือนนี้)"}';
      rationale = 'Remove ⚠️ and ✓ symbols from status string.';
    } else if (line === 5965) {
      category = 'Trend Delta Display';
      replacementIcon = 'Lucide TrendingUp / TrendingDown';
      cleanCode = '<span className="flex items-center gap-1">{diffPct >= 0 ? <><TrendingUp className="w-3.5 h-3.5 text-emerald-600" /> +{diffPct}%</> : <><TrendingDown className="w-3.5 h-3.5 text-rose-600" /> {diffPct}%</>}</span>';
      rationale = 'Replace ▲ and ▼ unicode arrows with Lucide TrendingUp / TrendingDown icons.';
    } else if (line === 6473) {
      category = 'Table Header';
      replacementIcon = '<ArrowRight className="w-3 h-3 inline mx-1" />';
      cleanCode = '<th className="px-3.5 py-3 text-center min-w-[130px]">ผลงาน 2568 - 2569</th>';
      rationale = 'Replace ➔ symbol with standard dash or Lucide ArrowRight.';
    } else if (line === 6673) {
      category = 'Safety Badge';
      replacementIcon = '<AlertTriangle className="w-3 h-3 text-amber-500" />';
      cleanCode = '<span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">เกินเป้าความปลอดภัย <AlertTriangle className="w-3 h-3 text-amber-500" /></span>';
      rationale = 'Replace ⚠️ emoji with Lucide AlertTriangle.';
    } else if (line === 6893) {
      category = 'Empty State Icon';
      replacementIcon = '<BarChart3 className="w-10 h-10 text-slate-300 mx-auto mb-2" />';
      cleanCode = '<BarChart3 className="w-10 h-10 text-slate-300 mx-auto mb-2" />';
      rationale = 'Replace 📊 emoji with Lucide BarChart3.';
    } else if (line === 6981) {
      category = 'Analytics Card Header';
      replacementIcon = '<Ship className="w-5 h-5 text-[#1d3ec7] inline mr-1.5" />';
      cleanCode = '<Ship className="w-5 h-5 text-[#1d3ec7] inline mr-1.5" /> การวิเคราะห์ปริมาณงานเรือ/เครน (ตัน) กับ ชั่วโมง OT (Cargo Tonnage vs OT Analytics)';
      rationale = 'Replace 🚢 emoji with Lucide Ship icon.';
    } else if (line === 7033) {
      category = 'Metric Label';
      replacementIcon = '<Package className="w-3.5 h-3.5 text-slate-500 inline mr-1" />';
      cleanCode = '<span className="text-slate-600 inline-flex items-center gap-1"><Package className="w-3.5 h-3.5 text-slate-500" /> ปริมาณงาน:</span>';
      rationale = 'Replace 📦 emoji with Lucide Package icon.';
    } else if (line === 7037) {
      category = 'Metric Label';
      replacementIcon = '<Clock className="w-3.5 h-3.5 text-slate-500 inline mr-1" />';
      cleanCode = '<span className="text-slate-600 inline-flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-slate-500" /> OT สะสมแผนก:</span>';
      rationale = 'Replace ⏱️ emoji with Lucide Clock icon.';
    } else if (line === 7660) {
      category = 'Dropdown Option';
      replacementIcon = 'Clean text';
      cleanCode = '<option value="ทุกฝ่าย">ฝ่ายทั้งหมด (ทุกฝ่าย)</option>';
      rationale = 'Remove 💼 emoji from dropdown option text.';
    } else if (line === 7675) {
      category = 'Dropdown Option';
      replacementIcon = 'Clean text';
      cleanCode = '<option value="ทุกตำแหน่ง">ตำแหน่งทั้งหมด (ทุกตำแหน่ง)</option>';
      rationale = 'Remove 👤 emoji from dropdown option text.';
    } else if (line === 8350) {
      category = 'Dismiss Alert Button';
      replacementIcon = '<X className="w-3.5 h-3.5 inline mr-1" />';
      cleanCode = '<button ... className="... flex items-center gap-1"><X className="w-3.5 h-3.5" /> ปิดแจ้งเตือน</button>';
      rationale = 'Replace ✕ symbol with Lucide X icon.';
    } else if (line === 8384) {
      category = 'Action Button';
      replacementIcon = '<Sparkles className="w-4 h-4 inline mr-1.5" />';
      cleanCode = '<button ... className="... flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-[#1d3ec7]" /> {isAutoPairingLoading ? "กำลังคำนวณ..." : "จัดคู่กะ Day/Night ครบทุกตำแหน่ง"}</button>';
      rationale = 'Replace ⚡ emoji with Lucide Sparkles icon.';
    } else if (line === 8393) {
      category = 'Action Button';
      replacementIcon = '<ArrowRight className="w-3.5 h-3.5 inline mx-1 text-slate-400" />';
      cleanCode = '<span>คัดลอก Plan <ArrowRight className="w-3.5 h-3.5 inline mx-1" /> Actual</span>';
      rationale = 'Replace unicode → with Lucide ArrowRight.';
    } else if (line === 8434) {
      category = 'Guidance Tip Callout';
      replacementIcon = '<Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />';
      cleanCode = '<div className="flex items-start gap-2 text-slate-700 text-xs"><Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" /><p>มี {emps.length} คนในตำแหน่งนี้: แนะนำแบ่งเข้าคู่กะ Day 12h (M12) และ Night 12h (N12) สลับทีม 4-on-2-off</p></div>';
      rationale = 'Replace 💡 emoji with Lucide Lightbulb icon.';
    } else if (line === 8436) {
      category = 'Guidance Warning Callout';
      replacementIcon = '<AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />';
      cleanCode = '<div className="flex items-start gap-2 text-slate-700 text-xs"><AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" /><p>มีพนักงาน 1 คน: แนะนำจัดกะเช้าเดี่ยว M12 / D หรือเพิ่มพนักงานคู่กะเสริม</p></div>';
      rationale = 'Replace ⚠️ emoji with Lucide AlertTriangle icon.';
    } else if (line === 8770) {
      category = 'Action Button';
      replacementIcon = '<Sparkles className="w-4 h-4 inline mr-1.5" />';
      cleanCode = '<button ... className="... flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-[#1d3ec7]" /> <span>จับคู่กะ Day/Night อัตโนมัติ</span></button>';
      rationale = 'Replace ⚡ emoji with Lucide Sparkles icon.';
    } else if (line === 8998) {
      category = 'Shift Matrix Cell Status';
      replacementIcon = 'Clean text / [WARN]';
      cleanCode = '{actualShift !== "O" ? (actualShift === "⚠" ? "[เกินขีด]" : actualShift) : ""}';
      rationale = 'Shift cell warning fallback string.';
    } else if (line === 9558) {
      category = 'Action Button';
      replacementIcon = '<Edit2 className="w-3.5 h-3.5 mr-1" />';
      cleanCode = '<button ... className="... flex items-center gap-1"><Edit2 className="w-3.5 h-3.5" /> แก้ไขข้อมูล</button>';
      rationale = 'Replace ✏️ emoji with Lucide Edit2 icon.';
    } else if (line === 9569) {
      category = 'Action Button';
      replacementIcon = '<Key className="w-3.5 h-3.5 mr-1" />';
      cleanCode = '<button ... className="... flex items-center gap-1"><Key className="w-3.5 h-3.5" /> รีเซ็ตรหัสผ่าน</button>';
      rationale = 'Replace 🔑 emoji with Lucide Key icon.';
    } else if (line === 9576) {
      category = 'Action Button';
      replacementIcon = '<Trash2 className="w-3.5 h-3.5 mr-1" />';
      cleanCode = '<button ... className="... flex items-center gap-1"><Trash2 className="w-3.5 h-3.5 text-rose-500" /> ลบ</button>';
      rationale = 'Replace 🗑️ emoji with Lucide Trash2 icon.';
    } else if (line === 9714) {
      category = 'Action Button';
      replacementIcon = '<Edit2 className="w-3.5 h-3.5 mr-1" />';
      cleanCode = '<button ... className="... flex items-center gap-1"><Edit2 className="w-3.5 h-3.5" /> แก้ไขข้อมูล</button>';
      rationale = 'Replace ✏️ emoji with Lucide Edit2 icon.';
    } else if (line === 9725) {
      category = 'Action Button';
      replacementIcon = '<Key className="w-3.5 h-3.5 mr-1" />';
      cleanCode = '<button ... className="... flex items-center gap-1"><Key className="w-3.5 h-3.5" /> รีเซ็ตรหัสผ่าน</button>';
      rationale = 'Replace 🔑 emoji with Lucide Key icon.';
    } else if (line === 9883) {
      category = 'Modal Header Icon';
      replacementIcon = '<Ship className="w-5 h-5 text-[#1d3ec7]" />';
      cleanCode = '<Ship className="w-5 h-5 text-[#1d3ec7]" />';
      rationale = 'Replace 🚢 emoji in modal header with Lucide Ship icon.';
    } else if (line === 9894) {
      category = 'Modal Close Button';
      replacementIcon = '<X className="w-5 h-5" />';
      cleanCode = '<button onClick={() => setShowVesselModal(false)} className="..."><X className="w-5 h-5" /></button>';
      rationale = 'Replace ✕ symbol with Lucide X icon.';
    } else if (line === 10039) {
      category = 'Card Metric Badge';
      replacementIcon = '<Package className="w-3.5 h-3.5 inline mr-1" />';
      cleanCode = '<span className="inline-flex items-center gap-1 text-slate-700 text-xs font-semibold"><Package className="w-3.5 h-3.5 text-slate-500" /> {Number(vs.tonnage).toLocaleString()} ตัน</span>';
      rationale = 'Replace 📦 emoji with Lucide Package icon.';
    } else if (line === 10055) {
      category = 'Action Button';
      replacementIcon = '<Trash2 className="w-4 h-4 text-rose-500" />';
      cleanCode = '<button ... className="... p-1 text-rose-500 hover:text-rose-700"><Trash2 className="w-4 h-4" /></button>';
      rationale = 'Replace 🗑️ emoji with Lucide Trash2 icon.';
    } else if (line === 10094) {
      category = 'Modal Close Button';
      replacementIcon = '<X className="w-5 h-5" />';
      cleanCode = '<button onClick={() => setShowRoleModal(false)} className="..."><X className="w-5 h-5" /></button>';
      rationale = 'Replace ✕ symbol with Lucide X icon.';
    } else if (line === 10297) {
      category = 'Security Badge';
      replacementIcon = '<Lock className="w-3.5 h-3.5 inline mr-1" />';
      cleanCode = '<span className="inline-flex items-center gap-1 text-xs text-slate-500"><Lock className="w-3.5 h-3.5 text-slate-400" /> เฉพาะสิทธิ์กลุ่ม HR</span>';
      rationale = 'Replace 🔒 emoji with Lucide Lock icon.';
    } else if (line === 10414) {
      category = 'Loading Spinner';
      replacementIcon = '<Loader2 className="w-4 h-4 animate-spin text-[#1d3ec7]" />';
      cleanCode = '<Loader2 className="w-4 h-4 animate-spin text-[#1d3ec7]" />';
      rationale = 'Replace 🌐 emoji spinner with Lucide Loader2 icon.';
    } else if (line === 10445) {
      category = 'Modal Close Button';
      replacementIcon = '<X className="w-5 h-5" />';
      cleanCode = '<button onClick={() => setShowSalaryFormulaModal(false)} className="..."><X className="w-5 h-5" /></button>';
      rationale = 'Replace ✕ symbol with Lucide X icon.';
    } else if (line === 10633) {
      category = 'Security Badge';
      replacementIcon = '<Lock className="w-3.5 h-3.5 inline mr-1" />';
      cleanCode = '<span className="inline-flex items-center gap-1 text-xs text-slate-500"><Lock className="w-3.5 h-3.5 text-slate-400" /> เฉพาะสิทธิ์กลุ่ม HR</span>';
      rationale = 'Replace 🔒 emoji with Lucide Lock icon.';
    } else if (line === 10807) {
      category = 'Modal Close Button';
      replacementIcon = '<X className="w-5 h-5" />';
      cleanCode = '<button onClick={() => setShowJobValueModal(false)} className="..."><X className="w-5 h-5" /></button>';
      rationale = 'Replace ✕ symbol with Lucide X icon.';
    } else if (line === 10941) {
      category = 'Overtime Limit Warning Badge';
      replacementIcon = '<AlertOctagon className="w-3.5 h-3.5 inline mr-1 text-red-500" />';
      cleanCode = '<span className="inline-flex items-center gap-1 font-bold text-red-600"><AlertOctagon className="w-3.5 h-3.5" /> MAX ({otSalaryPct}%)</span>';
      rationale = 'Replace 🚨 emoji with Lucide AlertOctagon.';
    } else if (line === 10961) {
      category = 'Warning Icon';
      replacementIcon = '<AlertTriangle className="w-4 h-4 text-amber-500 inline" />';
      cleanCode = '<AlertTriangle className="w-4 h-4 text-amber-500" />';
      rationale = 'Replace ⚠️ emoji with Lucide AlertTriangle.';
    } else if (line === 10987) {
      category = 'Section Title';
      replacementIcon = '<TrendingUp className="w-4 h-4 text-[#1d3ec7] inline mr-1.5" />';
      cleanCode = '<h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5"><TrendingUp className="w-4 h-4 text-[#1d3ec7]" /> โครงสร้างตำแหน่ง Job Value (Job Value Structure & Growth 68/69)</h4>';
      rationale = 'Replace 📈 emoji with Lucide TrendingUp.';
    } else if (line === 10991) {
      category = 'Growth Status Badge';
      replacementIcon = '<TrendingUp className="w-3.5 h-3.5 text-emerald-600 inline mr-1" />';
      cleanCode = '<span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700"><TrendingUp className="w-3.5 h-3.5" /> ต่อยอด (+{diff.toLocaleString()})</span>';
      rationale = 'Replace 🟢 emoji with Lucide TrendingUp icon.';
    } else if (line === 10995) {
      category = 'Decline Status Badge';
      replacementIcon = '<TrendingDown className="w-3.5 h-3.5 text-rose-600 inline mr-1" />';
      cleanCode = '<span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700"><TrendingDown className="w-3.5 h-3.5" /> ไม่ต่อยอด (-{Math.abs(diff).toLocaleString()})</span>';
      rationale = 'Replace 🔴 emoji with Lucide TrendingDown icon.';
    } else if (line === 11024) {
      category = 'Growth Indicator Icon';
      replacementIcon = '{isGrowth ? <TrendingUp className="w-6 h-6 text-emerald-600" /> : <TrendingDown className="w-6 h-6 text-rose-600" />}';
      cleanCode = '<span className="p-2 rounded-full bg-slate-100 flex items-center justify-center">{isGrowth ? <TrendingUp className="w-6 h-6 text-emerald-600" /> : <TrendingDown className="w-6 h-6 text-rose-600" />}</span>';
      rationale = 'Replace 🚀 / 📉 emojis with Lucide TrendingUp / TrendingDown icons.';
    } else if (line === 11027) {
      category = 'Growth Comparison Label';
      replacementIcon = 'Clean text';
      cleanCode = '<p className="text-xs text-slate-600">ผลการเปรียบเทียบกำไรปี 2568 - 2569: {isGrowth ? "เติบโตต่อยอด (Positive Growth)" : "ลดลงไม่ต่อยอด (Performance Decline)"}</p>';
      rationale = 'Replace ➔ symbol with standard dash or clean arrow.';
    } else if (line === 11037) {
      category = 'Growth Comparison Badge';
      replacementIcon = 'Lucide TrendingUp / TrendingDown';
      cleanCode = '<span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold ${isGrowth ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"}`}>{isGrowth ? <><TrendingUp className="w-3.5 h-3.5" /> ต่อยอด (+{diff.toLocaleString()})</> : <><TrendingDown className="w-3.5 h-3.5" /> ไม่ต่อยอด (-{Math.abs(diff).toLocaleString()})</>}</span>';
      rationale = 'Replace 🟢 and 🔴 emojis with Lucide TrendingUp / TrendingDown badges.';
    } else if (line === 11055) {
      category = 'Action Button';
      replacementIcon = '<Edit2 className="w-3.5 h-3.5 mr-1" />';
      cleanCode = '<button ... className="... flex items-center gap-1"><Edit2 className="w-3.5 h-3.5" /> แก้ไขข้อมูลโปรไฟล์</button>';
      rationale = 'Replace ✏️ emoji with Lucide Edit2 icon.';
    } else if (line === 11090) {
      category = 'Modal Close Button';
      replacementIcon = '<X className="w-5 h-5" />';
      cleanCode = '<button onClick={() => setShowUserProfileModal(false)} className="..."><X className="w-5 h-5" /></button>';
      rationale = 'Replace ✕ symbol with Lucide X icon.';
    } else if (line === 11132) {
      category = 'Modal Header Title';
      replacementIcon = '<UserPlus className="w-4 h-4 text-[#1d3ec7] inline mr-1.5" />';
      cleanCode = '<h3 className="text-base font-extrabold text-slate-900 flex items-center gap-1.5"><UserPlus className="w-4 h-4 text-[#1d3ec7]" /> เพิ่มผู้ใช้งาน / Admin ใหม่</h3>';
      rationale = 'Replace ➕ emoji with Lucide UserPlus icon.';
    } else if (line === 11139) {
      category = 'Modal Close Button';
      replacementIcon = '<X className="w-5 h-5" />';
      cleanCode = '<button onClick={() => setShowAddAdminModal(false)} className="..."><X className="w-5 h-5" /></button>';
      rationale = 'Replace ✕ symbol with Lucide X icon.';
    } else if (line === 11263) {
      category = 'Action Button';
      replacementIcon = '<UserPlus className="w-3.5 h-3.5 mr-1" />';
      cleanCode = '<button ... className="... flex items-center gap-1"><UserPlus className="w-3.5 h-3.5" /> เพิ่มบัญชีผู้ใช้ใหม่</button>';
      rationale = 'Replace ➕ emoji with Lucide UserPlus icon.';
    } else if (line === 11279) {
      category = 'Modal Header Title';
      replacementIcon = '<Edit2 className="w-4 h-4 text-[#1d3ec7] inline mr-1.5" />';
      cleanCode = '<h3 className="text-base font-extrabold text-slate-900 flex items-center gap-1.5"><Edit2 className="w-4 h-4 text-[#1d3ec7]" /> แก้ไขข้อมูลบัญชีผู้ใช้</h3>';
      rationale = 'Replace ✏️ emoji with Lucide Edit2 icon.';
    } else if (line === 11286) {
      category = 'Modal Close Button';
      replacementIcon = '<X className="w-5 h-5" />';
      cleanCode = '<button onClick={() => setShowEditAdminModal(false)} className="..."><X className="w-5 h-5" /></button>';
      rationale = 'Replace ✕ symbol with Lucide X icon.';
    } else if (line === 11411) {
      category = 'Modal Header Title';
      replacementIcon = '<Key className="w-4 h-4 text-[#1d3ec7] inline mr-1.5" />';
      cleanCode = '<h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5"><Key className="w-4 h-4 text-[#1d3ec7]" /> รีเซ็ตรหัสผ่านบัญชีผู้ใช้</h3>';
      rationale = 'Replace 🔑 emoji with Lucide Key icon.';
    } else if (line === 11418) {
      category = 'Modal Close Button';
      replacementIcon = '<X className="w-5 h-5" />';
      cleanCode = '<button onClick={() => setShowResetPasswordModal(false)} className="..."><X className="w-5 h-5" /></button>';
      rationale = 'Replace ✕ symbol with Lucide X icon.';
    } else if (line === 11463) {
      category = 'Modal Header Icon';
      replacementIcon = '<Zap className="w-5 h-5 text-[#1d3ec7]" />';
      cleanCode = '<Zap className="w-5 h-5 text-[#1d3ec7]" />';
      rationale = 'Replace ⚡ emoji in modal header with Lucide Zap icon.';
    } else if (line === 11469) {
      category = 'Modal Close Button';
      replacementIcon = '<X className="w-5 h-5" />';
      cleanCode = '<button onClick={() => setShowBulkShiftModal(false)} className="text-white hover:opacity-80 p-1"><X className="w-5 h-5" /></button>';
      rationale = 'Replace ✕ symbol with Lucide X icon.';
    } else if (line === 11523) {
      category = 'Action Button';
      replacementIcon = '<Zap className="w-3.5 h-3.5 mr-1" />';
      cleanCode = '<button ... className="... flex items-center gap-1"><Zap className="w-3.5 h-3.5" /> ปรับกะยกกลุ่ม</button>';
      rationale = 'Replace ⚡ emoji with Lucide Zap icon.';
    } else if (line === 11540) {
      category = 'Required Field Indicator / Dot';
      replacementIcon = '<span className="text-rose-500 font-bold">*</span>';
      cleanCode = '<span className="text-rose-500 font-bold text-xs">*</span>';
      rationale = 'Replace 🔴 emoji with clean text asterisk.';
    } else if (line === 11548) {
      category = 'Modal Close Button';
      replacementIcon = '<X className="w-5 h-5" />';
      cleanCode = '<button onClick={() => setShowOtRequestModal(false)} className="..."><X className="w-5 h-5" /></button>';
      rationale = 'Replace ✕ symbol with Lucide X icon.';
    } else if (line === 11557) {
      category = 'Action Button';
      replacementIcon = '<Plus className="w-4 h-4 inline mr-1.5" />';
      cleanCode = '<button ... className="... flex items-center gap-1.5"><Plus className="w-4 h-4" /> <span>ยื่นใบคำขอทำ OT ออนไลน์ใหม่</span></button>';
      rationale = 'Replace ➕ emoji with Lucide Plus icon.';
    } else if (line === 11610) {
      category = 'Submit Button';
      replacementIcon = '<Send className="w-3.5 h-3.5 mr-1" />';
      cleanCode = '<button ... className="... flex items-center gap-1"><Send className="w-3.5 h-3.5" /> ยื่นคำขอทำ OT</button>';
      rationale = 'Replace 📤 emoji with Lucide Send icon.';
    } else if (line === 11638) {
      category = 'Request Status Badge';
      replacementIcon = 'Lucide CheckCircle2 / XCircle / Clock';
      cleanCode = '{req.status === "approved" ? <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-xs font-semibold"><CheckCircle2 className="w-3 h-3" /> อนุมัติแล้ว</span> : req.status === "rejected" ? <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 text-xs font-semibold"><XCircle className="w-3 h-3" /> ไม่อนุมัติ</span> : <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-xs font-semibold"><Clock className="w-3 h-3" /> รอพิจารณา</span>}';
      rationale = 'Replace ✅, ❌, ⏳ emojis with clean status badges containing Lucide CheckCircle2, XCircle, and Clock.';
    } else if (line === 11653) {
      category = 'Action Button';
      replacementIcon = '<Check className="w-3.5 h-3.5 mr-1" />';
      cleanCode = '<button ... className="... flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"><Check className="w-3.5 h-3.5" /> อนุมัติ</button>';
      rationale = 'Replace ✅ emoji with Lucide Check icon.';
    } else if (line === 11659) {
      category = 'Action Button';
      replacementIcon = '<X className="w-3.5 h-3.5 mr-1" />';
      cleanCode = '<button ... className="... flex items-center gap-1 bg-rose-600 hover:bg-rose-700 text-white"><X className="w-3.5 h-3.5" /> ปฏิเสธ</button>';
      rationale = 'Replace ❌ emoji with Lucide X icon.';
    } else if (line === 11694) {
      category = 'Modal Close Button';
      replacementIcon = '<X className="w-5 h-5" />';
      cleanCode = '<button onClick={() => setShowAdminApprovalModal(false)} className="..."><X className="w-5 h-5" /></button>';
      rationale = 'Replace ✕ symbol with Lucide X icon.';
    } else if (line === 11816) {
      category = 'Modal Close Button';
      replacementIcon = '<X className="w-5 h-5" />';
      cleanCode = '<button onClick={() => setShowBirthdayModal(false)} className="..."><X className="w-5 h-5" /></button>';
      rationale = 'Replace ✕ symbol with Lucide X icon.';
    } else if (line === 12236) {
      category = 'Search Input Clear Button';
      replacementIcon = '<X className="w-3.5 h-3.5" />';
      cleanCode = '<button onClick={() => setResignedSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"><X className="w-3.5 h-3.5" /></button>';
      rationale = 'Replace ✕ symbol with Lucide X icon.';
    }
  } else if (file === 'src/components/CircadianTimelineModal.tsx') {
    if (line === 155) {
      category = 'Navigation Control Button';
      replacementIcon = '<ChevronLeft className="w-4 h-4" />';
      cleanCode = '<button ... className="..."><ChevronLeft className="w-4 h-4" /></button>';
      rationale = 'Replace unicode ◀ symbol with Lucide ChevronLeft icon.';
    } else if (line === 172) {
      category = 'Navigation Control Button';
      replacementIcon = '<ChevronRight className="w-4 h-4" />';
      cleanCode = '<button ... className="..."><ChevronRight className="w-4 h-4" /></button>';
      rationale = 'Replace unicode ▶ symbol with Lucide ChevronRight icon.';
    } else if (line === 212) {
      category = 'Modal Close Button';
      replacementIcon = '<X className="w-5 h-5" />';
      cleanCode = '<button onClick={onClose} className="..."><X className="w-5 h-5" /></button>';
      rationale = 'Replace unicode ✕ symbol with Lucide X icon.';
    } else if (line === 252) {
      category = 'Coverage Status Badge';
      replacementIcon = 'Lucide CheckCircle2 / AlertTriangle';
      cleanCode = '{density.coverageWarnings.length === 0 ? <span className="inline-flex items-center gap-1 text-emerald-600"><CheckCircle2 className="w-3.5 h-3.5" /> ครอบคลุม 100%</span> : <span className="inline-flex items-center gap-1 text-amber-600"><AlertTriangle className="w-3.5 h-3.5" /> เตือน ({density.coverageWarnings.length})</span>}';
      rationale = 'Replace 🟢 and ⚠️ emojis with Lucide CheckCircle2 and AlertTriangle.';
    } else if (line === 263) {
      category = 'Section Title';
      replacementIcon = '<Activity className="w-4 h-4 text-[#1d3ec7] inline mr-1.5" />';
      cleanCode = '<h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5"><Activity className="w-4 h-4 text-[#1d3ec7]" /> ความหนาแน่นกำลังพลรายชั่วโมง (Hourly Staffing Density Heatmap)</h4>';
      rationale = 'Replace ⚡ emoji with Lucide Activity icon.';
    } else if (line === 388) {
      category = 'Circadian Shift Segment Label';
      replacementIcon = '<CornerDownLeft className="w-3 h-3 inline mr-1" />';
      cleanCode = '<span className="truncate inline-flex items-center gap-1"><CornerDownLeft className="w-3 h-3 text-indigo-400" /> {seg.shiftCode} (ต่อกะดึก)</span>';
      rationale = 'Replace unicode ◀ symbol with Lucide CornerDownLeft icon.';
    } else if (line === 432) {
      category = 'Alert Section Title';
      replacementIcon = '<AlertTriangle className="w-4 h-4 text-amber-500 inline mr-1.5" />';
      cleanCode = '<h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5"><AlertTriangle className="w-4 h-4 text-amber-500" /> ข้อความแจ้งเตือนความคุ้มครองกำลังพล</h4>';
      rationale = 'Replace ⚠️ emoji with Lucide AlertTriangle icon.';
    }
  } else if (file === 'src/components/LiveSimulationHUD.tsx') {
    if (line === 35) {
      category = 'Simulation Live Spinner';
      replacementIcon = '<Settings className="w-4 h-4 animate-spin text-[#1d3ec7]" />';
      cleanCode = '<Settings className="w-4 h-4 animate-spin text-[#1d3ec7]" />';
      rationale = 'Replace ⚙️ emoji spinner with Lucide Settings / Loader2 icon.';
    } else if (line === 102) {
      category = 'Warning Icon';
      replacementIcon = '<AlertTriangle className="w-4 h-4 text-amber-500" />';
      cleanCode = '<AlertTriangle className="w-4 h-4 text-amber-500" />';
      rationale = 'Replace ⚠️ emoji with Lucide AlertTriangle icon.';
    } else if (line === 107) {
      category = 'Success Status Icon';
      replacementIcon = '<CheckCircle2 className="w-4 h-4 text-emerald-500" />';
      cleanCode = '<CheckCircle2 className="w-4 h-4 text-emerald-500" />';
      rationale = 'Replace 🟢 emoji with Lucide CheckCircle2 icon.';
    }
  } else if (file === 'src/components/PremiumShiftTimePickerModal.tsx') {
    if (line === 109) {
      category = 'Dynamic Shift Name Generator';
      replacementIcon = 'Clean text: (กะข้ามคืน)';
      cleanCode = 'const name = `${timeLabel} ${roundedDuration} ชม.${isOvernight ? \' (กะข้ามคืน)\' : \'\'}${otHours > 0 ? ` (OT ${otHours}h)` : \'\'}`;';
      rationale = 'Remove 🌙 emoji from generated shift name string.';
    } else if (line === 668) {
      category = 'Shift Time Range Display';
      replacementIcon = 'Clean text / dash';
      cleanCode = '`${formattedStartTime} - ${formattedEndTime} น.${dynamicShift.isOvernight ? \' (วันถัดไป)\' : \'\'}`';
      rationale = 'Replace unicode ➜ arrow with clean hyphen/dash.';
    } else if (line === 672) {
      category = 'Overnight Indicator Badge';
      replacementIcon = '<Moon className="w-3.5 h-3.5 text-indigo-400 inline mr-1" />';
      cleanCode = '<span className="inline-flex items-center gap-1 text-xs text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 font-semibold"><Moon className="w-3.5 h-3.5" /> กะข้ามคืน</span>';
      rationale = 'Replace 🌙 emoji with Lucide Moon icon.';
    } else if (line === 717) {
      category = 'Quick Action Badge';
      replacementIcon = 'Clean text: 1-Click Quick';
      cleanCode = '<span className="px-1.5 py-0.5 rounded bg-black/20 text-[9px] font-mono">1-Click Quick</span>';
      rationale = 'Remove ⚡ emoji from badge text.';
    }
  } else if (file === 'src/components/ShiftRadialPicker.tsx') {
    if (line === 103) {
      category = 'Modal Close Button';
      replacementIcon = '<X className="w-4 h-4 text-slate-400 hover:text-slate-200" />';
      cleanCode = '<button onClick={onClose} className="..."><X className="w-4 h-4" /></button>';
      rationale = 'Replace ✕ symbol with Lucide X icon.';
    } else if (line === 112) {
      category = 'Radial Recommendation Header';
      replacementIcon = '<Sparkles className="w-3.5 h-3.5 text-amber-400 inline mr-1" />';
      cleanCode = '<div className="text-[11px] font-semibold text-amber-300 mb-1.5 flex items-center gap-1"><Sparkles className="w-3.5 h-3.5 text-amber-400" /> แนะนำคู่กะอัตโนมัติ</div>';
      rationale = 'Replace ⚡ emoji with Lucide Sparkles icon.';
    } else if (line === 127) {
      category = 'Quick Touch Badge';
      replacementIcon = 'Clean text: 1-Touch Auto';
      cleanCode = '<span className="px-1.5 py-0.5 rounded bg-black/30 text-[10px] font-mono">1-Touch Auto</span>';
      rationale = 'Remove ⚡ emoji from badge text.';
    }
  } else if (file === 'src/main.tsx') {
    if (line === 35) {
      category = 'Error Boundary Fallback UI';
      replacementIcon = '<AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-2" />';
      cleanCode = '<AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-2" />';
      rationale = 'Replace ⚠️ emoji in React ErrorBoundary fallback with Lucide AlertTriangle.';
    }
  } else if (file === 'src/utils/circadianEngine.ts') {
    if (line === 362) {
      category = 'Warning Message Generator';
      replacementIcon = 'Clean text string';
      cleanCode = 'coverageWarnings.push(`ช่องว่างกำลังพล: ไม่มีพนักงานปฏิบัติงานช่วง ${s.label} - ${String((s.hour + 1) % 24).padStart(2, "0")}:00`);';
      rationale = 'Remove ⚠️ emoji from warning message string.';
    } else if (line === 364) {
      category = 'Warning Message Generator';
      replacementIcon = 'Clean text string';
      cleanCode = 'coverageWarnings.push(`กำลังพลขั้นต่ำ: มีพนักงานเพียง 1 คนช่วง ${s.label} (${s.employees[0]?.name || "1 คน"})`);';
      rationale = 'Remove ⚡ emoji from warning message string.';
    }
  } else if (file === 'tests/tier5-adversarial/shift-engine-stress.test.tsx') {
    if (line === 372 || line === 409) {
      category = 'Test Matcher Regex';
      replacementIcon = 'Clean regex matcher';
      cleanCode = line === 372 ? 'expect(screen.queryByText(/แนะนำคู่กะอัตโนมัติ/i)).not.toBeInTheDocument();' : 'expect(screen.getByText(/แนะนำคู่กะอัตโนมัติ/i)).toBeInTheDocument();';
      rationale = 'Update test assertion regex from /⚡ แนะนำคู่กะอัตโนมัติ/i to /แนะนำคู่กะอัตโนมัติ/i so tests pass cleanly without emojis.';
    }
  } else if (file === 'server.ts') {
    category = 'Backend Comments & Generated Markdown';
    replacementIcon = 'Clean text';
    if (line === 37 || line === 862) {
      cleanCode = lineContent.replace('→', '->');
      rationale = 'Code comment arrow symbol.';
    } else if (line === 1588) {
      cleanCode = 'const report = `### รายงานวิเคราะห์การทำงานชั่วโมงเกิน (OT Audit Report)';
      rationale = 'Remove 📊 emoji from generated OT audit report markdown heading.';
    } else if (line === 1593) {
      cleanCode = '${overOt.map(e => `  - **${e.name}** (${e.deptId}): OT สะสม ${e.actualOt} ชม. (เป้าหมาย ${e.targetOt} ชม.)`).join("\\n")}';
      rationale = 'Remove ⚠️ emoji from generated OT audit report list items.';
    }
  } else if (file.startsWith('scripts/')) {
    category = 'CLI Script Logging';
    replacementIcon = 'Standard text tags ([PASS], [FAIL], [INFO])';
    cleanCode = lineContent.replace(/[✅❌🚀📊🚨🎉]/g, '');
    rationale = 'Replace CLI terminal emojis with clean executive tags like [PASS], [FAIL], [VERDICT: PASS].';
  }

  return {
    index: idx + 1,
    file,
    line,
    characters,
    lineContent,
    category,
    replacementIcon,
    cleanCode,
    rationale
  };
});

fs.writeFileSync(path.join(__dirname, 'complete_inventory.json'), JSON.stringify(mappedItems, null, 2));
console.log(`Successfully generated inventory for ${mappedItems.length} items.`);
