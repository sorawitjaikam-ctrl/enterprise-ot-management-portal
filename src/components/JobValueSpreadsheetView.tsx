import React, { useState, useMemo } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Award, 
  Download, 
  Upload, 
  Search, 
  Filter, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  ChevronRight, 
  FileSpreadsheet, 
  Layers, 
  Eye, 
  Save, 
  RefreshCw,
  X,
  FileText
} from "lucide-react";
import { 
  DetailedJobValueEmployee, 
  INITIAL_JOB_VALUE_EXCEL_RECORDS 
} from "../data/jobValueExcelData";
import * as XLSX from "xlsx";

interface JobValueSpreadsheetViewProps {
  currentUser: any;
  isHrOrFullAccess: boolean;
  onOpenEmployeeDetails?: (emp: any) => void;
}

const MONTH_LABELS_2025 = [
  "ต.ค. 24", "พ.ย. 24", "ธ.ค. 24", "ม.ค. 25", "ก.พ. 25", "มี.ค. 25",
  "เม.ย. 25", "พ.ค. 25", "มิ.ย. 25", "ก.ค. 25", "ส.ค. 25", "ก.ย. 25"
];

const MONTH_LABELS_2026 = [
  "ต.ค. 25", "พ.ย. 25", "ธ.ค. 25", "ม.ค. 26", "ก.พ. 26", "มี.ค. 26",
  "เม.ย. 26", "พ.ค. 26", "มิ.ย. 26", "ก.ค. 26", "ส.ค. 26", "ก.ย. 26"
];

const GROUPS_ORDER = [
  "ITS O&M Specialist",
  "INTER 2_Technician",
  "INTER 3_Technician",
  "INTER 5_Technician",
  "INTER 7_Technician",
  "อายุงานน้อยกว่า 1 ปี"
];


// Formatter strictly suppressing decimals (whole integers only)
export const formatInt = (val: number | null | undefined): string => {
  if (val === null || val === undefined || isNaN(val)) return "-";
  return Math.round(Number(val)).toLocaleString("en-US", { maximumFractionDigits: 0 });
};

export const formatSignedInt = (val: number | null | undefined): string => {
  if (val === null || val === undefined || isNaN(val)) return "-";
  const rounded = Math.round(Number(val));
  return (rounded > 0 ? "+" : "") + rounded.toLocaleString("en-US", { maximumFractionDigits: 0 });
};

