import React, { useState, useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Download,
  Upload,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileSpreadsheet,
  Layers,
  Eye,
  RefreshCw,
  X,
  RotateCcw,
  DollarSign,
  ShoppingBag,
  BarChart3,
  LineChart as LineChartIcon,
} from "lucide-react";
import {
  DetailedJobValueEmployee,
  INITIAL_JOB_VALUE_EXCEL_RECORDS,
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

const SHORT_MONTH_LABELS = [
  "ต.ค.", "พ.ย.", "ธ.ค.", "ม.ค.", "ก.พ.", "มี.ค.",
  "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย."
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
  if (val === null || val === undefined || isNaN(val)) return "0";
  return Math.round(Number(val)).toLocaleString("th-TH", { maximumFractionDigits: 0 });
};

export const formatSignedInt = (val: number | null | undefined): string => {
  if (val === null || val === undefined || isNaN(val)) return "0";
  const rounded = Math.round(Number(val));
  return (rounded > 0 ? "+" : "") + rounded.toLocaleString("th-TH", { maximumFractionDigits: 0 });
};

interface SummaryRowItem {
  key: string;
  name: string;
  empId?: string;
  dept: string;
  revenue: number;
  cost: number;
  profit: number;
  profit2025: number;
  count: number;
  status: string;
}

export default function JobValueSpreadsheetView({
  currentUser,
  isHrOrFullAccess,
  onOpenEmployeeDetails,
}: JobValueSpreadsheetViewProps) {
  // Master state initialized with the 27 corporate records from Job value.xlsx
  const [records, setRecords] = useState<DetailedJobValueEmployee[]>(INITIAL_JOB_VALUE_EXCEL_RECORDS);

  // Executive Operational Dashboard Filters (matching user's HTML spec)
  const [deptFilter, setDeptFilter] = useState<string>("ALL");
  const [empFilter, setEmpFilter] = useState<string>("ALL");
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [hoveredMonthIdx, setHoveredMonthIdx] = useState<number | null>(null);
  const [hoveredBarIdx, setHoveredBarIdx] = useState<number | null>(null);
  const [showMasterSheet, setShowMasterSheet] = useState<boolean>(true);

  // Master Sheet Specific Filters
  const [selectedGroup, setSelectedGroup] = useState<string>("ALL");
  const [growthFilter, setGrowthFilter] = useState<string>("ALL"); // ALL | GROWTH | NO_GROWTH
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeTabMode, setActiveTabMode] = useState<"summary" | "full" | "criteria">("summary");

  // Drilldown modal for viewing 12-month detailed breakdown
  const [drilldownEmp, setDrilldownEmp] = useState<DetailedJobValueEmployee | null>(null);
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [importStatusMsg, setImportStatusMsg] = useState<string>("");

  // Accessible records based on user department permission (if restricted)
  const accessibleRecords = useMemo(() => {
    return records.filter((emp) => {
      if (!isHrOrFullAccess && currentUser?.deptId && currentUser.deptId !== "all") {
        const uDept = String(currentUser.deptId).toUpperCase();
        if (!emp.dept.toUpperCase().includes(uDept)) return false;
      }
      return true;
    });
  }, [records, isHrOrFullAccess, currentUser]);

  // Distinct departments list for #filter-dept
  const departmentOptions = useMemo(() => {
    const depts = Array.from(new Set(accessibleRecords.map((r) => r.dept).filter(Boolean)));
    depts.sort();
    return depts;
  }, [accessibleRecords]);

  // Employees list for #filter-emp based on deptFilter
  const employeeOptions = useMemo(() => {
    if (deptFilter === "ALL") return accessibleRecords;
    if (deptFilter.startsWith("GROUP:")) {
      const gName = deptFilter.replace("GROUP:", "");
      return accessibleRecords.filter((d) => d.group === gName);
    }
    return accessibleRecords.filter((d) => d.dept === deptFilter);
  }, [accessibleRecords, deptFilter]);

  // Core processData(deptFilter, empFilter) matching the user's HTML Dashboard logic (with whole integers)
  const processedData = useMemo(() => {
    let filteredData = accessibleRecords;
    if (deptFilter !== "ALL") {
      if (deptFilter.startsWith("GROUP:")) {
        const gName = deptFilter.replace("GROUP:", "");
        filteredData = filteredData.filter((d) => d.group === gName);
      } else {
        filteredData = filteredData.filter((d) => d.dept === deptFilter);
      }
    }
    if (empFilter !== "ALL") {
      filteredData = filteredData.filter((d) => d.empId === empFilter);
    }

    let sumRev = 0;
    let sumCost = 0;
    let sumProfit = 0;
    let sumProfit2025 = 0;
    const mRev: (number | null)[] = new Array(12).fill(0);
    const mCost: (number | null)[] = new Array(12).fill(0);
    const mProfit: (number | null)[] = new Array(12).fill(0);
    const summaryMap: Record<string, SummaryRowItem> = {};

    filteredData.forEach((d) => {
      const avgRev = Math.round(d.avgRev2026 || 0);
      const avgProf = Math.round(d.avgProf2026 || 0);
      const avgCost = Math.round(avgRev - avgProf);
      const prof2025 = Math.round(d.avgProf2025 || 0);

      sumRev += avgRev;
      sumCost += avgCost;
      sumProfit += avgProf;
      sumProfit2025 += prof2025;

      for (let m = 0; m < 12; m++) {
        const revM = Math.round(d.monthlyRev2026[m] || 0);
        const profM = Math.round(d.monthlyProf2026[m] || 0);
        const costM = Math.round(revM - profM);
        mRev[m] = (mRev[m] || 0) + revM;
        mCost[m] = (mCost[m] || 0) + costM;
        mProfit[m] = (mProfit[m] || 0) + profM;
      }

      const isAllDepts = deptFilter === "ALL";
      const key = isAllDepts ? d.dept : d.empId;
      const displayName = isAllDepts ? d.dept : d.name;

      if (!summaryMap[key]) {
        summaryMap[key] = {
          key,
          name: displayName,
          empId: isAllDepts ? undefined : d.empId,
          dept: d.dept,
          revenue: 0,
          cost: 0,
          profit: 0,
          profit2025: 0,
          count: 0,
          status: isAllDepts ? "" : d.profitGrowthStatus,
        };
      }

      summaryMap[key].revenue += avgRev;
      summaryMap[key].cost += avgCost;
      summaryMap[key].profit += avgProf;
      summaryMap[key].profit2025 += prof2025;
      summaryMap[key].count += 1;
    });

    // Trim trailing months with all zeros (unrecorded future months)
    let lastDataIndex = 11;
    while (
      lastDataIndex >= 0 &&
      mRev[lastDataIndex] === 0 &&
      mCost[lastDataIndex] === 0 &&
      mProfit[lastDataIndex] === 0
    ) {
      mRev[lastDataIndex] = null;
      mCost[lastDataIndex] = null;
      mProfit[lastDataIndex] = null;
      lastDataIndex--;
    }

    const summaryArray = Object.values(summaryMap)
      .map((item) => {
        if (!item.status) {
          const diffItem = item.profit - item.profit2025;
          item.status = diffItem > 0 && item.profit > 0 ? "ต่อยอดกำไร" : item.profit > 0 ? "มีกำไร" : "เฝ้าระวัง";
        }
        return item;
      })
      .sort((a, b) => b.profit - a.profit);

    const viewMode: "PERSON" | "DEPT" | "ALL" =
      empFilter !== "ALL" ? "PERSON" : deptFilter !== "ALL" ? "DEPT" : "ALL";

    return {
      empCount: filteredData.length,
      totalRevenue: Math.round(sumRev),
      totalCost: Math.round(sumCost),
      totalProfit: Math.round(sumProfit),
      totalProfit2025: Math.round(sumProfit2025),
      monthlyRevenue: mRev,
      monthlyCost: mCost,
      monthlyProfit: mProfit,
      summaryData: summaryArray,
      viewMode,
      selectedPerson: viewMode === "PERSON" ? filteredData[0] || null : null,
    };
  }, [accessibleRecords, deptFilter, empFilter]);

  // Overall status evaluation matching updateDashboard() in user's HTML
  const statusEvaluation = useMemo(() => {
    let statusText = "ไม่มีข้อมูล";
    if (processedData.viewMode === "PERSON" && processedData.summaryData.length > 0) {
      const empStatus = processedData.summaryData[0].status;
      statusText = empStatus || (processedData.totalProfit > 0 ? "ต่อยอดกำไรได้" : "ต้องปรับปรุง");
    } else {
      if (processedData.totalProfit > 0) statusText = "ภาพรวมมีกำไร";
      else if (processedData.totalProfit < 0) statusText = "ภาพรวมขาดทุน";
      else statusText = "เท่าทุน";
    }

    const isNegative =
      statusText.includes("ขาดทุน") ||
      statusText.includes("ไม่") ||
      statusText.includes("ปรับปรุง") ||
      statusText.includes("เฝ้าระวัง");
    const isPositive =
      !isNegative &&
      (statusText.includes("กำไร") || statusText.includes("ต่อยอด") || statusText.includes("Pass"));

    return { statusText, isNegative, isPositive };
  }, [processedData]);

  // Growth percentage comparison vs 2568 (whole integer %)
  const growthComparison = useMemo(() => {
    const diff = processedData.totalProfit - processedData.totalProfit2025;
    const percent =
      processedData.totalProfit2025 !== 0
        ? Math.round((diff / Math.abs(processedData.totalProfit2025)) * 100)
        : 0;
    return { diff, percent };
  }, [processedData]);

  const handleDeptChange = (nextDept: string) => {
    setDeptFilter(nextDept);
    setEmpFilter("ALL");
    if (nextDept === "ALL") {
      setSelectedGroup("ALL");
    } else if (nextDept.startsWith("GROUP:")) {
      setSelectedGroup(nextDept.replace("GROUP:", ""));
    } else {
      setSelectedGroup(nextDept);
    }
  };

  const handleEmpChange = (nextEmpId: string) => {
    setEmpFilter(nextEmpId);
  };

  const handleResetFilters = () => {
    setDeptFilter("ALL");
    setEmpFilter("ALL");
    setSelectedGroup("ALL");
    setGrowthFilter("ALL");
    setSearchQuery("");
  };

  const handleRefreshDashboard = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 350);
  };

  // Download Summary CSV matching downloadCSV() in user's HTML
  const handleDownloadSummaryCsv = () => {
    const isDeptView = processedData.viewMode === "DEPT";
    const headers = [
      "ลำดับ",
      isDeptView ? "ชื่อพนักงาน" : "แผนก",
      "รายได้ (เฉลี่ย)",
      "ต้นทุน (เฉลี่ย)",
      "กำไรปี 2568",
      "กำไรปี 2569",
      "Status",
    ];
    let csvContent = "\uFEFF" + headers.join(",") + "\n";

    processedData.summaryData.forEach((item, idx) => {
      const displayStatus = item.status || (item.profit > 0 ? "ต่อยอดกำไร" : "เฝ้าระวัง");
      const row = [
        idx + 1,
        `"${item.name.replace(/"/g, '""')}"`,
        Math.round(item.revenue),
        Math.round(item.cost),
        Math.round(item.profit2025),
        Math.round(item.profit),
        `"${displayStatus}"`,
      ];
      csvContent += row.join(",") + "\n";
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Financial_Analysis_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Master sheet filtered records
  const totalEmployees = accessibleRecords.length;
  const growthCount = accessibleRecords.filter((r) => r.profitGrowth > 0).length;
  const noGrowthCount = accessibleRecords.filter((r) => r.profitGrowth <= 0).length;

  const filteredRecords = useMemo(() => {
    return accessibleRecords.filter((emp) => {
      if (empFilter !== "ALL" && emp.empId !== empFilter) return false;

      if (selectedGroup !== "ALL") {
        if (selectedGroup === "INTER 2" && !emp.group.includes("INTER 2") && emp.dept !== "INTER 2") return false;
        if (selectedGroup === "INTER 3" && !emp.group.includes("INTER 3") && emp.dept !== "INTER 3") return false;
        if (selectedGroup === "INTER 5" && !emp.group.includes("INTER 5") && emp.dept !== "INTER 5") return false;
        if (selectedGroup === "INTER 7" && !emp.group.includes("INTER 7") && emp.dept !== "INTER 7") return false;
        if (selectedGroup === "ITS O&M Specialist" && !emp.group.includes("Specialist")) return false;
        if (selectedGroup === "อายุงานน้อยกว่า 1 ปี" && !emp.group.includes("น้อยกว่า 1 ปี")) return false;
      }

      if (growthFilter === "GROWTH" && emp.profitGrowth <= 0) return false;
      if (growthFilter === "NO_GROWTH" && emp.profitGrowth > 0) return false;

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
  }, [accessibleRecords, empFilter, selectedGroup, growthFilter, searchQuery]);

  const groupedRecords = useMemo(() => {
    const map = new Map<string, DetailedJobValueEmployee[]>();
    GROUPS_ORDER.forEach((g) => map.set(g, []));

    filteredRecords.forEach((r) => {
      let gName = r.group;
      if (!map.has(gName)) {
        const match = GROUPS_ORDER.find((g) => gName.includes(g) || g.includes(gName));
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
              note: row[91] ? String(row[91]).trim() : "",
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

  // Export Master CSV matching exact Excel structure
  const handleExportMasterCsv = () => {
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
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    let content = "\ufeff" + headers.join(",") + "\n";
    records.forEach((r) => {
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
        escapeCsv(r.note),
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

  // ============================================================================
  // SVG CHART GEOMETRY CALCULATIONS (Monthly Trend Line Chart & Yearly Bar Chart)
  // ============================================================================
  const lineChartGeometry = useMemo(() => {
    const width = 620;
    const height = 260;
    const padLeft = 66;
    const padRight = 20;
    const padTop = 24;
    const padBottom = 34;
    const plotW = width - padLeft - padRight;
    const plotH = height - padTop - padBottom;

    const allVals: number[] = [0];
    for (let i = 0; i < 12; i++) {
      if (processedData.monthlyRevenue[i] !== null) allVals.push(processedData.monthlyRevenue[i]!);
      if (processedData.monthlyCost[i] !== null) allVals.push(processedData.monthlyCost[i]!);
      if (processedData.monthlyProfit[i] !== null) allVals.push(processedData.monthlyProfit[i]!);
    }

    const rawMin = Math.min(...allVals, 0);
    const rawMax = Math.max(...allVals, 10000);
    const padding = (rawMax - rawMin) * 0.12 || 10000;
    const minVal = rawMin < 0 ? rawMin - padding * 0.5 : 0;
    const maxVal = rawMax + padding;
    const range = Math.max(maxVal - minVal, 1);

    const getX = (idx: number) => padLeft + (idx / 11) * plotW;
    const getY = (val: number) => padTop + plotH - ((val - minVal) / range) * plotH;
    const zeroY = getY(0);

    const buildPath = (arr: (number | null)[]) => {
      const pts: { x: number; y: number; val: number; idx: number }[] = [];
      arr.forEach((v, i) => {
        if (v !== null && v !== undefined) {
          pts.push({ x: getX(i), y: getY(v), val: v, idx: i });
        }
      });
      if (pts.length === 0) return { path: "", area: "", pts };
      let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
      for (let i = 1; i < pts.length; i++) {
        const prev = pts[i - 1];
        const curr = pts[i];
        const cx1 = prev.x + (curr.x - prev.x) * 0.35;
        const cx2 = curr.x - (curr.x - prev.x) * 0.35;
        d += ` C ${cx1.toFixed(1)} ${prev.y.toFixed(1)}, ${cx2.toFixed(1)} ${curr.y.toFixed(1)}, ${curr.x.toFixed(1)} ${curr.y.toFixed(1)}`;
      }
      const firstPt = pts[0];
      const lastPt = pts[pts.length - 1];
      const area = `${d} L ${lastPt.x.toFixed(1)} ${zeroY.toFixed(1)} L ${firstPt.x.toFixed(1)} ${zeroY.toFixed(1)} Z`;
      return { path: d, area, pts };
    };

    const revSeries = buildPath(processedData.monthlyRevenue);
    const costSeries = buildPath(processedData.monthlyCost);
    const profSeries = buildPath(processedData.monthlyProfit);

    const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => {
      const val = Math.round(minVal + t * range);
      return { val, y: getY(val) };
    });

    return {
      width,
      height,
      padLeft,
      padRight,
      padTop,
      padBottom,
      plotW,
      plotH,
      zeroY,
      revSeries,
      costSeries,
      profSeries,
      ticks,
      getX,
    };
  }, [processedData]);

  const barChartGeometry = useMemo(() => {
    const width = 620;
    const height = 260;
    const padLeft = 66;
    const padRight = 20;
    const padTop = 24;
    const padBottom = 44;
    const plotW = width - padLeft - padRight;
    const plotH = height - padTop - padBottom;

    const items = processedData.summaryData;
    const allVals: number[] = [0];
    items.forEach((d) => {
      allVals.push(d.profit2025, d.profit);
    });

    const rawMin = Math.min(...allVals, 0);
    const rawMax = Math.max(...allVals, 10000);
    const padding = (rawMax - rawMin) * 0.12 || 10000;
    const minVal = rawMin < 0 ? rawMin - padding * 0.5 : 0;
    const maxVal = rawMax + padding;
    const range = Math.max(maxVal - minVal, 1);

    const getY = (val: number) => padTop + plotH - ((val - minVal) / range) * plotH;
    const zeroY = getY(0);

    const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => {
      const val = Math.round(minVal + t * range);
      return { val, y: getY(val) };
    });

    return {
      width,
      height,
      padLeft,
      padRight,
      padTop,
      padBottom,
      plotW,
      plotH,
      zeroY,
      items,
      ticks,
      getY,
    };
  }, [processedData]);

  return (
    <div className="w-full max-w-full min-w-0 space-y-6 font-sans text-[#0F172A]">
      {/* ===================================================================== */}
      {/* 1. EXECUTIVE OPERATIONAL DASHBOARD HEADER                             */}
      {/* ===================================================================== */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-[#E2E8F0] shadow-xs">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight">
              Executive Operational Dashboard
            </h1>
            <span className="px-3 py-1 rounded-full bg-[#E8F3FA] border border-[#9FCEE8] text-[#0E3A66] text-xs font-bold font-mono">
              Job Value ปี 2569 (2026)
            </span>
          </div>
          <p className="text-sm text-[#334155] mt-1">
            รายงานมูลค่า Job Value และประสิทธิภาพการทำงาน ปี 2569 (เปรียบเทียบผลการดำเนินงานรอบปี 2568 – 2569)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {/* Stat Pill: Employee Count */}
          <div className="bg-[#F8FAFC] px-4 py-2 rounded-xl border border-[#E2E8F0] flex items-center gap-2 font-bold text-sm text-[#334155]">
            <Users className="w-4 h-4 text-[#0E3A66]" />
            <span id="kpi-total-emp" className="text-lg font-extrabold text-[#0E3A66] font-mono tabular-nums">
              {formatInt(processedData.empCount)}
            </span>
            <span>พนักงาน</span>
          </div>

          {/* Refresh Data Button */}
          <button
            type="button"
            onClick={handleRefreshDashboard}
            className="px-4 py-2.5 bg-white hover:bg-[#F1F5F9] text-[#334155] border border-[#E2E8F0] rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-2xs"
          >
            <RefreshCw className={`w-4 h-4 text-[#0E3A66] ${isRefreshing ? "animate-spin" : ""}`} />
            <span>รีเฟรชข้อมูล</span>
          </button>

          {/* Toggle Master Spreadsheet */}
          <button
            type="button"
            onClick={() => setShowMasterSheet((prev) => !prev)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 border ${
              showMasterSheet
                ? "bg-[#0E3A66] text-white border-[#0E3A66]"
                : "bg-white text-[#334155] border-[#E2E8F0] hover:bg-[#F1F5F9]"
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{showMasterSheet ? "ซ่อนตาราง Master Sheet" : "แสดงตาราง Master Sheet (27 คน)"}</span>
          </button>

          {isHrOrFullAccess && (
            <label
              className="flex items-center gap-1.5 px-4 py-2.5 bg-[#15803D] hover:bg-[#166534] text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs"
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
      </header>

      {importStatusMsg && (
        <div className="p-3 bg-[#E8F3FA] border border-[#9FCEE8] rounded-xl text-xs font-bold text-[#0E3A66] flex items-center justify-between">
          <span>{importStatusMsg}</span>
          <button onClick={() => setImportStatusMsg("")} className="text-[#0E3A66] hover:opacity-75 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 2. FILTERS BAR CARD (หน่วยงาน / แผนก + รายชื่อพนักงาน + ล้างค่า)         */}
      {/* ===================================================================== */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E2E8F0] shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-5">
            <label
              htmlFor="filter-dept"
              className="block text-xs font-bold text-[#334155] uppercase tracking-wider mb-1.5"
            >
              หน่วยงาน / แผนก
            </label>
            <select
              id="filter-dept"
              aria-label="หน่วยงาน / แผนก"
              value={deptFilter}
              onChange={(e) => handleDeptChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] bg-white text-sm font-bold text-[#0F172A] cursor-pointer focus:outline-none focus:border-[#0E3A66]"
            >
              <option value="ALL">ทุกแผนก (Corporate Overview)</option>
              <optgroup label="แยกตามแผนก (Department)">
                {departmentOptions.map((dept) => (
                  <option key={dept} value={dept}>
                    แผนก {dept}
                  </option>
                ))}
              </optgroup>
              <optgroup label="แยกตามกลุ่มสายงาน (Job Value Group)">
                {GROUPS_ORDER.map((grp) => (
                  <option key={grp} value={`GROUP:${grp}`}>
                    กลุ่ม: {grp}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          <div className="md:col-span-5">
            <label
              htmlFor="filter-emp"
              className="block text-xs font-bold text-[#334155] uppercase tracking-wider mb-1.5"
            >
              รายชื่อพนักงาน
            </label>
            <select
              id="filter-emp"
              aria-label="รายชื่อพนักงาน"
              value={empFilter}
              onChange={(e) => handleEmpChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] bg-white text-sm font-bold text-[#0F172A] cursor-pointer focus:outline-none focus:border-[#0E3A66]"
            >
              <option value="ALL">ทุกคนในกลุ่มที่เลือก (Group View)</option>
              {employeeOptions.map((emp) => (
                <option key={emp.empId} value={emp.empId}>
                  {emp.name} ({emp.empId} · {emp.dept})
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2 flex justify-end">
            <button
              type="button"
              onClick={handleResetFilters}
              className="w-full px-4 py-2.5 bg-white hover:bg-[#F1F5F9] text-[#334155] border border-[#CBD5E1] rounded-xl text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4 text-[#475569]" />
              <span>ล้างค่า</span>
            </button>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 3. 4 EXECUTIVE KPI CARDS (Revenue, Expenses, Gross Profit, Status)    */}
      {/* ===================================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Revenue (Avg) */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E2E8F0] shadow-xs flex flex-col justify-between transition-all hover:-translate-y-0.5">
          <div>
            <div className="w-12 h-12 rounded-xl bg-[#EBF7F2] text-[#15803D] flex items-center justify-center mb-4 border border-[#B7E4CE]">
              <DollarSign className="w-6 h-6" />
            </div>
            <div className="text-xs font-bold text-[#475569] uppercase tracking-wider mb-1">
              Revenue (Avg)
            </div>
            <div
              id="kpi-total-revenue"
              className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] font-mono tabular-nums mb-2"
            >
              {formatInt(processedData.totalRevenue)}
            </div>
          </div>
          <div className="text-xs font-bold text-[#15803D] flex items-center gap-1.5">
            <span>รายได้เฉลี่ยรายเดือน (บาท)</span>
          </div>
        </div>

        {/* Card 2: Expenses (Avg) */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E2E8F0] shadow-xs flex flex-col justify-between transition-all hover:-translate-y-0.5">
          <div>
            <div className="w-12 h-12 rounded-xl bg-[#FFE4E6] text-[#BE123C] flex items-center justify-center mb-4 border border-[#FDA4AF]">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div className="text-xs font-bold text-[#475569] uppercase tracking-wider mb-1">
              Expenses (Avg)
            </div>
            <div
              id="kpi-total-cost"
              className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] font-mono tabular-nums mb-2"
            >
              {formatInt(processedData.totalCost)}
            </div>
          </div>
          <div className="text-xs font-bold text-[#BE123C] flex items-center gap-1.5">
            <span>ต้นทุนเฉลี่ยรายเดือน (บาท)</span>
          </div>
        </div>

        {/* Card 3: Gross Profit (2026) */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E2E8F0] border-l-4 border-l-[#0E3A66] shadow-xs flex flex-col justify-between transition-all hover:-translate-y-0.5">
          <div>
            <div className="w-12 h-12 rounded-xl bg-[#E8F3FA] text-[#0E3A66] flex items-center justify-center mb-4 border border-[#9FCEE8]">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div className="text-xs font-bold text-[#475569] uppercase tracking-wider mb-1">
              Gross Profit (2026)
            </div>
            <div
              id="kpi-total-profit"
              className="text-2xl sm:text-3xl font-extrabold text-[#0E3A66] font-mono tabular-nums mb-2"
            >
              {formatInt(processedData.totalProfit)}
            </div>
          </div>
          <div id="kpi-growth-compare" className="text-xs font-bold text-[#475569] flex flex-wrap items-center gap-2">
            <span>ปี 2568: {formatInt(processedData.totalProfit2025)}</span>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono text-[11px] font-bold ${
                growthComparison.diff >= 0
                  ? "bg-[#EBF7F2] text-[#15803D]"
                  : "bg-[#FFE4E6] text-[#BE123C]"
              }`}
            >
              {growthComparison.diff >= 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              <span>
                {growthComparison.percent > 0 ? `+${growthComparison.percent}%` : `${growthComparison.percent}%`}
              </span>
            </span>
          </div>
        </div>

        {/* Card 4: Performance Status (การต่อยอด) */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E2E8F0] shadow-xs flex flex-col justify-between transition-all hover:-translate-y-0.5">
          <div>
            <div
              id="kpi-status-icon"
              className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 border ${
                statusEvaluation.isNegative
                  ? "bg-[#FFE4E6] text-[#BE123C] border-[#FDA4AF]"
                  : statusEvaluation.isPositive
                  ? "bg-[#EBF7F2] text-[#15803D] border-[#B7E4CE]"
                  : "bg-[#F1F5F9] text-[#334155] border-[#CBD5E1]"
              }`}
            >
              {statusEvaluation.isNegative ? (
                <XCircle className="w-6 h-6" />
              ) : statusEvaluation.isPositive ? (
                <CheckCircle2 className="w-6 h-6" />
              ) : (
                <AlertCircle className="w-6 h-6" />
              )}
            </div>
            <div className="text-xs font-bold text-[#475569] uppercase tracking-wider mb-1">
              Performance Status
            </div>
            <div
              id="kpi-status-text"
              className={`text-xl sm:text-2xl font-extrabold mb-2 ${
                statusEvaluation.isNegative
                  ? "text-[#BE123C]"
                  : statusEvaluation.isPositive
                  ? "text-[#15803D]"
                  : "text-[#0F172A]"
              }`}
            >
              {statusEvaluation.statusText}
            </div>
          </div>
          <div className="text-xs font-bold text-[#475569]">
            การประเมินภาพรวมการต่อยอด
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 4. CHARTS GRID (Monthly Trend Line Chart + Yearly Comparison Chart)   */}
      {/* ===================================================================== */}
      <div
        className={`grid grid-cols-1 ${
          processedData.viewMode === "PERSON" ? "lg:grid-cols-1" : "lg:grid-cols-2"
        } gap-6`}
      >
        {/* Left Chart: แนวโน้มกำไรรายเดือน (Monthly Trend) */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-[#E2E8F0] flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 font-bold text-base text-[#0F172A]">
              <LineChartIcon className="w-5 h-5 text-[#0E3A66]" />
              <span>แนวโน้มกำไรรายเดือน (Monthly Trend)</span>
            </div>
            <div className="flex items-center gap-4 text-xs font-bold">
              <span className="flex items-center gap-1.5 text-[#15803D]">
                <span className="w-3 h-1 rounded bg-[#15803D] inline-block" />
                <span>รายได้</span>
              </span>
              <span className="flex items-center gap-1.5 text-[#BE123C]">
                <span className="w-3 h-0.5 border-b-2 border-dashed border-[#BE123C] inline-block" />
                <span>ต้นทุน</span>
              </span>
              <span className="flex items-center gap-1.5 text-[#0E3A66]">
                <span className="w-3 h-1.5 rounded bg-[#0E3A66] inline-block" />
                <span>กำไรสุทธิ</span>
              </span>
            </div>
          </div>

          <div className="p-5 relative">
            <svg
              viewBox={`0 0 ${lineChartGeometry.width} ${lineChartGeometry.height}`}
              className="w-full h-[270px] overflow-visible select-none"
              role="img"
              aria-label="กราฟแนวโน้มกำไรรายเดือน"
            >
              {/* Horizontal Grid Lines & Y-Axis Labels */}
              {lineChartGeometry.ticks.map((t, idx) => (
                <g key={idx}>
                  <line
                    x1={lineChartGeometry.padLeft}
                    y1={t.y}
                    x2={lineChartGeometry.width - lineChartGeometry.padRight}
                    y2={t.y}
                    stroke={t.val === 0 ? "#94A3B8" : "#E2E8F0"}
                    strokeDasharray={t.val === 0 ? "none" : "3,3"}
                    strokeWidth={t.val === 0 ? 1.5 : 1}
                  />
                  <text
                    x={lineChartGeometry.padLeft - 8}
                    y={t.y + 4}
                    textAnchor="end"
                    className="fill-[#64748B] font-mono text-[10px]"
                  >
                    {formatInt(t.val)}
                  </text>
                </g>
              ))}

              {/* Shaded Area under Net Profit */}
              {lineChartGeometry.profSeries.area && (
                <path
                  d={lineChartGeometry.profSeries.area}
                  fill="rgba(14, 58, 102, 0.10)"
                />
              )}

              {/* Revenue Line (Emerald) */}
              {lineChartGeometry.revSeries.path && (
                <path
                  d={lineChartGeometry.revSeries.path}
                  fill="none"
                  stroke="#15803D"
                  strokeWidth={2}
                />
              )}

              {/* Cost Line (Crimson Dashed) */}
              {lineChartGeometry.costSeries.path && (
                <path
                  d={lineChartGeometry.costSeries.path}
                  fill="none"
                  stroke="#BE123C"
                  strokeWidth={2}
                  strokeDasharray="5,5"
                />
              )}

              {/* Net Profit Line (Navy Thick) */}
              {lineChartGeometry.profSeries.path && (
                <path
                  d={lineChartGeometry.profSeries.path}
                  fill="none"
                  stroke="#0E3A66"
                  strokeWidth={3}
                />
              )}

              {/* Data Points & X-Axis Month Labels */}
              {SHORT_MONTH_LABELS.map((mLabel, idx) => {
                const x = lineChartGeometry.getX(idx);
                const revPt = lineChartGeometry.revSeries.pts.find((p) => p.idx === idx);
                const costPt = lineChartGeometry.costSeries.pts.find((p) => p.idx === idx);
                const profPt = lineChartGeometry.profSeries.pts.find((p) => p.idx === idx);
                const isHovered = hoveredMonthIdx === idx;

                return (
                  <g
                    key={mLabel}
                    onMouseEnter={() => setHoveredMonthIdx(idx)}
                    onMouseLeave={() => setHoveredMonthIdx(null)}
                    className="cursor-pointer"
                  >
                    {isHovered && (
                      <line
                        x1={x}
                        y1={lineChartGeometry.padTop}
                        x2={x}
                        y2={lineChartGeometry.height - lineChartGeometry.padBottom}
                        stroke="#CBD5E1"
                        strokeWidth={1}
                      />
                    )}
                    {revPt && (
                      <circle
                        cx={revPt.x}
                        cy={revPt.y}
                        r={isHovered ? 5 : 3}
                        fill="#15803D"
                        stroke="#FFFFFF"
                        strokeWidth={1.5}
                      />
                    )}
                    {costPt && (
                      <circle
                        cx={costPt.x}
                        cy={costPt.y}
                        r={isHovered ? 5 : 3}
                        fill="#BE123C"
                        stroke="#FFFFFF"
                        strokeWidth={1.5}
                      />
                    )}
                    {profPt && (
                      <circle
                        cx={profPt.x}
                        cy={profPt.y}
                        r={isHovered ? 5.5 : 3.5}
                        fill="#0E3A66"
                        stroke="#FFFFFF"
                        strokeWidth={1.5}
                      />
                    )}
                    <text
                      x={x}
                      y={lineChartGeometry.height - 10}
                      textAnchor="middle"
                      className={`font-sans text-[11px] ${
                        isHovered ? "fill-[#0E3A66] font-bold" : "fill-[#64748B]"
                      }`}
                    >
                      {mLabel}
                    </text>
                    {/* Transparent hit zone for easy hover */}
                    <rect
                      x={x - 20}
                      y={lineChartGeometry.padTop}
                      width={40}
                      height={lineChartGeometry.plotH}
                      fill="transparent"
                    />
                  </g>
                );
              })}
            </svg>

            {/* Hover Tooltip for Monthly Trend */}
            {hoveredMonthIdx !== null && processedData.monthlyRevenue[hoveredMonthIdx] !== null && (
              <div className="mt-2 p-2.5 rounded-xl bg-[#0F172A] text-white text-xs flex flex-wrap items-center justify-between gap-3 font-mono">
                <span className="font-sans font-bold text-[#93C5FD]">
                  เดือน {MONTH_LABELS_2026[hoveredMonthIdx]}
                </span>
                <span>รายได้: {formatInt(processedData.monthlyRevenue[hoveredMonthIdx])} บาท</span>
                <span>ต้นทุน: {formatInt(processedData.monthlyCost[hoveredMonthIdx])} บาท</span>
                <span className="font-bold text-[#6EE7B7]">
                  กำไรสุทธิ: {formatInt(processedData.monthlyProfit[hoveredMonthIdx])} บาท
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right Chart: เปรียบเทียบกำไร (Yearly Comparison) - hidden when viewMode === 'PERSON' */}
        {processedData.viewMode !== "PERSON" && (
          <div
            id="compare-container"
            className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden flex flex-col"
          >
            <div className="px-5 py-4 border-b border-[#E2E8F0] flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 font-bold text-base text-[#0F172A]">
                <BarChart3 className="w-5 h-5 text-[#0E3A66]" />
                <span>เปรียบเทียบกำไร (Yearly Comparison)</span>
              </div>
              <div className="flex items-center gap-4 text-xs font-bold">
                <span className="flex items-center gap-1.5 text-[#64748B]">
                  <span className="w-3 h-3 rounded-xs bg-[#94A3B8] inline-block" />
                  <span>กำไร 68</span>
                </span>
                <span className="flex items-center gap-1.5 text-[#0E3A66]">
                  <span className="w-3 h-3 rounded-xs bg-[#0E3A66] inline-block" />
                  <span>กำไร 69</span>
                </span>
              </div>
            </div>

            <div className="p-5 relative">
              <svg
                viewBox={`0 0 ${barChartGeometry.width} ${barChartGeometry.height}`}
                className="w-full h-[270px] overflow-visible select-none"
                role="img"
                aria-label="กราฟเปรียบเทียบกำไรรายปี"
              >
                {/* Grid lines */}
                {barChartGeometry.ticks.map((t, idx) => (
                  <g key={idx}>
                    <line
                      x1={barChartGeometry.padLeft}
                      y1={t.y}
                      x2={barChartGeometry.width - barChartGeometry.padRight}
                      y2={t.y}
                      stroke={t.val === 0 ? "#94A3B8" : "#E2E8F0"}
                      strokeDasharray={t.val === 0 ? "none" : "3,3"}
                      strokeWidth={t.val === 0 ? 1.5 : 1}
                    />
                    <text
                      x={barChartGeometry.padLeft - 8}
                      y={t.y + 4}
                      textAnchor="end"
                      className="fill-[#64748B] font-mono text-[10px]"
                    >
                      {formatInt(t.val)}
                    </text>
                  </g>
                ))}

                {/* Grouped Bars */}
                {barChartGeometry.items.map((item, idx) => {
                  const count = Math.max(barChartGeometry.items.length, 1);
                  const groupW = barChartGeometry.plotW / count;
                  const centerX = barChartGeometry.padLeft + idx * groupW + groupW / 2;
                  const barW = Math.min(22, Math.max(8, groupW * 0.32));

                  const y25 = barChartGeometry.getY(item.profit2025);
                  const y26 = barChartGeometry.getY(item.profit);
                  const zeroY = barChartGeometry.zeroY;

                  const top25 = Math.min(y25, zeroY);
                  const h25 = Math.max(2, Math.abs(zeroY - y25));

                  const top26 = Math.min(y26, zeroY);
                  const h26 = Math.max(2, Math.abs(zeroY - y26));

                  const shortLabel =
                    item.name.length > 12 ? item.name.slice(0, 11) + ".." : item.name;

                  return (
                    <g
                      key={item.key}
                      onMouseEnter={() => setHoveredBarIdx(idx)}
                      onMouseLeave={() => setHoveredBarIdx(null)}
                      className="cursor-pointer"
                    >
                      {/* 2025 Bar */}
                      <rect
                        x={centerX - barW - 2}
                        y={top25}
                        width={barW}
                        height={h25}
                        rx={2}
                        fill="#94A3B8"
                      />
                      {/* 2026 Bar */}
                      <rect
                        x={centerX + 2}
                        y={top26}
                        width={barW}
                        height={h26}
                        rx={2}
                        fill={item.profit >= 0 ? "#0E3A66" : "#BE123C"}
                      />
                      <text
                        x={centerX}
                        y={barChartGeometry.height - 14}
                        textAnchor="middle"
                        className="fill-[#334155] font-sans text-[10px] font-bold"
                      >
                        {shortLabel}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {hoveredBarIdx !== null && barChartGeometry.items[hoveredBarIdx] && (
                <div className="mt-2 p-2.5 rounded-xl bg-[#0F172A] text-white text-xs flex flex-wrap items-center justify-between gap-3 font-mono">
                  <span className="font-sans font-bold text-[#93C5FD]">
                    {barChartGeometry.items[hoveredBarIdx].name}
                  </span>
                  <span>
                    กำไรปี 2568: {formatInt(barChartGeometry.items[hoveredBarIdx].profit2025)} บาท
                  </span>
                  <span className="font-bold text-[#6EE7B7]">
                    กำไรปี 2569: {formatInt(barChartGeometry.items[hoveredBarIdx].profit)} บาท
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ===================================================================== */}
      {/* 5. SUMMARY TABLE CARD (รายละเอียดผลงานตามกลุ่มตัวอย่าง)                  */}
      {/* ===================================================================== */}
      {processedData.viewMode !== "PERSON" && (
        <div
          id="table-container"
          className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-[#E2E8F0] flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#0F172A]">
                รายละเอียดผลงานตามกลุ่มตัวอย่าง
              </h2>
              <p className="text-xs text-[#64748B]">
                {processedData.viewMode === "DEPT"
                  ? `แสดงรายชื่อพนักงานในกลุ่มที่เลือก (${processedData.summaryData.length} คน)`
                  : `สรุปภาพรวมแยกตามแผนก (${processedData.summaryData.length} แผนก) — คลิกที่แถวเพื่อเจาะลึก`}
              </p>
            </div>
            <button
              type="button"
              onClick={handleDownloadSummaryCsv}
              className="px-4 py-2.5 bg-[#0E3A66] hover:bg-[#17538F] text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-2xs"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] border-b-2 border-[#E2E8F0] text-xs font-bold text-[#334155] uppercase tracking-wider">
                  <th className="py-3.5 px-5 text-center w-20">ลำดับ</th>
                  <th className="py-3.5 px-5">
                    {processedData.viewMode === "DEPT" ? "ชื่อพนักงาน" : "แผนก"}
                  </th>
                  <th className="py-3.5 px-5 text-right">รายได้ (เฉลี่ย)</th>
                  <th className="py-3.5 px-5 text-right">ต้นทุน (เฉลี่ย)</th>
                  <th className="py-3.5 px-5 text-right">กำไรปี 2568</th>
                  <th className="py-3.5 px-5 text-right">กำไรปี 2569</th>
                  <th className="py-3.5 px-5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-sm">
                {processedData.summaryData.map((item, idx) => {
                  const displayStatus =
                    item.status || (item.profit > 0 ? "ต่อยอดกำไร" : "เฝ้าระวัง");
                  const isDanger =
                    displayStatus.includes("ไม่ต่อยอด") ||
                    displayStatus.includes("ไม่") ||
                    displayStatus.includes("ขาดทุน") ||
                    displayStatus.includes("เฝ้าระวัง");

                  return (
                    <tr
                      key={item.key}
                      onClick={() => {
                        if (processedData.viewMode === "ALL") {
                          handleDeptChange(item.name);
                        } else if (item.empId) {
                          const found = accessibleRecords.find((e) => e.empId === item.empId);
                          if (found) setDrilldownEmp(found);
                        }
                      }}
                      className="even:bg-[#F8FAFC] hover:bg-[#E8F3FA]/60 transition-colors cursor-pointer"
                    >
                      <td className="py-3.5 px-5 text-center font-mono text-[#334155]">
                        {idx + 1}
                      </td>
                      <td className="py-3.5 px-5 font-bold text-[#0F172A]">
                        <div className="flex items-center gap-2">
                          <span>{item.name}</span>
                          {processedData.viewMode === "ALL" && (
                            <span className="px-2 py-0.5 rounded-full bg-[#F1F5F9] text-[#475569] text-[11px] font-mono">
                              {item.count} คน
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-5 text-right font-mono font-bold text-[#15803D] tabular-nums">
                        {formatInt(item.revenue)}
                      </td>
                      <td className="py-3.5 px-5 text-right font-mono font-bold text-[#BE123C] tabular-nums">
                        {formatInt(item.cost)}
                      </td>
                      <td className="py-3.5 px-5 text-right font-mono text-[#334155] tabular-nums">
                        {formatInt(item.profit2025)}
                      </td>
                      <td className="py-3.5 px-5 text-right font-mono font-extrabold text-[#0E3A66] tabular-nums">
                        {formatInt(item.profit)}
                      </td>
                      <td className="py-3.5 px-5 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 ${
                            isDanger
                              ? "bg-[#FFE4E6] text-[#BE123C]"
                              : "bg-[#EBF7F2] text-[#15803D]"
                          }`}
                        >
                          {displayStatus}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 6. CORPORATE MASTER SPREADSHEET (27 คน - รายละเอียดครบทุกคอลัมน์)       */}
      {/* ===================================================================== */}
      {showMasterSheet && (
        <div className="space-y-4 pt-2">
          {/* Navigation, Filter Bar & View Mode Toggle */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col gap-3">
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
                  { id: "อายุงานน้อยกว่า 1 ปี", label: "อายุงาน < 1 ปี (6)" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setSelectedGroup(tab.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      selectedGroup === tab.id
                        ? "bg-[#0E3A66] text-white shadow-xs"
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
                      ? "bg-white text-[#0E3A66] shadow-xs"
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
                      ? "bg-white text-[#0E3A66] shadow-xs"
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
                      ? "bg-white text-[#0E3A66] shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  มาสเตอร์ชีตเต็ม (Master Sheet)
                </button>
              </div>
            </div>

            {/* Row 2: Search, Growth filters, and Master CSV Export */}
            <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100 flex-wrap">
              <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
                <div className="relative w-full sm:w-72">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="ค้นหารหัส, ชื่อพนักงาน, ตำแหน่ง..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
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
                      growthFilter === "ALL"
                        ? "bg-slate-800 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    ทั้งหมด
                  </button>
                  <button
                    type="button"
                    onClick={() => setGrowthFilter("GROWTH")}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      growthFilter === "GROWTH"
                        ? "bg-[#15803D] text-white"
                        : "bg-[#EBF7F2] text-[#15803D] hover:opacity-90"
                    }`}
                  >
                    <TrendingUp className="w-3 h-3" />
                    <span>กำไรต่อยอด ({growthCount})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setGrowthFilter("NO_GROWTH")}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      growthFilter === "NO_GROWTH"
                        ? "bg-[#BE123C] text-white"
                        : "bg-[#FFE4E6] text-[#BE123C] hover:opacity-90"
                    }`}
                  >
                    <TrendingDown className="w-3 h-3" />
                    <span>ไม่ต่อยอด ({noGrowthCount})</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-500">
                  แสดงข้อมูล <span className="text-slate-900 font-extrabold">{filteredRecords.length}</span> จากทั้งหมด{" "}
                  {totalEmployees} คน
                </span>
                <button
                  type="button"
                  onClick={handleExportMasterCsv}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-[#0E3A66]" />
                  <span>ส่งออก CSV</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Corporate Spreadsheet Table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto no-scrollbar touch-pan-x w-full">
              <table className="w-full text-left border-collapse text-xs min-w-[1300px]">
                <thead>
                  <tr className="bg-[#0E3A66] text-white text-[11px] font-extrabold uppercase tracking-wider divide-x divide-white/20 select-none">
                    <th colSpan={6} className="px-3.5 py-2 text-center bg-[#0E3A66]">
                      ข้อมูลบุคลากร (Employee Profile)
                    </th>
                    <th colSpan={2} className="px-3.5 py-2 text-center bg-[#17538F]">
                      รอบปี 2025 / 2568 (Average)
                    </th>
                    <th colSpan={2} className="px-3.5 py-2 text-center bg-[#15803D]">
                      รอบปี 2026 / 2569 (Average)
                    </th>
                    <th colSpan={2} className="px-3.5 py-2 text-center bg-[#0F172A]">
                      การเติบโตของผลกำไร (Growth)
                    </th>
                    <th colSpan={2} className="px-3.5 py-2 text-center bg-[#334155]">
                      Ranking ในกลุ่ม (Rank JV)
                    </th>
                    {activeTabMode !== "criteria" ? (
                      <th colSpan={4} className="px-3.5 py-2 text-center bg-[#1E293B]">
                        ผลการประเมิน &amp; สถิติวันลา
                      </th>
                    ) : (
                      <th colSpan={4} className="px-3.5 py-2 text-center bg-[#0E3A66]">
                        เกณฑ์การพิจารณา 3 ด้าน &amp; การปรับประจำปี
                      </th>
                    )}
                    <th className="px-3.5 py-2 text-center bg-[#0E3A66] w-20">
                      รายละเอียด
                    </th>
                  </tr>

                  <tr className="bg-slate-100 border-b border-slate-300 text-[11px] font-black text-slate-700 uppercase divide-x divide-slate-200 select-none">
                    <th className="px-2.5 py-2.5 text-center w-10">ที่</th>
                    <th className="px-3 py-2.5 font-mono w-24">รหัสพนักงาน</th>
                    <th className="px-3.5 py-2.5 min-w-[170px]">ชื่อ-พนักงาน</th>
                    <th className="px-3 py-2.5 w-24 text-center">แผนก</th>
                    <th className="px-2.5 py-2.5 w-24 text-center">ประเภท/ระดับ</th>
                    <th className="px-3 py-2.5 min-w-[150px]">ตำแหน่ง</th>

                    <th className="px-3 py-2.5 text-right bg-slate-50 text-[#17538F]">รายได้ JV (25)</th>
                    <th className="px-3 py-2.5 text-right bg-slate-50 text-slate-800">กำไร JV (25)</th>

                    <th className="px-3 py-2.5 text-right bg-[#EBF7F2]/40 text-[#15803D]">รายได้ JV (26)</th>
                    <th className="px-3 py-2.5 text-right bg-[#EBF7F2]/40 text-slate-900 font-extrabold">กำไร JV (26)</th>

                    <th className="px-3.5 py-2.5 text-right bg-slate-50 text-slate-900">กำไรต่อยอด (Diff)</th>
                    <th className="px-3 py-2.5 text-center bg-slate-50">สถานะ</th>

                    <th className="px-3 py-2.5 text-center bg-slate-50">Rank ปี 67</th>
                    <th className="px-3 py-2.5 text-center bg-[#E8F3FA]/60 text-[#0E3A66] font-extrabold">Rank ปี 69</th>

                    {activeTabMode !== "criteria" ? (
                      <>
                        <th className="px-3 py-2.5 text-center">ผลประเมิน 68</th>
                        <th className="px-3 py-2.5 text-center">ผลประเมิน 69</th>
                        <th className="px-2.5 py-2.5 text-center">วันลา 68</th>
                        <th className="px-2.5 py-2.5 text-center">วันลา 69</th>
                      </>
                    ) : (
                      <>
                        <th className="px-3 py-2.5 text-center bg-slate-100 text-[#0E3A66]">เกณฑ์ 1.1</th>
                        <th className="px-3 py-2.5 text-center bg-slate-100 text-[#0E3A66]">สรุปการปรับฯ</th>
                        <th className="px-3 py-2.5 text-right bg-slate-100 text-[#0E3A66]">ปรับเข้าฐาน</th>
                        <th className="px-3 py-2.5 text-right bg-slate-100 text-[#0E3A66]">ปรับเข้า CAP</th>
                      </>
                    )}

                    <th className="px-3 py-2.5 text-center w-20">12 เดือน</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200">
                  {groupedRecords.map(([groupName, emps]) => (
                    <React.Fragment key={groupName}>
                      <tr className="bg-[#F3F6F8] border-y-2 border-[#DCE4EA]">
                        <td
                          colSpan={17}
                          className="px-4 py-2 font-black text-[#0E3A66] text-xs uppercase tracking-wider"
                        >
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full bg-[#0E3A66]" />
                              <span>{groupName}</span>
                              <span className="px-2 py-0.5 rounded-full bg-white text-[#17538F] border border-[#DCE4EA] text-[10px] font-mono">
                                {emps.length} คน
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-[11px] font-mono font-normal">
                              <span>
                                รายได้ 26 รวม:{" "}
                                <strong>{formatInt(emps.reduce((s, e) => s + e.avgRev2026, 0))}</strong> บาท
                              </span>
                              <span>
                                กำไร 26 รวม:{" "}
                                <strong>{formatInt(emps.reduce((s, e) => s + e.avgProf2026, 0))}</strong> บาท
                              </span>
                            </div>
                          </div>
                        </td>
                      </tr>

                      {emps.map((emp) => {
                        const isPositive = emp.profitGrowth > 0;
                        return (
                          <tr
                            key={emp.empId}
                            className="hover:bg-[#E8F3FA]/40 transition-colors divide-x divide-slate-100"
                          >
                            <td className="px-2.5 py-2.5 text-center text-slate-400 font-mono text-[11px]">
                              {emp.no}
                            </td>
                            <td className="px-3 py-2.5 font-mono font-bold text-slate-800">{emp.empId}</td>
                            <td className="px-3.5 py-2.5 font-bold text-slate-900 whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() => onOpenEmployeeDetails?.(emp)}
                                className="hover:text-[#0E3A66] transition-colors text-left cursor-pointer"
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
                            <td className="px-3 py-2.5 text-slate-700 font-medium whitespace-nowrap">
                              {emp.role}
                            </td>

                            <td className="px-3 py-2.5 text-right font-mono text-slate-600 bg-slate-50/40 tabular-nums">
                              {emp.avgRev2025 > 0 ? formatInt(emp.avgRev2025) : "-"}
                            </td>
                            <td className="px-3 py-2.5 text-right font-mono text-slate-700 bg-slate-50/40 font-bold tabular-nums">
                              {emp.avgProf2025 !== 0 ? formatInt(emp.avgProf2025) : "-"}
                            </td>

                            <td className="px-3 py-2.5 text-right font-mono font-bold text-[#15803D] bg-[#EBF7F2]/20 tabular-nums">
                              {emp.avgRev2026 > 0 ? formatInt(emp.avgRev2026) : "-"}
                            </td>
                            <td className="px-3 py-2.5 text-right font-mono font-black text-slate-900 bg-[#EBF7F2]/20 tabular-nums">
                              {emp.avgProf2026 !== 0 ? formatInt(emp.avgProf2026) : "-"}
                            </td>

                            <td
                              className={`px-3.5 py-2.5 text-right font-mono font-black tabular-nums ${
                                isPositive ? "text-[#15803D]" : "text-[#BE123C]"
                              }`}
                            >
                              {formatSignedInt(emp.profitGrowth)}
                            </td>
                            <td className="px-3 py-2.5 text-center whitespace-nowrap">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-black inline-flex items-center gap-1 ${
                                  isPositive
                                    ? "bg-[#EBF7F2] text-[#15803D] border border-[#B7E4CE]"
                                    : "bg-[#FFE4E6] text-[#BE123C] border border-[#FDA4AF]"
                                }`}
                              >
                                {isPositive ? "กำไรต่อยอด" : "ไม่ต่อยอด"}
                              </span>
                            </td>

                            <td className="px-3 py-2.5 text-center font-mono text-slate-500 text-[11px]">
                              {emp.rank2025Fraction || "-"}
                            </td>
                            <td className="px-3 py-2.5 text-center font-mono font-extrabold text-[#0E3A66] bg-[#E8F3FA]/40 text-xs">
                              {emp.rank2026Fraction || "-"}
                            </td>

                            {activeTabMode !== "criteria" ? (
                              <>
                                <td className="px-3 py-2.5 text-center text-[10px] font-bold text-slate-600">
                                  {emp.eval2025 || "-"}
                                </td>
                                <td className="px-3 py-2.5 text-center text-[10px] font-bold">
                                  {emp.eval2026 ? (
                                    <span
                                      className={`px-2 py-0.5 rounded ${
                                        emp.eval2026.includes("Above")
                                          ? "bg-[#EBF7F2] text-[#15803D] font-extrabold"
                                          : "bg-[#E8F3FA] text-[#0E3A66]"
                                      }`}
                                    >
                                      {emp.eval2026}
                                    </span>
                                  ) : (
                                    "-"
                                  )}
                                </td>
                                <td className="px-2.5 py-2.5 text-center font-mono text-slate-600 text-[11px]">
                                  {formatInt(emp.leaves2025)}
                                </td>
                                <td className="px-2.5 py-2.5 text-center font-mono font-bold text-slate-800 text-[11px]">
                                  {formatInt(emp.leaves2026)}
                                </td>
                              </>
                            ) : (
                              <>
                                <td className="px-3 py-2.5 text-center text-[10px] font-bold bg-slate-50/30 text-slate-700">
                                  {emp.criteria1_1}
                                </td>
                                <td className="px-3 py-2.5 text-center text-[10px] font-bold bg-slate-50/30">
                                  <span
                                    className={`px-2 py-0.5 rounded ${
                                      emp.adjStatus === "ปรับ"
                                        ? "bg-[#EBF7F2] text-[#15803D] font-black"
                                        : "bg-slate-100 text-slate-600"
                                    }`}
                                  >
                                    {emp.adjStatus || "ไม่ปรับ"}
                                  </span>
                                </td>
                                <td className="px-3 py-2.5 text-right font-mono font-bold text-slate-900 bg-slate-50/30">
                                  {emp.adjBaseSalary > 0 ? formatInt(emp.adjBaseSalary) : "-"}
                                </td>
                                <td className="px-3 py-2.5 text-right font-mono font-bold text-slate-900 bg-slate-50/30">
                                  {emp.adjCapJv > 0 ? formatInt(emp.adjCapJv) : "-"}
                                </td>
                              </>
                            )}

                            <td className="px-3 py-2.5 text-center">
                              <button
                                type="button"
                                onClick={() => setDrilldownEmp(emp)}
                                className="p-1 rounded-lg text-[#0E3A66] hover:bg-[#E8F3FA] transition-colors cursor-pointer"
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
        </div>
      )}

      {/* Monthly Breakdown Modal (12-Month Drilldown for 2025 vs 2026) */}
      {drilldownEmp && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white rounded-2xl w-full max-w-4xl overflow-hidden shadow-xl border border-slate-200 flex flex-col max-h-[92vh]">
            <div className="p-5 sm:p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base sm:text-lg font-black text-slate-900">{drilldownEmp.name}</h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#E8F3FA] text-[#0E3A66] text-xs font-mono font-bold">
                    รหัส: {drilldownEmp.empId}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                    {drilldownEmp.dept} · {drilldownEmp.role}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  กลุ่ม: <strong>{drilldownEmp.group}</strong> | วันเริ่มงาน: {drilldownEmp.startDate || "-"} | สถานะ:{" "}
                  <strong className={drilldownEmp.profitGrowth > 0 ? "text-[#15803D]" : "text-[#BE123C]"}>
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

            <div className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1 text-xs">
              <div className="space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h4 className="font-extrabold text-[#15803D] flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#15803D]" />
                    <span>รอบปี 2026 (ต.ค. 2568 – ก.ย. 2569)</span>
                  </h4>
                  <span className="font-mono text-xs">
                    รายได้เฉลี่ย: <strong>{formatInt(drilldownEmp.avgRev2026)}</strong> | กำไรเฉลี่ย:{" "}
                    <strong className="text-[#15803D] font-extrabold">{formatInt(drilldownEmp.avgProf2026)}</strong>{" "}
                    บาท/เดือน
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-center border-collapse text-xs font-mono">
                    <thead>
                      <tr className="bg-[#EBF7F2] border border-[#B7E4CE] text-[#15803D] text-[10px] font-bold">
                        <th className="p-2 text-left font-sans w-24">รายการ</th>
                        {MONTH_LABELS_2026.map((m) => (
                          <th key={m} className="p-2">
                            {m}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 border border-slate-200">
                      <tr>
                        <td className="p-2 text-left font-sans font-bold text-slate-700 bg-slate-50">รายได้ JV</td>
                        {drilldownEmp.monthlyRev2026.map((v, i) => (
                          <td key={i} className="p-2 text-slate-800">
                            {v > 0 ? formatInt(v) : "-"}
                          </td>
                        ))}
                      </tr>
                      <tr className="bg-[#EBF7F2]/30">
                        <td className="p-2 text-left font-sans font-extrabold text-[#15803D] bg-[#EBF7F2]/50">
                          กำไรสุทธิ
                        </td>
                        {drilldownEmp.monthlyProf2026.map((v, i) => (
                          <td
                            key={i}
                            className={`p-2 font-bold ${v >= 0 ? "text-[#15803D]" : "text-[#BE123C]"}`}
                          >
                            {v !== 0 ? formatInt(v) : "-"}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="space-y-2 pt-3 border-t border-slate-200">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h4 className="font-extrabold text-[#17538F] flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#17538F]" />
                    <span>รอบปี 2025 (ต.ค. 2567 – ก.ย. 2568)</span>
                  </h4>
                  <span className="font-mono text-xs">
                    รายได้เฉลี่ย: <strong>{formatInt(drilldownEmp.avgRev2025)}</strong> | กำไรเฉลี่ย:{" "}
                    <strong className="text-[#17538F] font-extrabold">{formatInt(drilldownEmp.avgProf2025)}</strong>{" "}
                    บาท/เดือน
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-center border-collapse text-xs font-mono">
                    <thead>
                      <tr className="bg-[#E8F3FA] border border-[#9FCEE8] text-[#0E3A66] text-[10px] font-bold">
                        <th className="p-2 text-left font-sans w-24">รายการ</th>
                        {MONTH_LABELS_2025.map((m) => (
                          <th key={m} className="p-2">
                            {m}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 border border-slate-200">
                      <tr>
                        <td className="p-2 text-left font-sans font-bold text-slate-700 bg-slate-50">รายได้ JV</td>
                        {drilldownEmp.monthlyRev2025.map((v, i) => (
                          <td key={i} className="p-2 text-slate-800">
                            {v > 0 ? formatInt(v) : "-"}
                          </td>
                        ))}
                      </tr>
                      <tr className="bg-[#E8F3FA]/30">
                        <td className="p-2 text-left font-sans font-extrabold text-[#0E3A66] bg-[#E8F3FA]/50">
                          กำไรสุทธิ
                        </td>
                        {drilldownEmp.monthlyProf2025.map((v, i) => (
                          <td
                            key={i}
                            className={`p-2 font-bold ${v >= 0 ? "text-[#0E3A66]" : "text-[#BE123C]"}`}
                          >
                            {v !== 0 ? formatInt(v) : "-"}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block">Ranking ในกลุ่ม (ปี 67)</span>
                  <span className="text-sm font-mono font-black text-slate-800">
                    {drilldownEmp.rank2025Fraction || "-"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block">Ranking ในกลุ่ม (ปี 69)</span>
                  <span className="text-sm font-mono font-black text-[#0E3A66]">
                    {drilldownEmp.rank2026Fraction || "-"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block">ผลการประเมินปี 2568</span>
                  <span className="text-xs font-bold text-slate-700">{drilldownEmp.eval2025 || "-"}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block">ผลการประเมินปี 2569</span>
                  <span className="text-xs font-bold text-[#0E3A66]">{drilldownEmp.eval2026 || "-"}</span>
                </div>
              </div>
            </div>

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
