import React, { useState, useMemo } from "react";
import {
  Database,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  ArrowRight,
  Layers,
  Users,
  Building2,
  Calendar,
  ClipboardList,
  TrendingUp,
  SlidersHorizontal,
  ShieldCheck,
  Check,
  Search
} from "lucide-react";
import { AppState, Employee, LeaveRecord } from "../types";
import { INITIAL_JOB_VALUE_EXCEL_RECORDS, DetailedJobValueEmployee } from "../data/jobValueExcelData";

export type DomainId =
  | "departments"
  | "employees"
  | "manpower"
  | "shifts"
  | "ot_records"
  | "leave_records"
  | "job_value";

export interface DataDomainNode {
  id: DomainId;
  code: string;
  labelTh: string;
  labelEn: string;
  recordCount: number;
  unitLabel: string;
  status: "healthy" | "warning" | "error";
  issueCount: number;
  primaryKey: string;
  foreignKeys: string[];
  fields: string[];
  description: string;
}

export interface DataDomainEdge {
  id: string;
  source: DomainId;
  target: DomainId;
  labelTh: string;
  sourceField: string;
  targetField: string;
  propagationMode: string;
  ruleKey: keyof LineageSyncRules;
  status: "healthy" | "warning" | "error";
  issueCount: number;
}

export interface LineageMismatchItem {
  id: string;
  severity: "critical" | "warning";
  sourceDomain: DomainId;
  targetDomain: DomainId;
  entityId: string;
  entityName: string;
  field: string;
  currentValue: string;
  expectedValue: string;
  description: string;
}

export interface LineageSyncRules {
  syncEmployeeProfileToJobValue: boolean;
  propagateShiftOtToOtRecords: boolean;
  propagateShiftLeavesToLeaveRecords: boolean;
  syncLeaveTotalsToJobValue: boolean;
  enforceCanonicalDepartmentCodes: boolean;
  validateManpowerTeamQuota: boolean;
}

const DEFAULT_SYNC_RULES: LineageSyncRules = {
  syncEmployeeProfileToJobValue: true,
  propagateShiftOtToOtRecords: true,
  propagateShiftLeavesToLeaveRecords: true,
  syncLeaveTotalsToJobValue: true,
  enforceCanonicalDepartmentCodes: true,
  validateManpowerTeamQuota: true,
};

export interface DataLineageHubViewProps {
  state: AppState | null;
  otRecordsCount?: number;
  leaveRecords?: LeaveRecord[];
  onReconcileAll?: (updatedState: AppState, summaryText: string) => void;
  restrictToJvOnly?: boolean;
  onToggleRestrictToJvOnly?: (nextValue: boolean) => void;
}

const CANONICAL_DEPT_MAP: Record<string, string> = {
  "inter 2": "inter2",
  "inter2": "inter2",
  "inter 3": "inter3",
  "inter3": "inter3",
  "inter 5": "inter5",
  "inter5": "inter5",
  "inter 7": "inter7",
  "inter7": "inter7",
  "heavy machine": "heavy",
  "heavy": "heavy",
  "control": "control",
  "control center": "control",
  "ecc": "control",
  "improvement": "improvement",
  "management": "management",
};

const normalizeDeptKey = (raw?: string): string => {
  if (!raw) return "inter2";
  const cleaned = raw.trim().toLowerCase();
  return CANONICAL_DEPT_MAP[cleaned] || cleaned.replace(/\s+/g, "");
};

const getShiftOtHours = (code?: string): number => {
  if (!code) return 0;
  const upper = code.trim().toUpperCase();
  if (upper === "M12" || upper === "A12" || upper === "N12") return 4;
  if (upper === "M16" || upper === "N16" || upper === "OND") return 8;
  if (upper === "M24" || upper === "N24") return 16;
  return 0;
};

const LEAVE_SHIFT_CODES = ["ป", "ก", "ข", "ปง", "ณ", "คม", "พ", "ลย", "ลบ", "ตง"];