export default function JobValueSpreadsheetView({
  currentUser,
  isHrOrFullAccess,
  onOpenEmployeeDetails
}: JobValueSpreadsheetViewProps) {
  // Master state initialized with the 27 corporate records from Job value.xlsx
  const [records, setRecords] = useState<DetailedJobValueEmployee[]>(INITIAL_JOB_VALUE_EXCEL_RECORDS);
  const [selectedGroup, setSelectedGroup] = useState<string>("ALL");
  const [growthFilter, setGrowthFilter] = useState<string>("ALL"); // ALL | GROWTH | NO_GROWTH
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeTabMode, setActiveTabMode] = useState<"summary" | "full" | "criteria">("summary");
  
  // Drilldown modal for viewing 12-month detailed breakdown
  const [drilldownEmp, setDrilldownEmp] = useState<DetailedJobValueEmployee | null>(null);
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [importStatusMsg, setImportStatusMsg] = useState<string>("");

  // Executive KPIs
  const totalEmployees = records.length;
  const growthCount = records.filter(r => r.profitGrowth > 0).length;
  const noGrowthCount = records.filter(r => r.profitGrowth <= 0).length;
  const totalRev2025 = records.reduce((s, r) => s + r.avgRev2025, 0);
  const totalRev2026 = records.reduce((s, r) => s + r.avgRev2026, 0);
  const totalProf2025 = records.reduce((s, r) => s + r.avgProf2025, 0);
  const totalProf2026 = records.reduce((s, r) => s + r.avgProf2026, 0);
  const netGrowth = totalProf2026 - totalProf2025;

  // Filtered list
  const filteredRecords = useMemo(() => {
    return records.filter(emp => {
      // Group filter
      if (selectedGroup !== "ALL") {
        if (selectedGroup === "INTER 2" && !emp.group.includes("INTER 2") && emp.dept !== "INTER 2") return false;
        if (selectedGroup === "INTER 3" && !emp.group.includes("INTER 3") && emp.dept !== "INTER 3") return false;
        if (selectedGroup === "INTER 5" && !emp.group.includes("INTER 5") && emp.dept !== "INTER 5") return false;
        if (selectedGroup === "INTER 7" && !emp.group.includes("INTER 7") && emp.dept !== "INTER 7") return false;
        if (selectedGroup === "ITS O&M Specialist" && !emp.group.includes("Specialist")) return false;
        if (selectedGroup === "อายุงานน้อยกว่า 1 ปี" && !emp.group.includes("น้อยกว่า 1 ปี")) return false;
      }

      // Growth filter
      if (growthFilter === "GROWTH" && emp.profitGrowth <= 0) return false;
      if (growthFilter === "NO_GROWTH" && emp.profitGrowth > 0) return false;

      // Department permission restriction for Section Managers
      if (!isHrOrFullAccess && currentUser?.deptId && currentUser.deptId !== "all") {
        const uDept = String(currentUser.deptId).toUpperCase();
        if (!emp.dept.toUpperCase().includes(uDept)) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const mId = emp.empId.toLowerCase().includes(q);
        const mName = emp.name.toLowerCase().includes(q);
        const mRole = emp.role.toLowerCase().includes(q);
        const mDept = emp.dept.toLowerCase().includes(q);
        const mGroup = emp.group.toLowerCase().includes(q);
        if (!mId && !mName && !mRole && !mDept && !mGroup) return false;
      }

      return true;
    });
  }, [records, selectedGroup, growthFilter, searchQuery, isHrOrFullAccess, currentUser]);

  // Group records by section
  const groupedRecords = useMemo(() => {
    const map = new Map<string, DetailedJobValueEmployee[]>();
    GROUPS_ORDER.forEach(g => map.set(g, []));

    filteredRecords.forEach(r => {
      let gName = r.group;
      if (!map.has(gName)) {
        // Find best match
        const match = GROUPS_ORDER.find(g => gName.includes(g) || g.includes(gName));
        gName = match || gName;
      }
      if (!map.has(gName)) {
        map.set(gName, []);
      }
      map.get(gName)!.push(r);
    });

    return Array.from(map.entries()).filter(([_, emps]) => emps.length > 0);
  }, [filteredRecords]);

  // File import handler (supports .xlsx or .csv)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportStatusMsg("กำลังนำเข้าข้อมูลจากไฟล์ " + file.name + "...");

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary", cellFormula: true });
        const wsName = wb.SheetNames[0];
        const ws = wb.Sheets[wsName];
        const sheetData: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });

        let currentGrp = "";
        const parsed: DetailedJobValueEmployee[] = [];

        for (let r = 4; r < sheetData.length; r++) {
          const row = sheetData[r];
          if (!row || row.length === 0) continue;

          if (typeof row[0] === "string" && (row[1] === undefined || row[1] === null || row[1] === "")) {
            currentGrp = row[0].trim();
            continue;
          }

          if (row[1]) {
            const mRev25 = [];
            const mProf25 = [];
            for (let c = 8; c <= 19; c++) mRev25.push(Math.round(Number(row[c]) || 0));
            for (let c = 21; c <= 32; c++) mProf25.push(Math.round(Number(row[c]) || 0));

            const mRev26 = [];
            const mProf26 = [];
            for (let c = 34; c <= 45; c++) mRev26.push(Math.round(Number(row[c]) || 0));
            for (let c = 47; c <= 58; c++) mProf26.push(Math.round(Number(row[c]) || 0));

            let sDate = "";
            if (row[7]) {
              if (typeof row[7] === "number") {
                const d = XLSX.SSF.parse_date_code(row[7]);
                sDate = `${d.y}-${String(d.m).padStart(2, "0")}-${String(d.d).padStart(2, "0")}`;
              } else {
                sDate = String(row[7]);
              }
            }

            parsed.push({
              no: Number(row[0]) || parsed.length + 1,
              empId: String(row[1]).trim(),
              name: String(row[2] || "").trim(),
              dept: String(row[3] || "").trim(),
              group: currentGrp || "กลุ่ม O&M",
              type: String(row[4] || "").trim(),
              level: String(row[5] || "").trim(),
              role: String(row[6] || "").trim(),
              startDate: sDate,
              monthlyRev2025: mRev25,
              monthlyProf2025: mProf25,
              avgRev2025: Math.round(Number(row[20]) || 0),
              avgProf2025: Math.round(Number(row[33]) || 0),
              monthlyRev2026: mRev26,
              monthlyProf2026: mProf26,
              avgRev2026: Math.round(Number(row[46]) || 0),
              avgProf2026: Math.round(Number(row[59]) || 0),
              profitGrowth: Math.round(Number(row[61]) || 0),
              profitGrowthStatus: row[75] || (Number(row[61]) > 0 ? "กำไรต่อยอด" : "ไม่ต่อยอด"),
              rank2025: row[63] || null,
              rank2025Fraction: row[64] ? String(row[64]).trim() : "",
              rank2026: row[65] || null,
              rank2026Fraction: row[66] ? String(row[66]).trim() : "",
              eval2026: row[67] ? String(row[67]).trim() : "",
              rankSubgroup: row[68] || null,
              rankMainGroup: row[69] || null,
              eval2025: row[70] ? String(row[70]).trim() : "",
              leaves2026: Math.round(Number(row[72]) || 0),
              leaves2025: Math.round(Number(row[73]) || 0),
              criteria1_1: row[75] || (Number(row[61]) > 0 ? "กำไรต่อยอด" : "ไม่ต่อยอด"),
              criteria1_2: row[76] || "",
              criteria1_3: row[77] || "",
              criteria1_4: row[78] || "",
              criteria1_5: row[79] || "",
              criteria2_1: row[81] || "",
              criteria2_2: row[82] || "",
              criteria3_1: row[84] || "",
              criteria3_2: row[85] || "",
              adjStatus: row[87] ? String(row[87]).trim() : (Number(row[61]) > 0 ? "ปรับ" : "ไม่ปรับ"),
              adjBeforeCap: Math.round(Number(row[88]) || 0),
              adjBaseSalary: Math.round(Number(row[89]) || 0),
              adjCapJv: Math.round(Number(row[90]) || 0),
              note: row[91] ? String(row[91]).trim() : ""
            });
          }
        }

        if (parsed.length > 0) {
          setRecords(parsed);
          setImportStatusMsg(`นำเข้าข้อมูลสมบูรณ์ ${parsed.length} รายการ`);
        } else {
          setImportStatusMsg("ไม่พบแถวข้อมูลพนักงานในไฟล์ที่เลือก");
        }
      } catch (err: any) {
        console.error("Error importing Excel file:", err);
        setImportStatusMsg("เกิดข้อผิดพลาดในการอ่านไฟล์: " + (err.message || "รูปแบบไม่ถูกต้อง"));
      } finally {
        setIsImporting(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  // Export CSV matching exact Excel structure
  const handleExportCsv = () => {
    const headers = [
      "ที่", "รหัสพนักงาน", "ชื่อ-พนักงาน", "แผนก", "ประเภท", "ระดับ", "ตำแหน่ง", "วันเริ่มงาน",
      "รายได้ JV เฉลี่ย 2025", "กำไร JV เฉลี่ย 2025",
      "รายได้ JV เฉลี่ย 2026", "กำไร JV เฉลี่ย 2026",
      "กำไรต่อยอด (Diff)", "สถานะต่อยอด",
      "Ranking กำไร 67", "Ranking กำไร 69",
      "ผลการประเมิน 2568", "ผลการประเมิน 2569",
      "วันลารวม 68", "วันลารวม 69",
      "สรุปการปรับฯ", "เม็ดเงินปรับเข้าฐาน", "เม็ดเงินปรับเข้า CAP JV", "หมายเหตุ"
    ];

    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return '""';
      let str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    let content = "\ufeff" + headers.join(",") + "\n";
    records.forEach(r => {
      const row = [
        r.no,
        escapeCsv(r.empId),
        escapeCsv(r.name),
        escapeCsv(r.dept),
        escapeCsv(r.type),
        escapeCsv(r.level),
        escapeCsv(r.role),
        escapeCsv(r.startDate),
        Math.round(r.avgRev2025),
        Math.round(r.avgProf2025),
        Math.round(r.avgRev2026),
        Math.round(r.avgProf2026),
        Math.round(r.profitGrowth),
        escapeCsv(r.profitGrowthStatus),
        escapeCsv(r.rank2025Fraction),
        escapeCsv(r.rank2026Fraction),
        escapeCsv(r.eval2025),
        escapeCsv(r.eval2026),
        Math.round(r.leaves2025),
        Math.round(r.leaves2026),
        escapeCsv(r.adjStatus),
        Math.round(r.adjBaseSalary),
        Math.round(r.adjCapJv),
        escapeCsv(r.note)
      ];
      content += row.join(",") + "\n";
    });

    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Job_Value_Evaluation_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-full min-w-0 space-y-4 sm:space-y-6 font-sans">
      {/* Top Banner & Corporate Header */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-blue-600" />
              <span>(Not Final) Job Value 69</span>
            </h3>
            <span className="px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold font-mono">
              รอบปี 2568 – 2569 (2025–2026)
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
              {totalEmployees} บุคลากร
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed max-w-4xl">
            โครงสร้างการประเมินคุณค่าตำแหน่งงานและผลตอบแทนประจำปีกลุ่ม JV สะท้อนตามรูปแบบไฟล์เอกสารองค์กร: 
            เปรียบเทียบผลประกอบการรายได้และกำไรเฉลี่ย 2 ปี, การต่อยอดผลกำไร, Ranking ในกลุ่มย่อย/กลุ่มใหญ่, 
            พร้อมเกณฑ์พิจารณาปรับค่าตอบแทน 3 ด้าน
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto shrink-0">
          <button
            type="button"
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
            title="ส่งออกตารางเป็นไฟล์ CSV"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span>ส่งออก CSV</span>
          </button>

          {isHrOrFullAccess && (
            <label 
              className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm hover:shadow"
              title="นำเข้าไฟล์ Excel 'Job value.xlsx'"
            >
              <Upload className="w-3.5 h-3.5 text-white" />
              <span>{isImporting ? "กำลังนำเข้า..." : "นำเข้า Excel / CSV"}</span>
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileUpload}
                className="hidden"
                disabled={isImporting}
              />
            </label>
          )}
        </div>
      </div>

      {importStatusMsg && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs font-bold text-blue-800 flex items-center justify-between">
          <span>{importStatusMsg}</span>
          <button onClick={() => setImportStatusMsg("")} className="text-blue-500 hover:text-blue-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 4 Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 font-mono">
        {/* KPI 1: Headcount */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-[11px] font-sans font-bold text-slate-500">บุคลากรที่ประเมินทั้งหมด</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-slate-900">{totalEmployees}</span>
            <span className="text-xs font-sans text-slate-500 font-bold">คน (6 สายงาน)</span>
          </div>
          <span className="text-[10px] font-sans text-blue-600 mt-2 font-bold">
            แสดงผลตามตัวกรอง {filteredRecords.length} คน
          </span>
        </div>

        {/* KPI 2: Revenue 2026 vs 2025 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-[11px] font-sans font-bold text-slate-500">รายได้เฉลี่ยรวม ปี 2569 (2026)</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-emerald-700">{formatInt(totalRev2026)}</span>
            <span className="text-xs font-sans text-slate-500 font-bold">บาท/เดือน</span>
          </div>
          <span className="text-[10px] font-sans text-slate-500 mt-2">
            ปี 2568: {formatInt(totalRev2025)} บาท/เดือน
          </span>
        </div>

        {/* KPI 3: Profit 2026 vs 2025 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-[11px] font-sans font-bold text-slate-500">กำไรเฉลี่ยรวม ปี 2569 (2026)</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-blue-700">{formatInt(totalProf2026)}</span>
            <span className="text-xs font-sans text-slate-500 font-bold">บาท/เดือน</span>
          </div>
          <span className="text-[10px] font-sans text-slate-500 mt-2">
            ปี 2568: {formatInt(totalProf2025)} บาท/เดือน
          </span>
        </div>

        {/* KPI 4: Profit Growth Ratio */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-[11px] font-sans font-bold text-slate-500">สัดส่วนกำไรต่อยอด (สุทธิ)</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className={`text-2xl font-black ${netGrowth >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
              {formatSignedInt(netGrowth)}
            </span>
            <span className="text-xs font-sans text-slate-500 font-bold">บาท</span>
          </div>
          <div className="flex items-center gap-2 mt-2 text-[10px] font-sans font-bold">
            <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              ต่อยอด: {growthCount} คน
            </span>
            <span className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
              ไม่ต่อยอด: {noGrowthCount} คน
            </span>
          </div>
        </div>
      </div>

      {/* Navigation, Filter Bar & View Mode Toggle */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-3">
        {/* Row 1: Groups filter buttons (matching the Excel sections) */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar touch-pan-x py-0.5">
            <span className="text-xs font-bold text-slate-400 mr-1 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" />
              <span>สายงาน:</span>
            </span>
            {[
              { id: "ALL", label: "ทั้งหมด (27)" },
              { id: "ITS O&M Specialist", label: "Specialist (3)" },
              { id: "INTER 2", label: "INTER 2 (3)" },
              { id: "INTER 3", label: "INTER 3 (7)" },
              { id: "INTER 5", label: "INTER 5 (5)" },
              { id: "INTER 7", label: "INTER 7 (3)" },
              { id: "อายุงานน้อยกว่า 1 ปี", label: "อายุงาน < 1 ปี (6)" }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedGroup(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedGroup === tab.id
                    ? "bg-[#0E3A66] text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* View mode switcher */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto shrink-0">
            <button
              type="button"
              onClick={() => setActiveTabMode("summary")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTabMode === "summary"
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              สรุปเปรียบเทียบ 2 ปี &amp; Ranking
            </button>
            <button
              type="button"
              onClick={() => setActiveTabMode("criteria")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTabMode === "criteria"
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              เกณฑ์พิจารณา 3 ด้าน &amp; ปรับเงินเดือน
            </button>
            <button
              type="button"
              onClick={() => setActiveTabMode("full")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTabMode === "full"
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              มาสเตอร์ชีตเต็ม (Master Sheet)
            </button>
          </div>
        </div>

        {/* Row 2: Search and Growth filters */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100 flex-wrap">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ค้นหารหัส, ชื่อพนักงาน, ตำแหน่ง, แผนก..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Growth filter pill buttons */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setGrowthFilter("ALL")}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  growthFilter === "ALL" ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                ทั้งหมด
              </button>
              <button
                type="button"
                onClick={() => setGrowthFilter("GROWTH")}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  growthFilter === "GROWTH" ? "bg-emerald-600 text-white" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                }`}
              >
                <TrendingUp className="w-3 h-3" />
                <span>กำไรต่อยอด ({growthCount})</span>
              </button>
              <button
                type="button"
                onClick={() => setGrowthFilter("NO_GROWTH")}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  growthFilter === "NO_GROWTH" ? "bg-rose-600 text-white" : "bg-rose-50 text-rose-700 hover:bg-rose-100"
                }`}
              >
                <TrendingDown className="w-3 h-3" />
                <span>ไม่ต่อยอด ({noGrowthCount})</span>
              </button>
            </div>
          </div>

          <div className="text-xs font-bold text-slate-500">
            แสดงข้อมูล <span className="text-slate-900 font-extrabold">{filteredRecords.length}</span> จากทั้งหมด {totalEmployees} คน
          </div>
        </div>
      </div>

      {/* Main Corporate Spreadsheet Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto no-scrollbar touch-pan-x w-full">
          <table className="w-full text-left border-collapse text-xs min-w-[1300px]">
            {/* Multi-tier Header reflecting Excel Rows 3 & 4 */}
            <thead>
              {/* Level 1: Super Header Groups */}
              <tr className="bg-[#0E3A66] text-white text-[11px] font-extrabold uppercase tracking-wider divide-x divide-white/20 select-none">
                <th colSpan={6} className="px-3.5 py-2 text-center bg-[#0E3A66]">
                  ข้อมูลบุคลากร (Employee Profile)
                </th>
                <th colSpan={2} className="px-3.5 py-2 text-center bg-[#17538F]">
                  รอบปี 2025 / 2568 (Average)
                </th>
                <th colSpan={2} className="px-3.5 py-2 text-center bg-[#1E9C6E]">
                  รอบปี 2026 / 2569 (Average)
                </th>
                <th colSpan={2} className="px-3.5 py-2 text-center bg-[#0B2545]">
                  การเติบโตของผลกำไร (Growth)
                </th>
                <th colSpan={2} className="px-3.5 py-2 text-center bg-[#3D5A80]">
                  Ranking ในกลุ่ม (Rank JV)
                </th>
                {activeTabMode !== "criteria" ? (
                  <th colSpan={4} className="px-3.5 py-2 text-center bg-[#293241]">
                    ผลการประเมิน &amp; สถิติวันลา
                  </th>
                ) : (
                  <th colSpan={4} className="px-3.5 py-2 text-center bg-[#6A0572]">
                    เกณฑ์การพิจารณา 3 ด้าน &amp; การปรับประจำปี
                  </th>
                )}
                <th className="px-3.5 py-2 text-center bg-[#0E3A66] w-20">
                  รายละเอียด
                </th>
              </tr>

              {/* Level 2: Specific Column Headers */}
              <tr className="bg-slate-100 border-b border-slate-300 text-[11px] font-black text-slate-700 uppercase divide-x divide-slate-200 select-none">
                <th className="px-2.5 py-2.5 text-center w-10">ที่</th>
                <th className="px-3 py-2.5 font-mono w-24">รหัสพนักงาน</th>
                <th className="px-3.5 py-2.5 min-w-[170px]">ชื่อ-พนักงาน</th>
                <th className="px-3 py-2.5 w-24 text-center">แผนก</th>
                <th className="px-2.5 py-2.5 w-24 text-center">ประเภท/ระดับ</th>
                <th className="px-3 py-2.5 min-w-[150px]">ตำแหน่ง</th>

                {/* 2025 Averages */}
                <th className="px-3 py-2.5 text-right bg-blue-50/50 text-[#17538F]">รายได้ JV (25)</th>
                <th className="px-3 py-2.5 text-right bg-blue-50/50 text-slate-800">กำไร JV (25)</th>

                {/* 2026 Averages */}
                <th className="px-3 py-2.5 text-right bg-emerald-50/50 text-emerald-800">รายได้ JV (26)</th>
                <th className="px-3 py-2.5 text-right bg-emerald-50/50 text-slate-900 font-extrabold">กำไร JV (26)</th>

                {/* Profit Growth Diff */}
                <th className="px-3.5 py-2.5 text-right bg-slate-50 text-slate-900">กำไรต่อยอด (Diff)</th>
                <th className="px-3 py-2.5 text-center bg-slate-50">สถานะ</th>

                {/* Rankings */}
                <th className="px-3 py-2.5 text-center bg-slate-50">Rank ปี 67</th>
                <th className="px-3 py-2.5 text-center bg-blue-50/70 text-blue-900 font-extrabold">Rank ปี 69</th>

                {/* Conditional right columns */}
                {activeTabMode !== "criteria" ? (
                  <>
                    <th className="px-3 py-2.5 text-center">ผลประเมิน 68</th>
                    <th className="px-3 py-2.5 text-center">ผลประเมิน 69</th>
                    <th className="px-2.5 py-2.5 text-center">วันลา 68</th>
                    <th className="px-2.5 py-2.5 text-center">วันลา 69</th>
                  </>
                ) : (
                  <>
                    <th className="px-3 py-2.5 text-center bg-purple-50/50 text-purple-900">เกณฑ์ 1.1</th>
                    <th className="px-3 py-2.5 text-center bg-purple-50/50 text-purple-900">สรุปการปรับฯ</th>
                    <th className="px-3 py-2.5 text-right bg-purple-50/50 text-purple-900">ปรับเข้าฐาน</th>
                    <th className="px-3 py-2.5 text-right bg-purple-50/50 text-purple-900">ปรับเข้า CAP</th>
                  </>
                )}

                <th className="px-3 py-2.5 text-center w-20">12 เดือน</th>
              </tr>
            </thead>

            {/* Table Body with Group Sections */}
            <tbody className="divide-y divide-slate-200">
              {groupedRecords.map(([groupName, emps]) => (
                <React.Fragment key={groupName}>
                  {/* Category Section Banner */}
                  <tr className="bg-[#F3F6F8] border-y-2 border-[#DCE4EA]">
                    <td colSpan={17} className="px-4 py-2 font-black text-[#0E3A66] text-xs uppercase tracking-wider flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#0E3A66]" />
                        <span>{groupName}</span>
                        <span className="px-2 py-0.5 rounded-full bg-white text-[#17538F] border border-[#DCE4EA] text-[10px] font-mono">
                          {emps.length} คน
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-[11px] font-mono font-normal">
                        <span>รายได้ 26 รวม: <strong>{formatInt(emps.reduce((s, e) => s + e.avgRev2026, 0))}</strong> บาท</span>
                        <span>กำไร 26 รวม: <strong>{formatInt(emps.reduce((s, e) => s + e.avgProf2026, 0))}</strong> บาท</span>
                      </div>
                    </td>
                  </tr>

                  {/* Employee Rows in this Group */}
                  {emps.map((emp, idx) => {
                    const isPositive = emp.profitGrowth > 0;
                    return (
                      <tr 
                        key={emp.empId} 
                        className="hover:bg-blue-50/50 transition-colors divide-x divide-slate-100 group/row"
                      >
                        <td className="px-2.5 py-2.5 text-center text-slate-400 font-mono text-[11px]">{emp.no}</td>
                        <td className="px-3 py-2.5 font-mono font-bold text-slate-800">{emp.empId}</td>
                        <td className="px-3.5 py-2.5 font-bold text-slate-900 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => onOpenEmployeeDetails?.(emp)}
                            className="hover:text-blue-600 transition-colors text-left"
                            title="คลิกเพื่อดูโปรไฟล์พนักงาน"
                          >
                            {emp.name}
                          </button>
                        </td>
                        <td className="px-3 py-2.5 text-center whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold">
                            {emp.dept}
                          </span>
                        </td>
                        <td className="px-2.5 py-2.5 text-center text-slate-600 text-[10px]">
                          <div>{emp.type}</div>
                          <div className="text-slate-400 font-mono text-[9px]">{emp.level}</div>
                        </td>
                        <td className="px-3 py-2.5 text-slate-700 font-medium whitespace-nowrap">{emp.role}</td>

                        {/* 2025 Averages */}
                        <td className="px-3 py-2.5 text-right font-mono text-slate-600 bg-blue-50/20">
                          {emp.avgRev2025 > 0 ? formatInt(emp.avgRev2025) : "-"}
                        </td>
                        <td className="px-3 py-2.5 text-right font-mono text-slate-700 bg-blue-50/20 font-bold">
                          {emp.avgProf2025 !== 0 ? formatInt(emp.avgProf2025) : "-"}
                        </td>

                        {/* 2026 Averages */}
                        <td className="px-3 py-2.5 text-right font-mono font-bold text-emerald-800 bg-emerald-50/20">
                          {emp.avgRev2026 > 0 ? formatInt(emp.avgRev2026) : "-"}
                        </td>
                        <td className="px-3 py-2.5 text-right font-mono font-black text-slate-900 bg-emerald-50/20">
                          {emp.avgProf2026 !== 0 ? formatInt(emp.avgProf2026) : "-"}
                        </td>

                        {/* Growth */}
                        <td className={`px-3.5 py-2.5 text-right font-mono font-black ${isPositive ? "text-emerald-700" : "text-rose-700"}`}>
                          {formatSignedInt(emp.profitGrowth)}
                        </td>
                        <td className="px-3 py-2.5 text-center whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black inline-flex items-center gap-1 ${
                            isPositive 
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300" 
                              : "bg-rose-100 text-rose-800 border border-rose-300"
                          }`}>
                            {isPositive ? "กำไรต่อยอด" : "ไม่ต่อยอด"}
                          </span>
                        </td>

                        {/* Rankings */}
                        <td className="px-3 py-2.5 text-center font-mono text-slate-500 text-[11px]">
                          {emp.rank2025Fraction || "-"}
                        </td>
                        <td className="px-3 py-2.5 text-center font-mono font-extrabold text-blue-800 bg-blue-50/40 text-xs">
                          {emp.rank2026Fraction || "-"}
                        </td>

                        {/* Mode dependent columns */}
                        {activeTabMode !== "criteria" ? (
                          <>
                            <td className="px-3 py-2.5 text-center text-[10px] font-bold text-slate-600">
                              {emp.eval2025 || "-"}
                            </td>
                            <td className="px-3 py-2.5 text-center text-[10px] font-bold">
                              {emp.eval2026 ? (
                                <span className={`px-2 py-0.5 rounded ${
                                  emp.eval2026.includes("Above") 
                                    ? "bg-emerald-100 text-emerald-800 font-extrabold" 
                                    : "bg-blue-50 text-blue-800"
                                }`}>
                                  {emp.eval2026}
                                </span>
                              ) : "-"}
                            </td>
                            <td className="px-2.5 py-2.5 text-center font-mono text-slate-600 text-[11px]">{formatInt(emp.leaves2025)}</td>
                            <td className="px-2.5 py-2.5 text-center font-mono font-bold text-slate-800 text-[11px]">{formatInt(emp.leaves2026)}</td>
                          </>
                        ) : (
                          <>
                            <td className="px-3 py-2.5 text-center text-[10px] font-bold bg-purple-50/20">
                              {emp.criteria1_1}
                            </td>
                            <td className="px-3 py-2.5 text-center text-[10px] font-bold bg-purple-50/20">
                              <span className={`px-2 py-0.5 rounded ${
                                emp.adjStatus === "ปรับ" ? "bg-emerald-100 text-emerald-800 font-black" : "bg-slate-100 text-slate-600"
                              }`}>
                                {emp.adjStatus || "ไม่ปรับ"}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 text-right font-mono font-bold text-purple-900 bg-purple-50/20">
                              {emp.adjBaseSalary > 0 ? formatInt(emp.adjBaseSalary) : "-"}
                            </td>
                            <td className="px-3 py-2.5 text-right font-mono font-bold text-purple-900 bg-purple-50/20">
                              {emp.adjCapJv > 0 ? formatInt(emp.adjCapJv) : "-"}
                            </td>
                          </>
                        )}

                        {/* View monthly button */}
                        <td className="px-3 py-2.5 text-center">
                          <button
                            type="button"
                            onClick={() => setDrilldownEmp(emp)}
                            className="p-1 rounded-lg text-blue-600 hover:bg-blue-100 transition-colors cursor-pointer"
                            title="ดูรายเดือน 12 เดือน 2025/2026"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </React.Fragment>
              ))}

              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan={17} className="px-6 py-12 text-center text-slate-400 font-bold">
                    ไม่พบข้อมูลพนักงานที่ตรงกับเงื่อนไขการค้นหาหรือตัวกรอง
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Monthly Breakdown Modal (12-Month Drilldown for 2025 vs 2026) */}
      {drilldownEmp && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    {drilldownEmp.name}
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-mono font-bold">
                    รหัส: {drilldownEmp.empId}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                    {drilldownEmp.dept} · {drilldownEmp.role}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  กลุ่ม: <strong>{drilldownEmp.group}</strong> | วันเริ่มงาน: {drilldownEmp.startDate || "-"} | 
                  สถานะ: <strong className={drilldownEmp.profitGrowth > 0 ? "text-emerald-700" : "text-rose-700"}>
                    {drilldownEmp.profitGrowthStatus} ({formatSignedInt(drilldownEmp.profitGrowth)} บาท)
                  </strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDrilldownEmp(null)}
                className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: 12-Month Comparison Table */}
            <div className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1 text-xs">
              {/* Year 2026 (รอบปี 2569) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-emerald-800 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                    <span>รอบปี 2026 (ต.ค. 2568 – ก.ย. 2569)</span>
                  </h4>
                  <span className="font-mono text-xs">
                    รายได้เฉลี่ย: <strong>{formatInt(drilldownEmp.avgRev2026)}</strong> | 
                    กำไรเฉลี่ย: <strong className="text-emerald-700 font-extrabold">{formatInt(drilldownEmp.avgProf2026)}</strong> บาท/เดือน
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-center border-collapse text-xs font-mono">
                    <thead>
                      <tr className="bg-emerald-50/70 border border-emerald-200 text-emerald-900 text-[10px] font-bold">
                        <th className="p-2 text-left font-sans w-24">รายการ</th>
                        {MONTH_LABELS_2026.map(m => <th key={m} className="p-2">{m}</th>)}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 border border-slate-200">
                      <tr>
                        <td className="p-2 text-left font-sans font-bold text-slate-700 bg-slate-50">รายได้ JV</td>
                        {drilldownEmp.monthlyRev2026.map((v, i) => (
                          <td key={i} className="p-2 text-slate-800">{v > 0 ? formatInt(v) : "-"}</td>
                        ))}
                      </tr>
                      <tr className="bg-emerald-50/30">
                        <td className="p-2 text-left font-sans font-extrabold text-emerald-800 bg-emerald-50/50">กำไรสุทธิ</td>
                        {drilldownEmp.monthlyProf2026.map((v, i) => (
                          <td key={i} className={`p-2 font-bold ${v >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                            {v !== 0 ? formatInt(v) : "-"}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Year 2025 (รอบปี 2568) */}
              <div className="space-y-2 pt-3 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-[#17538F] flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#17538F]" />
                    <span>รอบปี 2025 (ต.ค. 2567 – ก.ย. 2568)</span>
                  </h4>
                  <span className="font-mono text-xs">
                    รายได้เฉลี่ย: <strong>{formatInt(drilldownEmp.avgRev2025)}</strong> | 
                    กำไรเฉลี่ย: <strong className="text-[#17538F] font-extrabold">{formatInt(drilldownEmp.avgProf2025)}</strong> บาท/เดือน
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-center border-collapse text-xs font-mono">
                    <thead>
                      <tr className="bg-blue-50/70 border border-blue-200 text-blue-900 text-[10px] font-bold">
                        <th className="p-2 text-left font-sans w-24">รายการ</th>
                        {MONTH_LABELS_2025.map(m => <th key={m} className="p-2">{m}</th>)}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 border border-slate-200">
                      <tr>
                        <td className="p-2 text-left font-sans font-bold text-slate-700 bg-slate-50">รายได้ JV</td>
                        {drilldownEmp.monthlyRev2025.map((v, i) => (
                          <td key={i} className="p-2 text-slate-800">{v > 0 ? formatInt(v) : "-"}</td>
                        ))}
                      </tr>
                      <tr className="bg-blue-50/30">
                        <td className="p-2 text-left font-sans font-extrabold text-blue-800 bg-blue-50/50">กำไรสุทธิ</td>
                        {drilldownEmp.monthlyProf2025.map((v, i) => (
                          <td key={i} className={`p-2 font-bold ${v >= 0 ? "text-blue-700" : "text-rose-700"}`}>
                            {v !== 0 ? formatInt(v) : "-"}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Evaluation & Adjustment Summary Card */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block">Ranking ในกลุ่ม (ปี 67)</span>
                  <span className="text-sm font-mono font-black text-slate-800">{drilldownEmp.rank2025Fraction || "-"}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block">Ranking ในกลุ่ม (ปี 69)</span>
                  <span className="text-sm font-mono font-black text-blue-700">{drilldownEmp.rank2026Fraction || "-"}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block">ผลการประเมินปี 2568</span>
                  <span className="text-xs font-bold text-slate-700">{drilldownEmp.eval2025 || "-"}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block">ผลการประเมินปี 2569</span>
                  <span className="text-xs font-bold text-blue-800">{drilldownEmp.eval2026 || "-"}</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                type="button"
                onClick={() => setDrilldownEmp(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
