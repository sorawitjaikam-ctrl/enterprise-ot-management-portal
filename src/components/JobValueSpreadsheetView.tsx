import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Download,
  Upload,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  X,
  RotateCcw,
  DollarSign,
  ShoppingBag,
  BarChart3,
  LineChart as LineChartIcon,
  Database,
  Calendar,
  FileSpreadsheet,
  Trash2,
  ArrowLeft,
} from "lucide-react";
import {
  DetailedJobValueEmployee,
  INITIAL_JOB_VALUE_EXCEL_RECORDS,
} from "../data/jobValueExcelData";
import * as XLSX from "xlsx";
import { parseAccountScope, isRecordAuthorizedByScope } from "../utils/accountScope";

interface JobValueSpreadsheetViewProps {
  currentUser: any;
  isHrOrFullAccess: boolean;
  onOpenEmployeeDetails?: (emp: any) => void;
}

export interface YearlyJobValueRecord {
  empId: string;
  name: string;
  dept: string;
  group: string;
  role: string;
  monthlyRevenue: number[];
  monthlyCost: number[];
  monthlyProfit: number[];
  avgRevenue: number;
  avgCost: number;
  avgProfit: number;
  status: string;
}

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

const AVAILABLE_YEAR_OPTIONS = ["2567", "2568", "2569", "2570", "2571"];

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

// Build default initial per-year records (2568 and 2569) from INITIAL_JOB_VALUE_EXCEL_RECORDS
export function buildDefaultYearlyDatabase(
  seedRecords: DetailedJobValueEmployee[] = INITIAL_JOB_VALUE_EXCEL_RECORDS
): Record<string, YearlyJobValueRecord[]> {
  const year2568: YearlyJobValueRecord[] = [];
  const year2569: YearlyJobValueRecord[] = [];

  seedRecords.forEach((emp) => {
    const rev25 = (emp.monthlyRev2025 || []).map((v) => Math.round(Number(v) || 0));
    const prof25 = (emp.monthlyProf2025 || []).map((v) => Math.round(Number(v) || 0));
    const cost25 = rev25.map((r, i) => Math.round(r - (prof25[i] || 0)));
    const avgRev25 = Math.round(emp.avgRev2025 || 0);
    const avgProf25 = Math.round(emp.avgProf2025 || 0);
    const avgCost25 = Math.round(avgRev25 - avgProf25);

    year2568.push({
      empId: emp.empId,
      name: emp.name,
      dept: emp.dept,
      group: emp.group,
      role: emp.role,
      monthlyRevenue: rev25.length === 12 ? rev25 : new Array(12).fill(0),
      monthlyCost: cost25.length === 12 ? cost25 : new Array(12).fill(0),
      monthlyProfit: prof25.length === 12 ? prof25 : new Array(12).fill(0),
      avgRevenue: avgRev25,
      avgCost: avgCost25,
      avgProfit: avgProf25,
      status: avgProf25 > 0 ? "กำไรต่อยอด" : "ไม่ต่อยอด",
    });

    const rev26 = (emp.monthlyRev2026 || []).map((v) => Math.round(Number(v) || 0));
    const prof26 = (emp.monthlyProf2026 || []).map((v) => Math.round(Number(v) || 0));
    const cost26 = rev26.map((r, i) => {
      if (r === 0 && (prof26[i] || 0) === 0) return 0;
      return Math.round(r - (prof26[i] || 0));
    });
    const avgRev26 = Math.round(emp.avgRev2026 || 0);
    const avgProf26 = Math.round(emp.avgProf2026 || 0);
    const avgCost26 = Math.round(avgRev26 - avgProf26);

    year2569.push({
      empId: emp.empId,
      name: emp.name,
      dept: emp.dept,
      group: emp.group,
      role: emp.role,
      monthlyRevenue: rev26.length === 12 ? rev26 : new Array(12).fill(0),
      monthlyCost: cost26.length === 12 ? cost26 : new Array(12).fill(0),
      monthlyProfit: prof26.length === 12 ? prof26 : new Array(12).fill(0),
      avgRevenue: avgRev26,
      avgCost: avgCost26,
      avgProfit: avgProf26,
      status: emp.profitGrowthStatus || (emp.profitGrowth > 0 ? "กำไรต่อยอด" : "ไม่ต่อยอด"),
    });
  });

  return {
    "2568": year2568,
    "2569": year2569,
  };
}

const LOCAL_STORAGE_JV_KEY = "cloudflare_d1_job_value_years_v1";

const SEED_ROLE_LOOKUP: Map<string, string> = (() => {
  const m = new Map<string, string>();
  INITIAL_JOB_VALUE_EXCEL_RECORDS.forEach((emp) => {
    if (emp.role) {
      if (emp.empId) m.set(String(emp.empId).trim(), emp.role);
      if (emp.name) m.set(emp.name.trim(), emp.role);
    }
  });
  return m;
})();

export function getEmployeePositionLabel(emp: { empId?: string; name?: string; role?: string }): string {
  const rawRole = (emp.role || "").trim();
  if (rawRole && rawRole.toLowerCase() !== "operator") {
    return rawRole;
  }
  const fromId = emp.empId ? SEED_ROLE_LOOKUP.get(String(emp.empId).trim()) : undefined;
  if (fromId) return fromId;
  const fromName = emp.name ? SEED_ROLE_LOOKUP.get(emp.name.trim()) : undefined;
  if (fromName) return fromName;
  return rawRole;
}

export const isStrictlyCoAdmin = (role?: string): boolean => {
  const normalized = (role || "").trim().toLowerCase();
  return (
    normalized === "co-admin" ||
    normalized === "co_admin" ||
    normalized === "coadmin" ||
    normalized === "ผู้ช่วยดูแลระบบ" ||
    normalized === "admin" ||
    normalized === "ผู้ดูแลระบบ"
  );
};

export const isCoAdminOrAdmin = isStrictlyCoAdmin;

export function normalizeDeptString(d?: string): string {
  if (!d) return "";
  return d.toLowerCase().replace(/[\s\-_]/g, "");
}

function loadInitialYearlyStore(): Record<string, YearlyJobValueRecord[]> {
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_JV_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") {
          const result: Record<string, YearlyJobValueRecord[]> = {};
          for (const k of Object.keys(parsed)) {
            result[k] = Array.isArray(parsed[k]) ? parsed[k] : [];
          }
          return result;
        }
      }
    } catch {
      // ignore
    }
  }
  return buildDefaultYearlyDatabase();
}

interface SummaryRowItem {
  key: string;
  name: string;
  empId?: string;
  dept: string;
  group?: string;
  revenue: number;
  cost: number;
  profit: number;
  profitCompare: number;
  count: number;
  status: string;
  deptRank?: number;
  deptTotal?: number;
  groupRank?: number;
  groupTotal?: number;
  overallRank?: number;
  overallTotal?: number;
}

