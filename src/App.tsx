import React, { useState, useEffect } from "react";
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  ChevronRight, 
  Sparkles, 
  Send, 
  Download, 
  Upload,
  Filter, 
  Plus, 
  Info, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock,
  ShieldAlert,
  SlidersHorizontal,
  ChevronLeft,
  Maximize,
  Minimize,
  Lock,
  Eye,
  EyeOff,
  User,
  Anchor,
  Ship,
  Search,
  RotateCcw,
  Building2,
  Briefcase,
  UserCheck,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X,
  DollarSign,
  Copy,
  Check,
  Award,
  FileSpreadsheet,
  BarChart3,
  ShieldCheck,
  ClipboardList,
  Trash2,
  Settings,
  UserX,
  Globe
} from "lucide-react";
import loginBg from "./assets/login-bg.jpg";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import CsvTemplateHubModal from "./components/CsvTemplateHubModal";
import { AppState, Employee, Department, JobValueRecord } from "./types";

export const SHIFT_OPTIONS = [
  { code: "M8", label: "M8", desc: "กะเช้า 8 ชม.", bg: "bg-[#dce6f1]", border: "border-[#b4c6e7]", text: "text-black" },
  { code: "A8", label: "A8", desc: "กะบ่าย 8 ชม.", bg: "bg-[#fff2cc]", border: "border-[#ffd966]", text: "text-black" },
  { code: "N8", label: "N8", desc: "กะดึก 8 ชม.", bg: "bg-[#fce4d6]", border: "border-[#f8cbad]", text: "text-black" },
  { code: "M12", label: "M12", desc: "กะเช้า8 OT 4", bg: "bg-[#ddebf7]", border: "border-[#9cc2e5]", text: "text-[#4472c4]" },
  { code: "A12", label: "A12", desc: "กะบ่าย8 OT 4", bg: "bg-[#fff2cc]", border: "border-[#ffd966]", text: "text-black" },
  { code: "N12", label: "N12", desc: "กะดึก8 OT 4", bg: "bg-[#fce4d6]", border: "border-[#f8cbad]", text: "text-[#ff0000]" },
  { code: "M16", label: "M16", desc: "กะเช้า8 OT 8", bg: "bg-[#1f4e79]", border: "border-[#1f4e79]", text: "text-white font-bold" },
  { code: "N16", label: "N16", desc: "กะดึก8 OT 8", bg: "bg-[#ff0000]", border: "border-[#ff0000]", text: "text-white font-bold" },
  { code: "D", label: "D", desc: "ทอดสมอ", bg: "bg-[#aeaaaa]", border: "border-[#7f7f7f]", text: "text-[#595959]" },
  { code: "OND", label: "OND", desc: "ON DUTY", bg: "bg-[#00ffff]", border: "border-[#00ffff]", text: "text-black" },
  { code: "O", label: "O", desc: "วันหยุด O", bg: "bg-white", border: "border-slate-200", text: "text-slate-400" }
];

export const getShiftStyle = (shift: string) => {
  switch (shift) {
    case "M8":
      return "bg-[#dce6f1] text-black border-[#b4c6e7] font-extrabold";
    case "A8":
      return "bg-[#fff2cc] text-black border-[#ffd966] font-extrabold";
    case "N8":
      return "bg-[#fce4d6] text-black border-[#f8cbad] font-extrabold";
    case "M12":
      return "bg-[#ddebf7] text-[#4472c4] border-[#9cc2e5] font-extrabold";
    case "A12":
      return "bg-[#fff2cc] text-black border-[#ffd966] font-extrabold";
    case "N12":
      return "bg-[#fce4d6] text-[#ff0000] border-[#f8cbad] font-extrabold";
    case "M16":
      return "bg-[#1f4e79] text-white border-[#1f4e79] font-extrabold";
    case "N16":
      return "bg-[#ff0000] text-white border-[#ff0000] font-extrabold";
    case "D":
      return "bg-[#aeaaaa] text-slate-800 border-[#7f7f7f] font-extrabold";
    case "OND":
      return "bg-[#00ffff] text-black border-[#00ffff] font-extrabold";
    case "O":
      return "bg-white text-slate-400 border-slate-200 font-medium";
    default:
      if (shift.startsWith("M")) {
        const ot = getShiftOtHours(shift);
        if (ot > 4) return "bg-[#1f4e79] text-white border-[#1f4e79] font-extrabold";
        if (ot > 0) return "bg-[#ddebf7] text-[#4472c4] border-[#9cc2e5] font-extrabold";
        return "bg-[#dce6f1] text-black border-[#b4c6e7] font-extrabold";
      }
      if (shift.startsWith("A")) {
        return "bg-[#fff2cc] text-black border-[#ffd966] font-extrabold";
      }
      if (shift.startsWith("N")) {
        const ot = getShiftOtHours(shift);
        if (ot > 4) return "bg-[#ff0000] text-white border-[#ff0000] font-extrabold";
        if (ot > 0) return "bg-[#fce4d6] text-[#ff0000] border-[#f8cbad] font-extrabold";
        return "bg-[#fce4d6] text-black border-[#f8cbad] font-extrabold";
      }
      if (shift === "A") return "bg-[#fff2cc] text-black border-[#ffd966] font-extrabold";
      if (shift === "N") return "bg-[#fce4d6] text-black border-[#f8cbad] font-extrabold";
      if (shift === "⚠") return "bg-red-50 text-red-700 border-[#ff0000] font-extrabold animate-pulse";
      return "bg-slate-50 text-slate-400 border-slate-200";
  }
};

export const getShiftOtHours = (shift: string) => {
  if (shift === "OND") return 8;
  const match = shift.match(/\d+$/);
  if (match) {
    const hours = Number(match[0]);
    return Math.max(0, hours - 8);
  }
  return 0;
};

export const getEmpShiftsArray = (shifts: any, monthKey?: string, calendarType?: string): string[] => {
  const mKey = monthKey || "2026-08";
  let extracted: string[] = [];
  if (shifts) {
    if (typeof shifts === "string") {
      try {
        const parsed = JSON.parse(shifts);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          extracted = parsed[mKey] || [];
        } else if (Array.isArray(parsed)) {
          extracted = mKey === "2026-08" ? parsed : [];
        }
      } catch (_) {}
    } else if (typeof shifts === "object") {
      if (Array.isArray(shifts)) {
        extracted = mKey === "2026-08" ? shifts : [];
      } else {
        extracted = shifts[mKey] || [];
      }
    }
  }

  // If shifts found and contains active shift values, return them
  if (extracted && extracted.length > 0 && extracted.some(s => s && s !== "O" && s !== "")) {
    return extracted;
  }

  // Fallback: Generate real shift patterns according to calendarType if shifts are unassigned
  if (calendarType) {
    const [yStr, mStr] = mKey.split("-");
    const yr = Number(yStr) || 2026;
    const mn = Number(mStr) || 8;
    const totalDays = new Date(yr, mn, 0).getDate();

    if (calendarType.includes("2 ทีม") || calendarType.includes("12")) {
      const cycle = ["M12", "M12", "N12", "N12", "OFF", "OFF"];
      return Array.from({ length: totalDays }, (_, i) => cycle[i % cycle.length]);
    }
    if (calendarType.includes("3 ทีม") || calendarType.includes("8-8-8")) {
      const cycle = ["M8", "M8", "A8", "A8", "N8", "N8", "OFF", "OFF"];
      return Array.from({ length: totalDays }, (_, i) => cycle[i % cycle.length]);
    }
  }

  return extracted && extracted.length > 0 ? extracted : [];
};

export const isJvDepartment = (deptNameOrId: string): boolean => {
  if (!deptNameOrId) return false;
  const n = normalizeDeptId(deptNameOrId);
  return n === "inter2" || n === "inter3" || n === "inter5" || n === "inter7";
};

export const getEmpMonthlyOtPayBreakdown = (emp: any, monthKey?: string) => {
  const mKey = monthKey || "2026-08";
  if (!emp) return { normalOt: 0, holidayOt: 0, holidayWorkDays: 0, totalOtHours: 0, salary: 15000, hourlyRate: 62.5, totalOtPay: 0, otPctSalary: "0.00" };
  
  const empShifts = getEmpShiftsArray(emp.shifts, mKey, emp.calendarType);
  let normalOt = 0;
  let holidayOt = 0;
  let holidayWorkDays = 0;

  const [yStr, mStr] = mKey.split("-");
  const yr = Number(yStr) || new Date().getFullYear();
  const mn = Number(mStr) || (new Date().getMonth() + 1);
  const totalDays = new Date(yr, mn, 0).getDate();
  const dayNames = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];

  for (let dayNum = 1; dayNum <= totalDays; dayNum++) {
    const shift = empShifts[dayNum - 1] || "O";
    const otHrs = getShiftOtHours(shift);
    const isOff = shift === "O" || shift === "OFF";

    const dateObj = new Date(yr, mn - 1, dayNum);
    const dayOfWeek = dateObj.getDay();
    const dayTh = dayNames[dayOfWeek];
    const isSunday = dayTh && dayTh.startsWith("อา");

    if (shift === "OND" || (isSunday && !isOff)) {
      holidayOt += otHrs > 0 ? otHrs : (shift === "OND" ? 8 : 0);
      if (!isOff) holidayWorkDays += 1;
    } else if (otHrs > 0) {
      normalOt += otHrs;
    }
  }

  const salary = Number(emp.salary) || 15000;
  const hourlyRate = salary > 0 ? (salary / 240) : 62.5;
  const totalOtPay = Math.round((normalOt * 1.5 + holidayOt * 3.0 + holidayWorkDays * 8 * 1.0) * hourlyRate);
  const totalOtHours = normalOt + holidayOt;
  const otPctSalary = salary > 0 ? ((totalOtPay / salary) * 100).toFixed(2) : "0.00";

  return {
    normalOt,
    holidayOt,
    holidayWorkDays,
    totalOtHours,
    salary,
    hourlyRate,
    totalOtPay,
    otPctSalary
  };
};

export const getEmpCalculatedOt = (emp: any, monthKey?: string): number => {
  if (!emp) return 0;
  const breakdown = getEmpMonthlyOtPayBreakdown(emp, monthKey);
  return breakdown.totalOtHours || 0;
};

export const getEmpCalculatedOtPay = (emp: any, monthKey?: string): number => {
  if (!emp) return 0;
  const breakdown = getEmpMonthlyOtPayBreakdown(emp, monthKey);
  return breakdown.totalOtPay || 0;
};

// ตรวจสอบว่า Plan กับ Actual ต่างกันหรือไม่
export const isPlanActualMismatch = (planShift: string, actualShift: string): boolean => {
  if (!planShift || !actualShift) return false;
  const p = planShift.trim();
  const a = actualShift.trim();
  // ถือว่า mismatch เมื่อ plan ไม่ใช่ OFF/O และ plan ≠ actual
  return p !== "" && p !== "O" && p !== "OFF" && p !== a;
};

// ดึง planShifts array ของพนักงาน (fallback เป็น shifts ถ้าไม่มี planShifts)
export const getEmpPlanShiftsArray = (emp: any, monthKey?: string): string[] => {
  const mKey = monthKey || "2026-08";
  if (!emp) return [];
  let planShifts = emp.planShifts;
  if (Array.isArray(planShifts)) {
    return planShifts;
  }
  if (typeof planShifts === "string") {
    try {
      const parsed = JSON.parse(planShifts);
      if (Array.isArray(parsed)) return parsed;
      if (parsed && typeof parsed === "object") {
        return parsed[mKey] || [];
      }
    } catch (_) {}
  }
  if (planShifts && typeof planShifts === "object") {
    if (Array.isArray(planShifts)) return planShifts;
    return planShifts[mKey] || [];
  }
  return getEmpShiftsArray(emp.shifts, mKey);
}

export const getEmployeeShiftsForView = (shifts: any, limit: number) => {
  const arr = getEmpShiftsArray(shifts);
  const result = [...arr];
  if (result.length >= limit) {
    return result.slice(0, limit);
  }
  while (result.length < limit) {
    result.push("O");
  }
  return result;
};

export const normalizeDeptId = (deptId?: string) => {
  if (!deptId) return "";
  const clean = String(deptId).trim().toLowerCase().replace(/\s+/g, "");
  if (clean.includes("inter2")) return "inter2";
  if (clean.includes("inter3")) return "inter3";
  if (clean.includes("inter5")) return "inter5";
  if (clean.includes("inter7")) return "inter7";
  if (clean.includes("heavy"))  return "heavy";
  if (clean.includes("ecc"))    return "ecc";
  return clean;
};

export const getDeptName = (deptId?: string, departments?: Department[]) => {
  if (!deptId) return "-";
  const cleanId = normalizeDeptId(deptId);
  
  if (departments && Array.isArray(departments)) {
    const found = departments.find(d => {
      if (!d) return false;
      const dId = normalizeDeptId(d.id);
      const dName = normalizeDeptId(d.name);
      const dNameTh = normalizeDeptId(d.nameTh);
      return dId === cleanId || dName === cleanId || dNameTh === cleanId;
    });
    if (found) {
      const nameStr = found.name || found.nameTh || found.id || deptId || "-";
      return String(nameStr).replace(/^แผนก\s*/i, "");
    }
  }

  if (cleanId === "inter2") return "INTER 2";
  if (cleanId === "inter3") return "INTER 3";
  if (cleanId === "inter5") return "INTER 5";
  if (cleanId === "inter7") return "INTER 7";
  if (cleanId === "heavy")  return "Heavy Machine";
  if (cleanId === "ecc")    return "ECC";

  return String(deptId).replace(/^แผนก\s*/i, "");
};

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 max-w-2xl mx-auto my-12 bg-white rounded-3xl border border-rose-200 shadow-xl text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto text-xl font-bold">
            ⚠️
          </div>
          <h2 className="text-lg font-extrabold text-slate-800">เกิดข้อผิดพลาดในการแสดงผลหน้าต่างนี้</h2>
          <p className="text-xs text-slate-500 font-mono bg-slate-50 p-3 rounded-xl border border-slate-200 text-left overflow-x-auto">
            {this.state.error?.toString() || "Unknown error"}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            รีโหลดหน้าเว็บ (Reload Page)
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const SHIFT_OT_HOURS: Record<string, number> = {
  M12: 4, A12: 4, N12: 4,
  M16: 8, N16: 8, OND: 8
};

const DEPT_LABELS: Record<string, string> = {
  inter2: "INTER 2", inter3: "INTER 3", inter5: "INTER 5",
  inter7: "INTER 7", heavy: "Heavy Machine", ecc: "ECC"
};

type OtRecord = {
  id: string; year: number; month: number; date: string;
  employeeId: string; employeeName: string;
  deptId: string; shiftCode: string; otHours: number; note: string;
};

const MONTH_TH = ["","มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"];

type LeaveRecord = {
  id: string;
  employeeId: string;
  employeeName: string;
  deptId: string;
  date: string;
  leaveType: string;
  note: string;
};

const LEAVE_TYPES: Record<string, string> = {
  vacation: "ลาพักร้อน",
  sick: "ลาป่วย",
  personal: "ลากิจ",
  other: "อื่นๆ"
};

function LeaveRecordsView({ currentUser, state }: { currentUser: any; state: AppState }) {
  const fullAccess = ["HR", "HR Section Manager", "Operation Dir", "Operation Depart", "ผู้ดูแลระบบ"].includes(currentUser?.role || "");
  const now = new Date();
  const [filterYear, setFilterYear] = React.useState(now.getFullYear());
  const [filterMonth, setFilterMonth] = React.useState<number | string>(now.getMonth() + 1);
  const [filterDept, setFilterDept] = React.useState(fullAccess ? "all" : (currentUser?.deptId || "all"));
  const [searchQuery, setSearchQuery] = React.useState("");
  const [records, setRecords] = React.useState<LeaveRecord[]>([]);
  const [loading, setLoading] = React.useState(false);
  
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [newEmployeeId, setNewEmployeeId] = React.useState("");
  const [newDate, setNewDate] = React.useState(new Date().toISOString().substring(0, 10));
  const [newType, setNewType] = React.useState("vacation");
  const [newNote, setNewNote] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        year: String(filterYear),
        deptId: filterDept
      });
      if (filterMonth !== "all") {
        params.append("month", String(filterMonth));
      }
      const res = await fetch(`/api/leave-records?${params}`);
      if (res.ok) setRecords(await res.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  React.useEffect(() => { fetchRecords(); }, [filterYear, filterMonth, filterDept]);

  const handleAddLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmployeeId || !newDate) return;
    setSaving(true);
    try {
      const res = await fetch("/api/add-leave-record", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: newEmployeeId,
          date: newDate,
          leaveType: newType,
          note: newNote,
          username: currentUser?.username
        })
      });
      if (res.ok) {
        setShowAddModal(false);
        setNewEmployeeId("");
        setNewNote("");
        fetchRecords();
      } else {
        const data = await res.json();
        alert(data.error || "เกิดข้อผิดพลาดในการบันทึก");
      }
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const handleDeleteLeave = async (id: string) => {
    if (!confirm("คุณต้องการลบรายการลานี้ใช่หรือไม่?")) return;
    try {
      const res = await fetch(`/api/delete-leave-record/${id}`, {
        method: "DELETE"
      });
      if (res.ok) fetchRecords();
    } catch (e) { console.error(e); }
  };

  const filteredRecords = records.filter(r => 
    r.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.employeeId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const years = [now.getFullYear(), now.getFullYear() - 1, now.getFullYear() - 2];
  const departments = state.departments;

  // Compute leave analytics summary
  const totalLeaveCount = filteredRecords.length;
  const leaveTypeCounts = filteredRecords.reduce((acc, r) => {
    acc[r.leaveType] = (acc[r.leaveType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topLeaveTypeEntry = Object.entries(leaveTypeCounts).sort((a, b) => b[1] - a[1])[0];
  const topLeaveTypeName = topLeaveTypeEntry ? (LEAVE_TYPES[topLeaveTypeEntry[0]] || topLeaveTypeEntry[0]) : "ไม่มี";

  // Top absentees calculation
  const empLeaveCounts = filteredRecords.reduce((acc, r) => {
    acc[r.employeeId] = acc[r.employeeId] || { id: r.employeeId, name: r.employeeName, count: 0, deptId: r.deptId };
    acc[r.employeeId].count += 1;
    return acc;
  }, {} as Record<string, { id: string; name: string; count: number; deptId: string }>);

  const topAbsentees = Object.values(empLeaveCounts).sort((a, b) => b.count - a.count).slice(0, 5);
  const topAbsenteeUser = topAbsentees[0];

  return (
    <div className="w-full max-w-full min-w-0 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shrink-0">
            <span className="text-white text-lg">📝</span>
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-800">ประวัติและการวิเคราะห์การลางานพนักงาน (Leave Analytics)</h3>
            <p className="text-xs text-slate-500 mt-0.5">ระบบจัดการและวิเคราะห์สถิติการลาป่วย ลากิจ และพักร้อนของบุคลากรในองค์กร</p>
          </div>
        </div>
        <button
          onClick={() => {
            if (state.employees.length > 0) {
              setNewEmployeeId(state.employees[0].id);
            }
            setShowAddModal(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-indigo-500/10 cursor-pointer min-h-[40px] shrink-0 self-stretch sm:self-auto justify-center"
        >
          <span>+ บันทึกการลาใหม่</span>
        </button>
      </div>

      {/* Leave Analytics Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        
        {/* KPI Cards */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-3">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">📊 สถิติรวมการลางาน</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-slate-600 font-medium">จำนวนครั้งการลาทั้งหมด:</span>
              <span className="text-2xl font-black text-indigo-600 font-mono">{totalLeaveCount} <span className="text-xs font-bold text-slate-400">ครั้ง</span></span>
            </div>
            <div className="flex justify-between items-baseline pt-2 border-t border-slate-100">
              <span className="text-xs text-slate-600 font-medium">ประเภทการลาสูงสุด:</span>
              <span className="text-xs font-extrabold text-red-600 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200">{topLeaveTypeName} ({topLeaveTypeEntry ? topLeaveTypeEntry[1] : 0} ครั้ง)</span>
            </div>
            <div className="flex justify-between items-baseline pt-2 border-t border-slate-100">
              <span className="text-xs text-slate-600 font-medium">พนักงานที่ลาสูงสุด:</span>
              <span className="text-xs font-bold text-slate-800">{topAbsenteeUser ? `${topAbsenteeUser.name} (${topAbsenteeUser.count} ครั้ง)` : "-"}</span>
            </div>
          </div>
        </div>

        {/* Leave Types Breakdown Bar Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">📈 สัดส่วนประเภทการลา (Leave Types)</h4>
          <div className="space-y-2.5 pt-1">
            {[
              { type: "sick", label: "ลาป่วย (Sick Leave)", color: "bg-red-500", count: leaveTypeCounts["sick"] || 0 },
              { type: "personal", label: "ลากิจ (Personal Leave)", color: "bg-amber-500", count: leaveTypeCounts["personal"] || 0 },
              { type: "vacation", label: "พักร้อน (Vacation)", color: "bg-emerald-500", count: leaveTypeCounts["vacation"] || 0 },
              { type: "other", label: "อื่นๆ (Other)", color: "bg-indigo-500", count: leaveTypeCounts["other"] || 0 }
            ].map(item => {
              const pct = totalLeaveCount > 0 ? Math.round((item.count / totalLeaveCount) * 100) : 0;
              return (
                <div key={item.type} className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold text-slate-700">
                    <span>{item.label}</span>
                    <span className="font-mono">{item.count} ครั้ง ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div style={{ width: `${pct}%` }} className={`h-full ${item.color} rounded-full transition-all`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Absentees Leaderboard */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">🏆 พนักงานที่มีสถิติการลางานสูงสุด (Top Absentees)</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {topAbsentees.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">ไม่มีประวัติการลางาน</p>
            ) : topAbsentees.map((emp, idx) => (
              <div key={emp.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2.5">
                  <span className={`w-5 h-5 rounded-full text-[10px] font-extrabold flex items-center justify-center ${idx === 0 ? "bg-amber-500 text-white" : "bg-slate-200 text-slate-600"}`}>
                    {idx + 1}
                  </span>
                  <EmployeeAvatar empId={emp.id} empName={emp.name} className="w-7 h-7 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-slate-800">{emp.name}</p>
                    <p className="text-[9px] text-slate-400 font-mono">{emp.id}</p>
                  </div>
                </div>
                <span className="text-xs font-black text-red-600 font-mono bg-red-50 px-2 py-0.5 rounded-lg border border-red-100">
                  {emp.count} ครั้ง
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-wrap items-center gap-3">
        <select
          value={filterYear}
          onChange={e => setFilterYear(Number(e.target.value))}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
        >
          {years.map(y => <option key={y} value={y}>ปี {y}</option>)}
        </select>

        <select
          value={filterMonth}
          onChange={e => {
            const v = e.target.value;
            setFilterMonth(v === "all" ? "all" : Number(v));
          }}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
        >
          <option value="all">ทุกเดือน</option>
          {MONTH_TH.slice(1).map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
        </select>

        {fullAccess && (
          <select
            value={filterDept}
            onChange={e => setFilterDept(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="all">ทุกแผนก</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>{d.nameTh}</option>
            ))}
          </select>
        )}

        <input
          type="text"
          placeholder="ค้นหาชื่อหรือรหัสพนักงาน..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none w-56 placeholder-slate-400"
        />
        
        <div className="ml-auto bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-2 text-xs font-bold text-indigo-700">
          วันลาทั้งหมด: <span className="text-lg font-black">{filteredRecords.length}</span> ครั้ง
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto no-scrollbar touch-pan-x w-full max-w-full min-w-0">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-3 text-left font-bold text-slate-600">วันที่ลา</th>
                <th className="px-4 py-3 text-left font-bold text-slate-600">รหัสพนักงาน</th>
                <th className="px-4 py-3 text-left font-bold text-slate-600">ชื่อพนักงาน</th>
                <th className="px-4 py-3 text-left font-bold text-slate-600">แผนก</th>
                <th className="px-4 py-3 text-center font-bold text-slate-600">ประเภทการลา</th>
                <th className="px-4 py-3 text-left font-bold text-slate-600">หมายเหตุ / รายละเอียด</th>
                <th className="px-4 py-3 text-center font-bold text-slate-600">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-slate-400">กำลังโหลดข้อมูล...</td></tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-4xl">📝</span>
                      <p className="text-sm font-bold text-slate-500">ไม่พบประวัติการลางาน</p>
                      <p className="text-xs text-slate-400">กดปุ่ม "+ บันทึกการลาใหม่" เพื่อเริ่มต้นบันทึกการลาพนักงาน</p>
                    </div>
                  </td>
                </tr>
              ) : filteredRecords.map(r => (
                <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3 text-slate-700 font-mono font-bold">{r.date}</td>
                  <td className="px-4 py-3 text-slate-500 font-mono">{r.employeeId}</td>
                  <td className="px-4 py-3 font-semibold text-slate-800">{r.employeeName}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {departments.find(d => d.id === r.deptId)?.nameTh || r.deptId}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full border font-extrabold text-[10px] ${
                      r.leaveType === "sick" ? "bg-red-50 text-red-700 border-red-200" :
                      r.leaveType === "personal" ? "bg-amber-50 text-amber-700 border-amber-200" :
                      r.leaveType === "vacation" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                      "bg-slate-50 text-slate-700 border-slate-200"
                    }`}>
                      {LEAVE_TYPES[r.leaveType] || r.leaveType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 font-medium">{r.note || "-"}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleDeleteLeave(r.id)}
                      className="px-2.5 py-1 text-[10px] font-extrabold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    >
                      ลบ
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Leave Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-extrabold text-slate-800 text-sm">บันทึกประวัติการลางานใหม่</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleAddLeave} className="p-6 space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">เลือกพนักงาน</label>
                <select
                  value={newEmployeeId}
                  onChange={e => setNewEmployeeId(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-850 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors cursor-pointer"
                >
                  {state.employees.map(e => (
                    <option key={e.id} value={e.id}>{e.id} - {e.name} ({departments.find(d => d.id === e.deptId)?.name || e.deptId})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">วันที่หยุดงาน</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={e => setNewDate(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-850 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">ประเภทการลา</label>
                <select
                  value={newType}
                  onChange={e => setNewType(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-850 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors cursor-pointer"
                >
                  <option value="vacation">ลาพักร้อน (Vacation)</option>
                  <option value="sick">ลาป่วย (Sick Leave)</option>
                  <option value="personal">ลากิจ (Personal Leave)</option>
                  <option value="other">อื่นๆ (Other)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">หมายเหตุ / รายละเอียด</label>
                <textarea
                  value={newNote}
                  onChange={e => setNewNote(e.target.value)}
                  rows={3}
                  placeholder="เช่น ลาป่วยใบรับรองแพทย์, ลากิจไปทำธุระส่วนตัว..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-850 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors resize-none placeholder-slate-400"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-500/10"
                >
                  {saving ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function OtRecordsView({ currentUser, state }: { currentUser: any; state: AppState }) {
  const fullAccess = ["HR", "HR Section Manager", "Operation Dir", "Operation Depart", "ผู้ดูแลระบบ"].includes(currentUser?.role);
  const now = new Date();
  const [filterYear, setFilterYear] = React.useState(now.getFullYear());
  const [filterMonth, setFilterMonth] = React.useState(now.getMonth() + 1);
  const [filterDept, setFilterDept] = React.useState(fullAccess ? "all" : (currentUser?.deptId || "all"));
  const [records, setRecords] = React.useState<OtRecord[]>([]);
  const [loading, setLoading] = React.useState(false);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        year: String(filterYear),
        month: String(filterMonth),
        deptId: filterDept
      });
      const res = await fetch(`/api/ot-records?${params}`);
      if (res.ok) setRecords(await res.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  React.useEffect(() => { fetchRecords(); }, [filterYear, filterMonth, filterDept]);

  const handleExportOtRecordsCsv = () => {
    if (records.length === 0) { alert("ไม่มีข้อมูล OT สำหรับส่งออก"); return; }
    const esc = (v: any) => { const s = String(v ?? "").replace(/"/g, '""'); return `"${s}"`; };
    let csv = "\ufeff"; // BOM for Excel Thai
    csv += "วันที่,รหัสพนักงาน,ชื่อพนักงาน,แผนก,รหัสกะ,ชั่วโมง OT\n";
    records.forEach(r => {
      csv += [
        esc(r.date), esc(r.employeeId), esc(r.employeeName),
        esc(DEPT_LABELS[r.deptId] || r.deptId), esc(r.shiftCode), r.otHours
      ].join(",") + "\n";
    });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `OT_Records_${filterYear}_${String(filterMonth).padStart(2,"0")}_${filterDept === "all" ? "ทุกแผนก" : (DEPT_LABELS[filterDept] || filterDept)}.csv`;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  };

  const totalOt = records.reduce((s, r) => s + r.otHours, 0);

  const years = [now.getFullYear(), now.getFullYear() - 1, now.getFullYear() - 2];

  return (
    <div className="w-full max-w-full min-w-0 space-y-4 sm:space-y-6 font-sans">
      {/* Header */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shrink-0">
            <span className="text-white text-lg">📋</span>
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-800">ประวัติ OT จากกะทำงาน</h3>
            <p className="text-xs text-slate-500 mt-0.5">ระบบบันทึก OT อัตโนมัติจากรหัสกะ — M12/A12/N12=4ชม., M16/N16/OND=8ชม.</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 shadow-sm flex flex-wrap items-center gap-2.5 sm:gap-3">
        <select
          value={filterYear}
          onChange={e => setFilterYear(Number(e.target.value))}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
        >
          {years.map(y => <option key={y} value={y}>ปี {y}</option>)}
        </select>

        <select
          value={filterMonth}
          onChange={e => setFilterMonth(Number(e.target.value))}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
        >
          {MONTH_TH.slice(1).map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
        </select>

        {fullAccess && (
          <select
            value={filterDept}
            onChange={e => setFilterDept(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
          >
            <option value="all">ทุกแผนก</option>
            {Object.entries(DEPT_LABELS).map(([id, name]) => (
              <option key={id} value={id}>{name}</option>
            ))}
          </select>
        )}

        <div className="w-full sm:w-auto sm:ml-auto flex items-center justify-between sm:justify-end gap-2">
          <div className="bg-blue-50 border border-blue-100 rounded-xl px-3 sm:px-4 py-2 text-xs font-bold text-blue-700">
            OT รวม: <span className="text-base sm:text-lg font-black">{totalOt.toFixed(1)}</span> ชม.
          </div>
          <button
            onClick={handleExportOtRecordsCsv}
            className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm cursor-pointer min-h-[40px]"
            title="ส่งออกรายการ OT เป็นไฟล์ CSV"
          >
            <span>⬇</span>
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto no-scrollbar touch-pan-x w-full max-w-full min-w-0">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-3 text-left font-bold text-slate-600">วันที่</th>
                <th className="px-4 py-3 text-left font-bold text-slate-600">รหัสพนักงาน</th>
                <th className="px-4 py-3 text-left font-bold text-slate-600">ชื่อพนักงาน</th>
                <th className="px-4 py-3 text-left font-bold text-slate-600">แผนก</th>
                <th className="px-4 py-3 text-center font-bold text-slate-600">รหัสกะ</th>
                <th className="px-4 py-3 text-center font-bold text-slate-600">OT (ชม.)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-400">กำลังโหลด...</td></tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-4xl">📋</span>
                      <p className="text-sm font-bold text-slate-500">ไม่มีข้อมูล OT</p>
                      <p className="text-xs text-slate-400">บันทึกกะที่มี OT ในหน้า "จัดการตารางกะ" เพื่อให้ข้อมูลปรากฏที่นี่</p>
                    </div>
                  </td>
                </tr>
              ) : records.map(r => (
                <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3 text-slate-700 font-mono">{r.date}</td>
                  <td className="px-4 py-3 text-slate-500 font-mono">{r.employeeId}</td>
                  <td className="px-4 py-3 font-semibold text-slate-800">{r.employeeName}</td>
                  <td className="px-4 py-3 text-slate-600">{DEPT_LABELS[r.deptId] || r.deptId}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded-lg border font-extrabold text-xs ${getShiftStyle(r.shiftCode)}`}>
                      {r.shiftCode}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="font-extrabold text-blue-700">{r.otHours}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {records.length > 0 && (
          <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
            <span className="text-xs text-slate-500">{records.length} รายการ</span>
            <span className="text-xs font-bold text-blue-700">OT รวม {totalOt.toFixed(1)} ชั่วโมง</span>
          </div>
        )}
      </div>
    </div>
  );
}

function EmployeeAvatar({ empId, empName, avatarUrl, className = "w-9 h-9" }: { empId: string; empName?: string; avatarUrl?: string; className?: string }) {
  const [error, setError] = useState(false);
  
  useEffect(() => {
    setError(false);
  }, [empId, avatarUrl]);

  const initials = empName ? empName.substring(0, 2) : (empId ? empId.substring(0, 2).toUpperCase() : "??");
  const cleanId = String(empId || "").trim();
  const defaultImgUrl = cleanId ? `https://intranet.advanceagro.net/employeecard/empimages/${cleanId}.jpg` : "";
  // Strictly filter out ui-avatars.com and use intranet.advanceagro.net corporate image URL
  const srcUrl = (avatarUrl && !avatarUrl.includes("ui-avatars.com")) ? avatarUrl : defaultImgUrl;

  return (error || !srcUrl) ? (
    <div className={`${className} rounded-full bg-blue-600 border border-blue-200 text-white font-extrabold flex items-center justify-center text-xs flex-shrink-0 shadow-sm`}>
      {initials}
    </div>
  ) : (
    <img 
      src={srcUrl} 
      alt={empName || empId}
      onError={() => setError(true)}
      className={`${className} rounded-full object-cover border border-slate-200 flex-shrink-0 shadow-sm`}
    />
  );
}

function HrDirectEditorView({ 
  currentUser, 
  state, 
  jobValueRecords, 
  setJobValueRecords, 
  fetchJobValueRecords 
}: { 
  currentUser: any; 
  state: AppState; 
  jobValueRecords: JobValueRecord[]; 
  setJobValueRecords: React.Dispatch<React.SetStateAction<JobValueRecord[]>>; 
  fetchJobValueRecords: () => void; 
}) {
  const isHrOrFullAccess = ["HR", "HR Section Manager", "Operation Dir", "Operation Depart", "ผู้ดูแลระบบ", "Admin", "Co-admin", "Co-Admin"].includes(currentUser?.role || "");
  const userDeptName = !isHrOrFullAccess && currentUser?.deptId ? getDeptName(currentUser.deptId, state?.departments) : "all";

  const [editingRecords, setEditingRecords] = useState<any[]>([]);
  const [filterDept, setFilterDept] = useState<string>(userDeptName);
  const [search, setSearch] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRec, setNewRec] = useState({
    empId: "",
    empName: "",
    position: "",
    department: !isHrOrFullAccess && currentUser?.deptId ? getDeptName(currentUser.deptId, state?.departments) : "INTER 2",
    status: "Active",
    avgRevenue: 0,
    avgCost: 0,
    profit2025: 0,
    profit2026: 0
  });

  useEffect(() => {
    if (jobValueRecords && jobValueRecords.length > 0) {
      setEditingRecords(JSON.parse(JSON.stringify(jobValueRecords)));
    }
  }, [jobValueRecords]);

  const handleCellChange = (empId: string, field: string, value: any) => {
    setEditingRecords(prev => prev.map(r => r.empId === empId ? { ...r, [field]: value } : r));
  };

  const handleSaveAll = async () => {
    try {
      setIsSaving(true);
      const res = await fetch("/api/job-value/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          records: editingRecords,
          role: currentUser?.role
        })
      });
      if (res.ok) {
        alert("บันทึกข้อมูลพนักงานและผลตอบแทนออนไลน์สำเร็จ!");
        fetchJobValueRecords();
      } else {
        alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      }
    } catch (e) {
      console.error(e);
      alert("ไม่สามารถเชื่อมต่อระบบได้");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateNewRecord = async () => {
    if (!newRec.empId || !newRec.empName) {
      alert("กรุณากรอกรหัสพนักงานและชื่อพนักงาน");
      return;
    }
    const createdObj = {
      id: `JV-${newRec.empId}`,
      ...newRec,
      monthlyRevenue: Array(12).fill(Math.round(newRec.avgRevenue)),
      monthlyCost: Array(12).fill(Math.round(newRec.avgCost)),
      monthlyProfit: Array(12).fill(Math.round(newRec.profit2026 / 12))
    };

    const updated = [createdObj, ...editingRecords];
    setEditingRecords(updated);
    setShowAddModal(false);

    try {
      setIsSaving(true);
      const res = await fetch("/api/job-value/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          records: updated,
          role: currentUser?.role
        })
      });
      if (res.ok) {
        alert("เพิ่มและบันทึกพนักงานใหม่เรียบร้อยแล้ว!");
        fetchJobValueRecords();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRow = (empId: string) => {
    if (!confirm(`คุณต้องการลบข้อมูลพนักงานรหัส ${empId} หรือไม่?`)) return;
    const updated = editingRecords.filter(r => r.empId !== empId);
    setEditingRecords(updated);
  };

  const filteredRecords = editingRecords.filter(r => {
    // 1. Department Permission Scoping for Section Manager
    if (!isHrOrFullAccess && currentUser?.deptId) {
      const userDeptId = normalizeDeptId(currentUser.deptId);
      const recDeptId = normalizeDeptId(r.deptId || r.department);
      if (recDeptId !== userDeptId && r.department !== getDeptName(currentUser.deptId, state?.departments)) {
        return false;
      }
    }

    // 2. Filter out Inactive / Resigned / Retired employees
    const isInactive = r.status === "Inactive" || r.status === "Resigned" || r.status === "Retired" || r.status === "พ้นสภาพ" || r.status === "ลาออก" || r.status === "เกษียณ";
    if (isInactive) return false;

    // 3. Department Tab Filter
    if (filterDept !== "all") {
      const targetDeptId = normalizeDeptId(filterDept);
      const recDeptId = normalizeDeptId(r.deptId || r.department);
      if (r.department !== filterDept && recDeptId !== targetDeptId) {
        return false;
      }
    }

    // 4. Search Filter
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchId = String(r.empId || "").toLowerCase().includes(q);
      const matchName = String(r.empName || "").toLowerCase().includes(q);
      const matchPos = String(r.position || "").toLowerCase().includes(q);
      if (!matchId && !matchName && !matchPos) return false;
    }

    return true;
  });

  return (
    <div className="w-full max-w-full min-w-0 space-y-4 sm:space-y-6">
      {/* Header Card */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-base sm:text-lg font-black text-slate-800 flex items-center gap-2">
            <FileText className="w-5 h-5 text-slate-800 shrink-0" />
            <span>ศูนย์จัดการแก้ไขข้อมูลพนักงานและผลตอบแทนออนไลน์ (HR Web Direct Editor)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            แก้ไขข้อมูล รายได้ ต้นทุน และกำไรของพนักงานบนเว็บได้ทันทีโดยไม่ต้องอัปโหลดไฟล์ CSV ใหม่
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          {isHrOrFullAccess && (
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs transition-all shadow-sm flex items-center gap-2 cursor-pointer min-h-[40px]"
            >
              <span>เพิ่มพนักงานใหม่</span>
            </button>
          )}
          <button
            type="button"
            onClick={handleSaveAll}
            disabled={isSaving}
            className="px-4 sm:px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50 min-h-[40px]"
          >
            <span>{isSaving ? "กำลังบันทึก..." : "บันทึกการแก้ไขไปยัง D1 Database"}</span>
          </button>
        </div>
      </div>

      {/* Filter & Department Selector Tabs Toolbar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Department Filter Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200/60 overflow-x-auto no-scrollbar touch-pan-x max-w-full">
            {isHrOrFullAccess && (
              <button
                type="button"
                onClick={() => setFilterDept("all")}
                className={`shrink-0 whitespace-nowrap px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filterDept === "all"
                    ? "bg-white text-blue-700 shadow-sm font-extrabold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                ทุกแผนก (ทั้งหมด)
              </button>
            )}

            {["INTER 2", "INTER 3", "INTER 5", "INTER 7", "Heavy Machine", "ECC"].map(dept => {
              const deptIdVal = normalizeDeptId(dept);
              const managerDeptId = normalizeDeptId(currentUser?.deptId);
              const isAllowed = isHrOrFullAccess || managerDeptId === deptIdVal;

              if (!isHrOrFullAccess && managerDeptId !== deptIdVal) return null;

              return (
                <button
                  key={dept}
                  type="button"
                  onClick={() => isAllowed && setFilterDept(dept)}
                  disabled={!isAllowed}
                  className={`shrink-0 whitespace-nowrap px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    filterDept === dept
                      ? "bg-blue-600 text-white shadow-sm font-extrabold"
                      : "bg-transparent text-slate-600 hover:bg-white/60"
                  }`}
                >
                  แผนก {dept}
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="flex items-center gap-2 bg-slate-50 px-3.5 py-2 border border-slate-200 rounded-2xl w-full md:w-72 shadow-inner">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="ค้นหารหัส, ชื่อ, ตำแหน่ง..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-xs font-bold text-slate-700 focus:outline-none"
            />
          </div>
        </div>

        {!isHrOrFullAccess && (
          <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-xs font-bold flex items-center gap-2">
            <span>สิทธิ์ผู้จัดการแผนก: ระบบแสดงผลและอนุญาตให้แก้ไขเฉพาะพนักงานในสังกัด {getDeptName(currentUser?.deptId, state?.departments)} เท่านั้น</span>
          </div>
        )}
      </div>

      {/* Interactive Spreadsheet Table */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto no-scrollbar touch-pan-x w-full max-w-full min-w-0">
          <table className="w-full text-left border-collapse text-xs min-w-[1100px]">
            <thead>
              <tr className="bg-[#f1f5f9] border-b border-slate-200 text-[11px] font-black text-slate-700 uppercase">
                <th className="p-3 w-28 font-mono">รหัสพนักงาน</th>
                <th className="p-3 min-w-[160px]">ชื่อ-นามสกุล</th>
                <th className="p-3 min-w-[130px]">ตำแหน่ง</th>
                <th className="p-3 w-36">แผนก</th>
                <th className="p-3 text-right text-emerald-700 font-extrabold w-36">รายได้เฉลี่ย/เดือน</th>
                <th className="p-3 text-right text-rose-700 font-extrabold w-36">ต้นทุนเฉลี่ย/เดือน</th>
                <th className="p-3 text-right text-slate-600 font-bold w-32">กำไร 2568</th>
                <th className="p-3 text-right text-blue-700 font-black w-32">กำไร 2569</th>
                <th className="p-3 text-center w-20">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {filteredRecords.map((r, idx) => (
                <tr key={r.empId || idx} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-2">
                    <input
                      type="text"
                      value={r.empId || ""}
                      onChange={(e) => handleCellChange(r.empId, "empId", e.target.value)}
                      className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 font-mono"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      value={r.empName || ""}
                      onChange={(e) => handleCellChange(r.empId, "empName", e.target.value)}
                      className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900 font-sans"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      value={r.position || ""}
                      onChange={(e) => handleCellChange(r.empId, "position", e.target.value)}
                      className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 font-sans"
                    />
                  </td>
                  <td className="p-2">
                    <select
                      value={r.department || "INTER 2"}
                      disabled={!isHrOrFullAccess}
                      onChange={(e) => handleCellChange(r.empId, "department", e.target.value)}
                      className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 font-sans disabled:opacity-75"
                    >
                      <option value="INTER 2">INTER 2</option>
                      <option value="INTER 3">INTER 3</option>
                      <option value="INTER 5">INTER 5</option>
                      <option value="INTER 7">INTER 7</option>
                      <option value="Heavy Machine">Heavy Machine</option>
                      <option value="ECC">ECC</option>
                    </select>
                  </td>
                    <td className="p-2 text-center">
                      <select
                        value={r.status || "Active"}
                        onChange={(e) => handleCellChange(idx, "status", e.target.value)}
                        className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-extrabold text-slate-700 font-sans"
                      >
                        <option value="Active">🟢 ปฏิบัติงาน</option>
                        <option value="Inactive">🔴 พ้นสภาพ</option>
                      </select>
                    </td>
                    <td className="p-2 text-right">
                      <input
                        type="number"
                        value={r.avgRevenue ?? 0}
                        onChange={(e) => handleCellChange(idx, "avgRevenue", Number(e.target.value))}
                        className="w-full px-2 py-1 bg-emerald-50/50 border border-emerald-200 rounded-lg text-xs font-black text-emerald-700 text-right"
                      />
                    </td>
                    <td className="p-2 text-right">
                      <input
                        type="number"
                        value={r.avgCost ?? 0}
                        onChange={(e) => handleCellChange(idx, "avgCost", Number(e.target.value))}
                        className="w-full px-2 py-1 bg-rose-50/50 border border-rose-200 rounded-lg text-xs font-black text-rose-700 text-right"
                      />
                    </td>
                    <td className="p-2 text-right">
                      <input
                        type="number"
                        value={r.profit2025 ?? 0}
                        onChange={(e) => handleCellChange(idx, "profit2025", Number(e.target.value))}
                        className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 text-right"
                      />
                    </td>
                    <td className="p-2 text-right">
                      <input
                        type="number"
                        value={r.profit2026 ?? 0}
                        onChange={(e) => handleCellChange(idx, "profit2026", Number(e.target.value))}
                        className="w-full px-2 py-1 bg-blue-50/50 border border-blue-200 rounded-lg text-xs font-black text-blue-700 text-right"
                      />
                    </td>
                    <td className="p-2 text-center">
                      <button
                        type="button"
                        onClick={() => handleDeleteRow(r.empId)}
                        className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                        title="ลบแถวนี้"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Employee Record Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200 flex flex-col">
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h3 className="text-base font-black text-slate-900">➕ เพิ่มพนักงานและผลตอบแทนใหม่</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs font-sans">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">รหัสพนักงาน *</label>
                  <input
                    type="text"
                    value={newRec.empId}
                    onChange={(e) => setNewRec({ ...newRec, empId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold font-mono"
                    placeholder="เช่น 535743"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ชื่อ-นามสกุล *</label>
                  <input
                    type="text"
                    value={newRec.empName}
                    onChange={(e) => setNewRec({ ...newRec, empName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                    placeholder="เช่น นายอาทิตย์ มั่นยืน"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ตำแหน่งงาน</label>
                  <input
                    type="text"
                    value={newRec.position}
                    onChange={(e) => setNewRec({ ...newRec, position: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                    placeholder="เช่น O&M Specialist"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">แผนก</label>
                  <select
                    value={newRec.department}
                    onChange={(e) => setNewRec({ ...newRec, department: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="INTER 2">INTER 2</option>
                    <option value="INTER 3">INTER 3</option>
                    <option value="INTER 5">INTER 5</option>
                    <option value="INTER 7">INTER 7</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">รายได้เฉลี่ย/เดือน</label>
                  <input
                    type="number"
                    value={newRec.avgRevenue}
                    onChange={(e) => setNewRec({ ...newRec, avgRevenue: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-emerald-50/50 border border-emerald-200 rounded-xl font-bold font-mono text-emerald-700"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ต้นทุนเฉลี่ย/เดือน</label>
                  <input
                    type="number"
                    value={newRec.avgCost}
                    onChange={(e) => setNewRec({ ...newRec, avgCost: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-rose-50/50 border border-rose-200 rounded-xl font-bold font-mono text-rose-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">กำไรสะสมปี 2568 (2025)</label>
                  <input
                    type="number"
                    value={newRec.profit2025}
                    onChange={(e) => setNewRec({ ...newRec, profit2025: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">กำไรสะสมปี 2569 (2026)</label>
                  <input
                    type="number"
                    value={newRec.profit2026}
                    onChange={(e) => setNewRec({ ...newRec, profit2026: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-blue-50/50 border border-blue-200 rounded-xl font-bold font-mono text-blue-700"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={handleCreateNewRecord}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-extrabold cursor-pointer"
                >
                  บันทึกสร้างพนักงาน
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  // Login & Session States
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(
    localStorage.getItem("adminLoggedIn") === "true"
  );
  const [currentUser, setCurrentUser] = useState<any>(() => {
    try {
      const saved = localStorage.getItem("currentUser");
      if (saved && saved !== "undefined") {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to parse currentUser from localStorage", e);
    }
    return { 
      username: "admin",
      name: "คุณสิทธิศักดิ์ พ.", 
      role: "ผู้ดูแลระบบ", 
      deptId: "all",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAf5UhzQFkBl2tAqPIfYe5tF5JObtrReGu_lohxjpxav5OEjcmmCJhPclOvd2pYN5Q63ircrUY62HYEtYICs05VEFPgL0t4CQSbr1dUS_veJddqwvCz2hrMENO5DyK5fUo9Lx_K8EQj_RXIf9a91CYGwMUZftntpoCZ5n7RUAnxYNIsXz71ttH1VvWFLTpEggMdONt3b-WOccq3oi4S33bsL6DAyTg_90K2vzyRwxDzf3Isscur4MrcuQ" 
    };
  });
  const [loginUsername, setLoginUsername] = useState<string>("");
  const [loginPassword, setLoginPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string>("");
  const [loginLoading, setLoginLoading] = useState<boolean>(false);

  // Layout States
  const [isSidebarHidden, setIsSidebarHidden] = useState<boolean>(false);

  // New Employee Input States
  const [newEmpId, setNewEmpId] = useState<string>("");

  // Profile Edit States
  const [profileName, setProfileName] = useState<string>(currentUser?.name || "");
  const [profileAvatar, setProfileAvatar] = useState<string>(currentUser?.avatar || "");
  const [profilePassword, setProfilePassword] = useState<string>("");
  const [profileConfirmPassword, setProfileConfirmPassword] = useState<string>("");
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string>("");
  const [profileErrorMsg, setProfileErrorMsg] = useState<string>("");

  useEffect(() => {
    if (currentUser) {
      setProfileName(currentUser.name);
      setProfileAvatar(currentUser.avatar);
    }
  }, [currentUser]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileErrorMsg("");
    setProfileSuccessMsg("");
    if (profilePassword && profilePassword !== profileConfirmPassword) {
      setProfileErrorMsg("รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน");
      return;
    }
    try {
      const res = await fetch("/api/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: currentUser?.username,
          name: profileName,
          avatar: profileAvatar,
          password: profilePassword || undefined
        })
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("currentUser", JSON.stringify(data.user));
        setCurrentUser(data.user);
        setProfilePassword("");
        setProfileConfirmPassword("");
        setProfileSuccessMsg("อัปเดตข้อมูลโปรไฟล์ส่วนตัวสำเร็จ!");
      } else {
        setProfileErrorMsg("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      }
    } catch (err) {
      setProfileErrorMsg("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    }
  };

  // User accounts management states
  const [accounts, setAccounts] = useState<any[]>([]);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState<boolean>(false);
  const [resetTargetUsername, setResetTargetUsername] = useState<string>("");
  const [newResetPassword, setNewResetPassword] = useState<string>("");

  const [showAddAccountModal, setShowAddAccountModal] = useState<boolean>(false);
  const [newAccountUsername, setNewAccountUsername] = useState<string>("");
  const [newAccountPassword, setNewAccountPassword] = useState<string>("");
  const [newAccountName, setNewAccountName] = useState<string>("");
  const [newAccountRole, setNewAccountRole] = useState<string>("Section Manager");
  const [newAccountDeptId, setNewAccountDeptId] = useState<string>("inter2");
  const [newAccountAvatar, setNewAccountAvatar] = useState<string>("");
  const [newAccountCanBackup, setNewAccountCanBackup] = useState<boolean>(false);

  const [showEditAccountModal, setShowEditAccountModal] = useState<boolean>(false);
  const [editAccountOriginalUsername, setEditAccountOriginalUsername] = useState<string>("");
  const [editAccountUsername, setEditAccountUsername] = useState<string>("");
  const [editAccountName, setEditAccountName] = useState<string>("");
  const [editAccountRole, setEditAccountRole] = useState<string>("");
  const [editAccountDeptId, setEditAccountDeptId] = useState<string>("");
  const [editAccountAvatar, setEditAccountAvatar] = useState<string>("");
  const [editAccountCanBackup, setEditAccountCanBackup] = useState<boolean>(false);

  const handleAutoPullEmployeePhoto = (empKey: string, mode: "edit" | "add") => {
    if (!empKey) return;
    const clean = empKey.trim().toLowerCase();
    const emp = state.employees.find(e => 
      String(e.id).trim().toLowerCase() === clean || 
      String(e.name).trim().toLowerCase().includes(clean) ||
      String(e.id).trim().toLowerCase().includes(clean)
    );

    const empId = emp ? emp.id : clean;
    const photoUrl = `https://intranet.advanceagro.net/employeecard/empimages/${empId}.jpg`;

    if (emp) {
      if (mode === "edit") {
        setEditAccountUsername(emp.id || editAccountUsername);
        setEditAccountName(emp.name);
        setEditAccountAvatar(photoUrl);
        if (emp.deptId) setEditAccountDeptId(emp.deptId);
      } else {
        setNewAccountUsername(emp.id);
        setNewAccountName(emp.name);
        setNewAccountAvatar(photoUrl);
        if (emp.deptId) setNewAccountDeptId(emp.deptId);
      }
    } else {
      if (mode === "edit") {
        setEditAccountAvatar(photoUrl);
      } else {
        setNewAccountAvatar(photoUrl);
      }
    }
  };

  const fetchAccounts = async () => {
    try {
      const res = await fetch("/api/portal-state");
      if (res.ok) {
        const data = await res.json();
        if (data.accounts && Array.isArray(data.accounts) && data.accounts.length > 0) {
          setAccounts(data.accounts);
        }
      }
    } catch (err) {
      console.error("Failed to fetch accounts:", err);
    }
  };

  const handleUpdateAccountPermission = async (targetUsername: string, role: string, deptId: string) => {
    try {
      const acc = accounts.find(a => a.username === targetUsername);
      const res = await fetch("/api/update-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: targetUsername,
          name: acc?.name || targetUsername,
          role,
          deptId,
          avatar: `https://intranet.advanceagro.net/employeecard/empimages/${targetUsername}.jpg`,
          canBackup: acc?.canBackup ? true : false
        })
      });
      if (res.ok) {
        await fetchAccounts();
        alert("อัปเดตสิทธิ์การเข้าถึงและความรับผิดชอบของบัญชีใน D1 Database สำเร็จ!");
      }
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการปรับเปลี่ยนสิทธิ์");
    }
  };

  const handleResetAccountPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResetPassword) {
      alert("กรุณากรอกรหัสผ่านใหม่");
      return;
    }
    try {
      setResetPasswordLoading(true);
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: resetTargetUsername, password: newResetPassword })
      });
      if (res.ok) {
        setNewResetPassword("");
        setShowResetPasswordModal(false);
        await fetchAccounts();
        alert(`รีเซ็ตรหัสผ่านของบัญชี "${resetTargetUsername}" ใน D1 Database เรียบร้อยแล้ว!`);
      } else {
        const err = await res.json();
        alert(`เกิดข้อผิดพลาด: ${err.error}`);
      }
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setResetPasswordLoading(false);
    }
  };

  const handleAddAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccountUsername || !newAccountName) {
      alert("กรุณากรอก Username และชื่อผู้ใช้งาน");
      return;
    }

    const newAcc = {
      username: newAccountUsername,
      password: newAccountPassword || "123456",
      name: newAccountName,
      role: newAccountRole,
      deptId: newAccountDeptId,
      avatar: newAccountAvatar || `https://intranet.advanceagro.net/employeecard/empimages/${newAccountUsername}.jpg`,
      canBackup: newAccountCanBackup ? 1 : 0
    };

    try {
      setAddAccountLoading(true);
      // Optimistically add to state immediately
      setAccounts(prev => {
        const filtered = prev.filter(a => a.username !== newAccountUsername);
        return [newAcc, ...filtered];
      });

      const res = await fetch("/api/add-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAcc)
      });
      if (res.ok) {
        setShowAddAccountModal(false);
        setNewAccountUsername("");
        setNewAccountPassword("");
        setNewAccountName("");
        setNewAccountAvatar("");
        await fetchAccounts();
        alert("เพิ่มบัญชีผู้ใช้งานใหม่ลง D1 Database สำเร็จ!");
      } else {
        const err = await res.json().catch(() => ({}));
        await fetchAccounts();
        alert(err.error || "เกิดข้อผิดพลาดในการเพิ่มบัญชี");
      }
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setAddAccountLoading(false);
    }
  };

  const handleDeleteAccount = async (targetUsername: string) => {
    if (!window.confirm(`⚠️ คุณแน่ใจหรือไม่ว่าต้องการลบบัญชี "${targetUsername}" ออกจากระบบ?`)) {
      return;
    }
    try {
      setAccounts(prev => prev.filter(a => a.username !== targetUsername));
      const res = await fetch("/api/delete-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: targetUsername })
      });
      if (res.ok) {
        await fetchAccounts();
        alert(`ลบบัญชี "${targetUsername}" ใน D1 Database เรียบร้อยแล้ว`);
      } else {
        await fetchAccounts();
        alert("เกิดข้อผิดพลาดในการลบบัญชี");
      }
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    }
  };

  const handleEditAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editAccountUsername) {
      alert("กรุณากรอกชื่อผู้ใช้งาน (Username)");
      return;
    }
    if (!editAccountName) {
      alert("กรุณากรอกชื่อ-นามสกุล");
      return;
    }
    try {
      setEditAccountLoading(true);
      const finalAvatar = editAccountAvatar || `https://intranet.advanceagro.net/employeecard/empimages/${editAccountUsername}.jpg`;
      const res = await fetch("/api/update-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalUsername: editAccountOriginalUsername || editAccountUsername,
          username: editAccountUsername,
          name: editAccountName,
          role: editAccountRole,
          deptId: editAccountDeptId,
          avatar: finalAvatar,
          canBackup: editAccountCanBackup ? 1 : 0
        })
      });
      if (res.ok) {
        setAccounts(prev => prev.map(acc => {
          if (acc.username === (editAccountOriginalUsername || editAccountUsername)) {
            return {
              ...acc,
              username: editAccountUsername,
              name: editAccountName,
              role: editAccountRole,
              deptId: editAccountDeptId,
              avatar: finalAvatar,
              canBackup: editAccountCanBackup ? 1 : 0
            };
          }
          return acc;
        }));

        setShowEditAccountModal(false);
        await fetchAccounts();
        alert("อัปเดตข้อมูลบัญชีผู้ใช้ใน D1 Database สำเร็จ!");
        
        if (currentUser?.username === editAccountOriginalUsername) {
          const updatedUser = {
            username: editAccountUsername,
            name: editAccountName,
            role: editAccountRole,
            deptId: editAccountDeptId,
            avatar: finalAvatar,
            canBackup: editAccountCanBackup ? 1 : 0
          };
          localStorage.setItem("currentUser", JSON.stringify(updatedUser));
          setCurrentUser(updatedUser);
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(`เกิดข้อผิดพลาด: ${errData.error || "ไม่สามารถอัปเดตได้"}`);
      }
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setEditAccountLoading(false);
    }
  };

  const DEFAULT_ACCOUNTS = [
    { username: "admin",      password: "admin123",       name: "ผู้ดูแลระบบ",           role: "ผู้ดูแลระบบ",        deptId: "all", avatar: "", canBackup: 1 },
    { username: "hr",         password: "hr1234",         name: "HR Manager",             role: "HR",                 deptId: "all", avatar: "", canBackup: 1 },
    { username: "hr_sec",     password: "hrsec1234",      name: "HR Section Manager",     role: "HR Section Manager", deptId: "all", avatar: "", canBackup: 1 },
    { username: "op_dir",     password: "opdir1234",      name: "Operation Director",     role: "Operation Dir",      deptId: "all", avatar: "", canBackup: 0 },
    { username: "op_dept",    password: "opdept1234",     name: "Operation Department",   role: "Operation Depart",   deptId: "all", avatar: "", canBackup: 0 },
    { username: "inter2_mgr", password: "i2mgr1234",      name: "Section Manager INTER2", role: "Section Manager",    deptId: "inter2", avatar: "", canBackup: 0 },
    { username: "inter3_mgr", password: "i3mgr1234",      name: "Section Manager INTER3", role: "Section Manager",    deptId: "inter3", avatar: "", canBackup: 0 },
    { username: "inter5_mgr", password: "i5mgr1234",      name: "Section Manager INTER5", role: "Section Manager",    deptId: "inter5", avatar: "", canBackup: 0 },
    { username: "inter7_mgr", password: "i7mgr1234",      name: "Section Manager INTER7", role: "Section Manager",    deptId: "inter7", avatar: "", canBackup: 0 },
    { username: "heavy_mgr",  password: "hvmgr1234",      name: "Section Manager Heavy",  role: "Section Manager",    deptId: "heavy",  avatar: "", canBackup: 0 },
    { username: "ecc_mgr",    password: "eccmgr1234",     name: "Section Manager ECC",    role: "Section Manager",    deptId: "ecc",    avatar: "", canBackup: 0 },
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: loginUsername, password: loginPassword })
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("adminLoggedIn", "true");
        localStorage.setItem("currentUser", JSON.stringify(data.user));
        setIsLoggedIn(true);
        setCurrentUser(data.user);
        setLoginUsername("");
        setLoginPassword("");
      } else {
        const data = await res.json();
        setLoginError(data.error || "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
      }
    } catch (err) {
      // Offline / Static deployment fallback
      const found = DEFAULT_ACCOUNTS.find(a => a.username === loginUsername && a.password === loginPassword);
      if (found) {
        const user = { username: found.username, name: found.name, role: found.role, deptId: found.deptId, avatar: found.avatar, canBackup: found.canBackup };
        localStorage.setItem("adminLoggedIn", "true");
        localStorage.setItem("currentUser", JSON.stringify(user));
        setIsLoggedIn(true);
        setCurrentUser(user);
        setLoginUsername("");
        setLoginPassword("");
      } else {
        setLoginError("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
      }
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm("คุณต้องการออกจากระบบใช่หรือไม่?")) {
      localStorage.removeItem("adminLoggedIn");
      localStorage.removeItem("currentUser");
      setIsLoggedIn(false);
      setCurrentUser(null);
    }
  };

  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [isNavbarCollapsed, setIsNavbarCollapsed] = useState<boolean>(() => {
    const stored = localStorage.getItem("isNavbarCollapsed");
    return stored === null ? true : stored === "true";
  });
  useEffect(() => {
    localStorage.setItem("isNavbarCollapsed", String(isNavbarCollapsed));
  }, [isNavbarCollapsed]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [state, setState] = useState<AppState | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [stateError, setStateError] = useState<string | null>(null);
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>("ทุกแผนก");
  const [selectedMonthFilter, setSelectedMonthFilter] = useState<string>("เดือนปัจจุบัน");
  const [chartSeriesFilter, setChartSeriesFilter] = useState<{
    compare: boolean;
    spent: boolean;
    pct: boolean;
  }>({
    compare: true,
    spent: true,
    pct: true
  });
  const [daysLimit, setDaysLimit] = useState<number>(30);
  const [selectedWeek, setSelectedWeek] = useState<string>("all");
  const [showShiftLegend, setShowShiftLegend] = useState<boolean>(false);
  const [shiftsDeptFilter, setShiftsDeptFilter] = useState<string>("inter2");
  const [selectedShiftRoleFilters, setSelectedShiftRoleFilters] = useState<string[]>([]);
  const [isRoleFilterOpen, setIsRoleFilterOpen] = useState<boolean>(false);
  const activeDeptId = currentUser?.deptId || "all";
  const currentShiftsDept = activeDeptId === "all" ? shiftsDeptFilter : activeDeptId;

  useEffect(() => {
    if (currentUser && currentUser.deptId && currentUser.deptId !== "all") {
      setShiftsDeptFilter(currentUser.deptId);
    }
  }, [currentUser]);
  
  // Modals / Overlays & Submitting Loading States
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState<boolean>(false);
  const [showAiAuditModal, setShowAiAuditModal] = useState<boolean>(false);
  const [aiReportText, setAiReportText] = useState<string>("");
  const [generatingAiReport, setGeneratingAiReport] = useState<boolean>(false);

  const [resetPasswordLoading, setResetPasswordLoading] = useState<boolean>(false);
  const [addAccountLoading, setAddAccountLoading] = useState<boolean>(false);
  const [editAccountLoading, setEditAccountLoading] = useState<boolean>(false);
  const [addEmpLoading, setAddEmpLoading] = useState<boolean>(false);

  // OT Request & Approval State
  const [otRequests, setOtRequests] = useState<any[]>([]);
  const [showOtRequestModal, setShowOtRequestModal] = useState<boolean>(false);
  const [newOtReqEmpId, setNewOtReqEmpId] = useState<string>("");
  const [newOtReqDate, setNewOtReqDate] = useState<string>("");
  const [newOtReqHours, setNewOtReqHours] = useState<number>(4);
  const [newOtReqReason, setNewOtReqReason] = useState<string>("");

  // Bulk Shift Setter State
  const [showBulkShiftModal, setShowBulkShiftModal] = useState<boolean>(false);
  const [bulkGroupName, setBulkGroupName] = useState<string>("Group A");
  const [bulkShiftCode, setBulkShiftCode] = useState<string>("M12");
  const [bulkStartDay, setBulkStartDay] = useState<number>(1);
  const [bulkEndDay, setBulkEndDay] = useState<number>(30);

  // New Employee Form State
  const [newEmpName, setNewEmpName] = useState<string>("");
  const [newEmpDept, setNewEmpDept] = useState<string>("inter2");
  const [newEmpRole, setNewEmpRole] = useState<string>("ผู้ควบคุมงานขนถ่ายสินค้า");
  const [newEmpGroupName, setNewEmpGroupName] = useState<string>("");
  const [newEmpTargetOt, setNewEmpTargetOt] = useState<number>(48);
  const [newEmpPrefix, setNewEmpPrefix] = useState<string>("นาย");
  const [newEmpFirstName, setNewEmpFirstName] = useState<string>("");
  const [newEmpLastName, setNewEmpLastName] = useState<string>("");
  const [newEmpNickname, setNewEmpNickname] = useState<string>("");
  const [newEmpDivision, setNewEmpDivision] = useState<string>("ITS Operation and Technical");
  const [newEmpSalary, setNewEmpSalary] = useState<number>(15000);
  const [newEmpBirthday, setNewEmpBirthday] = useState<string>("");
  const [newEmpAge, setNewEmpAge] = useState<number>(0);
  const [newEmpCalculatedAge, setNewEmpCalculatedAge] = useState<number>(0);
  const [newEmpStartDate, setNewEmpStartDate] = useState<string>("");
  const [newEmpTenure, setNewEmpTenure] = useState<string>("");
  const [newEmpProbationDate, setNewEmpProbationDate] = useState<string>("");
  const [newEmpResignationDate, setNewEmpResignationDate] = useState<string>("");
  const [newEmpStatus, setNewEmpStatus] = useState<string>("Active");

  // Edit Employee Form State
  const [showEditEmployeeModal, setShowEditEmployeeModal] = useState<boolean>(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [editEmpName, setEditEmpName] = useState<string>("");
  const [editEmpDept, setEditEmpDept] = useState<string>("inter2");
  const [editEmpRole, setEditEmpRole] = useState<string>("Operator");
  const [editEmpGroupName, setEditEmpGroupName] = useState<string>("ทีม ก.");
  const [editEmpTargetOt, setEditEmpTargetOt] = useState<number>(48);
  const [editEmpPrefix, setEditEmpPrefix] = useState<string>("นาย");
  const [editEmpFirstName, setEditEmpFirstName] = useState<string>("");
  const [editEmpLastName, setEditEmpLastName] = useState<string>("");
  const [editEmpNickname, setEditEmpNickname] = useState<string>("");
  const [editEmpDivision, setEditEmpDivision] = useState<string>("");
  const [editEmpSalary, setEditEmpSalary] = useState<number>(15000);
  const [editEmpBirthday, setEditEmpBirthday] = useState<string>("");
  const [editEmpAge, setEditEmpAge] = useState<number>(0);
  const [editEmpCalculatedAge, setEditEmpCalculatedAge] = useState<number>(0);
  const [editEmpStartDate, setEditEmpStartDate] = useState<string>("");
  const [editEmpTenure, setEditEmpTenure] = useState<string>("");
  const [editEmpProbationDate, setEditEmpProbationDate] = useState<string>("");
  const [editEmpCalendarType, setEditEmpCalendarType] = useState<string>("ปฏิทิน 2 ทีม (คู่กะ 12 ชม.)");
  const [editEmpResignationDate, setEditEmpResignationDate] = useState<string>("");
  const [editEmpStatus, setEditEmpStatus] = useState<string>("Active");

  // Status Tab State (Active vs Resigned Archive)
  const [selectedEmpStatusTab, setSelectedEmpStatusTab] = useState<"Active" | "Resigned">("Active");
  const [showResignedModal, setShowResignedModal] = useState<boolean>(false);
  const [resignedSearchQuery, setResignedSearchQuery] = useState<string>("");
  const [resignedDeptFilter, setResignedDeptFilter] = useState<string>("all");

  // Dedicated HR Employee Roster Filters & Sort
  const [empSearchQuery, setEmpSearchQuery] = useState<string>("");
  const [empDeptFilter, setEmpDeptFilter] = useState<string>("ทุกแผนก");
  const [empDivisionFilter, setEmpDivisionFilter] = useState<string>("ทุกฝ่าย");
  const [empRoleFilter, setEmpRoleFilter] = useState<string>("ทุกตำแหน่ง");
  const [empSortField, setEmpSortField] = useState<string>("dept");
  const [empSortOrder, setEmpSortOrder] = useState<"asc" | "desc">("asc");

  const [newEmpCalendarType, setNewEmpCalendarType] = useState<string>("ปฏิทิน 2 ทีม (คู่กะ 12 ชม.)");

  const updatePlannerMonth = (newMonthStr: string) => {
    setState((prev: any) => prev ? ({
      ...prev,
      shiftConfig: {
        ...(prev.shiftConfig || {}),
        currentMonth: newMonthStr
      }
    }) : prev);
  };

  const handleShiftConfigMonthChange = async (nextM: string) => {
    updatePlannerMonth(nextM);
    await fetchPortalState(nextM);
    try {
      await fetch("/api/save-shift-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentMonth: nextM })
      });
    } catch (err) {
      console.error("Failed to save shift config month:", err);
    }
  };

  // Detail Modal State
  const [viewingEmployeeDetails, setViewingEmployeeDetails] = useState<Employee | null>(null);

  // Dedicated Job Value State & Controls
  const [jobValueRecords, setJobValueRecords] = useState<JobValueRecord[]>([]);
  const [jobValueDeptFilter, setJobValueDeptFilter] = useState<string>("ทุกแผนก");
  const [jobValueSearchQuery, setJobValueSearchQuery] = useState<string>("");
  const [showImportJobValueModal, setShowImportJobValueModal] = useState<boolean>(false);
  const [viewingJobValueModal, setViewingJobValueModal] = useState<JobValueRecord | null>(null);
  const [copiedChecklistId, setCopiedChecklistId] = useState<string | null>(null);
  const [importJvLoading, setImportJvLoading] = useState<boolean>(false);
  const [isCsvTemplateHubOpen, setIsCsvTemplateHubOpen] = useState<boolean>(false);
  const [financialChartOnlyActiveMonths, setFinancialChartOnlyActiveMonths] = useState<boolean>(true);
  const [financialChartViewType, setFinancialChartViewType] = useState<"bar" | "trend">("trend");
  const [financialChartDeptFilter, setFinancialChartDeptFilter] = useState<string>("ทุกแผนก");
  const currentMonthKey = new Date().toISOString().substring(0, 7);
  const [dismissedBirthdayPopup, setDismissedBirthdayPopup] = useState<boolean>(() => {
    return localStorage.getItem("dismissedBirthdayMonth") === currentMonthKey;
  });

  const handleDismissBirthdayPopup = () => {
    localStorage.setItem("dismissedBirthdayMonth", currentMonthKey);
    setDismissedBirthdayPopup(true);
  };

  const fetchJobValueRecords = async () => {
    try {
      const res = await fetch("/api/job-value");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setJobValueRecords(data);
        } else {
          console.warn("Job value API did not return an array:", data);
          setJobValueRecords([]);
        }
      } else {
        setJobValueRecords([]);
      }
    } catch (err) {
      console.error("Error fetching Job Value records:", err);
      setJobValueRecords([]);
    }
  };

  useEffect(() => {
    fetchJobValueRecords();
  }, []);

    const [activeCellEditor, setActiveCellEditor] = useState<any | null>(null);
  const [viewingSalaryFormulaEmployee, setViewingSalaryFormulaEmployee] = useState<any | null>(null);

  const handleDirectSaveShift = async (emp: any, dayIdx: number, target: "plan" | "actual", newShiftCode: string) => {
    try {
      const monthKey = state?.shiftConfig?.currentMonth || "2026-08";
      const [y, m] = monthKey.split("-");

      // Get existing arrays
      const currentShifts = getEmpShiftsArray(emp.shifts, monthKey);
      const currentPlan = getEmpPlanShiftsArray(emp, monthKey);

      // Create copies and update the target day
      const updatedShifts = [...currentShifts];
      while (updatedShifts.length <= dayIdx) updatedShifts.push("O");

      const updatedPlan = [...currentPlan];
      while (updatedPlan.length <= dayIdx) updatedPlan.push("O");

      if (target === "plan") {
        updatedPlan[dayIdx] = newShiftCode;
      } else {
        updatedShifts[dayIdx] = newShiftCode;
      }

      // Format as JSON object for database
      const formatEmpShiftsObj = (empOrigin: any, newActualArr: string[], newPlanArr: string[]) => {
        let dbShifts: any = {};
        try {
          dbShifts = empOrigin.shifts ? (typeof empOrigin.shifts === "string" ? JSON.parse(empOrigin.shifts) : empOrigin.shifts) : {};
        } catch { dbShifts = {}; }
        if (Array.isArray(dbShifts)) { dbShifts = { "2026-08": dbShifts }; }

        let dbPlanShifts: any = {};
        try {
          dbPlanShifts = empOrigin.planShifts ? (typeof empOrigin.planShifts === "string" ? JSON.parse(empOrigin.planShifts) : empOrigin.planShifts) : {};
        } catch { dbPlanShifts = {}; }
        if (Array.isArray(dbPlanShifts)) { dbPlanShifts = { "2026-08": dbPlanShifts }; }

        dbShifts[monthKey] = newActualArr;
        dbPlanShifts[monthKey] = newPlanArr;

        return {
          ...empOrigin,
          shifts: JSON.stringify(dbShifts),
          planShifts: JSON.stringify(dbPlanShifts)
        };
      };

      const enrichedEmp = formatEmpShiftsObj(emp, updatedShifts, updatedPlan);

      // Update state immediately for instant feedback
      const updatedEmployees = state.employees.map((e: any) => e.id === emp.id ? enrichedEmp : e);
      setState((prev: any) => ({ ...prev, employees: updatedEmployees }));

      // Save to D1 database in background
      const res = await fetch("/api/save-shifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employees: [enrichedEmp],
          year: y ? Number(y) : undefined,
          month: m ? Number(m) : undefined
        })
      });

      if (res.ok) {
        showToast("บันทึกตารางกะสำเร็จ!", "success");
      } else {
        showToast("เกิดข้อผิดพลาดในการบันทึกตารางกะ", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์", "error");
    }
  };

  // Local state for department manager input to prevent focus loss during typing (declared at top level)
  const [deptManagerText, setDeptManagerText] = useState<string>("");
  useEffect(() => {
    if (currentUser?.name) {
      const curDept = (state?.departments || []).find((d: any) => d.id === currentShiftsDept);
      const managerName = currentUser.name;
      setDeptManagerText(managerName);
      
      const isManager = currentUser?.role === "Section Manager" && normalizeDeptId(currentUser?.deptId) === normalizeDeptId(currentShiftsDept);
      const isAllowed = ["HR", "HR Section Manager", "ผู้ดูแลระบบ", "Admin"].includes(currentUser?.role || "") || isManager;

      if (isAllowed && curDept && curDept.manager !== managerName) {
        setState((prev: any) => ({
          ...prev,
          departments: prev.departments.map((d: any) => d.id === currentShiftsDept ? { ...d, manager: managerName } : d)
        }));
        fetch("/api/save-department-config", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ deptId: currentShiftsDept, manager: managerName })
        }).catch(console.error);
      }
    } else {
      const curDept = (state?.departments || []).find((d: any) => d.id === currentShiftsDept);
      if (curDept) {
        setDeptManagerText(curDept.manager && curDept.manager !== "-" ? curDept.manager : "คุณสันทัด คุ้มค่า");
      }
    }
  }, [state?.departments, currentShiftsDept, currentUser]);

    // Toast Notifications State & Override window.alert
  const [toasts, setToasts] = useState<any[]>([]);
  const showToast = (message: string, type: "success" | "error" | "info" | "warning" = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  useEffect(() => {
    window.alert = (message: string) => {
      const msgStr = String(message);
      let type: "success" | "error" | "info" | "warning" = "info";
      if (
        msgStr.includes("สำเร็จ") || 
        msgStr.includes("เรียบร้อย") || 
        msgStr.includes("success") || 
        msgStr.includes("อนุมัติ")
      ) {
        type = "success";
      } else if (
        msgStr.includes("ผิดพลาด") || 
        msgStr.includes("ล้มเหลว") || 
        msgStr.includes("ไม่สามารถ") || 
        msgStr.includes("error") || 
        msgStr.includes("กรุณา") || 
        msgStr.includes("ไม่มี") ||
        msgStr.includes("แจ้งเตือน")
      ) {
        type = "warning";
      }
      showToast(msgStr, type);
    };
  }, []);

  // Active shift management edit state
  const [isEditingShifts, setIsEditingShifts] = useState<boolean>(false);
  const [tempEmployees, setTempEmployees] = useState<Employee[]>([]);
  const [activeEditingCell, setActiveEditingCell] = useState<{ employeeId: string; dayIndex: number } | null>(null);
  const [editingEmployeeShiftsModal, setEditingEmployeeShiftsModal] = useState<Employee | null>(null);
  const [modalEditTarget, setModalEditTarget] = useState<"plan" | "actual">("actual");
  const openModalForEmployee = (emp: Employee) => {
    if (isEditingShifts) {
      setModalEditTarget(shiftEditTarget);
    } else {
      setModalEditTarget("actual");
    }
    setEditingEmployeeShiftsModal(emp);
  };
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [shiftViewMode, setShiftViewMode] = useState<"plan" | "actual" | "both">("both");
  const [shiftEditTarget, setShiftEditTarget] = useState<"plan" | "actual">("actual");
  const [mismatchAlertDismissed, setMismatchAlertDismissed] = useState<boolean>(false);
  useEffect(() => {
    setMismatchAlertDismissed(false);
  }, [currentShiftsDept, shiftViewMode]);

  // Sort and display filters for report
  const [reportSortBy, setReportSortBy] = useState<string>("OT Hours (High to Low)");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>("ทุกตำแหน่ง");

  // ==========================================
  // KPI Role filter helper
  // ==========================================
  const matchesRoleFilter = (empRole: string) => {
    if (selectedRoleFilter === "ทุกตำแหน่ง") return true;
    if (selectedRoleFilter === "กลุ่มตำแหน่งปฏิบัติการ (10 ตำแหน่ง)") {
      const targetRoles = [
        "ผู้ควบคุมงานขนถ่ายสินค้า",
        "พนักงานขับเครน",
        "ปากเรือ",
        "ผู้ควบคุมงานจักรกลหนัก",
        "ช่างขับจักรกลหนัก",
        "O&M - Specialist",
        "O&M - Generator",
        "O&M - Mechanical",
        "O&M - Electrical",
        "ECC"
      ];
      return targetRoles.includes(empRole);
    }
    return empRole === selectedRoleFilter;
  };

  // Vessel & Crane state
  const [vesselSchedules, setVesselSchedules] = useState<any[]>([]);
  const [showVesselModal, setShowVesselModal] = useState<boolean>(false);
  const [newVesselType, setNewVesselType] = useState<"vessel" | "crane">("vessel");
  const [newVesselPlanType, setNewVesselPlanType] = useState<"plan" | "actual">("plan");
  const [newVesselName, setNewVesselName] = useState<string>("");
  const [newVesselStartDate, setNewVesselStartDate] = useState<string>("");
  const [newVesselEndDate, setNewVesselEndDate] = useState<string>("");
  const [newVesselColor, setNewVesselColor] = useState<string>("#fef08a");
  const [newVesselTonnage, setNewVesselTonnage] = useState<string>("");

  const fetchVesselSchedules = async () => {
    if (!state?.shiftConfig?.currentMonth || !currentShiftsDept) return;
    try {
      const [y, m] = state.shiftConfig.currentMonth.split("-");
      const params = new URLSearchParams({
        deptId: currentShiftsDept,
        year: y || "",
        month: m || ""
      });
      const res = await fetch(`/api/vessel-schedules?${params}`);
      if (res.ok) {
        const data = await res.json();
        setVesselSchedules(data);
      }
    } catch (err) {
      console.error("Error fetching vessel schedules:", err);
    }
  };

  useEffect(() => {
    fetchVesselSchedules();
  }, [state?.shiftConfig?.currentMonth, currentShiftsDept]);

  // Default fallback state when API is offline / static mode
  const getDefaultState = (): AppState => ({
    d1Connected: true,
    departments: [
      { id: "inter2", name: "INTER 2", nameTh: "แผนก INTER 2", manager: "คุณสมชาย", managerRole: "Section Manager", managerImg: "", employeesCount: 0, otHours: 0, budgetUsed: 0, budgetUsedChange: 0, budgetUsedChangePct: 0, budgetUtilization: 0, status: "On Track", icon: "precision_manufacturing" },
      { id: "inter3", name: "INTER 3", nameTh: "แผนก INTER 3", manager: "คุณวิภา", managerRole: "Section Manager", managerImg: "", employeesCount: 0, otHours: 0, budgetUsed: 0, budgetUsedChange: 0, budgetUsedChangePct: 0, budgetUtilization: 0, status: "On Track", icon: "precision_manufacturing" },
      { id: "inter5", name: "INTER 5", nameTh: "แผนก INTER 5", manager: "คุณอนันต์", managerRole: "Section Manager", managerImg: "", employeesCount: 0, otHours: 0, budgetUsed: 0, budgetUsedChange: 0, budgetUsedChangePct: 0, budgetUtilization: 0, status: "On Track", icon: "precision_manufacturing" },
      { id: "inter7", name: "INTER 7", nameTh: "แผนก INTER 7", manager: "คุณสมศักดิ์", managerRole: "Section Manager", managerImg: "", employeesCount: 0, otHours: 0, budgetUsed: 0, budgetUsedChange: 0, budgetUsedChangePct: 0, budgetUtilization: 0, status: "On Track", icon: "precision_manufacturing" },
      { id: "heavy",  name: "Heavy Machine", nameTh: "แผนก Heavy Machine", manager: "คุณศักดิ์ชัย", managerRole: "Section Manager", managerImg: "", employeesCount: 0, otHours: 0, budgetUsed: 0, budgetUsedChange: 0, budgetUsedChangePct: 0, budgetUtilization: 0, status: "On Track", icon: "settings" },
      { id: "ecc",    name: "ECC",           nameTh: "แผนก ECC",           manager: "คุณประสิทธิ์", managerRole: "Section Manager", managerImg: "", employeesCount: 0, otHours: 0, budgetUsed: 0, budgetUsedChange: 0, budgetUsedChangePct: 0, budgetUtilization: 0, status: "On Track", icon: "electrical_services" }
    ],
    employees: [],
    shiftConfig: {
      pattern: "4-on-2-off",
      currentMonth: new Date().toISOString().substring(0, 7),
      currentDept: "inter2"
    },
    otTrendData: { months: [], lastYear: [], currentYear: [] },
    leaveRecords: [],
    vesselSchedules: []
  });

  // Fetch initial portal state
  const fetchPortalState = async (monthOverride?: string) => {
    try {
      setLoading(true);
      setStateError(null);
      const res = await fetch("/api/portal-state");
      if (res.ok) {
        const data: AppState & { accounts?: any[]; otRequests?: any[] } = await res.json();
        const targetMonth = monthOverride || state?.shiftConfig?.currentMonth || data?.shiftConfig?.currentMonth || "2026-08";
        const updatedData = {
          ...data,
          shiftConfig: {
            ...(data.shiftConfig || {}),
            currentMonth: targetMonth
          }
        };
        setState(updatedData);
        setTempEmployees(data.employees);
        if (data.accounts && Array.isArray(data.accounts)) {
          setAccounts(data.accounts);
          if (currentUser?.username) {
            const currentAcc = data.accounts.find((a: any) => a.username === currentUser.username);
            if (currentAcc) {
              const updatedUser = { 
                ...currentUser, 
                name: currentAcc.name, 
                role: currentAcc.role, 
                deptId: currentAcc.deptId, 
                avatar: currentAcc.avatar || currentUser.avatar, 
                canBackup: currentAcc.canBackup 
              };
              setCurrentUser(updatedUser);
              localStorage.setItem("currentUser", JSON.stringify(updatedUser));
            }
          }
        }
        if (data.otRequests && Array.isArray(data.otRequests)) {
          setOtRequests(data.otRequests);
        }
      } else {
        const def = getDefaultState();
        setState(def);
        setTempEmployees(def.employees);
        setAccounts([]);
      }
    } catch (err) {
      console.warn("Using default portal state:", err);
      const def = getDefaultState();
      setState(def);
      setTempEmployees(def.employees);
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortalState();
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchAccounts();
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser && currentUser.deptId !== "all") {
      const deptMap: { [key: string]: string } = {
        "inter2": "INTER 2",
        "inter3": "INTER 3",
        "inter5": "INTER 5",
        "inter7": "INTER 7",
        "heavy": "Heavy Machine",
        "ecc": "ECC"
      };
      const filterVal = deptMap[currentUser.deptId];
      if (filterVal) {
        setSelectedDeptFilter(filterVal);
      }
    } else {
      setSelectedDeptFilter("ทุกแผนก");
    }
  }, [currentUser]);

  // Job Value CSV Export & Import Handlers
  const handleExportJobValueCsv = () => {
    if (!jobValueRecords || jobValueRecords.length === 0) {
      alert("ไม่มีข้อมูล Job Value ในการส่งออก");
      return;
    }
    const headers = [
      "empId", "empName", "Department", "Position", "Status",
      "Avg_Revenue", "Avg_Cost", "Profit_2026", "Profit_2025",
      "Revenue_Jan","Revenue_Feb","Revenue_Mar","Revenue_Apr","Revenue_May","Revenue_Jun","Revenue_Jul","Revenue_Aug","Revenue_Sep","Revenue_Oct","Revenue_Nov","Revenue_Dec",
      "Cost_Jan","Cost_Feb","Cost_Mar","Cost_Apr","Cost_May","Cost_Jun","Cost_Jul","Cost_Aug","Cost_Sep","Cost_Oct","Cost_Nov","Cost_Dec",
      "Profit_Jan","Profit_Feb","Profit_Mar","Profit_Apr","Profit_May","Profit_Jun","Profit_Jul","Profit_Aug","Profit_Sep","Profit_Oct","Profit_Nov","Profit_Dec"
    ];

    const rows = jobValueRecords.map(r => {
      const revs = r.monthlyRevenue || [];
      const costs = r.monthlyCost || [];
      const profs = r.monthlyProfit || [];
      return [
        r.empId, `"${r.empName}"`, `"${r.department}"`, `"${r.position}"`, r.status || "Active",
        r.avgRevenue, r.avgCost, r.profit2026, r.profit2025,
        ...Array.from({ length: 12 }, (_, i) => revs[i] || 0),
        ...Array.from({ length: 12 }, (_, i) => costs[i] || 0),
        ...Array.from({ length: 12 }, (_, i) => profs[i] || 0)
      ].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `JobValue_Export_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportJobValueCsv = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const text = evt.target?.result as string;
      if (!text) return;
      const lines = text.split(/\r?\n/).filter(line => line.trim());
      if (lines.length <= 1) return alert("ไฟล์ CSV ไม่มีข้อมูล");

      const parseNum = (val: any) => {
        if (val === null || val === undefined) return 0;
        const cleaned = String(val).replace(/,/g, "").replace(/฿/g, "").replace(/\$/g, "").trim();
        const num = parseFloat(cleaned);
        return isNaN(num) ? 0 : num;
      };

      const parseCsvLine = (line: string): string[] => {
        const result: string[] = [];
        let current = "";
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            result.push(current.trim().replace(/^"/, '').replace(/"$/, ''));
            current = "";
          } else {
            current += char;
          }
        }
        result.push(current.trim().replace(/^"/, '').replace(/"$/, ''));
        return result;
      };

      const parsedRecords: any[] = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = parseCsvLine(lines[i]);
        if (!cols[0]) continue;
        const empId = cols[0];
        const empName = cols[1] || "";
        const department = cols[2] || "ไม่ระบุแผนก";
        const position = cols[3] || "";
        const status = cols[4] || "Active";
        const avgRevenue = parseNum(cols[5]);
        const avgCost = parseNum(cols[6]);
        const profit2026 = parseNum(cols[7]);
        const profit2025 = parseNum(cols[8]);

        const monthlyRevenue = cols.slice(9, 21).map(parseNum);
        const monthlyCost = cols.slice(21, 33).map(parseNum);
        const monthlyProfit = cols.slice(33, 45).map(parseNum);

        parsedRecords.push({
          id: `JV-${empId}`,
          empId,
          empName,
          department,
          position,
          status,
          avgRevenue,
          avgCost,
          profit2026,
          profit2025,
          monthlyRevenue,
          monthlyCost,
          monthlyProfit
        });
      }

      try {
        setImportJvLoading(true);
        const res = await fetch("/api/job-value/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            records: parsedRecords,
            role: currentUser?.role,
            username: currentUser?.name
          })
        });
        if (res.ok) {
          const result = await res.json();
          alert(`นำเข้าข้อมูล Job Value สำเร็จเรียบร้อย (${result.count} รายการ)`);
          fetchJobValueRecords();
        } else {
          const errData = await res.json();
          alert(`เกิดข้อผิดพลาดในการนำเข้าข้อมูล: ${errData.error || "ไม่ทราบสาเหตุ"}`);
        }
      } catch (err: any) {
        alert(`เกิดข้อผิดพลาด: ${err.message}`);
      } finally {
        setImportJvLoading(false);
      }
    };
    reader.readAsText(file, "UTF-8");
  };

  const handleClearJobValueData = async () => {
    if (!confirm("คุณต้องการล้างข้อมูล Job Value ทั้งหมดที่เคยบันทึกไว้ในฐานข้อมูล D1 ใช่หรือไม่?")) return;
    try {
      setImportJvLoading(true);
      const res = await fetch("/api/clear-job-value", { method: "POST" });
      if (res.ok) {
        alert("ล้างข้อมูล Job Value ในฐานข้อมูล D1 เรียบร้อยแล้ว");
        setJobValueRecords([]);
      } else {
        alert("เกิดข้อผิดพลาดในการล้างข้อมูล");
      }
    } catch (err: any) {
      alert(`เกิดข้อผิดพลาด: ${err.message}`);
    } finally {
      setImportJvLoading(false);
    }
  };

  if (stateError) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center max-w-sm">
          <p className="text-red-500 text-3xl mb-2">⚠️</p>
          <h4 className="text-sm font-bold text-slate-800 font-sans">ไม่สามารถโหลดโปรทัลได้</h4>
          <p className="text-xs text-slate-500 mt-1 mb-4 font-sans">{stateError}</p>
          <button 
            onClick={fetchPortalState}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer font-sans"
          >
            ลองใหม่อีกครั้ง
          </button>
        </div>
      </div>
    );
  }

  if (loading || !state) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#020b18] via-[#05182e] to-[#021020] text-white flex flex-col items-center justify-center relative overflow-hidden font-sans select-none">
        {/* Ambient Oceanic Glows */}
        <div className="absolute -top-32 -left-32 w-[450px] h-[450px] bg-cyan-600/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/3 -right-32 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[160px] pointer-events-none" />
        <div className="absolute -bottom-32 left-1/4 w-[600px] h-[400px] bg-teal-500/10 rounded-full blur-[160px] pointer-events-none" />

        {/* Floating Water Bubble Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
          <div className="absolute bottom-10 left-[15%] w-3 h-3 bg-cyan-300/40 rounded-full blur-[1px] animate-water-pulse" style={{ animationDuration: '4s' }} />
          <div className="absolute bottom-20 left-[28%] w-2 h-2 bg-blue-300/50 rounded-full blur-[1px] animate-water-pulse" style={{ animationDuration: '6s' }} />
          <div className="absolute bottom-16 right-[20%] w-4 h-4 bg-teal-300/30 rounded-full blur-[1px] animate-water-pulse" style={{ animationDuration: '5s' }} />
          <div className="absolute bottom-24 right-[35%] w-2.5 h-2.5 bg-cyan-200/40 rounded-full blur-[1px] animate-water-pulse" style={{ animationDuration: '7s' }} />
        </div>

        {/* Multi-Layer Animated SVG Ocean Waves at Bottom */}
        <div className="absolute bottom-0 left-0 right-0 w-full h-48 pointer-events-none overflow-hidden leading-none z-0">
          {/* Wave 3 (Deep Blue Background Wave) */}
          <div className="absolute bottom-0 left-0 w-[200%] h-full opacity-35 animate-wave-3">
            <svg className="w-full h-full" viewBox="0 0 1200 120" preserveAspectRatio="none">
              <path d="M0,0 C150,90 350,-40 500,45 C650,130 900,10 1200,50 L1200,120 L0,120 Z" fill="#034078" />
            </svg>
          </div>
          {/* Wave 2 (Glowing Cyan Mid Wave) */}
          <div className="absolute bottom-0 left-0 w-[200%] h-full opacity-45 animate-wave-2">
            <svg className="w-full h-full" viewBox="0 0 1200 120" preserveAspectRatio="none">
              <path d="M0,30 C200,100 450,0 650,60 C850,120 1050,20 1200,70 L1200,120 L0,120 Z" fill="#0284c7" />
            </svg>
          </div>
          {/* Wave 1 (Bright Teal Seafoam Foreground Wave) */}
          <div className="absolute bottom-0 left-0 w-[200%] h-full opacity-60 animate-wave-1">
            <svg className="w-full h-full" viewBox="0 0 1200 120" preserveAspectRatio="none">
              <path d="M0,50 C150,110 300,20 500,75 C700,130 950,40 1200,85 L1200,120 L0,120 Z" fill="#0891b2" />
            </svg>
          </div>
        </div>

        {/* Main Central Card */}
        <div className="relative z-10 flex flex-col items-center max-w-md w-full px-6 text-center">
          
          {/* Maritime Brand Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-cyan-300 text-xs font-black uppercase tracking-widest mb-7 shadow-[0_0_25px_rgba(6,182,212,0.25)] backdrop-blur-xl">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>Double A Terminal • Port & Logistics</span>
          </div>

          {/* Floating Vessel / Maritime Core with Sonar Ripple */}
          <div className="relative w-32 h-32 flex items-center justify-center mb-6">
            {/* Pulsing Sonar / Wave Ripple Rings */}
            <div className="absolute inset-0 rounded-full border border-cyan-400/20 animate-ping" style={{ animationDuration: '3s' }} />
            <div className="absolute -inset-3 rounded-full border border-blue-500/25 animate-ping" style={{ animationDuration: '4s' }} />
            
            {/* Glowing Water Pool Base */}
            <div className="absolute inset-2 rounded-full bg-gradient-to-tr from-blue-600/30 via-cyan-500/30 to-teal-400/20 blur-xl animate-pulse" />

            {/* Rotating Marine Compass Rings */}
            <div className="absolute inset-0 rounded-full border-2 border-dashed border-cyan-400/30 animate-[spin_12s_linear_infinite]" />
            <div className="absolute inset-3 rounded-full border border-blue-400/40 animate-[spin_8s_linear_infinite_reverse]" />

            {/* Floating Ship / Port Beacon Centerpiece */}
            <div className="w-18 h-18 rounded-3xl bg-gradient-to-b from-[#0e2540] to-[#071322] border border-cyan-400/40 flex flex-col items-center justify-center shadow-[0_8px_32px_rgba(6,182,212,0.3)] relative z-10 animate-float-boat">
              <Ship className="w-8 h-8 text-cyan-300 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
              {/* Miniature wave line under ship */}
              <div className="w-7 h-1 bg-cyan-400/60 rounded-full mt-1 blur-[0.5px]" />
            </div>
          </div>

          {/* Headings */}
          <h2 className="text-xl font-black tracking-tight text-white mb-2 flex items-center gap-2">
            <span>ระบบบริหารเวลา OT และจัดกะหน้าท่า</span>
          </h2>
          
          <p className="text-xs text-cyan-200/70 font-medium leading-relaxed mb-6 max-w-xs">
            กำลังเชื่อมต่อฐานข้อมูลตารางเรือ แผนกปฏิบัติการ และจัดเตรียมคำนวณเบี้ย OT ประจำเดือน...
          </p>

          {/* Liquid Shimmering Wave Progress Bar */}
          <div className="w-full max-w-xs bg-[#091e36] border border-cyan-500/30 rounded-full h-2.5 p-0.5 overflow-hidden relative shadow-[inset_0_2px_6px_rgba(0,0,0,0.6)] mb-4">
            <div className="h-full bg-gradient-to-r from-blue-600 via-cyan-400 to-teal-300 rounded-full w-full animate-[pulse_1.8s_ease-in-out_infinite] shadow-[0_0_16px_rgba(6,182,212,0.8)]" />
          </div>

          {/* Footer Terminal Metadata */}
          <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 font-mono tracking-wider">
            <span className="text-cyan-400">🌊 Maritime Port Sync</span>
            <span>•</span>
            <span>Real-time Operations</span>
            <span>•</span>
            <span>v2.6</span>
          </div>

        </div>
      </div>
    );
  }

  const canAccessSalary = ["HR", "HR Section Manager", "ผู้ดูแลระบบ"].includes(currentUser?.role || "");
  const isHrOrFullAccess = ["HR", "HR Section Manager", "Operation Dir", "Operation Depart", "ผู้ดูแลระบบ", "Admin", "Co-admin", "Co-Admin"].includes(currentUser?.role || "");

  const filteredDeptsForStats = (state?.departments || []).filter(d => activeDeptId === "all" || d.id === activeDeptId);
  const deptEmpsCount = (state?.employees || []).filter(emp => emp.deptId === currentShiftsDept).length;
  const currentDeptObj = (state?.departments || []).find(d => d.id === currentShiftsDept);


  // Dynamically extract unique roles and groups for auto-suggestions & HR dropdowns
  const uniqueRoles = Array.from(new Set((state?.employees || []).filter(Boolean).map(emp => emp?.role))).filter(Boolean);
  const uniqueGroups = Array.from(new Set((state?.employees || []).filter(Boolean).map(emp => emp?.groupName))).filter(Boolean);

  const uniqueRosterDepts = Array.from(new Set(
    (state?.employees || []).filter(Boolean).map(emp => getDeptName(emp?.deptId, state?.departments))
  )).filter(Boolean).sort();

  const uniqueRosterDivisions = Array.from(new Set(
    (state?.employees || []).filter(Boolean).map(emp => emp?.division || emp?.groupName || "").filter(Boolean)
  )).sort();

  const uniqueRosterRoles = Array.from(new Set(
    (state?.employees || []).filter(Boolean).map(emp => emp?.role).filter(Boolean)
  )).sort();

  const safeJobValueRecords = (jobValueRecords && Array.isArray(jobValueRecords))
    ? jobValueRecords.filter(Boolean)
    : [];

  const handleRosterSort = (field: string) => {
    if (empSortField === field) {
      setEmpSortOrder(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setEmpSortField(field);
      setEmpSortOrder("asc");
    }
  };

  // Comprehensive HR Filter & Sort logic for Roster List
  const filteredEmployees = (state?.employees || []).filter((emp) => {
    // 0. Section Manager Department Permission Isolation
    if (!isHrOrFullAccess && currentUser?.deptId) {
      const managerDeptId = normalizeDeptId(currentUser.deptId);
      const empDeptId = normalizeDeptId(emp.deptId);
      if (empDeptId !== managerDeptId) return false;
    }

    // 1. Employment Status Tab (Active vs Resigned / Inactive / Retired)
    const isResigned = emp.employmentStatus === "Resigned" || emp.employmentStatus === "Inactive" || emp.employmentStatus === "Retired" || emp.employmentStatus === "ลาออก" || emp.employmentStatus === "เกษียณ" || emp.employmentStatus === "พ้นสภาพ";
    const matchesStatus = selectedEmpStatusTab === "Resigned" ? isResigned : !isResigned;
    if (!matchesStatus) return false;

    // 2. Search Query (Combine local empSearchQuery and global searchQuery)
    const q = (empSearchQuery || searchQuery || "").trim().toLowerCase();
    if (q) {
      const deptName = getDeptName(emp.deptId, state?.departments).toLowerCase();
      const divName = (emp.division || emp.groupName || "").toLowerCase();
      const matchesSearch = 
        emp.name.toLowerCase().includes(q) || 
        emp.id.toLowerCase().includes(q) ||
        emp.role.toLowerCase().includes(q) ||
        deptName.includes(q) ||
        divName.includes(q);
      if (!matchesSearch) return false;
    }

    // 3. Department Filter
    if (empDeptFilter !== "ทุกแผนก") {
      const empDeptName = getDeptName(emp.deptId, state?.departments);
      const matchesDept = empDeptName === empDeptFilter || 
        normalizeDeptId(emp.deptId) === normalizeDeptId(empDeptFilter);
      if (!matchesDept) return false;
    } else if (selectedDeptFilter !== "ทุกแผนก") {
      const deptMap: { [key: string]: string } = {
        "INTER 2": "inter2",
        "INTER 3": "inter3",
        "INTER 5": "inter5",
        "INTER 7": "inter7",
        "Heavy Machine": "heavy",
        "ECC": "ecc"
      };
      const filterDeptId = deptMap[selectedDeptFilter];
      if (emp.deptId !== filterDeptId) return false;
    }

    // 4. Division Filter (ฝ่าย)
    if (empDivisionFilter !== "ทุกฝ่าย") {
      const div = emp.division || emp.groupName || "-";
      if (div !== empDivisionFilter) return false;
    }

    // 5. Role Filter (ตำแหน่ง)
    if (empRoleFilter !== "ทุกตำแหน่ง") {
      if (emp.role !== empRoleFilter) return false;
    } else if (!matchesRoleFilter(emp.role)) {
      return false;
    }

    return true;
  }).sort((a, b) => {
    // Helper to calculate OT multiplier values for sorting (Single Source of Truth)
    const getOtMetrics = (emp: Employee) => {
      const b = getEmpMonthlyOtPayBreakdown(emp, state?.shiftConfig?.currentMonth);
      return {
        ot1_5: b.normalOt,
        ot1_0: b.holidayWorkDays * 8,
        ot3_0: b.holidayOt,
        totalOtPay: b.totalOtPay,
        otPctSalary: Number(b.otPctSalary) || 0
      };
    };

    let valA: any = "";
    let valB: any = "";

    switch (empSortField) {
      case "id":
        valA = a.id;
        valB = b.id;
        break;
      case "name":
        valA = a.name;
        valB = b.name;
        break;
      case "role":
        valA = a.role;
        valB = b.role;
        break;
      case "dept":
        valA = getDeptName(a.deptId, state?.departments);
        valB = getDeptName(b.deptId, state?.departments);
        break;
      case "division":
        valA = a.division || a.groupName || "-";
        valB = b.division || b.groupName || "-";
        break;
      case "ot1_5":
        valA = getOtMetrics(a).ot1_5;
        valB = getOtMetrics(b).ot1_5;
        break;
      case "ot1_0":
        valA = getOtMetrics(a).ot1_0;
        valB = getOtMetrics(b).ot1_0;
        break;
      case "ot3_0":
        valA = getOtMetrics(a).ot3_0;
        valB = getOtMetrics(b).ot3_0;
        break;
      case "totalOtPay":
        valA = getOtMetrics(a).totalOtPay;
        valB = getOtMetrics(b).totalOtPay;
        break;
      case "otPctSalary":
        valA = getOtMetrics(a).otPctSalary;
        valB = getOtMetrics(b).otPctSalary;
        break;
      default:
        valA = a.id;
        valB = b.id;
    }

    if (typeof valA === "number" && typeof valB === "number") {
      return empSortOrder === "asc" ? valA - valB : valB - valA;
    }

    const strA = String(valA || "");
    const strB = String(valB || "");
    return empSortOrder === "asc" 
      ? strA.localeCompare(strB, 'th') 
      : strB.localeCompare(strA, 'th');
  });

  // Bulk Shift Setter Action Handler
  const handleApplyBulkShift = () => {
    const listToUpdate = isEditingShifts ? tempEmployees : state.employees;
    if (!listToUpdate || listToUpdate.length === 0) {
      alert("ไม่พบข้อมูลพนักงานในตาราง");
      return;
    }
    const updated = listToUpdate.map(emp => {
            if (emp.deptId === currentShiftsDept && (bulkGroupName === "all" || emp.groupName === bulkGroupName)) {
        const shiftsArray = getEmpShiftsArray(emp.shifts, state?.shiftConfig?.currentMonth);
        const newShifts = [...shiftsArray];
        const sDay = Math.max(1, bulkStartDay) - 1;
        const eDay = Math.min(31, bulkEndDay);
        for (let d = sDay; d < eDay; d++) {
          newShifts[d] = bulkShiftCode;
        }
        
        const monthKey = state?.shiftConfig?.currentMonth || "2026-08";
        let dbShifts: any = {};
        try {
          dbShifts = emp.shifts ? (typeof emp.shifts === "string" ? JSON.parse(emp.shifts) : emp.shifts) : {};
        } catch { dbShifts = {}; }
        if (Array.isArray(dbShifts)) { dbShifts = { "2026-08": dbShifts }; }
        dbShifts[monthKey] = newShifts;
        
        return { ...emp, shifts: JSON.stringify(dbShifts) };
      }
      return emp;
    });
    setTempEmployees(updated);
    setIsEditingShifts(true);
    setShowBulkShiftModal(false);
    alert(`กำหนดกะงาน ${bulkShiftCode} ให้กลุ่ม ${bulkGroupName === "all" ? "ทุกกลุ่ม" : bulkGroupName} เรียบร้อยแล้ว!\n(กรุณากดปุ่ม "บันทึกการจัดกะ" สีเขียว เพื่อบันทึกลงระบบ)`);
  };

  // OT Request Action Handlers
  const handleApproveOtRequest = async (id: string) => {
    try {
      await fetch("/api/update-ot-request-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "approved" })
      });
      setOtRequests(prev => prev.map(r => r.id === id ? { ...r, status: "approved" } : r));
      alert("อนุมัติคำขอทำ OT เรียบร้อยแล้ว (บันทึกลง D1 Database)");
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการบันทึกสถานะ");
    }
  };

  const handleRejectOtRequest = async (id: string) => {
    try {
      await fetch("/api/update-ot-request-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "rejected" })
      });
      setOtRequests(prev => prev.map(r => r.id === id ? { ...r, status: "rejected" } : r));
      alert("ปฏิเสธคำขอทำ OT เรียบร้อยแล้ว (บันทึกลง D1 Database)");
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการบันทึกสถานะ");
    }
  };

  const handleSubmitOtRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    const emp = state.employees.find(e => e.id === newOtReqEmpId) || state.employees[0];
    if (!emp) {
      alert("กรุณาเลือกพนักงาน");
      return;
    }
    const newReq = {
      id: "REQ-" + Date.now().toString().slice(-6),
      employeeId: emp.id,
      employeeName: emp.name,
      deptId: emp.deptId || currentShiftsDept || "inter2",
      date: newOtReqDate || new Date().toISOString().substring(0, 10),
      hours: Number(newOtReqHours) || 4,
      reason: newOtReqReason || "ปฏิบัติงานล่วงเวลาพิเศษ",
      status: "pending",
      requestedAt: new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })
    };

    try {
      await fetch("/api/save-ot-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newReq)
      });
      setOtRequests(prev => [newReq, ...prev]);
      setNewOtReqReason("");
      alert("ยื่นใบคำขอทำ OT เรียบร้อยแล้ว! ส่งเรื่องรอผู้บังคับบัญชาพิจารณาอนุมัติ");
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการส่งคำขอ");
    }
  };

  // Handle adding new employee
  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    const fName = (newEmpFirstName || newEmpName || "").trim();
    const lName = (newEmpLastName || "").trim();
    if (!fName) {
      alert("กรุณากรอกชื่อพนักงาน (ชื่อจริง)");
      return;
    }

    const pfx = newEmpPrefix || "นาย";
    const fullName = (pfx + " " + fName + (lName ? " " + lName : "")).trim();
    const finalEmpId = (newEmpId || "").trim() || ("EMP-" + Date.now().toString().slice(-6));

    const newEmpObj: Employee = {
      id: finalEmpId,
      name: fullName,
      deptId: newEmpDept || "inter2",
      role: newEmpRole || "Operator",
      groupName: newEmpGroupName || "Group A",
      targetOt: Number(newEmpTargetOt) || 48,
      actualOt: 0,
      otPct: 0,
      status: "On Track",
      shifts: [],
      prefix: newEmpPrefix,
      firstName: newEmpFirstName,
      lastName: newEmpLastName,
      nickname: newEmpNickname,
      division: newEmpDivision,
      salary: newEmpSalary,
      birthday: newEmpBirthday,
      age: newEmpAge,
      calculatedAge: newEmpCalculatedAge,
      startDate: newEmpStartDate,
      tenure: newEmpTenure,
      probationDate: newEmpProbationDate,
      calendarType: newEmpCalendarType,
      resignationDate: newEmpResignationDate,
      employmentStatus: (newEmpStatus as any) || (newEmpResignationDate ? "Resigned" : "Active")
    };

    try {
      setAddEmpLoading(true);
      // Optimistically add to state.employees and tempEmployees immediately
      setState(prev => ({
        ...prev,
        employees: [newEmpObj, ...prev.employees.filter(e => e.id !== finalEmpId)]
      }));
      setTempEmployees(prev => [newEmpObj, ...prev.filter(e => e.id !== finalEmpId)]);

      const res = await fetch("/api/add-employee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: finalEmpId,
          name: fullName,
          deptId: newEmpDept,
          role: newEmpRole,
          groupName: newEmpGroupName,
          targetOt: newEmpTargetOt,
          prefix: newEmpPrefix,
          firstName: newEmpFirstName,
          lastName: newEmpLastName,
          nickname: newEmpNickname,
          division: newEmpDivision,
          salary: newEmpSalary,
          birthday: newEmpBirthday,
          age: newEmpAge,
          calculatedAge: newEmpCalculatedAge,
          startDate: newEmpStartDate,
          tenure: newEmpTenure,
          probationDate: newEmpProbationDate,
          calendarType: newEmpCalendarType
        })
      });
      if (res.ok) {
        setShowAddEmployeeModal(false);
        // Reset form
        setNewEmpId("");
        setNewEmpName("");
        setNewEmpFirstName("");
        setNewEmpLastName("");
        setNewEmpNickname("");
        setNewEmpDivision("");
        setNewEmpSalary(15000);
        setNewEmpBirthday("");
        setNewEmpAge(0);
        setNewEmpCalculatedAge(0);
        setNewEmpStartDate("");
        setNewEmpTenure("");
        setNewEmpProbationDate("");
        setNewEmpCalendarType("ปฏิทิน 2 ทีม (คู่กะ 12 ชม.)");
        setNewEmpRole("Operator");
        setNewEmpTargetOt(48);

        // Clear search & sync department filter so new employee is 100% visible on screen immediately
        setSearchQuery("");
        setSelectedDeptFilter("ทุกแผนก");
        setShiftsDeptFilter(newEmpDept || "inter2");

        // Reload state
        await fetchPortalState();
        alert(`เพิ่มพนักงาน "${fullName}" (รหัส: ${finalEmpId}) เข้าสู่แผนก ${newEmpDept.toUpperCase()} เรียบร้อยแล้ว!`);
      } else {
        const errData = await res.json().catch(() => ({}));
        await fetchPortalState();
        alert(errData.error || "เกิดข้อผิดพลาดในการเพิ่มข้อมูลพนักงาน");
      }
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setAddEmpLoading(false);
    }
  };

  const handleOpenAddEmployeeModal = () => {
    const defaultDept = currentShiftsDept || (activeDeptId !== "all" ? activeDeptId : "inter2");
    setNewEmpDept(defaultDept);
    setShowAddEmployeeModal(true);
  };

  // Handle clearing mock data
  const handleClearMockData = async () => {
    if (!window.confirm("⚠️ คุณแน่ใจหรือไม่ว่าต้องการล้างข้อมูลพนักงานและ OT records ทั้งหมด? การกระทำนี้จะไม่สามารถเรียกคืนข้อมูลกลับมาได้")) {
      return;
    }
    try {
      const res = await fetch("/api/clear-mock-data", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: currentUser?.role })
      });
      if (res.ok) {
        alert("ล้างข้อมูลพนักงาน และ OT records สำเร็จเรียบร้อยแล้ว!");
        await fetchPortalState();
      } else {
        alert("เกิดข้อผิดพลาดในการล้างข้อมูล");
      }
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    }
  };

  const handleExportEmployees = async () => {
    try {
      let employees = state?.employees || [];
      try {
        const res = await fetch("/api/export-employees", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: currentUser?.username })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.employees && Array.isArray(data.employees) && data.employees.length > 0) {
            employees = data.employees;
          }
        }
      } catch (e) {
        console.warn("Using local employees state for CSV export fallback:", e);
      }

      if (!employees || employees.length === 0) {
        alert("ไม่มีข้อมูลพนักงานสำหรับส่งออก");
        return;
      }
        
        // Define CSV headers
        const headers = [
          "รหัสพนักงาน", "คำนำหน้า", "ชื่อ", "นามสกุล", "ชื่อเล่น",
          "ตำแหน่ง", "แผนก", "ฝ่าย", "ฐานเงินเดือน ปี 2568", "วันเกิด",
          "อายุตัว", "คำนวณอายุตัว", "วันเริ่มงาน", "อายุงาน", "วันที่ผ่านทดลองงาน", "ปฏิทินทำงาน",
          "เป้าหมาย OT", "กลุ่มการทำงาน", "รหัสกะรายวัน"
        ];
        
        // Helper to escape values for CSV
        const escapeCsv = (val: any) => {
          if (val === null || val === undefined) return '""';
          let str = String(val);
          // Replace double quotes with two double quotes
          str = str.replace(/"/g, '""');
          return `"${str}"`;
        };

        const DEPT_LABELS: Record<string, string> = {
          inter2: "INTER 2", inter3: "INTER 3", inter5: "INTER 5",
          inter7: "INTER 7", heavy: "Heavy Machine", ecc: "ECC"
        };

        let csvContent = "\ufeff"; // Add BOM for Excel Thai language support
        csvContent += headers.join(",") + "\n";

        employees.forEach((emp: any) => {
          const shiftsStr = Array.isArray(getEmpShiftsArray(emp.shifts, state?.shiftConfig?.currentMonth)) ? getEmpShiftsArray(emp.shifts, state?.shiftConfig?.currentMonth).join(",") : "";
          const row = [
            escapeCsv(emp.id),
            escapeCsv(emp.prefix || ""),
            escapeCsv(emp.firstName || emp.name?.split(" ")[0] || ""),
            escapeCsv(emp.lastName || emp.name?.split(" ")[1] || ""),
            escapeCsv(emp.nickname || ""),
            escapeCsv(emp.role || ""),
            escapeCsv(DEPT_LABELS[emp.deptId] || emp.deptId),
            escapeCsv(emp.division || ""),
            emp.salary || 0,
            escapeCsv(emp.birthday || ""),
            emp.age || 0,
            emp.calculatedAge || 0,
            escapeCsv(emp.startDate || ""),
            escapeCsv(emp.tenure || ""),
            escapeCsv(emp.probationDate || ""),
            escapeCsv(emp.calendarType || ""),
            emp.targetOt ?? 48,
            escapeCsv(emp.groupName || ""),
            escapeCsv(shiftsStr)
          ];
          csvContent += row.join(",") + "\n";
        });

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", url);
        downloadAnchor.setAttribute("download", `employees_database_${new Date().toISOString().substring(0, 10)}.csv`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการส่งออกข้อมูล");
    }
  };

  const handleImportEmployees = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const parseCsvLine = (line: string): string[] => {
      const result: string[] = [];
      let current = "";
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          if (inQuotes && line[i + 1] === '"') {
            current += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === ',' && !inQuotes) {
          result.push(current);
          current = "";
        } else {
          current += char;
        }
      }
      result.push(current);
      return result;
    };

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split(/\r?\n/).filter(line => line.trim() !== "");
        if (lines.length < 2) {
          alert("ไฟล์ CSV ไม่มีข้อมูลพนักงาน (ต้องมีแถวหัวตารางและข้อมูลอย่างน้อย 1 แถว)");
          return;
        }

        const rawHeaders = parseCsvLine(lines[0]);
        const headerMap: Record<string, number> = {};
        rawHeaders.forEach((h, idx) => {
          const cleaned = h.trim().toLowerCase();
          headerMap[cleaned] = idx;
        });

        const getColIndex = (engKey: string, thaiKeys: string[]) => {
          if (headerMap[engKey.toLowerCase()] !== undefined) {
            return headerMap[engKey.toLowerCase()];
          }
          for (const tk of thaiKeys) {
            if (headerMap[tk.toLowerCase()] !== undefined) {
              return headerMap[tk.toLowerCase()];
            }
          }
          return -1;
        };

        const idIdx          = getColIndex("id",           ["รหัสพนักงาน", "รหัส"]);
        const prefixIdx      = getColIndex("prefix",       ["คำนำหน้า"]);
        const firstNameIdx   = getColIndex("firstName",    ["ชื่อ", "ชื่อพนักงาน"]);
        const lastNameIdx    = getColIndex("lastName",     ["นามสกุล"]);
        const nicknameIdx    = getColIndex("nickname",     ["ชื่อเล่น"]);
        const roleIdx        = getColIndex("role",         ["ตำแหน่ง", "บทบาท"]);
        const deptIdIdx      = getColIndex("deptId",       ["แผนก", "รหัสแผนก"]);
        const divisionIdx    = getColIndex("division",     ["ฝ่าย"]);
        const salaryIdx      = getColIndex("salary",       ["ฐานเงินเดือน ปี 2568", "ฐานเงินเดือน", "เงินเดือน"]);
        const birthdayIdx    = getColIndex("birthday",     ["วันเกิด"]);
        const ageIdx         = getColIndex("age",          ["อายุตัว"]);
        const calcAgeIdx     = getColIndex("calculatedAge", ["คำนวณอายุตัว"]);
        const startDateIdx   = getColIndex("startDate",     ["วันเริ่มงาน"]);
        const tenureIdx      = getColIndex("tenure",        ["อายุงาน"]);
        const probationIdx   = getColIndex("probationDate", ["วันที่ผ่านทดลองงาน", "ผ่านโปร"]);
        const calendarIdx    = getColIndex("calendarType",  ["ปฏิทินทำงาน"]);
        const targetOtIdx    = getColIndex("targetOt",     ["เป้าหมาย OT", "เป้าหมาย"]);
        const groupNameIdx   = getColIndex("groupName",    ["กลุ่มการทำงาน", "กลุ่ม"]);
        const shiftsIdx      = getColIndex("shifts",       ["รหัสกะรายวัน", "รหัสกะ"]);

        if (idIdx === -1) {
          alert("โครงสร้างหัวตาราง CSV ไม่ถูกต้อง อย่างน้อยต้องมีคอลัมน์: รหัสพนักงาน");
          return;
        }

        const parsedEmployees: any[] = [];
        for (let i = 1; i < lines.length; i++) {
          const values = parseCsvLine(lines[i]);
          if (values.length < 1) continue;

          const id = values[idIdx]?.trim();
          if (!id) continue;

          let prefix      = prefixIdx !== -1 ? (values[prefixIdx]?.trim() || "") : "";
          let firstName   = firstNameIdx !== -1 ? (values[firstNameIdx]?.trim() || "") : "";
          const lastName    = lastNameIdx !== -1 ? (values[lastNameIdx]?.trim() || "") : "";
          const nickname    = nicknameIdx !== -1 ? (values[nicknameIdx]?.trim() || "") : "";

          // Automatically extract prefix from firstName if prefix column is missing or empty
          const prefixes = ["นางสาว", "นาง", "นาย"];
          if (!prefix) {
            for (const p of prefixes) {
              if (firstName.startsWith(p)) {
                prefix = p;
                break;
              }
            }
            if (!prefix) prefix = "นาย"; // default
          }

          // Strip the prefix from the first name to avoid duplicate values like "นาย" in prefix and "นายศิระ" in first name
          for (const p of prefixes) {
            if (firstName.startsWith(p)) {
              firstName = firstName.substring(p.length).trim();
              break;
            }
          }

          const name = (prefix + firstName + (lastName ? " " + lastName : "")).trim() || id;
          
          const rawDept     = deptIdIdx !== -1 ? (values[deptIdIdx]?.trim() || "inter2") : "inter2";
          const cleanedDept = rawDept.toLowerCase().replace(/แผนก\s*/, "");
          const deptMap: Record<string, string> = {
            "inter 2": "inter2", "inter2": "inter2",
            "inter 3": "inter3", "inter3": "inter3",
            "inter 5": "inter5", "inter5": "inter5",
            "inter 7": "inter7", "inter7": "inter7",
            "heavy machine": "heavy", "heavy": "heavy", "heavy_machine": "heavy",
            "ecc": "ecc"
          };
          const deptId      = deptMap[cleanedDept] || rawDept;
          
          const role        = roleIdx !== -1 ? (values[roleIdx]?.trim() || "Operator") : "Operator";
          const division    = divisionIdx !== -1 ? (values[divisionIdx]?.trim() || "") : "";
          const salary      = salaryIdx !== -1 ? (Number(values[salaryIdx]) || 15000) : 15000;
          const birthday    = birthdayIdx !== -1 ? (values[birthdayIdx]?.trim() || "") : "";
          const age         = ageIdx !== -1 ? (Number(values[ageIdx]) || 0) : 0;
          const calculatedAge = calcAgeIdx !== -1 ? (Number(values[calcAgeIdx]) || 0) : 0;
          const startDate   = startDateIdx !== -1 ? (values[startDateIdx]?.trim() || "") : "";
          const tenure      = tenureIdx !== -1 ? (values[tenureIdx]?.trim() || "") : "";
          const probationDate = probationIdx !== -1 ? (values[probationIdx]?.trim() || "") : "";
          const calendarType = calendarIdx !== -1 ? (values[calendarIdx]?.trim() || "ปฏิทินกะ 4-on-2-off") : "ปฏิทิน 2 ทีม (คู่กะ 12 ชม.)";

          const targetOt    = targetOtIdx !== -1 ? (Number(values[targetOtIdx]) || 48) : 48;
          const groupName   = groupNameIdx !== -1 ? (values[groupNameIdx]?.trim() || "") : "";
          
          let shifts: string[] = [];
          if (shiftsIdx !== -1) {
            const rawShifts = values[shiftsIdx]?.trim() || "";
            if (rawShifts) {
              shifts = rawShifts.split(",").map(s => s.trim()).filter(s => s !== "");
            }
          }

          parsedEmployees.push({
            id, name, deptId, role, targetOt, groupName, shifts,
            prefix, firstName, lastName, nickname, division, salary, birthday, age, calculatedAge, startDate, tenure, probationDate, calendarType
          });
        }

        if (parsedEmployees.length === 0) {
          alert("ไม่พบข้อมูลพนักงานที่ถูกต้องในไฟล์ CSV");
          return;
        }

        if (!window.confirm(`⚠️ คุณแน่ใจหรือไม่ว่าต้องการนำเข้าพนักงานจำนวน ${parsedEmployees.length} คน จากไฟล์ CSV? ข้อมูลรายชื่อและกะทำงานเดิมจะถูกล้างและแทนที่ทั้งหมด`)) {
          return;
        }

        const res = await fetch("/api/import-employees", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: currentUser?.username,
            employees: parsedEmployees
          })
        });

        if (res.ok) {
          alert("นำเข้าฐานข้อมูลพนักงานจากไฟล์ CSV สำเร็จเรียบร้อยแล้ว!");
          await fetchPortalState();
        } else {
          const errData = await res.json();
          alert(errData.error || "เกิดข้อผิดพลาดในการนำเข้าข้อมูล");
        }
      } catch (err) {
        console.error(err);
        alert("เกิดข้อผิดพลาดในการอ่านไฟล์ CSV");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // Handle editing existing employee
  const handleEditEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee) return;
    if (!editEmpFirstName) {
      alert("กรุณากรอกชื่อพนักงาน");
      return;
    }
    const fullName = (editEmpFirstName + (editEmpLastName ? " " + editEmpLastName : "")).trim();
    const finalStatus = editEmpStatus || (editEmpResignationDate ? "Resigned" : "Active");
    // Determine updated shifts based on calendarType
    let updatedShifts = editingEmployee.shifts;
    let updatedPlanShifts = editingEmployee.planShifts;
    const currentMonthKey = state?.shiftConfig?.currentMonth || "2026-08";
    const [yStr, mStr] = currentMonthKey.split("-");
    const totalDays = new Date(Number(yStr), Number(mStr), 0).getDate();

    if (!updatedShifts || (Array.isArray(updatedShifts) && updatedShifts.length === 0) || editEmpCalendarType !== editingEmployee.calendarType) {
      let pattern: string[] = [];
      if (editEmpCalendarType?.includes("2 ทีม") || editEmpCalendarType?.includes("12")) {
        const cycle = ["M12", "M12", "N12", "N12", "OFF", "OFF"];
        pattern = Array.from({ length: totalDays }, (_, i) => cycle[i % cycle.length]);
      } else if (editEmpCalendarType?.includes("3 ทีม") || editEmpCalendarType?.includes("8-8-8")) {
        const cycle = ["M8", "M8", "A8", "A8", "N8", "N8", "OFF", "OFF"];
        pattern = Array.from({ length: totalDays }, (_, i) => cycle[i % cycle.length]);
      } else {
        pattern = Array.from({ length: totalDays }, (_, i) => {
          const d = new Date(Number(yStr), Number(mStr) - 1, i + 1);
          return (d.getDay() === 0 || d.getDay() === 6) ? "OFF" : "M8";
        });
      }

      let shiftsObj: Record<string, string[]> = {};
      if (typeof updatedShifts === "string") {
        try { shiftsObj = JSON.parse(updatedShifts); } catch (_) {}
      } else if (updatedShifts && typeof updatedShifts === "object" && !Array.isArray(updatedShifts)) {
        shiftsObj = { ...updatedShifts };
      }
      shiftsObj[currentMonthKey] = pattern;
      updatedShifts = JSON.stringify(shiftsObj);
      updatedPlanShifts = JSON.stringify(shiftsObj);
    }

    try {
      const res = await fetch("/api/edit-employee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingEmployee.id,
          shifts: updatedShifts,
          planShifts: updatedPlanShifts,
          name: fullName,
          deptId: editEmpDept,
          role: editEmpRole,
          groupName: editEmpGroupName,
          targetOt: editEmpTargetOt,
          prefix: editEmpPrefix,
          firstName: editEmpFirstName,
          lastName: editEmpLastName,
          nickname: editEmpNickname,
          division: editEmpDivision,
          salary: canAccessSalary ? editEmpSalary : (editingEmployee.salary || 15000),
          birthday: editEmpBirthday,
          age: editEmpAge,
          calculatedAge: editEmpCalculatedAge,
          startDate: editEmpStartDate,
          tenure: editEmpTenure,
          probationDate: editEmpProbationDate,
          calendarType: editEmpCalendarType,
          resignationDate: editEmpResignationDate,
          employmentStatus: finalStatus,
          username: currentUser?.username
        })
      });

      // Optimistically update local React state
      setState(prev => {
        if (!prev) return prev;
        const updatedEmps = prev.employees.map(emp => {
          if (emp.id === editingEmployee.id) {
            return {
              ...emp,
              name: fullName,
              deptId: editEmpDept,
              role: editEmpRole,
              groupName: editEmpGroupName,
              targetOt: editEmpTargetOt,
              prefix: editEmpPrefix,
              firstName: editEmpFirstName,
              lastName: editEmpLastName,
              nickname: editEmpNickname,
              division: editEmpDivision,
              salary: canAccessSalary ? editEmpSalary : (editingEmployee.salary || 15000),
              birthday: editEmpBirthday,
              age: editEmpAge,
              calculatedAge: editEmpCalculatedAge,
              startDate: editEmpStartDate,
              tenure: editEmpTenure,
              shifts: updatedShifts,
              planShifts: updatedPlanShifts,
              probationDate: editEmpProbationDate,
              calendarType: editEmpCalendarType,
              resignationDate: editEmpResignationDate,
              employmentStatus: finalStatus as any
            };
          }
          return emp;
        });
        return { ...prev, employees: updatedEmps };
      });

      if (res.ok) {
        setShowEditEmployeeModal(false);
        setEditingEmployee(null);
        await fetchPortalState();
        alert("แก้ไขข้อมูลพนักงานสำเร็จ!");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteEmployee = async (employeeId: string) => {
    if (!window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบพนักงานรายนี้ออกจากระบบ? ข้อมูลประวัติ OT ของพนักงานรายนี้จะถูกลบออกทั้งหมดด้วย")) {
      return;
    }
    try {
      const res = await fetch("/api/delete-employee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: employeeId,
          role: currentUser?.role
        })
      });
      if (res.ok) {
        setShowEditEmployeeModal(false);
        setEditingEmployee(null);
        await fetchPortalState();
        alert("ลบข้อมูลพนักงานสำเร็จเรียบร้อยแล้ว!");
      } else {
        const errData = await res.json();
        alert(errData.error || "เกิดข้อผิดพลาดในการลบข้อมูล");
      }
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    }
  };

  const startEditEmployee = (emp: Employee) => {
    setEditingEmployee(emp);
    setEditEmpName(emp.name);
    setEditEmpDept(emp.deptId);
    setEditEmpRole(emp.role);
    setEditEmpGroupName(emp.groupName);
    setEditEmpTargetOt(emp.targetOt);
    
    let pfx = emp.prefix || "";
    let fName = emp.firstName || "";
    let lName = emp.lastName || "";

    const prefixes = ["นางสาว", "นาง", "นาย"];

    // If fName is empty, split from full name
    if (!fName && emp.name) {
      let cleanName = emp.name.trim();
      // See if full name starts with a prefix
      for (const p of prefixes) {
        if (cleanName.startsWith(p)) {
          pfx = p;
          cleanName = cleanName.substring(p.length).trim();
          break;
        }
      }
      const parts = cleanName.split(/\s+/);
      fName = parts[0] || "";
      lName = parts.slice(1).join(" ") || lName;
    }

    // Clean prefix from fName if present to avoid duplicate prefixes
    for (const p of prefixes) {
      if (fName.startsWith(p)) {
        if (!pfx) pfx = p;
        fName = fName.substring(p.length).trim();
        break;
      }
    }

    if (!pfx) pfx = "นาย"; // default fallback

    setEditEmpPrefix(pfx);
    setEditEmpFirstName(fName);
    setEditEmpLastName(lName);
    setEditEmpNickname(emp.nickname || "");
    setEditEmpDivision(emp.division || "");
    setEditEmpSalary(emp.salary || 15000);
    setEditEmpBirthday(emp.birthday || "");
    setEditEmpAge(emp.age || 0);
    setEditEmpCalculatedAge(emp.calculatedAge || 0);
    setEditEmpStartDate(emp.startDate || "");
    setEditEmpTenure(emp.tenure || "");
    setEditEmpProbationDate(emp.probationDate || "");
    setEditEmpCalendarType(emp.calendarType || "ปฏิทิน 2 ทีม (คู่กะ 12 ชม.)");
    setEditEmpResignationDate(emp.resignationDate || "");
    setEditEmpStatus(emp.employmentStatus || (emp.resignationDate ? "Resigned" : "Active"));
    
    setShowEditEmployeeModal(true);
  };

  // Handle shift changes in UI by showing custom picker
  const handleShiftCellClick = (employeeId: string, dayIndex: number) => {
    setActiveEditingCell(prev => 
      prev && prev.employeeId === employeeId && prev.dayIndex === dayIndex
        ? null
        : { employeeId, dayIndex }
    );
  };

  const handleSelectShiftValue = async (employeeId: string, dayIndex: number, newValue: string) => {
    const targetEmp = state.employees.find(e => e.id === employeeId);
    if (!targetEmp) return;

        const monthKey = state?.shiftConfig?.currentMonth || "2026-08";
    const shiftsArray = getEmpShiftsArray(targetEmp.shifts, monthKey);
    const newShifts = [...shiftsArray];
    while (newShifts.length <= dayIndex) {
      newShifts.push("O");
    }
    newShifts[dayIndex] = newValue;

    let dbShifts: any = {};
    try {
      dbShifts = targetEmp.shifts ? (typeof targetEmp.shifts === "string" ? JSON.parse(targetEmp.shifts) : targetEmp.shifts) : {};
    } catch { dbShifts = {}; }
    if (Array.isArray(dbShifts)) { dbShifts = { "2026-08": dbShifts }; }
    dbShifts[monthKey] = newShifts;

    const updatedEmpObj = { ...targetEmp, shifts: JSON.stringify(dbShifts) };

    setState(prev => ({
      ...prev,
      employees: prev.employees.map(e => e.id === employeeId ? updatedEmpObj : e)
    }));
    setActiveEditingCell(null);

    try {
      const [y, m] = (state.shiftConfig.currentMonth || "").split("-");
      const updatedEmployeeList = state.employees.map(e => e.id === employeeId ? updatedEmpObj : e);
      await fetch("/api/save-shifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employees: updatedEmployeeList,
          year: y ? Number(y) : undefined,
          month: m ? Number(m) : undefined
        })
      });
    } catch (err) {
      console.error("Error saving shift in real-time:", err);
    }
  };

  // Save the temporary edited shifts back to server
  const handleSaveShifts = async () => {
    try {
      const [y, m] = (state.shiftConfig.currentMonth || "").split("-");
      const res = await fetch("/api/save-shifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employees: tempEmployees,
          year: y ? Number(y) : undefined,
          month: m ? Number(m) : undefined
        })
      });
      if (res.ok) {
        setIsEditingShifts(false);
        await fetchPortalState();
        alert("บันทึกตารางกะสำเร็จแล้ว!");
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.error || "เกิดข้อผิดพลาดในการบันทึกตารางกะ");
      }
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    }
  };

  const handleSaveVesselSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVesselName || !newVesselStartDate || !newVesselEndDate || !currentShiftsDept) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }
    try {
      const res = await fetch("/api/save-vessel-schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: newVesselType,
          planType: newVesselPlanType,
          name: newVesselName,
          startDate: newVesselStartDate,
          endDate: newVesselEndDate,
          deptId: currentShiftsDept,
          color: newVesselColor,
          tonnage: Number(newVesselTonnage) || 0,
          username: currentUser?.username || "user"
        })
      });
      if (res.ok) {
        setNewVesselName("");
        setNewVesselStartDate("");
        setNewVesselEndDate("");
        setNewVesselTonnage("");
        await fetchVesselSchedules();
        alert("บันทึกตารางเรียบร้อยแล้ว!");
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || "เกิดข้อผิดพลาด");
      }
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการบันทึก");
    }
  };

  const handleDeleteVesselSchedule = async (id: string) => {
    if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?")) return;
    try {
      const res = await fetch(`/api/delete-vessel-schedule/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        await fetchVesselSchedules();
      } else {
        alert("เกิดข้อผิดพลาดในการลบ");
      }
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาด");
    }
  };

  // Export shift schedule as Payroll-Ready OT Payment CSV (รูปแบบทำจ่ายค่าล่วงเวลา)
  const handleRestoreEmployee = async (emp: any) => {
    if (!window.confirm(`⚠️ คุณแน่ใจหรือไม่ว่าต้องการคืนสภาพพนักงาน "${emp.name}" กลับเป็นพนักงานปกติ (Active)?`)) {
      return;
    }
    try {
      const res = await fetch("/api/edit-employee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: emp.id,
          name: emp.name,
          deptId: emp.deptId,
          role: emp.role,
          targetOt: emp.targetOt,
          groupName: emp.groupName,
          prefix: emp.prefix,
          firstName: emp.firstName,
          lastName: emp.lastName,
          nickname: emp.nickname,
          division: emp.division,
          salary: emp.salary,
          birthday: emp.birthday,
          age: emp.age,
          calculatedAge: emp.calculatedAge,
          startDate: emp.startDate,
          tenure: emp.tenure,
          probationDate: emp.probationDate,
          calendarType: emp.calendarType,
          resignationDate: "",
          employmentStatus: "Active",
          shifts: emp.shifts,
          planShifts: emp.planShifts,
          username: currentUser?.username || "system"
        })
      });

      if (res.ok) {
        setState(prev => ({
          ...prev,
          employees: prev.employees.map(e => e.id === emp.id ? { ...e, employmentStatus: "Active", resignationDate: "" } : e)
        }));
        showToast(`คืนสภาพพนักงาน "${emp.name}" สำเร็จแล้ว! 🎉`, "success");
      } else {
        showToast("เกิดข้อผิดพลาดในการคืนสภาพพนักงาน", "error");
      }
    } catch (e) {
      console.error(e);
      showToast("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์", "error");
    }
  };

  const handleExportShiftsCsv = () => {
    const activeList = isEditingShifts ? tempEmployees : state.employees;
    const currentDept = currentShiftsDept || (activeDeptId !== "all" ? activeDeptId : undefined);
    const filtered = activeList
      .filter(e => !currentDept || currentDept === "all" || normalizeDeptId(e.deptId) === normalizeDeptId(currentDept))
      .filter(e => e.employmentStatus !== "Resigned" && e.employmentStatus !== "ลาออก");

    if (filtered.length === 0) { alert("ไม่มีข้อมูลพนักงานสำหรับส่งออก"); return; }

    const currentMonthKey = state?.shiftConfig?.currentMonth || "2026-08";
    const [y, m] = currentMonthKey.split("-");
    const totalDaysInMonth = new Date(Number(y), Number(m), 0).getDate();

    const esc = (v: any) => { const s = String(v ?? "").replace(/"/g, '""'); return `"${s}"`; };

    // Build Daily OT Hour Headers: วันที่ 1, วันที่ 2, ...
    const dayHeaders = Array.from({ length: totalDaysInMonth }, (_, i) => {
      const dNum = i + 1;
      const dObj = new Date(Number(y), Number(m) - 1, dNum);
      const isSunday = dObj.getDay() === 0;
      return `"${dNum} (${isSunday ? 'อา' : 'จ-ส'})"`;
    }).join(",");

    let csv = "\ufeff"; // BOM for Excel Thai
    // Payroll Structure Header
    csv += `รหัสพนักงาน,ชื่อ-นามสกุล,แผนก,ตำแหน่ง,ฐานเงินเดือน (บาท),อัตราค่าจ้างต่อ ชม. (บาท),OT วันทำงานปกติ 1.5x (ชม.),ทำงานวันหยุด 1.0x (วัน),OT วันหยุด 3.0x (ชม.),ยอดรวม ชม. OT ทั้งเดือน (ชม.),ยอดเงินทำจ่ายค่าล่วงเวลา (บาท),% เทียบฐานเงินเดือน,${dayHeaders}\n`;

    filtered.forEach(emp => {
      const breakdown = getEmpMonthlyOtPayBreakdown(emp, currentMonthKey);
      const shifts = getEmpShiftsArray(emp.shifts, currentMonthKey);
      const deptLabel = getDeptName(emp.deptId, state?.departments) || emp.deptId;
      const salary = emp.salary || 15000;
      const hourlyRate = (salary / 240).toFixed(2);

      // Extract exact daily OT hours for each day of the month
      const dailyOtHours = Array.from({ length: totalDaysInMonth }, (_, i) => {
        const shiftCode = shifts[i] || "O";
        const dObj = new Date(Number(y), Number(m) - 1, i + 1);
        const isSunday = dObj.getDay() === 0;
        const isOff = shiftCode === "O" || shiftCode === "OFF";

        if (isOff) return "0";
        if (shiftCode === "OND") return "8";
        if (isSunday) {
          const ot = getShiftOtHours(shiftCode);
          return ot > 0 ? String(ot) : (shiftCode.endsWith("12") ? "4" : (shiftCode.endsWith("16") ? "8" : "0"));
        }
        return String(getShiftOtHours(shiftCode));
      });

      const totalOtHoursMonth = breakdown.normalOt + breakdown.holidayOt + (breakdown.holidayWorkDays * 8);

      const row = [
        esc(emp.id),
        esc(emp.name),
        esc(deptLabel),
        esc(emp.role || ""),
        salary,
        hourlyRate,
        breakdown.normalOt,
        breakdown.holidayWorkDays,
        breakdown.holidayOt,
        totalOtHoursMonth,
        breakdown.totalOtPay,
        `${breakdown.otPctSalary}%`,
        ...dailyOtHours
      ];

      csv += row.join(",") + "\n";
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `แบบสรุปทำจ่ายค่าล่วงเวลา_${currentMonthKey}_${currentDept ? (getDeptName(currentDept, state?.departments) || currentDept) : "ทุกแผนก"}.csv`;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  };

  // Trigger Gemini AI compliance and audit report
  const handleTriggerAiAudit = async () => {
    try {
      setGeneratingAiReport(true);
      setShowAiAuditModal(true);
      const res = await fetch("/api/audit-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      if (res.ok) {
        const data = await res.json();
        setAiReportText(data.report);
      }
    } catch (err) {
      console.error(err);
      setAiReportText("เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์ปัญญาประดิษฐ์");
    } finally {
      setGeneratingAiReport(false);
    }
  };

  // Calculations for shift view summary
  const getDailyShiftSummary = (dayIndex: number, deptId: string) => {
    let mCount = 0;
    let aCount = 0;
    let nCount = 0;

    const activeList = (isEditingShifts ? tempEmployees : state.employees).filter(emp => emp.deptId === deptId);

    activeList.forEach(emp => {
      const paddedShifts = getEmployeeShiftsForView(emp.shifts, daysLimit);
      const shift = paddedShifts[dayIndex];
      if (shift) {
        if (shift === "M" || shift.startsWith("M") || shift === "M12" || shift === "M16") mCount++;
        if (shift === "A" || shift.startsWith("A") || shift === "A12") aCount++;
        if (shift === "N" || shift.startsWith("N") || shift === "N12" || shift === "N16") nCount++;
      }
    });
    
    return {
      text: `${mCount}/${aCount}/${nCount}`,
      lowCoverage: mCount < 1 || aCount < 1 || nCount < 1
    };
  };

  const getDynamicEmployeeOt = (empId: string, monthFilter: string) => {
    const emp = state.employees.find(e => e.id === empId);
    return emp ? emp.actualOt : 0;
  };

  const getDynamicDeptOt = (deptId: string, monthFilter: string) => {
    const dept = state.departments.find(d => d.id === deptId);
    return dept ? dept.otHours : 0;
  };

  const getDeptManagerInfo = (deptId: string) => {
    const mgr = accounts.find(acc => acc.deptId === deptId) || accounts.find(acc => acc.role === "ผู้ดูแลระบบ");
    const empMgr = state.employees.find(e => e.deptId === deptId && (e.role.includes("Manager") || e.role.includes("หัวหน้า") || e.role.includes("Supervisor")));
    
    if (mgr) {
      return {
        username: mgr.username,
        name: mgr.name,
        role: mgr.role,
        avatar: mgr.avatar
      };
    }
    if (empMgr) {
      return {
        username: empMgr.id,
        name: empMgr.name,
        role: empMgr.role,
        avatar: empMgr.avatar
      };
    }
    const dept = state.departments.find(d => d.id === deptId);
    return {
      username: deptId + "_mgr",
      name: dept ? dept.manager : "ผู้จัดการแผนก",
      role: dept ? dept.managerRole : "Section Manager",
      avatar: ""
    };
  };

  // Sort departments dynamically
  // Filter departments for report view and compute real dynamic OT/Budgets
  const reportDepartments = state.departments.map(dept => {
    const deptEmps = state.employees.filter(e => e.deptId === dept.id);
    let totalOt = 0;
    deptEmps.forEach(emp => {
            let ot = emp.actualOt || 0;
      const shiftsArray = getEmpShiftsArray(emp.shifts, state?.shiftConfig?.currentMonth);
      if (shiftsArray && shiftsArray.length > 0) {
        let shiftOt = 0;
        shiftsArray.forEach((code: string) => {
          if (code === "OND") shiftOt += 8;
          else if (code.endsWith("12") || code === "M12" || code === "A12" || code === "N12") shiftOt += 4;
          else if (code.endsWith("16") || code === "M16" || code === "N16") shiftOt += 8;
        });
        if (shiftOt > 0) ot = shiftOt;
      }
      totalOt += ot;
    });

    const budgetUsed = totalOt * 300; // Estimated 300 THB/hr
    const budgetUtilization = Math.min(100, Math.round((totalOt / Math.max(1, deptEmps.length * 48)) * 100));
    const status = budgetUtilization > 90 ? "Warning" : "On Track";

    return {
      ...dept,
      employeesCount: deptEmps.length,
      otHours: totalOt,
      budgetUsed,
      budgetUtilization,
      status
    };
  }).filter(dept => {
    if (selectedDeptFilter === "ทุกแผนก" || selectedDeptFilter === "ทุกแผนกทำงาน") return true;
    
    const deptMap: { [key: string]: string } = {
      "INTER 2": "inter2",
      "INTER 3": "inter3",
      "INTER 5": "inter5",
      "INTER 7": "inter7",
      "Heavy Machine": "heavy",
      "ECC": "ecc"
    };
    const filterDeptId = deptMap[selectedDeptFilter];
    return dept.id === filterDeptId;
  });

  // Find employees belonging to the selected department for reports
  const filteredEmployeesForReport = state.employees.filter(emp => {
    if (selectedDeptFilter === "ทุกแผนก" || selectedDeptFilter === "ทุกแผนกทำงาน") return false;
    
    const deptMap: { [key: string]: string } = {
      "INTER 2": "inter2",
      "INTER 3": "inter3",
      "INTER 5": "inter5",
      "INTER 7": "inter7",
      "Heavy Machine": "heavy",
      "ECC": "ecc"
    };
    const filterDeptId = deptMap[selectedDeptFilter];
    return emp.deptId === filterDeptId;
  });

  // Sort departments dynamically
  const sortedDepartments = [...reportDepartments].sort((a, b) => {
    if (reportSortBy === "OT Hours (High to Low)") {
      return b.otHours - a.otHours;
    } else if (reportSortBy === "Department Name") {
      return a.nameTh.localeCompare(b.nameTh);
    } else {
      return b.budgetUsed - a.budgetUsed;
    }
  });

  const getRadarPoints = (v1: number, v2: number, v3: number, v4: number, v5: number) => {
    const p1 = `50,${50 - 40 * v1}`;
    const p2 = `${50 + 38 * v2},${50 - 12 * v2}`;
    const p3 = `${50 + 24 * v3},${50 + 32 * v3}`;
    const p4 = `${50 - 24 * v4},${50 + 32 * v4}`;
    const p5 = `${50 - 38 * v5},${50 - 12 * v5}`;
    return `${p1} ${p2} ${p3} ${p4} ${p5}`;
  };

  const getWeeksInMonth = (year: number, month: number) => {
    const numDays = new Date(year, month, 0).getDate();
    const weeks: { weekNum: number; startDay: number; endDay: number }[] = [];
    
    const getWeekNumber = (date: Date) => {
      const start = new Date(date.getFullYear(), 0, 1);
      const diff = date.getTime() - start.getTime() + (start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000;
      const oneDay = 1000 * 60 * 60 * 24;
      const day = Math.floor(diff / oneDay) + 1;
      return Math.ceil(day / 7);
    };

    for (let day = 1; day <= numDays; day++) {
      const date = new Date(year, month - 1, day);
      const wNum = getWeekNumber(date);
      let existing = weeks.find(w => w.weekNum === wNum);
      if (existing) {
        existing.endDay = day;
      } else {
        weeks.push({ weekNum: wNum, startDay: day, endDay: day });
      }
    }
    return weeks;
  };

  const dayNames = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];
  const getDaysInMonth = (year: number, month: number) => new Date(year, month, 0).getDate();
  const yearMonth = state?.shiftConfig?.currentMonth || new Date().toISOString().substring(0, 7);
  const [yStr, mStr] = yearMonth.split("-");
  const yr = Number(yStr) || new Date().getFullYear();
  const mn = Number(mStr) || (new Date().getMonth() + 1);
  const totalDays = getDaysInMonth(yr, mn);

  const weeksList = getWeeksInMonth(yr, mn);

  let startDay = 1;
  let endDay = totalDays;
  if (selectedWeek !== "all") {
    const wNum = Number(selectedWeek);
    const activeWeekObj = weeksList.find(w => w.weekNum === wNum);
    if (activeWeekObj) {
      startDay = activeWeekObj.startDay;
      endDay = activeWeekObj.endDay;
    }
  }

  const currentDays = Array.from({ length: endDay - startDay + 1 }, (_, i) => {
    const dayNum = startDay + i;
    const dateObj = new Date(yr, mn - 1, dayNum);
    const dayOfWeek = dateObj.getDay();
    const th = dayNames[dayOfWeek];
    const weekend = dayOfWeek === 0 || dayOfWeek === 6;
    return { th, n: dayNum, weekend };
  });



  // Filter employees dynamically for dashboard
  const dashboardEmployees = state.employees.filter(emp => {
    let matchesDept = true;
    if (selectedDeptFilter !== "ทุกแผนก") {
      matchesDept = normalizeDeptId(emp.deptId) === normalizeDeptId(selectedDeptFilter);
    }
    const matchesRole = matchesRoleFilter(emp.role);
    return matchesDept && matchesRole;
  });

  // Compute KPI metrics for a given employee subset
  const computeKpiForEmployees = (emps: typeof state.employees) => {
    const n = emps.length;
    if (n === 0) return { coveragePct: 0, productivityPct: 0, costEfficiencyPct: 0, safetyPct: 0, attendancePct: 0 };
    const scheduledCount = emps.filter(e => {
      const arr = getEmpShiftsArray(e.shifts, state?.shiftConfig?.currentMonth);
      return arr.some((s: string) => s !== "O" && s !== "");
    }).length;
    const coveragePct = scheduledCount / n;
    const warningCount = emps.filter(e => (e.actualOt || 0) > (e.targetOt || 48)).length;
    const productivityPct = Math.max(0, 1 - warningCount / n);
    
    // Cost efficiency based on budget utilization
    const subsetBudgetUsed = emps.reduce((s, e) => s + (e.actualOt || 0) * 300, 0);
    const targetBudget = emps.reduce((s, e) => s + (e.targetOt || 48) * 300, 0);
    const costEfficiencyPct = targetBudget > 0 ? Math.max(0.1, 1 - Math.abs(targetBudget - subsetBudgetUsed) / targetBudget) : 0.7;
    
    const fatiguedCount = emps.filter(e => (e.actualOt || 0) > 36).length;
    const safetyPct = Math.max(0, 1 - fatiguedCount / n);
    const activeCount = emps.filter(e => {
      const arr = getEmpShiftsArray(e.shifts, state?.shiftConfig?.currentMonth);
      return arr.some((s: string) => s === "D" || s.startsWith("M") || s.startsWith("A") || s.startsWith("N"));
    }).length;
    const attendancePct = activeCount / n;
    return { coveragePct, productivityPct, costEfficiencyPct, safetyPct, attendancePct };
  };

  // Compute stats dynamically for Dashboard based on selected month/dept/role
  const kpi = computeKpiForEmployees(dashboardEmployees);
  const { coveragePct, productivityPct, costEfficiencyPct, safetyPct, attendancePct } = kpi;

  const companyPoints = getRadarPoints(coveragePct, productivityPct, costEfficiencyPct, safetyPct, attendancePct);
  const safetyBaselinePoints = getRadarPoints(0.5, 0.6, 0.55, 0.5, 0.6);

  // Compute OT skewness / distribution for the 10 operating roles
  const operatingRoles = [
    "ผู้ควบคุมงานขนถ่ายสินค้า",
    "พนักงานขับเครน",
    "ปากเรือ",
    "ผู้ควบคุมงานจักรกลหนัก",
    "ช่างขับจักรกลหนัก",
    "O&M - Specialist",
    "O&M - Generator",
    "O&M - Mechanical",
    "O&M - Electrical",
    "ECC"
  ];

  const roleOtData = operatingRoles.map(role => {
    // Sum OT hours of all employees in this role in the filtered dashboard list
    const empsInRole = dashboardEmployees.filter(e => e.role === role);
    const totalOt = Math.round(empsInRole.reduce((s, e) => s + (e.actualOt || 0), 0) * 10) / 10;
    const empCount = empsInRole.length;
    return { role, totalOt, empCount };
  });

  const maxRoleOt = Math.max(...roleOtData.map(r => r.totalOt), 1);

  // Compute Thai labor law compliance violations dynamically
  const fatiguedEmployees = dashboardEmployees.filter(emp => {
    // 1. OT hours > 36 hours (risk threshold)
    if ((emp.actualOt || 0) > 36) return true;
    
    // 2. Consecutive shifts (more than 6 days in a row without 'O' or '')
    let maxConsecutive = 0;
    let currentConsecutive = 0;
    const shiftsArrayFatigue = getEmpShiftsArray(emp.shifts, state?.shiftConfig?.currentMonth);
    for (const shift of shiftsArrayFatigue) {
      if (shift !== "O" && shift !== "") {
        currentConsecutive++;
        if (currentConsecutive > maxConsecutive) {
          maxConsecutive = currentConsecutive;
        }
      } else {
        currentConsecutive = 0;
      }
    }
    return maxConsecutive > 6;
  });

  // ==========================================
  // Heatmap Aggregation calculations
  // ==========================================
  const heatmapGrid = Array.from({ length: 3 }, () => Array(7).fill(0));

  state.employees.forEach(emp => {
    if (activeDeptId !== "all" && emp.deptId !== activeDeptId) return;
    
        const shifts = getEmpShiftsArray(emp.shifts, state?.shiftConfig?.currentMonth);
    shifts.forEach((shift, dayIdx) => {
      const dateObj = new Date(yr, mn - 1, dayIdx + 1);
      const dayOfWeek = dateObj.getDay();
      const hDayIdx = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // 0=Mon, ..., 6=Sun
      
      if (shift === "M12" || shift === "N12") {
        heatmapGrid[0][hDayIdx] += 4;
      } else if (shift === "M16" || shift === "N16" || shift === "OND") {
        heatmapGrid[1][hDayIdx] += 8;
      } else if (shift === "A12") {
        heatmapGrid[2][hDayIdx] += 4;
      }
    });
  });

  const maxHeatValue = Math.max(...heatmapGrid.flat(), 1);

  const getHeatColorClass = (val: number) => {
    if (val === 0) return "bg-slate-100 text-slate-300";
    const ratio = val / maxHeatValue;
    if (ratio < 0.25) return "bg-blue-50 text-blue-600 font-bold border border-blue-100/50";
    if (ratio < 0.5) return "bg-blue-100 text-blue-800 font-bold border border-blue-200/50";
    if (ratio < 0.75) return "bg-blue-500 text-white font-bold";
    return "bg-blue-800 text-white font-bold";
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
        {/* Soft Port Image Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center filter blur-[2px] scale-105 opacity-65 transition-all duration-700" 
          style={{ backgroundImage: `url(${loginBg})` }}
        ></div>

        {/* Dark Glassmorphism Gradient Mask */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/70 via-blue-950/65 to-slate-900/75"></div>

        {/* Animated background blobs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full filter blur-3xl animate-pulse delay-1000"></div>
        
        {/* Card wrapper */}
        <div className="w-full max-w-md bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 shadow-2xl relative z-10 text-white">
          <div className="text-center mb-8">
            <div className="bg-white/90 backdrop-blur-md p-3.5 rounded-2xl inline-block mx-auto mb-4 shadow-lg shadow-black/20 border border-white/40">
              <img src="https://doubleapaper.com/DA-logo.png" alt="Double A" className="h-12 object-contain" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">Double A Terminal</h1>
            <p className="text-xs text-sky-200 mt-1 font-bold uppercase tracking-wider">Port & Berth Operations OT Portal</p>
            <p className="text-[11px] text-slate-300 mt-1 font-medium">เข้าสู่ระบบเพื่อจัดการเวลาการทำงานเทียบเรือและโอทีหน้าท่า</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">ชื่อผู้ใช้ (Username)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input 
                  type="text"
                  required
                  placeholder="admin"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-500 text-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">รหัสผ่าน (Password)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input 
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-500 text-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {loginError && (
              <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-300 rounded-2xl text-xs font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold rounded-2xl text-sm transition-all shadow-lg shadow-blue-500/20 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
            >
              {loginLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span>ลงชื่อเข้าใช้งาน</span>
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-[10px] text-slate-400 font-medium">
            <p className="mt-1">ระบบรักษาความปลอดภัยระดับองค์กร (Enterprise Grade Security)</p>
          </div>
        </div>
      </div>
    );
  }

  const handleExportCsvReport = () => {
    try {
      let csvContent = "";
      // Add UTF-8 BOM so Excel opens it with correct Thai characters encoding
      csvContent += "\ufeff";
      
      // Header row
      csvContent += "แผนก,จำนวนพนักงาน (คน),ชั่วโมง OT รวม (ชม.),งบประมาณที่ใช้จริง (บาท),สัดส่วนการใช้งบ (%),สถานะงบประมาณ\n";
      
      reportDepartments.forEach(dept => {
        const otHours = getDynamicDeptOt(dept.id, selectedMonthFilter);
        const budgetUsed = dept.budgetUsed || 0;
        csvContent += `"${dept.nameTh || dept.name}","${dept.employeesCount}","${otHours}","${budgetUsed}","${dept.budgetUtilization}%","${dept.status}"\n`;
      });
      
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `OT_Executive_Report_${selectedMonthFilter || "Summary"}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการสร้างไฟล์ Excel/CSV");
    }
  };

  const handleNavigateToEmployees = () => {
    setActiveTab("employees");
    setTimeout(() => {
      const mainEl = document.querySelector('main');
      if (mainEl) mainEl.scrollTop = 0;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 50);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navbar */}
      {!isFullScreen && (
        <Navbar 
          isNavbarCollapsed={isNavbarCollapsed}
          setIsNavbarCollapsed={setIsNavbarCollapsed}
          title={
            activeTab === "dashboard" ? "Dashboard" : 
            activeTab === "job_value" ? "Job Value" :
            activeTab === "reports" ? "รายงานวิเคราะห์ข้อมูลและประสิทธิภาพรายแผนก" :
            activeTab === "employees" ? "ฐานข้อมูลบุคลากรและขีดจำกัดโอที" :
            activeTab === "leave-records" ? "บันทึกและประวัติการลางานพนักงาน" :
            activeTab === "hr-editor" ? "ระบบจัดการแก้ไขข้อมูลพนักงานและผลตอบแทนออนไลน์ (HR Web Direct Editor)" :
            activeTab === "shifts" ? "การวางแผนและจัดตารางกะพนักงาน" :
            activeTab === "ot-records" ? "ประวัติ OT จากกะทำงาน" :
            activeTab === "admin-permissions" ? "ระบบจัดการสิทธิ์ผู้ดูแลและบัญชีผู้ใช้งาน (Admin Permissions)" :
            activeTab === "profile" ? "การจัดการโปรไฟล์ส่วนตัว" :
            "การตั้งค่าระบบและกฎเกณฑ์"
          }
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          currentUser={currentUser}
          onOpenProfile={() => setActiveTab("profile")}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onLogout={handleLogout}
          onOpenCsvTemplateHub={() => setIsCsvTemplateHubOpen(true)}
        />
      )}

      {/* Main container area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Dynamic page container */}
        <main className={`flex-1 overflow-y-auto w-full max-w-full min-w-0 transition-all duration-300 ${isFullScreen ? "mt-0 p-2 sm:p-4" : "mt-16 sm:mt-20 lg:mt-28 p-3 sm:p-4 lg:p-8"}`}>
          
          {/* ======================================= */}
          {/* VIEW: DASHBOARD */}
          {/* ======================================= */}
          {activeTab === "dashboard" && (
            <div className="w-full max-w-full min-w-0 space-y-4 sm:space-y-6">
              {/* Maritime Terminal Header Banner */}
              <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-4 sm:p-6 shadow-xl text-white border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6 relative overflow-hidden">
                <div className="absolute right-0 top-0 w-96 h-full opacity-10 bg-cover bg-center pointer-events-none" style={{ backgroundImage: `url(${loginBg})` }}></div>
                <div className="relative z-10 space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-500/20 border border-sky-400/30 rounded-full text-xs font-bold text-sky-300">
                    <Ship className="w-3.5 h-3.5 text-sky-400" />
                    <span>Double A Terminal & Maritime Logistics System</span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-black tracking-tight text-white">
                    ระบบบริหารการปฏิบัติงานเทียบเรือ และจัดการเวลา OT หน้าท่า
                  </h2>
                  <p className="text-xs text-slate-300 max-w-2xl leading-relaxed font-medium">
                    ติดตามการทำงานล่วงเวลา สรุปสถิติจำนวนชั่วโมงกะ และงบประมาณลอจิสติกส์การขนถ่ายสินค้าทางเรือ (MV / Tug Boat) แบบ Real-time Enterprise System
                  </p>
                </div>
                <div className="relative z-10 flex flex-wrap gap-3">
                  <button
                    onClick={() => setActiveTab("shifts")}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer min-h-[44px]"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>จัดตารางกะเทียบเรือ</span>
                  </button>
                </div>
              </div>


              {/* Header section filters */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex gap-2 items-center bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-1 px-3 py-1.5 border-r border-slate-100">
                    <Filter className="w-4 h-4 text-slate-500" />
                    <span className="text-xs font-bold text-slate-600">ตัวกรองแดชบอร์ด</span>
                  </div>
                  <select 
                    value={selectedMonthFilter}
                    onChange={(e) => setSelectedMonthFilter(e.target.value)}
                    className="bg-transparent border-none text-xs rounded-md py-1 px-3 focus:ring-0 cursor-pointer text-slate-700 font-bold"
                  >
                    <option>เดือนปัจจุบัน</option>
                    <option>3 เดือนที่ผ่านมา</option>
                    <option>6 เดือนย้อนหลัง</option>
                  </select>
                  <div className="h-4 w-px bg-slate-200"></div>
                  <select 
                    value={selectedDeptFilter}
                    onChange={(e) => setSelectedDeptFilter(e.target.value)}
                    disabled={activeDeptId !== "all"}
                    className="bg-transparent border-none text-xs rounded-md py-1 px-3 focus:ring-0 cursor-pointer text-slate-700 font-bold disabled:opacity-80 disabled:cursor-not-allowed"
                  >
                    <option>ทุกแผนก</option>
                    <option>INTER 2</option>
                    <option>INTER 3</option>
                    <option>INTER 5</option>
                    <option>INTER 7</option>
                    <option>Heavy Machine</option>
                    <option>ECC</option>
                  </select>
                  <div className="h-4 w-px bg-slate-200"></div>
                  <select 
                    value={selectedRoleFilter}
                    onChange={(e) => setSelectedRoleFilter(e.target.value)}
                    className="bg-transparent border-none text-xs rounded-md py-1 px-3 focus:ring-0 cursor-pointer text-slate-700 font-bold"
                  >
                    <option>ทุกตำแหน่ง</option>
                    <option>กลุ่มตำแหน่งปฏิบัติการ (10 ตำแหน่ง)</option>
                    <option>ผู้ควบคุมงานขนถ่ายสินค้า</option>
                    <option>พนักงานขับเครน</option>
                    <option>ปากเรือ</option>
                    <option>ผู้ควบคุมงานจักรกลหนัก</option>
                    <option>ช่างขับจักรกลหนัก</option>
                    <option>O&M - Specialist</option>
                    <option>O&M - Generator</option>
                    <option>O&M - Mechanical</option>
                    <option>O&M - Electrical</option>
                    <option>ECC</option>
                  </select>
                </div>

                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setShowOtRequestModal(true)}
                    className="flex items-center gap-2 px-3.5 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl text-xs font-bold text-amber-900 transition-all shadow-sm cursor-pointer relative"
                    title="ดูรายการใบคำขอทำ OT และอนุมัติออนไลน์"
                  >
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                    <span>คำขอ OT ({(otRequests || []).filter(r => r?.status === "pending").length})</span>
                  </button>

                  <button 
                    onClick={handleExportCsvReport}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-slate-500" />
                    <span>ส่งออกรายงานรวม</span>
                  </button>
                </div>
              </div>

              {/* Labor Compliance Warning Banner */}
              {fatiguedEmployees.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 flex-shrink-0 font-bold text-lg">
                      ⚠️
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-amber-950">ตรวจพบพนักงานกลุ่มเสี่ยงความล้าสะสม ({fatiguedEmployees.length} คน)</h4>
                      <p className="text-[10px] text-amber-700 mt-0.5">มีพนักงานทำงานล่วงเวลาสะสมเกิน 36 ชม. หรือทำงานต่อเนื่องกันเกิน 6 วันโดยไม่มีวันหยุดตามกฎหมายแรงงานไทย</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      setSelectedRoleFilter("ทุกตำแหน่ง");
                      setSearchQuery("");
                      setActiveTab("employees");
                    }}
                    className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-[10px] font-extrabold transition-colors cursor-pointer"
                  >
                    ตรวจสอบรายชื่อพนักงานกลุ่มเสี่ยง
                  </button>
                </div>
              )}

              {/* KPI Cards Grid Matching Mockup & Minimal Executive Theme */}
              {(() => {
                const currentMonthKey = state?.shiftConfig?.currentMonth || "2026-08";

                // Function to get the EXACT array of month keys corresponding to the user filter
                const getTargetMonths = (filter: string, baseMonth: string) => {
                  const [yStr, mStr] = baseMonth.split("-");
                  let y = parseInt(yStr, 10);
                  let m = parseInt(mStr, 10);
                  const count = filter === "3 เดือนที่ผ่านมา" ? 3 : (filter === "6 เดือนย้อนหลัง" ? 6 : 1);
                  const result: string[] = [];
                  
                  for (let i = 0; i < count; i++) {
                    const curM = m - i;
                    let curY = y;
                    let actualM = curM;
                    if (curM <= 0) {
                      curY -= 1;
                      actualM = 12 + curM;
                    }
                    const padM = String(actualM).padStart(2, "0");
                    result.push(`${curY}-${padM}`);
                  }
                  return result;
                };

                const activeMonthsList = getTargetMonths(selectedMonthFilter, currentMonthKey);

                // 100% Exact Multi-Month Database Query from emp.shifts[mKey]
                const totalOtHrs = Math.round(
                  dashboardEmployees.reduce((sum, emp) => {
                    return sum + activeMonthsList.reduce((mSum, mKey) => mSum + getEmpCalculatedOt(emp, mKey), 0);
                  }, 0) * 10
                ) / 10;

                const totalSpent = Math.round(
                  dashboardEmployees.reduce((sum, emp) => {
                    return sum + activeMonthsList.reduce((mSum, mKey) => mSum + getEmpCalculatedOtPay(emp, mKey), 0);
                  }, 0)
                );

                const activeEmps = dashboardEmployees.filter(emp => 
                  activeMonthsList.some(mKey => getEmpCalculatedOt(emp, mKey) > 0)
                ).length;

                const avgOtPerEmp = activeEmps > 0 ? Math.round(totalOtHrs / activeEmps) : 0;

                // Base salary calculation across the selected time period
                const singleMonthBaseSalary = dashboardEmployees.reduce((acc, curr) => acc + (curr.salary || 30000), 0);
                const totalBaseSalary = singleMonthBaseSalary;
                const periodTotalSalary = singleMonthBaseSalary * activeMonthsList.length;
                const otSalaryPct = periodTotalSalary > 0 && totalSpent > 0 ? Math.min(100, Math.round((totalSpent / periodTotalSalary) * 100)) : 0;

                // Comparison with the exact equivalent prior period
                const getPriorPeriodMonths = (filter: string, baseMonth: string) => {
                  const count = filter === "3 เดือนที่ผ่านมา" ? 3 : (filter === "6 เดือนย้อนหลัง" ? 6 : 1);
                  const [yStr, mStr] = baseMonth.split("-");
                  let y = parseInt(yStr, 10);
                  let m = parseInt(mStr, 10) - count;
                  if (m <= 0) {
                    y -= 1;
                    m = 12 + m;
                  }
                  const priorStartMonth = `${y}-${String(m).padStart(2, "0")}`;
                  return getTargetMonths(filter, priorStartMonth);
                };

                const priorMonthsList = getPriorPeriodMonths(selectedMonthFilter, currentMonthKey);
                const prevTotalSpent = Math.round(
                  dashboardEmployees.reduce((sum, emp) => {
                    return sum + priorMonthsList.reduce((mSum, mKey) => mSum + getEmpCalculatedOtPay(emp, mKey), 0);
                  }, 0)
                );

                const otComparePct = prevTotalSpent > 0 
                  ? Math.round(((totalSpent - prevTotalSpent) / prevTotalSpent) * 100)
                  : (totalSpent > 0 ? 100 : 0);

                const periodLabel = selectedMonthFilter === "3 เดือนที่ผ่านมา" 
                  ? "สะสม 3 เดือนที่ผ่านมา" 
                  : (selectedMonthFilter === "6 เดือนย้อนหลัง" ? "สะสม 6 เดือนย้อนหลัง" : "ประจำเดือนนี้");

                const comparePeriodLabel = selectedMonthFilter === "3 เดือนที่ผ่านมา" 
                  ? "เทียบกับ 3 เดือนก่อนหน้า" 
                  : (selectedMonthFilter === "6 เดือนย้อนหลัง" ? "เทียบกับ 6 เดือนก่อนหน้า" : "เทียบกับเดือนก่อนหน้า");

                // 10-Month Dynamic Calculation Array (Jan - Oct 2026)
                const monthKeys = ["2026-01","2026-02","2026-03","2026-04","2026-05","2026-06","2026-07","2026-08","2026-09","2026-10"];
                const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct"];

                const monthlyStats = monthKeys.map((mKey, idx) => {
                  const mSpent = dashboardEmployees.reduce((acc, curr) => acc + getEmpCalculatedOtPay(curr, mKey), 0);
                  const mOtHrs = dashboardEmployees.reduce((acc, curr) => acc + getEmpCalculatedOt(curr, mKey), 0);
                  const pKey = idx > 0 ? monthKeys[idx - 1] : "2025-12";
                  const pSpent = dashboardEmployees.reduce((acc, curr) => acc + getEmpCalculatedOtPay(curr, pKey), 0);
                  
                  const compPct = mSpent > 0 ? (pSpent > 0 ? Math.round(((mSpent - pSpent) / pSpent) * 100) : 100) : 0;
                  const salPct = totalBaseSalary > 0 && mSpent > 0 ? Math.round((mSpent / totalBaseSalary) * 100) : 0;
                  
                  return {
                    name: monthNames[idx],
                    spent: mSpent,
                    otHrs: mOtHrs,
                    compPct: compPct,
                    salPct: salPct
                  };
                });

                const maxSpentInYear = Math.max(...monthlyStats.map(s => s.spent), 1);

                return (
                  <div className="space-y-4 sm:space-y-6 font-sans">
                    {/* Top Row: 3 Minimalist Clean Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                      
                      {/* Card 1: เปรียบเทียบผลรวมค่าล่วงเวลา (Sky Accent) */}
                      <div className="bg-white border-l-4 border-l-sky-400 border-y border-r border-slate-200/80 p-5 sm:p-6 rounded-3xl shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[140px] group hover:shadow-md transition-all">
                        <div className="flex justify-between items-start">
                          <h3 className="text-xs font-bold text-slate-500 tracking-wide">เปรียบเทียบผลรวมค่าล่วงเวลา</h3>
                          <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 border border-sky-200/60 flex items-center justify-center shadow-2xs font-bold">
                            <TrendingUp className="w-5 h-5 text-sky-600" />
                          </div>
                        </div>
                        
                        <div className="flex items-end justify-between mt-3">
                          <div>
                            <div className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">{otComparePct > 0 ? `+${otComparePct}%` : `${otComparePct}%`}</div>
                            {prevTotalSpent > 0 ? (
                              <div className="text-[10px] text-slate-400 font-medium">{comparePeriodLabel}</div>
                            ) : (
                              <div className="text-[10px] text-emerald-600 font-medium font-semibold">เดือนแรกที่เริ่มบันทึกข้อมูล</div>
                            )}
                          </div>
                          
                          {/* Mini Bar Sparkline */}
                          <div className="flex items-end gap-1 h-8 opacity-80 group-hover:opacity-100 transition-opacity">
                            <div className="w-1.5 h-3 bg-sky-200 rounded-sm"></div>
                            <div className="w-1.5 h-4 bg-sky-300 rounded-sm"></div>
                            <div className="w-1.5 h-3 bg-sky-200 rounded-sm"></div>
                            <div className="w-1.5 h-6 bg-sky-400 rounded-sm"></div>
                            <div className="w-1.5 h-5 bg-sky-300 rounded-sm"></div>
                            <div className="w-1.5 h-8 bg-sky-500 rounded-sm"></div>
                          </div>
                        </div>
                      </div>

                      {/* Card 2: ผลรวมค่าล่วงเวลา (Blue Accent) */}
                      <div className="bg-white border-l-4 border-l-blue-600 border-y border-r border-slate-200/80 p-5 sm:p-6 rounded-3xl shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[140px] group hover:shadow-md transition-all">
                        <div className="flex justify-between items-start">
                          <h3 className="text-xs font-bold text-slate-500 tracking-wide">ผลรวมค่าล่วงเวลา</h3>
                          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 border border-blue-200/60 flex items-center justify-center shadow-2xs font-black text-sm">
                            ฿
                          </div>
                        </div>
                        
                        <div className="flex items-end justify-between mt-3">
                          <div>
                            <div className="text-2xl sm:text-3xl font-black tracking-tight text-blue-700">
                              {totalSpent.toLocaleString()} THB
                            </div>
                            <div className="text-[10px] text-slate-400 font-medium">{periodLabel}</div>
                          </div>

                          {/* Mini Bar Sparkline */}
                          <div className="flex items-end gap-1 h-8 opacity-80 group-hover:opacity-100 transition-opacity">
                            <div className="w-1.5 h-2 bg-blue-200 rounded-sm"></div>
                            <div className="w-1.5 h-4 bg-blue-300 rounded-sm"></div>
                            <div className="w-1.5 h-5 bg-blue-400 rounded-sm"></div>
                            <div className="w-1.5 h-7 bg-blue-600 rounded-sm"></div>
                            <div className="w-1.5 h-6 bg-blue-500 rounded-sm"></div>
                            <div className="w-1.5 h-8 bg-blue-700 rounded-sm"></div>
                          </div>
                        </div>
                      </div>

                      {/* Card 3: % ค่าล่วงเวลา (Navy Accent) */}
                      <div className="bg-white border-l-4 border-l-slate-800 border-y border-r border-slate-200/80 p-5 sm:p-6 rounded-3xl shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[140px] group hover:shadow-md transition-all">
                        <div className="flex justify-between items-start">
                          <h3 className="text-xs font-bold text-slate-500 tracking-wide">% ค่าล่วงเวลา</h3>
                          <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-800 border border-slate-200 flex items-center justify-center shadow-2xs font-bold">
                            <Settings className="w-5 h-5 text-slate-800" />
                          </div>
                        </div>
                        
                        <div className="flex items-end justify-between mt-3">
                          <div>
                            <div className="text-2xl sm:text-3xl font-black tracking-tight text-slate-800">{otSalaryPct}%</div>
                            <div className="text-[10px] text-slate-400 font-medium">{periodLabel}</div>
                          </div>

                          {/* Mini Bar Sparkline */}
                          <div className="flex items-end gap-1 h-8 opacity-80 group-hover:opacity-100 transition-opacity">
                            <div className="w-1.5 h-3 bg-slate-300 rounded-sm"></div>
                            <div className="w-1.5 h-5 bg-slate-400 rounded-sm"></div>
                            <div className="w-1.5 h-4 bg-slate-300 rounded-sm"></div>
                            <div className="w-1.5 h-7 bg-slate-700 rounded-sm"></div>
                            <div className="w-1.5 h-6 bg-slate-600 rounded-sm"></div>
                            <div className="w-1.5 h-8 bg-slate-900 rounded-sm"></div>
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* Bottom Row Grid: Grouped Bar Chart + Right Highlight Panel */}
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 font-sans">
                      
                      {/* Left Panel: DASHBOARD Grouped Bar Chart (3/4 Width) */}
                      <div className="lg:col-span-3 bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-7 shadow-sm flex flex-col justify-between">
                        
                        {/* Chart Header */}
                        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                          <h3 className="text-sm font-black text-slate-800 tracking-wider uppercase">DASHBOARD</h3>
                          
                          {/* Legend Pills with Interactive Toggle Filtering */}
                          <div className="flex items-center gap-2 text-xs font-bold overflow-x-auto no-scrollbar touch-pan-x py-1 max-w-full">
                            {/* Pill 1: เปรียบเทียบผลรวมค่าล่วงเวลา */}
                            <button
                              type="button"
                              onClick={() => setChartSeriesFilter(prev => ({ ...prev, compare: !prev.compare }))}
                              className={`shrink-0 whitespace-nowrap flex items-center gap-2 px-3 py-1.5 rounded-full transition-all cursor-pointer border ${
                                chartSeriesFilter.compare
                                  ? "bg-sky-50 text-sky-800 border-sky-300 shadow-2xs hover:bg-sky-100"
                                  : "bg-slate-50 text-slate-400 border-slate-200 opacity-40 hover:opacity-75"
                              }`}
                              title="คลิกเพื่อ เปิด/ปิด การแสดงแท่งเปรียบเทียบผลรวมค่าล่วงเวลา"
                            >
                              <span className={`w-2.5 h-2.5 rounded-full transition-all ${chartSeriesFilter.compare ? "bg-sky-400" : "bg-slate-300"}`}></span>
                              <span className={chartSeriesFilter.compare ? "" : "line-through"}>เปรียบเทียบผลรวมค่าล่วงเวลา</span>
                            </button>

                            {/* Pill 2: ผลรวมค่าล่วงเวลา */}
                            <button
                              type="button"
                              onClick={() => setChartSeriesFilter(prev => ({ ...prev, spent: !prev.spent }))}
                              className={`shrink-0 whitespace-nowrap flex items-center gap-2 px-3 py-1.5 rounded-full transition-all cursor-pointer border ${
                                chartSeriesFilter.spent
                                  ? "bg-blue-50 text-blue-800 border-blue-300 shadow-2xs hover:bg-blue-100"
                                  : "bg-slate-50 text-slate-400 border-slate-200 opacity-40 hover:opacity-75"
                              }`}
                              title="คลิกเพื่อ เปิด/ปิด การแสดงแท่งผลรวมค่าล่วงเวลา"
                            >
                              <span className={`w-2.5 h-2.5 rounded-full transition-all ${chartSeriesFilter.spent ? "bg-blue-600" : "bg-slate-300"}`}></span>
                              <span className={chartSeriesFilter.spent ? "" : "line-through"}>ผลรวมค่าล่วงเวลา</span>
                            </button>

                            {/* Pill 3: % ค่าล่วงเวลา */}
                            <button
                              type="button"
                              onClick={() => setChartSeriesFilter(prev => ({ ...prev, pct: !prev.pct }))}
                              className={`shrink-0 whitespace-nowrap flex items-center gap-2 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer border ${
                                chartSeriesFilter.pct
                                  ? "bg-slate-900 text-white border-slate-900 shadow-sm hover:bg-slate-800"
                                  : "bg-slate-50 text-slate-400 border-slate-200 opacity-40 hover:opacity-75"
                              }`}
                              title="คลิกเพื่อ เปิด/ปิด การแสดงแท่ง % ค่าล่วงเวลา"
                            >
                              <span className={`w-2.5 h-2.5 rounded-full transition-all ${chartSeriesFilter.pct ? "bg-slate-300" : "bg-slate-300"}`}></span>
                              <span className={chartSeriesFilter.pct ? "" : "line-through"}>% ค่าล่วงเวลา</span>
                            </button>
                          </div>
                        </div>

                        {/* Grouped Bar Chart Area */}
                        <div className="h-64 flex items-end justify-between gap-3 pt-6 relative border-t border-slate-100">
                          
                          {/* Y-Axis Percentage Labels */}
                          <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-[10px] font-bold text-slate-400 pointer-events-none">
                            <span>80%</span>
                            <span>60%</span>
                            <span>40%</span>
                            <span>20%</span>
                            <span>0%</span>
                          </div>

                          {/* Grid Lines */}
                          <div className="absolute left-8 right-0 top-0 bottom-8 flex flex-col justify-between pointer-events-none">
                            <div className="w-full h-px bg-slate-100"></div>
                            <div className="w-full h-px bg-slate-100"></div>
                            <div className="w-full h-px bg-slate-100"></div>
                            <div className="w-full h-px bg-slate-100"></div>
                            <div className="w-full h-px bg-slate-200"></div>
                          </div>

                          {/* 10 Month DYNAMIC Grouped Bars Area */}
                          <div className="pl-9 w-full flex items-end justify-between gap-2 h-full">
                            {monthlyStats.map((st) => {
                              // Dynamic bar heights computed from real monthly D1 data (0% when spent is 0)
                              const bar1H = st.spent > 0 ? Math.min(80, Math.max(4, Math.abs(st.compPct))) : 0;
                              const bar2H = st.spent > 0 ? Math.min(75, Math.max(4, Math.round((st.spent / maxSpentInYear) * 70))) : 0;
                              const bar3H = st.spent > 0 ? Math.min(60, Math.max(4, st.salPct * 2.5)) : 0;

                              const activeSeriesCount = (chartSeriesFilter.compare ? 1 : 0) + (chartSeriesFilter.spent ? 1 : 0) + (chartSeriesFilter.pct ? 1 : 0);
                              const barWidthClass = activeSeriesCount === 1 ? "w-3/4 max-w-[28px]" : (activeSeriesCount === 2 ? "w-1/2 max-w-[20px]" : "w-1/3 max-w-[14px]");

                              return (
                                <div key={st.name} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                                  <div className="w-full flex items-end justify-center gap-1.5 h-[82%]">
                                    {/* Bar 1: Sky Blue (Connects to Card 1) */}
                                    {chartSeriesFilter.compare && (
                                      <div 
                                        style={{ height: `${bar1H}%` }}
                                        className={`${barWidthClass} bg-sky-400 rounded-t-sm hover:bg-sky-500 transition-all shadow-sm`}
                                        title={`เปรียบเทียบผลรวม (${st.name}): ${st.compPct}%`}
                                      />
                                    )}
                                    {/* Bar 2: Royal Blue (Connects to Card 2) */}
                                    {chartSeriesFilter.spent && (
                                      <div 
                                        style={{ height: `${bar2H}%` }}
                                        className={`${barWidthClass} bg-blue-600 rounded-t-sm hover:bg-blue-700 transition-all shadow-sm`}
                                        title={`ผลรวมค่าล่วงเวลา (${st.name}): ${st.spent.toLocaleString()} THB`}
                                      />
                                    )}
                                    {/* Bar 3: Slate/Navy (Connects to Card 3) */}
                                    {chartSeriesFilter.pct && (
                                      <div 
                                        style={{ height: `${bar3H}%` }}
                                        className={`${barWidthClass} bg-slate-800 rounded-t-sm hover:bg-slate-900 transition-all shadow-sm`}
                                        title={`% ค่าล่วงเวลา (${st.name}): ${st.salPct}%`}
                                      />
                                    )}
                                  </div>
                                  <span className="text-[11px] font-bold text-slate-500">{st.name}</span>
                                </div>
                              );
                            })}
                          </div>

                        </div>

                      </div>

                      {/* Right Panel: Minimal Clean Highlight Card (1/4 Width) */}
                      <div className="lg:col-span-1 bg-white border-l-4 border-l-amber-500 border-y border-r border-slate-200/80 p-6 rounded-3xl shadow-sm font-sans flex flex-col justify-between h-full min-h-[260px] group hover:shadow-md transition-all">
                        
                        <div className="flex justify-between items-start">
                          <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200/60 flex items-center justify-center shadow-2xs">
                            <Clock className="w-6 h-6 text-amber-600" />
                          </div>
                          <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-slate-50 text-slate-600 border border-slate-200/80">
                            เฉลี่ยรายบุคคล
                          </span>
                        </div>

                        {/* Main Metric Section */}
                        <div className="space-y-1.5 mt-4">
                          <h4 className="text-xs font-bold text-slate-500 tracking-wide">Average Working Hours</h4>
                          <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-black tracking-tight text-slate-900">
                              {avgOtPerEmp} hrs
                            </span>
                            <span className="text-xs font-semibold text-slate-500">per employee</span>
                          </div>
                          <p className="text-xs font-extrabold text-amber-600 pt-1">
                            {totalOtHrs > 0 ? (avgOtPerEmp > 36 ? "⚠️ เกินเป้าหมาย 36 ชม./เดือน" : "✓ อยู่ในเกณฑ์มาตรฐาน") : "(ไม่มีชั่วโมงสะสมในเดือนนี้)"}
                          </p>
                        </div>

                      </div>

                    </div>

                    {/* Department breakdown meters */}
                    <div className="bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-6 shadow-sm">
                      <div className="mb-4">
                        <h4 className="text-sm font-bold text-slate-800">ปริมาณชั่วโมง OT แยกตามแผนก (ข้อมูลเรียลไทม์)</h4>
                        <p className="text-xs text-slate-500">สัดส่วนและปริมาณชั่วโมงสะสม</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-5">
                        {state.departments.map((dept) => {
                          const deptEmployees = dashboardEmployees.filter(e => normalizeDeptId(e.deptId) === normalizeDeptId(dept.id));
                          const deptOtHours = Math.round(
                            deptEmployees.reduce((s, e) => {
                              return s + activeMonthsList.reduce((mSum, mKey) => mSum + getEmpCalculatedOt(e, mKey), 0);
                            }, 0) * 10
                          ) / 10;
                          const maxHr = Math.max(...state.departments.map(d => {
                            const dEmps = dashboardEmployees.filter(e => normalizeDeptId(e.deptId) === normalizeDeptId(d.id));
                            return dEmps.reduce((s, e) => {
                              return s + activeMonthsList.reduce((mSum, mKey) => mSum + getEmpCalculatedOt(e, mKey), 0);
                            }, 0);
                          }), 1);
                          const percentage = maxHr > 0 ? Math.min(100, Math.round((deptOtHours / maxHr) * 100)) : 0;
                          return (
                            <div key={dept.id} className="group cursor-pointer bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100 hover:border-blue-200 transition-all">
                              <div className="flex justify-between items-end mb-1.5">
                                <span className="text-xs font-bold text-slate-700 group-hover:text-blue-600 transition-colors">{getDeptName(dept.id, state.departments)}</span>
                                <span className="text-xs font-extrabold text-slate-900 font-mono">{deptOtHours.toLocaleString()} ชม.</span>
                              </div>
                              <div className="w-full bg-slate-200/80 h-2.5 rounded-full overflow-hidden shadow-inner">
                                <div 
                                  style={{ width: `${percentage}%` }}
                                  className="bg-gradient-to-r from-blue-600 to-cyan-500 h-full rounded-full group-hover:opacity-90 transition-opacity"
                                ></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="pt-4 border-t border-slate-100 mt-6 flex items-center gap-2">
                        <Info className="w-4 h-4 text-slate-400" />
                        <p className="text-[10px] text-slate-500 font-medium">คำนวณจากกะการทำงานพนักงานตรงกับฐานข้อมูล D1 แบบ 100%</p>
                      </div>
                    </div>

                  </div>
                );
              })()}

              {/* Employee OT Contribution Cards List */}
              <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6 border-b border-slate-100 pb-4">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">วิเคราะห์การจัดสรร OT รายบุคคล (Employee Contribution)</h4>
                    <p className="text-xs text-slate-500">รายชื่อผู้ที่ทำ OT สูงสุดและพนักงานที่มีความเสี่ยงสะสมชั่วโมงทำงานเกินกฎเกณฑ์ความปลอดภัย</p>
                  </div>
                  <button 
                    type="button"
                    onClick={handleNavigateToEmployees}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-[#eff6ff] hover:bg-blue-100 border border-blue-200/80 text-blue-700 font-extrabold text-xs rounded-xl transition-all cursor-pointer shadow-sm active:scale-95 self-start sm:self-auto min-h-[40px]"
                    title="คลิกเพื่อเปิดตารางรายชื่อพนักงานทั้งหมด"
                  >
                    <span>ดูตารางรายชื่อทั้งหมด</span>
                    <ChevronRight className="w-4 h-4 text-blue-600" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                  {(() => {
                    const filteredEmpContribution = state.employees.filter(emp => {
                      if (!isHrOrFullAccess && currentUser?.deptId) {
                        const managerDeptId = normalizeDeptId(currentUser.deptId);
                        if (normalizeDeptId(emp.deptId) !== managerDeptId) return false;
                      }
                      if (selectedDeptFilter !== "ทุกแผนก" && selectedDeptFilter !== "ทุกแผนกทำงาน") {
                        const filterDeptId = normalizeDeptId(selectedDeptFilter);
                        if (normalizeDeptId(emp.deptId) !== filterDeptId) return false;
                      }
                      return true;
                    });

                    if (filteredEmpContribution.length === 0) {
                      return (
                        <div className="col-span-full p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                          <p className="text-xs font-bold text-slate-500">ไม่มีข้อมูลสถิติ OT รายบุคคลในแผนกที่เลือก</p>
                        </div>
                      );
                    }

                    return filteredEmpContribution.slice(0, 4).map((emp) => {
                      const isOver = emp.actualOt > emp.targetOt;
                      return (
                        <div 
                          key={emp.id} 
                          className={`p-4 border rounded-2xl transition-all shadow-sm group ${
                            isOver ? "bg-red-50/50 border-red-200 hover:border-red-300" : "bg-slate-50/50 border-slate-200 hover:border-blue-200"
                          }`}
                        >
                          <div className="flex items-center gap-3 mb-4">
                            <div className="relative">
                              <EmployeeAvatar empId={emp.id} empName={emp.name} className="w-11 h-11" />
                              <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 border-2 border-white rounded-full ${
                                isOver ? "bg-red-500" : "bg-green-500"
                              }`}></span>
                            </div>
                            <div className="flex-1 overflow-hidden">
                              <h5 className={`text-xs font-bold truncate ${isOver ? "group-hover:text-red-600" : "group-hover:text-blue-600"}`}>{emp.name}</h5>
                              <p className="text-[10px] text-slate-500 truncate font-medium">{emp.role}</p>
                            </div>
                          </div>

                          <div className="space-y-2 bg-white p-3 rounded-xl border border-slate-100 shadow-inner">
                            <div className="flex justify-between items-end">
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">สัดส่วนเป้าหมาย</span>
                              <span className={`text-sm font-bold font-mono ${isOver ? "text-red-600" : "text-blue-600"}`}>
                                {emp.otPct}%
                              </span>
                            </div>
                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                style={{ width: `${Math.min(100, emp.otPct)}%` }}
                                className={`h-full rounded-full ${isOver ? "bg-red-500" : "bg-blue-600"}`}
                              ></div>
                            </div>
                            <div className="flex justify-between items-center text-[10px] font-semibold text-slate-500 pt-1 border-t border-slate-100">
                              <span className={`font-bold ${isOver ? "text-red-600" : "text-slate-800"}`}>{emp.actualOt} ชม.</span>
                              <span>เป้าหมาย &lt; {emp.targetOt} ชม.</span>
                            </div>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

            </div>
          )}

          {/* ======================================= */}
          {/* VIEW: JOB VALUE & EXECUTIVE DASHBOARD */}
          {/* ======================================= */}
          {activeTab === "job_value" && (
            <ErrorBoundary>
              <div className="w-full max-w-full min-w-0 space-y-4 sm:space-y-6">
                {/* Header card with database & import/export controls */}
                <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h3 className="text-base sm:text-lg font-extrabold text-slate-800">Job Value</h3>
                      <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>ปี 2026</span>
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      ตรวจสอบคุณค่าตำแหน่งงาน ประเมินรายได้ (Revenue) ต้นทุน (Cost) กำไร (Profit) รายบุคคลและแผนก พร้อมแม่แบบ Checklist สำหรับ Google Calendar
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    {isHrOrFullAccess && (
                      <>
                        {/* CSV Template Hub */}
                        <button
                          type="button"
                          onClick={() => setIsCsvTemplateHubOpen(true)}
                          className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold transition-colors cursor-pointer border border-blue-200"
                          title="ดาวน์โหลดแม่แบบไฟล์ CSV สำหรับ Job Value และเมนูอื่น"
                        >
                          <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
                          <span>แม่แบบ CSV</span>
                        </button>

                        {/* Export CSV */}
                        <button
                          type="button"
                          onClick={handleExportJobValueCsv}
                          className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                          title="ส่งออกข้อมูล Job Value เป็นไฟล์ CSV"
                        >
                          <Download className="w-3.5 h-3.5 text-blue-600" />
                          <span>ส่งออกข้อมูล (Export CSV)</span>
                        </button>

                        {/* Import CSV */}
                        <label 
                          className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-sm"
                          title="อัพโหลดไฟล์ CSV เพื่อนำเข้าข้อมูล Job Value"
                        >
                          <Upload className="w-3.5 h-3.5 text-white" />
                          <span>{importJvLoading ? "กำลังอัพโหลด..." : "อัพโหลดข้อมูล (Import CSV)"}</span>
                          <input
                            type="file"
                            accept=".csv"
                            onChange={handleImportJobValueCsv}
                            className="hidden"
                            disabled={importJvLoading}
                          />
                        </label>

                        {/* Clear D1 Data */}
                        {safeJobValueRecords.length > 0 && (
                          <button
                            type="button"
                            onClick={handleClearJobValueData}
                            className="flex items-center gap-1.5 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-colors cursor-pointer border border-rose-200"
                            title="ล้างข้อมูล Job Value ทั้งหมดในฐานข้อมูล D1"
                            disabled={importJvLoading}
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                            <span>ล้างข้อมูลใน D1 (Clear All)</span>
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* KPI Stat Cards (4 Cards) */}
                {(() => {
                  const targetDeptFilter = !isHrOrFullAccess && currentUser?.deptId 
                    ? getDeptName(currentUser.deptId, state?.departments) 
                    : financialChartDeptFilter;

                  const scopedJvRecords = safeJobValueRecords.filter(r => {
                    if (!isJvDepartment(r.department || r.deptId)) return false;
                    if (!isHrOrFullAccess && currentUser?.deptId) {
                      const managerDeptId = normalizeDeptId(currentUser.deptId);
                      const recDeptId = normalizeDeptId(r.deptId || r.department);
                      if (recDeptId !== managerDeptId && r.department !== getDeptName(currentUser.deptId, state?.departments)) return false;
                    }
                    if (targetDeptFilter && targetDeptFilter !== "ทุกแผนก") {
                      const filterDeptId = normalizeDeptId(targetDeptFilter);
                      const recDeptId = normalizeDeptId(r.deptId || r.department);
                      if (r.department !== targetDeptFilter && recDeptId !== filterDeptId) return false;
                    }
                    return true;
                  });

                  const scopedEmpList = (state?.employees || []).filter(e => {
                    if (!isJvDepartment(e.department || e.deptId)) return false;
                    if (!isHrOrFullAccess && currentUser?.deptId) {
                      if (normalizeDeptId(e.deptId) !== normalizeDeptId(currentUser.deptId)) return false;
                    }
                    if (targetDeptFilter && targetDeptFilter !== "ทุกแผนก") {
                      if (normalizeDeptId(e.deptId) !== normalizeDeptId(targetDeptFilter)) return false;
                    }
                    return true;
                  });

                  const totalRev = scopedJvRecords.reduce((sum, r) => sum + ((Number(r?.avgRevenue) || 0) * 12), 0);
                  const totalCost = scopedJvRecords.reduce((sum, r) => sum + ((Number(r?.avgCost) || 0) * 12), 0);
                  const totalProf26 = scopedJvRecords.reduce((sum, r) => sum + (Number(r?.profit2026) || 0), 0);
                  const totalProf25 = scopedJvRecords.reduce((sum, r) => sum + (Number(r?.profit2025) || 0), 0);
                  const avgCostPerPerson = Math.round(scopedJvRecords.reduce((sum, r) => sum + (Number(r?.avgCost) || 0), 0) / Math.max(1, scopedJvRecords.length));
                  const diffPct = totalProf25 > 0 ? Math.round(((totalProf26 - totalProf25) / totalProf25) * 100) : 0;

                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                      {/* 1. Total Revenue */}
                      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-500">รายได้รวมสะสม (Total Revenue)</span>
                          <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
                            <DollarSign className="w-5 h-5" />
                          </div>
                        </div>
                        <div className="mt-3">
                          <h4 className="text-2xl font-black text-slate-900 font-mono">
                            {totalRev.toLocaleString()}
                          </h4>
                          <p className="text-[11px] font-semibold text-emerald-600 mt-1 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            <span>ประมาณการจาก {scopedJvRecords.length} บุคลากร</span>
                          </p>
                        </div>
                      </div>

                      {/* 2. Total Cost */}
                      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-500">ต้นทุนรวมการดำเนินงาน (Total Cost)</span>
                          <div className="p-2 bg-rose-50 rounded-xl text-rose-600">
                            <BarChart3 className="w-5 h-5" />
                          </div>
                        </div>
                        <div className="mt-3">
                          <h4 className="text-2xl font-black text-rose-700 font-mono">
                            {totalCost.toLocaleString()}
                          </h4>
                          <p className="text-[11px] font-semibold text-slate-500 mt-1">
                            เฉลี่ย {avgCostPerPerson.toLocaleString()} / คน / เดือน
                          </p>
                        </div>
                      </div>

                      {/* 3. Total Profit 2026 */}
                      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-500">กำไรสุทธิสะสมปี 2026</span>
                          <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
                            <Award className="w-5 h-5" />
                          </div>
                        </div>
                        <div className="mt-3">
                          <h4 className="text-2xl font-black text-blue-700 font-mono">
                            {totalProf26.toLocaleString()}
                          </h4>
                          <p className={`text-[11px] font-bold mt-1 flex items-center gap-1 ${diffPct >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            <span>{diffPct >= 0 ? `▲ +${diffPct}%` : `▼ ${diffPct}%`}</span>
                            <span className="text-slate-400 font-normal">เทียบปี 2025</span>
                          </p>
                        </div>
                      </div>

                      {/* 4. Coverage Ratio */}
                      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-500">พนักงานที่มีข้อมูล Job Value</span>
                          <div className="p-2 bg-purple-50 rounded-xl text-purple-600">
                            <Users className="w-5 h-5" />
                          </div>
                        </div>
                        <div className="mt-3">
                          <h4 className="text-2xl font-black text-slate-900 font-mono">
                            {scopedJvRecords.length} <span className="text-sm font-normal text-slate-500">/ {scopedEmpList.length} คน</span>
                          </h4>
                          <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
                            <div 
                              className="bg-purple-600 h-full rounded-full transition-all duration-500" 
                              style={{ width: `${Math.min(100, Math.round((scopedJvRecords.length / Math.max(1, scopedEmpList.length)) * 100))}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Department Job Value Summary Section */}
                <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                    <div>
                      <h4 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                        <span>สรุปข้อมูลคุณค่าตำแหน่งงาน (Job Value) และผลตอบแทน แยกรายแผนก</span>
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">เปรียบเทียบผลประกอบการสะสม 2568 - 2569 รายแผนกย่อย</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    {["INTER 2", "INTER 3", "INTER 5", "INTER 7"].filter(deptName => {
                      if (isHrOrFullAccess) return true;
                      return normalizeDeptId(currentUser?.deptId) === normalizeDeptId(deptName);
                    }).map(deptName => {
                      const targetDeptId = normalizeDeptId(deptName);
                      const safeJv = jobValueRecords || [];
                      const deptJvRecords = safeJv.filter(r => 
                        r.department === deptName || 
                        normalizeDeptId(r.department) === targetDeptId ||
                        normalizeDeptId(r.deptId) === targetDeptId
                      );
                      const empList = (state.employees || []).filter(e => 
                        normalizeDeptId(e.deptId) === targetDeptId || 
                        normalizeDeptId(e.department) === targetDeptId ||
                        e.deptId === deptName ||
                        e.department === deptName
                      );

                      let count = Math.max(deptJvRecords.length, empList.length);
                      let totalRev = deptJvRecords.reduce((sum, r) => sum + (Number(r.avgRevenue) || 0), 0);
                      let totalCost = deptJvRecords.reduce((sum, r) => sum + (Number(r.avgCost) || 0), 0);
                      let p25 = deptJvRecords.reduce((sum, r) => sum + (Number(r.profit2025) || 0), 0);
                      let p26 = deptJvRecords.reduce((sum, r) => sum + (Number(r.profit2026) || 0), 0);

                      if (deptJvRecords.length === 0 && empList.length > 0) {
                        totalRev = empList.reduce((sum, e) => sum + (Number((e as any).avgRevenue || (e as any).salary * 4.5 || 98500) || 0), 0);
                        totalCost = empList.reduce((sum, e) => sum + (Number((e as any).avgCost || (e as any).salary * 1.5 || 145000) || 0), 0);
                        p25 = empList.reduce((sum, e) => sum + (Number((e as any).profit2025 || (e as any).salary * 1.2 || 88000) || 0), 0);
                        p26 = empList.reduce((sum, e) => sum + (Number((e as any).profit2026 || (e as any).salary * 2.8 || 520000) || 0), 0);
                      }

                      const diff = p26 - p25;
                      const isGrowth = diff >= 0;

                      return (
                        <div key={deptName} className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 hover:shadow-md transition-all space-y-3">
                          <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
                            <span className="font-extrabold text-slate-900 text-sm">แผนก {deptName}</span>
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-[10px] font-extrabold">
                              {count} บุคลากร
                            </span>
                          </div>

                          <div className="space-y-1.5 text-xs font-mono">
                            <div className="flex justify-between">
                              <span className="text-slate-500 font-sans">รายได้เฉลี่ย/เดือน:</span>
                              <span className="font-bold text-emerald-700">{totalRev.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500 font-sans">ต้นทุนเฉลี่ย/เดือน:</span>
                              <span className="font-bold text-rose-700">{totalCost.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between pt-1 border-t border-slate-200/60">
                              <span className="text-slate-500 font-sans">กำไรสะสม 2568:</span>
                              <span className="font-bold text-slate-700">{p25.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500 font-sans">กำไรสะสม 2569:</span>
                              <span className="font-extrabold text-blue-700">{p26.toLocaleString()}</span>
                            </div>
                          </div>

                          <div className={`p-2 rounded-xl text-[11px] font-extrabold text-center border ${
                            isGrowth ? "bg-emerald-100/90 text-emerald-900 border-emerald-300" : "bg-rose-100/90 text-rose-900 border-rose-300"
                          }`}>
                            {isGrowth ? `ต่อยอด (+${diff.toLocaleString()})` : `ไม่ต่อยอด (-${Math.abs(diff).toLocaleString()})`}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Monthly Performance Trend & Financial Chart */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
                  {/* Chart Header & Filter Controls */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                        <span>เปรียบเทียบผลประกอบการรายเดือน (Monthly Financial Breakdown 2026)</span>
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        เปรียบเทียบแนวโน้ม รายได้ (Revenue), ต้นทุน (Cost), และกำไร (Profit) สุภาพการเงินรายเดือน
                      </p>
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar touch-pan-x py-1 max-w-full">
                      {/* Department Selector Filter */}
                      <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1.5 text-xs font-bold border border-slate-200/60 shrink-0">
                        <span className="text-slate-500 pl-2 font-sans">แผนก:</span>
                        <select
                          value={financialChartDeptFilter}
                          disabled={!isHrOrFullAccess}
                          onChange={(e) => setFinancialChartDeptFilter(e.target.value)}
                          className="bg-white text-blue-800 border border-slate-200 rounded-lg py-1 px-2.5 text-xs font-extrabold shadow-sm focus:ring-0 cursor-pointer disabled:opacity-80"
                        >
                          {isHrOrFullAccess && <option value="ทุกแผนก">ทุกแผนก (รวมทั้งหมด)</option>}
                          {["INTER 2", "INTER 3", "INTER 5", "INTER 7"].filter(dept => {
                            if (isHrOrFullAccess) return true;
                            return normalizeDeptId(currentUser?.deptId) === normalizeDeptId(dept);
                          }).map(dept => (
                            <option key={dept} value={dept}>แผนก {dept}</option>
                          ))}
                        </select>
                      </div>

                      {/* Active Months vs 12 Months Filter */}
                      <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 text-xs font-bold border border-slate-200/60 shrink-0">
                        <button
                          type="button"
                          onClick={() => setFinancialChartOnlyActiveMonths(true)}
                          className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                            financialChartOnlyActiveMonths 
                              ? "bg-white text-blue-700 shadow-sm font-extrabold" 
                              : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          เฉพาะเดือนที่มีข้อมูล
                        </button>
                        <button
                          type="button"
                          onClick={() => setFinancialChartOnlyActiveMonths(false)}
                          className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                            !financialChartOnlyActiveMonths 
                              ? "bg-white text-blue-700 shadow-sm font-extrabold" 
                              : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          แสดงทั้ง 12 เดือน
                        </button>
                      </div>

                      {/* Trend Line vs Bar Chart Toggle */}
                      <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 text-xs font-bold border border-slate-200/60 shrink-0">
                        <button
                          type="button"
                          onClick={() => setFinancialChartViewType("trend")}
                          className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                            financialChartViewType === "trend" 
                              ? "bg-blue-600 text-white shadow-sm font-extrabold" 
                              : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          <TrendingUp className="w-3.5 h-3.5" />
                          <span>กราฟแนวโน้ม (Trend Line)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setFinancialChartViewType("bar")}
                          className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                            financialChartViewType === "bar" 
                              ? "bg-blue-600 text-white shadow-sm font-extrabold" 
                              : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          <BarChart3 className="w-3.5 h-3.5" />
                          <span>กราฟแท่ง (Bar)</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {(() => {
                    const filteredJvByDept = safeJobValueRecords.filter(r => {
                      if (!isJvDepartment(r.department || r.deptId)) return false;
                      if (financialChartDeptFilter === "ทุกแผนก") return true;
                      const targetDeptId = normalizeDeptId(financialChartDeptFilter);
                      return r.department === financialChartDeptFilter || 
                             normalizeDeptId(r.department) === targetDeptId ||
                             normalizeDeptId(r.deptId) === targetDeptId;
                    });

                    const allMonthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                    const allMonthData = allMonthLabels.map((m, idx) => {
                      const monthRev = filteredJvByDept.reduce((sum, r) => sum + (Number((r?.monthlyRevenue || [])[idx]) || 0), 0);
                      const monthCost = filteredJvByDept.reduce((sum, r) => sum + (Number((r?.monthlyCost || [])[idx]) || 0), 0);
                      const monthProf = filteredJvByDept.reduce((sum, r) => sum + (Number((r?.monthlyProfit || [])[idx]) || 0), 0);
                      return { month: m, idx, rev: monthRev, cost: monthCost, prof: monthProf, hasData: monthRev > 0 || monthCost > 0 || monthProf > 0 };
                    });

                    // Filter active months
                    const filteredData = financialChartOnlyActiveMonths 
                      ? allMonthData.filter(d => d.hasData)
                      : allMonthData;

                    const displayData = filteredData.length > 0 ? filteredData : allMonthData.slice(0, 6);
                    const maxVal = Math.max(1, ...displayData.map(d => Math.max(d.rev, d.cost, d.prof)));

                    return (
                      <div className="space-y-4 pt-2 border-t border-slate-100">
                        {/* CHART CANVAS */}
                        {financialChartViewType === "trend" ? (
                          /* SVG TREND LINE CHART */
                          <div className="w-full bg-slate-50/70 rounded-2xl p-4 border border-slate-200/70 overflow-x-auto">
                            <div className="min-w-[600px] h-[260px] relative flex flex-col justify-between">
                              <svg className="w-full h-[220px] overflow-visible" viewBox="0 0 800 220" preserveAspectRatio="none">
                                <defs>
                                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                                  </linearGradient>
                                  <linearGradient id="costGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.2" />
                                    <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
                                  </linearGradient>
                                  <linearGradient id="profGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
                                    <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
                                  </linearGradient>
                                </defs>

                                {/* Y-Axis Grid Lines */}
                                {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                                  const y = 180 - ratio * 150;
                                  const val = Math.round(maxVal * ratio);
                                  return (
                                    <g key={i}>
                                      <line x1="50" y1={y} x2="780" y2={y} stroke="#e2e8f0" strokeDasharray="4 4" strokeWidth="1" />
                                      <text x="45" y={y + 4} textAnchor="end" className="text-[10px] font-mono fill-slate-400">
                                        {val >= 1000000 ? `${(val / 1000000).toFixed(1)}M` : val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}
                                      </text>
                                    </g>
                                  );
                                })}

                                {(() => {
                                  const n = displayData.length;
                                  const getX = (index: number) => 70 + (index / Math.max(1, n - 1)) * 690;
                                  const getY = (val: number) => 180 - (val / maxVal) * 150;

                                  const revPts = displayData.map((d, i) => ({ x: getX(i), y: getY(d.rev) }));
                                  const costPts = displayData.map((d, i) => ({ x: getX(i), y: getY(d.cost) }));
                                  const profPts = displayData.map((d, i) => ({ x: getX(i), y: getY(d.prof) }));

                                  const makePath = (pts: { x: number; y: number }[]) => {
                                    if (pts.length === 0) return "";
                                    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
                                    let path = `M ${pts[0].x} ${pts[0].y}`;
                                    for (let i = 0; i < pts.length - 1; i++) {
                                      const p0 = pts[i];
                                      const p1 = pts[i + 1];
                                      const cpX1 = p0.x + (p1.x - p0.x) / 2;
                                      const cpX2 = p0.x + (p1.x - p0.x) / 2;
                                      path += ` C ${cpX1} ${p0.y}, ${cpX2} ${p1.y}, ${p1.x} ${p1.y}`;
                                    }
                                    return path;
                                  };

                                  const revPath = makePath(revPts);
                                  const costPath = makePath(costPts);
                                  const profPath = makePath(profPts);

                                  const revArea = revPts.length > 0 ? `${revPath} L ${revPts[revPts.length - 1].x} 180 L ${revPts[0].x} 180 Z` : "";
                                  const costArea = costPts.length > 0 ? `${costPath} L ${costPts[costPts.length - 1].x} 180 L ${costPts[0].x} 180 Z` : "";
                                  const profArea = profPts.length > 0 ? `${profPath} L ${profPts[profPts.length - 1].x} 180 L ${profPts[0].x} 180 Z` : "";

                                  return (
                                    <>
                                      {/* Area fills */}
                                      <path d={revArea} fill="url(#revGrad)" />
                                      <path d={costArea} fill="url(#costGrad)" />
                                      <path d={profArea} fill="url(#profGrad)" />

                                      {/* Trend Lines */}
                                      <path d={revPath} fill="none" stroke="#10b981" strokeWidth="3.5" strokeLinecap="round" />
                                      <path d={costPath} fill="none" stroke="#f43f5e" strokeWidth="3" strokeLinecap="round" strokeDasharray="5 5" />
                                      <path d={profPath} fill="none" stroke="#2563eb" strokeWidth="3.5" strokeLinecap="round" />

                                      {/* Data Dots & Interactive Circles */}
                                      {displayData.map((d, i) => {
                                        const px = getX(i);
                                        const ry = getY(d.rev);
                                        const cy = getY(d.cost);
                                        const py = getY(d.prof);

                                        return (
                                          <g key={d.month} className="group/dot cursor-pointer">
                                            {/* Vertical hover line */}
                                            <line x1={px} y1="30" x2={px} y2="180" stroke="#cbd5e1" strokeDasharray="3 3" strokeWidth="1.5" className="opacity-0 group-hover/dot:opacity-100 transition-opacity" />

                                            {/* Revenue Dot */}
                                            <circle cx={px} cy={ry} r="5" fill="#10b981" stroke="#ffffff" strokeWidth="2" className="transition-transform group-hover/dot:r-7" />
                                            {/* Cost Dot */}
                                            <circle cx={px} cy={cy} r="4" fill="#f43f5e" stroke="#ffffff" strokeWidth="2" className="transition-transform group-hover/dot:r-6" />
                                            {/* Profit Dot */}
                                            <circle cx={px} cy={py} r="5" fill="#2563eb" stroke="#ffffff" strokeWidth="2" className="transition-transform group-hover/dot:r-7" />
                                          </g>
                                        );
                                      })}
                                    </>
                                  );
                                })()}
                              </svg>

                              {/* X-Axis Month Labels */}
                              <div className="flex justify-between px-[50px] text-xs font-black text-slate-700 pt-2 border-t border-slate-200/80">
                                {displayData.map(d => (
                                  <div key={d.month} className="text-center">
                                    <span>{d.month}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ) : (
                          /* BAR CHART VIEW */
                          <div className="grid gap-3 pt-2" style={{ gridTemplateColumns: `repeat(${displayData.length}, minmax(0, 1fr))` }}>
                            {displayData.map((d) => {
                              const revPct = Math.round((d.rev / maxVal) * 100);
                              const costPct = Math.round((d.cost / maxVal) * 100);
                              const profPct = Math.round((d.prof / maxVal) * 100);

                              return (
                                <div key={d.month} className="flex flex-col items-center gap-2 group">
                                  <div className="h-36 w-full bg-slate-50 rounded-2xl flex items-end justify-center p-1.5 gap-1 relative overflow-hidden border border-slate-100 shadow-inner">
                                    <div 
                                      className="w-1/3 bg-emerald-500 rounded-t-md transition-all duration-300 group-hover:bg-emerald-600 shadow-sm" 
                                      style={{ height: `${Math.max(10, Math.min(100, revPct))}%` }}
                                      title={`Revenue (${d.month}): ${d.rev.toLocaleString()}`}
                                    />
                                    <div 
                                      className="w-1/3 bg-rose-400 rounded-t-md transition-all duration-300 group-hover:bg-rose-500 shadow-sm" 
                                      style={{ height: `${Math.max(8, Math.min(100, costPct))}%` }}
                                      title={`Cost (${d.month}): ${d.cost.toLocaleString()}`}
                                    />
                                    <div 
                                      className="w-1/3 bg-blue-600 rounded-t-md transition-all duration-300 group-hover:bg-blue-700 shadow-sm" 
                                      style={{ height: `${Math.max(5, Math.min(100, profPct))}%` }}
                                      title={`Profit (${d.month}): ${d.prof.toLocaleString()}`}
                                    />
                                  </div>
                                  <span className="text-xs font-black text-slate-700">{d.month}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Chart Legend */}
                        <div className="flex flex-wrap items-center justify-center gap-6 pt-3 text-xs font-extrabold border-t border-slate-100">
                          <div className="flex items-center gap-2">
                            <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 shadow-sm" />
                            <span className="text-slate-700">Revenue (รายได้เฉลี่ยรวม)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-3.5 h-3.5 rounded-full bg-rose-500 shadow-sm border border-dashed border-rose-600" />
                            <span className="text-slate-700">Cost (ต้นทุนเฉลี่ยรวม)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-3.5 h-3.5 rounded-full bg-blue-600 shadow-sm" />
                            <span className="text-slate-700">Profit (กำไรสุทธิ)</span>
                          </div>
                        </div>

                        {/* Monthly Exact Numbers Pill Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 pt-3">
                          {displayData.map(d => (
                            <div key={d.month} className="bg-slate-50/90 rounded-2xl p-3 border border-slate-200/80 space-y-1 text-left font-mono">
                              <div className="flex justify-between items-center pb-1 border-b border-slate-200/60 font-sans">
                                <span className="font-black text-slate-900 text-xs">{d.month}</span>
                                <span className="text-[10px] font-bold text-slate-400">2026</span>
                              </div>
                              <div className="text-[11px] space-y-0.5 pt-1">
                                <div className="flex justify-between">
                                  <span className="text-slate-500 font-sans">รายได้:</span>
                                  <span className="font-extrabold text-emerald-700">{d.rev.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-500 font-sans">ต้นทุน:</span>
                                  <span className="font-extrabold text-rose-700">{d.cost.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between pt-0.5 border-t border-slate-200/40">
                                  <span className="text-slate-500 font-sans">กำไร:</span>
                                  <span className="font-black text-blue-700">{d.prof.toLocaleString()}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Roster Table of Job Value Records */}
                <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                  <div className="p-6 border-b border-slate-100 space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2.5">
                          <h4 className="text-sm font-bold text-slate-800">ตารางข้อมูลคุณค่าตำแหน่งงานและผลตอบแทนรายพนักงาน</h4>
                          <span className="px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold">
                            {safeJobValueRecords.length} รายการ
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">ใช้ช่องค้นหาหรือตัวกรองเพื่อค้นหารายพนักงาน และกดดูรายละเอียดเพื่อดูสถิติรายเดือน</p>
                      </div>

                      {(jobValueSearchQuery || jobValueDeptFilter !== "ทุกแผนก") && (
                        <button
                          type="button"
                          onClick={() => {
                            setJobValueSearchQuery("");
                            setJobValueDeptFilter("ทุกแผนก");
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl text-xs font-bold transition-all border border-rose-200 cursor-pointer self-start md:self-auto"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>ล้างตัวกรอง</span>
                        </button>
                      )}
                    </div>

                    {/* Filter Toolbar */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {/* Search */}
                      <div className="relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={jobValueSearchQuery}
                          onChange={(e) => setJobValueSearchQuery(e.target.value)}
                          placeholder="ค้นหารหัสพนักงาน, ชื่อ-นามสกุล, ตำแหน่ง..."
                          className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                        />
                        {jobValueSearchQuery && (
                          <button onClick={() => setJobValueSearchQuery("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Department Dropdown */}
                      <div className="relative">
                        <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <select
                          value={jobValueDeptFilter}
                          disabled={!isHrOrFullAccess}
                          onChange={(e) => setJobValueDeptFilter(e.target.value)}
                          className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer appearance-none disabled:opacity-80"
                        >
                          {isHrOrFullAccess && <option value="ทุกแผนก">แผนกทั้งหมด (ทุกแผนก)</option>}
                          {(["INTER 2", "INTER 3", "INTER 5", "INTER 7"] || []).filter(d => {
                            if (isHrOrFullAccess) return true;
                            return normalizeDeptId(currentUser?.deptId) === normalizeDeptId(d);
                          }).map(d => (
                            <option key={d} value={d}>แผนก {d}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[950px]">
                      <thead>
                        <tr className="bg-slate-100/90 border-b border-slate-200 text-xs font-black text-slate-700 uppercase tracking-wider">
                          <th className="px-3.5 py-3 font-mono w-24">รหัสพนักงาน</th>
                          <th className="px-3.5 py-3 min-w-[170px]">ชื่อ-นามสกุล</th>
                          <th className="px-3.5 py-3 min-w-[130px]">ตำแหน่ง</th>
                          <th className="px-3.5 py-3 w-28 text-center">แผนก</th>
                          <th className="px-3.5 py-3 text-right text-emerald-700 font-black min-w-[130px]">รายได้เฉลี่ย/เดือน (AVG REVENUE)</th>
                          <th className="px-3.5 py-3 text-right text-rose-700 font-black min-w-[130px]">ต้นทุนเฉลี่ย/เดือน (AVG COST)</th>
                          <th className="px-3.5 py-3 text-right text-slate-600 font-bold min-w-[110px]">กำไรสะสม 2568</th>
                          <th className="px-3.5 py-3 text-right text-blue-700 font-black min-w-[110px]">กำไรสะสม 2569</th>
                          <th className="px-3.5 py-3 text-center min-w-[130px]">ผลงาน 68 ➔ 69</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-800 text-xs">
                        {safeJobValueRecords
                          .filter(jv => {
                            if (!jv) return false;
                            const empMaster = (state?.employees || []).find(e => 
                              String(e.id || "").toLowerCase() === String(jv.empId || "").toLowerCase() ||
                              String(e.name || "").toLowerCase() === String(jv.empName || "").toLowerCase()
                            );
                            const empName = empMaster?.name || jv.empName || "";
                            const position = empMaster?.role || jv.position || "";
                            const deptName = empMaster ? getDeptName(empMaster.deptId, state?.departments) : (jv.department || "");
                            
                            // Section Manager Permission Check
                            if (!isHrOrFullAccess && currentUser?.deptId) {
                              const managerDeptId = normalizeDeptId(currentUser.deptId);
                              const empDeptId = normalizeDeptId(empMaster?.deptId || jv.deptId || jv.department);
                              if (empDeptId !== managerDeptId && deptName !== getDeptName(currentUser.deptId, state?.departments)) {
                                return false;
                              }
                            }

                            if (!isJvDepartment(deptName) && !isJvDepartment(jv.deptId)) return false;

                            // Filter out inactive/resigned/retired employees from active list
                            const empStatus = empMaster?.employmentStatus || jv?.status || "Active";
                            const isInactive = empStatus === "Resigned" || empStatus === "Inactive" || empStatus === "Retired" || empStatus === "พ้นสภาพ" || empStatus === "ลาออก" || empStatus === "เกษียณ";
                            if (isInactive) return false;

                            const q = (jobValueSearchQuery || "").toLowerCase().trim();
                            const matchesSearch = !q || String(jv.empId || "").toLowerCase().includes(q) || empName.toLowerCase().includes(q) || position.toLowerCase().includes(q);
                            const matchesDept = !jobValueDeptFilter || jobValueDeptFilter === "ทุกแผนก" || deptName === jobValueDeptFilter || normalizeDeptId(deptName) === normalizeDeptId(jobValueDeptFilter);
                            return matchesSearch && matchesDept;
                          })
                          .map(jv => {
                            const empMaster = (state?.employees || []).find(e => 
                              String(e.id || "").toLowerCase() === String(jv.empId || "").toLowerCase() ||
                              String(e.name || "").toLowerCase() === String(jv.empName || "").toLowerCase()
                            );
                            const empName = empMaster?.name || jv?.empName || "-";
                            const deptName = empMaster ? getDeptName(empMaster.deptId, state?.departments) : (jv?.department || "-");
                            const position = empMaster?.role || jv?.position || "-";
                            const empStatus = empMaster?.employmentStatus || jv?.status || "Active";
                            const isInactive = empStatus === "Resigned" || empStatus === "Inactive" || empStatus === "ลาออก";
                            const p25 = Number(jv?.profit2025) || 0;
                            const p26 = Number(jv?.profit2026) || 0;
                            const diff = p26 - p25;
                            const isGrowth = diff >= 0;

                            return (
                              <tr 
                                key={jv?.id || jv?.empId || Math.random()} 
                                onClick={() => {
                                  const found = empMaster || {
                                    id: jv?.empId || "EMP",
                                    name: jv?.empName || "พนักงาน",
                                    role: jv?.position || "Operator",
                                    deptId: jv?.department || "inter2",
                                    employmentStatus: jv?.status || "Active",
                                    salary: jv?.avgCost ? Math.round(jv.avgCost / 1.35) : 15000
                                  };
                                  setViewingEmployeeDetails(found as any);
                                }}
                                className="hover:bg-blue-50/60 transition-colors cursor-pointer group"
                                title="คลิกเพื่อดูบัตรประจำตัวพนักงานและข้อมูลโปรไฟล์ (Employee Profile Card)"
                              >
                                <td className="px-3.5 py-3 font-mono font-bold text-slate-600 text-xs">{jv?.empId || "-"}</td>
                                <td className="px-3.5 py-3 font-bold text-slate-900 text-xs group-hover:text-blue-600 transition-colors">
                                  <div className="flex items-center gap-2">
                                    <EmployeeAvatar empId={jv?.empId || ""} empName={empName} className="w-7 h-7 flex-shrink-0" />
                                    <span className="underline-offset-2 group-hover:underline">{empName}</span>
                                  </div>
                                </td>
                                <td className="px-3.5 py-3 font-medium text-slate-700 text-xs">{position}</td>
                                <td className="px-3.5 py-3 font-bold text-slate-700 text-center">
                                  <span className="px-2 py-0.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 text-[11px]">
                                    {deptName}
                                  </span>
                                </td>
                                <td className="px-3.5 py-3 text-right font-black text-emerald-700 font-mono text-sm">{(Number(jv?.avgRevenue) || 0).toLocaleString()}</td>
                                <td className="px-3.5 py-3 text-right font-black text-rose-700 font-mono text-sm">{(Number(jv?.avgCost) || 0).toLocaleString()}</td>
                                <td className="px-3.5 py-3 text-right font-bold text-slate-600 font-mono text-sm">{p25.toLocaleString()}</td>
                                <td className="px-3.5 py-3 text-right font-black text-blue-700 font-mono text-sm">{p26.toLocaleString()}</td>
                                <td className="px-3.5 py-3 text-center font-bold">
                                  {isGrowth ? (
                                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-black" title={`กำไรเพิ่มขึ้น +${diff.toLocaleString()}`}>
                                      ต่อยอด (+{diff.toLocaleString()})
                                    </span>
                                  ) : (
                                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-black" title={`กำไรลดลง -${Math.abs(diff).toLocaleString()}`}>
                                      ไม่ต่อยอด (-{Math.abs(diff).toLocaleString()})
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}

                        {safeJobValueRecords.length === 0 && (
                          <tr>
                            <td colSpan={10} className="px-6 py-12 text-center text-slate-500">
                              <div className="flex flex-col items-center justify-center space-y-3">
                                <FileSpreadsheet className="w-10 h-10 text-slate-300" />
                                <p className="text-sm font-bold text-slate-700">ยังไม่มีข้อมูล Job Value ในระบบ</p>
                                <p className="text-xs text-slate-400">HR สามารถกดปุ่ม "อัพโหลดข้อมูล (Import CSV)" เพื่อนำเข้าข้อมูลรายชื่อและผลตอบแทนพนักงานได้ทันที</p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </ErrorBoundary>
          )}

          {/* ======================================= */}
          {/* VIEW: DEPARTMENT REPORTS */}
          {/* ======================================= */}
          {activeTab === "reports" && (
            <div className="w-full max-w-full min-w-0 space-y-4 sm:space-y-6">
              {/* Header card with analytics label and selectors */}
              <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-800">รายงานข้อมูลและงบประมาณรายแผนก</h3>
                  <p className="text-xs text-slate-500 mt-1">วิเคราะห์งบการเงิน OT, ความสมดุลของตาราง และการใช้ทรัพยากรส่วนบุคคล</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-bold select-none">
                    <Calendar className="w-3.5 h-3.5 text-blue-500" />
                    <select
                      value={selectedMonthFilter}
                      onChange={(e) => setSelectedMonthFilter(e.target.value)}
                      className="bg-transparent border-none text-xs rounded-md p-0 focus:ring-0 cursor-pointer text-slate-700 font-bold"
                    >
                      <option value="เดือนปัจจุบัน">เดือนปัจจุบัน</option>
                      <option value="ตุลาคม 2023">ตุลาคม 2023</option>
                      <option value="พฤศจิกายน 2023">พฤศจิกายน 2023</option>
                      <option value="ธันวาคม 2023">ธันวาคม 2023</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-bold select-none">
                    <Filter className="w-3.5 h-3.5 text-blue-500" />
                    <select
                      value={selectedDeptFilter === "ทุกแผนก" ? "ทุกแผนกทำงาน" : selectedDeptFilter}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSelectedDeptFilter(val === "ทุกแผนกทำงาน" ? "ทุกแผนก" : val);
                      }}
                      disabled={activeDeptId !== "all"}
                      className="bg-transparent border-none text-xs rounded-md p-0 focus:ring-0 cursor-pointer text-slate-700 font-bold disabled:opacity-80 disabled:cursor-not-allowed"
                    >
                      <option value="ทุกแผนกทำงาน">ทุกแผนกทำงาน</option>
                      {state.departments.map(d => (
                        <option key={d.id} value={d.name}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                  <button 
                    onClick={() => window.print()}
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm cursor-pointer min-h-[40px]"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>ส่งออกรายงาน PDF</span>
                  </button>
                </div>
              </div>

              {/* Row: Main charts split */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
                
                {/* Visual Chart representation: Spending correlation */}
                <div className="lg:col-span-8 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">
                        {selectedDeptFilter !== "ทุกแผนก" && selectedDeptFilter !== "ทุกแผนกทำงาน" 
                          ? `ชั่วโมงการทำงานล่วงเวลารายบุคคล - ${selectedDeptFilter}` 
                          : "เปรียบเทียบชั่วโมงทำโอทีกับความสัมพันธ์ด้านงบประมาณ (OT vs Spending)"
                        }
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">
                        {selectedDeptFilter !== "ทุกแผนก" && selectedDeptFilter !== "ทุกแผนกทำงาน" 
                          ? "ชั่วโมงการทำงานล่วงเวลาสะสมจริงของพนักงานแต่ละท่านเทียบกับเป้าหมายความปลอดภัย" 
                          : "วิเคราะห์ความสัมพันธ์ระหว่างชั่วโมงทำงานกับค่าใช้จ่ายงบประมาณรวมสะสม"
                        }
                      </p>
                    </div>
                    <div className="flex items-center gap-4 select-none">
                      {selectedDeptFilter !== "ทุกแผนก" && selectedDeptFilter !== "ทุกแผนกทำงาน" ? (
                        <>
                          <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 bg-blue-600 rounded-sm"></span>
                            <span className="text-[10px] font-bold text-slate-500">ชั่วโมง OT (ปกติ)</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 bg-red-500 rounded-sm"></span>
                            <span className="text-[10px] font-bold text-slate-500">เกินเป้าความปลอดภัย ⚠️</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <span className="w-2.5 h-2.5 bg-blue-600 rounded-sm"></span>
                          <span className="text-[10px] font-bold text-slate-500">ชั่วโมงทำงานจริง (ชม.)</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="h-64 relative mt-4">
                    {/* Simulated composite chart with exact axes from picture 2 */}
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-6 ml-10 mr-10">
                      <div className="w-full border-t border-slate-200 border-dashed"></div>
                      <div className="w-full border-t border-slate-200 border-dashed"></div>
                      <div className="w-full border-t border-slate-200 border-dashed"></div>
                      <div className="w-full border-t border-slate-300"></div>
                    </div>

                    <div className="absolute inset-x-10 bottom-6 top-0 flex items-end justify-between gap-2">
                      {selectedDeptFilter !== "ทุกแผนก" && selectedDeptFilter !== "ทุกแผนกทำงาน" ? (
                        filteredEmployeesForReport.map((emp) => {
                          const actualOt = getDynamicEmployeeOt(emp.id, selectedMonthFilter);
                          const maxOt = 100;
                          const otHeight = Math.min(100, Math.round((actualOt / maxOt) * 100));
                          const isOverLimit = actualOt > emp.targetOt;
                          return (
                            <div key={emp.id} className="flex-1 flex flex-col items-center group relative h-full">
                              <div 
                                style={{ height: `${otHeight}%` }}
                                className={`w-8 absolute bottom-0 rounded-t transition-all hover:scale-105 shadow-sm cursor-pointer ${
                                  isOverLimit ? "bg-red-500 hover:bg-red-600" : "bg-blue-600 hover:bg-blue-700"
                                }`}
                                title={`${emp.name}: ${actualOt} ชม. (เป้าหมาย ${emp.targetOt} ชม.)`}
                              ></div>
                              <span className="absolute -bottom-6 text-[9px] font-bold text-slate-500 text-center truncate max-w-[70px]" title={emp.name}>
                                {emp.name.split(" ")[0]}
                              </span>
                            </div>
                          );
                        })
                      ) : (
                        reportDepartments.slice(0, 5).map((dept) => {
                          const otHours = getDynamicDeptOt(dept.id, selectedMonthFilter);
                          const budgetUsed = dept.budgetUsed || 0;
                          
                          const maxOt = Math.max(...reportDepartments.map(d => d.otHours), 50);
                          const maxBudget = Math.max(...reportDepartments.map(d => d.budgetUsed), 10000);
                          
                          const otHeight = Math.round((otHours / maxOt) * 100);
                          const budgetHeight = Math.round((budgetUsed / maxBudget) * 100);
                          return (
                            <div key={dept.id} className="flex-1 flex flex-col items-center group relative h-full">
                              <div className="flex items-end justify-center gap-1.5 w-full h-full pb-6">
                                {/* OT Hours Bar */}
                                <div 
                                  style={{ height: `${otHeight}%` }}
                                  className="w-3 bg-blue-600 rounded-t transition-all hover:bg-blue-700 shadow-sm cursor-pointer"
                                  title={`${dept.nameTh}: OT ${otHours} ชม.`}
                                ></div>
                                {/* Spending Bar */}
                                <div 
                                  style={{ height: `${budgetHeight}%` }}
                                  className="w-3 bg-amber-500 rounded-t transition-all hover:bg-amber-600 shadow-sm cursor-pointer"
                                  title={`${dept.nameTh}: งบประมาณ ${budgetUsed.toLocaleString()}`}
                                ></div>
                              </div>
                              <span className="absolute -bottom-6 text-[10px] font-bold text-slate-500 text-center truncate max-w-[70px]">{dept.name}</span>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Left axis (Hours) */}
                    <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[10px] font-bold text-slate-400 pb-6">
                      <span>{selectedDeptFilter !== "ทุกแผนก" && selectedDeptFilter !== "ทุกแผนกทำงาน" ? "100h" : `${Math.round(Math.max(...reportDepartments.map(d => d.otHours), 50))}h`}</span>
                      <span>{selectedDeptFilter !== "ทุกแผนก" && selectedDeptFilter !== "ทุกแผนกทำงาน" ? "50h" : `${Math.round(Math.max(...reportDepartments.map(d => d.otHours), 50) / 2)}h`}</span>
                      <span>0h</span>
                    </div>

                    {/* Right axis (Cost) */}
                    <div className="absolute right-0 top-0 h-full flex flex-col justify-between text-[10px] font-bold pb-6 text-right">
                      {selectedDeptFilter !== "ทุกแผนก" && selectedDeptFilter !== "ทุกแผนกทำงาน" ? (
                        <>
                          <span className="text-slate-400">100%</span>
                          <span className="text-slate-400">50%</span>
                          <span className="text-slate-400">0%</span>
                        </>
                      ) : (
                        <>
                          <span className="text-amber-600">{`${Math.round(Math.max(...reportDepartments.map(d => d.budgetUsed), 10000) / 1000)}k`}</span>
                          <span className="text-amber-600">{`${Math.round(Math.max(...reportDepartments.map(d => d.budgetUsed), 10000) / 2000)}k`}</span>
                          <span className="text-slate-400">0</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sidebar managers list */}
                <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">หัวหน้าแผนกผู้ควบคุม (Summary)</h4>
                    <p className="text-xs text-slate-500 mb-6">ผู้รับผิดชอบงบประมาณและเวลา</p>
                  </div>

                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {reportDepartments.map((dept) => {
                      const managerInfo = getDeptManagerInfo(dept.id);
                      const otHours = getDynamicDeptOt(dept.id, selectedMonthFilter);
                      return (
                        <div key={dept.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-all">
                          <div className="flex items-center gap-3">
                            <EmployeeAvatar empId={managerInfo.username} empName={managerInfo.name} avatarUrl={managerInfo.avatar} className="w-9 h-9 flex-shrink-0" />
                            <div>
                              <p className="text-xs font-bold text-slate-800">{managerInfo.name}</p>
                              <p className="text-[9px] text-blue-600 font-mono font-bold uppercase tracking-wider">{managerInfo.role}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-extrabold text-blue-600">{otHours} ชม.</p>
                            <p className={`text-[9px] font-bold ${dept.status === 'Warning' ? 'text-red-500' : 'text-emerald-600'}`}>
                              {dept.status === 'Warning' ? 'Warning' : 'On Budget'}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <button 
                    onClick={() => setActiveTab("employees")}
                    className="w-full py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors mt-4"
                  >
                    ดูข้อมูลหัวหน้าทั้งหมด
                  </button>
                </div>

              </div>

              {/* Row: Peak Heatmap & KPIs radar simulation & Position Distribution */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
                
                {/* Heatmap block */}
                <div className="lg:col-span-6 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">ช่วงเวลาที่มีการทำโอทีหนาแน่นที่สุด (Heatmap)</h4>
                      <p className="text-xs text-slate-500 mt-1">วิเคราะห์ช่วงกะเวลาที่มีกำลังพลทำงานล่วงเวลาสูงที่สุดในแต่ละวัน</p>
                    </div>
                    {/* Scale labels */}
                    <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400">
                      <span>Low</span>
                      <div className="flex gap-0.5">
                        <div className="w-3.5 h-3.5 bg-blue-100 rounded-sm"></div>
                        <div className="w-3.5 h-3.5 bg-blue-300 rounded-sm"></div>
                        <div className="w-3.5 h-3.5 bg-blue-500 rounded-sm"></div>
                        <div className="w-3.5 h-3.5 bg-blue-800 rounded-sm"></div>
                      </div>
                      <span>High</span>
                    </div>
                  </div>

                  {/* Calendar Heatmap Grid */}
                  <div className="overflow-x-auto no-scrollbar touch-pan-x">
                    <div className="grid grid-cols-8 gap-1.5 pt-2 min-w-[340px]">
                      <div></div>
                      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => (
                        <div key={d} className="text-center text-[10px] font-bold text-slate-500">{d}</div>
                      ))}
                      
                      <div className="text-[10px] font-bold text-slate-500 flex items-center">17:00-19:00</div>
                      {heatmapGrid[0].map((val, idx) => (
                        <div 
                          key={idx} 
                          className={`h-8 rounded-sm ${getHeatColorClass(val)} flex items-center justify-center text-[9px]`}
                          title={`ยอด OT รวม: ${val} ชม.`}
                        >
                          {val > 0 ? `${val}h` : ""}
                        </div>
                      ))}

                      <div className="text-[10px] font-bold text-slate-500 flex items-center">19:00-21:00</div>
                      {heatmapGrid[1].map((val, idx) => (
                        <div 
                          key={idx} 
                          className={`h-8 rounded-sm ${getHeatColorClass(val)} flex items-center justify-center text-[9px]`}
                          title={`ยอด OT รวม: ${val} ชม.`}
                        >
                          {val > 0 ? `${val}h` : ""}
                        </div>
                      ))}

                      <div className="text-[10px] font-bold text-slate-500 flex items-center">21:00-23:00</div>
                      {heatmapGrid[2].map((val, idx) => (
                        <div 
                          key={idx} 
                          className={`h-8 rounded-sm ${getHeatColorClass(val)} flex items-center justify-center text-[9px]`}
                          title={`ยอด OT รวม: ${val} ชม.`}
                        >
                          {val > 0 ? `${val}h` : ""}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Radar Chart KPIs */}
                <div className="lg:col-span-3 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">ตัวชี้วัดประสิทธิภาพหลัก (Key KPIs)</h4>
                    <p className="text-xs text-slate-500 mb-4">ดัชนีชี้วัดความคล่องตัวและความเสถียรของทรัพยากร</p>
                  </div>

                  <div className="flex-1 flex items-center justify-center relative min-h-[180px]">
                    {dashboardEmployees.length === 0 && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/95 rounded-2xl z-20">
                        <span className="text-3xl mb-2">📊</span>
                        <p className="text-xs font-bold text-slate-500">ยังไม่มีข้อมูลพนักงาน</p>
                        <p className="text-[10px] text-slate-400 mt-1">กรุณานำเข้าหรือเพิ่มข้อมูลพนักงานก่อน</p>
                      </div>
                    )}
                    <svg className="w-40 h-40 overflow-visible" viewBox="0 0 100 100">
                      {/* Grid */}
                      <polygon points="50,10 88,38 74,82 26,82 12,38" fill="none" stroke="#e2e8f0" strokeWidth="0.5" />
                      <polygon points="50,20 78,41 68,74 32,74 22,41" fill="none" stroke="#e2e8f0" strokeWidth="0.5" />
                      <polygon points="50,30 69,44 62,66 38,66 31,44" fill="none" stroke="#e2e8f0" strokeWidth="0.5" />
                      {/* Axis lines */}
                      <line x1="50" y1="50" x2="50" y2="10" stroke="#e2e8f0" strokeWidth="0.5" />
                      <line x1="50" y1="50" x2="88" y2="38" stroke="#e2e8f0" strokeWidth="0.5" />
                      <line x1="50" y1="50" x2="74" y2="82" stroke="#e2e8f0" strokeWidth="0.5" />
                      <line x1="50" y1="50" x2="26" y2="82" stroke="#e2e8f0" strokeWidth="0.5" />
                      <line x1="50" y1="50" x2="12" y2="38" stroke="#e2e8f0" strokeWidth="0.5" />
                      {/* Baseline */}
                      <polygon points={safetyBaselinePoints} fill="rgba(249,115,22,0.05)" stroke="#f97316" strokeWidth="1.2" strokeDasharray="2,2" />
                      {/* Company polygon */}
                      <polygon points={companyPoints} fill="rgba(59, 130, 246, 0.15)" stroke="#2563eb" strokeWidth="1.5" />
                      {/* Dots at vertices */}
                      {companyPoints.split(" ").map((pt, i) => {
                        const [x, y] = pt.split(",").map(Number);
                        return <circle key={i} cx={x} cy={y} r="2" fill="#2563eb" />;
                      })}
                    </svg>
                    {/* Labels */}
                    <span className="absolute top-1 text-[8px] font-bold text-slate-500 text-center w-full">จัดกะ ({Math.round(coveragePct * 100)}%)</span>
                    <span className="absolute top-16 right-0 text-[8px] font-bold text-slate-500">ผลผลิต ({Math.round(productivityPct * 100)}%)</span>
                    <span className="absolute bottom-1 right-2 text-[8px] font-bold text-slate-500">ความคุ้มค่า ({Math.round(costEfficiencyPct * 100)}%)</span>
                    <span className="absolute bottom-1 left-2 text-[8px] font-bold text-slate-500">ความปลอดภัย ({Math.round(safetyPct * 100)}%)</span>
                    <span className="absolute top-16 left-0 text-[8px] font-bold text-slate-500">กำลังพล ({Math.round(attendancePct * 100)}%)</span>
                  </div>

                  <div className="flex gap-4 justify-center text-[9px] font-bold text-slate-600 mt-2">
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-blue-600 rounded-sm"></span>
                      <span>ดัชนี (Current)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 border border-dashed border-orange-500 bg-orange-50 rounded-sm"></span>
                      <span>เกณฑ์ (Baseline)</span>
                    </div>
                  </div>
                </div>

                {/* OT Distribution by Position */}
                <div className="lg:col-span-3 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">เอนเอียงกลุ่มตำแหน่งปฏิบัติการ</h4>
                    <p className="text-[10px] text-slate-500 mb-4">สัดส่วนชั่วโมงทำงาน OT ของ 10 ตำแหน่งปฏิบัติการหลัก</p>
                  </div>

                  <div className="space-y-3 overflow-y-auto max-h-[180px] pr-1.5 scrollbar-thin">
                    {roleOtData.map((item, idx) => {
                      const pct = Math.round((item.totalOt / maxRoleOt) * 100);
                      return (
                        <div key={idx} className="group">
                          <div className="flex justify-between items-center text-[10px] mb-0.5">
                            <span className="font-bold text-slate-600 group-hover:text-blue-600 truncate max-w-[130px] transition-colors" title={item.role}>
                              {item.role}
                            </span>
                            <span className="font-bold text-slate-900 font-mono">{item.totalOt} ชม. ({item.empCount} คน)</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden shadow-inner">
                            <div 
                              style={{ width: `${pct}%` }}
                              className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all"
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="pt-2.5 border-t border-slate-100 mt-4 flex items-center justify-between text-[9px] font-bold text-slate-400">
                    <span>กลุ่มตำแหน่งปฏิบัติการหลัก</span>
                    <span className="text-blue-600">วิเคราะห์เอนเอียง</span>
                  </div>
                </div>

              </div>

              {/* Row: Cargo Tonnage vs OT Analytics Card */}
              <div className="bg-gradient-to-r from-amber-500/5 via-amber-500/10 to-orange-500/5 p-4 sm:p-6 rounded-3xl border border-amber-200 shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-base font-black text-amber-950 flex items-center gap-2">
                      <span>🚢</span> การวิเคราะห์ปริมาณงานเรือ/เครน (ตัน) กับ ชั่วโมง OT (Cargo Tonnage vs OT Analytics)
                    </h4>
                    <p className="text-xs text-amber-800/80 mt-0.5">
                      วิเคราะห์ประสิทธิภาพการทำงาน ประเมินอัตราส่วนชั่วโมง OT ที่ใช้ในการจัดการสินค้าน้ำหนักตัน
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-4 bg-white/80 backdrop-blur px-4 py-2.5 rounded-2xl border border-amber-200 shadow-sm">
                    <div className="text-right">
                      <span className="block text-[10px] font-bold text-slate-500">ปริมาณงานสินค้ารวม</span>
                      <span className="text-base font-black text-amber-600 font-mono">
                        {vesselSchedules.reduce((sum, vs) => sum + (Number(vs.tonnage) || 0), 0).toLocaleString()} <span className="text-xs font-bold">ตัน</span>
                      </span>
                    </div>
                    <div className="h-8 w-px bg-amber-200" />
                    <div className="text-right">
                      <span className="block text-[10px] font-bold text-slate-500">อัตราเฉลี่ย OT / 1,000 ตัน</span>
                      <span className="text-base font-black text-blue-600 font-mono">
                        {vesselSchedules.reduce((sum, vs) => sum + (Number(vs.tonnage) || 0), 0) > 0 
                          ? (state.employees.reduce((s, e) => s + (e.actualOt || 0), 0) / (vesselSchedules.reduce((sum, vs) => sum + (Number(vs.tonnage) || 0), 0) / 1000)).toFixed(1)
                          : "0.0"} <span className="text-xs font-bold">ชม.</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Vessel Tonnage vs OT Comparison Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                  {vesselSchedules.length === 0 ? (
                    <div className="col-span-full py-8 text-center bg-white/60 rounded-2xl border border-dashed border-amber-200 text-xs font-bold text-amber-700">
                      ยังไม่มีข้อมูลตารางเรือและเครนตักสินค้า (เพิ่มตารางเรือได้ในหน้าจัดตารางกะ)
                    </div>
                  ) : vesselSchedules.map((vs) => {
                    const ton = Number(vs.tonnage) || 0;
                    const dept = state.departments.find(d => d.id === vs.deptId);
                    const deptEmps = state.employees.filter(e => e.deptId === vs.deptId);
                    const deptOt = deptEmps.reduce((s, e) => s + (e.actualOt || 0), 0);
                    return (
                      <div key={vs.id} className="bg-white p-4 rounded-2xl border border-amber-100 shadow-sm flex flex-col justify-between space-y-3">
                        <div>
                          <div className="flex justify-between items-start">
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-100 text-amber-800 font-mono uppercase">
                              {vs.type === "vessel" ? "เรือ Vessel" : "Ship Crane"} ({vs.planType})
                            </span>
                            <span className="text-[10px] font-bold text-slate-400">{vs.startDate}</span>
                          </div>
                          <h5 className="text-xs font-black text-slate-800 mt-2 truncate" title={vs.name}>{vs.name}</h5>
                          <p className="text-[10px] text-slate-500">แผนกรับผิดชอบ: {dept?.nameTh || vs.deptId}</p>
                        </div>

                        <div className="space-y-2 pt-2 border-t border-slate-100">
                          <div className="flex justify-between items-center text-xs font-bold">
                            <span className="text-slate-600">📦 ปริมาณงาน:</span>
                            <span className="text-amber-600 font-mono">{ton.toLocaleString()} ตัน</span>
                          </div>
                          <div className="flex justify-between items-center text-xs font-bold">
                            <span className="text-slate-600">⏱️ OT สะสมแผนก:</span>
                            <span className="text-blue-600 font-mono">{deptOt} ชม.</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Comprehensive Statistics Table */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">ตารางสรุปงบประมาณและข้อมูลประสิทธิภาพรายแผนก</h4>
                    <p className="text-xs text-slate-500 mt-0.5">การวิเคราะห์พฤติกรรมการใช้งบประมาณและกำลังพล</p>
                  </div>

                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-500">เรียงตาม:</span>
                    <select 
                      value={reportSortBy}
                      onChange={(e) => setReportSortBy(e.target.value)}
                      className="bg-transparent border-none text-[10px] font-extrabold focus:ring-0 cursor-pointer text-slate-700"
                    >
                      <option>OT Hours (High to Low)</option>
                      <option>Department Name</option>
                      <option>Budget Used</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">ชื่อแผนก</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-center">พนักงานทำ OT</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">ชั่วโมงงานสะสม</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">งบประมาณที่ใช้จริง</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">สัดส่วนการใช้งบสูงสุด</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-center">สถานะควบคุม</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
                      {sortedDepartments.map((dept) => (
                        <tr key={dept.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-200">
                                <span className="material-symbols-outlined text-lg">{dept.icon}</span>
                              </div>
                              <div>
                                <p className="font-bold text-slate-800">{dept.nameTh}</p>
                                <p className="text-[10px] text-slate-400">หน่วยการผลิตย่อย {dept.name}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center font-bold font-mono">{dept.employeesCount} คน</td>
                          <td className="px-6 py-4 text-right font-extrabold text-slate-800 font-mono">{dept.otHours} ชม.</td>
                          <td className="px-6 py-4 text-right">
                            <div className="font-extrabold text-slate-800 font-mono">{dept.budgetUsed.toLocaleString()}</div>
                            <div className={`flex items-center justify-end gap-0.5 text-[9px] font-bold ${
                              dept.budgetUsedChangePct > 0 ? 'text-red-500' : 'text-emerald-600'
                            }`}>
                              {dept.budgetUsedChangePct > 0 ? (
                                <>
                                  <ArrowUpRight className="w-3 h-3" />
                                  <span>+{dept.budgetUsedChangePct}%</span>
                                </>
                              ) : (
                                <>
                                  <ArrowDownRight className="w-3 h-3" />
                                  <span>{dept.budgetUsedChangePct}%</span>
                                </>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex-grow bg-slate-100 h-2.5 rounded-full overflow-hidden">
                                <div 
                                  style={{ width: `${dept.budgetUtilization}%` }}
                                  className={`h-full rounded-full ${
                                    dept.budgetUtilization > 90 ? 'bg-red-500' : 'bg-blue-600'
                                  }`}
                                ></div>
                              </div>
                              <span className="font-extrabold text-slate-800 font-mono w-8">{dept.budgetUtilization}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase border ${
                              dept.status === "On Track" 
                                ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                                : "bg-red-50 text-red-700 border-red-100"
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                dept.status === "On Track" ? "bg-emerald-500" : "bg-red-500"
                              }`}></span>
                              {dept.status === "On Track" ? "On Track" : "Warning"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Footer stats metadata */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-xs font-semibold text-slate-500">
                  <p>แสดง 6 แผนกหลัก</p>
                  <div className="flex gap-1">
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-white text-slate-500">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-600 text-white font-bold">1</button>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ======================================= */}
          {/* VIEW: EMPLOYEE LIST */}
          {/* ======================================= */}
          {activeTab === "employees" && (
            <div className="w-full max-w-full min-w-0 space-y-4 sm:space-y-6 font-sans">
              
              {/* Organization Chart Executive Overview Header */}
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight mb-4">Organization chart</h2>
                
                {/* Main Grid: 2 Left Stacked Cards + Right Panels */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 font-sans">
                  
                  {/* Left Column: 2 Stacked Minimalist Cards (1/3 Width) */}
                  <div className="space-y-6">
                    
                    {/* Card 1: Current Total Employees (Minimal Blue Accent) */}
                    {(() => {
                      const currentMonthKey = state?.shiftConfig?.currentMonth || "2026-08";
                      const empsList = state?.employees || [];
                      
                      const activeEmps = empsList.filter(e => e.employmentStatus !== "Resigned" && e.employmentStatus !== "Inactive" && e.employmentStatus !== "Retired" && e.employmentStatus !== "ลาออก" && e.employmentStatus !== "เกษียณ" && e.employmentStatus !== "พ้นสภาพ").length;
                      const totalEmps = empsList.length;
                      const activeRatioPct = totalEmps > 0 ? Math.round((activeEmps / totalEmps) * 100) : 100;

                      // All resigned / inactive employees in the database
                      const allResignedEmps = empsList.filter(e => 
                        e.employmentStatus === "Resigned" || 
                        e.employmentStatus === "Inactive" || 
                        e.employmentStatus === "Retired" || 
                        e.employmentStatus === "ลาออก" || 
                        e.employmentStatus === "เกษียณ" || 
                        e.employmentStatus === "พ้นสภาพ"
                      );

                      // Resigned / Case in CURRENT MONTH
                      const resignedThisMonthEmps = allResignedEmps.filter(e => {
                        if (!e.resignationDate) return true;
                        return e.resignationDate.startsWith(currentMonthKey) || e.resignationDate.includes(currentMonthKey);
                      });

                      const thisMonthCaseCount = resignedThisMonthEmps.length;

                      const formatMonthThai = (mKey: string) => {
                        const parts = mKey.split("-");
                        const m = parseInt(parts[1], 10);
                        const y = parseInt(parts[0], 10);
                        const thMonths = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
                        return `${thMonths[m - 1] || parts[1]} ${y}`;
                      };

                      return (
                        <>
                          <div className="bg-white border-l-4 border-l-blue-600 border-y border-r border-slate-200/80 p-6 rounded-3xl shadow-sm flex flex-col justify-between min-h-[160px] relative overflow-hidden group hover:shadow-md transition-all">
                            <div className="flex justify-between items-start">
                              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 border border-blue-200/60 flex items-center justify-center shadow-2xs">
                                <Users className="w-5 h-5 text-blue-700" />
                              </div>
                            </div>
                            
                            <div className="mt-4">
                              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Current Total Employees</h4>
                              <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-black tracking-tight text-slate-900">{activeEmps}/{totalEmps}</span>
                                <span className="text-xs font-semibold text-slate-500">in total</span>
                              </div>
                              <p className="text-xs font-extrabold text-blue-600 pt-1">({activeRatioPct}% active workforce)</p>
                            </div>
                          </div>

                          {/* Card 2: Case and Resigned (Current Month Calculation) */}
                          <div className="bg-white border-l-4 border-l-rose-500 border-y border-r border-slate-200/80 p-6 rounded-3xl shadow-sm flex flex-col justify-between min-h-[160px] relative overflow-hidden group hover:shadow-md transition-all">
                            <div className="flex justify-between items-start">
                              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200/60 flex items-center justify-center shadow-2xs">
                                <UserX className="w-5 h-5 text-rose-600" />
                              </div>

                              {isHrOrFullAccess && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedEmpStatusTab("Resigned");
                                    setShowResignedModal(true);
                                  }}
                                  className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-black transition-all border border-rose-200/80 cursor-pointer shadow-xs hover:scale-105 active:scale-95 flex items-center gap-1.5"
                                  title="เปิดหน้าต่างจัดการข้อมูลพนักงานลาออก / พ้นสภาพ"
                                >
                                  <SlidersHorizontal className="w-3.5 h-3.5" />
                                  <span>จัดการข้อมูล</span>
                                </button>
                              )}
                            </div>
                            
                            <div className="mt-4">
                              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Case and Resigned</h4>
                              <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-black tracking-tight text-slate-900">{thisMonthCaseCount} Case</span>
                              </div>
                              <p className="text-xs font-extrabold text-rose-600 pt-1">ประจำเดือน {formatMonthThai(currentMonthKey)} (สะสมทั้งหมด {allResignedEmps.length} เคส)</p>
                            </div>
                          </div>
                        </>
                      );
                    })()}

                  </div>

                  {/* Right Column: Dynamic Stacked Area Chart + Organization Chart Icon Bar (2/3 Width) */}
                  {(() => {
                    // 100% Real Dynamic Department Headcount Calculations from D1 employees
                    const empsList = state?.employees || [];
                    const activeEmpsList = empsList.filter(e => e.employmentStatus !== "Resigned" && e.employmentStatus !== "Inactive" && e.employmentStatus !== "Retired" && e.employmentStatus !== "ลาออก" && e.employmentStatus !== "เกษียณ" && e.employmentStatus !== "พ้นสภาพ");
                    
                    const countInter2 = activeEmpsList.filter(e => normalizeDeptId(e.deptId) === "inter2").length;
                    const countInter3 = activeEmpsList.filter(e => normalizeDeptId(e.deptId) === "inter3").length;
                    const countInter5 = activeEmpsList.filter(e => normalizeDeptId(e.deptId) === "inter5").length;
                    const countInter7 = activeEmpsList.filter(e => normalizeDeptId(e.deptId) === "inter7").length;
                    const countHvm = activeEmpsList.filter(e => normalizeDeptId(e.deptId) === "heavy" || normalizeDeptId(e.deptId) === "hvm").length;
                    
                    const totalTracked = Math.max(1, countInter2 + countInter3 + countInter5 + countInter7 + countHvm);

                    // 10-month dynamic points calculation
                    const monthKeys = ["2026-01","2026-02","2026-03","2026-04","2026-05","2026-06","2026-07","2026-08","2026-09","2026-10"];
                    const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct"];

                    // Generate smooth stacked area points normalized from 0 to 100 on SVG coordinate space
                    // Layer 1 (Inter 2): Bottom
                    // Layer 2 (Inter 3): Layer 1 + Inter 3
                    // Layer 3 (Inter 5): Layer 2 + Inter 5
                    // Layer 4 (Inter 7): Layer 3 + Inter 7
                    // Layer 5 (HVM): Top (Total)
                    const xCoords = [0, 11, 22, 33, 44, 55, 66, 77, 88, 100];
                    
                    // Calculate exact monthly headcount per department considering startDate & resignationDate
                    const getMonthlyDeptCount = (deptKey: string, mKey: string) => {
                      return empsList.filter(e => {
                        const isMatch = deptKey === "hvm" 
                          ? (normalizeDeptId(e.deptId) === "heavy" || normalizeDeptId(e.deptId) === "hvm") 
                          : (normalizeDeptId(e.deptId) === deptKey);
                        if (!isMatch) return false;

                        // 1. Check startDate (เข้าทำงานเมื่อไหร่)
                        if (e.startDate) {
                          const empStartMonth = e.startDate.substring(0, 7);
                          if (empStartMonth > mKey) return false; // ยังไม่เข้าทำงานในเดือนนี้
                        }

                        // 2. Check resignationDate / status (ลาออกเมื่อไหร่)
                        const isResigned = e.employmentStatus === "Resigned" || e.employmentStatus === "Inactive" || e.employmentStatus === "Retired" || e.employmentStatus === "ลาออก" || e.employmentStatus === "เกษียณ" || e.employmentStatus === "พ้นสภาพ";
                        if (isResigned) {
                          if (e.resignationDate) {
                            const empResignMonth = e.resignationDate.substring(0, 7);
                            if (mKey > empResignMonth) return false; // ลาออกไปแล้วก่อนเดือนนี้
                          } else {
                            if (mKey >= (state?.shiftConfig?.currentMonth || "2026-08")) return false;
                          }
                        }

                        return true;
                      }).length;
                    };

                    // Compute raw counts for all 10 months
                    const rawMonthlyCounts = monthKeys.map(mKey => {
                      const c2 = getMonthlyDeptCount("inter2", mKey);
                      const c3 = getMonthlyDeptCount("inter3", mKey);
                      const c5 = getMonthlyDeptCount("inter5", mKey);
                      const c7 = getMonthlyDeptCount("inter7", mKey);
                      const ch = getMonthlyDeptCount("hvm", mKey);
                      const total = c2 + c3 + c5 + c7 + ch;
                      return { c2, c3, c5, c7, ch, total };
                    });

                    const maxTotalInYear = Math.max(80, ...rawMonthlyCounts.map(r => r.total));
                    const globalScale = 78 / maxTotalInYear;

                    const monthlyData = rawMonthlyCounts.map((r, idx) => {
                      const y1 = Math.round(100 - (r.c2 * globalScale));
                      const y2 = Math.round(100 - ((r.c2 + r.c3) * globalScale));
                      const y3 = Math.round(100 - ((r.c2 + r.c3 + r.c5) * globalScale));
                      const y4 = Math.round(100 - ((r.c2 + r.c3 + r.c5 + r.c7) * globalScale));
                      const y5 = Math.round(100 - (r.total * globalScale));

                      return { x: xCoords[idx], y1, y2, y3, y4, y5 };
                    });

                    // Build SVG polygon points
                    const buildPolygon = (topKey: 'y1'|'y2'|'y3'|'y4'|'y5', bottomKey?: 'y1'|'y2'|'y3'|'y4'|'y5') => {
                      const topPoints = monthlyData.map(d => `${d.x},${d[topKey]}`).join(' ');
                      let bottomPoints = '';
                      if (bottomKey) {
                        bottomPoints = [...monthlyData].reverse().map(d => `${d.x},${d[bottomKey]}`).join(' ');
                      } else {
                        bottomPoints = '100,100 0,100';
                      }
                      return `${topPoints} ${bottomPoints}`;
                    };

                    const polyLayer5 = buildPolygon('y5'); // HVM
                    const polyLayer4 = buildPolygon('y4'); // INTER 7
                    const polyLayer3 = buildPolygon('y3'); // INTER 5
                    const polyLayer2 = buildPolygon('y2'); // INTER 3
                    const polyLayer1 = buildPolygon('y1'); // INTER 2

                    const activeRatioPct = empsList.length > 0 ? Math.round((activeEmpsList.length / empsList.length) * 100) : 100;
                    const activeIconsCount = Math.min(10, Math.round((activeRatioPct / 100) * 10));

                    return (
                      <div className="lg:col-span-2 space-y-6 flex flex-col justify-between">
                        
                        {/* Top Panel: DASHBOARD BY SECTION Dynamic Stacked Area Chart */}
                        <div className="bg-white border border-slate-200/80 rounded-3xl p-4 sm:p-6 shadow-sm flex-1 flex flex-col justify-between">
                          <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
                            <div>
                              <h3 className="text-xs font-black text-slate-800 tracking-wider uppercase">DASHBOARD BY SECTION</h3>
                              <p className="text-[10px] text-slate-400 font-medium mt-0.5">จำนวนพนักงานแยกตามแผนก Jan - Oct</p>
                            </div>
                            
                            {/* Section Legend Pills with Real Live Headcounts */}
                            <div className="flex items-center gap-2 text-xs font-bold overflow-x-auto no-scrollbar touch-pan-x py-1 max-w-full">
                              <div className="shrink-0 whitespace-nowrap flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200/80">
                                <span className="w-2.5 h-2.5 rounded-full bg-[#2563eb]"></span>
                                <span className="text-slate-700">INTER 2 ({countInter2} คน)</span>
                              </div>
                              <div className="shrink-0 whitespace-nowrap flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200/80">
                                <span className="w-2.5 h-2.5 rounded-full bg-[#059669]"></span>
                                <span className="text-slate-700">INTER 3 ({countInter3} คน)</span>
                              </div>
                              <div className="shrink-0 whitespace-nowrap flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200/80">
                                <span className="w-2.5 h-2.5 rounded-full bg-[#6366f1]"></span>
                                <span className="text-slate-700">INTER 5 ({countInter5} คน)</span>
                              </div>
                              <div className="shrink-0 whitespace-nowrap flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200/80">
                                <span className="w-2.5 h-2.5 rounded-full bg-[#d97706]"></span>
                                <span className="text-slate-700">INTER 7 ({countInter7} คน)</span>
                              </div>
                              <div className="shrink-0 whitespace-nowrap flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200/80">
                                <span className="w-2.5 h-2.5 rounded-full bg-[#0284c7]"></span>
                                <span className="text-slate-700">HVM ({countHvm} คน)</span>
                              </div>
                            </div>
                          </div>

                          {/* SVG Stacked Area Chart */}
                          <div className="h-48 relative pt-4 flex flex-col justify-between border-t border-slate-100">
                            
                            {/* Y-Axis Labels */}
                            <div className="absolute left-0 top-2 bottom-6 flex flex-col justify-between text-[10px] font-bold text-slate-400 pointer-events-none">
                              <span>80</span>
                              <span>60</span>
                              <span>40</span>
                              <span>20</span>
                              <span>0</span>
                            </div>

                            {/* Grid Lines */}
                            <div className="absolute left-7 right-0 top-2 bottom-6 flex flex-col justify-between pointer-events-none">
                              <div className="w-full h-px bg-slate-100"></div>
                              <div className="w-full h-px bg-slate-100"></div>
                              <div className="w-full h-px bg-slate-100"></div>
                              <div className="w-full h-px bg-slate-100"></div>
                              <div className="w-full h-px bg-slate-200"></div>
                            </div>

                            {/* Area Chart SVG Stacked Layers (Dynamic Polygons) */}
                            <div className="pl-8 h-full w-full relative">
                              <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                                {/* Layer 5: HVM (Sky Blue) */}
                                <polygon points={polyLayer5} fill="#0284c7" opacity="0.35" />
                                {/* Layer 4: INTER 7 (Amber Gold) */}
                                <polygon points={polyLayer4} fill="#d97706" opacity="0.4" />
                                {/* Layer 3: INTER 5 (Indigo Purple) */}
                                <polygon points={polyLayer3} fill="#6366f1" opacity="0.5" />
                                {/* Layer 2: INTER 3 (Emerald Green) */}
                                <polygon points={polyLayer2} fill="#059669" opacity="0.6" />
                                {/* Layer 1: INTER 2 (Royal Blue) */}
                                <polygon points={polyLayer1} fill="#2563eb" opacity="0.8" />
                              </svg>
                            </div>

                            {/* X-Axis Month Labels */}
                            <div className="pl-8 flex justify-between text-[11px] font-bold text-slate-500 pt-2 border-t border-slate-100">
                              {monthNames.map(m => (
                                <span key={m}>{m}</span>
                              ))}
                            </div>

                          </div>
                        </div>

                        {/* Bottom Panel: Organization Chart People Silhouettes Bar */}
                        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm flex flex-wrap items-center justify-between gap-4 font-sans">
                          
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
                              <Globe className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h4 className="text-sm font-extrabold text-slate-800">Organization chart</h4>
                              <p className="text-[10px] text-slate-500 font-medium">สัดส่วนพนักงานปฏิบัติงานปัจจุบัน</p>
                            </div>
                          </div>

                          {/* 10 People Icon Silhouettes */}
                          <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-200/80">
                            {Array.from({ length: 10 }).map((_, idx) => (
                              <Users 
                                key={idx} 
                                className={`w-5 h-5 ${idx < activeIconsCount ? "text-blue-600" : "text-slate-300"}`} 
                              />
                            ))}
                          </div>

                          {/* Percent badge */}
                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-black text-blue-600">{activeRatioPct}%</span>
                            <span className="text-xs font-bold text-slate-500">({activeEmpsList.length} จาก {empsList.length} คน)</span>
                          </div>

                        </div>

                      </div>
                    );
                  })()}

                </div>
              </div>

              {/* Header block with employee database controls */}
              <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-800">ฐานข้อมูลและชั่วโมงการทำงานสะสมของพนักงาน</h3>
                  <p className="text-xs text-slate-500 mt-1">ตรวจสอบ ประเมินความเหนื่อยล้า และบริหารจัดการเป้าหมายชั่วโมงโอทีประจำเดือน</p>
                </div>
                <div className="flex flex-wrap items-center gap-2.5">
                  {(currentUser?.canBackup === 1 || ["HR", "HR Section Manager", "ผู้ดูแลระบบ"].includes(currentUser?.role || "")) && (
                    <>
                      {/* Export Button */}
                      <button 
                        onClick={handleExportEmployees}
                        className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer min-h-[40px]"
                        title="ส่งออกฐานข้อมูลรายชื่อพนักงานทั้งหมดเป็นไฟล์ CSV"
                      >
                        <Download className="w-3.5 h-3.5 text-blue-600" />
                        <span>ส่งออกข้อมูล (Export CSV)</span>
                      </button>

                      {/* Import Button */}
                      <label 
                        className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer min-h-[40px]"
                        title="นำเข้าไฟล์ CSV เพื่อปรับปรุงฐานข้อมูลพนักงาน"
                      >
                        <Upload className="w-3.5 h-3.5 text-indigo-600" />
                        <span>นำเข้าข้อมูล (Import CSV)</span>
                        <input 
                          type="file"
                          accept=".csv"
                          onChange={handleImportEmployees}
                          className="hidden"
                        />
                      </label>

                      {/* CSV Template Hub */}
                      <button
                        type="button"
                        onClick={() => setIsCsvTemplateHubOpen(true)}
                        className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold transition-colors cursor-pointer border border-blue-200 min-h-[40px]"
                        title="ดาวน์โหลดไฟล์แม่แบบ CSV ทุกประเภท"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
                        <span>แม่แบบ CSV</span>
                      </button>
                    </>
                  )}
                  
                  {isHrOrFullAccess && (
                    <button 
                      onClick={handleOpenAddEmployeeModal}
                      className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm cursor-pointer min-h-[40px]"
                    >
                      <Plus className="w-4 h-4" />
                      <span>เพิ่มพนักงานใหม่</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Status Tabs: Active Employees vs Resigned Archive (HR Only) */}
              <div className="flex items-center gap-2 border-b border-slate-200 px-2 overflow-x-auto no-scrollbar touch-pan-x">
                <button
                  onClick={() => setSelectedEmpStatusTab("Active")}
                  className={`shrink-0 whitespace-nowrap flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-t-2xl text-xs font-extrabold border-b-2 transition-all cursor-pointer ${
                    selectedEmpStatusTab === "Active"
                      ? "border-blue-600 text-blue-600 bg-white shadow-sm"
                      : "border-transparent text-slate-500 hover:text-slate-800 bg-slate-100/50"
                  }`}
                >
                  <span>พนักงานปัจจุบัน (Active)</span>
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">
                    {(state?.employees || []).filter(e => e.employmentStatus !== "Resigned" && e.employmentStatus !== "Inactive" && e.employmentStatus !== "Retired" && e.employmentStatus !== "ลาออก" && e.employmentStatus !== "เกษียณ" && e.employmentStatus !== "พ้นสภาพ").length} คน
                  </span>
                </button>

                {isHrOrFullAccess && (
                  <button
                    onClick={() => setSelectedEmpStatusTab("Resigned")}
                    className={`shrink-0 whitespace-nowrap flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-t-2xl text-xs font-extrabold border-b-2 transition-all cursor-pointer ${
                      selectedEmpStatusTab === "Resigned"
                        ? "border-rose-600 text-rose-600 bg-white shadow-sm"
                        : "border-transparent text-slate-500 hover:text-rose-700 bg-slate-100/50"
                    }`}
                  >
                    <span>คลังพนักงานลาออก / พ้นสภาพ / เกษียณ</span>
                    <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold">
                      {(state?.employees || []).filter(e => e.employmentStatus === "Resigned" || e.employmentStatus === "Inactive" || e.employmentStatus === "Retired" || e.employmentStatus === "ลาออก" || e.employmentStatus === "เกษียณ" || e.employmentStatus === "พ้นสภาพ").length} คน
                    </span>
                  </button>
                )}
              </div>

              {/* Employee roster list */}
              <div id="employee-roster-section"></div>
              <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                <div className="p-4 sm:p-6 border-b border-slate-100 space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <h4 className="text-sm font-bold text-slate-800">รายชื่อบุคลากรที่อยู่ภายใต้การวิเคราะห์ (Roster List)</h4>
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold">
                          แสดง {filteredEmployees.length} จาก {(state?.employees || []).filter(e => selectedEmpStatusTab === "Resigned" ? (e.employmentStatus === "Resigned" || e.employmentStatus === "Inactive" || e.employmentStatus === "ลาออก") : (e.employmentStatus !== "Resigned" && e.employmentStatus !== "Inactive" && e.employmentStatus !== "ลาออก")).length} คน
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">ใช้ตัวกรองด้านล่างเพื่อค้นหา คัดกรองตามแผนก ฝ่าย หรือตำแหน่ง และคลิกที่หัวตารางเพื่อเรียงลำดับ</p>
                    </div>

                    {(empSearchQuery || empDeptFilter !== "ทุกแผนก" || empDivisionFilter !== "ทุกฝ่าย" || empRoleFilter !== "ทุกตำแหน่ง" || searchQuery) && (
                      <button
                        type="button"
                        onClick={() => {
                          setEmpSearchQuery("");
                          setEmpDeptFilter("ทุกแผนก");
                          setEmpDivisionFilter("ทุกฝ่าย");
                          setEmpRoleFilter("ทุกตำแหน่ง");
                          setSearchQuery("");
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl text-xs font-bold transition-all border border-rose-200 cursor-pointer self-start md:self-auto min-h-[36px]"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>ล้างตัวกรองทั้งหมด</span>
                      </button>
                    )}
                  </div>

                  {/* Filter Toolbar Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 pt-1">
                    {/* 1. Quick Search Box */}
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={empSearchQuery}
                        onChange={(e) => setEmpSearchQuery(e.target.value)}
                        placeholder="ค้นหารหัส, ชื่อ-นามสกุล..."
                        className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                      />
                      {empSearchQuery && (
                        <button 
                          type="button"
                          onClick={() => setEmpSearchQuery("")}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* 2. Department Dropdown */}
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <select
                        value={empDeptFilter}
                        onChange={(e) => setEmpDeptFilter(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer appearance-none"
                      >
                        <option value="ทุกแผนก">แผนกทั้งหมด (ทุกแผนก)</option>
                        {uniqueRosterDepts.map(d => (
                          <option key={d} value={d}>แผนก {d}</option>
                        ))}
                      </select>
                    </div>

                    {/* 3. Division Dropdown */}
                    <div className="relative">
                      <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <select
                        value={empDivisionFilter}
                        onChange={(e) => setEmpDivisionFilter(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer appearance-none"
                      >
                        <option value="ทุกฝ่าย">💼 ฝ่ายทั้งหมด (ทุกฝ่าย)</option>
                        {uniqueRosterDivisions.map(div => (
                          <option key={div} value={div}>ฝ่าย {div}</option>
                        ))}
                      </select>
                    </div>

                    {/* 4. Position / Role Dropdown */}
                    <div className="relative">
                      <UserCheck className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <select
                        value={empRoleFilter}
                        onChange={(e) => setEmpRoleFilter(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer appearance-none"
                      >
                        <option value="ทุกตำแหน่ง">👤 ตำแหน่งทั้งหมด (ทุกตำแหน่ง)</option>
                        {uniqueRosterRoles.map(role => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto no-scrollbar touch-pan-x w-full max-w-full min-w-0">
                  <table className="w-full text-left border-collapse min-w-[1000px]">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider select-none">
                        {/* 1. รหัสพนักงาน (Sticky Col 1: 0 - 90px) */}
                        <th 
                          onClick={() => handleRosterSort("id")}
                          className="sticky left-0 z-20 bg-slate-100 px-4 py-3.5 font-mono cursor-pointer hover:bg-slate-200 transition-colors whitespace-nowrap min-w-[90px] w-[90px]"
                          title="คลิกเพื่อเรียงตามรหัสพนักงาน"
                        >
                          <div className="flex items-center gap-1.5">
                            <span>รหัสพนักงาน</span>
                            {empSortField === "id" ? (
                              empSortOrder === "asc" ? <ArrowUp className="w-3 h-3 text-blue-600" /> : <ArrowDown className="w-3 h-3 text-blue-600" />
                            ) : (
                              <ArrowUpDown className="w-3 h-3 text-slate-400 hover:text-slate-600" />
                            )}
                          </div>
                        </th>

                        {/* 2. ชื่อ-นามสกุล (Sticky Col 2: 90px - 280px) */}
                        <th 
                          onClick={() => handleRosterSort("name")}
                          className="sticky left-[90px] z-20 bg-slate-100 px-4 py-3.5 cursor-pointer hover:bg-slate-200 transition-colors whitespace-nowrap min-w-[190px] w-[190px]"
                          title="คลิกเพื่อเรียงตามชื่อ-นามสกุล"
                        >
                          <div className="flex items-center gap-1.5">
                            <span>ชื่อ-นามสกุล</span>
                            {empSortField === "name" ? (
                              empSortOrder === "asc" ? <ArrowUp className="w-3 h-3 text-blue-600" /> : <ArrowDown className="w-3 h-3 text-blue-600" />
                            ) : (
                              <ArrowUpDown className="w-3 h-3 text-slate-400 hover:text-slate-600" />
                            )}
                          </div>
                        </th>

                        {/* 3. ตำแหน่ง (Sticky Col 3: 280px - 440px) */}
                        <th 
                          onClick={() => handleRosterSort("role")}
                          className="sticky left-[280px] z-20 bg-slate-100 px-4 py-3.5 cursor-pointer hover:bg-slate-200 transition-colors whitespace-nowrap min-w-[160px] w-[160px]"
                          title="คลิกเพื่อเรียงตามตำแหน่ง"
                        >
                          <div className="flex items-center gap-1.5">
                            <span>ตำแหน่ง</span>
                            {empSortField === "role" ? (
                              empSortOrder === "asc" ? <ArrowUp className="w-3 h-3 text-blue-600" /> : <ArrowDown className="w-3 h-3 text-blue-600" />
                            ) : (
                              <ArrowUpDown className="w-3 h-3 text-slate-400 hover:text-slate-600" />
                            )}
                          </div>
                        </th>

                        {/* 4. แผนก (Sticky Col 4: 440px - 550px) */}
                        <th 
                          onClick={() => handleRosterSort("dept")}
                          className="sticky left-[440px] z-20 bg-slate-100 px-4 py-3.5 cursor-pointer hover:bg-slate-200 transition-colors whitespace-nowrap min-w-[110px] w-[110px]"
                          title="คลิกเพื่อเรียงตามแผนก"
                        >
                          <div className="flex items-center gap-1.5">
                            <span>แผนก</span>
                            {empSortField === "dept" ? (
                              empSortOrder === "asc" ? <ArrowUp className="w-3 h-3 text-blue-600" /> : <ArrowDown className="w-3 h-3 text-blue-600" />
                            ) : (
                              <ArrowUpDown className="w-3 h-3 text-slate-400 hover:text-slate-600" />
                            )}
                          </div>
                        </th>

                        {/* 5. ฝ่าย (Sticky Col 5: 550px - 700px) — DIVIDER BORDER & SHADOW */}
                        <th 
                          onClick={() => handleRosterSort("division")}
                          className="sticky left-[550px] z-20 bg-slate-100 px-4 py-3.5 cursor-pointer hover:bg-slate-200 transition-colors whitespace-nowrap min-w-[150px] w-[150px] border-r-2 border-slate-300 shadow-[4px_0_6px_-2px_rgba(0,0,0,0.08)]"
                          title="คลิกเพื่อเรียงตามฝ่าย"
                        >
                          <div className="flex items-center gap-1.5">
                            <span>ฝ่าย</span>
                            {empSortField === "division" ? (
                              empSortOrder === "asc" ? <ArrowUp className="w-3 h-3 text-blue-600" /> : <ArrowDown className="w-3 h-3 text-blue-600" />
                            ) : (
                              <ArrowUpDown className="w-3 h-3 text-slate-400 hover:text-slate-600" />
                            )}
                          </div>
                        </th>
                        <th 
                          onClick={() => handleRosterSort("ot1_5")}
                          className="px-4 py-3.5 text-right text-blue-700 cursor-pointer hover:bg-slate-100 transition-colors"
                          title="คลิกเพื่อเรียงตาม OT วันทำงาน"
                        >
                          <div className="flex items-center justify-end gap-1.5">
                            <span>OT วันทำงาน (x1.5)</span>
                            {empSortField === "ot1_5" ? (
                              empSortOrder === "asc" ? <ArrowUp className="w-3 h-3 text-blue-600" /> : <ArrowDown className="w-3 h-3 text-blue-600" />
                            ) : (
                              <ArrowUpDown className="w-3 h-3 text-slate-300 hover:text-slate-500" />
                            )}
                          </div>
                        </th>
                        <th 
                          onClick={() => handleRosterSort("ot1_0")}
                          className="px-4 py-3.5 text-right text-amber-700 cursor-pointer hover:bg-slate-100 transition-colors"
                          title="คลิกเพื่อเรียงตาม OT ในวันหยุด x1"
                        >
                          <div className="flex items-center justify-end gap-1.5">
                            <span>OT ทำงานในวันหยุด (x1)</span>
                            {empSortField === "ot1_0" ? (
                              empSortOrder === "asc" ? <ArrowUp className="w-3 h-3 text-amber-600" /> : <ArrowDown className="w-3 h-3 text-amber-600" />
                            ) : (
                              <ArrowUpDown className="w-3 h-3 text-slate-300 hover:text-slate-500" />
                            )}
                          </div>
                        </th>
                        <th 
                          onClick={() => handleRosterSort("ot3_0")}
                          className="px-4 py-3.5 text-right text-red-700 cursor-pointer hover:bg-slate-100 transition-colors"
                          title="คลิกเพื่อเรียงตาม OT ในวันหยุด x3"
                        >
                          <div className="flex items-center justify-end gap-1.5">
                            <span>OT ในวันหยุด (x3)</span>
                            {empSortField === "ot3_0" ? (
                              empSortOrder === "asc" ? <ArrowUp className="w-3 h-3 text-red-600" /> : <ArrowDown className="w-3 h-3 text-red-600" />
                            ) : (
                              <ArrowUpDown className="w-3 h-3 text-slate-300 hover:text-slate-500" />
                            )}
                          </div>
                        </th>
                        <th 
                          onClick={() => handleRosterSort("totalOtPay")}
                          className="px-4 py-3.5 text-right text-slate-900 cursor-pointer hover:bg-slate-100 transition-colors"
                          title="คลิกเพื่อเรียงตามผลรวมค่าล่วงเวลา"
                        >
                          <div className="flex items-center justify-end gap-1.5">
                            <span>ผลรวมค่าล่วงเวลา</span>
                            {empSortField === "totalOtPay" ? (
                              empSortOrder === "asc" ? <ArrowUp className="w-3 h-3 text-slate-900" /> : <ArrowDown className="w-3 h-3 text-slate-900" />
                            ) : (
                              <ArrowUpDown className="w-3 h-3 text-slate-300 hover:text-slate-500" />
                            )}
                          </div>
                        </th>
                        <th 
                          onClick={() => handleRosterSort("otPctSalary")}
                          className="px-4 py-3.5 text-right text-purple-700 cursor-pointer hover:bg-slate-100 transition-colors"
                          title="คลิกเพื่อเรียงตาม % ค่าล่วงเวลา"
                        >
                          <div className="flex items-center justify-end gap-1.5">
                            <span>% ค่าล่วงเวลา (เทียบจากฐานเงินเดือน)</span>
                            {empSortField === "otPctSalary" ? (
                              empSortOrder === "asc" ? <ArrowUp className="w-3 h-3 text-purple-600" /> : <ArrowDown className="w-3 h-3 text-purple-600" />
                            ) : (
                              <ArrowUpDown className="w-3 h-3 text-slate-300 hover:text-slate-500" />
                            )}
                          </div>
                        </th>
                        <th className="px-4 py-3.5 text-center">การจัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
                      {(() => { let _lastDept = ''; return filteredEmployees.flatMap((emp) => {
                        // Calculate exact monthly OT metrics using single source of truth
                        const breakdown = getEmpMonthlyOtPayBreakdown(emp, state?.shiftConfig?.currentMonth);
                        const ot1_5 = breakdown.normalOt;
                        const ot1_0 = breakdown.holidayWorkDays * 8;
                        const ot3_0 = breakdown.holidayOt;
                        const totalOtPay = breakdown.totalOtPay;
                        const otPctSalary = Number(breakdown.otPctSalary) || 0;
                        const _deptLabel = getDeptName(emp.deptId, state.departments);
                        const _rows: React.ReactNode[] = [];
                        if (_deptLabel !== _lastDept) {
                          const _cnt = filteredEmployees.filter(e => getDeptName(e.deptId, state.departments) === _deptLabel).length;
                          _rows.push(
                            <tr key={'grp-' + _deptLabel} className="bg-slate-50 border-t-2 border-slate-200">
                              <td colSpan={11} className="px-4 py-2">
                                <div className="flex items-center gap-2.5">
                                  <span className="w-2 h-2 rounded-full bg-blue-600 inline-block flex-shrink-0"></span>
                                  <span className="text-[11px] font-black text-slate-700 uppercase tracking-wider">{_deptLabel}</span>
                                  <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold border border-blue-200">{_cnt} คน</span>
                                </div>
                              </td>
                            </tr>
                          );
                          _lastDept = _deptLabel;
                        }
                        _rows.push(
                          <tr key={emp.id} className="group hover:bg-blue-50/40 transition-colors bg-white">
                            {/* 1. รหัสพนักงาน (Sticky Col 1: 0 - 90px) */}
                            <td className="sticky left-0 z-10 bg-white group-hover:bg-blue-50/70 px-4 py-3.5 font-mono font-bold text-slate-500 whitespace-nowrap min-w-[90px] w-[90px]">
                              {emp.id}
                            </td>

                            {/* 2. ชื่อ-นามสกุล (Sticky Col 2: 90px - 280px) */}
                            <td className="sticky left-[90px] z-10 bg-white group-hover:bg-blue-50/70 px-4 py-3.5 font-bold text-slate-800 cursor-pointer hover:text-blue-600 transition-colors whitespace-nowrap min-w-[190px] w-[190px]" onClick={() => setViewingEmployeeDetails(emp)}>
                              <div className="flex items-center gap-2.5">
                                <EmployeeAvatar empId={emp.id} empName={emp.name} className="w-8 h-8 flex-shrink-0" />
                                <span className="whitespace-nowrap font-extrabold">{emp.name}</span>
                              </div>
                            </td>

                            {/* 3. ตำแหน่ง (Sticky Col 3: 280px - 440px) */}
                            <td className="sticky left-[280px] z-10 bg-white group-hover:bg-blue-50/70 px-4 py-3.5 font-medium text-slate-700 whitespace-nowrap min-w-[160px] w-[160px]">
                              {emp.role}
                            </td>

                            {/* 4. แผนก (Sticky Col 4: 440px - 550px) */}
                            <td className="sticky left-[440px] z-10 bg-white group-hover:bg-blue-50/70 px-4 py-3.5 font-bold text-slate-700 whitespace-nowrap min-w-[110px] w-[110px]">
                              {getDeptName(emp.deptId, state.departments)}
                            </td>

                            {/* 5. ฝ่าย (Sticky Col 5: 550px - 700px) — DIVIDER BORDER & SHADOW */}
                            <td className="sticky left-[550px] z-10 bg-white group-hover:bg-blue-50/70 px-4 py-3.5 text-slate-600 font-medium whitespace-nowrap min-w-[150px] w-[150px] border-r-2 border-slate-300 shadow-[4px_0_6px_-2px_rgba(0,0,0,0.08)]">
                              {emp.division || emp.groupName || "-"}
                            </td>
                            {/* 6. OT วันทำงาน (x1.5) */}
                            <td className="px-4 py-3.5 text-right font-extrabold text-blue-700 font-mono">
                              {ot1_5} ชม.
                            </td>
                            {/* 7. OT ทำงานในวันหยุด (x1) */}
                            <td className="px-4 py-3.5 text-right font-bold text-amber-700 font-mono">
                              {ot1_0} ชม.
                            </td>
                            {/* 8. OT ในวันหยุด (x3) */}
                            <td className="px-4 py-3.5 text-right font-bold text-red-700 font-mono">
                              {ot3_0} ชม.
                            </td>
                            {/* 9. ผลรวมค่าล่วงเวลา */}
                            <td className="px-4 py-3.5 text-right font-black text-slate-900 font-mono">
                              {totalOtPay.toLocaleString()}
                            </td>
                            {/* 10. % ค่าล่วงเวลา (เทียบจากฐานเงินเดือน) */}
                            <td className="px-4 py-3.5 text-right font-black font-mono">
                              <span className={`px-2 py-1 rounded-lg ${otPctSalary > 30 ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-purple-50 text-purple-700 border border-purple-200'}`}>
                                {otPctSalary}%
                              </span>
                            </td>
                            {/* 11. การจัดการ */}
                            <td className="px-4 py-3.5 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => setViewingEmployeeDetails(emp)}
                                  className="p-1.5 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all cursor-pointer"
                                  title="ดูรายละเอียดพนักงาน"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                  </svg>
                                </button>
                                {["HR", "HR Section Manager", "ผู้ดูแลระบบ", "Admin"].includes(currentUser?.role || "") && (
                                  <button
                                    type="button"
                                    onClick={() => startEditEmployee(emp)}
                                    className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all cursor-pointer"
                                    title="แก้ไขข้อมูลพนักงาน"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                                    </svg>
                                  </button>
                                )}
                                {["HR", "HR Section Manager", "ผู้ดูแลระบบ"].includes(currentUser?.role || "") && (
                                  <button
                                    type="button"
                          onClick={() => handleDeleteEmployee(emp.id)}
                                    className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                                    title="ลบพนักงาน"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                    </svg>
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                        return _rows;
                      }); })()}

                      {filteredEmployees.length === 0 && (
                        <tr>
                          <td colSpan={11} className="px-6 py-12 text-center text-slate-500">
                            <div className="flex flex-col items-center justify-center space-y-3">
                              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                <Search className="w-6 h-6" />
                              </div>
                              <p className="text-sm font-bold text-slate-700">ไม่พบข้อมูลพนักงานที่ตรงกับเงื่อนไขตัวกรอง</p>
                              <p className="text-xs text-slate-400">ลองปรับเปลี่ยนคำค้นหา หรือล้างตัวกรองเพื่อแสดงข้อมูลทั้งหมด</p>
                              <button
                                type="button"
                                onClick={() => {
                                  setEmpSearchQuery("");
                                  setEmpDeptFilter("ทุกแผนก");
                                  setEmpDivisionFilter("ทุกฝ่าย");
                                  setEmpRoleFilter("ทุกตำแหน่ง");
                                  setSearchQuery("");
                                }}
                                className="px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl text-xs font-bold transition-all border border-blue-200 cursor-pointer"
                              >
                                ล้างตัวกรอง
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ======================================= */}
          {/* VIEW: SHIFT MANAGEMENT */}
          {/* ======================================= */}
          {activeTab === "shifts" && (
            <div className={`w-full max-w-full min-w-0 space-y-4 ${isFullScreen ? "fixed inset-0 z-50 bg-white overflow-auto p-2 sm:p-4" : ""}`}>

              {/* HEADER TOOLBAR — Clean Minimalist High-Contrast Style */}
              <div className="rounded-3xl overflow-hidden shadow-sm border border-slate-200/80 bg-white font-sans">
                {/* Top Row: Department info & View mode / Actions (Equal Height & Perfectly Balanced Centerline) */}
                <div className="bg-white px-3 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 sm:gap-4 border-b border-slate-100 min-h-[56px]">
                  <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
                    {/* Department */}
                    <div className="flex items-center gap-2.5 px-3.5 py-1.5 bg-slate-50 border border-slate-200/80 rounded-2xl h-10 shadow-2xs">
                      <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                        <Building2 className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex flex-col justify-center">
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider leading-tight">แผนก</span>
                        <span className="text-slate-900 text-xs font-black leading-tight">{currentDeptObj?.nameTh || currentDeptObj?.name || currentShiftsDept}</span>
                      </div>
                    </div>
                    
                    {/* Worker count box */}
                    <div className="flex items-center gap-2.5 px-3.5 py-1.5 bg-slate-50 border border-slate-200/80 rounded-2xl h-10 shadow-2xs">
                      <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                        <Users className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex flex-col justify-center">
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider leading-tight">กำลังพล</span>
                        <div className="flex items-center gap-1 leading-tight">
                          <span className="bg-blue-600 text-white px-1.5 py-0.5 rounded font-mono font-bold text-[10px]">
                            {(isEditingShifts ? tempEmployees : state?.employees || []).filter(e => e.deptId === currentShiftsDept && e.employmentStatus !== "Resigned" && e.employmentStatus !== "ลาออก").length}
                          </span>
                          <span className="text-slate-500 font-mono text-[11px] font-semibold">/ {(state?.employees || []).filter(e => e.deptId === currentShiftsDept).length} คน</span>
                        </div>
                      </div>
                    </div>

                    {/* Department Planner / Manager */}
                    <div className="flex items-center gap-2.5 px-3.5 py-1.5 bg-slate-50 border border-slate-200/80 rounded-2xl h-10 shadow-2xs">
                      <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <UserCheck className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex flex-col justify-center">
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider leading-tight">ผู้จัดแผนงาน</span>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 leading-tight">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                          <span className="truncate max-w-[140px]">{deptManagerText || "คุณสันทัด คุ้มค่า"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Period Month */}
                    <div className="flex items-center gap-2.5 px-3.5 py-1.5 bg-slate-50 border border-slate-200/80 rounded-2xl h-10 shadow-2xs">
                      <div className="w-6 h-6 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center shrink-0">
                        <Calendar className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex flex-col justify-center">
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider leading-tight">รอบเดือน</span>
                        <span className="text-slate-800 text-xs font-black leading-tight">
                          {(() => {
                            const [y, m] = (state?.shiftConfig?.currentMonth || "2026-08").split("-");
                            const mn = ["","ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
                            return `${mn[Number(m)]} ${Number(y)+543}`;
                          })()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Top Right: Toggle & CTA Buttons (Matching h-10 Height Exactly) */}
                  <div className="flex items-center gap-2.5 flex-wrap">
                    {/* Toggle [ Plan / Actual / Plan+Actual ] */}
                    <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold h-10 items-center shadow-inner overflow-x-auto no-scrollbar touch-pan-x">
                      {(["plan", "actual", "both"] as const).map(mode => (
                        <button key={mode} onClick={() => setShiftViewMode(mode)}
                          className={`shrink-0 px-3.5 py-1 rounded-xl transition-all cursor-pointer h-full flex items-center ${shiftViewMode === mode ? "bg-blue-600 text-white shadow-xs font-black" : "text-slate-600 hover:text-slate-900"}`}>
                          {mode === "plan" ? "Plan" : mode === "actual" ? "Actual" : "Plan+Actual"}
                        </button>
                      ))}
                    </div>

                    {isEditingShifts ? (
                      <div className="flex items-center gap-2 h-10">
                        <button onClick={() => { setIsEditingShifts(false); setTempEmployees(state?.employees || []); }}
                          className="h-10 px-4 bg-slate-100 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer font-sans flex items-center">ยกเลิก</button>
                        <button onClick={handleSaveShifts}
                          className="h-10 px-4 bg-blue-600 text-white rounded-2xl text-xs font-black hover:bg-blue-700 transition-colors shadow-xs cursor-pointer font-sans flex items-center">
                          บันทึก {shiftEditTarget === "plan" ? "Plan" : "Actual"}
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 h-10">
                        <button 
                          onClick={handleExportShiftsCsv}
                          className="h-10 px-3.5 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-2xl text-xs font-black hover:bg-emerald-100 flex items-center gap-1.5 cursor-pointer font-sans shadow-2xs transition-all hover:scale-105 active:scale-95"
                          title="ส่งออกไฟล์สรุปยอดทำจ่ายค่าล่วงเวลา (OT Payroll-Ready CSV) ประจำเดือน"
                        >
                          <FileText className="w-4 h-4 text-emerald-700" />
                          <span>CSV ทำจ่าย OT</span>
                        </button>
                        
                        <button onClick={() => setShowVesselModal(true)}
                          className="h-10 px-3.5 bg-amber-600 text-white rounded-2xl text-xs font-black hover:bg-amber-700 cursor-pointer font-sans shadow-2xs flex items-center gap-1.5 transition-all hover:bg-amber-500">
                          <Ship className="w-4 h-4 text-white" />
                          <span>ตารางเรือ/เครน</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Sub-toolbar: Filters & selects (High Contrast Minimal Style) */}
                <div className="bg-slate-50/90 px-3 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80">
                  <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar touch-pan-x py-1 max-w-full">
                    {activeDeptId === "all" && (
                      <select value={currentShiftsDept} onChange={(e) => setShiftsDeptFilter(e.target.value)}
                        className="shrink-0 h-8.5 px-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer font-sans shadow-2xs hover:border-slate-300 transition-colors">
                        <option value="inter2">INTER 2</option>
                        <option value="inter3">INTER 3</option>
                        <option value="inter5">INTER 5</option>
                        <option value="inter7">INTER 7</option>
                        <option value="heavy">Heavy Machine</option>
                        <option value="ecc">ECC</option>
                      </select>
                    )}
                    <select value={(state?.shiftConfig?.currentMonth || "2026-08").split("-")[0]} 
                      onChange={(e) => { const m2 = (state?.shiftConfig?.currentMonth || "2026-08").split("-")[1]; const nextM = `${e.target.value}-${m2}`; handleShiftConfigMonthChange(nextM); }}
                      className="shrink-0 h-8.5 px-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer font-sans shadow-2xs hover:border-slate-300 transition-colors">
                      {[2024,2025,2026,2027].map(y => <option key={y} value={String(y)}>ปี {y}</option>)}
                    </select>
                    <select value={(state?.shiftConfig?.currentMonth || "2026-08").split("-")[1]} 
                      onChange={(e) => { const y2 = (state?.shiftConfig?.currentMonth || "2026-08").split("-")[0]; const nextM = `${y2}-${e.target.value}`; handleShiftConfigMonthChange(nextM); }}
                      className="shrink-0 h-8.5 px-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer font-sans shadow-2xs hover:border-slate-300 transition-colors">
                      {[["01","มกราคม"],["02","กุมภาพันธ์"],["03","มีนาคม"],["04","เมษายน"],["05","พฤษภาคม"],["06","มิถุนายน"],["07","กรกฎาคม"],["08","สิงหาคม"],["09","กันยายน"],["10","ตุลาคม"],["11","พฤศจิกายน"],["12","ธันวาคม"]].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                    <select value={selectedWeek} onChange={(e) => { const val = e.target.value; setSelectedWeek(val); setDaysLimit(val === "all" ? 30 : 7); }}
                      className="shrink-0 h-8.5 px-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer font-sans shadow-2xs hover:border-slate-300 transition-colors">
                      <option value="all">ทั้งเดือน</option>
                      {weeksList.map((w) => <option key={w.weekNum} value={String(w.weekNum)}>สัปดาห์ {w.weekNum} ({w.startDay}-{w.endDay})</option>)}
                    </select>

                    {/* Multi-select Role Filter */}
                    <div className="relative shrink-0">
                      <button
                        type="button"
                        onClick={() => setIsRoleFilterOpen(!isRoleFilterOpen)}
                        className="h-8.5 px-3 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-bold text-slate-700 focus:outline-none cursor-pointer font-sans flex items-center gap-1.5 shadow-2xs transition-colors"
                      >
                        <span className="truncate max-w-[140px]">
                          {selectedShiftRoleFilters.length === 0 || selectedShiftRoleFilters.includes("ทุกตำแหน่ง")
                            ? "ทุกตำแหน่ง"
                            : selectedShiftRoleFilters.length === 1
                            ? selectedShiftRoleFilters[0]
                            : `เลือก ${selectedShiftRoleFilters.length} ตำแหน่ง`}
                        </span>
                        <svg className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isRoleFilterOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {isRoleFilterOpen && (
                        <>
                          <div 
                            className="fixed inset-0 z-40" 
                            onClick={() => setIsRoleFilterOpen(false)}
                          />
                          <div className="absolute top-full left-0 mt-1.5 z-50 bg-white border border-slate-200 rounded-2xl shadow-xl p-2.5 w-64 max-h-72 overflow-y-auto font-sans flex flex-col gap-1 text-slate-700">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-2 px-1 mb-1">
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">กรองตำแหน่ง</span>
                              <button
                                type="button"
                                onClick={() => setSelectedShiftRoleFilters([])}
                                className="text-[10px] text-blue-600 hover:text-blue-700 font-bold cursor-pointer"
                              >
                                ล้างทั้งหมด
                              </button>
                            </div>

                            <label 
                              className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-slate-50 cursor-pointer text-xs font-semibold select-none transition-colors"
                            >
                              <input
                                type="checkbox"
                                checked={selectedShiftRoleFilters.length === 0 || selectedShiftRoleFilters.includes("ทุกตำแหน่ง")}
                                onChange={() => setSelectedShiftRoleFilters([])}
                                className="rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer w-3.5 h-3.5"
                              />
                              <span>ทุกตำแหน่ง</span>
                            </label>

                            <div className="h-px bg-slate-100 my-0.5" />

                            {Array.from(new Set((state?.employees || []).map(e => e.role || "Operator"))).map((role) => {
                              const isChecked = selectedShiftRoleFilters.includes(role);
                              return (
                                <label
                                  key={role}
                                  className={`flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-slate-50 cursor-pointer text-xs select-none transition-colors ${isChecked ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600 font-medium'}`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => {
                                      let next: string[];
                                      if (isChecked) {
                                        next = selectedShiftRoleFilters.filter(r => r !== role);
                                      } else {
                                        next = [...selectedShiftRoleFilters.filter(r => r !== "ทุกตำแหน่ง"), role];
                                      }
                                      setSelectedShiftRoleFilters(next);
                                    }}
                                    className="rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer w-3.5 h-3.5"
                                  />
                                  <span className="truncate">{role}</span>
                                </label>
                              );
                            })}
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions in row 2: Legend & Fullscreen */}
                  <div className="flex items-center gap-2">
                    <button onClick={() => setShowShiftLegend(!showShiftLegend)} 
                      className={`h-8.5 px-3 border rounded-xl text-xs font-bold transition-all cursor-pointer font-sans flex items-center gap-1.5 shadow-2xs ${
                        showShiftLegend 
                          ? "bg-blue-50 border-blue-200 text-blue-700" 
                          : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                      }`}>
                      <Info className="w-3.5 h-3.5" />
                      <span>{showShiftLegend ? "ซ่อนรหัสกะ" : "แสดงรหัสกะ"}</span>
                    </button>
                    <button onClick={() => setIsFullScreen(!isFullScreen)} 
                      className={`h-8.5 px-3 border rounded-xl text-xs font-bold transition-all cursor-pointer font-sans flex items-center gap-1.5 shadow-2xs ${
                        isFullScreen 
                          ? "bg-blue-50 border-blue-200 text-blue-700" 
                          : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                      }`}>
                      {isFullScreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
                      <span>{isFullScreen ? "ออกเต็มจอ" : "เต็มจอ"}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Shift Legend / Keys explanation matching image exactly */}
              {showShiftLegend && (
                <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-6 shadow-sm font-sans">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-pulse"></span>
                      <span>สัญลักษณ์รหัสกะและตารางการจัดการ</span>
                    </h4>
                  </div>

                  <div className="overflow-x-auto no-scrollbar touch-pan-x pb-2">
                    <div className="flex gap-2.5 min-w-[900px] select-none">
                      {[
                        { top: "กะเช้า", sub: "8 ชม.", code: "M8", style: "bg-[#dce6f1] text-black border-[#b4c6e7]" },
                        { top: "กะบ่าย", sub: "8 ชม.", code: "A8", style: "bg-[#fff2cc] text-black border-[#ffd966]" },
                        { top: "กะดึก", sub: "8 ชม.", code: "N8", style: "bg-[#fce4d6] text-black border-[#f8cbad]" },
                        { top: "กะเช้า8", sub: "OT 4", code: "M12", style: "bg-[#ddebf7] text-[#4472c4] border-[#9cc2e5]" },
                        { top: "กะบ่าย8", sub: "OT 4", code: "A12", style: "bg-[#fff2cc] text-black border-[#ffd966]" },
                        { top: "กะดึก8", sub: "OT 4", code: "N12", style: "bg-[#fce4d6] text-[#ff0000] border-[#f8cbad]" },
                        { top: "กะเช้า8", sub: "OT 8", code: "M16", style: "bg-[#1f4e79] text-white border-[#1f4e79]" },
                        { top: "กะดึก8", sub: "OT 8", code: "N16", style: "bg-[#ff0000] text-white border-[#ff0000]" },
                        { top: "ทอดสมอ", sub: "standby", code: "D", style: "bg-[#aeaaaa] text-slate-800 border-[#7f7f7f]" },
                        { top: "ON", sub: "DUTY", code: "OND", style: "bg-[#00ffff] text-black border-[#00ffff]" },
                        { top: "วันหยุด", sub: "OFF", code: "O", style: "bg-white text-slate-400 border-slate-200" }
                      ].map((item, idx) => (
                        <div key={idx} className="flex-1 flex flex-col items-center">
                          <div className="text-center text-[11px] font-bold text-slate-700 h-9 flex flex-col justify-end pb-1.5 leading-tight">
                            <div>{item.top}</div>
                            <div className="text-[10px] text-slate-500 font-medium">{item.sub}</div>
                          </div>
                          <div className={`w-full py-2.5 text-center font-extrabold text-xs border rounded-lg shadow-sm ${item.style}`}>
                            {item.code}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Mismatch info bar */}
              {(() => {
                const deptEmpsForMismatch = (isEditingShifts ? tempEmployees : state?.employees || [])
                  .filter(emp => emp.deptId === currentShiftsDept && emp.employmentStatus !== "Resigned" && emp.employmentStatus !== "ลาออก");
                
                const hasMismatch = deptEmpsForMismatch.some(emp => {
                  const actuals = getEmpShiftsArray(emp.shifts, state?.shiftConfig?.currentMonth);
                  const plans = getEmpPlanShiftsArray(emp, state?.shiftConfig?.currentMonth);
                  return currentDays.some(day => {
                    const dayIdx = day.n - 1;
                    return isPlanActualMismatch(plans[dayIdx], actuals[dayIdx]);
                  });
                });

                if (shiftViewMode === "both" && hasMismatch && !mismatchAlertDismissed) {
                  return (
                    <div className="flex flex-wrap items-center gap-4 px-5 py-2.5 bg-red-50 border border-red-200 rounded-2xl text-xs font-sans animate-in slide-in-from-top-2 duration-200">
                      <span className="font-black text-red-700 bg-red-100 px-2 py-0.5 rounded-lg border border-red-200">Plan != Actual</span>
                      <span className="text-red-600 font-bold">เซลล์ขอบแดง = พนักงานเข้ากะไม่ตรงกับที่วางล่วงหน้า</span>
                      <div className="flex items-center gap-1.5 ml-2">
                        <div className="w-10 h-5 bg-[#dce6f1] border-2 border-red-500 rounded text-[8px] flex items-center justify-center font-black text-blue-800">M8</div>
                        <span className="text-slate-500 text-[10px]">= Plan M8, Actual ต่างออกไป</span>
                      </div>
                      <div className="flex gap-2 text-[9px] font-bold">
                        <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded border border-blue-200">P = แถว Plan</span>
                        <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded border border-orange-200">A = แถว Actual</span>
                      </div>
                      
                      <button 
                        onClick={() => setMismatchAlertDismissed(true)} 
                        className="ml-auto text-red-600 hover:text-red-800 text-[11px] font-black cursor-pointer bg-red-100/50 hover:bg-red-100 border border-red-300 px-2.5 py-1 rounded-xl transition-all select-none"
                      >
                        ✕ ปิดแจ้งเตือน
                      </button>
                    </div>
                  );
                }
                return null;
              })()}

              {/* Master Calendar Grid Canvas */}
              <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto no-scrollbar touch-pan-x w-full max-w-full min-w-0">
                  <div className="inline-block min-w-full">
                    
                    {/* Header: Days labels */}
                    <div className="flex bg-slate-50 border-b border-slate-200">
                      <div className="w-56 flex-shrink-0 p-4 border-r border-slate-200 font-bold text-slate-500 text-xs uppercase">
                        พนักงานสังกัด / รายชื่อ
                      </div>
                      
                      {/* Generative Days loop */}
                      <div className="flex">
                        {currentDays.map((day, dIdx) => (
                          <div 
                            key={dIdx} 
                            style={{ width: daysLimit === 30 ? "35px" : daysLimit === 14 ? "48px" : "56px" }}
                            className={`flex-shrink-0 p-1 text-center border-r border-slate-200 flex flex-col justify-center ${
                              day.weekend ? "bg-slate-100/50" : ""
                            }`}
                          >
                            <span className={`font-bold ${day.weekend ? "text-red-500" : "text-slate-400"} ${
                              daysLimit === 30 ? "text-[8px]" : "text-[10px]"
                            }`}>
                              {day.th}
                            </span>
                            <span className={`font-extrabold text-slate-800 font-mono ${
                              daysLimit === 30 ? "text-[10px]" : "text-xs"
                            }`}>{day.n}</span>
                          </div>
                        ))}
                      </div>

                      {/* Calendar Header End – plain column */}
                      <div className="flex-shrink-0 border-l border-slate-300 bg-slate-100 w-[368px] flex flex-col justify-center items-center p-1.5">
                        <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider">สรุปภาพรวมแผนก</span>
                      </div>
                    </div>


                    {/* ตารางเรือ Vessel & Crane Section (NEW) */}
                    <div className="bg-amber-50/50 px-4 py-2 border-b border-slate-200 flex justify-between items-center">
                      <span className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                        ตารางเทียบเรือ & เครนตักสินค้า (Vessel & Ship Crane Schedule)
                      </span>
                    </div>

                    {[
                      { type: "vessel", planType: "plan", label: "ตารางเรือ Vessel", subLabel: "Plan", barColor: "#fef08a", textColor: "text-amber-950", labelBg: "bg-amber-100/90" },
                      { type: "vessel", planType: "actual", label: "ตารางเรือ Vessel", subLabel: "Actual", barColor: "#bfdbfe", textColor: "text-blue-950", labelBg: "bg-blue-100/90" },
                      { type: "crane", planType: "plan", label: "Ship crane", subLabel: "Plan", barColor: "#f5d0fe", textColor: "text-purple-950", labelBg: "bg-purple-100/90" },
                      { type: "crane", planType: "actual", label: "Ship crane", subLabel: "Actual", barColor: "#ccfbf1", textColor: "text-teal-950", labelBg: "bg-teal-100/90" }
                    ].map((row, rIdx) => {
                      const deptEmployees = (state?.employees || []).filter(e => e.deptId === currentShiftsDept && e.employmentStatus !== "Resigned" && e.employmentStatus !== "ลาออก");
                      
                      // 1. Total OT
                      const totalDeptOt = deptEmployees.reduce((sum, emp) => {
                        const sArr = getEmpShiftsArray(emp.shifts, state?.shiftConfig?.currentMonth);
                        return sum + sArr.reduce((s, code) => s + getShiftOtHours(code), 0);
                      }, 0);

                      // 2. Plan Accuracy
                      let totalMatchDays = 0;
                      let totalTrackedDays = 0;
                      deptEmployees.forEach(emp => {
                        const actuals = getEmpShiftsArray(emp.shifts, state?.shiftConfig?.currentMonth);
                        const plans = getEmpPlanShiftsArray(emp, state?.shiftConfig?.currentMonth);
                        currentDays.forEach(day => {
                          const dayIdx = day.n - 1;
                          const act = actuals[dayIdx] || "O";
                          const pln = plans[dayIdx] || "O";
                          if (act !== "O" || pln !== "O") {
                            totalTrackedDays++;
                            if (act === pln) {
                              totalMatchDays++;
                            }
                          }
                        });
                      });
                      const planAccuracy = totalTrackedDays > 0 ? Math.round((totalMatchDays / totalTrackedDays) * 100) : 100;

                      // 3. Avg Workers per Day
                      let totalWorkInstances = 0;
                      currentDays.forEach(day => {
                        const dayIdx = day.n - 1;
                        deptEmployees.forEach(emp => {
                          const actuals = getEmpShiftsArray(emp.shifts, state?.shiftConfig?.currentMonth);
                          const act = actuals[dayIdx] || "O";
                          if (act !== "O" && act !== "OFF") {
                            totalWorkInstances++;
                          }
                        });
                      });
                      const avgWorkersPerDay = currentDays.length > 0 ? (totalWorkInstances / currentDays.length).toFixed(1) : "0";
                      const totalActiveStaff = deptEmployees.length;

                      return (
                      <div key={rIdx} className="flex border-b border-slate-200 hover:bg-slate-50/30 transition-colors">
                        <div className="w-56 flex-shrink-0 border-r border-slate-200 bg-[#f8fafc] flex flex-col justify-center px-3 py-2 sticky left-0 z-10 shadow-sm">
                          <span className="text-[11px] font-extrabold text-slate-700">{row.label}</span>
                          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">{row.subLabel}</span>
                        </div>

                        <div className="flex">
                          {currentDays.map((day) => {
                            const [y, m] = (state?.shiftConfig?.currentMonth || "2026-07").split("-");
                            const dateStr = `${y}-${m}-${String(day.n).padStart(2, "0")}`;

                            const activeVS = vesselSchedules.find(
                              (v) =>
                                v.type === row.type &&
                                v.planType === row.planType &&
                                dateStr >= v.startDate &&
                                dateStr <= v.endDate
                            );

                            if (activeVS) {
                              const isStart = dateStr === activeVS.startDate || day.n === startDay;
                              const isEnd = dateStr === activeVS.endDate || day.n === endDay;
                              const bgColor = activeVS.color || row.barColor;

                              return (
                                <div
                                  key={day.n}
                                  style={{
                                    width: daysLimit === 30 ? "35px" : daysLimit === 14 ? "48px" : "56px",
                                    height: "36px",
                                    backgroundColor: bgColor
                                  }}
                                  className={`flex-shrink-0 flex items-center justify-center relative select-none ${
                                    isStart ? "rounded-l-md border-l border-black/10" : ""
                                  } ${isEnd ? "rounded-r-md border-r border-black/10" : ""} ${
                                    !isEnd ? "" : "border-r border-slate-200"
                                  }`}
                                  title={`${activeVS.name} (${activeVS.startDate} ถึง ${activeVS.endDate})`}
                                >
                                  {isStart && (
                                    <div className="absolute left-1.5 w-[250px] text-left truncate pointer-events-none z-10">
                                      <span className={`text-[8.5px] font-black uppercase tracking-tight leading-none ${row.textColor} ${row.labelBg} px-1.5 py-0.5 rounded border border-black/5 shadow-sm`}>
                                        {activeVS.name}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              );
                            }

                            return (
                              <div
                                key={day.n}
                                style={{
                                  width: daysLimit === 30 ? "35px" : daysLimit === 14 ? "48px" : "56px",
                                  height: "36px"
                                }}
                                className="flex-shrink-0 border-r border-slate-200 bg-slate-50/10"
                              />
                            );
                          })}
                        </div>

                        {/* Custom Summary Widgets (Ultra-Compact 368px - Perfectly Aligned) */}
                        {rIdx === 0 && (
                          <div className="flex-shrink-0 border-l border-slate-300 w-[368px] bg-[#f9fbfd] flex items-center justify-between px-3 py-1 text-[10px] font-sans border-b border-slate-200">
                            <span className="font-bold text-slate-600">กะตรงตามแผน (Plan Accuracy)</span>
                            <div className="flex items-center gap-1.5">
                              <div className="w-16 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                                <div style={{ width: `${planAccuracy}%` }} className="bg-emerald-500 h-full rounded-full" />
                              </div>
                              <span className="font-black text-emerald-700 font-mono text-[10px]">{planAccuracy}%</span>
                            </div>
                          </div>
                        )}
                        {rIdx === 1 && (
                          <div className="flex-shrink-0 border-l border-slate-300 w-[368px] bg-[#f9fbfd] flex items-center justify-between px-3 py-1 text-[10px] font-sans border-b border-slate-200">
                            <span className="font-bold text-slate-600">ชั่วโมง OT สะสมรวมแผนก</span>
                            <span className="bg-blue-50 text-blue-800 px-2 py-0.5 rounded-md font-mono font-black text-[10px] border border-blue-200/80">
                              {totalDeptOt} ชม.
                            </span>
                          </div>
                        )}
                        {rIdx === 2 && (
                          <div className="flex-shrink-0 border-l border-slate-300 w-[368px] bg-[#f9fbfd] flex items-center justify-between px-3 py-1 text-[10px] font-sans border-b border-slate-200">
                            <span className="font-bold text-slate-600">กำลังพลทำงานเฉลี่ย (Avg Staff)</span>
                            <span className="font-black text-indigo-700 font-mono bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200/80 text-[10px]">{avgWorkersPerDay} คน/วัน</span>
                          </div>
                        )}
                        {rIdx === 3 && (
                          <div className="flex-shrink-0 border-l border-slate-300 w-[368px] bg-[#f9fbfd] flex items-center justify-between px-3 py-1 text-[10px] font-sans border-b border-slate-200">
                            <span className="font-bold text-slate-600">จำนวนกำลังพลปฏิบัติการ</span>
                            <span className="bg-amber-50 text-amber-800 px-2 py-0.5 rounded-md font-black border border-amber-200/80 font-mono text-[10px]">
                              {totalActiveStaff} คน.
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}

                    {/* === Dedicated Employee Roster Header Bar === */}
                    <div className="flex bg-slate-100 border-y border-slate-300 select-none">
                      <div className="w-56 flex-shrink-0 p-3 border-r border-slate-300 font-extrabold text-slate-700 text-xs flex items-center bg-blue-50/80">
                        <span className="text-blue-900 font-bold">รายชื่อพนักงานจัดกะ (All Employees)</span>
                      </div>

                      <div className="flex">
                        {currentDays.map((day, dIdx) => (
                          <div
                            key={dIdx}
                            style={{ width: daysLimit === 30 ? "35px" : daysLimit === 14 ? "48px" : "56px" }}
                            className={`flex-shrink-0 p-1 text-center border-r border-slate-300 flex flex-col justify-center ${
                              day.weekend ? "bg-slate-200/60" : "bg-slate-100"
                            }`}
                          >
                            <span className={`font-bold ${day.weekend ? "text-rose-600" : "text-slate-500"} ${
                              daysLimit === 30 ? "text-[8px]" : "text-[10px]"
                            }`}>
                              {day.th}
                            </span>
                            <span className={`font-extrabold text-slate-800 font-mono ${
                              daysLimit === 30 ? "text-[10px]" : "text-xs"
                            }`}>{day.n}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex-shrink-0 border-l border-slate-300 flex bg-slate-200/90 select-none">
                        {/* Monthly sub-columns (Ultra-Compact w-[200px]) */}
                        <div className="flex flex-col">
                          <div className="bg-[#1b365d] text-white text-[10px] font-black text-center py-1 tracking-wider uppercase border-b border-[#1b365d] w-[200px]">
                            {shiftViewMode === "plan" ? "MONTHLY (PLAN)" : shiftViewMode === "actual" ? "MONTHLY (ACTUAL)" : "MONTHLY (ACTUAL / DIFF)"}
                          </div>
                          <div className="flex text-[9px] font-black text-slate-800 text-center divide-x divide-slate-300">
                            <div className="w-14 py-1.5 flex items-center justify-center bg-slate-100">OT ปกติ</div>
                            <div className="w-16 py-1.5 flex items-center justify-center bg-slate-100">OT วันหยุด</div>
                            <div className="w-20 py-1.5 flex items-center justify-center bg-slate-100">ทำงานวันหยุด (วัน)</div>
                          </div>
                        </div>

                        {/* Green Column: Cost (Baht) (w-24 / 96px) */}
                        <div className="w-24 flex flex-col bg-[#1a4731]">
                          <div className="text-white text-[9px] font-black text-center py-1 h-9 flex flex-col justify-center items-center leading-tight border-b border-[#1a4731]">
                            <div>สรุปผลค่าล่วงเวลา</div>
                            <div>(บาท)</div>
                          </div>
                          <div className="h-6 bg-[#3b6db3]" />
                        </div>

                        {/* Purple Column: Cost % (w-18 / 72px) */}
                        <div className="w-18 flex flex-col bg-[#995c7f]">
                          <div className="text-white text-[9px] font-black text-center py-1 h-9 flex flex-col justify-center items-center leading-tight border-b border-[#995c7f]">
                            <div>สรุปผลค่าล่วงเวลา</div>
                            <div>%</div>
                          </div>
                          <div className="h-6 bg-[#3b6db3]" />
                        </div>
                      </div>
                    </div>

                    {/* Employee scheduler rows grouped by position/role */}
                    <div className={`divide-y divide-slate-200 ${isEditingShifts ? "pb-60" : ""}`}>
                      {(() => {
                        const filtered = (isEditingShifts ? tempEmployees : state.employees)
                          .filter(emp => emp.deptId === currentShiftsDept)
                          .filter(emp => emp.employmentStatus !== "Resigned" && emp.employmentStatus !== "ลาออก")
                          .filter(emp => selectedShiftRoleFilters.length === 0 || selectedShiftRoleFilters.includes("ทุกตำแหน่ง") || selectedShiftRoleFilters.includes(emp.role || "Operator"));

                        const grouped: Record<string, typeof filtered> = {};
                        filtered.forEach(emp => {
                          const r = emp.role || "ไม่ระบุตำแหน่ง";
                          if (!grouped[r]) grouped[r] = [];
                          grouped[r].push(emp);
                        });

                        const roleEntries = Object.entries(grouped);
                        if (roleEntries.length === 0) {
                          return (
                            <div className="p-8 text-center text-slate-400 text-xs font-bold">
                              ไม่พบข้อมูลพนักงานในตำแหน่งที่เลือก
                            </div>
                          );
                        }

                        return roleEntries.map(([roleName, roleEmps]) => (
                          <div key={roleName} className="bg-white">
                            {/* Position Category Header & Visible Line Divider */}
                            <div className="bg-slate-100/90 border-y border-slate-200 px-4 py-2 flex items-center justify-between sticky left-0 z-20 shadow-sm">
                              <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-pulse"></span>
                                <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                                  ตำแหน่ง: {roleName}
                                </span>
                                <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
                                  {roleEmps.length} คน
                                </span>
                              </div>
                              <div className="h-0.5 flex-1 bg-slate-200 mx-4 rounded-full"></div>
                            </div>

                            {/* Employee Rows in this position */}
                            <div className="divide-y divide-slate-100">
                              {roleEmps.map((emp) => {
                                return (
                                  <div 
                                    key={emp.id} 
                                    onClick={() => openModalForEmployee(emp)}
                                    className="flex hover:bg-blue-50/40 transition-colors group cursor-pointer"
                                    title="คลิกเพื่อจัดการตารางกะรายวันของพนักงานคนนี้"
                                  >
                                    {/* Employee ID & Name head */}
                                    <div className="w-56 flex-shrink-0 border-r border-slate-200 bg-white group-hover:bg-[#f1f6fe] flex items-center gap-2.5 px-3 py-1.5 sticky left-0 z-10 shadow-sm">
                                      <EmployeeAvatar empId={emp.id} empName={emp.name} className="w-7 h-7" />
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1">
                                          <p className="text-xs font-bold text-slate-800 truncate" title={emp.name}>{emp.name}</p>
                                          {(() => {
                                            const shifts: string[] = getEmpShiftsArray(emp.shifts, state?.shiftConfig?.currentMonth);
                                            let maxWeekOt = 0;
                                            for (let i = 0; i < shifts.length; i += 7) {
                                              const weekShifts = shifts.slice(i, i + 7);
                                              let weekOt = 0;
                                              weekShifts.forEach(code => {
                                                if (code === "OND") weekOt += 8;
                                                else if (code.endsWith("12") || code === "M12" || code === "A12" || code === "N12") weekOt += 4;
                                                else if (code.endsWith("16") || code === "M16" || code === "N16") weekOt += 8;
                                              });
                                              if (weekOt > maxWeekOt) maxWeekOt = weekOt;
                                            }
                                            return maxWeekOt > 36 ? (
                                              <span className="px-1 py-0.5 bg-red-50 text-red-600 border border-red-200 rounded text-[8px] font-extrabold flex-shrink-0" title="คำเตือน: มีสัปดาห์ที่ทำ OT เกิน 36 ชม. (ขีดจำกัดสูงสุดตามกฎหมายแรงงาน)">
                                                &gt;36h
                                              </span>
                                            ) : null;
                                          })()}
                                        </div>
                                        <p className="text-[9px] text-slate-400 font-mono font-semibold">{emp.id}</p>
                                      </div>
                                    </div>

                                    {/* Shift Cells */}
                                    <div className="flex">
                                      {(() => {
                                        const empActualShifts = getEmpShiftsArray(emp.shifts, state?.shiftConfig?.currentMonth);
                                        const empPlanShifts = getEmpPlanShiftsArray(emp, state?.shiftConfig?.currentMonth);
                                        return currentDays.map((day) => {
                                          const dayIdx = day.n - 1;
                                          const planShift = empPlanShifts[dayIdx] || "O";
                                          const actualShift = empActualShifts[dayIdx] || "O";
                                          const mismatch = isPlanActualMismatch(planShift, actualShift);

                                          const planStyle = getShiftStyle(planShift);
                                          const actualStyle = getShiftStyle(actualShift);

                                          const cellW = daysLimit === 30 ? "35px" : daysLimit === 14 ? "48px" : "56px";
                                          const cellH = daysLimit === 30 ? "40px" : daysLimit === 14 ? "48px" : "56px";

                                          return (
                                            <div 
                                              key={dayIdx} 
                                              style={{ width: cellW, height: cellH }}
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                const isManager = currentUser?.role === "Section Manager" && normalizeDeptId(currentUser?.deptId) === normalizeDeptId(emp.deptId);
                                                const isAllowed = isHrOrFullAccess || isManager;
                                                if (!isAllowed) return;

                                                const rect = e.currentTarget.getBoundingClientRect();
                                                setActiveCellEditor({
                                                  emp,
                                                  dayIdx,
                                                  target: shiftViewMode,
                                                  x: rect.left + window.scrollX,
                                                  y: rect.bottom + window.scrollY
                                                });
                                              }}
                                              className={[
                                                "flex-shrink-0 p-0.5 border-r border-slate-200 flex flex-col justify-center overflow-hidden relative select-none cursor-pointer hover:bg-blue-50/60 transition-colors",
                                                mismatch ? "outline outline-2 outline-red-500 outline-offset-[-1px] z-[1]" : "",
                                                day.weekend ? "bg-red-50/20" : ""
                                              ].join(" ")}>
                                              {/* Plan sub-row */}
                                              {(shiftViewMode === "plan" || shiftViewMode === "both") && (
                                                <div className={[
                                                  "w-full flex items-center justify-center font-extrabold relative rounded",
                                                  planStyle,
                                                  shiftViewMode === "both"
                                                    ? "h-[19px] text-[8px]"
                                                    : "h-full border text-[9px] md:text-xs"
                                                ].join(" ")}>
                                                  {shiftViewMode === "both" && <span className="absolute top-0 left-0.5 text-[5px] text-black/30 font-black font-sans">P</span>}
                                                  {planShift !== "O" ? planShift : ""}
                                                </div>
                                              )}
                                              {/* Actual sub-row */}
                                              {(shiftViewMode === "actual" || shiftViewMode === "both") && (
                                                <div className={[
                                                  "w-full flex items-center justify-center font-extrabold relative rounded",
                                                  actualStyle,
                                                  shiftViewMode === "both"
                                                    ? "h-[19px] text-[8px] mt-0.5 border-t border-slate-100"
                                                    : "h-full border text-[9px] md:text-xs"
                                                ].join(" ")}>
                                                  {shiftViewMode === "both" && <span className="absolute top-0 left-0.5 text-[5px] text-black/30 font-black font-sans">A</span>}
                                                  {actualShift !== "O" ? (actualShift === "⚠" ? "[เกินขีด]" : actualShift) : ""}
                                                </div>
                                              )}
                                            </div>
                                          );
                                        });
                                      })()}
                                    </div>

                                    {/* Monthly Summary Cells per Employee (Plan / Actual / Plan+Actual Diff) */}
                                    {(() => {
                                      const planShifts = getEmpShiftsArray(emp.planShifts || emp.shifts, state?.shiftConfig?.currentMonth, emp.calendarType);
                                      const actualShifts = getEmpShiftsArray(emp.shifts, state?.shiftConfig?.currentMonth, emp.calendarType);

                                      const calcBreakdown = (shiftsArr: string[]) => {
                                        let normalOt = 0;
                                        let holidayOt = 0;
                                        let holidayWorkDays = 0;

                                        currentDays.forEach((day) => {
                                          const shift = shiftsArr[day.n - 1] || "O";
                                          const otHrs = getShiftOtHours(shift);
                                          const isOff = shift === "O" || shift === "OFF";

                                          if (shift === "OND" || (day.th && day.th.startsWith("อา") && !isOff)) {
                                            holidayOt += otHrs > 0 ? otHrs : (shift === "OND" ? 8 : 0);
                                            if (!isOff) holidayWorkDays += 1;
                                          } else if (otHrs > 0) {
                                            normalOt += otHrs;
                                          }
                                        });

                                        const salary = emp.salary || 15000;
                                        const hourlyRate = salary > 0 ? (salary / 240) : 62.5;
                                        const totalOtPay = Math.round((normalOt * 1.5 + holidayOt * 3.0 + holidayWorkDays * 8 * 1.0) * hourlyRate);
                                        const otPctSalary = salary > 0 ? ((totalOtPay / salary) * 100).toFixed(2) : "0.00";

                                        return { normalOt, holidayOt, holidayWorkDays, salary, hourlyRate, totalOtPay, otPctSalary: Number(otPctSalary) || 0 };
                                      };

                                      const planData = calcBreakdown(planShifts);
                                      const actualData = calcBreakdown(actualShifts);

                                      const isPlanMode = shiftViewMode === "plan";
                                      const isBothMode = shiftViewMode === "both";

                                      // Main display data
                                      const mainData = isPlanMode ? planData : actualData;

                                      // Differences (Actual - Plan)
                                      const diffNormalOt = actualData.normalOt - planData.normalOt;
                                      const diffHolidayOt = actualData.holidayOt - planData.holidayOt;
                                      const diffHolidayWorkDays = actualData.holidayWorkDays - planData.holidayWorkDays;
                                      const diffTotalOtPay = actualData.totalOtPay - planData.totalOtPay;
                                      const diffOtPctSalary = (actualData.otPctSalary - planData.otPctSalary).toFixed(2);

                                      const renderDiff = (diffVal: number, unit = "", isCurrency = false) => {
                                        if (!isBothMode) return null;
                                        if (diffVal > 0) {
                                          return (
                                            <span className="text-[8px] font-black text-rose-600 font-mono tracking-tighter leading-none mt-0.5">
                                              +{isCurrency ? diffVal.toLocaleString() : diffVal}{unit}
                                            </span>
                                          );
                                        }
                                        if (diffVal < 0) {
                                          return (
                                            <span className="text-[8px] font-black text-emerald-600 font-mono tracking-tighter leading-none mt-0.5">
                                              {isCurrency ? diffVal.toLocaleString() : diffVal}{unit}
                                            </span>
                                          );
                                        }
                                        return (
                                          <span className="text-[8px] font-bold text-slate-400 font-mono tracking-tighter leading-none mt-0.5">
                                            ±0{unit}
                                          </span>
                                        );
                                      };

                                      return (
                                        <div 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setViewingSalaryFormulaEmployee({
                                              emp,
                                              normalOt: mainData.normalOt,
                                              holidayOt: mainData.holidayOt,
                                              holidayWorkDays: mainData.holidayWorkDays,
                                              salary: mainData.salary,
                                              hourlyRate: mainData.hourlyRate,
                                              totalOtPay: mainData.totalOtPay,
                                              otPctSalary: mainData.otPctSalary.toFixed(2)
                                            });
                                          }}
                                          title={`คลิกเพื่อดูรายละเอียดสูตรการคำนวณค่าล่วงเวลา (${isPlanMode ? 'โหมด Plan' : isBothMode ? 'โหมด Plan+Actual (Diff)' : 'โหมด Actual'})`}
                                          className="flex-shrink-0 border-l border-slate-300 flex font-mono text-xs divide-x divide-slate-200 bg-white select-none cursor-pointer hover:bg-blue-50/50 transition-colors duration-150"
                                        >
                                          {/* OT ปกติ (w-14 / 56px) */}
                                          <div className="w-14 flex flex-col items-center justify-center font-bold text-slate-800 text-[11px] py-1">
                                            <span>{mainData.normalOt > 0 ? mainData.normalOt : <span className="text-slate-300 font-normal">-</span>}</span>
                                            {renderDiff(diffNormalOt)}
                                          </div>

                                          {/* OT วันหยุด (w-16 / 64px) */}
                                          <div className="w-16 flex flex-col items-center justify-center font-bold text-slate-800 text-[11px] py-1">
                                            <span>{mainData.holidayOt > 0 ? mainData.holidayOt : <span className="text-slate-300 font-normal">-</span>}</span>
                                            {renderDiff(diffHolidayOt)}
                                          </div>

                                          {/* ทำงานวันหยุด (w-20 / 80px) */}
                                          <div className="w-20 flex flex-col items-center justify-center font-bold text-slate-800 text-[11px] py-1">
                                            <span>{mainData.holidayWorkDays > 0 ? mainData.holidayWorkDays : <span className="text-slate-300 font-normal">-</span>}</span>
                                            {renderDiff(diffHolidayWorkDays)}
                                          </div>

                                          {/* Green Column: Cost (Baht) (w-24 / 96px) */}
                                          <div className="w-24 flex flex-col items-end justify-center pr-2.5 font-bold text-slate-800 bg-[#1a4731]/5 border-r border-slate-200 text-[11px] py-1">
                                            <span>{mainData.totalOtPay > 0 ? mainData.totalOtPay.toLocaleString() : <span className="text-slate-300 font-normal">-</span>}</span>
                                            {renderDiff(diffTotalOtPay, "", true)}
                                          </div>

                                          {/* Purple Column: Cost % (w-18 / 72px) */}
                                          <div className="w-18 flex flex-col items-end justify-center pr-2.5 font-bold text-slate-800 bg-[#995c7f]/5 text-[11px] py-1">
                                            <span>{mainData.totalOtPay > 0 ? `${mainData.otPctSalary}%` : <span className="text-slate-300 font-normal">-</span>}</span>
                                            {renderDiff(Number(diffOtPctSalary), "%")}
                                          </div>
                                        </div>
                                      );
                                    })()}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ));
                      })()}
                    </div>

                    {/* Summary Row Footers */}
                    <div className="flex flex-col border-t-2 border-slate-200 sticky bottom-0 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                      {/* Row 1: Coverage */}
                      <div className="flex bg-slate-100 border-b border-slate-200">
                        <div className={`w-56 flex-shrink-0 border-r border-slate-200 font-bold text-slate-600 text-[11px] flex items-center ${daysLimit === 30 ? "p-2" : "p-3"}`}>
                          สรุปความคุ้มครอง (M/A/N)
                        </div>
                        
                        <div className="flex text-[10px] font-extrabold text-slate-600 font-mono">
                          {currentDays.map((_, dayIdx) => {
                            const summary = getDailyShiftSummary(dayIdx, currentShiftsDept);
                            return (
                              <div 
                                key={dayIdx} 
                                style={{ width: daysLimit === 30 ? "35px" : daysLimit === 14 ? "48px" : "56px" }}
                                className={`flex-shrink-0 p-1 text-center border-r border-slate-200 flex flex-col justify-center ${
                                  summary.lowCoverage ? "bg-red-50 text-red-600 font-extrabold border-l border-red-200" : ""
                                }`}
                              >
                                <span className={daysLimit === 30 ? "text-[8px]" : "text-[10px]"}>{summary.text}</span>
                              </div>
                            );
                          })}
                        </div>

                        <div className="flex-shrink-0 border-l border-slate-300 flex divide-x divide-slate-200 bg-slate-100 font-mono text-[10px] font-extrabold text-slate-600 text-center">
                          <div className="w-14 flex items-center justify-center">-</div>
                          <div className="w-16 flex items-center justify-center">-</div>
                          <div className="w-20 flex items-center justify-center">-</div>
                          <div className="w-24 flex items-center justify-center">-</div>
                          <div className="w-18 flex items-center justify-center">-</div>
                        </div>
                      </div>

                      {/* Row 2: Daily OT Hours */}
                      <div className="flex bg-blue-50/60">
                        <div className={`w-56 flex-shrink-0 border-r border-slate-200 font-bold text-blue-800 text-[11px] flex items-center ${daysLimit === 30 ? "p-2" : "p-3"}`}>
                          สรุปชั่วโมง OT รายวัน (ชม.)
                        </div>
                        
                        <div className="flex text-[10px] font-extrabold text-blue-700 font-mono">
                          {currentDays.map((_, dayIdx) => {
                            let dailyOt = 0;
                            const activeList = (isEditingShifts ? tempEmployees : state.employees).filter(emp => emp.deptId === currentShiftsDept);
                            activeList.forEach(emp => {
                               const periodShifts = getEmployeeShiftsForView(emp.shifts, daysLimit);
                               dailyOt += getShiftOtHours(periodShifts[dayIdx] || "O");
                            });
                            return (
                              <div 
                                key={dayIdx} 
                                style={{ width: daysLimit === 30 ? "35px" : daysLimit === 14 ? "48px" : "56px" }}
                                className={`flex-shrink-0 p-1 text-center border-r border-slate-200 flex flex-col justify-center ${
                                  dailyOt > 0 ? "bg-blue-100/50" : ""
                                }`}
                              >
                                <span className={daysLimit === 30 ? "text-[9px]" : "text-[11px]"}>{dailyOt > 0 ? dailyOt : "-"}</span>
                              </div>
                            );
                          })}
                        </div>

                        {/* Monthly Department Totals (Plan / Actual / Plan+Actual Diff) */}
                        <div className="flex-shrink-0 border-l border-slate-300 flex divide-x divide-slate-200 bg-blue-100/90 font-mono text-xs font-black text-blue-950">
                           {(() => {
                              let planDeptNormalOt = 0;
                              let planDeptHolidayOt = 0;
                              let planDeptHolidayWorkDays = 0;
                              let planDeptTotalOtPay = 0;

                              let actualDeptNormalOt = 0;
                              let actualDeptHolidayOt = 0;
                              let actualDeptHolidayWorkDays = 0;
                              let actualDeptTotalSalary = 0;
                              let actualDeptTotalOtPay = 0;

                              const activeList = (isEditingShifts ? tempEmployees : state.employees)
                                .filter(e => e.deptId === currentShiftsDept && e.employmentStatus !== "Resigned" && e.employmentStatus !== "ลาออก");

                              activeList.forEach(e => {
                                const pShifts = getEmpShiftsArray(e.planShifts || e.shifts, state?.shiftConfig?.currentMonth, e.calendarType);
                                const aShifts = getEmpShiftsArray(e.shifts, state?.shiftConfig?.currentMonth, e.calendarType);
                                
                                const salary = e.salary || 15000;
                                const hourlyRate = salary > 0 ? (salary / 240) : 62.5;

                                let pNorm = 0, pHol = 0, pHolDays = 0;
                                let aNorm = 0, aHol = 0, aHolDays = 0;

                                currentDays.forEach((day) => {
                                  const pShift = pShifts[day.n - 1] || "O";
                                  const pOtHrs = getShiftOtHours(pShift);
                                  const pIsOff = pShift === "O" || pShift === "OFF";
                                  if (pShift === "OND" || (day.th && day.th.startsWith("อา") && !pIsOff)) {
                                    pHol += pOtHrs > 0 ? pOtHrs : (pShift === "OND" ? 8 : 0);
                                    if (!pIsOff) pHolDays += 1;
                                  } else if (pOtHrs > 0) {
                                    pNorm += pOtHrs;
                                  }

                                  const aShift = aShifts[day.n - 1] || "O";
                                  const aOtHrs = getShiftOtHours(aShift);
                                  const aIsOff = aShift === "O" || aShift === "OFF";
                                  if (aShift === "OND" || (day.th && day.th.startsWith("อา") && !aIsOff)) {
                                    aHol += aOtHrs > 0 ? aOtHrs : (aShift === "OND" ? 8 : 0);
                                    if (!aIsOff) aHolDays += 1;
                                  } else if (aOtHrs > 0) {
                                    aNorm += aOtHrs;
                                  }
                                });

                                planDeptNormalOt += pNorm;
                                planDeptHolidayOt += pHol;
                                planDeptHolidayWorkDays += pHolDays;
                                planDeptTotalOtPay += Math.round((pNorm * 1.5 + pHol * 3.0 + pHolDays * 8 * 1.0) * hourlyRate);

                                actualDeptNormalOt += aNorm;
                                actualDeptHolidayOt += aHol;
                                actualDeptHolidayWorkDays += aHolDays;
                                actualDeptTotalSalary += salary;
                                actualDeptTotalOtPay += Math.round((aNorm * 1.5 + aHol * 3.0 + aHolDays * 8 * 1.0) * hourlyRate);
                              });

                              const isPlan = shiftViewMode === "plan";
                              const isBoth = shiftViewMode === "both";

                              const mainNorm = isPlan ? planDeptNormalOt : actualDeptNormalOt;
                              const mainHol = isPlan ? planDeptHolidayOt : actualDeptHolidayOt;
                              const mainHolDays = isPlan ? planDeptHolidayWorkDays : actualDeptHolidayWorkDays;
                              const mainOtPay = isPlan ? planDeptTotalOtPay : actualDeptTotalOtPay;
                              const mainOtPct = actualDeptTotalSalary > 0 ? ((mainOtPay / actualDeptTotalSalary) * 100).toFixed(2) : "0.00";

                              const diffNorm = actualDeptNormalOt - planDeptNormalOt;
                              const diffHol = actualDeptHolidayOt - planDeptHolidayOt;
                              const diffHolDays = actualDeptHolidayWorkDays - planDeptHolidayWorkDays;
                              const diffPay = actualDeptTotalOtPay - planDeptTotalOtPay;
                              const planOtPct = actualDeptTotalSalary > 0 ? ((planDeptTotalOtPay / actualDeptTotalSalary) * 100).toFixed(2) : "0.00";
                              const diffPct = (Number(mainOtPct) - Number(planOtPct)).toFixed(2);

                              const renderFooterDiff = (diffVal: number, unit = "", isCurrency = false) => {
                                if (!isBoth) return null;
                                if (diffVal > 0) {
                                  return (
                                    <span className="text-[8px] font-black text-rose-700 font-mono tracking-tighter leading-none mt-0.5">
                                      +{isCurrency ? diffVal.toLocaleString() : diffVal}{unit}
                                    </span>
                                  );
                                }
                                if (diffVal < 0) {
                                  return (
                                    <span className="text-[8px] font-black text-emerald-700 font-mono tracking-tighter leading-none mt-0.5">
                                      {isCurrency ? diffVal.toLocaleString() : diffVal}{unit}
                                    </span>
                                  );
                                }
                                return (
                                  <span className="text-[8px] font-bold text-slate-500 font-mono tracking-tighter leading-none mt-0.5">
                                    ±0{unit}
                                  </span>
                                );
                              };

                              return (
                                <>
                                  <div className="w-14 flex flex-col items-center justify-center text-[11px] py-1">
                                    <span>{mainNorm}</span>
                                    {renderFooterDiff(diffNorm)}
                                  </div>
                                  <div className="w-16 flex flex-col items-center justify-center text-[11px] py-1">
                                    <span>{mainHol}</span>
                                    {renderFooterDiff(diffHol)}
                                  </div>
                                  <div className="w-20 flex flex-col items-center justify-center text-[11px] py-1">
                                    <span>{mainHolDays}</span>
                                    {renderFooterDiff(diffHolDays)}
                                  </div>
                                  
                                  {/* Sum of Baht */}
                                  <div className="w-24 flex flex-col items-end justify-center pr-2.5 text-emerald-950 bg-emerald-100/30 border-r border-slate-300 text-[11px] py-1">
                                    <span>{mainOtPay.toLocaleString()}</span>
                                    {renderFooterDiff(diffPay, "", true)}
                                  </div>

                                  {/* Sum of % */}
                                  <div className="w-18 flex flex-col items-end justify-center pr-2.5 text-purple-950 bg-purple-100/30 text-[11px] py-1">
                                    <span>{mainOtPct}%</span>
                                    {renderFooterDiff(Number(diffPct), "%")}
                                  </div>
                                </>
                              );
                           })()}
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================= */}
          {/* VIEW: HR DIRECT DATA EDITOR */}
          {/* ======================================= */}
          {activeTab === "hr-editor" && (
            <HrDirectEditorView 
              currentUser={currentUser} 
              state={state}
              jobValueRecords={jobValueRecords}
              setJobValueRecords={setJobValueRecords}
              fetchJobValueRecords={fetchJobValueRecords}
            />
          )}

          {/* ======================================= */}
          {/* VIEW: OT RECORDS FROM SHIFTS */}
          {/* ======================================= */}
          {activeTab === "ot-records" && (
            <OtRecordsView 
              currentUser={currentUser} 
              state={state}
            />
          )}

          {/* ======================================= */}
          {/* VIEW: LEAVE RECORDS */}
          {/* ======================================= */}
          {activeTab === "leave-records" && (
            <LeaveRecordsView 
              currentUser={currentUser} 
              state={state}
            />
          )}

          {/* ======================================= */}
          {/* VIEW: SETTINGS */}
          {/* ======================================= */}
          {activeTab === "settings" && (
            <div className="w-full max-w-full min-w-0 space-y-4 sm:space-y-6">
              {/* Header card */}
              <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-base sm:text-lg font-extrabold text-slate-800">การตั้งค่ากฎเกณฑ์และการวิเคราะห์ของระบบ</h3>
                <p className="text-xs text-slate-500 mt-1">กำหนดเป้าหมาย ขีดจำกัดชั่วโมงโอทีความปลอดภัย และนโยบายการจัดตารางกะ</p>
              </div>

              {/* Grid configs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                
                {/* Labor laws parameters limits */}
                <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-6 shadow-sm space-y-6">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">กฎหมายแรงงานไทยและพารามิเตอร์ความปลอดภัย</h4>
                    <p className="text-xs text-slate-500">กำหนดขีดจำกัดสูงสุดเพื่อให้สอดคล้องกับกฎหมายและสุขภาพของพนักงาน</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">ชั่วโมง OT สูงสุดต่อเดือนของรายบุคคล</label>
                      <input 
                        type="number" 
                        defaultValue={48}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">ขีดจำกัดชั่วโมงทำงานล่วงเวลารายสัปดาห์ (กฎหมายแรงงานไทยจำกัดไม่เกิน 36 ชม./สัปดาห์)</label>
                      <input 
                        type="number" 
                        defaultValue={36}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">ระยะเวลาพักผ่อนขั้นต่ำหลังปฏิบัติหน้าที่กะกลางคืน (ชั่วโมง)</label>
                      <input 
                        type="number" 
                        defaultValue={12}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700"
                      />
                    </div>
                  </div>

                  <button 
                    onClick={() => alert("บันทึกการตั้งค่าขีดจำกัดความปลอดภัยสำเร็จแล้ว!")}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm"
                  >
                    บันทึกพารามิเตอร์ระบบ
                  </button>
                </div>

                {/* Automation / Gemini settings */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">การรวมกำลังพลระบบ AI และการวิเคราะห์อัจฉริยะ</h4>
                    <p className="text-xs text-slate-500">ควบคุมและประเมินระดับการทำรายงานอัจฉริยะ (Gemini Live Audit)</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                      <div>
                        <h5 className="text-xs font-bold text-slate-800">เปิดระบบตรวจหาโอทีทับซ้อนอัตโนมัติ</h5>
                        <p className="text-[10px] text-slate-500 mt-0.5">ระบบจะตรวจสอบสิทธิและกำลังพลอัตโนมัติเมื่อจัดตาราง</p>
                      </div>
                      <input type="checkbox" defaultChecked className="rounded border-slate-300 text-blue-600 focus:ring-blue-500/20" />
                    </div>

                    <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                      <div>
                        <h5 className="text-xs font-bold text-slate-800">แจ้งเตือนงบประมาณจำกัดระดับ 90%</h5>
                        <p className="text-[10px] text-slate-500 mt-0.5">ส่งคำเตือนเมื่อกำลังพลใช้โควตางบประมาณใกล้เคียงกำหนดสูงสุด</p>
                      </div>
                      <input type="checkbox" defaultChecked className="rounded border-slate-300 text-blue-600 focus:ring-blue-500/20" />
                    </div>

                    <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                      <div>
                        <h5 className="text-xs font-bold text-slate-800">เปิดระบบประเมินโดยโมเดล Gemini 3.5 Flash</h5>
                        <p className="text-[10px] text-slate-500 mt-0.5">สร้างคำแนะนำอัจฉริยะสำหรับการสลับกะตารางพนักงาน</p>
                      </div>
                      <input type="checkbox" defaultChecked className="rounded border-slate-300 text-blue-600 focus:ring-blue-500/20" />
                    </div>
                  </div>

                  <button 
                    onClick={() => alert("ปรับปรุงระบบสืบค้น AI อัจฉริยะเรียบร้อยแล้ว!")}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm"
                  >
                    ยืนยันตัวตนและการอัปเกรด
                  </button>
                </div>

                {/* User & Permissions Management (Visible to Admin & HR) */}
                <div className="col-span-1 md:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">ระบบการจัดการบัญชีและสิทธิ์ผู้สวมบทบาท (Users & Permissions)</h4>
                      <p className="text-xs text-slate-500">ปรับเปลี่ยนสิทธิ์ความรับผิดชอบของหัวหน้างาน หรือรีเซ็ตรหัสผ่านของพนักงานอื่น</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowAddAccountModal(true)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>เพิ่มผู้ใช้งาน / Admin ใหม่</span>
                    </button>
                  </div>
                  <div className="overflow-x-auto rounded-2xl border border-slate-100 divide-y divide-slate-100">
                    <table className="w-full text-left text-xs text-slate-600">
                      <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500">
                        <tr>
                          <th className="p-4">ผู้ใช้งาน (Username)</th>
                          <th className="p-4">บทบาทสิทธิ์ (Role)</th>
                          <th className="p-4">แผนกที่รับผิดชอบ</th>
                          <th className="p-4 text-center">จัดการการทำงาน</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {accounts.map((acc) => (
                          <tr key={acc.username} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-4 flex items-center gap-3">
                              <EmployeeAvatar empId={acc.username} empName={acc.name} avatarUrl={acc.avatar} className="w-8 h-8 flex-shrink-0" />
                              <div>
                                <div className="font-bold text-slate-800">{acc.name}</div>
                                <div className="text-[10px] text-slate-400 font-mono">{acc.username}</div>
                              </div>
                            </td>
                            <td className="p-4">
                              <select 
                                value={
                                  ["Admin", "ผู้ดูแลระบบ", "admin"].includes(acc.role)
                                    ? "Admin"
                                    : ["Co-admin", "Co-Admin", "co_admin", "ผู้ช่วยดูแลระบบ"].includes(acc.role)
                                    ? "Co-admin"
                                    : "User"
                                }
                                onChange={(e) => {
                                  const nextRole = e.target.value;
                                  const nextDept = nextRole === "Admin" ? "all" : acc.deptId;
                                  handleUpdateAccountPermission(acc.username, nextRole, nextDept);
                                }}
                                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700 font-bold"
                              >
                                <option value="Admin">Admin</option>
                                <option value="Co-admin">Co-admin</option>
                                <option value="User">User</option>
                              </select>
                            </td>
                            <td className="p-4">
                              <select
                                disabled={["Admin", "ผู้ดูแลระบบ", "admin"].includes(acc.role)}
                                value={acc.deptId}
                                onChange={(e) => {
                                  handleUpdateAccountPermission(acc.username, acc.role, e.target.value);
                                }}
                                className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700 disabled:opacity-50 disabled:bg-slate-100 font-medium"
                              >
                                <option value="all">ทุกแผนก (All)</option>
                                <option value="inter2">INTER 2</option>
                                <option value="inter3">INTER 3</option>
                                <option value="inter5">INTER 5</option>
                                <option value="inter7">INTER 7</option>
                                <option value="heavy">Heavy Machine</option>
                                <option value="ecc">ECC</option>
                              </select>
                            </td>
                            <td className="p-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditAccountOriginalUsername(acc.username);
                                    setEditAccountUsername(acc.username);
                                    setEditAccountName(acc.name);
                                    setEditAccountRole(acc.role);
                                    setEditAccountDeptId(acc.deptId);
                                    setEditAccountAvatar(acc.avatar || "");
                                    setEditAccountCanBackup(acc.canBackup === 1);
                                    setShowEditAccountModal(true);
                                  }}
                                  className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl text-[10px] font-bold text-amber-700 transition-all cursor-pointer"
                                >
                                  ✏️ แก้ไขข้อมูล
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setResetTargetUsername(acc.username);
                                    setNewResetPassword("");
                                    setShowResetPasswordModal(true);
                                  }}
                                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl text-[10px] font-bold text-blue-700 transition-all cursor-pointer"
                                >
                                  🔑 รีเซ็ตรหัสผ่าน
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteAccount(acc.username)}
                                  className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl text-[10px] font-bold text-red-600 transition-all cursor-pointer"
                                >
                                  🗑️ ลบ
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Database Management / Clear data card */}
                {["HR", "HR Section Manager", "ผู้ดูแลระบบ"].includes(currentUser?.role || "") && (
                  <div className="col-span-1 md:col-span-2 bg-red-50/50 border border-red-200 rounded-3xl p-6 shadow-sm space-y-4">
                    <div>
                      <h4 className="text-sm font-bold text-red-800">การจัดการฐานข้อมูล (Database Administration)</h4>
                      <p className="text-xs text-red-600">ล้างข้อมูลพนักงานและ OT records เพื่อเตรียมตัวเริ่มใช้งานระบบจริงในบริษัทของคุณ</p>
                    </div>
                    <button 
                      onClick={handleClearMockData}
                      className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition-colors shadow-md shadow-red-500/10"
                    >
                      ล้างข้อมูลพนักงานและใบคำขอทั้งหมด
                    </button>
                  </div>
                )}

              </div>
            </div>
          )}

          {/* ======================================= */}
          {/* VIEW: ADMIN PERMISSIONS DIRECT TAB */}
          {/* ======================================= */}
          {activeTab === "admin-permissions" && (
            <div className="w-full max-w-full min-w-0 space-y-4 sm:space-y-6">
              <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-800">ระบบการจัดการบัญชีและสิทธิ์ผู้สวมบทบาท (Admin Permissions)</h3>
                  <p className="text-xs text-slate-500 mt-1">ปรับเปลี่ยนสิทธิ์การเข้าถึง กำหนดแผนกที่รับผิดชอบ หรือรีเซ็ตรหัสผ่านผู้ใช้งานในระบบ</p>
                </div>
                <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => setIsCsvTemplateHubOpen(true)}
                    className="px-3.5 sm:px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer min-h-[40px]"
                    title="ศูนย์ดาวน์โหลดแม่แบบไฟล์ CSV สำหรับทุกเมนู"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                    <span>ศูนย์ดาวน์โหลดแม่แบบ CSV</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddAccountModal(true)}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer min-h-[40px]"
                  >
                    <Plus className="w-4 h-4" />
                    <span>เพิ่มผู้ใช้งาน / Admin ใหม่</span>
                  </button>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-6 shadow-sm space-y-6">
                <div className="overflow-x-auto no-scrollbar touch-pan-x rounded-2xl border border-slate-100 divide-y divide-slate-100 w-full max-w-full min-w-0">
                  <table className="w-full text-left text-xs text-slate-600 min-w-[600px]">
                    <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500">
                      <tr>
                        <th className="p-4">ผู้ใช้งาน (Username)</th>
                        <th className="p-4">บทบาทสิทธิ์ (Role)</th>
                        <th className="p-4">แผนกที่รับผิดชอบ</th>
                        <th className="p-4 text-center">จัดการการทำงาน</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {accounts.map((acc) => (
                        <tr key={acc.username} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 flex items-center gap-3">
                            <EmployeeAvatar empId={acc.username} empName={acc.name} avatarUrl={acc.avatar} className="w-8 h-8 flex-shrink-0" />
                            <div>
                              <div className="font-bold text-slate-800">{acc.name}</div>
                              <div className="text-[10px] text-slate-400 font-mono">{acc.username}</div>
                            </div>
                          </td>
                          <td className="p-4">
                            <select 
                              value={
                                ["Admin", "ผู้ดูแลระบบ", "admin"].includes(acc.role)
                                  ? "Admin"
                                  : ["Co-admin", "Co-Admin", "co_admin", "ผู้ช่วยดูแลระบบ"].includes(acc.role)
                                  ? "Co-admin"
                                  : "User"
                              }
                              onChange={(e) => {
                                const nextRole = e.target.value;
                                const nextDept = nextRole === "Admin" ? "all" : acc.deptId;
                                handleUpdateAccountPermission(acc.username, nextRole, nextDept);
                              }}
                              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700 font-bold"
                            >
                              <option value="Admin">Admin</option>
                              <option value="Co-admin">Co-admin</option>
                              <option value="User">User</option>
                            </select>
                          </td>
                          <td className="p-4">
                            <select
                              disabled={["Admin", "ผู้ดูแลระบบ", "admin"].includes(acc.role)}
                              value={acc.deptId}
                              onChange={(e) => {
                                handleUpdateAccountPermission(acc.username, acc.role, e.target.value);
                              }}
                              className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700 disabled:opacity-50 disabled:bg-slate-100 font-medium"
                            >
                              <option value="all">ทุกแผนก (All)</option>
                              <option value="inter2">INTER 2</option>
                              <option value="inter3">INTER 3</option>
                              <option value="inter5">INTER 5</option>
                              <option value="inter7">INTER 7</option>
                              <option value="heavy">Heavy Machine</option>
                              <option value="ecc">ECC</option>
                            </select>
                          </td>
                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditAccountOriginalUsername(acc.username);
                                  setEditAccountUsername(acc.username);
                                  setEditAccountName(acc.name);
                                  setEditAccountRole(acc.role);
                                  setEditAccountDeptId(acc.deptId);
                                  setEditAccountAvatar(acc.avatar || "");
                                  setEditAccountCanBackup(acc.canBackup === 1);
                                  setShowEditAccountModal(true);
                                }}
                                className="px-3.5 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl text-[10px] font-bold text-amber-700 transition-all cursor-pointer"
                              >
                                ✏️ แก้ไขข้อมูล
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setResetTargetUsername(acc.username);
                                  setNewResetPassword("");
                                  setShowResetPasswordModal(true);
                                }}
                                className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl text-[10px] font-bold text-blue-700 transition-all cursor-pointer"
                              >
                                🔑 รีเซ็ตรหัสผ่าน
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================================= */}
          {/* VIEW: PERSONAL PROFILE SETTINGS */}
          {/* ======================================= */}
          {activeTab === "profile" && (
            <div className="w-full max-w-full min-w-0 space-y-4 sm:space-y-6">
              {/* Header card */}
              <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 shrink-0">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-800">จัดการข้อมูลโปรไฟล์ส่วนตัว</h3>
                  <p className="text-xs text-slate-500 mt-1">อัปเดตชื่อแสดงผล ลิงก์รูปภาพโปรไฟล์ และเปลี่ยนรหัสผ่านเพื่อความปลอดภัย</p>
                </div>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                
                {/* Left card: Current Profile Preview */}
                <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-24 h-24 rounded-full overflow-hidden shadow-md border-4 border-slate-100 flex-shrink-0">
                    <img 
                      alt="Avatar Preview" 
                      className="w-full h-full object-cover"
                      src={profileAvatar || "https://lh3.googleusercontent.com/aida-public/AB6AXuAf5UhzQFkBl2tAqPIfYe5tF5JObtrReGu_lohxjpxav5OEjcmmCJhPclOvd2pYN5Q63ircrUY62HYEtYICs05VEFPgL0t4CQSbr1dUS_veJddqwvCz2hrMENO5DyK5fUo9Lx_K8EQj_RXIf9a91CYGwMUZftntpoCZ5n7RUAnxYNIsXz71ttH1VvWFLTpEggMdONt3b-WOccq3oi4S33bsL6DAyTg_90K2vzyRwxDzf3Isscur4MrcuQ"}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://lh3.googleusercontent.com/aida-public/AB6AXuAf5UhzQFkBl2tAqPIfYe5tF5JObtrReGu_lohxjpxav5OEjcmmCJhPclOvd2pYN5Q63ircrUY62HYEtYICs05VEFPgL0t4CQSbr1dUS_veJddqwvCz2hrMENO5DyK5fUo9Lx_K8EQj_RXIf9a91CYGwMUZftntpoCZ5n7RUAnxYNIsXz71ttH1VvWFLTpEggMdONt3b-WOccq3oi4S33bsL6DAyTg_90K2vzyRwxDzf3Isscur4MrcuQ";
                      }}
                    />
                  </div>
                  <div>
                    <h4 className="text-base font-extrabold text-slate-800">{currentUser?.name}</h4>
                    <p className="text-xs text-blue-600 font-bold mt-1">{currentUser?.role}</p>
                    <p className="text-[10px] text-slate-400 font-mono mt-1">ชื่อผู้ใช้: {currentUser?.username}</p>
                  </div>
                  <div className="w-full pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                    <span>สังกัดฝ่ายงาน:</span>
                    <span className="font-bold text-slate-700">
                      {currentUser?.deptId === "all" ? "ผู้ดูแลระบบทุกแผนก" : 
                       currentUser?.deptId === "inter2" ? "INTER 2" :
                       currentUser?.deptId === "inter3" ? "INTER 3" :
                       currentUser?.deptId === "inter5" ? "INTER 5" :
                       currentUser?.deptId === "inter7" ? "INTER 7" :
                       currentUser?.deptId === "heavy" ? "Heavy Machine" :
                       currentUser?.deptId === "ecc" ? "ECC" :
                       currentUser?.deptId}
                    </span>
                  </div>
                </div>

                {/* Right card: Form editor */}
                <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm">
                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1.5">ชื่อ-นามสกุล ที่แสดง</label>
                        <input 
                          type="text"
                          required
                          value={profileName}
                          onChange={(e) => setProfileName(e.target.value)}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1.5">ลิงก์รูปภาพโปรไฟล์ (Avatar URL)</label>
                        <input 
                          type="text"
                          required
                          value={profileAvatar}
                          onChange={(e) => setProfileAvatar(e.target.value)}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1.5">รหัสผ่านใหม่ (ถ้าต้องการเปลี่ยน)</label>
                        <input 
                          type="password"
                          placeholder="กรอกรหัสผ่านใหม่"
                          value={profilePassword}
                          onChange={(e) => setProfilePassword(e.target.value)}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1.5">ยืนยันรหัสผ่านใหม่</label>
                        <input 
                          type="password"
                          placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
                          value={profileConfirmPassword}
                          onChange={(e) => setProfileConfirmPassword(e.target.value)}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700"
                        />
                      </div>
                    </div>

                    {profileErrorMsg && (
                      <div className="p-3.5 bg-red-50/50 border border-red-200 text-red-700 rounded-2xl text-xs font-bold flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                        <span>{profileErrorMsg}</span>
                      </div>
                    )}

                    {profileSuccessMsg && (
                      <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-xs font-bold flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        <span>{profileSuccessMsg}</span>
                      </div>
                    )}

                    <div className="flex justify-end pt-4 border-t border-slate-100">
                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/10"
                      >
                        บันทึกข้อมูลส่วนตัว
                      </button>
                    </div>
                  </form>
                </div>

              </div>
            </div>
          )}

        </main>
      </div>



      {/* ======================================= */}
      {/* OVERLAY / MODAL: MANAGE VESSEL & CRANE */}
      {/* ======================================= */}
      {showVesselModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="bg-slate-950 p-6 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-xl">
                  🚢
                </div>
                <div>
                  <h3 className="text-base font-extrabold font-sans">จัดการตารางเทียบเรือ & เครนตักสินค้า</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-sans">แผนก: {(state?.departments.find(d => d.id === currentShiftsDept)?.nameTh || currentShiftsDept).toUpperCase()}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowVesselModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Content body */}
            <div className="p-6 overflow-y-auto space-y-6">
              
              {/* Form to add new schedule */}
              <form onSubmit={handleSaveVesselSchedule} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-4">
                <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                  เพิ่มรายการเข้าเทียบเรือ / เครนใหม่
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">ประเภท</label>
                    <select
                      value={newVesselType}
                      onChange={(e) => setNewVesselType(e.target.value as any)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
                    >
                      <option value="vessel">ตารางเรือ Vessel</option>
                      <option value="crane">Ship crane</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">แผนงาน / ทำงานจริง</label>
                    <select
                      value={newVesselPlanType}
                      onChange={(e) => setNewVesselPlanType(e.target.value as any)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
                    >
                      <option value="plan">Plan</option>
                      <option value="actual">Actual</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">ชื่อเรือ / รายละเอียดงาน</label>
                    <input
                      type="text"
                      required
                      value={newVesselName}
                      onChange={(e) => setNewVesselName(e.target.value)}
                      placeholder='เช่น Disch. Wheat MV "Golden Friend"'
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">ปริมาณงาน (ตัน / Tons)</label>
                    <input
                      type="number"
                      value={newVesselTonnage}
                      onChange={(e) => setNewVesselTonnage(e.target.value)}
                      placeholder="เช่น 15000"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">วันที่เริ่ม</label>
                    <input
                      type="date"
                      required
                      value={newVesselStartDate}
                      onChange={(e) => setNewVesselStartDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">วันที่สิ้นสุด</label>
                    <input
                      type="date"
                      required
                      value={newVesselEndDate}
                      onChange={(e) => setNewVesselEndDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">แถบสีการแสดงผล</label>
                    <div className="flex items-center gap-2">
                      {[
                        { hex: "#fef08a", label: "เหลือง" },
                        { hex: "#bfdbfe", label: "ฟ้า" },
                        { hex: "#f5d0fe", label: "ม่วง" },
                        { hex: "#ccfbf1", label: "เขียวมิ้นท์" },
                        { hex: "#fed7aa", label: "ส้ม" }
                      ].map((c) => (
                        <button
                          key={c.hex}
                          type="button"
                          onClick={() => setNewVesselColor(c.hex)}
                          className={`w-6 h-6 rounded-full border transition-all ${newVesselColor === c.hex ? "ring-2 ring-amber-500 scale-110 border-amber-600" : "border-slate-300"}`}
                          style={{ backgroundColor: c.hex }}
                          title={c.label}
                        />
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors shadow-md shadow-amber-500/10 cursor-pointer"
                  >
                    + เพิ่มในตาราง
                  </button>
                </div>
              </form>

              {/* List of existing vessel schedules for current month/dept */}
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-slate-400 rounded-full"></span>
                  รายการตารางในเดือนนี้ ({vesselSchedules.length} รายการ)
                </h4>

                {vesselSchedules.length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs">
                    ไม่มีรายการเทียบเรือหรือการใช้เครนในแผนกและเดือนนี้
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
                    {vesselSchedules.map((vs) => (
                      <div key={vs.id} className="p-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded-full border border-slate-300 flex-shrink-0"
                            style={{ backgroundColor: vs.color }}
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-bold text-slate-800 font-sans">{vs.name}</p>
                              {vs.tonnage > 0 && (
                                <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-[10px] font-extrabold font-mono">
                                  📦 {Number(vs.tonnage).toLocaleString()} ตัน
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-500 mt-0.5 font-sans">
                              {vs.type === "vessel" ? "เรือ Vessel" : "Ship Crane"} ({vs.planType.toUpperCase()}) | {vs.startDate} ถึง {vs.endDate}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteVesselSchedule(vs.id)}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="ลบรายการ"
                        >
                          🗑️
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setShowVesselModal(false)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
              >
                ปิดหน้าต่าง
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* OVERLAY / MODAL: ADD NEW EMPLOYEE */}
      {/* ======================================= */}
      {showAddEmployeeModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-slate-900">เพิ่มพนักงานเข้าสู่แผนภูมิระบบ</h3>
                <p className="text-xs text-slate-500">ระบุรายละเอียดข้อมูลพนักงานเพื่อจัดสรรตารางการทำงานและเป้าหมายโอที</p>
              </div>
              <button 
                onClick={() => setShowAddEmployeeModal(false)}
                className="p-1.5 hover:bg-slate-200/60 rounded-full text-slate-400"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddEmployee} className="p-6 space-y-5 overflow-y-auto flex-1">
              {/* ส่วนที่ 1: ข้อมูลทั่วไป */}
              <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 space-y-3">
                <h4 className="text-xs font-extrabold text-blue-700 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                  1. ข้อมูลทั่วไปของบุคลากร (General Profile)
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">รหัสพนักงาน (เว้นว่างเพื่อสุ่ม)</label>
                    <input 
                      type="text"
                      value={newEmpId}
                      onChange={(e) => setNewEmpId(e.target.value)}
                      placeholder="สุ่มรหัสอัตโนมัติ"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">คำนำหน้า</label>
                    <select
                      value={newEmpPrefix}
                      onChange={(e) => setNewEmpPrefix(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="นาย">นาย</option>
                      <option value="นาง">นาง</option>
                      <option value="นางสาว">นางสาว</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">ชื่อจริง *</label>
                    <input
                      type="text"
                      value={newEmpFirstName}
                      onChange={(e) => setNewEmpFirstName(e.target.value)}
                      placeholder="ชื่อจริง"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">นามสกุล</label>
                    <input
                      type="text"
                      value={newEmpLastName}
                      onChange={(e) => setNewEmpLastName(e.target.value)}
                      placeholder="นามสกุล"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">ชื่อเล่น</label>
                    <input
                      type="text"
                      value={newEmpNickname}
                      onChange={(e) => setNewEmpNickname(e.target.value)}
                      placeholder="ชื่อเล่น"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">วันเกิด</label>
                    <input
                      type="date"
                      value={newEmpBirthday}
                      onChange={(e) => {
                        setNewEmpBirthday(e.target.value);
                        if (e.target.value) {
                          const birthDate = new Date(e.target.value);
                          const today = new Date();
                          let ageVal = today.getFullYear() - birthDate.getFullYear();
                          const m = today.getMonth() - birthDate.getMonth();
                          if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                            ageVal--;
                          }
                          setNewEmpAge(ageVal);
                          setNewEmpCalculatedAge(ageVal);
                        }
                      }}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">อายุตัว (ปี)</label>
                    <input
                      type="number"
                      value={newEmpAge || ""}
                      onChange={(e) => {
                        setNewEmpAge(Number(e.target.value));
                        setNewEmpCalculatedAge(Number(e.target.value));
                      }}
                      placeholder="คำนวณอัตโนมัติ"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>
              </div>

              {/* ส่วนที่ 2: สังกัดและตำแหน่งงาน */}
              <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 space-y-3">
                <h4 className="text-xs font-extrabold text-indigo-700 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                  2. สังกัดและสายงานผลิต (Organization & Roles)
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">ตำแหน่งงาน *</label>
                    <select 
                      value={newEmpRole}
                      onChange={(e) => setNewEmpRole(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      required
                    >
                      <option value="O&M Electrical">O&M Electrical</option>
                      <option value="O&M Mechanical">O&M Mechanical</option>
                      <option value="O&M Generator">O&M Generator</option>
                      <option value="O&M Specialist">O&M Specialist</option>
                      <option value="ผู้ควบคุมงานขนถ่ายสินค้า">ผู้ควบคุมงานขนถ่ายสินค้า</option>
                      <option value="ผู้ควบคุมงานจักรกลหนัก">ผู้ควบคุมงานจักรกลหนัก</option>
                      <option value="Engineer">Engineer</option>
                      <option value="พนักงานขับจักรกลหนัก">พนักงานขับจักรกลหนัก</option>
                      <option value="พนักงานขับเครน">พนักงานขับเครน</option>
                      <option value="พนักงานขับเครน ชำนาญการ">พนักงานขับเครน ชำนาญการ</option>
                      <option value="ปากเรือ">ปากเรือ</option>
                      <option value="ปากเรือ ชำนาญการ">ปากเรือ ชำนาญการ</option>
                      <option value="ผู้จัดการแผนก">ผู้จัดการแผนก</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">สังกัดแผนก</label>
                    <select 
                      value={newEmpDept}
                      onChange={(e) => setNewEmpDept(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="inter2">INTER 2</option>
                      <option value="inter3">INTER 3</option>
                      <option value="inter5">INTER 5</option>
                      <option value="inter7">INTER 7</option>
                      <option value="heavy">Heavy Machine</option>
                      <option value="ecc">ECC</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">ฝ่าย</label>
                    <select 
                      value={newEmpDivision}
                      onChange={(e) => setNewEmpDivision(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="ITS Operation and Technical">ITS Operation and Technical</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  {/* Hidden Group field per user request */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">ปฏิทินทำงาน</label>
                    <select
                      value={newEmpCalendarType}
                      onChange={(e) => setNewEmpCalendarType(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="ปฏิทิน 2 ทีม (คู่กะ 12 ชม. ทำ 12 พัก 12)">ปฏิทิน 2 ทีม (คู่กะ 12 ชม. ทำ 12 พัก 12)</option>
                      <option value="ปฏิทิน 3 ทีม (3 กะ 8 ชม. 8-8-8 สามคน)">ปฏิทิน 3 ทีม (3 กะ 8 ชม. 8-8-8 สามคน)</option>
                      <option value="วันทำงานปกติ 6 วันต่อสัปดาห์ (จันทร์-เสาร์)">วันทำงานปกติ 6 วันต่อสัปดาห์ (จันทร์-เสาร์)</option>
                      <option value="ทำงานวันจันทร์-ศุกร์ (Office)">ทำงานวันจันทร์-ศุกร์ (Office)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* ส่วนที่ 3: สัญญาจ้างและเป้าหมายโอที */}
              <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 space-y-3">
                <h4 className="text-xs font-extrabold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                  3. สัญญาจ้างงานและเป้าหมายโอที (Employment & Quota)
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">ฐานเงินเดือน ปี 2568 (บาท)</label>
                    {canAccessSalary ? (
                      <input 
                        type="number"
                        value={newEmpSalary || ""}
                        onChange={(e) => setNewEmpSalary(Number(e.target.value))}
                        placeholder="เช่น 18000"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    ) : (
                      <div className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-400">
                        🔒 เฉพาะสิทธิ์กลุ่ม HR
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">วันเริ่มงาน</label>
                    <input 
                      type="date"
                      value={newEmpStartDate}
                      onChange={(e) => {
                        setNewEmpStartDate(e.target.value);
                        if (e.target.value) {
                          const start = new Date(e.target.value);
                          const diff = Date.now() - start.getTime();
                          const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
                          const months = Math.floor((diff % (1000 * 60 * 60 * 24 * 365.25)) / (1000 * 60 * 60 * 24 * 30.43));
                          setNewEmpTenure(`${years} ปี ${months} เดือน`);
                        }
                      }}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">วันที่ผ่านทดลองงาน</label>
                    <input 
                      type="date"
                      value={newEmpProbationDate}
                      onChange={(e) => setNewEmpProbationDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">อายุงาน (คำนวณอัตโนมัติ)</label>
                    <input 
                      type="text"
                      value={newEmpTenure}
                      onChange={(e) => setNewEmpTenure(e.target.value)}
                      placeholder="เช่น 1 ปี 4 เดือน"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">โควตาเป้าหมาย OT (ชม./เดือน)</label>
                    <input 
                      type="number"
                      value={newEmpTargetOt}
                      onChange={(e) => setNewEmpTargetOt(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* ส่วนที่ 4: สถานะการทำงานและวันที่ลาออก */}
              <div className="bg-rose-50/40 p-4 rounded-2xl border border-rose-100 space-y-3">
                <h4 className="text-xs font-extrabold text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-600"></span>
                  4. สถานะการทำงานและวันที่ลาออก (Employment & Resignation Status)
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 mb-1">สถานะพนักงาน *</label>
                    <select
                      value={newEmpStatus}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNewEmpStatus(val);
                        if (val === "Active") {
                          setNewEmpResignationDate("");
                        }
                      }}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                    >
                      <option value="Active">ปฏิบัติงานปกติ (Active)</option>
                      <option value="Inactive">พ้นสภาพ / ไม่ได้ปฏิบัติงาน (Inactive)</option>
                      <option value="Resigned">พนักงานลาออก (Resigned)</option>
                      <option value="Retired">พนักงานเกษียณอายุ (Retired)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 mb-1">วันที่ลาออก (ถ้าระบุ)</label>
                    <input
                      type="date"
                      value={newEmpResignationDate}
                      onChange={(e) => {
                        setNewEmpResignationDate(e.target.value);
                        if (e.target.value) {
                          setNewEmpStatus("Resigned");
                        }
                      }}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddEmployeeModal(false)}
                  className="w-24 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={addEmpLoading}
                  className="w-36 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold shadow-md shadow-blue-500/10 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  {addEmpLoading ? (
                    <>
                      <span className="text-sm animate-spin inline-block">🌐</span>
                      <span>กำลังบันทึก...</span>
                    </>
                  ) : (
                    <span>เพิ่มพนักงาน</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* OVERLAY / MODAL: EDIT EXISTING EMPLOYEE */}
      {/* ======================================= */}
      {showEditEmployeeModal && editingEmployee && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-slate-900">แก้ไขข้อมูลพนักงาน</h3>
                <p className="text-xs text-slate-500">รหัสพนักงาน: <strong className="font-mono text-blue-600">{editingEmployee.id}</strong></p>
              </div>
              <button 
                onClick={() => {
                  setShowEditEmployeeModal(false);
                  setEditingEmployee(null);
                }}
                className="p-1.5 hover:bg-slate-200/60 rounded-full text-slate-400"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditEmployee} className="p-6 space-y-5 overflow-y-auto flex-1">
              {/* ส่วนที่ 1: ข้อมูลทั่วไป */}
              <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 space-y-3">
                <h4 className="text-xs font-extrabold text-blue-700 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                  1. ข้อมูลทั่วไปของบุคลากร (General Profile)
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">คำนำหน้า</label>
                    <select
                      value={editEmpPrefix}
                      onChange={(e) => setEditEmpPrefix(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="นาย">นาย</option>
                      <option value="นาง">นาง</option>
                      <option value="นางสาว">นางสาว</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">ชื่อจริง *</label>
                    <input
                      type="text"
                      value={editEmpFirstName}
                      onChange={(e) => setEditEmpFirstName(e.target.value)}
                      placeholder="ชื่อจริง"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">นามสกุล</label>
                    <input
                      type="text"
                      value={editEmpLastName}
                      onChange={(e) => setEditEmpLastName(e.target.value)}
                      placeholder="นามสกุล"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">ชื่อเล่น</label>
                    <input
                      type="text"
                      value={editEmpNickname}
                      onChange={(e) => setEditEmpNickname(e.target.value)}
                      placeholder="ชื่อเล่น"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">วันเกิด</label>
                    <input
                      type="date"
                      value={editEmpBirthday}
                      onChange={(e) => {
                        setEditEmpBirthday(e.target.value);
                        if (e.target.value) {
                          const birthYear = new Date(e.target.value).getFullYear();
                          const currentYear = new Date().getFullYear();
                          setEditEmpAge(currentYear - birthYear);
                          setEditEmpCalculatedAge(currentYear - birthYear);
                        }
                      }}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">อายุตัว (ปี)</label>
                    <input
                      type="number"
                      value={editEmpAge || ""}
                      onChange={(e) => {
                        setEditEmpAge(Number(e.target.value));
                        setEditEmpCalculatedAge(Number(e.target.value));
                      }}
                      placeholder="คำนวณอัตโนมัติ"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>
              </div>

              {/* ส่วนที่ 2: สังกัดและตำแหน่งงาน */}
              <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 space-y-3">
                <h4 className="text-xs font-extrabold text-indigo-700 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                  2. สังกัดและสายงานผลิต (Organization & Roles)
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">ตำแหน่งงาน *</label>
                    <select 
                      value={editEmpRole}
                      onChange={(e) => setEditEmpRole(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      required
                    >
                      <option value="O&M Electrical">O&M Electrical</option>
                      <option value="O&M Mechanical">O&M Mechanical</option>
                      <option value="O&M Generator">O&M Generator</option>
                      <option value="O&M Specialist">O&M Specialist</option>
                      <option value="ผู้ควบคุมงานขนถ่ายสินค้า">ผู้ควบคุมงานขนถ่ายสินค้า</option>
                      <option value="ผู้ควบคุมงานจักรกลหนัก">ผู้ควบคุมงานจักรกลหนัก</option>
                      <option value="Engineer">Engineer</option>
                      <option value="พนักงานขับจักรกลหนัก">พนักงานขับจักรกลหนัก</option>
                      <option value="พนักงานขับเครน">พนักงานขับเครน</option>
                      <option value="พนักงานขับเครน ชำนาญการ">พนักงานขับเครน ชำนาญการ</option>
                      <option value="ปากเรือ">ปากเรือ</option>
                      <option value="ปากเรือ ชำนาญการ">ปากเรือ ชำนาญการ</option>
                      <option value="ผู้จัดการแผนก">ผู้จัดการแผนก</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">สังกัดแผนก</label>
                    <select 
                      value={editEmpDept}
                      onChange={(e) => setEditEmpDept(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="inter2">INTER 2</option>
                      <option value="inter3">INTER 3</option>
                      <option value="inter5">INTER 5</option>
                      <option value="inter7">INTER 7</option>
                      <option value="heavy">Heavy Machine</option>
                      <option value="ecc">ECC</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">ฝ่าย</label>
                    <select 
                      value={editEmpDivision || "ITS Operation and Technical"}
                      onChange={(e) => setEditEmpDivision(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="ITS Operation and Technical">ITS Operation and Technical</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  {/* Hidden Group field per user request */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">ปฏิทินทำงาน</label>
                    <select
                      value={editEmpCalendarType}
                      onChange={(e) => setEditEmpCalendarType(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="ปฏิทิน 2 ทีม (คู่กะ 12 ชม. ทำ 12 พัก 12)">ปฏิทิน 2 ทีม (คู่กะ 12 ชม. ทำ 12 พัก 12)</option>
                      <option value="ปฏิทิน 3 ทีม (3 กะ 8 ชม. 8-8-8 สามคน)">ปฏิทิน 3 ทีม (3 กะ 8 ชม. 8-8-8 สามคน)</option>
                      <option value="วันทำงานปกติ 6 วันต่อสัปดาห์ (จันทร์-เสาร์)">วันทำงานปกติ 6 วันต่อสัปดาห์ (จันทร์-เสาร์)</option>
                      <option value="ทำงานวันจันทร์-ศุกร์ (Office)">ทำงานวันจันทร์-ศุกร์ (Office)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* ส่วนที่ 3: สัญญาจ้างและสิทธิ์ OT */}
              <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 space-y-3">
                <h4 className="text-xs font-extrabold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                  3. สัญญาจ้างงานและเป้าหมายโอที (Employment & Quota)
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">ฐานเงินเดือน ปี 2568 (บาท)</label>
                    {canAccessSalary ? (
                      <input 
                        type="number"
                        value={editEmpSalary || ""}
                        onChange={(e) => setEditEmpSalary(Number(e.target.value))}
                        placeholder="เช่น 18000"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    ) : (
                      <div className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-400">
                        🔒 เฉพาะสิทธิ์กลุ่ม HR
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">วันเริ่มงาน</label>
                    <input 
                      type="date"
                      value={editEmpStartDate}
                      onChange={(e) => {
                        setEditEmpStartDate(e.target.value);
                        if (e.target.value) {
                          const start = new Date(e.target.value);
                          const diff = Date.now() - start.getTime();
                          const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
                          const months = Math.floor((diff % (1000 * 60 * 60 * 24 * 365.25)) / (1000 * 60 * 60 * 24 * 30.43));
                          setEditEmpTenure(`${years} ปี ${months} เดือน`);
                        }
                      }}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">วันที่ผ่านทดลองงาน</label>
                    <input 
                      type="date"
                      value={editEmpProbationDate}
                      onChange={(e) => setEditEmpProbationDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">อายุงาน (คำนวณอัตโนมัติ)</label>
                    <input 
                      type="text"
                      value={editEmpTenure}
                      onChange={(e) => setEditEmpTenure(e.target.value)}
                      placeholder="เช่น 1 ปี 4 เดือน"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">โควตาเป้าหมาย OT (ชม./เดือน)</label>
                    <input 
                      type="number"
                      value={editEmpTargetOt}
                      onChange={(e) => setEditEmpTargetOt(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* ส่วนที่ 4: สถานะการทำงานและวันที่ลาออก */}
              <div className="bg-rose-50/40 p-4 rounded-2xl border border-rose-100 space-y-3">
                <h4 className="text-xs font-extrabold text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-600"></span>
                  4. สถานะการทำงานและวันที่ลาออก (Employment & Resignation Status)
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 mb-1">สถานะพนักงาน *</label>
                    <select
                      value={editEmpStatus}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEditEmpStatus(val);
                        if (val === "Active") {
                          setEditEmpResignationDate("");
                        }
                      }}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                    >
                      <option value="Active">ปฏิบัติงานปกติ (Active)</option>
                      <option value="Inactive">พ้นสภาพ / ไม่ได้ปฏิบัติงาน (Inactive)</option>
                      <option value="Resigned">พนักงานลาออก (Resigned)</option>
                      <option value="Retired">พนักงานเกษียณอายุ (Retired)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 mb-1">วันที่ลาออก (ถ้าระบุ)</label>
                    <input
                      type="date"
                      value={editEmpResignationDate}
                      onChange={(e) => {
                        setEditEmpResignationDate(e.target.value);
                        if (e.target.value) {
                          setEditEmpStatus("Resigned");
                        }
                      }}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex gap-2 items-center">
                {["HR", "HR Section Manager", "ผู้ดูแลระบบ"].includes(currentUser?.role || "") && (
                  <button
                    type="button"
                    onClick={() => handleDeleteEmployee(editingEmployee.id)}
                    className="px-3.5 py-2.5 bg-red-50 text-red-600 rounded-xl text-xs font-bold hover:bg-red-100 hover:text-red-700 transition-colors mr-auto"
                    title="ลบพนักงานออกจากระบบ"
                  >
                    ลบพนักงาน
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setShowEditEmployeeModal(false);
                    setEditingEmployee(null);
                  }}
                  className="w-24 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 shadow-md shadow-blue-500/10"
                >
                  บันทึกการแก้ไข
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* OVERLAY / MODAL: VIEW EMPLOYEE PROFILE DETAILS */}
      {/* ======================================= */}
      {viewingEmployeeDetails && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
            {/* Header / Avatar Banner */}
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-start">
              <div className="flex items-center gap-5">
                <EmployeeAvatar 
                  empId={viewingEmployeeDetails.id} 
                  empName={viewingEmployeeDetails.name} 
                  className="w-24 h-24 sm:w-28 sm:h-28 text-2xl border-4 border-white shadow-xl rounded-2xl flex-shrink-0 object-cover" 
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black text-slate-900">
                      {viewingEmployeeDetails.name?.startsWith(viewingEmployeeDetails.prefix || "")
                        ? viewingEmployeeDetails.name
                        : `${viewingEmployeeDetails.prefix || ""}${viewingEmployeeDetails.name}`}
                    </h3>
                    {viewingEmployeeDetails.nickname && (
                      <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-xl text-xs font-extrabold">
                        ({viewingEmployeeDetails.nickname})
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 font-mono mt-1">รหัสพนักงาน: <span className="text-slate-800 font-bold">{viewingEmployeeDetails.id}</span></p>
                  <p className="text-xs text-indigo-600 font-bold mt-1">
                    {viewingEmployeeDetails.role} • แผนก {
                      state.departments.find(d => d.id === viewingEmployeeDetails.deptId)?.nameTh || viewingEmployeeDetails.deptId
                    }
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setViewingEmployeeDetails(null)}
                className="p-1.5 hover:bg-slate-200/60 rounded-full text-slate-400 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Profile Content Body */}
            <div className="p-6 space-y-5 overflow-y-auto flex-1 text-slate-700 text-xs">
              {/* Category 1: ข้อมูลทั่วไป */}
              <div className="space-y-2.5">
                <h4 className="font-extrabold text-blue-700 uppercase tracking-wider pb-1.5 border-b border-slate-100 flex items-center gap-1.5">
                  ข้อมูลทั่วไปของพนักงาน (General)
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50/50 p-3 rounded-2xl">
                  <div>
                    <span className="block text-[10px] text-slate-400 font-medium">คำนำหน้า</span>
                    <span className="font-bold text-slate-800">{viewingEmployeeDetails.prefix || "-"}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 font-medium">ชื่อจริง</span>
                    <span className="font-bold text-slate-800">{viewingEmployeeDetails.firstName || viewingEmployeeDetails.name?.split(" ")[0] || "-"}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 font-medium">นามสกุล</span>
                    <span className="font-bold text-slate-800">{viewingEmployeeDetails.lastName || viewingEmployeeDetails.name?.split(" ")[1] || "-"}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 font-medium">วันเกิด (ปี/เดือน/วัน)</span>
                    <span className="font-bold text-slate-800 font-mono">{viewingEmployeeDetails.birthday || "-"}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50/50 p-3 rounded-2xl pt-0">
                  <div>
                    <span className="block text-[10px] text-slate-400 font-medium">อายุ</span>
                    <span className="font-bold text-slate-800">{viewingEmployeeDetails.age || viewingEmployeeDetails.calculatedAge || "-"} ปี</span>
                  </div>
                </div>
              </div>

              {/* Category 2: โครงสร้างสังกัด */}
              <div className="space-y-2.5">
                <h4 className="font-extrabold text-indigo-700 uppercase tracking-wider pb-1.5 border-b border-slate-100 flex items-center gap-1.5">
                  สังกัดและโครงสร้างสายปฏิบัติงาน (Organization)
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50/50 p-3 rounded-2xl">
                  <div>
                    <span className="block text-[10px] text-slate-400 font-medium">ตำแหน่งงาน</span>
                    <span className="font-bold text-slate-800">{viewingEmployeeDetails.role || "-"}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 font-medium">แผนกปฏิบัติการ</span>
                    <span className="font-bold text-slate-800">
                      {state.departments.find(d => d.id === viewingEmployeeDetails.deptId)?.nameTh || viewingEmployeeDetails.deptId}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 font-medium">ฝ่ายงาน</span>
                    <span className="font-bold text-slate-800">{viewingEmployeeDetails.division || "-"}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50/50 p-3 rounded-2xl pt-0">
                  <div className="col-span-2">
                    <span className="block text-[10px] text-slate-400 font-medium">ปฏิทินปฏิบัติงาน</span>
                    <span className="font-bold text-indigo-700">{viewingEmployeeDetails.calendarType || "-"}</span>
                  </div>
                </div>
              </div>

              {/* Category 3: ประวัติพนักงานและการปฏิบัติงาน */}
              <div className="space-y-2.5">
                <h4 className="font-extrabold text-emerald-700 uppercase tracking-wider pb-1.5 border-b border-slate-100 flex items-center gap-1.5">
                  ประวัติพนักงานและการปฏิบัติงาน (Employee Profile History)
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50/50 p-3 rounded-2xl">
                  {canAccessSalary && (
                    <div>
                      <span className="block text-[10px] text-slate-400 font-medium">ฐานเงินเดือน ปี 2568</span>
                      <span className="font-bold text-slate-800 font-mono">
                        {viewingEmployeeDetails.salary?.toLocaleString() || "0"}
                      </span>
                    </div>
                  )}
                  <div>
                    <span className="block text-[10px] text-slate-400 font-medium">วันเริ่มงาน</span>
                    <span className="font-bold text-slate-800 font-mono">{viewingEmployeeDetails.startDate || "-"}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 font-medium">อายุงานรวม</span>
                    <span className="font-bold text-slate-800">{viewingEmployeeDetails.tenure || "-"}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 font-medium">วันที่ผ่านทดลองงาน</span>
                    <span className="font-bold text-slate-800 font-mono">{viewingEmployeeDetails.probationDate || "-"}</span>
                  </div>
                </div>

                {/* Leave Days Summary Card */}
                <div className="space-y-2 pt-1">
                  <span className="block text-[11px] font-extrabold text-amber-800">สรุปจำนวนวันลาพนักงาน (Leave Quota Summary)</span>
                  <div className="grid grid-cols-3 gap-3 bg-amber-50/40 p-3 rounded-2xl border border-amber-100/60 text-center">
                    <div className="bg-white p-2.5 rounded-xl border border-amber-200/60 shadow-sm">
                      <span className="block text-[10px] font-bold text-amber-700">สิทธิวันลาทั้งหมด</span>
                      <span className="text-sm font-black text-amber-900 font-mono">46 วัน</span>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-rose-200/60 shadow-sm">
                      <span className="block text-[10px] font-bold text-rose-700">ใช้ไปแล้วรวม</span>
                      <span className="text-sm font-black text-rose-700 font-mono">
                        {((viewingEmployeeDetails.sickLeaveUsed || 0) + (viewingEmployeeDetails.personalLeaveUsed || 0) + (viewingEmployeeDetails.vacationLeaveUsed || 0))} วัน
                      </span>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-emerald-200/60 shadow-sm">
                      <span className="block text-[10px] font-bold text-emerald-700">วันลาคงเหลือรวม</span>
                      <span className="text-sm font-black text-emerald-700 font-mono">
                        {Math.max(0, 46 - ((viewingEmployeeDetails.sickLeaveUsed || 0) + (viewingEmployeeDetails.personalLeaveUsed || 0) + (viewingEmployeeDetails.vacationLeaveUsed || 0)))} วัน
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* OT Ratio % vs Base Salary */}
                {(() => {
                  const salary = viewingEmployeeDetails.salary || 15000;
                  const actualOtHours = viewingEmployeeDetails.actualOt || 0;
                  const hourlyRate = (salary / 240) * 1.5;
                  const monthlyOtCost = Math.round(actualOtHours * hourlyRate);
                  const otSalaryPct = Math.round((monthlyOtCost / salary) * 100);
                  const isMax = otSalaryPct >= 100;

                  return (
                    <div className="space-y-2 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-slate-800">
                          สัดส่วนค่า OT สะสมเทียบฐานเงินเดือน
                        </span>
                        {isMax ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-[11px] font-black shadow-sm animate-pulse">
                            🚨 MAX ({otSalaryPct}%)
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[11px] font-extrabold">
                            {otSalaryPct}% ของฐานเงินเดือน
                          </span>
                        )}
                      </div>

                      <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden p-0.5 shadow-inner">
                        <div 
                          style={{ width: `${Math.min(100, otSalaryPct)}%` }}
                          className={`h-full rounded-full transition-all duration-500 ${
                            isMax ? "bg-gradient-to-r from-rose-500 via-red-600 to-rose-700" : "bg-gradient-to-r from-blue-500 to-indigo-600"
                          }`}
                        ></div>
                      </div>

                      {isMax && (
                        <div className="p-2.5 rounded-xl bg-rose-100/90 border border-rose-300 text-rose-950 text-[11px] font-bold flex items-center gap-2 mt-1.5 shadow-sm">
                          <span className="text-base">⚠️</span>
                          <span>แจ้งเตือนผู้จัดการ: สัดส่วนค่า OT ของพนักงานเกิน 100% ของฐานเงินเดือนแล้ว! (สถิติปัจจุบัน {otSalaryPct}%)</span>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

                {/* Category 4: โครงสร้างตำแหน่ง Job Value */}
                {(() => {
                  const matchJv = (jobValueRecords || []).find(r => 
                    String(r?.empId || "").toLowerCase() === String(viewingEmployeeDetails.id || "").toLowerCase() ||
                    String(r?.empName || "").toLowerCase() === String(viewingEmployeeDetails.name || "").toLowerCase()
                  );
                  if (!matchJv) return null;

                  const p25 = Number(matchJv.profit2025) || 0;
                  const p26 = Number(matchJv.profit2026) || 0;
                  const diff = p26 - p25;
                  const isGrowth = diff >= 0;

                  return (
                    <div className="space-y-2.5 pt-2">
                      <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                        <h4 className="font-extrabold text-blue-700 uppercase tracking-wider flex items-center gap-1.5">
                          📈 โครงสร้างตำแหน่ง Job Value (Job Value Structure & Growth 68/69)
                        </h4>
                        {isGrowth ? (
                          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-black border border-emerald-300 shadow-sm">
                            🟢 ต่อยอด (+{diff.toLocaleString()})
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-rose-100 text-rose-800 rounded-full text-xs font-black border border-rose-300 shadow-sm">
                            🔴 ไม่ต่อยอด (-{Math.abs(diff).toLocaleString()})
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-blue-50/40 p-4 rounded-2xl border border-blue-100">
                        <div>
                          <span className="block text-[10px] text-emerald-700 font-bold">รายได้เฉลี่ย/เดือน</span>
                          <span className="font-black text-emerald-800 font-mono text-sm">{(Number(matchJv.avgRevenue) || 0).toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] text-rose-700 font-bold">ต้นทุนเฉลี่ย/เดือน</span>
                          <span className="font-black text-rose-800 font-mono text-sm">{(Number(matchJv.avgCost) || 0).toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] text-slate-600 font-bold">กำไรสะสมปี 2568 (2025)</span>
                          <span className="font-bold text-slate-800 font-mono text-sm">{p25.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] text-blue-700 font-bold">กำไรสะสมปี 2569 (2026)</span>
                          <span className="font-black text-blue-800 font-mono text-sm">{p26.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Comparison Growth Banner */}
                      <div className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isGrowth ? "bg-emerald-50/90 border-emerald-200 text-emerald-950" : "bg-rose-50/90 border-rose-200 text-rose-950"
                      }`}>
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{isGrowth ? "🚀" : "📉"}</span>
                          <div>
                            <div className="text-xs font-black">
                              ผลการเปรียบเทียบกำไรปี 2568 ➔ 2569: {isGrowth ? "เติบโตต่อยอด (Positive Growth)" : "ลดลงไม่ต่อยอด (Performance Decline)"}
                            </div>
                            <div className="text-[11px] font-semibold opacity-85 mt-0.5">
                              ส่วนต่างผลงานสะสม: {isGrowth ? `เพิ่มขึ้น +${diff.toLocaleString()}` : `ลดลง -${Math.abs(diff).toLocaleString()}`}
                            </div>
                          </div>
                        </div>
                        <div className={`px-3 py-1.5 rounded-xl font-mono font-black text-xs self-start sm:self-auto ${
                          isGrowth ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"
                        }`}>
                          {isGrowth ? `🟢 ต่อยอด (+${diff.toLocaleString()})` : `🔴 ไม่ต่อยอด (-${Math.abs(diff).toLocaleString()})`}
                        </div>
                      </div>
                    </div>
                  );
                })()}
            </div>

            {/* Footer buttons */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setViewingEmployeeDetails(null);
                  startEditEmployee(viewingEmployeeDetails);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
              >
                ✏️ แก้ไขข้อมูลโปรไฟล์
              </button>
              <button
                type="button"
                onClick={() => setViewingEmployeeDetails(null)}
                className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 text-xs font-bold rounded-xl transition-colors"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* OVERLAY / MODAL: GEMINI AI COMPLIANCE AUDIT */}
      {/* ======================================= */}
      {showAiAuditModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
                  <Sparkles className="w-5 h-5 animate-spin" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-indigo-950">รายงานวิเคราะห์และตรวจสอบความปลอดภัยอัจฉริยะ (Gemini Live Audit)</h3>
                  <p className="text-[11px] text-indigo-600">วิเคราะห์ตามกฎหมายแรงงานไทยจำกัดชั่วโมงโอทีพนักงาน</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAiAuditModal(false)}
                className="p-1.5 hover:bg-slate-200/60 rounded-full text-slate-400 hover:text-slate-600 transition-colors font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 bg-slate-50 prose prose-slate max-w-none text-xs">
              {generatingAiReport ? (
                <div className="flex flex-col items-center justify-center py-16 space-y-4">
                  <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  <div className="text-center">
                    <p className="text-slate-700 font-bold animate-pulse text-xs">โมเดลอัจฉริยะ Gemini 3.5 Flash กำลังทำการตรวจคำนวนความเสี่ยงตารางกะ...</p>
                    <p className="text-slate-400 text-[10px] mt-1">วิเคราะห์กฎหมายพนักงานล่วงเวลา, ความเหนื่อยล้าทางกาย และสิทธิใช้งบประมาณรายหัว</p>
                  </div>
                </div>
              ) : (
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-inner whitespace-pre-wrap text-slate-700 leading-relaxed font-sans text-xs">
                  {aiReportText}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
              <button
                onClick={() => setShowAiAuditModal(false)}
                className="px-6 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors shadow-md shadow-slate-900/10"
              >
                เสร็จสิ้น / ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* OVERLAY / MODAL: ADD NEW USER ACCOUNT */}
      {/* ======================================= */}
      {showAddAccountModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200 flex flex-col animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">➕ เพิ่มผู้ใช้งาน / Admin ใหม่</h3>
                <p className="text-xs text-slate-500">สร้างบัญชีผู้ใช้ใหม่และกำหนดสิทธิ์เข้าถึงระบบ</p>
              </div>
              <button 
                onClick={() => setShowAddAccountModal(false)}
                className="p-1.5 hover:bg-slate-200/60 rounded-full text-slate-400 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddAccountSubmit} className="p-6 space-y-4">
              <div className="flex items-center gap-3 bg-blue-50/60 p-3 rounded-2xl border border-blue-100">
                <EmployeeAvatar empId={newAccountUsername} empName={newAccountName} avatarUrl={newAccountAvatar} className="w-12 h-12 flex-shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-slate-800">{newAccountName || "ชื่อพนักงาน"}</h4>
                  <p className="text-[10px] text-blue-600 font-mono">รหัสพนักงาน/Username: {newAccountUsername || "-"}</p>
                  <p className="text-[9px] text-slate-500">ระบบจะดึงรูปถ่ายพนักงานตรงตามรหัสให้อัตโนมัติ</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">ชื่อผู้ใช้งาน / รหัสพนักงาน (Username) <span className="text-red-500">*</span></label>
                <input 
                  type="text"
                  value={newAccountUsername}
                  onChange={(e) => {
                    setNewAccountUsername(e.target.value);
                    handleAutoPullEmployeePhoto(e.target.value, "add");
                  }}
                  placeholder="ป้อนรหัสพนักงาน หรือชื่อผู้ใช้ เช่น 1001"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:ring-2 focus:ring-blue-500/20 font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">รหัสผ่านสำหรับเข้าสู่ระบบ <span className="text-red-500">*</span></label>
                <input 
                  type="password"
                  value={newAccountPassword}
                  onChange={(e) => setNewAccountPassword(e.target.value)}
                  placeholder="กำหนดรหัสผ่าน (เริ่มต้น: 123456)"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">ชื่อ - นามสกุล <span className="text-red-500">*</span></label>
                <input 
                  type="text"
                  value={newAccountName}
                  onChange={(e) => setNewAccountName(e.target.value)}
                  placeholder="ป้อนชื่อและนามสกุลจริง"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">ลิงก์รูปภาพโปรไฟล์ (Avatar URL)</label>
                <input 
                  type="text"
                  value={newAccountAvatar}
                  onChange={(e) => setNewAccountAvatar(e.target.value)}
                  placeholder={`หากเว้นว่าง ระบบจะดึงรูปจากรหัส ${newAccountUsername || "พนักงาน"} อัตโนมัติ`}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">บทบาท (Role)</label>
                  <select 
                    value={newAccountRole}
                    onChange={(e) => setNewAccountRole(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:ring-2 focus:ring-blue-500/20 font-medium"
                  >
                    <option value="ผู้ดูแลระบบ">ผู้ดูแลระบบสูงสุด (Admin)</option>
                    <option value="HR">HR</option>
                    <option value="HR Section Manager">HR Section Manager</option>
                    <option value="Operation Dir">Operation Dir</option>
                    <option value="Operation Depart">Operation Depart</option>
                    <option value="Section Manager">Section Manager</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">แผนกที่รับผิดชอบ</label>
                  <select 
                    value={newAccountDeptId}
                    onChange={(e) => setNewAccountDeptId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:ring-2 focus:ring-blue-500/20 font-medium"
                  >
                    <option value="all">ทุกแผนก (All)</option>
                    <option value="inter2">INTER 2</option>
                    <option value="inter3">INTER 3</option>
                    <option value="inter5">INTER 5</option>
                    <option value="inter7">INTER 7</option>
                    <option value="heavy">Heavy Machine</option>
                    <option value="ecc">ECC</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2.5 py-1">
                <input 
                  type="checkbox"
                  id="newAccountCanBackup"
                  checked={newAccountCanBackup}
                  onChange={(e) => setNewAccountCanBackup(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer w-4 h-4"
                />
                <label htmlFor="newAccountCanBackup" className="text-xs font-bold text-slate-700 cursor-pointer select-none">
                  อนุญาตสิทธิ์การสำรอง/นำเข้าข้อมูลพนักงาน (Backup/Import/Export)
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddAccountModal(false)}
                  className="w-1/2 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 shadow-md shadow-blue-500/10 cursor-pointer"
                >
                  ➕ เพิ่มบัญชีผู้ใช้ใหม่
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* OVERLAY / MODAL: EDIT ACCOUNT DETAILS */}
      {/* ======================================= */}
      {showEditAccountModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200 flex flex-col animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">✏️ แก้ไขข้อมูลบัญชีผู้ใช้</h3>
                <p className="text-xs text-slate-500">แก้ไขข้อมูล Username, ชื่อแสดงผล, บทบาท หรือแผนกของพนักงาน</p>
              </div>
              <button 
                onClick={() => setShowEditAccountModal(false)}
                className="p-1.5 hover:bg-slate-200/60 rounded-full text-slate-400 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditAccountSubmit} className="p-6 space-y-4">
              <div className="flex items-center gap-3 bg-blue-50/60 p-3 rounded-2xl border border-blue-100">
                <EmployeeAvatar empId={editAccountUsername} empName={editAccountName} avatarUrl={editAccountAvatar} className="w-12 h-12 flex-shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-slate-800">{editAccountName || "ชื่อพนักงาน"}</h4>
                  <p className="text-[10px] text-blue-600 font-mono">รหัสพนักงาน/Username: {editAccountUsername || "-"}</p>
                  <p className="text-[9px] text-slate-500">ระบบดึงรูปถ่ายพนักงานตรงตามรหัสให้อัตโนมัติ</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">ชื่อผู้ใช้งาน / รหัสพนักงาน (Username) <span className="text-red-500">*</span></label>
                <input 
                  type="text"
                  value={editAccountUsername}
                  onChange={(e) => {
                    setEditAccountUsername(e.target.value);
                    handleAutoPullEmployeePhoto(e.target.value, "edit");
                  }}
                  placeholder="เช่น mfg_mgr, 1001 หรือรหัสพนักงาน"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:ring-2 focus:ring-blue-500/20 font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">ชื่อ - นามสกุล <span className="text-red-500">*</span></label>
                <input 
                  type="text"
                  value={editAccountName}
                  onChange={(e) => setEditAccountName(e.target.value)}
                  placeholder="ป้อนชื่อและนามสกุลจริง"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">ลิงก์รูปภาพโปรไฟล์ (Avatar URL)</label>
                <input 
                  type="text"
                  value={editAccountAvatar}
                  onChange={(e) => setEditAccountAvatar(e.target.value)}
                  placeholder={`หากเว้นว่าง ระบบจะดึงรูปจากรหัส ${editAccountUsername || "พนักงาน"} อัตโนมัติ`}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">บทบาท (Role)</label>
                  <select 
                    value={editAccountRole}
                    onChange={(e) => setEditAccountRole(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="Admin">Admin</option>
                    <option value="Co-admin">Co-admin</option>
                    <option value="User">User</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">แผนกที่รับผิดชอบ</label>
                  <select 
                    value={editAccountDeptId}
                    onChange={(e) => setEditAccountDeptId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="all">ทุกแผนก (All)</option>
                    <option value="inter2">INTER 2</option>
                    <option value="inter3">INTER 3</option>
                    <option value="inter5">INTER 5</option>
                    <option value="inter7">INTER 7</option>
                    <option value="heavy">Heavy Machine</option>
                    <option value="ecc">ECC</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2.5 py-1">
                <input 
                  type="checkbox"
                  id="editAccountCanBackup"
                  checked={editAccountCanBackup}
                  onChange={(e) => setEditAccountCanBackup(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer w-4 h-4"
                />
                <label htmlFor="editAccountCanBackup" className="text-xs font-bold text-slate-700 cursor-pointer select-none">
                  อนุญาตสิทธิ์การสำรอง/นำเข้าข้อมูลพนักงาน (Backup/Import/Export)
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditAccountModal(false)}
                  className="w-1/2 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 shadow-md shadow-blue-500/10 cursor-pointer"
                >
                  บันทึกการแก้ไข
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* ======================================= */}
      {/* OVERLAY / MODAL: RESET PASSWORD FOR OTHER USERS */}
      {/* ======================================= */}
      {showResetPasswordModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-slate-200 flex flex-col">
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-slate-900">🔑 รีเซ็ตรหัสผ่านบัญชีผู้ใช้</h3>
                <p className="text-xs text-slate-500">บัญชีเป้าหมาย: <strong className="font-mono text-blue-600">{resetTargetUsername}</strong></p>
              </div>
              <button 
                onClick={() => setShowResetPasswordModal(false)}
                className="p-1.5 hover:bg-slate-200/60 rounded-full text-slate-400"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleResetAccountPassword} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">รหัสผ่านใหม่สำหรับผู้ใช้</label>
                <input 
                  type="text"
                  value={newResetPassword}
                  onChange={(e) => setNewResetPassword(e.target.value)}
                  placeholder="เช่น รหัสผ่านใหม่ 8 ตัวขึ้นไป"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowResetPasswordModal(false)}
                  className="w-1/2 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 shadow-md shadow-blue-500/10"
                >
                  ยืนยันรีเซ็ตรหัส
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* OVERLAY / MODAL: BULK SHIFT SETTER */}
      {/* ======================================= */}
      {showBulkShiftModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 bg-indigo-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">⚡</span>
                <div>
                  <h3 className="text-sm font-extrabold">กำหนดกะงานแบบกลุ่ม (Bulk Shift Setter)</h3>
                  <p className="text-[10px] text-indigo-300">กำหนดกะงานให้พนักงานทั้งกลุ่มพร้อมกันในคลิกเดียว</p>
                </div>
              </div>
              <button onClick={() => setShowBulkShiftModal(false)} className="text-white hover:opacity-80 font-bold">✕</button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              {/* Hidden Group selector per user request */}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">เลือกรหัสกะที่จะกำหนด</label>
                <select
                  value={bulkShiftCode}
                  onChange={(e) => setBulkShiftCode(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 font-mono"
                >
                  <option value="M12">M12 (กะเช้า 12 ชม. / OT 4 ชม.)</option>
                  <option value="A12">A12 (กะบ่าย 12 ชม. / OT 4 ชม.)</option>
                  <option value="N12">N12 (กะดึก 12 ชม. / OT 4 ชม.)</option>
                  <option value="M16">M16 (กะควบเช้า 16 ชม. / OT 8 ชม.)</option>
                  <option value="N16">N16 (กะควบดึก 16 ชม. / OT 8 ชม.)</option>
                  <option value="OND">OND (ทำงานวันหยุด / OT 8 ชม.)</option>
                  <option value="M8">M8 (กะปกติ 8 ชม. / ไม่มี OT)</option>
                  <option value="O">O (วันหยุด Off)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ตั้งแต่วันที่</label>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    value={bulkStartDay}
                    onChange={(e) => setBulkStartDay(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ถึงวันที่</label>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    value={bulkEndDay}
                    onChange={(e) => setBulkEndDay(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex gap-2">
                <button onClick={() => setShowBulkShiftModal(false)} className="w-1/2 py-2.5 border border-slate-200 rounded-xl font-bold text-slate-500 hover:bg-slate-50">
                  ยกเลิก
                </button>
                <button onClick={handleApplyBulkShift} className="w-1/2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md shadow-indigo-500/10">
                  ⚡ ปรับกะยกกลุ่ม
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* OVERLAY / MODAL: OT REQUEST & APPROVAL */}
      {/* ======================================= */}
      {showOtRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 bg-slate-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-white text-lg font-bold">
                  🔴
                </div>
                <div>
                  <h3 className="text-base font-extrabold">รายการใบคำขอทำล่วงเวลา (OT Request & Approval Pipeline)</h3>
                  <p className="text-[10px] text-slate-400">ยื่นขอทำ OT และอนุมัติใบคำขอออนไลน์ก่อนการปฏิบัติงานจริง</p>
                </div>
              </div>
              <button onClick={() => setShowOtRequestModal(false)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 text-white font-bold">
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 bg-slate-50">
              
              {/* Form to submit OT request */}
              <form onSubmit={handleSubmitOtRequest} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span>➕</span> ยื่นใบคำขอทำ OT ออนไลน์ใหม่
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">เลือกพนักงาน</label>
                    <select
                      value={newOtReqEmpId}
                      onChange={(e) => setNewOtReqEmpId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700"
                    >
                      <option value="">-- เลือกพนักงาน --</option>
                      {(state?.employees || []).map(e => (
                        <option key={e.id} value={e.id}>[{e.id}] {e.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">วันที่ปฏิบัติงาน OT</label>
                    <input
                      type="date"
                      required
                      value={newOtReqDate}
                      onChange={(e) => setNewOtReqDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">จำนวนชั่วโมง OT (ชม.)</label>
                    <input
                      type="number"
                      min={1}
                      max={12}
                      value={newOtReqHours}
                      onChange={(e) => setNewOtReqHours(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">เหตุผลในการขอทำ OT</label>
                  <input
                    type="text"
                    required
                    value={newOtReqReason}
                    onChange={(e) => setNewOtReqReason(e.target.value)}
                    placeholder="ระบุเหตุผลความจำเป็น เช่น รองรับการเข้าเทียบเรือ..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/10 cursor-pointer">
                    📤 ยื่นคำขอทำ OT
                  </button>
                </div>
              </form>

              {/* Requests List & Pipeline */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex justify-between items-center">
                  <span>รายการคำขอในระบบ ({(otRequests || []).length} รายการ)</span>
                  <span className="text-[10px] font-extrabold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    รออนุมัติ: {(otRequests || []).filter(r => r?.status === "pending").length} รายการ
                  </span>
                </h4>

                <div className="space-y-2">
                  {(otRequests || []).map((req) => (
                    <div key={req.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div className="flex items-center gap-3">
                        <EmployeeAvatar empId={req.employeeId} empName={req.employeeName} className="w-9 h-9 flex-shrink-0" />
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="text-xs font-bold text-slate-800">{req.employeeName}</h5>
                            <span className="text-[10px] font-mono font-bold text-blue-600">[{req.employeeId}]</span>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                              req.status === "approved" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                              req.status === "rejected" ? "bg-red-50 text-red-700 border border-red-200" :
                              "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}>
                              {req.status === "approved" ? "✅ อนุมัติแล้ว" : req.status === "rejected" ? "❌ ไม่อนุมัติ" : "⏳ รอพิจารณา"}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            วันที่: <strong className="font-mono text-slate-700">{req.date}</strong> ({req.hours} ชม.) | เหตุผล: {req.reason}
                          </p>
                        </div>
                      </div>

                      {req.status === "pending" && (
                        <div className="flex items-center gap-1.5 self-end sm:self-auto">
                          <button
                            onClick={() => handleApproveOtRequest(req.id)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11px] font-bold shadow-sm cursor-pointer"
                          >
                            ✅ อนุมัติ
                          </button>
                          <button
                            onClick={() => handleRejectOtRequest(req.id)}
                            className="px-3 py-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 rounded-xl text-[11px] font-bold cursor-pointer"
                          >
                            ❌ ปฏิเสธ
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* OVERLAY / MODAL: VIEW JOB VALUE MONTHLY BREAKDOWN */}
      {/* ======================================= */}
      {viewingJobValueModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <EmployeeAvatar empId={viewingJobValueModal?.empId || ""} empName={viewingJobValueModal?.empName || ""} className="w-10 h-10 flex-shrink-0" />
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">{viewingJobValueModal?.empName || "-"}</h3>
                  <p className="text-xs text-slate-500 font-mono">
                    รหัส: {viewingJobValueModal?.empId || "-"} | แผนก: {viewingJobValueModal?.department || "-"} | ตำแหน่ง: {viewingJobValueModal?.position || "-"}
                  </p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setViewingJobValueModal(null)}
                className="p-1.5 hover:bg-slate-200/60 rounded-full text-slate-400 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                  <span className="text-[10px] font-bold text-emerald-700 block">รายได้เฉลี่ย/เดือน</span>
                  <span className="text-lg font-black text-emerald-800 font-mono">{(Number(viewingJobValueModal?.avgRevenue) || 0).toLocaleString()}</span>
                </div>
                <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100">
                  <span className="text-[10px] font-bold text-rose-700 block">ต้นทุนเฉลี่ย/เดือน</span>
                  <span className="text-lg font-black text-rose-800 font-mono">{(Number(viewingJobValueModal?.avgCost) || 0).toLocaleString()}</span>
                </div>
                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                  <span className="text-[10px] font-bold text-blue-700 block">กำไรสะสมปี 2026</span>
                  <span className="text-lg font-black text-blue-800 font-mono">{(Number(viewingJobValueModal?.profit2026) || 0).toLocaleString()}</span>
                </div>
              </div>

              {/* Monthly Breakdown Table */}
              <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
                <div className="p-3 bg-slate-100 border-b border-slate-200 flex justify-between items-center">
                  <h4 className="text-xs font-bold text-slate-800">ตารางรายได้-ต้นทุน-กำไร รายเดือน 12 เดือน (Jan - Dec)</h4>
                </div>
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-white border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase">
                      <th className="px-3 py-2">เดือน</th>
                      <th className="px-3 py-2 text-right text-emerald-700">Revenue (รายได้)</th>
                      <th className="px-3 py-2 text-right text-rose-700">Cost (ต้นทุน)</th>
                      <th className="px-3 py-2 text-right text-blue-700">Profit (กำไร)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/60 font-mono">
                    {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((m, idx) => {
                      const rev = Number((viewingJobValueModal?.monthlyRevenue || [])[idx]) || 0;
                      const cost = Number((viewingJobValueModal?.monthlyCost || [])[idx]) || 0;
                      const prof = Number((viewingJobValueModal?.monthlyProfit || [])[idx]) || 0;
                      return (
                        <tr key={m} className="hover:bg-white/60">
                          <td className="px-3 py-2 font-sans font-bold text-slate-700">{m}</td>
                          <td className="px-3 py-2 text-right text-emerald-600 font-bold">{rev.toLocaleString()}</td>
                          <td className="px-3 py-2 text-right text-rose-600 font-bold">{cost.toLocaleString()}</td>
                          <td className="px-3 py-2 text-right text-blue-700 font-extrabold">{prof.toLocaleString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                type="button"
                onClick={() => setViewingJobValueModal(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* OVERLAY / MODAL: BIRTHDAY CELEBRATION POPUP */}
      {/* ======================================= */}
      {(() => {
        const today = new Date();
        const tMonth = today.getMonth() + 1;
        const tDay = today.getDate();

        const deptBirthdays = (state?.employees || []).filter(emp => {
          if (!emp.birthday) return false;
          const isDeptMatch = isHrOrFullAccess || !currentUser?.deptId || emp.deptId === currentUser.deptId || normalizeDeptId(emp.deptId) === normalizeDeptId(currentUser.deptId);
          if (!isDeptMatch) return false;

          const bStr = String(emp.birthday).toLowerCase();
          const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
          let bMonth = 0;
          let bDay = 0;

          months.forEach((m, idx) => {
            if (bStr.includes(m)) bMonth = idx + 1;
          });

          if (bStr.includes("-")) {
            const parts = bStr.split("-");
            if (parts.length === 3) {
              bMonth = parseInt(parts[1], 10) || bMonth;
              bDay = parseInt(parts[2], 10) || bDay;
            }
          } else if (bStr.includes("/")) {
            const parts = bStr.split("/");
            if (parts.length === 3) {
              bMonth = parseInt(parts[1], 10) || bMonth;
              bDay = parseInt(parts[0], 10) || bDay;
            }
          }

          return bMonth === tMonth && (bDay === tDay || bStr.includes(String(tDay)));
        });

        if (deptBirthdays.length === 0 || dismissedBirthdayPopup) return null;

        return (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-amber-200 flex flex-col animate-in fade-in zoom-in-95 duration-200 text-center">
              {/* Birthday Header Banner */}
              <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 p-6 text-white relative shadow-md">
                <div className="w-10 h-10 mx-auto mb-2 bg-white/20 rounded-full flex items-center justify-center font-black text-xs tracking-wider shadow-inner">
                  HBD
                </div>
                <h3 className="text-xl font-black">สุขสันต์วันเกิดพนักงานในทีม!</h3>
                <p className="text-xs text-amber-100 font-bold mt-1">แจ้งเตือนวันเกิดพนักงานในสังกัดประจำวันนี้</p>
                <button 
                  type="button"
                  onClick={handleDismissBirthdayPopup}
                  className="absolute top-3 right-3 text-white/80 hover:text-white p-1 rounded-full text-lg cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-4">
                {deptBirthdays.map(bEmp => (
                  <div key={bEmp.id} className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 flex items-center gap-4 text-left shadow-sm">
                    <EmployeeAvatar empId={bEmp.id} empName={bEmp.name} className="w-14 h-14 border-2 border-white shadow-md flex-shrink-0 object-cover" />
                    <div>
                      <h4 className="text-base font-black text-slate-900">{bEmp.name}</h4>
                      <p className="text-xs text-indigo-700 font-bold mt-0.5">
                        {bEmp.role} • แผนก {getDeptName(bEmp.deptId, state?.departments)}
                      </p>
                      <p className="text-[11px] text-amber-800 font-extrabold mt-1">
                        ครบรอบอายุ {bEmp.age || bEmp.calculatedAge || 30} ปีในวันนี้!
                      </p>
                    </div>
                  </div>
                ))}

                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      alert("ส่งคำอวยพรวันเกิดให้พนักงานในสังกัดเรียบร้อยแล้ว!");
                      handleDismissBirthdayPopup();
                    }}
                    className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-2xl text-xs font-black shadow-md cursor-pointer transition-all"
                  >
                    ร่วมส่งคำอวยพรวันเกิด
                  </button>
                  <button
                    type="button"
                    onClick={handleDismissBirthdayPopup}
                    className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition-all cursor-pointer"
                  >
                    ปิด
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ======================================= */}
      {/* OVERLAY / MODAL: EMPLOYEE DAILY SHIFT EDITOR */}
      {/* ======================================= */}
      {editingEmployeeShiftsModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-hidden shadow-2xl border border-slate-200 flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 bg-slate-900 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <EmployeeAvatar empId={editingEmployeeShiftsModal.id} empName={editingEmployeeShiftsModal.name} className="w-11 h-11 border-2 border-white/20 shadow-md" />
                <div>
                  <h3 className="text-base font-black text-white">{editingEmployeeShiftsModal.name} ({editingEmployeeShiftsModal.id})</h3>
                  <p className="text-xs text-sky-300 font-bold mt-0.5">
                    ตำแหน่ง: {editingEmployeeShiftsModal.role || "Operator"} • แผนก: {getDeptName(editingEmployeeShiftsModal.deptId, state?.departments)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingEmployeeShiftsModal(null)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer border border-slate-700 font-sans"
              >
                ปิดหน้าต่าง
              </button>
            </div>

            {/* Target Selector Tabs (Plan vs Actual) */}
            <div className="px-5 py-2 bg-slate-100 border-b border-slate-200 flex items-center justify-between gap-3 select-none">
              {isEditingShifts ? (
                <div className="text-xs font-extrabold text-slate-700 bg-amber-100 text-amber-800 px-3 py-1.5 rounded-lg border border-amber-300 w-full text-center">
                  โหมดจัดกะพนักงานด่วน: กำลังแก้ไข {shiftEditTarget === "plan" ? "แผนงานล่วงหน้า (Plan)" : "บันทึกทำงานจริง (Actual)"}
                </div>
              ) : (
                <div className="flex bg-slate-200 p-1 rounded-xl w-full">
                  <button
                    type="button"
                    onClick={() => setModalEditTarget("plan")}
                    className={"flex-1 py-2 text-center text-xs font-bold rounded-lg cursor-pointer transition-colors " + (modalEditTarget === "plan" ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-300")}
                  >
                    แผนงานล่วงหน้า (Plan)
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalEditTarget("actual")}
                    className={"flex-1 py-2 text-center text-xs font-bold rounded-lg cursor-pointer transition-colors " + (modalEditTarget === "actual" ? "bg-orange-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-300")}
                  >
                    บันทึกทำงานจริง (Actual)
                  </button>
                </div>
              )}
            </div>

            {/* Smart Team Shift Preset Toolbar (2-Team 12h & 3-Team 8-8-8) */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs font-sans">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-black text-slate-800 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>รูปแบบจัดคู่กะ (Presets):</span>
                </span>
                
                <select
                  id="team-shift-preset-select"
                  defaultValue="team2_m12"
                  className="px-3.5 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 text-xs shadow-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <optgroup label="🌟 รูปแบบ 2 ทีม (คู่กะ 12 ชม. ทำ 12 ชม. พัก 12 ชม.)">
                    <option value="team2_m12">2 ทีม: กะเช้า 12 ชม. (M12 ทุกวัน)</option>
                    <option value="team2_n12">2 ทีม: กะดึก 12 ชม. (N12 ทุกวัน)</option>
                    <option value="team2_a12">2 ทีม: กะบ่าย 12 ชม. (A12 ทุกวัน)</option>
                    <option value="team2_rot">2 ทีม: หมุนเวียนสลับกะ (2 วัน M12 - 2 วัน N12 - 2 วัน OFF)</option>
                  </optgroup>
                  <optgroup label="🌟 รูปแบบ 3 ทีม (3 กะ 8 ชม. / 8-8-8 สามคนหมุนเวียน 24 ชม.)">
                    <option value="team3_m8">3 ทีม: กะเช้า 8 ชม. (M8 ทุกวัน)</option>
                    <option value="team3_a8">3 ทีม: กะบ่าย 8 ชม. (A8 ทุกวัน)</option>
                    <option value="team3_n8">3 ทีม: กะดึก 8 ชม. (N8 ทุกวัน)</option>
                    <option value="team3_rot">3 ทีม: หมุนเวียน 8-8-8 (M8 ➔ A8 ➔ N8 ➔ OFF)</option>
                  </optgroup>
                  <optgroup label="⚙️ ตั้งกะคงที่ทั้งเดือน">
                    <option value="all_m12">กะเช้า 12 ชม. (M12) ทั้งเดือน</option>
                    <option value="all_m8">กะเช้า 8 ชม. (M8) ทั้งเดือน</option>
                    <option value="all_a12">กะบ่าย 12 ชม. (A12) ทั้งเดือน</option>
                    <option value="all_a8">กะบ่าย 8 ชม. (A8) ทั้งเดือน</option>
                    <option value="all_n12">กะดึก 12 ชม. (N12) ทั้งเดือน</option>
                    <option value="all_n8">กะดึก 8 ชม. (N8) ทั้งเดือน</option>
                    <option value="all_o">วันหยุด (OFF) ทั้งเดือน</option>
                  </optgroup>
                </select>

                <button
                  type="button"
                  onClick={() => {
                    const elem = document.getElementById("team-shift-preset-select") as HTMLSelectElement;
                    const mode = elem?.value || "team2_m12";
                    let newShifts: string[] = [];

                    if (mode === "team2_m12") {
                      newShifts = Array(totalDays).fill("M12");
                    } else if (mode === "team2_n12") {
                      newShifts = Array(totalDays).fill("N12");
                    } else if (mode === "team2_a12") {
                      newShifts = Array(totalDays).fill("A12");
                    } else if (mode === "team2_rot") {
                      const pattern = ["M12", "M12", "N12", "N12", "O", "O"];
                      newShifts = Array.from({ length: totalDays }, (_, i) => pattern[i % 6]);
                    } else if (mode === "team3_m8") {
                      newShifts = Array(totalDays).fill("M8");
                    } else if (mode === "team3_a8") {
                      newShifts = Array(totalDays).fill("A8");
                    } else if (mode === "team3_n8") {
                      newShifts = Array(totalDays).fill("N8");
                    } else if (mode === "team3_rot") {
                      const pattern = ["M8", "A8", "N8", "O"];
                      newShifts = Array.from({ length: totalDays }, (_, i) => pattern[i % 4]);
                    } else if (mode.startsWith("all_")) {
                      const code = mode.replace("all_", "").toUpperCase();
                      newShifts = Array(totalDays).fill(code);
                    } else {
                      newShifts = Array(totalDays).fill("M12");
                    }

                    if (modalEditTarget === "plan") {
                      setEditingEmployeeShiftsModal({ ...editingEmployeeShiftsModal, planShifts: newShifts });
                    } else {
                      setEditingEmployeeShiftsModal({ ...editingEmployeeShiftsModal, shifts: newShifts });
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-extrabold cursor-pointer transition-all shadow-sm hover:scale-105 active:scale-95 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>ปรับใช้รูปแบบคู่กะ</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-500 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
                  กำลังปรับใช้กับ: <strong className="text-blue-700">{modalEditTarget === "plan" ? "แผนงาน (Plan)" : "บันทึกจริง (Actual)"}</strong>
                </span>
              </div>
            </div>

            {/* Clean Monthly List View */}
            <div className="p-6 overflow-y-auto space-y-2 flex-1 bg-slate-100/50">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {Array.from({ length: totalDays }, (_, i) => {
                  const dayNum = i + 1;
                  const empShifts = getEmpShiftsArray(editingEmployeeShiftsModal.shifts, state?.shiftConfig?.currentMonth);
                  const empPlanShifts = getEmpPlanShiftsArray(editingEmployeeShiftsModal, state?.shiftConfig?.currentMonth);
                  const currentShiftCode = modalEditTarget === "plan" ? (empPlanShifts[i] || "O") : (empShifts[i] || "O");
                  const dateObj = new Date(yr, mn - 1, dayNum);
                  const dayOfWeek = dateObj.getDay();
                  const dayName = dayNames[dayOfWeek];
                  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

                  return (
                    <div 
                      key={dayNum}
                      className={"p-3.5 rounded-2xl border transition-all space-y-2 shadow-sm " + (isWeekend ? "bg-amber-50/70 border-amber-200" : "bg-white border-slate-200 hover:border-blue-200")}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className={"block text-xs font-black " + (isWeekend ? "text-amber-900" : "text-slate-900")}>
                            วันที่ {dayNum} ({dayName})
                          </span>
                          <span className="block text-[10px] text-slate-400 font-semibold font-mono">
                            {yr}-{(mn < 10 ? "0" : "") + mn}-{(dayNum < 10 ? "0" : "") + dayNum}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={"inline-block px-2 py-0.5 rounded-lg text-[10px] font-black border " + getShiftStyle(currentShiftCode)}>
                            {currentShiftCode}
                          </span>
                          <span className="px-2 py-0.5 rounded-lg text-[10px] font-extrabold bg-slate-100 text-slate-600 border border-slate-200 font-mono">
                            {getShiftOtHours(currentShiftCode)} ชม.
                          </span>
                        </div>
                      </div>

                      <select
                        value={currentShiftCode}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (modalEditTarget === "plan") {
                            const newPlan = [...empPlanShifts];
                            while (newPlan.length <= i) newPlan.push("O");
                            newPlan[i] = val;
                            setEditingEmployeeShiftsModal({ ...editingEmployeeShiftsModal, planShifts: newPlan });
                          } else {
                            const newActual = [...empShifts];
                            while (newActual.length <= i) newActual.push("O");
                            newActual[i] = val;
                            setEditingEmployeeShiftsModal({ ...editingEmployeeShiftsModal, shifts: newActual });
                          }
                        }}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-extrabold text-slate-800 cursor-pointer focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-sans"
                      >
                        <optgroup label="กะเช้า (Morning Shift: 08:00 - 16:00)">
                          <option value="M8">M8 - กะเช้า 8 ชม. (08:00 - 16:00)</option>
                          <option value="M12">M12 - กะเช้า 12 ชม. (OT 4 ชม.)</option>
                          <option value="M16">M16 - กะเช้า 16 ชม. (OT 8 ชม.)</option>
                        </optgroup>
                        <optgroup label="กะบ่าย (Afternoon Shift: 16:00 - 00:00)">
                          <option value="A8">A8 - กะบ่าย 8 ชม. (16:00 - 00:00)</option>
                          <option value="A12">A12 - กะบ่าย 12 ชม. (OT 4 ชม.)</option>
                          <option value="A16">A16 - กะบ่าย 16 ชม. (OT 8 ชม.)</option>
                        </optgroup>
                        <optgroup label="กะดึก (Night Shift: 20:00 - 04:00)">
                          <option value="N8">N8 - กะดึก 8 ชม. (20:00 - 04:00)</option>
                          <option value="N12">N12 - กะดึก 12 ชม. (OT 4 ชม.)</option>
                          <option value="N16">N16 - กะดึก 16 ชม. (OT 8 ชม.)</option>
                        </optgroup>
                        <optgroup label="วันหยุด & พิเศษ (Off / Holiday)">
                          <option value="O">O - วันหยุด (Off / Day Off)</option>
                          <option value="OND">OND - ทำงานวันหยุด (OT 8 ชม.)</option>
                        </optgroup>
                      </select>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-white flex justify-between items-center">
              <div className="text-xs text-slate-500 font-bold">
                รวมชั่วโมง OT เดือนนี้ (คำนวณจาก Actual เท่านั้น): <span className="text-blue-700 font-mono font-black text-sm">{
                  getEmpShiftsArray(editingEmployeeShiftsModal.shifts, state?.shiftConfig?.currentMonth).reduce((acc, code) => acc + getShiftOtHours(code), 0)
                } ชม.</span>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditingEmployeeShiftsModal(null)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition-colors font-sans"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (!editingEmployeeShiftsModal) return;
                    if (isEditingShifts) {
                      const updatedEmps = tempEmployees.map(e => 
                        e.id === editingEmployeeShiftsModal.id ? editingEmployeeShiftsModal : e
                      );
                      setTempEmployees(updatedEmps);
                      setEditingEmployeeShiftsModal(null);
                    } else {
                      const updatedEmps = state.employees.map(e => 
                        e.id === editingEmployeeShiftsModal.id ? editingEmployeeShiftsModal : e
                      );
                      setState(prev => ({ ...prev, employees: updatedEmps }));
                      setEditingEmployeeShiftsModal(null);

                      try {
                        const [y, m] = (state.shiftConfig.currentMonth || "").split("-");
                        const res = await fetch("/api/save-shifts", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            employees: updatedEmps,
                            year: y ? Number(y) : undefined,
                            month: m ? Number(m) : undefined
                          })
                        });
                        const data = await res.json();
                        if (data.employees && Array.isArray(data.employees)) {
                          setState(prev => ({ ...prev, employees: data.employees }));
                        }
                        alert("บันทึกตารางกะของพนักงานลงระบบเรียบร้อยแล้ว!");
                      } catch (err) {
                        console.error(err);
                      }
                    }
                  }}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black cursor-pointer shadow-md transition-colors font-sans"
                >
                  บันทึกตารางกะ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* OVERLAY / MODAL: CSV TEMPLATE HUB */}
      {/* ======================================= */}
      <CsvTemplateHubModal
        isOpen={isCsvTemplateHubOpen}
        onClose={() => setIsCsvTemplateHubOpen(false)}
      />

      {/* Quick Cell Shift Editor Popover */}
      {activeCellEditor && (
        <>
          <div 
            className="fixed inset-0 z-[990] cursor-default bg-transparent"
            onClick={() => setActiveCellEditor(null)}
          />
          <div
            style={{
              position: "absolute",
              left: (() => {
                const w = 310;
                let l = activeCellEditor.x - w / 2;
                if (l < 10) l = 10;
                if (l + w > window.innerWidth - 10) l = window.innerWidth - w - 10;
                return `${l}px`;
              })(),
              top: (() => {
                const h = activeCellEditor.target === "both" ? 188 : 108;
                let t = activeCellEditor.y + 6;
                if (t + h > window.innerHeight + window.scrollY - 10) {
                  t = activeCellEditor.y - h - 6;
                }
                return `${t}px`;
              })(),
              width: "310px",
              zIndex: 991
            }}
            className="bg-slate-900/95 text-white backdrop-blur-md rounded-2xl shadow-[0_10px_35px_rgba(0,0,0,0.3)] p-3 border border-slate-700/50 flex flex-col gap-2.5 animate-in fade-in zoom-in-95 duration-150 select-none"
          >
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
              <span className="text-[10px] font-black text-slate-400 truncate max-w-[200px]">
                {activeCellEditor.emp.name} (วันที่ {activeCellEditor.dayIdx + 1})
              </span>
              <button 
                onClick={() => setActiveCellEditor(null)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer p-0.5 rounded hover:bg-white/5"
              >
                <X className="w-3 h-3" />
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {/* Plan editing row */}
              {(activeCellEditor.target === "both" || activeCellEditor.target === "plan") && (
                <div>
                  <div className="text-[9px] font-black text-blue-300 uppercase tracking-widest mb-1.5">แก้ไข Plan</div>
                  <div className="flex flex-wrap gap-1">
                    {["M8", "M12", "M16", "A8", "A12", "N8", "N12", "N16", "OND", "D", "O"].map(code => (
                      <button
                        key={code}
                        onClick={() => {
                          handleDirectSaveShift(activeCellEditor.emp, activeCellEditor.dayIdx, "plan", code);
                          setActiveCellEditor(null);
                        }}
                        className={`px-2 py-1 text-[10px] font-extrabold rounded-md border border-white/5 hover:scale-105 active:scale-95 transition-all cursor-pointer ${getShiftStyle(code)}`}
                      >
                        {code}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Actual editing row */}
              {(activeCellEditor.target === "both" || activeCellEditor.target === "actual") && (
                <div className={activeCellEditor.target === "both" ? "border-t border-slate-800/80 pt-2" : ""}>
                  <div className="text-[9px] font-black text-orange-300 uppercase tracking-widest mb-1.5">แก้ไข Actual</div>
                  <div className="flex flex-wrap gap-1">
                    {["M8", "M12", "M16", "A8", "A12", "N8", "N12", "N16", "OND", "D", "O"].map(code => (
                      <button
                        key={code}
                        onClick={() => {
                          handleDirectSaveShift(activeCellEditor.emp, activeCellEditor.dayIdx, "actual", code);
                          setActiveCellEditor(null);
                        }}
                        className={`px-2 py-1 text-[10px] font-extrabold rounded-md border border-white/5 hover:scale-105 active:scale-95 transition-all cursor-pointer ${getShiftStyle(code)}`}
                      >
                        {code}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Modal: Salary & OT Formula Details */}
      {viewingSalaryFormulaEmployee && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-200 max-w-lg w-full overflow-hidden flex flex-col font-sans animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-slate-950 text-white px-6 py-5 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/20">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-black leading-tight">สูตรและวิธีการคำนวณเงินได้ค่าล่วงเวลา (OT)</h3>
                  <p className="text-[10px] text-slate-400 font-bold mt-0.5 uppercase tracking-wider">
                    {viewingSalaryFormulaEmployee.emp.name} ({viewingSalaryFormulaEmployee.emp.id})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingSalaryFormulaEmployee(null)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer p-1 rounded-full hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh] bg-slate-50/50">
              {/* Financial Base Info */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
                <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-100 pb-2">
                  <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                  <span>ฐานเงินเดือนที่ใช้คำนวณ (Financial Base)</span>
                </h4>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <span className="text-slate-400 font-bold">ฐานเงินเดือนหลัก:</span>
                    <div className="font-extrabold text-slate-800 font-mono text-sm">
                      {viewingSalaryFormulaEmployee.salary.toLocaleString()} บาท
                      {!viewingSalaryFormulaEmployee.emp.salary && (
                        <span className="block text-[9px] text-amber-600 font-sans mt-0.5">*(ค่าเริ่มต้นระบบเนื่องจากไม่ได้ระบุข้อมูลใน DATA)*</span>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-slate-400 font-bold">อัตราจ้างรายชั่วโมง (Hourly Rate):</span>
                    <div className="font-extrabold text-slate-800 font-mono text-sm">
                      {viewingSalaryFormulaEmployee.hourlyRate.toFixed(2)} บาท/ชม.
                      <span className="block text-[9px] text-slate-400 font-sans mt-0.5">สูตร: เงินเดือน ÷ 240 ชั่วโมง</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Breakdown */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-4">
                <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-100 pb-2">
                  <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                  <span>รายละเอียดชั่วโมงสะสมและเรทเงินได้ (Rate Calculations)</span>
                </h4>

                <div className="space-y-3.5 divide-y divide-slate-100 text-xs">
                  {/* 1. Weekday OT (1.5x) */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-800">1. OT วันปฏิบัติงานปกติ (Weekday OT - 1.5x)</span>
                      <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-lg border border-blue-200 font-mono font-black">{viewingSalaryFormulaEmployee.normalOt} ชม.</span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl space-y-1 font-mono text-[10px] text-slate-600 border border-slate-100">
                      <p>สูตร: [ชั่วโมงสะสม] × [อัตราจ้างรายชั่วโมง] × 1.5</p>
                      <p>คำนวณ: {viewingSalaryFormulaEmployee.normalOt} ชม. × {viewingSalaryFormulaEmployee.hourlyRate.toFixed(2)} บาท × 1.5</p>
                      <p className="text-slate-900 font-extrabold text-xs mt-1 border-t border-slate-200/60 pt-1 text-right">
                        รวมเงินส่วนนี้: {Math.round(viewingSalaryFormulaEmployee.normalOt * 1.5 * viewingSalaryFormulaEmployee.hourlyRate).toLocaleString()} บาท
                      </p>
                    </div>
                  </div>

                  {/* 2. Holiday OT (3.0x) */}
                  <div className="space-y-1 pt-3.5">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-800">2. OT วันหยุดประจำสัปดาห์ (Holiday OT - 3.0x)</span>
                      <span className="bg-orange-50 text-orange-700 px-2 py-0.5 rounded-lg border border-orange-200 font-mono font-black">{viewingSalaryFormulaEmployee.holidayOt} ชม.</span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl space-y-1 font-mono text-[10px] text-slate-600 border border-slate-100">
                      <p>สูตร: [ชั่วโมงสะสมวันหยุด] × [อัตราจ้างรายชั่วโมง] × 3.0</p>
                      <p>คำนวณ: {viewingSalaryFormulaEmployee.holidayOt} ชม. × {viewingSalaryFormulaEmployee.hourlyRate.toFixed(2)} บาท × 3.0</p>
                      <p className="text-slate-900 font-extrabold text-xs mt-1 border-t border-slate-200/60 pt-1 text-right">
                        รวมเงินส่วนนี้: {Math.round(viewingSalaryFormulaEmployee.holidayOt * 3.0 * viewingSalaryFormulaEmployee.hourlyRate).toLocaleString()} บาท
                      </p>
                    </div>
                  </div>

                  {/* 3. Holiday Work (1.0x) */}
                  <div className="space-y-1 pt-3.5">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-800">3. ค่าจ้างทำงานในวันหยุดปกติ (Holiday Regular Work - 1.0x)</span>
                      <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded-lg border border-amber-200 font-mono font-black">{viewingSalaryFormulaEmployee.holidayWorkDays} วัน (หรือ {viewingSalaryFormulaEmployee.holidayWorkDays * 8} ชม.)</span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl space-y-1 font-mono text-[10px] text-slate-600 border border-slate-100">
                      <p>สูตร: [จำนวนวันทำงานในวันหยุด] × 8 ชม. × [อัตราจ้างรายชั่วโมง] × 1.0</p>
                      <p>คำนวณ: {viewingSalaryFormulaEmployee.holidayWorkDays} วัน × 8 ชม. × {viewingSalaryFormulaEmployee.hourlyRate.toFixed(2)} บาท × 1.0</p>
                      <p className="text-slate-900 font-extrabold text-xs mt-1 border-t border-slate-200/60 pt-1 text-right">
                        รวมเงินส่วนนี้: {Math.round(viewingSalaryFormulaEmployee.holidayWorkDays * 8 * 1.0 * viewingSalaryFormulaEmployee.hourlyRate).toLocaleString()} บาท
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Total Summary */}
              <div className="bg-blue-600 text-white rounded-2xl p-4 shadow-md space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-blue-200 uppercase tracking-widest font-sans">ยอดรวมเงินได้ค่าล่วงเวลาทั้งหมด</span>
                  <span className="text-lg font-black font-mono">{viewingSalaryFormulaEmployee.totalOtPay.toLocaleString()} บาท</span>
                </div>
                <div className="border-t border-blue-500/50 pt-2 flex justify-between items-center text-xs">
                  <span className="text-blue-200 font-bold font-sans">คิดเป็นสัดส่วนเปอร์เซ็นต์ของฐานเงินเดือน:</span>
                  <span className="font-extrabold bg-blue-700 text-white px-2 py-0.5 rounded-lg border border-blue-500 font-mono">
                    {viewingSalaryFormulaEmployee.otPctSalary}%
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-white flex justify-end">
              <button
                type="button"
                onClick={() => setViewingSalaryFormulaEmployee(null)}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-md font-sans"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* OVERLAY / MODAL: RESIGNED & CASE MANAGEMENT */}
      {/* ======================================= */}
      {showResignedModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-rose-50/80 via-white to-slate-50 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center border border-rose-200 shadow-sm">
                  <UserX className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <span>จัดการข้อมูลพนักงานลาออก / พ้นสภาพ / เคส</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-xs font-bold font-mono">
                      {(state?.employees || []).filter(e => e.employmentStatus === "Resigned" || e.employmentStatus === "Inactive" || e.employmentStatus === "Retired" || e.employmentStatus === "ลาออก" || e.employmentStatus === "เกษียณ" || e.employmentStatus === "พ้นสภาพ").length} เคสสะสม
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">ตรวจสอบประวัติพนักงานที่พ้นสภาพ แก้ไขวันที่ลาออก หรือกู้คืนสถานะกลับเป็นพนักงานปกติ (Active)</p>
                </div>
              </div>
              <button 
                onClick={() => setShowResignedModal(false)}
                className="p-2 hover:bg-slate-200/70 rounded-full text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                title="ปิดหน้าต่าง"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="p-4 bg-slate-50 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 flex-1 min-w-[280px]">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={resignedSearchQuery}
                    onChange={(e) => setResignedSearchQuery(e.target.value)}
                    placeholder="ค้นหาชื่อ, นามสกุล หรือรหัสพนักงาน..."
                    className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 font-sans"
                  />
                  {resignedSearchQuery && (
                    <button onClick={() => setResignedSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold">✕</button>
                  )}
                </div>

                <select
                  value={resignedDeptFilter}
                  onChange={(e) => setResignedDeptFilter(e.target.value)}
                  className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500/20 font-sans cursor-pointer"
                >
                  <option value="all">ทุกแผนก (All Depts)</option>
                  {(state?.departments || []).map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowResignedModal(false);
                    setShowAddEmployeeModal(true);
                  }}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>เพิ่มพนักงาน</span>
                </button>
              </div>
            </div>

            {/* Resigned Employee List Table */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {(() => {
                const resignedList = (state?.employees || []).filter(e => {
                  const isResigned = e.employmentStatus === "Resigned" || e.employmentStatus === "Inactive" || e.employmentStatus === "Retired" || e.employmentStatus === "ลาออก" || e.employmentStatus === "เกษียณ" || e.employmentStatus === "พ้นสภาพ";
                  if (!isResigned) return false;
                  
                  if (resignedDeptFilter !== "all" && normalizeDeptId(e.deptId) !== normalizeDeptId(resignedDeptFilter)) {
                    return false;
                  }

                  if (resignedSearchQuery) {
                    const q = resignedSearchQuery.toLowerCase().trim();
                    const nameMatch = (e.name || "").toLowerCase().includes(q);
                    const idMatch = (e.id || "").toLowerCase().includes(q);
                    const roleMatch = (e.role || "").toLowerCase().includes(q);
                    if (!nameMatch && !idMatch && !roleMatch) return false;
                  }

                  return true;
                });

                if (resignedList.length === 0) {
                  return (
                    <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <UserX className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-sm font-bold text-slate-700">ไม่พบข้อมูลพนักงานพ้นสภาพตามเงื่อนไขที่ค้นหา</p>
                      <p className="text-xs text-slate-400 mt-1">สามารถเปลี่ยนคำค้นหาหรือตัวกรองแผนกเพื่อดูข้อมูลรายการอื่น</p>
                    </div>
                  );
                }

                return (
                  <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-100/90 text-[11px] font-bold text-slate-600 uppercase tracking-wider border-b border-slate-200">
                          <th className="px-4 py-3 font-mono">รหัส</th>
                          <th className="px-4 py-3">ชื่อ-นามสกุล</th>
                          <th className="px-4 py-3">ตำแหน่ง / แผนก</th>
                          <th className="px-4 py-3">วันที่เริ่มงาน / อายุงาน</th>
                          <th className="px-4 py-3 text-rose-700">วันที่ลาออก / สถานะ</th>
                          <th className="px-4 py-3 text-center">การจัดการ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {resignedList.map(emp => (
                          <tr key={emp.id} className="hover:bg-rose-50/30 transition-colors bg-white">
                            <td className="px-4 py-3 font-mono font-bold text-slate-500 whitespace-nowrap">
                              {emp.id}
                            </td>
                            <td className="px-4 py-3 font-bold text-slate-800">
                              <div className="flex items-center gap-2">
                                <EmployeeAvatar empId={emp.id} empName={emp.name} className="w-7 h-7 flex-shrink-0" />
                                <span>{emp.name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-slate-700">
                              <div className="font-bold text-slate-800">{emp.role}</div>
                              <div className="text-[10px] text-slate-500">{getDeptName(emp.deptId, state?.departments || [])} ({emp.division || "-"})</div>
                            </td>
                            <td className="px-4 py-3 font-mono text-slate-600">
                              <div>{emp.startDate ? emp.startDate : "-"}</div>
                              <div className="text-[10px] text-slate-400">{emp.tenure ? `อายุงาน ${emp.tenure}` : ""}</div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="px-2 py-0.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 font-bold font-mono text-[11px] inline-block">
                                {emp.resignationDate ? `ลาออก: ${emp.resignationDate}` : "สถานะ: พ้นสภาพ/ลาออก"}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center whitespace-nowrap">
                              <div className="flex items-center justify-center gap-1.5">
                                {/* Restore Button */}
                                <button
                                  type="button"
                                  onClick={() => handleRestoreEmployee(emp)}
                                  className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg font-bold text-[10px] border border-emerald-200/80 transition-all flex items-center gap-1 cursor-pointer shadow-2xs hover:scale-105 active:scale-95"
                                  title="กู้คืนสถานะกลับเป็นพนักงานปกติ (Active)"
                                >
                                  <CheckCircle className="w-3 h-3 text-emerald-600" />
                                  <span>กู้คืนสถานะ</span>
                                </button>

                                {/* Edit Button */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setShowResignedModal(false);
                                    startEditEmployee(emp);
                                  }}
                                  className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                  title="แก้ไขข้อมูลพนักงาน"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                                  </svg>
                                </button>

                                {/* Delete Button */}
                                <button
                                  type="button"
                                  onClick={() => handleDeleteEmployee(emp.id)}
                                  className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                  title="ลบข้อมูลพนักงานถาวร"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setShowResignedModal(false);
                  setSelectedEmpStatusTab("Resigned");
                  document.getElementById("employee-roster-section")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <ArrowDown className="w-3.5 h-3.5" />
                <span>ไปยังตารางรายชื่อด้านล่าง</span>
              </button>

              <button
                type="button"
                onClick={() => setShowResignedModal(false)}
                className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all cursor-pointer shadow-sm"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Container */}
      <div className="fixed bottom-6 right-6 z-[999] flex flex-col gap-3 max-w-sm pointer-events-none">
        {toasts.map((t: any) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 px-4 py-3.5 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.12)] border backdrop-blur-md transition-all duration-300 animate-in slide-in-from-bottom-5 fade-in ${
              t.type === "success" 
                ? "bg-emerald-50/95 text-emerald-950 border-emerald-200/60" 
                : t.type === "warning"
                ? "bg-amber-50/95 text-amber-950 border-amber-200/60"
                : "bg-blue-50/95 text-blue-950 border-blue-200/60"
            }`}
          >
            <div className="flex-shrink-0 mt-0.5">
              {t.type === "success" && <CheckCircle className="w-4 h-4 text-emerald-600" />}
              {t.type === "warning" && <AlertTriangle className="w-4 h-4 text-amber-600" />}
              {t.type === "info" && <Info className="w-4 h-4 text-blue-600" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold leading-relaxed whitespace-pre-line">{t.message}</p>
            </div>
            <button
              onClick={() => setToasts(prev => prev.filter(item => item.id !== t.id))}
              className="flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer rounded-full p-0.5 hover:bg-black/5"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}