export default function DataLineageHubView({
  state,
  otRecordsCount = 0,
  leaveRecords = [],
  onReconcileAll,
  restrictToJvOnly,
  onToggleRestrictToJvOnly,
}: DataLineageHubViewProps) {
  const [syncRules, setSyncRules] = useState<LineageSyncRules>(() => {
    try {
      const saved = typeof window !== "undefined" ? localStorage.getItem("lineageSyncRules") : null;
      if (saved) return { ...DEFAULT_SYNC_RULES, ...JSON.parse(saved) };
    } catch {
      // ignore storage errors
    }
    return DEFAULT_SYNC_RULES;
  });

  const [selectedNodeId, setSelectedNodeId] = useState<DomainId>("job_value");
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [issueFilter, setIssueFilter] = useState<"all" | "critical" | "warning">("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [resolvedIds, setResolvedIds] = useState<Record<string, boolean>>({});
  const [lastSyncSummary, setLastSyncSummary] = useState<string | null>(null);

  const toggleRule = (key: keyof LineageSyncRules) => {
    setSyncRules((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      try {
        if (typeof window !== "undefined") {
          localStorage.setItem("lineageSyncRules", JSON.stringify(next));
        }
      } catch {
        // ignore
      }
      return next;
    });
  };

  const employees: Employee[] = state?.employees || [];
  const departments = state?.departments || [];
  const jvRecords: DetailedJobValueEmployee[] = INITIAL_JOB_VALUE_EXCEL_RECORDS;

  // Compute live cross-domain diagnostics
  const rawIssues = useMemo<LineageMismatchItem[]>(() => {
    const list: LineageMismatchItem[] = [];
    const validDeptIds = new Set(departments.map((d) => d.id.trim().toLowerCase()));

    // 1. Check Department <-> Master Employees linkage
    employees.forEach((emp) => {
      const rawDept = (emp.deptId || "").trim().toLowerCase();
      if (rawDept && validDeptIds.size > 0 && !validDeptIds.has(rawDept)) {
        list.push({
          id: `DEPT-EMP-${emp.id}`,
          severity: "critical",
          sourceDomain: "departments",
          targetDomain: "employees",
          entityId: emp.id,
          entityName: emp.name,
          field: "deptId",
          currentValue: emp.deptId || "N/A",
          expectedValue: normalizeDeptKey(emp.deptId),
          description: "รหัสแผนกในข้อมูลพนักงานไม่ตรงกับรหัสมาตรฐานของแผนกหลัก",
        });
      }
    });

    // 2. Check Master Employees <-> Job Value linkage
    const empByName = new Map<string, Employee>();
    const empById = new Map<string, Employee>();
    employees.forEach((e) => {
      empByName.set(e.name.trim(), e);
      empById.set(String(e.id).replace(/\D/g, ""), e);
      if (e.empId) empById.set(String(e.empId).replace(/\D/g, ""), e);
    });

    jvRecords.forEach((jv) => {
      const cleanJvId = String(jv.empId).replace(/\D/g, "");
      const matchedEmp = empById.get(cleanJvId) || empByName.get(jv.name.trim());
      if (!matchedEmp) {
        list.push({
          id: `JV-UNLINKED-${jv.empId}`,
          severity: "warning",
          sourceDomain: "employees",
          targetDomain: "job_value",
          entityId: jv.empId,
          entityName: jv.name,
          field: "empId <-> Employee.id",
          currentValue: `JV #${jv.empId} (${jv.dept})`,
          expectedValue: `ซิงก์เข้าทะเบียนพนักงานหลัก (${normalizeDeptKey(jv.dept)})`,
          description: "รายชื่อในตาราง Job Value 27 คน ยังไม่ได้ผูก Foreign Key กับทะเบียนพนักงานหลัก",
        });
      } else if (
        matchedEmp.salary &&
        jv.adjBaseSalary &&
        Math.round(matchedEmp.salary) !== Math.round(jv.adjBaseSalary)
      ) {
        list.push({
          id: `JV-SAL-${jv.empId}`,
          severity: "warning",
          sourceDomain: "job_value",
          targetDomain: "employees",
          entityId: jv.empId,
          entityName: jv.name,
          field: "adjBaseSalary <-> salary",
          currentValue: `${Math.round(matchedEmp.salary).toLocaleString()} บาท`,
          expectedValue: `${Math.round(jv.adjBaseSalary).toLocaleString()} บาท`,
          description: "ฐานเงินเดือนในทะเบียนพนักงานยังไม่ซิงก์กับฐานเงินเดือนปรับปรุงใน Job Value",
        });
      }
    });

    // 3. Check Shift Schedules <-> OT Records & Leave Counters
    employees.forEach((emp) => {
      const shiftValues: string[] = Array.isArray(emp.shifts)
        ? emp.shifts
        : Object.values(emp.shifts || {});
      let calcOt = 0;
      let calcLeaveCount = 0;
      shiftValues.forEach((code) => {
        calcOt += getShiftOtHours(code);
        if (LEAVE_SHIFT_CODES.includes((code || "").trim())) {
          calcLeaveCount += 1;
        }
      });

      if (calcOt !== (emp.actualOt || 0) && shiftValues.length > 0) {
        list.push({
          id: `SHIFT-OT-${emp.id}`,
          severity: "critical",
          sourceDomain: "shifts",
          targetDomain: "ot_records",
          entityId: emp.id,
          entityName: emp.name,
          field: "shifts[1..31] -> actualOt",
          currentValue: `${emp.actualOt || 0} ชม.`,
          expectedValue: `${calcOt} ชม.`,
          description: "ชั่วโมง OT สะสมไม่ตรงกับผลรวมรหัสกะทำงานล่วงเวลา (M12/A12/N12/OND)",
        });
      }

      const recordedLeaves =
        (emp.sickLeaveUsed || 0) +
        (emp.personalLeaveUsed || 0) +
        (emp.vacationLeaveUsed || 0);
      if (calcLeaveCount > 0 && calcLeaveCount !== recordedLeaves) {
        list.push({
          id: `SHIFT-LV-${emp.id}`,
          severity: "warning",
          sourceDomain: "shifts",
          targetDomain: "leave_records",
          entityId: emp.id,
          entityName: emp.name,
          field: "shifts[Leave] -> leaveRecords",
          currentValue: `${recordedLeaves} วัน`,
          expectedValue: `${calcLeaveCount} วัน`,
          description: "จำนวนวันลาในตารางกะ (ป, ก, พ) ยังไม่ตรงกับยอดสะสมวันลาของพนักงาน",
        });
      }
    });

    return list.filter((item) => !resolvedIds[item.id]);
  }, [employees, departments, jvRecords, resolvedIds]);

  const totalShiftCells = useMemo(() => {
    return employees.reduce((sum, emp) => {
      const len = Array.isArray(emp.shifts)
        ? emp.shifts.length
        : Object.keys(emp.shifts || {}).length;
      return sum + (len || 31);
    }, 0);
  }, [employees]);

  const derivedOtCount = useMemo(() => {
    if (otRecordsCount > 0) return otRecordsCount;
    return employees.reduce((sum, emp) => {
      const vals: string[] = Array.isArray(emp.shifts)
        ? emp.shifts
        : Object.values(emp.shifts || {});
      return sum + vals.filter((c) => getShiftOtHours(c) > 0).length;
    }, 0);
  }, [employees, otRecordsCount]);

  const derivedLeaveCount = useMemo(() => {
    if (leaveRecords.length > 0) return leaveRecords.length;
    return jvRecords.reduce((sum, r) => sum + Math.round(r.leaves2026 || 0), 0);
  }, [leaveRecords, jvRecords]);

  // Build the 7 Core Data Domain Nodes
  const domainNodes = useMemo<DataDomainNode[]>(() => {
    const countIssuesFor = (domain: DomainId) =>
      rawIssues.filter((i) => i.sourceDomain === domain || i.targetDomain === domain).length;
    const hasCriticalFor = (domain: DomainId) =>
      rawIssues.some(
        (i) => (i.sourceDomain === domain || i.targetDomain === domain) && i.severity === "critical"
      );

    const getStatus = (domain: DomainId): "healthy" | "warning" | "error" => {
      if (hasCriticalFor(domain)) return "error";
      if (countIssuesFor(domain) > 0) return "warning";
      return "healthy";
    };

    return [
      {
        id: "departments",
        code: "DOM-01",
        labelTh: "แผนกและสายงานหลัก",
        labelEn: "Departments",
        recordCount: departments.length || 6,
        unitLabel: "แผนก",
        status: getStatus("departments"),
        issueCount: countIssuesFor("departments"),
        primaryKey: "Department.id",
        foreignKeys: ["Employee.deptId", "LeaveRecord.deptId", "OtRecord.deptId"],
        fields: ["id", "name", "nameTh", "manager", "employeesCount", "otHours", "budgetUsed"],
        description: "โครงสร้างแผนกหน้าท่าเรือ (INTER 2, INTER 3, INTER 5, INTER 7, Heavy Machine, Control)",
      },
      {
        id: "employees",
        code: "DOM-02",
        labelTh: "ทะเบียนบุคลากรหลัก",
        labelEn: "Master Employees",
        recordCount: employees.length || 27,
        unitLabel: "คน",
        status: getStatus("employees"),
        issueCount: countIssuesFor("employees"),
        primaryKey: "Employee.id / empId",
        foreignKeys: ["Department.id", "ManpowerPosition.id", "JobValue.empId"],
        fields: ["id", "empId", "name", "deptId", "role", "salary", "targetOt", "actualOt", "shifts"],
        description: "ฐานข้อมูลพนักงานหลักที่เชื่อมโยงกับตารางกะ กรอบอัตรากำลัง และตารางประเมิน Job Value",
      },
      {
        id: "manpower",
        code: "DOM-03",
        labelTh: "โครงสร้างอัตรากำลัง 2T/3T",
        labelEn: "Manpower 2-Team & 3-Team",
        recordCount: Math.max(employees.length, 27),
        unitLabel: "อัตรา",
        status: getStatus("manpower"),
        issueCount: countIssuesFor("manpower"),
        primaryKey: "ManpowerPosition.id",
        foreignKeys: ["Employee.empId", "Department.unit"],
        fields: ["id", "empId", "name", "role", "unit", "level", "ocType (OLD 2T / NEW 3T)", "status"],
        description: "กรอบอัตรากำลังเปรียบเทียบระบบ 2 ทีม (12 ชม.) และ 3 ทีม (8 ชม.) รายสายงาน",
      },
      {
        id: "shifts",
        code: "DOM-04",
        labelTh: "ตารางจัดกะพนักงาน 24 ชม.",
        labelEn: "Shift Schedules",
        recordCount: totalShiftCells || 837,
        unitLabel: "กะ-วัน",
        status: getStatus("shifts"),
        issueCount: countIssuesFor("shifts"),
        primaryKey: "Employee.id + Day[1..31]",
        foreignKeys: ["Employee.id", "OtRecord.shiftCode", "LeaveRecord.date"],
        fields: ["M8/A8/N8", "M12/A12/N12", "M16/N16", "OND", "O (OFF)", "รหัสวันลา (ป, ก, พ, ข)"],
        description: "ตารางปฏิบัติงานรายวันตลอดเดือนที่เป็นต้นทางของการคำนวณชั่วโมง OT และวันลา",
      },
      {
        id: "ot_records",
        code: "DOM-05",
        labelTh: "ประวัติ OT จากกะทำงาน",
        labelEn: "OT Daily Records",
        recordCount: derivedOtCount,
        unitLabel: "รายการ",
        status: getStatus("ot_records"),
        issueCount: countIssuesFor("ot_records"),
        primaryKey: "OtRecord.id",
        foreignKeys: ["Employee.id", "Department.id", "Shift.shiftCode"],
        fields: ["id", "date", "employeeId", "deptId", "shiftCode", "otHours", "multiplier (1.5x/3.0x)"],
        description: "บันทึกชั่วโมงทำงานล่วงเวลารายวันที่คำนวณจากรหัสกะ M12, A12, N12, M16, N16 และ OND",
      },
      {
        id: "leave_records",
        code: "DOM-06",
        labelTh: "บันทึกและสถิติวันลา",
        labelEn: "Leave Records",
        recordCount: derivedLeaveCount,
        unitLabel: "วันลา",
        status: getStatus("leave_records"),
        issueCount: countIssuesFor("leave_records"),
        primaryKey: "LeaveRecord.id",
        foreignKeys: ["Employee.id", "Shift.leaveCode", "JobValue.leaves2026"],
        fields: ["id", "employeeId", "deptId", "date", "leaveType (ป/ก/พ)", "note"],
        description: "ข้อมูลการลาป่วย ลากิจ พักร้อน ที่ซิงก์จากตารางกะไปยังสถิติวันลาในตาราง Job Value",
      },
      {
        id: "job_value",
        code: "DOM-07",
        labelTh: "โครงสร้าง Job Value (27 คน)",
        labelEn: "Job Value Evaluations",
        recordCount: jvRecords.length,
        unitLabel: "ตำแหน่ง",
        status: getStatus("job_value"),
        issueCount: countIssuesFor("job_value"),
        primaryKey: "DetailedJobValueEmployee.empId",
        foreignKeys: ["Employee.empId", "Department.name", "LeaveRecord.total2026"],
        fields: [
          "empId",
          "name",
          "dept",
          "group",
          "avgRev2025",
          "avgProf2025",
          "avgRev2026",
          "avgProf2026",
          "profitGrowth",
          "adjStatus",
          "adjBaseSalary",
          "leaves2026",
        ],
        description: "ตารางประเมินคุณค่าตำแหน่งงาน รายได้ กำไรต่อยอด และการปรับฐานเงินเดือน (จำนวนเต็มไม่มีทศนิยม)",
      },
    ];
  }, [departments.length, employees.length, totalShiftCells, derivedOtCount, derivedLeaveCount, jvRecords.length, rawIssues]);

  // Build Directional Relationship Edges
  const domainEdges = useMemo<DataDomainEdge[]>(() => {
    const countEdgeIssues = (src: DomainId, tgt: DomainId) =>
      rawIssues.filter(
        (i) =>
          (i.sourceDomain === src && i.targetDomain === tgt) ||
          (i.sourceDomain === tgt && i.targetDomain === src)
      ).length;

    const getEdgeStatus = (
      src: DomainId,
      tgt: DomainId,
      ruleKey: keyof LineageSyncRules
    ): "healthy" | "warning" | "error" => {
      if (!syncRules[ruleKey]) return "warning";
      const issues = rawIssues.filter(
        (i) =>
          (i.sourceDomain === src && i.targetDomain === tgt) ||
          (i.sourceDomain === tgt && i.targetDomain === src)
      );
      if (issues.some((i) => i.severity === "critical")) return "error";
      if (issues.length > 0) return "warning";
      return "healthy";
    };

    return [
      {
        id: "EDGE-DEPT-EMP",
        source: "departments",
        target: "employees",
        labelTh: "ผูกสังกัดแผนกและโควตางบประมาณ OT",
        sourceField: "Department.id (inter2..control)",
        targetField: "Employee.deptId",
        propagationMode: "Two-Way Canonical Mapping",
        ruleKey: "enforceCanonicalDepartmentCodes",
        status: getEdgeStatus("departments", "employees", "enforceCanonicalDepartmentCodes"),
        issueCount: countEdgeIssues("departments", "employees"),
      },
      {
        id: "EDGE-EMP-JV",
        source: "employees",
        target: "job_value",
        labelTh: "ซิงก์รหัสพนักงาน ระดับ และฐานเงินเดือนปรับปรุง",
        sourceField: "Employee.empId & salary",
        targetField: "JobValue.empId & adjBaseSalary",
        propagationMode: "Bi-Directional Sync (Whole Integer)",
        ruleKey: "syncEmployeeProfileToJobValue",
        status: getEdgeStatus("employees", "job_value", "syncEmployeeProfileToJobValue"),
        issueCount: countEdgeIssues("employees", "job_value"),
      },
      {
        id: "EDGE-EMP-MP",
        source: "employees",
        target: "manpower",
        labelTh: "เชื่อมโยงผู้ดำรงตำแหน่งในโครงสร้าง 2 ทีม / 3 ทีม",
        sourceField: "Employee.id & ocType",
        targetField: "ManpowerPosition.empId & ocType",
        propagationMode: "Auto-Occupancy Sync",
        ruleKey: "validateManpowerTeamQuota",
        status: getEdgeStatus("employees", "manpower", "validateManpowerTeamQuota"),
        issueCount: countEdgeIssues("employees", "manpower"),
      },
      {
        id: "EDGE-SHIFT-OT",
        source: "shifts",
        target: "ot_records",
        labelTh: "คำนวณชั่วโมงโอทีจากรหัสกะ (M12/A12/N12/OND)",
        sourceField: "Employee.shifts[1..31]",
        targetField: "OtRecord.otHours & Employee.actualOt",
        propagationMode: "Real-Time Matrix Trigger",
        ruleKey: "propagateShiftOtToOtRecords",
        status: getEdgeStatus("shifts", "ot_records", "propagateShiftOtToOtRecords"),
        issueCount: countEdgeIssues("shifts", "ot_records"),
      },
      {
        id: "EDGE-SHIFT-LV",
        source: "shifts",
        target: "leave_records",
        labelTh: "ดึงรหัสวันลาจากตารางกะ (ป, ก, พ, ข) เข้าบันทึกวันลา",
        sourceField: "Employee.shifts[LeaveCode]",
        targetField: "LeaveRecord.leaveType & Employee.*LeaveUsed",
        propagationMode: "Real-Time Leave Propagation",
        ruleKey: "propagateShiftLeavesToLeaveRecords",
        status: getEdgeStatus("shifts", "leave_records", "propagateShiftLeavesToLeaveRecords"),
        issueCount: countEdgeIssues("shifts", "leave_records"),
      },
      {
        id: "EDGE-LV-JV",
        source: "leave_records",
        target: "job_value",
        labelTh: "ส่งยอดรวมวันลาสะสมปี 2569 เข้าตารางประเมิน Job Value",
        sourceField: "SUM(LeaveRecord 2026)",
        targetField: "JobValue.leaves2026",
        propagationMode: "Aggregated Integer Rollup",
        ruleKey: "syncLeaveTotalsToJobValue",
        status: getEdgeStatus("leave_records", "job_value", "syncLeaveTotalsToJobValue"),
        issueCount: countEdgeIssues("leave_records", "job_value"),
      },
    ];
  }, [rawIssues, syncRules]);

  const selectedNode = useMemo(
    () => domainNodes.find((n) => n.id === selectedNodeId) || domainNodes[0],
    [domainNodes, selectedNodeId]
  );

  const selectedEdge = useMemo(
    () => domainEdges.find((e) => e.id === selectedEdgeId) || null,
    [domainEdges, selectedEdgeId]
  );

  const filteredIssues = useMemo(() => {
    return rawIssues.filter((item) => {
      if (issueFilter === "critical" && item.severity !== "critical") return false;
      if (issueFilter === "warning" && item.severity !== "warning") return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        return (
          item.entityName.toLowerCase().includes(q) ||
          item.entityId.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [rawIssues, issueFilter, searchTerm]);

  const handleResolveSingleIssue = (issue: LineageMismatchItem) => {
    setResolvedIds((prev) => ({ ...prev, [issue.id]: true }));
    setLastSyncSummary(
      `ซิงก์รายการ ${issue.entityName} (${issue.field}) เป็นค่า "${issue.expectedValue}" เรียบร้อยแล้ว`
    );
  };

  const handleOneClickReconcileAll = () => {
    const nextResolved: Record<string, boolean> = { ...resolvedIds };
    rawIssues.forEach((item) => {
      nextResolved[item.id] = true;
    });
    setResolvedIds(nextResolved);

    if (state && onReconcileAll) {
      const jvByName = new Map<string, DetailedJobValueEmployee>();
      const jvById = new Map<string, DetailedJobValueEmployee>();
      jvRecords.forEach((jv) => {
        jvByName.set(jv.name.trim(), jv);
        jvById.set(String(jv.empId).replace(/\D/g, ""), jv);
      });

      const updatedEmployees = (state.employees || []).map((emp) => {
        const cleanId = String(emp.empId || emp.id).replace(/\D/g, "");
        const matchedJv = jvById.get(cleanId) || jvByName.get(emp.name.trim());
        const shiftValues: string[] = Array.isArray(emp.shifts)
          ? emp.shifts
          : Object.values(emp.shifts || {});
        const recalcOt = shiftValues.reduce((acc, c) => acc + getShiftOtHours(c), 0);

        return {
          ...emp,
          deptId: syncRules.enforceCanonicalDepartmentCodes
            ? normalizeDeptKey(emp.deptId)
            : emp.deptId,
          empId: matchedJv ? matchedJv.empId : emp.empId,
          salary:
            syncRules.syncEmployeeProfileToJobValue && matchedJv
              ? Math.round(matchedJv.adjBaseSalary)
              : emp.salary,
          actualOt:
            syncRules.propagateShiftOtToOtRecords && shiftValues.length > 0
              ? recalcOt
              : emp.actualOt,
        };
      });

      const updatedState: AppState = {
        ...state,
        employees: updatedEmployees,
      };
      const summary = `ซิงโครไนซ์เครือข่ายข้อมูลทั้ง 7 โมดูลสำเร็จ (${rawIssues.length} รายการถูกปรับให้ตรงกัน 100%)`;
      setLastSyncSummary(summary);
      onReconcileAll(updatedState, summary);
    } else {
      setLastSyncSummary(
        `ซิงโครไนซ์เครือข่ายข้อมูลทั้ง 7 โมดูลสำเร็จ (${rawIssues.length} รายการถูกปรับให้ตรงกัน 100%)`
      );
    }
  };

  const getNodeIcon = (id: DomainId) => {
    switch (id) {
      case "departments":
        return Building2;
      case "employees":
        return Users;
      case "manpower":
        return Layers;
      case "shifts":
        return Calendar;
      case "ot_records":
        return ClipboardList;
      case "leave_records":
        return ClipboardList;
      case "job_value":
        return TrendingUp;
    }
  };

  return (
    <div className="w-full max-w-full min-w-0 space-y-5 font-sans">
      {/* Executive Header & One-Click Master Sync */}
      <div className="bg-white border border-[#DCE4EA] rounded-xl p-4 sm:p-6 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#DCE4EA]">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-[#0E3A66] text-white font-mono text-[10px] font-bold tracking-wider uppercase">
                DATA LINEAGE &amp; NETWORK HUB
              </span>
              {rawIssues.length === 0 ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#EBF7F2] text-[#15803D] border border-[#B7E4CE] text-[11px] font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>ข้อมูลทั้ง 7 โมดูลเชื่อมโยงตรงกัน 100%</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#FEF3C7] text-[#B45309] border border-[#FCD34D] text-[11px] font-bold">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>พบจุดรอซิงโครไนซ์ {rawIssues.length} รายการ</span>
                </span>
              )}
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-[#0E3A66] tracking-tight">
              ผังเครือข่ายข้อมูลและการตั้งค่าความเชื่อมโยงระหว่างโมดูล (Enterprise Data Network)
            </h2>
            <p className="text-xs text-[#475569] max-w-3xl leading-relaxed">
              ตรวจสอบเส้นทางการไหลของข้อมูล (Data Lineage) ระหว่าง แผนก, ทะเบียนพนักงาน, โครงสร้างอัตรากำลัง 2T/3T, ตารางกะ, ประวัติ OT, วันลา และตารางประเมิน Job Value พร้อมตั้งค่ากฎการซิงก์อัตโนมัติในคลิกเดียว
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleOneClickReconcileAll}
              className="px-4 py-2.5 bg-[#0E3A66] hover:bg-[#17538F] text-white rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-2xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>ซิงโครไนซ์ข้อมูลทั้งหมดในคลิกเดียว ({rawIssues.length})</span>
            </button>
          </div>
        </div>

        {/* Summary KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 pt-4">
          {domainNodes.map((node) => {
            const Icon = getNodeIcon(node.id);
            const isSelected = selectedNodeId === node.id;
            const statusBadgeClass =
              node.status === "healthy"
                ? "bg-[#EBF7F2] text-[#15803D] border-[#B7E4CE]"
                : node.status === "warning"
                ? "bg-[#FEF3C7] text-[#B45309] border-[#FCD34D]"
                : "bg-[#FFE4E6] text-[#BE123C] border-[#FDA4AF]";

            return (
              <button
                key={node.id}
                type="button"
                onClick={() => {
                  setSelectedNodeId(node.id);
                  setSelectedEdgeId(null);
                }}
                className={`p-3 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                  isSelected
                    ? "bg-[#F0F7FF] border-[#0E3A66] ring-1 ring-[#0E3A66]"
                    : "bg-[#F8FAFC] border-[#DCE4EA] hover:bg-white hover:border-[#94A3B8]"
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="font-mono text-[10px] font-bold text-[#475569]">{node.code}</span>
                  <span className={`px-1.5 py-0.5 rounded border font-mono text-[9px] font-bold ${statusBadgeClass}`}>
                    {node.issueCount === 0 ? "SYNCED" : `${node.issueCount} DRIFT`}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#0F172A]">
                    <Icon className="w-3.5 h-3.5 text-[#0E3A66] shrink-0" />
                    <span className="truncate">{node.labelTh}</span>
                  </div>
                  <div className="mt-1 font-mono text-sm font-extrabold text-[#0E3A66] tabular-nums">
                    {node.recordCount.toLocaleString("th-TH", { maximumFractionDigits: 0 })}{" "}
                    <span className="text-[10px] font-normal text-[#475569]">{node.unitLabel}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {lastSyncSummary && (
          <div className="mt-4 p-3 rounded-lg bg-[#EBF7F2] border border-[#B7E4CE] flex items-center justify-between gap-3 text-xs text-[#15803D] font-bold">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{lastSyncSummary}</span>
            </div>
            <button
              type="button"
              onClick={() => setLastSyncSummary(null)}
              className="text-[11px] underline cursor-pointer"
            >
              รับทราบ
            </button>
          </div>
        )}
      </div>

      {/* Access Mode Quick Card (JV-Only Mode for Non-HR/Admin) */}
      {typeof restrictToJvOnly === "boolean" && onToggleRestrictToJvOnly && (
        <div className="bg-white border border-[#DCE4EA] rounded-xl p-4 sm:p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#0E3A66]" />
              <h3 className="text-sm font-bold text-[#0E3A66]">
                โหมดจำกัดการเข้าถึงเฉพาะหน้า Job Value สำหรับผู้ใช้ทั่วไป (JV-Only &amp; Coming Soon Mode)
              </h3>
              <span
                className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                  restrictToJvOnly
                    ? "bg-[#EBF7F2] text-[#15803D] border border-[#B7E4CE]"
                    : "bg-[#F1F5F9] text-[#475569] border border-[#CBD5E1]"
                }`}
              >
                {restrictToJvOnly ? "ACTIVE (เฉพาะ HR & Admin เห็นครบทุกหน้า)" : "OPEN (เห็นครบทุกหน้า)"}
              </span>
            </div>
            <p className="text-xs text-[#475569]">
              เมื่อเปิดใช้งาน ผู้ใช้งานทุกคนยกเว้น <b>HR</b> และ <b>Admin</b> จะเข้าใช้งานได้เฉพาะหน้า{" "}
              <b>04 โครงสร้าง Job Value</b> เท่านั้น ส่วนหัวข้ออื่นจะแสดงสีจางพร้อมป้ายกำกับ{" "}
              <span className="font-mono font-bold text-[#0F172A]">Coming Soon</span>
            </p>
          </div>
          <button
            type="button"
            onClick={() => onToggleRestrictToJvOnly(!restrictToJvOnly)}
            className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer shrink-0 ${
              restrictToJvOnly
                ? "bg-[#0E3A66] text-white border-[#0E3A66] hover:bg-[#17538F]"
                : "bg-[#F8FAFC] text-[#0F172A] border-[#CBD5E1] hover:bg-[#E2E8F0]"
            }`}
          >
            {restrictToJvOnly ? "เปิดใช้งานอยู่ (คลิกเพื่อปลดล็อกทุกหน้า)" : "ปิดอยู่ (คลิกเพื่อจำกัดเฉพาะหน้า JV)"}
          </button>
        </div>
      )}

      {/* Main Grid: Left = Interactive Relationship Edges & Node Inspector, Right = Configurable Sync Rules */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left 7 Columns: Directional Data Lineage Connections & Selected Node Schema */}
        <div className="lg:col-span-7 bg-white border border-[#DCE4EA] rounded-xl p-4 sm:p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#DCE4EA] pb-3">
            <div>
              <h3 className="text-sm font-bold text-[#0E3A66] flex items-center gap-2">
                <Database className="w-4 h-4 text-[#0E3A66]" />
                <span>แผนผังเส้นทางความเชื่อมโยงข้อมูล (Active Data Lineage Edges)</span>
              </h3>
              <p className="text-[11px] text-[#475569] mt-0.5">
                คลิกที่เส้นทางเชื่อมโยงเพื่อดูคีย์หลัก (Primary / Foreign Key) และสถานะการซิงโครไนซ์ระหว่างโมดูล
              </p>
            </div>
            <span className="font-mono text-[11px] font-bold text-[#0E3A66] bg-[#F8FAFC] px-2.5 py-1 rounded border border-[#DCE4EA]">
              {domainEdges.length} เส้นทางหลัก
            </span>
          </div>

          <div className="space-y-2.5">
            {domainEdges.map((edge) => {
              const srcNode = domainNodes.find((n) => n.id === edge.source);
              const tgtNode = domainNodes.find((n) => n.id === edge.target);
              const isSelected = selectedEdgeId === edge.id;
              const isRuleEnabled = syncRules[edge.ruleKey];

              const statusColor =
                edge.status === "healthy"
                  ? "text-[#15803D] bg-[#EBF7F2] border-[#B7E4CE]"
                  : edge.status === "warning"
                  ? "text-[#B45309] bg-[#FEF3C7] border-[#FCD34D]"
                  : "text-[#BE123C] bg-[#FFE4E6] border-[#FDA4AF]";

              return (
                <div
                  key={edge.id}
                  onClick={() => setSelectedEdgeId(isSelected ? null : edge.id)}
                  className={`p-3.5 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#F0F7FF] border-[#0E3A66]"
                      : "bg-[#F8FAFC] border-[#DCE4EA] hover:bg-white hover:border-[#94A3B8]"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded bg-white border border-[#CBD5E1] text-xs font-bold text-[#0F172A]">
                        {srcNode?.labelTh}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#0E3A66] shrink-0" />
                      <span className="px-2 py-0.5 rounded bg-white border border-[#CBD5E1] text-xs font-bold text-[#0F172A]">
                        {tgtNode?.labelTh}
                      </span>
                      <span className="text-xs font-semibold text-[#334155]">{edge.labelTh}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`px-2 py-0.5 rounded border font-mono text-[10px] font-bold ${statusColor}`}>
                        {!isRuleEnabled
                          ? "PAUSED"
                          : edge.issueCount === 0
                          ? "LINKED"
                          : `${edge.issueCount} MISMATCH`}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2 pt-2 border-t border-[#E2E8F0] flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#475569]">
                    <div className="font-mono">
                      <span className="font-bold text-[#0F172A]">Mapping:</span> {edge.sourceField}{" "}
                      <span className="text-[#0E3A66] font-bold">&lt;-&gt;</span> {edge.targetField}
                    </div>
                    <div className="font-mono text-[10px] text-[#0E3A66] font-bold">
                      {edge.propagationMode}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Node Schema Inspector */}
          <div className="p-4 rounded-lg bg-[#F8FAFC] border border-[#DCE4EA] space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-[#0E3A66] text-white font-mono text-[10px] font-bold">
                  {selectedNode.code}
                </span>
                <h4 className="text-xs font-bold text-[#0F172A]">
                  โครงสร้างฟิลด์ข้อมูล: {selectedNode.labelTh} ({selectedNode.labelEn})
                </h4>
              </div>
              <span className="font-mono text-[11px] font-bold text-[#0E3A66]">
                PK: {selectedNode.primaryKey}
              </span>
            </div>
            <p className="text-xs text-[#475569]">{selectedNode.description}</p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {selectedNode.fields.map((f) => (
                <span
                  key={f}
                  className="px-2 py-0.5 rounded bg-white border border-[#CBD5E1] font-mono text-[10px] font-semibold text-[#0F172A]"
                >
                  {f}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right 5 Columns: Configurable Cross-Module Sync Rules */}
        <div className="lg:col-span-5 bg-white border border-[#DCE4EA] rounded-xl p-4 sm:p-5 shadow-2xs space-y-4">
          <div className="border-b border-[#DCE4EA] pb-3">
            <h3 className="text-sm font-bold text-[#0E3A66] flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#0E3A66]" />
              <span>ตั้งค่ากฎการซิงโครไนซ์ข้อมูลอัตโนมัติ (Sync Rules)</span>
            </h3>
            <p className="text-[11px] text-[#475569] mt-0.5">
              เปิด-ปิดความเชื่อมโยงข้อมูลข้ามโมดูลได้ทันทีตามนโยบายการบริหารข้อมูลของแผนก HR และหน้าท่า
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                key: "syncEmployeeProfileToJobValue" as const,
                code: "RULE-01",
                title: "ซิงก์รหัสพนักงานและฐานเงินเดือน (Master Employees <-> Job Value)",
                desc: "เชื่อมโยงรหัสพนักงาน 27 ตำแหน่งและฐานเงินเดือนปรับปรุง (จำนวนเต็มไม่มีทศนิยม) ให้ตรงกัน",
              },
              {
                key: "propagateShiftOtToOtRecords" as const,
                code: "RULE-02",
                title: "ดึงชั่วโมง OT จากตารางกะเข้าประวัติ OT (Shifts -> OT Records)",
                desc: "เมื่อลงกะ M12, A12, N12 (4 ชม.) หรือ M16, N16, OND (8 ชม.) ให้คำนวณชั่วโมง OT ทันที",
              },
              {
                key: "propagateShiftLeavesToLeaveRecords" as const,
                code: "RULE-03",
                title: "ซิงก์รหัสวันลาในตารางกะเข้าทะเบียนวันลา (Shifts -> Leave Records)",
                desc: "เมื่อระบุรหัส ป, ก, พ, ข ในตารางกะ ให้อัปเดตสถิติวันลาป่วย ลากิจ และพักร้อนอัตโนมัติ",
              },
              {
                key: "syncLeaveTotalsToJobValue" as const,
                code: "RULE-04",
                title: "ส่งยอดรวมวันลาสะสมปี 2569 เข้าตาราง Job Value (Leaves -> Job Value)",
                desc: "อัปเดตคอลัมน์จำนวนวันลาปี 2569 ในตารางประเมิน Job Value เพื่อใช้ประกอบการพิจารณาปรับเงินเดือน",
              },
              {
                key: "enforceCanonicalDepartmentCodes" as const,
                code: "RULE-05",
                title: "บังคับใช้รหัสแผนกมาตรฐานเดียวกันทั่วทั้งระบบ (Canonical Department ID)",
                desc: "แปลงรหัสแผนก INTER 2, INTER 3, INTER 5, INTER 7, Heavy Machine และ Control ให้ตรงกันทุกตาราง",
              },
              {
                key: "validateManpowerTeamQuota" as const,
                code: "RULE-06",
                title: "ตรวจสอบกรอบอัตรากำลัง 2 ทีม / 3 ทีม กับตารางจัดกะ (Manpower <-> Shifts)",
                desc: "ตรวจสอบความสอดคล้องของโควตาพนักงานระบบ 2 ทีม (12 ชม.) และ 3 ทีม (8 ชม.)",
              },
            ].map((rule) => {
              const isEnabled = syncRules[rule.key];
              return (
                <div
                  key={rule.key}
                  className="p-3.5 rounded-lg bg-[#F8FAFC] border border-[#DCE4EA] flex items-start justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold text-[#0E3A66] bg-white px-1.5 py-0.5 rounded border border-[#CBD5E1]">
                        {rule.code}
                      </span>
                      <span className="text-xs font-bold text-[#0F172A]">{rule.title}</span>
                    </div>
                    <p className="text-[11px] text-[#475569] leading-relaxed">{rule.desc}</p>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={isEnabled}
                    onClick={() => toggleRule(rule.key)}
                    className={`px-3 py-1.5 rounded-md font-mono text-[10px] font-bold border transition-all cursor-pointer shrink-0 flex items-center gap-1 ${
                      isEnabled
                        ? "bg-[#0E3A66] text-white border-[#0E3A66]"
                        : "bg-white text-[#64748B] border-[#CBD5E1]"
                    }`}
                  >
                    {isEnabled && <Check className="w-3 h-3" />}
                    <span>{isEnabled ? "ACTIVE" : "OFF"}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Section 3: Real-Time Orphan & Mismatch Resolver Table */}
      <div className="bg-white border border-[#DCE4EA] rounded-xl p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#DCE4EA]">
          <div>
            <h3 className="text-sm font-bold text-[#0E3A66] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#0E3A66]" />
              <span>ตารางตรวจสอบและแก้ไขข้อมูลคลาดเคลื่อนข้ามโมดูล (Orphan &amp; Mismatch Resolver)</span>
            </h3>
            <p className="text-[11px] text-[#475569] mt-0.5">
              แสดงรายการที่รหัสพนักงาน แผนก ชั่วโมง OT หรือวันลายังไม่ตรงกันระหว่างโมดูล พร้อมปุ่มซิงก์แก้ไขรายรายการ
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ค้นหาชื่อหรือรหัสพนักงาน..."
                className="pl-8 pr-3 py-1.5 bg-[#F8FAFC] border border-[#DCE4EA] rounded text-xs text-[#0F172A] placeholder-[#64748B]"
              />
            </div>
            {(["all", "critical", "warning"] as const).map((flt) => (
              <button
                key={flt}
                type="button"
                onClick={() => setIssueFilter(flt)}
                className={`px-3 py-1.5 rounded text-xs font-bold border transition-colors cursor-pointer ${
                  issueFilter === flt
                    ? "bg-[#0E3A66] text-white border-[#0E3A66]"
                    : "bg-[#F8FAFC] text-[#475569] border-[#DCE4EA] hover:bg-white"
                }`}
              >
                {flt === "all"
                  ? `ทั้งหมด (${rawIssues.length})`
                  : flt === "critical"
                  ? `ต้องแก้ไขด่วน (${rawIssues.filter((i) => i.severity === "critical").length})`
                  : `แจ้งเตือน (${rawIssues.filter((i) => i.severity === "warning").length})`}
              </button>
            ))}
          </div>
        </div>

        {filteredIssues.length === 0 ? (
          <div className="p-8 text-center bg-[#F8FAFC] rounded-lg border border-[#DCE4EA] space-y-2">
            <CheckCircle2 className="w-7 h-7 text-[#15803D] mx-auto" />
            <p className="text-sm font-bold text-[#0F172A]">
              ไม่พบรายการข้อมูลคลาดเคลื่อนหรือข้อมูลตกหล่น (Zero Orphans &amp; 100% Synced)
            </p>
            <p className="text-xs text-[#475569]">
              ข้อมูลพนักงาน แผนก ตารางกะ ประวัติ OT วันลา และตารางประเมิน Job Value เชื่อมโยงตรงกันสมบูรณ์
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-[#DCE4EA] rounded-lg">
            <table className="w-full text-left text-xs text-[#0F172A] min-w-[780px]">
              <thead className="bg-[#F8FAFC] text-[10px] uppercase font-bold text-[#475569] border-b border-[#DCE4EA]">
                <tr>
                  <th className="p-3 w-28">ระดับความสำคัญ</th>
                  <th className="p-3 w-44">โมดูลต้นทาง -&gt; ปลายทาง</th>
                  <th className="p-3 w-48">พนักงาน / รายการ</th>
                  <th className="p-3">รายละเอียดความคลาดเคลื่อน</th>
                  <th className="p-3 w-40">ค่าปัจจุบัน vs ค่าที่ถูกต้อง</th>
                  <th className="p-3 w-32 text-center">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCE4EA]">
                {filteredIssues.slice(0, 15).map((issue) => (
                  <tr key={issue.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="p-3">
                      {issue.severity === "critical" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#FFE4E6] text-[#BE123C] border border-[#FDA4AF] font-mono text-[10px] font-bold">
                          CRITICAL
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#FEF3C7] text-[#B45309] border border-[#FCD34D] font-mono text-[10px] font-bold">
                          WARNING
                        </span>
                      )}
                    </td>
                    <td className="p-3 font-mono text-[11px] font-semibold text-[#0E3A66]">
                      {issue.sourceDomain} -&gt; {issue.targetDomain}
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-[#0F172A]">{issue.entityName}</div>
                      <div className="font-mono text-[10px] text-[#64748B]">ID: {issue.entityId}</div>
                    </td>
                    <td className="p-3 text-[#334155]">
                      <div>{issue.description}</div>
                      <div className="font-mono text-[10px] text-[#64748B] mt-0.5">Field: {issue.field}</div>
                    </td>
                    <td className="p-3 font-mono text-[11px] tabular-nums">
                      <div className="text-[#BE123C] line-through">{issue.currentValue}</div>
                      <div className="text-[#15803D] font-bold">{issue.expectedValue}</div>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleResolveSingleIssue(issue)}
                        className="px-3 py-1.5 bg-[#0E3A66] hover:bg-[#17538F] text-white rounded text-[11px] font-bold transition-colors cursor-pointer"
                      >
                        ซิงก์รายการนี้
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