export default function JobValueSpreadsheetView({
  currentUser,
  isHrOrFullAccess,
  onOpenEmployeeDetails,
}: JobValueSpreadsheetViewProps) {
  // Self-contained Cloudflare D1 Yearly Store (keyed by Buddhist year e.g. "2568", "2569", "2570")
  const [yearlyStore, setYearlyStore] = useState<Record<string, YearlyJobValueRecord[]>>(() =>
    loadInitialYearlyStore()
  );
  const [selectedYear, setSelectedYear] = useState<string>("2569");
  const [compareYear, setCompareYear] = useState<string>("2568");
  const [uploadTargetYear, setUploadTargetYear] = useState<string>("2569");
  const [showUploadPanel, setShowUploadPanel] = useState<boolean>(false);

  // Executive Operational Dashboard Filters
  const [groupFilter, setGroupFilter] = useState<string>("ALL");
  const [deptFilter, setDeptFilter] = useState<string>("ALL");
  const [empFilter, setEmpFilter] = useState<string>("ALL");
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isSyncingD1, setIsSyncingD1] = useState<boolean>(false);
  const [lastD1SyncTime, setLastD1SyncTime] = useState<string>("");
  const [hoveredMonthIdx, setHoveredMonthIdx] = useState<number | null>(null);
  const [hoveredBarIdx, setHoveredBarIdx] = useState<number | null>(null);
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [importStatusMsg, setImportStatusMsg] = useState<string>("");
  const fileInputDirectRef = React.useRef<HTMLInputElement | null>(null);
  const canManageD1Upload = isCoAdminOrAdmin(currentUser?.role);

  // Save to localStorage + Cloudflare D1 (/api/job-value-data)
  const persistYearToCloudflareD1 = useCallback(
    async (
      nextStore: Record<string, YearlyJobValueRecord[]>,
      targetYearKey?: string,
      recordsForYear?: YearlyJobValueRecord[]
    ) => {
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(LOCAL_STORAGE_JV_KEY, JSON.stringify(nextStore));
        } catch {
          // ignore
        }
      }
      setIsSyncingD1(true);
      try {
        const bodyPayload =
          targetYearKey && recordsForYear
            ? {
                yearKey: targetYearKey,
                records: recordsForYear,
                updatedBy: currentUser?.username || "admin",
              }
            : {
                yearsMap: nextStore,
                updatedBy: currentUser?.username || "admin",
              };

        const res = await fetch("/api/job-value-data", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bodyPayload),
        });
        if (res.ok) {
          const nowStr = new Date().toLocaleTimeString("th-TH", { hour12: false });
          setLastD1SyncTime(nowStr);
        }
      } catch {
        // offline fallback uses localStorage
      } finally {
        setIsSyncingD1(false);
      }
    },
    [currentUser]
  );

  // Fetch stored years from Cloudflare D1 on mount
  const fetchFromCloudflareD1 = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/job-value-data");
      if (res.ok) {
        const data = await res.json();
        if (data && data.years && typeof data.years === "object") {
          const remoteYears = data.years as Record<string, YearlyJobValueRecord[]>;
          const remoteKeys = Object.keys(remoteYears);
          if (remoteKeys.length > 0) {
            setYearlyStore((prev) => {
              const updated = { ...prev };
              for (const [k, v] of Object.entries(remoteYears)) {
                updated[k] = Array.isArray(v) ? (v as YearlyJobValueRecord[]) : [];
              }
              if (typeof window !== "undefined") {
                localStorage.setItem(LOCAL_STORAGE_JV_KEY, JSON.stringify(updated));
              }
              return updated;
            });
            if (data.updatedAt) {
              setLastD1SyncTime(
                new Date(data.updatedAt).toLocaleTimeString("th-TH", { hour12: false })
              );
            }
          }
        }
      }
    } catch {
      // ignore offline error during test or disconnected mode
    } finally {
      setIsRefreshing(false);
    }
  }, [persistYearToCloudflareD1]);

  useEffect(() => {
    fetchFromCloudflareD1();
  }, [fetchFromCloudflareD1]);

  // Available years (union of standard years + any custom uploaded years)
  const storedYearKeys = useMemo(() => {
    const keys = new Set<string>([...AVAILABLE_YEAR_OPTIONS, ...Object.keys(yearlyStore)]);
    return Array.from(keys).sort();
  }, [yearlyStore]);

  // Scoped records per year based on user permissions with multi-agency and multi-department scope
  const getScopedRecordsForYear = useCallback(
    (yearKey: string): YearlyJobValueRecord[] => {
      const raw = yearlyStore[yearKey] || [];
      if (!currentUser?.deptId || currentUser.deptId === "all" || isHrOrFullAccess) {
        return raw;
      }
      const scope = parseAccountScope(currentUser.deptId);
      const scoped = raw.filter((emp) => isRecordAuthorizedByScope(scope, emp.dept, emp.group));
      return scoped.length > 0 ? scoped : raw;
    },
    [yearlyStore, currentUser, isHrOrFullAccess]
  );

  // Active year records & compare year records
  const currentYearRecords = useMemo(() => {
    return getScopedRecordsForYear(selectedYear);
  }, [getScopedRecordsForYear, selectedYear]);

  const compareYearRecords = useMemo(() => {
    return getScopedRecordsForYear(compareYear);
  }, [getScopedRecordsForYear, compareYear]);

  const compareYearMap = useMemo(() => {
    const map = new Map<string, YearlyJobValueRecord>();
    compareYearRecords.forEach((r) => {
      map.set(r.empId, r);
      if (r.name) map.set(r.name.trim(), r);
    });
    return map;
  }, [compareYearRecords]);

  // Combined pool of records to ensure department & employee filters remain populated even if selected year is empty
  const basePoolRecords = useMemo(() => {
    if (currentYearRecords.length > 0) return currentYearRecords;
    if (compareYearRecords.length > 0) return compareYearRecords;
    const all = Object.values(yearlyStore).flat();
    return all.length > 0 ? all : [];
  }, [currentYearRecords, compareYearRecords, yearlyStore]);

  // Distinct groups list for #filter-group (ดึงจากคอลัมน์กลุ่มสายงานที่อัปโหลด เช่น สายงาน ITS)
  const groupOptions = useMemo(() => {
    const grps = Array.from(
      new Set(basePoolRecords.map((r) => r.group?.trim()).filter(Boolean))
    );
    grps.sort();
    return grps;
  }, [basePoolRecords]);

  // Distinct departments list for #filter-dept (กรองตามกลุ่มสายงานที่เลือก ถ้าเลือกกลุ่ม)
  const departmentOptions = useMemo(() => {
    let pool = basePoolRecords;
    if (groupFilter !== "ALL") {
      pool = pool.filter((r) => r.group === groupFilter);
    }
    const depts = Array.from(new Set(pool.map((r) => r.dept).filter(Boolean)));
    depts.sort();
    return depts;
  }, [basePoolRecords, groupFilter]);

  // Employees list for #filter-emp based on groupFilter and deptFilter
  const employeeOptions = useMemo(() => {
    let pool = basePoolRecords;
    if (groupFilter !== "ALL") {
      pool = pool.filter((d) => d.group === groupFilter);
    }
    if (deptFilter !== "ALL") {
      if (deptFilter.startsWith("GROUP:")) {
        const gName = deptFilter.replace("GROUP:", "");
        pool = pool.filter((d) => d.group === gName);
      } else {
        pool = pool.filter((d) => d.dept === deptFilter);
      }
    }
    return pool;
  }, [basePoolRecords, groupFilter, deptFilter]);

  // Precompute profit rankings for every employee across their Department (กลุ่ม/แผนก) and Agency (หน่วยงาน/สายงาน)
  const employeeRankings = useMemo(() => {
    const empItems: {
      empId: string;
      name: string;
      dept: string;
      group: string;
      revenue: number;
      cost: number;
      profit: number;
      profitCompare: number;
      status: string;
    }[] = currentYearRecords.map((d) => {
      const compRec = compareYearMap.get(d.empId) || compareYearMap.get(d.name?.trim());
      const mRevArr = d.monthlyRevenue || new Array(12).fill(0);
      const mCostArr = d.monthlyCost || new Array(12).fill(0);
      const activeMonths =
        mRevArr.filter((rv, m) => (rv || 0) !== 0 || (mCostArr[m] || 0) !== 0).length || 12;

      const avgRev = Math.round(
        d.avgRevenue !== undefined && d.avgRevenue !== null && d.avgRevenue !== 0
          ? d.avgRevenue
          : mRevArr.reduce((a, b) => a + (b || 0), 0) / activeMonths
      );
      const avgCost = Math.round(
        d.avgCost !== undefined && d.avgCost !== null && d.avgCost !== 0
          ? d.avgCost
          : mCostArr.reduce((a, b) => a + (b || 0), 0) / activeMonths
      );
      const avgProf = Math.round(avgRev - avgCost);

      let profComp = 0;
      if (compRec) {
        const cRevArr = compRec.monthlyRevenue || new Array(12).fill(0);
        const cCostArr = compRec.monthlyCost || new Array(12).fill(0);
        const cActiveMonths =
          cRevArr.filter((rv, m) => (rv || 0) !== 0 || (cCostArr[m] || 0) !== 0).length || 12;
        const cAvgRev = Math.round(
          compRec.avgRevenue !== undefined && compRec.avgRevenue !== null && compRec.avgRevenue !== 0
            ? compRec.avgRevenue
            : cRevArr.reduce((a, b) => a + (b || 0), 0) / cActiveMonths
        );
        const cAvgCost = Math.round(
          compRec.avgCost !== undefined && compRec.avgCost !== null && compRec.avgCost !== 0
            ? compRec.avgCost
            : cCostArr.reduce((a, b) => a + (b || 0), 0) / cActiveMonths
        );
        profComp = Math.round(cAvgRev - cAvgCost);
      }

      const grpName = d.group?.trim() || d.dept;
      return {
        empId: d.empId,
        name: d.name,
        dept: d.dept,
        group: grpName,
        revenue: avgRev,
        cost: avgCost,
        profit: avgProf,
        profitCompare: profComp,
        status: avgProf > profComp ? "ต่อยอด" : "ไม่ต่อยอด",
      };
    });

    const byDept = new Map<string, typeof empItems>();
    const byGroup = new Map<string, typeof empItems>();

    empItems.forEach((item) => {
      if (!byDept.has(item.dept)) byDept.set(item.dept, []);
      byDept.get(item.dept)!.push(item);

      if (!byGroup.has(item.group)) byGroup.set(item.group, []);
      byGroup.get(item.group)!.push(item);
    });

    byDept.forEach((list) => list.sort((a, b) => b.profit - a.profit));
    byGroup.forEach((list) => list.sort((a, b) => b.profit - a.profit));
    const allSorted = [...empItems].sort((a, b) => b.profit - a.profit);

    const deptNames = Array.from(byDept.keys()).sort();
    const groupNames = Array.from(byGroup.keys()).sort();

    const rankMap = new Map<
      string,
      {
        empId: string;
        name: string;
        dept: string;
        group: string;
        profit: number;
        profitCompare: number;
        deptRank: number;
        deptTotal: number;
        groupRank: number;
        groupTotal: number;
        overallRank: number;
        overallTotal: number;
        deptPeers: SummaryRowItem[];
        crossDeptRanks: { dept: string; rank: number; total: number; isOwnDept: boolean }[];
        crossGroupRanks: { group: string; rank: number; total: number; isOwnGroup: boolean }[];
      }
    >();

    empItems.forEach((item) => {
      const deptList = byDept.get(item.dept) || [];
      const groupList = byGroup.get(item.group) || [];

      const deptRank = deptList.findIndex((x) => x.empId === item.empId) + 1;
      const groupRank = groupList.findIndex((x) => x.empId === item.empId) + 1;
      const overallRank = allSorted.findIndex((x) => x.empId === item.empId) + 1;

      const crossDeptRanks = deptNames.map((dName) => {
        const list = byDept.get(dName) || [];
        if (dName === item.dept) {
          return {
            dept: dName,
            rank: deptRank,
            total: list.length,
            isOwnDept: true,
          };
        }
        const higherCount = list.filter((p) => p.profit > item.profit).length;
        return {
          dept: dName,
          rank: higherCount + 1,
          total: list.length + 1,
          isOwnDept: false,
        };
      });

      const crossGroupRanks = groupNames.map((gName) => {
        const list = byGroup.get(gName) || [];
        if (gName === item.group) {
          return {
            group: gName,
            rank: groupRank,
            total: list.length,
            isOwnGroup: true,
          };
        }
        const higherCount = list.filter((p) => p.profit > item.profit).length;
        return {
          group: gName,
          rank: higherCount + 1,
          total: list.length + 1,
          isOwnGroup: false,
        };
      });

      const deptPeers: SummaryRowItem[] = deptList.map((peer, idx) => ({
        key: peer.empId,
        name: peer.name,
        empId: peer.empId,
        dept: peer.dept,
        group: peer.group,
        revenue: peer.revenue,
        cost: peer.cost,
        profit: peer.profit,
        profitCompare: peer.profitCompare,
        count: 1,
        status: peer.status,
        deptRank: idx + 1,
        deptTotal: deptList.length,
        groupRank: (byGroup.get(peer.group) || []).findIndex((x) => x.empId === peer.empId) + 1,
        groupTotal: (byGroup.get(peer.group) || []).length,
        overallRank: allSorted.findIndex((x) => x.empId === peer.empId) + 1,
        overallTotal: allSorted.length,
      }));

      rankMap.set(item.empId, {
        empId: item.empId,
        name: item.name,
        dept: item.dept,
        group: item.group,
        profit: item.profit,
        profitCompare: item.profitCompare,
        deptRank,
        deptTotal: deptList.length,
        groupRank,
        groupTotal: groupList.length,
        overallRank,
        overallTotal: allSorted.length,
        deptPeers,
        crossDeptRanks,
        crossGroupRanks,
      });
    });

    return rankMap;
  }, [currentYearRecords, compareYearMap]);

  // Core processData(groupFilter, deptFilter, empFilter) for selectedYear vs compareYear
  const processedData = useMemo(() => {
    let filteredCurrent = currentYearRecords;
    let filteredCompare = compareYearRecords;

    if (groupFilter !== "ALL") {
      filteredCurrent = filteredCurrent.filter((d) => d.group === groupFilter);
      filteredCompare = filteredCompare.filter((d) => d.group === groupFilter);
    }
    if (deptFilter !== "ALL") {
      if (deptFilter.startsWith("GROUP:")) {
        const gName = deptFilter.replace("GROUP:", "");
        filteredCurrent = filteredCurrent.filter((d) => d.group === gName);
        filteredCompare = filteredCompare.filter((d) => d.group === gName);
      } else {
        filteredCurrent = filteredCurrent.filter((d) => d.dept === deptFilter);
        filteredCompare = filteredCompare.filter((d) => d.dept === deptFilter);
      }
    }
    if (empFilter !== "ALL") {
      filteredCurrent = filteredCurrent.filter((d) => d.empId === empFilter);
      filteredCompare = filteredCompare.filter((d) => d.empId === empFilter);
    }

    let sumRev = 0;
    let sumCost = 0;
    let sumProfit = 0;
    let sumProfitCompare = 0;
    const mRev: (number | null)[] = new Array(12).fill(0);
    const mCost: (number | null)[] = new Array(12).fill(0);
    const mProfit: (number | null)[] = new Array(12).fill(0);
    const mProfitCompare: (number | null)[] = new Array(12).fill(0);
    const summaryMap: Record<string, SummaryRowItem> = {};

    // Calculate monthly profit for compare year
    filteredCompare.forEach((d) => {
      const cRev = d.monthlyRevenue || new Array(12).fill(0);
      const cCost = d.monthlyCost || new Array(12).fill(0);
      for (let m = 0; m < 12; m++) {
        const r = Math.round(cRev[m] || 0);
        const c = Math.round(cCost[m] || 0);
        mProfitCompare[m] = (mProfitCompare[m] || 0) + (r - c);
      }
    });

    filteredCurrent.forEach((d) => {
      const compRec = compareYearMap.get(d.empId) || compareYearMap.get(d.name?.trim());
      
      const mRevArr = d.monthlyRevenue || new Array(12).fill(0);
      const mCostArr = d.monthlyCost || new Array(12).fill(0);

      // Months with recorded activity
      const activeMonths =
        mRevArr.filter((rv, m) => (rv || 0) !== 0 || (mCostArr[m] || 0) !== 0).length || 12;

      // Auto-compute average revenue, cost, and profit (No manual user entry required)
      const avgRev = Math.round(
        d.avgRevenue !== undefined && d.avgRevenue !== null && d.avgRevenue !== 0
          ? d.avgRevenue
          : mRevArr.reduce((a, b) => a + (b || 0), 0) / activeMonths
      );
      const avgCost = Math.round(
        d.avgCost !== undefined && d.avgCost !== null && d.avgCost !== 0
          ? d.avgCost
          : mCostArr.reduce((a, b) => a + (b || 0), 0) / activeMonths
      );
      const avgProf = Math.round(avgRev - avgCost);

      // Compare year profit (Auto-computed)
      let profComp = 0;
      if (compRec) {
        const cRevArr = compRec.monthlyRevenue || new Array(12).fill(0);
        const cCostArr = compRec.monthlyCost || new Array(12).fill(0);
        const cActiveMonths =
          cRevArr.filter((rv, m) => (rv || 0) !== 0 || (cCostArr[m] || 0) !== 0).length || 12;
        const cAvgRev = Math.round(
          compRec.avgRevenue !== undefined && compRec.avgRevenue !== null && compRec.avgRevenue !== 0
            ? compRec.avgRevenue
            : cRevArr.reduce((a, b) => a + (b || 0), 0) / cActiveMonths
        );
        const cAvgCost = Math.round(
          compRec.avgCost !== undefined && compRec.avgCost !== null && compRec.avgCost !== 0
            ? compRec.avgCost
            : cCostArr.reduce((a, b) => a + (b || 0), 0) / cActiveMonths
        );
        profComp = Math.round(cAvgRev - cAvgCost);
      }

      sumRev += avgRev;
      sumCost += avgCost;
      sumProfit += avgProf;
      sumProfitCompare += profComp;

      for (let m = 0; m < 12; m++) {
        const revM = Math.round(mRevArr[m] || 0);
        const costM = Math.round(mCostArr[m] || 0);
        const profM = Math.round(revM - costM);
        mRev[m] = (mRev[m] || 0) + revM;
        mCost[m] = (mCost[m] || 0) + costM;
        mProfit[m] = (mProfit[m] || 0) + profM;
      }

      let key = d.empId;
      let displayName = d.name;
      let isPerson = true;

      if (empFilter !== "ALL" || deptFilter !== "ALL") {
        // Specific employee or department selected -> show employees
        key = d.empId;
        displayName = d.name;
        isPerson = true;
      } else if (groupFilter !== "ALL") {
        // Specific agency/group selected -> show sub-departments (INTER 2, 3, 5, 7)
        key = d.dept;
        displayName = d.dept;
        isPerson = false;
      } else {
        // Top level (all agencies) -> combine into single group/agency (e.g. ITS)
        const grpName = d.group?.trim() || d.dept;
        key = grpName;
        displayName = grpName;
        isPerson = false;
      }

      const rInfo = isPerson ? employeeRankings.get(d.empId) : undefined;

      if (!summaryMap[key]) {
        summaryMap[key] = {
          key,
          name: displayName,
          empId: isPerson ? d.empId : undefined,
          dept: isPerson ? d.dept : d.dept,
          group: d.group?.trim() || d.dept,
          revenue: 0,
          cost: 0,
          profit: 0,
          profitCompare: 0,
          count: 0,
          status: "",
          deptRank: rInfo?.deptRank,
          deptTotal: rInfo?.deptTotal,
          groupRank: rInfo?.groupRank,
          groupTotal: rInfo?.groupTotal,
          overallRank: rInfo?.overallRank,
          overallTotal: rInfo?.overallTotal,
        };
      }

      summaryMap[key].revenue += avgRev;
      summaryMap[key].cost += avgCost;
      summaryMap[key].profit += avgProf;
      summaryMap[key].profitCompare += profComp;
      summaryMap[key].count += 1;
    });

    // Also include entities from compare year if current year has 0 records or entity is absent in current year
    filteredCompare.forEach((d) => {
      let key = d.empId;
      let displayName = d.name;
      let isPerson = true;

      if (empFilter !== "ALL" || deptFilter !== "ALL") {
        key = d.empId;
        displayName = d.name;
        isPerson = true;
      } else if (groupFilter !== "ALL") {
        key = d.dept;
        displayName = d.dept;
        isPerson = false;
      } else {
        const grpName = d.group?.trim() || d.dept;
        key = grpName;
        displayName = grpName;
        isPerson = false;
      }

      const cRevArr = d.monthlyRevenue || new Array(12).fill(0);
      const cCostArr = d.monthlyCost || new Array(12).fill(0);
      const cActiveMonths =
        cRevArr.filter((rv, m) => (rv || 0) !== 0 || (cCostArr[m] || 0) !== 0).length || 12;
      const cAvgRev = Math.round(
        d.avgRevenue !== undefined && d.avgRevenue !== null && d.avgRevenue !== 0
          ? d.avgRevenue
          : cRevArr.reduce((a, b) => a + (b || 0), 0) / cActiveMonths
      );
      const cAvgCost = Math.round(
        d.avgCost !== undefined && d.avgCost !== null && d.avgCost !== 0
          ? d.avgCost
          : cCostArr.reduce((a, b) => a + (b || 0), 0) / cActiveMonths
      );
      const compProf = Math.round(cAvgRev - cAvgCost);

      if (!summaryMap[key]) {
        summaryMap[key] = {
          key,
          name: displayName,
          empId: isPerson ? d.empId : undefined,
          dept: isPerson ? d.dept : d.dept,
          group: d.group?.trim() || d.dept,
          revenue: 0,
          cost: 0,
          profit: 0,
          profitCompare: compProf,
          count: 1,
          status: "ไม่ต่อยอด",
        };
        sumProfitCompare += compProf;
      }
    });

    // Trim trailing months with all zeros for current year
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

    // Trim trailing months with all zeros for compare year
    let lastCompDataIndex = 11;
    while (lastCompDataIndex >= 0 && mProfitCompare[lastCompDataIndex] === 0) {
      mProfitCompare[lastCompDataIndex] = null;
      lastCompDataIndex--;
    }

    const summaryArray = Object.values(summaryMap)
      .map((item) => {
        // Dynamic comparison: กำไรปีปัจจุบัน > กำไรปีก่อนหน้า -> "ต่อยอด", ต่ำกว่าหรือเท่ากัน -> "ไม่ต่อยอด"
        const isGrowth = item.profit > item.profitCompare;
        item.status = isGrowth ? "ต่อยอด" : "ไม่ต่อยอด";
        return item;
      })
      .sort((a, b) => b.profit - a.profit);

    const viewMode: "PERSON" | "DEPT" | "ALL" =
      empFilter !== "ALL" ? "PERSON" : deptFilter !== "ALL" ? "DEPT" : "ALL";

    return {
      empCount: filteredCurrent.length,
      totalRevenue: Math.round(sumRev),
      totalCost: Math.round(sumCost),
      totalProfit: Math.round(sumProfit),
      totalProfitCompare: Math.round(sumProfitCompare),
      monthlyRevenue: mRev,
      monthlyCost: mCost,
      monthlyProfit: mProfit,
      monthlyProfitCompare: mProfitCompare,
      summaryData: summaryArray,
      viewMode,
    };
  }, [currentYearRecords, compareYearRecords, compareYearMap, groupFilter, deptFilter, empFilter, employeeRankings]);

  // Overall status evaluation: ประเมินภาพรวม "ต่อยอด" หากผลงาน (กำไร) สูงกว่าปีก่อนหน้า, "ไม่ต่อยอด" หากต่ำกว่าหรือเท่ากัน
  const statusEvaluation = useMemo(() => {
    let statusText = "ไม่มีข้อมูล";
    if (processedData.empCount === 0) {
      statusText = "ยังไม่มีข้อมูลปีนี้";
    } else {
      const isGrowth = processedData.totalProfit > processedData.totalProfitCompare;
      statusText = isGrowth ? "ต่อยอด" : "ไม่ต่อยอด";
    }

    const isNegative =
      statusText === "ไม่ต่อยอด" ||
      statusText.includes("ขาดทุน") ||
      statusText.includes("ไม่") ||
      statusText.includes("ปรับปรุง") ||
      statusText.includes("เฝ้าระวัง") ||
      statusText.includes("ยังไม่มี");
    const isPositive =
      statusText === "ต่อยอด" ||
      (!isNegative && (statusText.includes("กำไร") || statusText.includes("ต่อยอด") || statusText.includes("Pass")));

    return { statusText, isNegative, isPositive };
  }, [processedData]);

  // Growth percentage comparison vs compareYear (whole integer %)
  const growthComparison = useMemo(() => {
    const diff = processedData.totalProfit - processedData.totalProfitCompare;
    const percent =
      processedData.totalProfitCompare !== 0
        ? Math.round((diff / Math.abs(processedData.totalProfitCompare)) * 100)
        : 0;
    return { diff, percent };
  }, [processedData]);

  const handleGroupChange = (nextGroup: string) => {
    setGroupFilter(nextGroup);
    setDeptFilter("ALL");
    setEmpFilter("ALL");
  };

  const handleDeptChange = (nextDept: string) => {
    setDeptFilter(nextDept);
    setEmpFilter("ALL");
  };

  const handleEmpChange = (nextEmpId: string) => {
    setEmpFilter(nextEmpId);
  };

  const handleResetFilters = () => {
    setGroupFilter("ALL");
    setDeptFilter("ALL");
    setEmpFilter("ALL");
  };

  const isDrilledDown = groupFilter !== "ALL" || deptFilter !== "ALL" || empFilter !== "ALL";

  const handleGoBack = () => {
    if (empFilter !== "ALL") {
      setEmpFilter("ALL");
    } else if (deptFilter !== "ALL") {
      setDeptFilter("ALL");
    } else if (groupFilter !== "ALL") {
      setGroupFilter("ALL");
    }
  };

  // Synchronized Year Filter Handlers: prevent identical year collision and auto-link comparison
  const handleSelectedYearChange = (newYear: string) => {
    setSelectedYear(newYear);
    if (compareYear === newYear) {
      const priorYearNum = Number(newYear) - 1;
      const priorYearStr = String(priorYearNum);
      const fallbackYear =
        storedYearKeys.find((y) => y === priorYearStr) ||
        storedYearKeys.find((y) => y !== newYear) ||
        newYear;
      setCompareYear(fallbackYear);
    }
  };

  const handleCompareYearChange = (newCompYear: string) => {
    setCompareYear(newCompYear);
    if (newCompYear === selectedYear) {
      const altYear =
        storedYearKeys.find((y) => y !== newCompYear) ||
        String(Number(newCompYear) + 1);
      setSelectedYear(altYear);
    }
  };

  // Download Single-Year CSV Template for easy per-year upload
  // ไม่ต้องมีคอลัมน์ค่าเฉลี่ยหรือสถานะ ให้ระบบคำนวณอัตโนมัติเอง
  const handleDownloadYearlyTemplate = (yearToDownload: string) => {
    const existingForYear =
      yearlyStore[yearToDownload] && yearlyStore[yearToDownload].length > 0
        ? yearlyStore[yearToDownload]
        : yearlyStore["2568"] || yearlyStore["2569"] || [];
    const headers = [
      "รหัสพนักงาน",
      "ชื่อ-พนักงาน",
      "แผนก",
      "กลุ่มสายงาน",
      "ตำแหน่ง",
      ...SHORT_MONTH_LABELS.map((m) => `รายได้_${m}`),
      ...SHORT_MONTH_LABELS.map((m) => `ต้นทุน_${m}`),
    ];

    let csvContent = "\uFEFF" + headers.join(",") + "\n";
    existingForYear.forEach((r) => {
      const row = [
        `"${r.empId}"`,
        `"${r.name.replace(/"/g, '""')}"`,
        `"${r.dept}"`,
        `"${r.group}"`,
        `"${r.role}"`,
        ...(r.monthlyRevenue || new Array(12).fill(0)).map((v) => Math.round(v || 0)),
        ...(r.monthlyCost || new Array(12).fill(0)).map((v) => Math.round(v || 0)),
      ];
      csvContent += row.join(",") + "\n";
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Job value ปี${yearToDownload}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Export full monthly Job Value data (รายเดือน 12 เดือน รายได้ ต้นทุน กำไร พร้อมค่าเฉลี่ยและสถานะต่อยอด)
  const handleDownloadSummaryCsv = () => {
    const headers = [
      "ลำดับ",
      "รหัสพนักงาน",
      "ชื่อ-พนักงาน",
      "แผนก",
      "กลุ่มสายงาน",
      "ตำแหน่ง",
      ...SHORT_MONTH_LABELS.map((m) => `รายได้_${m}`),
      ...SHORT_MONTH_LABELS.map((m) => `ต้นทุน_${m}`),
      ...SHORT_MONTH_LABELS.map((m) => `กำไร_${m}`),
      "รายได้เฉลี่ย",
      "ต้นทุนเฉลี่ย",
      `กำไรเฉลี่ยปี ${selectedYear}`,
      `กำไรเฉลี่ยปี ${compareYear}`,
      "สถานะต่อยอด",
    ];
    let csvContent = "\uFEFF" + headers.join(",") + "\n";

    // Primary records for selected year (or fallback to personnel structure if empty)
    const rawList =
      currentYearRecords.length > 0
        ? currentYearRecords
        : yearlyStore[selectedYear] && yearlyStore[selectedYear].length > 0
        ? yearlyStore[selectedYear]
        : compareYearRecords.length > 0
        ? compareYearRecords.map((r) => ({
            ...r,
            monthlyRevenue: new Array(12).fill(0),
            monthlyCost: new Array(12).fill(0),
            monthlyProfit: new Array(12).fill(0),
            avgRevenue: 0,
            avgCost: 0,
            avgProfit: 0,
          }))
        : [];

    let exportList = rawList;
    if (groupFilter !== "ALL") {
      exportList = exportList.filter((d) => d.group === groupFilter);
    }
    if (deptFilter !== "ALL") {
      if (deptFilter.startsWith("GROUP:")) {
        const gName = deptFilter.replace("GROUP:", "");
        exportList = exportList.filter((d) => d.group === gName);
      } else {
        exportList = exportList.filter((d) => d.dept === deptFilter);
      }
    }
    if (empFilter !== "ALL") {
      exportList = exportList.filter((d) => d.empId === empFilter);
    }

    exportList.forEach((r, idx) => {
      const compRec = compareYearMap.get(r.empId) || compareYearMap.get(r.name?.trim());
      const mRev = (r.monthlyRevenue || new Array(12).fill(0)).map((v) => Math.round(Number(v) || 0));
      const mCost = (r.monthlyCost || new Array(12).fill(0)).map((v) => Math.round(Number(v) || 0));
      const mProf = mRev.map((rv, i) => Math.round(rv - (mCost[i] || 0)));

      const activeMonths = mRev.filter((rv, i) => rv !== 0 || mCost[i] !== 0).length || 12;
      const avgRev = Math.round(
        r.avgRevenue !== undefined && r.avgRevenue !== null && r.avgRevenue !== 0
          ? r.avgRevenue
          : mRev.reduce((a, b) => a + b, 0) / activeMonths
      );
      const avgCost = Math.round(
        r.avgCost !== undefined && r.avgCost !== null && r.avgCost !== 0
          ? r.avgCost
          : mCost.reduce((a, b) => a + b, 0) / activeMonths
      );
      const avgProf = Math.round(avgRev - avgCost);

      let compAvgProf = 0;
      if (compRec) {
        const cRev = (compRec.monthlyRevenue || new Array(12).fill(0)).map((v) => Math.round(Number(v) || 0));
        const cCost = (compRec.monthlyCost || new Array(12).fill(0)).map((v) => Math.round(Number(v) || 0));
        const cActiveMonths = cRev.filter((rv, i) => rv !== 0 || cCost[i] !== 0).length || 12;
        const cAvgRev = Math.round(
          compRec.avgRevenue !== undefined && compRec.avgRevenue !== null && compRec.avgRevenue !== 0
            ? compRec.avgRevenue
            : cRev.reduce((a, b) => a + b, 0) / cActiveMonths
        );
        const cAvgCost = Math.round(
          compRec.avgCost !== undefined && compRec.avgCost !== null && compRec.avgCost !== 0
            ? compRec.avgCost
            : cCost.reduce((a, b) => a + b, 0) / cActiveMonths
        );
        compAvgProf = Math.round(cAvgRev - cAvgCost);
      }

      const status = avgProf > compAvgProf ? "ต่อยอด" : "ไม่ต่อยอด";

      const row = [
        idx + 1,
        `"${r.empId}"`,
        `"${r.name.replace(/"/g, '""')}"`,
        `"${r.dept}"`,
        `"${r.group}"`,
        `"${r.role}"`,
        ...mRev,
        ...mCost,
        ...mProf,
        avgRev,
        avgCost,
        avgProf,
        compAvgProf,
        `"${status}"`,
      ];
      csvContent += row.join(",") + "\n";
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Job value ปี${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Per-Year File Upload Handler (.xlsx, .xls, .csv) -> Stores directly in Cloudflare D1
  const handleFileUploadForYear = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportStatusMsg(
      `กำลังอ่านไฟล์ "${file.name}" สำหรับบันทึกข้อมูลปี ${
        uploadTargetYear === "BOTH_2568_2569" ? "2568 และ 2569" : uploadTargetYear
      } ลง Cloudflare D1...`
    );

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary", cellFormula: true });
        const wsName = wb.SheetNames[0];
        const ws = wb.Sheets[wsName];
        const sheetData: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });

        // Detect if this is the Single-Year CSV/Excel Template (header row 0 starts with "รหัสพนักงาน")
        const headerRow0 = (sheetData[0] || []).map((c) => String(c || "").trim());
        const isSingleYearTemplate =
          headerRow0.includes("รหัสพนักงาน") &&
          (headerRow0.some((h) => h.startsWith("รายได้_")) ||
            headerRow0.some((h) => h.startsWith("ต้นทุน_")) ||
            headerRow0.some((h) => h.startsWith("กำไร_")) ||
            headerRow0.includes("รายได้เฉลี่ย"));

        if (isSingleYearTemplate) {
          const parsedSingleYear: YearlyJobValueRecord[] = [];
          const col17Header = headerRow0[17] || "";
          const isCostCol = col17Header.includes("ต้นทุน");

          for (let r = 1; r < sheetData.length; r++) {
            const row = sheetData[r];
            if (!row || !row[0]) continue;
            const empId = String(row[0]).trim();
            const name = String(row[1] || "").trim();
            const dept = String(row[2] || "INTER 2").trim();
            const group = String(row[3] || "กลุ่ม O&M").trim();
            const role = String(row[4] || "Operator").trim();

            const mRev: number[] = [];
            const mCost: number[] = [];
            const mProf: number[] = [];

            for (let m = 0; m < 12; m++) {
              mRev.push(Math.round(Number(row[5 + m]) || 0));
            }

            for (let m = 0; m < 12; m++) {
              const val17 = Math.round(Number(row[17 + m]) || 0);
              if (isCostCol) {
                mCost.push(val17);
                mProf.push(Math.round(mRev[m] - val17));
              } else {
                mProf.push(val17);
                mCost.push(mRev[m] === 0 && val17 === 0 ? 0 : Math.round(mRev[m] - val17));
              }
            }

            // ระบบคำนวณค่าเฉลี่ยอัตโนมัติเองทั้งหมด ไม่ต้องให้ผู้ใช้กรอก
            const activeMonths =
              mRev.filter((rv, idx) => rv !== 0 || mCost[idx] !== 0).length || 12;
            const avgRev = Math.round(mRev.reduce((a, b) => a + b, 0) / activeMonths);
            const avgCost = Math.round(mCost.reduce((a, b) => a + b, 0) / activeMonths);
            const avgProf = Math.round(avgRev - avgCost);
            const status = avgProf > 0 ? "ต่อยอด" : "ไม่ต่อยอด";

            parsedSingleYear.push({
              empId,
              name,
              dept,
              group,
              role,
              monthlyRevenue: mRev,
              monthlyCost: mCost,
              monthlyProfit: mProf,
              avgRevenue: avgRev,
              avgCost,
              avgProfit: avgProf,
              status,
            });
          }

          if (parsedSingleYear.length > 0) {
            const targetY = uploadTargetYear === "BOTH_2568_2569" ? "2569" : uploadTargetYear;
            const nextStore = { ...yearlyStore, [targetY]: parsedSingleYear };
            setYearlyStore(nextStore);
            setSelectedYear(targetY);
            await persistYearToCloudflareD1(nextStore, targetY, parsedSingleYear);
            setImportStatusMsg(
              `บันทึกข้อมูลปี ${targetY} จำนวน ${parsedSingleYear.length} คน ลงฐานข้อมูล Cloudflare D1 สำเร็จ`
            );
          } else {
            setImportStatusMsg("ไม่พบข้อมูลพนักงานในไฟล์ที่อัปโหลด");
          }
        } else {
          // Corporate multi-column Job value.xlsx structure (supports extracting 2568, 2569, or saving into target year)
          let currentGrp = "";
          const recs2568: YearlyJobValueRecord[] = [];
          const recs2569: YearlyJobValueRecord[] = [];

          for (let r = 4; r < sheetData.length; r++) {
            const row = sheetData[r];
            if (!row || row.length === 0) continue;

            if (typeof row[0] === "string" && (row[1] === undefined || row[1] === null || row[1] === "")) {
              currentGrp = row[0].trim();
              continue;
            }

            if (row[1]) {
              const empId = String(row[1]).trim();
              const name = String(row[2] || "").trim();
              const dept = String(row[3] || "").trim();
              const group = currentGrp || "กลุ่ม O&M";
              const role = String(row[6] || "").trim();

              const mRev25: number[] = [];
              const mProf25: number[] = [];
              for (let c = 8; c <= 19; c++) mRev25.push(Math.round(Number(row[c]) || 0));
              for (let c = 21; c <= 32; c++) mProf25.push(Math.round(Number(row[c]) || 0));
              const mCost25 = mRev25.map((rv, i) =>
                rv === 0 && mProf25[i] === 0 ? 0 : Math.round(rv - mProf25[i])
              );
              const avgRev25 = Math.round(Number(row[20]) || 0);
              const avgProf25 = Math.round(Number(row[33]) || 0);

              recs2568.push({
                empId,
                name,
                dept,
                group,
                role,
                monthlyRevenue: mRev25,
                monthlyCost: mCost25,
                monthlyProfit: mProf25,
                avgRevenue: avgRev25,
                avgCost: Math.round(avgRev25 - avgProf25),
                avgProfit: avgProf25,
                status: avgProf25 > 0 ? "กำไรต่อยอด" : "ไม่ต่อยอด",
              });

              const mRev26: number[] = [];
              const mProf26: number[] = [];
              for (let c = 34; c <= 45; c++) mRev26.push(Math.round(Number(row[c]) || 0));
              for (let c = 47; c <= 58; c++) mProf26.push(Math.round(Number(row[c]) || 0));
              const mCost26 = mRev26.map((rv, i) =>
                rv === 0 && mProf26[i] === 0 ? 0 : Math.round(rv - mProf26[i])
              );
              const avgRev26 = Math.round(Number(row[46]) || 0);
              const avgProf26 = Math.round(Number(row[59]) || 0);
              const growthVal = Math.round(Number(row[61]) || avgProf26 - avgProf25);
              const status26 = String(row[75] || (growthVal > 0 ? "กำไรต่อยอด" : "ไม่ต่อยอด")).trim();

              recs2569.push({
                empId,
                name,
                dept,
                group,
                role,
                monthlyRevenue: mRev26,
                monthlyCost: mCost26,
                monthlyProfit: mProf26,
                avgRevenue: avgRev26,
                avgCost: Math.round(avgRev26 - avgProf26),
                avgProfit: avgProf26,
                status: status26,
              });
            }
          }

          if (recs2569.length > 0) {
            if (uploadTargetYear === "BOTH_2568_2569") {
              const nextStore = { ...yearlyStore, "2568": recs2568, "2569": recs2569 };
              setYearlyStore(nextStore);
              await persistYearToCloudflareD1(nextStore);
              setImportStatusMsg(
                `บันทึกข้อมูลแยกปี 2568 (${recs2568.length} คน) และปี 2569 (${recs2569.length} คน) ลง Cloudflare D1 สำเร็จ`
              );
            } else if (uploadTargetYear === "2568") {
              const nextStore = { ...yearlyStore, "2568": recs2568 };
              setYearlyStore(nextStore);
              setSelectedYear("2568");
              await persistYearToCloudflareD1(nextStore, "2568", recs2568);
              setImportStatusMsg(`บันทึกข้อมูลปี 2568 จำนวน ${recs2568.length} คน ลง Cloudflare D1 สำเร็จ`);
            } else {
              // Save into the selected target year (e.g. 2569, 2570, etc.)
              const has26Data = recs2569.some((r) => r.avgRevenue !== 0 || r.avgProfit !== 0);
              const chosenRecs = has26Data ? recs2569 : recs2568;
              const nextStore = { ...yearlyStore, [uploadTargetYear]: chosenRecs };
              setYearlyStore(nextStore);
              setSelectedYear(uploadTargetYear);
              await persistYearToCloudflareD1(nextStore, uploadTargetYear, chosenRecs);
              setImportStatusMsg(
                `บันทึกข้อมูลปี ${uploadTargetYear} จำนวน ${chosenRecs.length} คน ลง Cloudflare D1 สำเร็จ`
              );
            }
          } else {
            setImportStatusMsg("ไม่พบแถวข้อมูลพนักงานในไฟล์ที่เลือก");
          }
        }
      } catch (err: any) {
        console.error("Error importing file:", err);
        setImportStatusMsg("เกิดข้อผิดพลาดในการอ่านไฟล์: " + (err.message || "รูปแบบไม่ถูกต้อง"));
      } finally {
        setIsImporting(false);
        e.target.value = "";
      }
    };
    reader.readAsBinaryString(file);
  };

  // Delete a specific year in Cloudflare D1 (strictly Co-Admin / Admin only)
  const handleDeleteYearData = async (yearKeyToDelete: string) => {
    // 1. Immediately set the records of this year to empty array [] so it becomes 0 people
    const nextStore = { ...yearlyStore, [yearKeyToDelete]: [] };
    setYearlyStore(nextStore);

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(LOCAL_STORAGE_JV_KEY, JSON.stringify(nextStore));
      } catch {
        // ignore
      }
    }

    // 2. Persist deletion to Cloudflare D1 backend
    try {
      await fetch("/api/job-value-data", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ yearKey: yearKeyToDelete }),
      });
      // Also overwrite D1 key with empty array so auto-reseed doesn't trigger on refresh
      await fetch("/api/job-value-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          yearKey: yearKeyToDelete,
          records: [],
          updatedBy: currentUser?.username || currentUser?.name || "co-admin",
        }),
      });
      const nowStr = new Date().toLocaleTimeString("th-TH", { hour12: false });
      setLastD1SyncTime(nowStr);
    } catch {
      // ignore
    }

    setImportStatusMsg(`ลบข้อมูลปี ${yearKeyToDelete} ออกจาก Cloudflare D1 เรียบร้อยแล้ว (0 คน)`);
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
      if (processedData.monthlyProfitCompare && processedData.monthlyProfitCompare[i] !== null) {
        allVals.push(processedData.monthlyProfitCompare[i]!);
      }
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
    const compProfSeries = buildPath(processedData.monthlyProfitCompare || []);

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
      compProfSeries,
      ticks,
      getX,
    };
  }, [processedData]);

  const selectedPersonRank = useMemo(() => {
    if (processedData.viewMode === "PERSON" && empFilter !== "ALL") {
      return employeeRankings.get(empFilter);
    }
    return undefined;
  }, [processedData.viewMode, empFilter, employeeRankings]);

  const barChartGeometry = useMemo(() => {
    const width = 620;
    const height = 260;
    const padLeft = 66;
    const padRight = 20;
    const padTop = 28;
    const padBottom = 34;
    const plotW = width - padLeft - padRight;
    const plotH = height - padTop - padBottom;

    const items =
      processedData.viewMode === "PERSON" && selectedPersonRank && selectedPersonRank.deptPeers.length > 0
        ? selectedPersonRank.deptPeers
        : processedData.summaryData;
    const allVals: number[] = [0];
    items.forEach((d) => {
      allVals.push(d.profitCompare, d.profit);
    });

    const rawMin = Math.min(...allVals, 0);
    const rawMax = Math.max(...allVals, 10000);
    const padding = (rawMax - rawMin) * 0.14 || 10000;
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
  }, [processedData, selectedPersonRank]);

  return (
    <div className="w-full max-w-full min-w-0 space-y-6 font-sans text-[#0F172A]">
      {/* ===================================================================== */}
      {/* 1. DASHBOARD HEADER                                                   */}
      {/* ===================================================================== */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-[#E2E8F0] shadow-xs">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight">
              Dashboard รายงาน ต้นทุน รายได้ และกำไรต่อยอด Job value MARINE Logistics
            </h1>
          </div>
          <p className="text-sm text-[#334155] mt-1">
            รายงานมูลค่า Job Value และประสิทธิภาพการทำงาน ปี {selectedYear}
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

          {/* Refresh Data */}
          <button
            type="button"
            onClick={fetchFromCloudflareD1}
            className="px-4 py-2.5 bg-white hover:bg-[#F1F5F9] text-[#334155] border border-[#E2E8F0] rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-2xs"
          >
            <RefreshCw className={`w-4 h-4 text-[#0E3A66] ${isRefreshing || isSyncingD1 ? "animate-spin" : ""}`} />
            <span>รีเฟรชข้อมูล</span>
          </button>

          {/* Per-Year Upload Panel Toggle - strictly Co-Admin / Admin only */}
          {canManageD1Upload && (
            <button
              type="button"
              onClick={() => setShowUploadPanel((prev) => !prev)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 border shadow-2xs ${
                showUploadPanel
                  ? "bg-[#0E3A66] text-white border-[#0E3A66]"
                  : "bg-[#15803D] hover:bg-[#166534] text-white border-[#15803D]"
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>อัปโหลดข้อมูลแยกปี</span>
            </button>
          )}
        </div>
      </header>

      {/* ===================================================================== */}
      {/* PER-YEAR UPLOAD & STORAGE MANAGEMENT PANEL                           */}
      {/* ===================================================================== */}
      {canManageD1Upload && showUploadPanel && (
        <div className="bg-white p-5 sm:p-6 rounded-2xl border-2 border-[#0E3A66] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E2E8F0]">
            <div>
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-[#0E3A66]" />
                <h2 className="text-sm sm:text-base font-extrabold text-[#0E3A66]">
                  ระบบจัดเก็บและอัปโหลดข้อมูล Job Value แยกตามปี
                </h2>
              </div>
              <p className="text-xs text-[#475569] mt-0.5">
                เลือกปีที่ต้องการอัปโหลดไฟล์ Excel (.xlsx) หรือ CSV ระบบจะจัดเก็บแยกตามปีโดยไม่ต้องเชื่อมต่อ Google Sheets
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowUploadPanel(false)}
              className="self-end sm:self-auto p-1.5 rounded-lg text-[#64748B] hover:bg-[#F1F5F9] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
            {/* Step 1: Select Target Year to Upload */}
            <div className="lg:col-span-4">
              <label
                htmlFor="upload-target-year"
                className="block text-xs font-bold text-[#334155] uppercase tracking-wider mb-1.5"
              >
                1. เลือกปีที่ต้องการอัปโหลดเข้าฐานข้อมูล
              </label>
              <select
                id="upload-target-year"
                aria-label="เลือกปีที่ต้องการอัปโหลดเข้าฐานข้อมูล"
                value={uploadTargetYear}
                onChange={(e) => setUploadTargetYear(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#0E3A66] bg-[#F8FAFC] text-sm font-bold text-[#0E3A66] cursor-pointer"
              >
                <option value="2567">เฉพาะปี 2567 (2024)</option>
                <option value="2568">เฉพาะปี 2568 (2025)</option>
                <option value="2569">เฉพาะปี 2569 (2026)</option>
                <option value="2570">เฉพาะปี 2570 (2027)</option>
                <option value="2571">เฉพาะปี 2571 (2028)</option>
                <option value="BOTH_2568_2569">อัปโหลดไฟล์รวม 2 ปี (2568 + 2569 จาก Job value.xlsx)</option>
              </select>
            </div>

            {/* Step 2: Download Template for Target Year */}
            <div className="lg:col-span-4">
              <label className="block text-xs font-bold text-[#334155] uppercase tracking-wider mb-1.5">
                2. แม่แบบไฟล์รายปี (CSV Template)
              </label>
              <button
                type="button"
                onClick={() =>
                  handleDownloadYearlyTemplate(
                    uploadTargetYear === "BOTH_2568_2569" ? selectedYear : uploadTargetYear
                  )
                }
                className="w-full px-4 py-2.5 bg-[#F8FAFC] hover:bg-[#E8F3FA] text-[#0E3A66] border border-[#CBD5E1] rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <FileSpreadsheet className="w-4 h-4 text-[#0E3A66]" />
                <span>
                  ดาวน์โหลดแม่แบบ CSV ปี{" "}
                  {uploadTargetYear === "BOTH_2568_2569" ? selectedYear : uploadTargetYear}
                </span>
              </button>
            </div>

            {/* Step 3: Upload Excel / CSV File for Selected Year */}
            <div className="lg:col-span-4">
              <label className="block text-xs font-bold text-[#334155] uppercase tracking-wider mb-1.5">
                3. เลือกไฟล์เพื่อบันทึกข้อมูล
              </label>
              <label className="w-full px-4 py-2.5 bg-[#0E3A66] hover:bg-[#17538F] text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-2xs">
                <Upload className="w-4 h-4 text-white" />
                <span>
                  {isImporting
                    ? "กำลังบันทึกข้อมูล..."
                    : `เลือกไฟล์อัปโหลดลงปี ${
                        uploadTargetYear === "BOTH_2568_2569" ? "2568+2569" : uploadTargetYear
                      }`}
                </span>
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileUploadForYear}
                  className="hidden"
                  disabled={isImporting}
                />
              </label>
            </div>
          </div>

          {/* Stored Years Inventory in Cloudflare D1 */}
          <div className="pt-3 border-t border-[#E2E8F0] flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-[#475569]">ข้อมูลรายปีที่จัดเก็บในระบบ:</span>
              {storedYearKeys.map((yKey) => {
                const count = yearlyStore[yKey]?.length || 0;
                const isSelected = selectedYear === yKey;
                return (
                  <div
                    key={yKey}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-bold transition-all ${
                      isSelected
                        ? "bg-[#0E3A66] text-white border-[#0E3A66]"
                        : count > 0
                        ? "bg-[#F0F7FF] text-[#0E3A66] border-[#93C5FD]"
                        : "bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0]"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedYear(yKey)}
                      className="cursor-pointer flex items-center gap-1"
                    >
                      <Calendar className="w-3 h-3" />
                      <span>ปี {yKey}</span>
                      <span className="font-mono text-[10px] opacity-85">({count} คน)</span>
                    </button>
                    {count > 0 && canManageD1Upload && (
                      <button
                        type="button"
                        onClick={() => handleDeleteYearData(yKey)}
                        className="ml-1 hover:text-[#FDA4AF] cursor-pointer"
                        title={`ลบข้อมูลปี ${yKey} (0 คน)`}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {importStatusMsg && (
        <div className="p-3.5 bg-[#EBF7F2] border border-[#B7E4CE] rounded-xl text-xs font-bold text-[#15803D] flex items-center justify-between">
          <span>{importStatusMsg}</span>
          <button
            type="button"
            onClick={() => setImportStatusMsg("")}
            className="text-[#15803D] hover:opacity-75 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 2. FILTERS BAR CARD (ปีที่แสดงผล + หน่วยงาน/แผนก + รายชื่อพนักงาน + ล้างค่า) */}
      {/* ===================================================================== */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E2E8F0] shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-end">
          {/* Year Selector (Main Year) */}
          <div className="lg:col-span-2">
            <label
              htmlFor="filter-year"
              className="block text-xs font-bold text-[#334155] uppercase tracking-wider mb-1.5"
            >
              ปีที่วิเคราะห์หลัก
            </label>
            <select
              id="filter-year"
              aria-label="ปีที่วิเคราะห์หลัก"
              value={selectedYear}
              onChange={(e) => handleSelectedYearChange(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-[#CBD5E1] bg-white text-sm font-bold text-[#0E3A66] cursor-pointer focus:outline-none focus:border-[#0E3A66]"
            >
              {storedYearKeys.map((y) => (
                <option key={y} value={y}>
                  ปี {y}
                </option>
              ))}
            </select>
          </div>

          {/* Compare Year Selector */}
          <div className="lg:col-span-2">
            <label
              htmlFor="filter-compare-year"
              className="block text-xs font-bold text-[#334155] uppercase tracking-wider mb-1.5"
            >
              เทียบกับปี
            </label>
            <select
              id="filter-compare-year"
              aria-label="เทียบกับปี"
              value={compareYear}
              onChange={(e) => handleCompareYearChange(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-[#CBD5E1] bg-white text-sm font-bold text-[#334155] cursor-pointer focus:outline-none focus:border-[#0E3A66]"
            >
              {storedYearKeys.map((y) => (
                <option key={y} value={y}>
                  ปี {y}{y === selectedYear ? " [ปีหลัก]" : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Group / หน่วยงาน Filter */}
          <div className="lg:col-span-2">
            <label
              htmlFor="filter-group"
              className="block text-xs font-bold text-[#334155] uppercase tracking-wider mb-1.5"
            >
              หน่วยงาน (สายงาน)
            </label>
            <select
              id="filter-group"
              aria-label="หน่วยงาน (สายงาน)"
              value={groupFilter}
              onChange={(e) => handleGroupChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] bg-white text-sm font-bold text-[#0F172A] cursor-pointer focus:outline-none focus:border-[#0E3A66]"
            >
              <option value="ALL">ทุกหน่วยงาน</option>
              {groupOptions.map((grp) => (
                <option key={grp} value={grp}>
                  {grp}
                </option>
              ))}
            </select>
          </div>

          {/* Department Filter */}
          <div className="lg:col-span-2">
            <label
              htmlFor="filter-dept"
              className="block text-xs font-bold text-[#334155] uppercase tracking-wider mb-1.5"
            >
              แผนก
            </label>
            <select
              id="filter-dept"
              aria-label="หน่วยงาน / แผนก"
              value={deptFilter}
              onChange={(e) => handleDeptChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] bg-white text-sm font-bold text-[#0F172A] cursor-pointer focus:outline-none focus:border-[#0E3A66]"
            >
              <option value="ALL">ทุกแผนก</option>
              {departmentOptions.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Employee Filter */}
          <div className="lg:col-span-2">
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
              <option value="ALL">ทุกคนในกลุ่มที่เลือก</option>
              {employeeOptions.map((emp) => {
                const pos = getEmployeePositionLabel(emp);
                return (
                  <option key={emp.empId} value={emp.empId}>
                    {emp.name}{pos ? ` (${pos})` : ""}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Action Buttons: Reset Filters */}
          <div className="lg:col-span-2 flex flex-col gap-1.5 justify-end">
            <button
              type="button"
              onClick={handleResetFilters}
              className="w-full px-3 py-2.5 bg-white hover:bg-[#F1F5F9] text-[#334155] border border-[#CBD5E1] rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#475569]" />
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
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E2E8F0] shadow-xs flex flex-col justify-between">
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
            <span>รายได้เฉลี่ยรายเดือน (ปี {selectedYear})</span>
          </div>
        </div>

        {/* Card 2: Expenses (Avg) */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E2E8F0] shadow-xs flex flex-col justify-between">
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
            <span>ต้นทุนเฉลี่ยรายเดือน (ปี {selectedYear})</span>
          </div>
        </div>

        {/* Card 3: Profit (Avg) */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E2E8F0] border-l-4 border-l-[#0E3A66] shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-[#E8F3FA] text-[#0E3A66] flex items-center justify-center mb-4 border border-[#9FCEE8]">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div className="text-xs font-bold text-[#475569] uppercase tracking-wider mb-1">
              Profit (Avg)
            </div>
            <div
              id="kpi-total-profit"
              className="text-2xl sm:text-3xl font-extrabold text-[#0E3A66] font-mono tabular-nums mb-2"
            >
              {formatInt(processedData.totalProfit)}
            </div>
          </div>
          <div id="kpi-growth-compare" className="text-xs font-bold text-[#475569] flex flex-wrap items-center gap-2">
            <span>
              ปี {compareYear}: {formatInt(processedData.totalProfitCompare)}
            </span>
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
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E2E8F0] shadow-xs flex flex-col justify-between">
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Left Chart: แนวโน้มกำไรรายเดือน (Monthly Trend) */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden flex flex-col h-full">
          <div className="px-5 py-3.5 border-b border-[#E2E8F0] min-h-[76px] flex flex-col justify-center gap-1.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 font-bold text-base text-[#0F172A]">
                <LineChartIcon className="w-5 h-5 text-[#0E3A66] shrink-0" />
                <span>
                  แนวโน้มกำไรรายเดือน (Monthly Trend · ปี {selectedYear}
                  {selectedYear !== compareYear ? ` เทียบ ปี ${compareYear}` : ""})
                </span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs font-bold">
              <span className="flex items-center gap-1.5 text-[#0E3A66]">
                <span className="w-3 h-1 rounded bg-[#0E3A66] inline-block" />
                <span>รายได้ ({selectedYear.slice(-2)})</span>
              </span>
              <span className="flex items-center gap-1.5 text-[#BE123C]">
                <span className="w-3 h-0.5 border-b-2 border-dashed border-[#BE123C] inline-block" />
                <span>ต้นทุน ({selectedYear.slice(-2)})</span>
              </span>
              <span className="flex items-center gap-1.5 text-[#15803D]">
                <span className="w-3 h-1.5 rounded bg-[#15803D] inline-block" />
                <span>กำไรสุทธิ ({selectedYear.slice(-2)})</span>
              </span>
              {selectedYear !== compareYear && (
                <span className="flex items-center gap-1.5 text-[#64748B]">
                  <span className="w-3 h-0.5 border-b-2 border-dashed border-[#94A3B8] inline-block" />
                  <span>กำไร ({compareYear.slice(-2)})</span>
                </span>
              )}
            </div>
          </div>

          <div className="p-5 relative flex-1 flex flex-col justify-between">
            <svg
              viewBox={`0 0 ${lineChartGeometry.width} ${lineChartGeometry.height}`}
              className="w-full h-[270px] overflow-visible select-none"
              role="img"
              aria-label="กราฟแนวโน้มกำไรรายเดือน"
            >
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

              {lineChartGeometry.profSeries.area && (
                <path
                  d={lineChartGeometry.profSeries.area}
                  fill="rgba(21, 128, 61, 0.10)"
                />
              )}

              {lineChartGeometry.compProfSeries?.path && selectedYear !== compareYear && (
                <path
                  d={lineChartGeometry.compProfSeries.path}
                  fill="none"
                  stroke="#94A3B8"
                  strokeWidth={2}
                  strokeDasharray="4,4"
                />
              )}

              {lineChartGeometry.revSeries.path && (
                <path
                  d={lineChartGeometry.revSeries.path}
                  fill="none"
                  stroke="#0E3A66"
                  strokeWidth={2}
                />
              )}

              {lineChartGeometry.costSeries.path && (
                <path
                  d={lineChartGeometry.costSeries.path}
                  fill="none"
                  stroke="#BE123C"
                  strokeWidth={2}
                  strokeDasharray="5,5"
                />
              )}

              {lineChartGeometry.profSeries.path && (
                <path
                  d={lineChartGeometry.profSeries.path}
                  fill="none"
                  stroke="#15803D"
                  strokeWidth={3}
                />
              )}

              {SHORT_MONTH_LABELS.map((mLabel, idx) => {
                const x = lineChartGeometry.getX(idx);
                const revPt = lineChartGeometry.revSeries.pts.find((p) => p.idx === idx);
                const costPt = lineChartGeometry.costSeries.pts.find((p) => p.idx === idx);
                const profPt = lineChartGeometry.profSeries.pts.find((p) => p.idx === idx);
                const compProfPt = lineChartGeometry.compProfSeries?.pts.find((p) => p.idx === idx);
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
                    {compProfPt && selectedYear !== compareYear && (
                      <circle
                        cx={compProfPt.x}
                        cy={compProfPt.y}
                        r={isHovered ? 4.5 : 2.5}
                        fill="#94A3B8"
                        stroke="#FFFFFF"
                        strokeWidth={1.5}
                      />
                    )}
                    {revPt && (
                      <circle
                        cx={revPt.x}
                        cy={revPt.y}
                        r={isHovered ? 5 : 3}
                        fill="#0E3A66"
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
                        fill="#15803D"
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
                    <rect
                      x={x - (lineChartGeometry.plotW / 12) / 2}
                      y={lineChartGeometry.padTop}
                      width={lineChartGeometry.plotW / 12}
                      height={lineChartGeometry.plotH + 20}
                      fill="transparent"
                      pointerEvents="all"
                    />
                  </g>
                );
              })}
            </svg>

            <div className="mt-2 px-3.5 py-2.5 rounded-xl bg-[#0F172A] text-white text-xs flex items-center justify-between gap-3 font-mono h-11 min-h-[44px]">
              {hoveredMonthIdx !== null &&
              (processedData.monthlyRevenue[hoveredMonthIdx] !== null ||
                (processedData.monthlyProfitCompare &&
                  processedData.monthlyProfitCompare[hoveredMonthIdx] !== null)) ? (
                <>
                  <span className="font-sans font-bold text-[#93C5FD]">
                    เดือน {SHORT_MONTH_LABELS[hoveredMonthIdx]}
                  </span>
                  <span>
                    รายได้ {selectedYear.slice(-2)}:{" "}
                    {formatInt(processedData.monthlyRevenue[hoveredMonthIdx])}
                  </span>
                  <span>
                    ต้นทุน {selectedYear.slice(-2)}:{" "}
                    {formatInt(processedData.monthlyCost[hoveredMonthIdx])}
                  </span>
                  <span className="font-bold text-[#6EE7B7]">
                    กำไร {selectedYear.slice(-2)}:{" "}
                    {formatInt(processedData.monthlyProfit[hoveredMonthIdx])}
                  </span>
                  {selectedYear !== compareYear && (
                    <span className="text-[#CBD5E1]">
                      กำไร {compareYear.slice(-2)}:{" "}
                      {formatInt(processedData.monthlyProfitCompare[hoveredMonthIdx])}
                    </span>
                  )}
                </>
              ) : (
                <span className="font-sans text-xs text-[#94A3B8] truncate">
                  เลื่อนเมาส์บนเส้นกราฟเพื่อดูรายละเอียดเปรียบเทียบรายได้ ต้นทุน และกำไรสุทธิแต่ละเดือน
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Chart: เปรียบเทียบกำไร (Yearly Comparison) - Always visible including PERSON mode */}
        <div
          id="compare-container"
          className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden flex flex-col h-full"
        >
          <div className="px-5 py-3.5 border-b border-[#E2E8F0] min-h-[76px] flex flex-col justify-center gap-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 font-bold text-base text-[#0F172A]">
                <BarChart3 className="w-5 h-5 text-[#0E3A66] shrink-0" />
                <span>เปรียบเทียบกำไร (Yearly Comparison)</span>
              </div>
              {selectedPersonRank && (
                <div id="person-rank-summary" className="flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="px-2.5 py-1 rounded-md bg-[#F8FAFC] text-[#0F172A] border border-[#E2E8F0] font-bold">
                    {selectedPersonRank.name}
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-[#E8F3FA] text-[#0E3A66] border border-[#9FCEE8] font-bold font-mono">
                    กลุ่ม {selectedPersonRank.dept}: อันดับ {selectedPersonRank.deptRank}/{selectedPersonRank.deptTotal}
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-[#EBF7F2] text-[#15803D] border border-[#B7E4CE] font-bold font-mono">
                    หน่วยงาน {selectedPersonRank.group}: อันดับ {selectedPersonRank.groupRank}/{selectedPersonRank.groupTotal}
                  </span>
                </div>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs font-bold">
              <span className="flex items-center gap-1.5 text-[#64748B]">
                <span className="w-3 h-3 rounded-xs bg-[#94A3B8] inline-block" />
                <span>กำไร {compareYear.slice(-2)}</span>
              </span>
              <span className="flex items-center gap-1.5 text-[#0E3A66]">
                <span className="w-3 h-3 rounded-xs bg-[#0E3A66] inline-block" />
                <span>กำไร {selectedYear.slice(-2)}</span>
              </span>
            </div>
          </div>

          <div className="p-5 relative flex-1 flex flex-col justify-between">
            <svg
              viewBox={`0 0 ${barChartGeometry.width} ${barChartGeometry.height}`}
              className="w-full h-[270px] overflow-visible select-none"
              role="img"
              aria-label="กราฟเปรียบเทียบกำไรรายปี"
            >
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

              {barChartGeometry.items.map((item, idx) => {
                const count = Math.max(barChartGeometry.items.length, 1);
                const groupW = barChartGeometry.plotW / count;
                const centerX = barChartGeometry.padLeft + idx * groupW + groupW / 2;
                const barW = Math.min(22, Math.max(8, groupW * 0.32));

                const yComp = barChartGeometry.getY(item.profitCompare);
                const yCurr = barChartGeometry.getY(item.profit);
                const zeroY = barChartGeometry.zeroY;

                const topComp = Math.min(yComp, zeroY);
                const hComp = Math.max(2, Math.abs(zeroY - yComp));

                const topCurr = Math.min(yCurr, zeroY);
                const hCurr = Math.max(2, Math.abs(zeroY - yCurr));

                const isSelectedPerson =
                  processedData.viewMode === "PERSON" && item.empId === empFilter;
                const barOpacity =
                  processedData.viewMode === "PERSON" && !isSelectedPerson ? 0.42 : 1;

                const rawLabel =
                  processedData.viewMode === "PERSON" || deptFilter !== "ALL"
                    ? `#${idx + 1} ${item.name.split(" ")[0]}`
                    : item.name;
                const shortLabel =
                  rawLabel.length > 12 ? rawLabel.slice(0, 11) + ".." : rawLabel;

                return (
                  <g
                    key={item.key}
                    onClick={() => {
                      if (deptFilter === "ALL" && groupFilter === "ALL" && !item.empId) {
                        handleGroupChange(item.name);
                      } else if (deptFilter === "ALL" && !item.empId) {
                        handleDeptChange(item.name);
                      } else if (item.empId) {
                        if (empFilter !== item.empId) {
                          handleEmpChange(item.empId);
                        } else if (onOpenEmployeeDetails) {
                          onOpenEmployeeDetails({ empId: item.empId, name: item.name });
                        }
                      }
                    }}
                    onMouseEnter={() => setHoveredBarIdx(idx)}
                    onMouseLeave={() => setHoveredBarIdx(null)}
                    className="cursor-pointer"
                  >
                    {/* Highlight backdrop when this bar belongs to the selected person */}
                    {isSelectedPerson && (
                      <rect
                        x={barChartGeometry.padLeft + idx * groupW + 2}
                        y={barChartGeometry.padTop - 4}
                        width={Math.max(groupW - 4, 16)}
                        height={barChartGeometry.plotH + 4}
                        rx={6}
                        fill="#E8F3FA"
                        stroke="#9FCEE8"
                        strokeWidth={1}
                      />
                    )}

                    {/* Transparent full-column hit target */}
                    <rect
                      x={barChartGeometry.padLeft + idx * groupW}
                      y={barChartGeometry.padTop}
                      width={groupW}
                      height={barChartGeometry.plotH + 20}
                      fill="transparent"
                      pointerEvents="all"
                    />
                    <rect
                      x={centerX - barW - 2}
                      y={topComp}
                      width={barW}
                      height={hComp}
                      rx={2}
                      fill="#94A3B8"
                      opacity={barOpacity}
                    />
                    <rect
                      x={centerX + 2}
                      y={topCurr}
                      width={barW}
                      height={hCurr}
                      rx={2}
                      fill={item.profit >= 0 ? "#0E3A66" : "#BE123C"}
                      opacity={barOpacity}
                    />
                    {isSelectedPerson && (
                      <text
                        x={centerX}
                        y={Math.min(topCurr, topComp) - 6}
                        textAnchor="middle"
                        className="fill-[#0E3A66] font-mono text-[10px] font-extrabold"
                      >
                        #{idx + 1}
                      </text>
                    )}
                    <text
                      x={centerX}
                      y={barChartGeometry.height - 10}
                      textAnchor="middle"
                      className={`font-sans text-[10px] ${
                        isSelectedPerson
                          ? "fill-[#0E3A66] font-extrabold"
                          : "fill-[#334155] font-bold"
                      }`}
                    >
                      {shortLabel}
                    </text>
                  </g>
                );
              })}
            </svg>

            <div className="mt-2 px-3.5 py-2.5 rounded-xl bg-[#0F172A] text-white text-xs flex items-center justify-between gap-3 font-mono h-11 min-h-[44px]">
              {hoveredBarIdx !== null && barChartGeometry.items[hoveredBarIdx] ? (
                <>
                  <span className="font-sans font-bold text-[#93C5FD]">
                    {barChartGeometry.items[hoveredBarIdx].deptRank
                      ? `อันดับ #${barChartGeometry.items[hoveredBarIdx].deptRank} · `
                      : ""}
                    {barChartGeometry.items[hoveredBarIdx].name}
                  </span>
                  <span>
                    กำไรปี {compareYear}: {formatInt(barChartGeometry.items[hoveredBarIdx].profitCompare)} บาท
                  </span>
                  <span className="font-bold text-[#6EE7B7]">
                    กำไรปี {selectedYear}: {formatInt(barChartGeometry.items[hoveredBarIdx].profit)} บาท
                  </span>
                </>
              ) : (
                <span className="font-sans text-xs text-[#94A3B8] truncate">
                  {selectedPersonRank
                    ? `พนักงาน ${selectedPersonRank.name}: อันดับที่ ${selectedPersonRank.deptRank}/${selectedPersonRank.deptTotal} ในแผนก ${selectedPersonRank.dept} · อันดับที่ ${selectedPersonRank.groupRank}/${selectedPersonRank.groupTotal} ในหน่วยงาน ${selectedPersonRank.group}`
                    : "เลื่อนเมาส์บนแท่งกราฟเพื่อดูรายละเอียดเปรียบเทียบกำไรรายปี"}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 5. SUMMARY TABLE CARD (รายละเอียดผลงานตามกลุ่มตัวอย่าง)                  */}
      {/* ===================================================================== */}
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
              {processedData.viewMode === "PERSON" && selectedPersonRank
                ? `แสดงข้อมูลพนักงานที่เลือก: ${selectedPersonRank.name} — อันดับที่ ${selectedPersonRank.deptRank}/${selectedPersonRank.deptTotal} ของกลุ่มแผนก ${selectedPersonRank.dept} และอันดับที่ ${selectedPersonRank.groupRank}/${selectedPersonRank.groupTotal} ของหน่วยงาน ${selectedPersonRank.group}`
                : deptFilter !== "ALL"
                ? `แสดงรายชื่อพนักงานในกลุ่มที่เลือก (${processedData.summaryData.length} คน) — คลิกที่แถวพนักงานเพื่อดูเปรียบเทียบและอันดับรายบุคคล`
                : groupFilter !== "ALL"
                ? `แสดงสรุปแยกตามแผนกย่อยใน ${groupFilter} (${processedData.summaryData.length} แผนก) — คลิกที่แถวแผนกเพื่อดูรายบุคคล`
                : `สรุปภาพรวมแยกตามหน่วยงาน (${processedData.summaryData.length} หน่วยงาน) — คลิกที่แถวหน่วยงานเพื่อดูแผนกย่อย`}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {/* Back Button (ย้อนกลับ) */}
            <button
              type="button"
              onClick={handleGoBack}
              disabled={!isDrilledDown}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-2xs ${
                isDrilledDown
                  ? "bg-white hover:bg-[#F1F5F9] text-[#0E3A66] border border-[#CBD5E1] cursor-pointer"
                  : "bg-[#F8FAFC] text-[#94A3B8] border border-[#E2E8F0] cursor-not-allowed opacity-50"
              }`}
              title={
                isDrilledDown
                  ? empFilter !== "ALL"
                    ? `ย้อนกลับไปแผนก ${deptFilter !== "ALL" ? deptFilter : selectedPersonRank?.dept || ""}`
                    : deptFilter !== "ALL"
                    ? `ย้อนกลับไปสายงาน ${groupFilter}`
                    : "ย้อนกลับไปภาพรวมหน่วยงาน"
                  : "อยู่ที่ระดับภาพรวมสูงสุดแล้ว"
              }
            >
              <ArrowLeft className="w-4 h-4" />
              <span>ย้อนกลับ</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadSummaryCsv}
              className="px-4 py-2.5 bg-[#0E3A66] hover:bg-[#17538F] text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-2xs"
            >
              <Download className="w-4 h-4" />
              <span>Export Job Value ปี {selectedYear}</span>
            </button>

            {/* Direct Import Button right alongside Export Button */}
            {canManageD1Upload && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setUploadTargetYear(selectedYear);
                    fileInputDirectRef.current?.click();
                  }}
                  className="px-4 py-2.5 bg-[#15803D] hover:bg-[#166534] text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-2xs"
                  title={`นำเข้าข้อมูลไฟล์ Excel หรือ CSV เข้าปี ${selectedYear}`}
                >
                  <Upload className="w-4 h-4" />
                  <span>Import Job Value ปี {selectedYear}</span>
                </button>
                <input
                  type="file"
                  ref={fileInputDirectRef}
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileUploadForYear}
                  className="hidden"
                />
              </>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] border-b-2 border-[#E2E8F0] text-xs font-bold text-[#334155] uppercase tracking-wider">
                <th className="py-3.5 px-5 text-center w-20">ลำดับ</th>
                <th className="py-3.5 px-5">
                  {deptFilter !== "ALL" || processedData.viewMode === "PERSON"
                    ? "ชื่อพนักงาน"
                    : groupFilter !== "ALL"
                    ? "แผนก"
                    : "หน่วยงาน (สายงาน)"}
                </th>
                <th className="py-3.5 px-5 text-right">รายได้ (เฉลี่ย)</th>
                <th className="py-3.5 px-5 text-right">ต้นทุน (เฉลี่ย)</th>
                <th className="py-3.5 px-5 text-right">กำไรเฉลี่ยปี {compareYear}</th>
                <th className="py-3.5 px-5 text-right">กำไรเฉลี่ยปี {selectedYear}</th>
                <th className="py-3.5 px-5 text-right">ผลต่าง (ปี {selectedYear} - {compareYear})</th>
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
                      if (deptFilter === "ALL" && groupFilter === "ALL" && !item.empId) {
                        handleGroupChange(item.name);
                      } else if (deptFilter === "ALL" && !item.empId) {
                        handleDeptChange(item.name);
                      } else if (item.empId) {
                        if (empFilter !== item.empId) {
                          handleEmpChange(item.empId);
                        } else if (onOpenEmployeeDetails) {
                          onOpenEmployeeDetails({ empId: item.empId, name: item.name });
                        }
                      }
                    }}
                    className="even:bg-[#F8FAFC] hover:bg-[#E8F3FA]/60 transition-colors cursor-pointer"
                  >
                    <td className="py-3.5 px-5 text-center font-mono text-[#334155]">
                      {item.deptRank || idx + 1}
                    </td>
                    <td className="py-3.5 px-5 font-bold text-[#0F172A]">
                      <div className="flex flex-wrap items-center gap-2">
                        <span>{item.name}</span>
                        {/* แสดงจำนวนคนเฉพาะตอนลงดีเทลแต่ละแผนก */}
                        {groupFilter !== "ALL" && deptFilter === "ALL" && !item.empId && (
                          <span className="px-2 py-0.5 rounded-full bg-[#E2E8F0] text-[#334155] text-[11px] font-mono">
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
                      {formatInt(item.profitCompare)}
                    </td>
                    <td className="py-3.5 px-5 text-right font-mono font-extrabold text-[#0E3A66] tabular-nums">
                      {formatInt(item.profit)}
                    </td>
                    {(() => {
                      const diff = item.profit - item.profitCompare;
                      return (
                        <td
                          className={`py-3.5 px-5 text-right font-mono font-bold tabular-nums ${
                            diff > 0
                              ? "text-[#15803D]"
                              : diff < 0
                              ? "text-[#BE123C]"
                              : "text-[#64748B]"
                          }`}
                        >
                          {formatSignedInt(diff)}
                        </td>
                      );
                    })()}
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
              {processedData.summaryData.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-sm font-bold text-[#64748B]">
                    ยังไม่มีข้อมูลของปี {selectedYear}
                    {canManageD1Upload && (
                      <span> — กดปุ่ม &ldquo;อัปโหลดข้อมูลแยกปี&rdquo; ด้านบนเพื่อเพิ่มข้อมูลปี {selectedYear}</span>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
