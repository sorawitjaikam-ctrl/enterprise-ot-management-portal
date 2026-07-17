import React, { useState, useEffect } from "react";
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
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
  User
} from "lucide-react";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import { AppState, Employee, Department } from "./types";

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

export const getEmployeeShiftsForView = (shifts: string[], limit: number) => {
  const result = [...shifts];
  if (result.length >= limit) {
    return result.slice(0, limit);
  }
  while (result.length < limit) {
    result.push("O");
  }
  return result;
};

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

  const totalOt = records.reduce((s, r) => s + r.otHours, 0);

  const years = [now.getFullYear(), now.getFullYear() - 1, now.getFullYear() - 2];

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <span className="text-white text-lg">📋</span>
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-slate-800">ประวัติ OT จากกะทำงาน</h3>
            <p className="text-xs text-slate-500 mt-0.5">ระบบบันทึก OT อัตโนมัติจากรหัสกะ — M12/A12/N12=4ชม., M16/N16/OND=8ชม.</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-wrap items-center gap-3">
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

        <div className="ml-auto bg-blue-50 border border-blue-100 rounded-xl px-4 py-2 text-xs font-bold text-blue-700">
          OT รวม: <span className="text-lg font-black">{totalOt.toFixed(1)}</span> ชม.
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
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

function EmployeeAvatar({ empId, empName, className = "w-9 h-9" }: { empId: string; empName: string; className?: string }) {
  const [error, setError] = useState(false);
  
  // Reset error state if empId changes
  useEffect(() => {
    setError(false);
  }, [empId]);

  const initials = empName ? empName.substring(0, 2) : "??";
  const imgUrl = `https://intranet.advanceagro.net/employeecard/empimages/${empId}.jpg`;

  return error ? (
    <div className={`${className} rounded-full bg-blue-50 border border-blue-100 text-blue-600 font-bold flex items-center justify-center text-xs flex-shrink-0`}>
      {initials}
    </div>
  ) : (
    <img 
      src={imgUrl} 
      alt={empName}
      onError={() => setError(true)}
      className={`${className} rounded-full object-cover border border-slate-200 flex-shrink-0`}
    />
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

  const [showEditAccountModal, setShowEditAccountModal] = useState<boolean>(false);
  const [editAccountOriginalUsername, setEditAccountOriginalUsername] = useState<string>("");
  const [editAccountUsername, setEditAccountUsername] = useState<string>("");
  const [editAccountName, setEditAccountName] = useState<string>("");
  const [editAccountRole, setEditAccountRole] = useState<string>("");
  const [editAccountDeptId, setEditAccountDeptId] = useState<string>("");
  const [editAccountAvatar, setEditAccountAvatar] = useState<string>("");
  const [editAccountCanBackup, setEditAccountCanBackup] = useState<boolean>(false);

  const fetchAccounts = async () => {
    try {
      const res = await fetch("/api/accounts");
      if (res.ok) {
        const data = await res.json();
        setAccounts(data);
      }
    } catch (err) {
      console.error("Failed to fetch accounts:", err);
    }
  };

  const updatePlannerMonth = async (newMonthStr: string) => {
    try {
      const res = await fetch("/api/update-shift-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentMonth: newMonthStr })
      });
      if (res.ok) {
        await fetchPortalState();
      }
    } catch (err) {
      console.error("Failed to update planner month:", err);
    }
  };

  const handleUpdateAccountPermission = async (targetUsername: string, role: string, deptId: string) => {
    try {
      const res = await fetch("/api/update-account-permission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUsername, role, deptId })
      });
      if (res.ok) {
        await fetchAccounts();
        alert("อัปเดตสิทธิ์การเข้าถึงและความรับผิดชอบของบัญชีสำเร็จ!");
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
      const res = await fetch("/api/reset-account-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUsername: resetTargetUsername, newPassword: newResetPassword })
      });
      if (res.ok) {
        setNewResetPassword("");
        setShowResetPasswordModal(false);
        alert(`รีเซ็ตรหัสผ่านของบัญชี "${resetTargetUsername}" เรียบร้อยแล้ว!`);
      }
    } catch (err) {
      console.error(err);
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
      const res = await fetch("/api/edit-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalUsername: editAccountOriginalUsername,
          username: editAccountUsername,
          name: editAccountName,
          role: editAccountRole,
          deptId: editAccountDeptId,
          avatar: editAccountAvatar,
          canBackup: editAccountCanBackup
        })
      });
      if (res.ok) {
        setShowEditAccountModal(false);
        await fetchAccounts();
        alert("อัปเดตข้อมูลบัญชีผู้ใช้สำเร็จ!");
        
        // If updating the currently logged-in user, sync their session as well
        if (currentUser?.username === editAccountOriginalUsername) {
          const updatedUser = {
            username: editAccountUsername,
            name: editAccountName,
            role: editAccountRole,
            deptId: editAccountDeptId,
            avatar: editAccountAvatar,
            canBackup: editAccountCanBackup ? 1 : 0
          };
          localStorage.setItem("currentUser", JSON.stringify(updatedUser));
          setCurrentUser(updatedUser);
        }
      } else {
        const errData = await res.json();
        alert(`เกิดข้อผิดพลาด: ${errData.error}`);
      }
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    }
  };

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
        setLoginError(data.error || "ล็อกอินไม่สำเร็จ");
      }
    } catch (err) {
      setLoginError("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
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
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [state, setState] = useState<AppState | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [stateError, setStateError] = useState<string | null>(null);
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>("ทุกแผนก");
  const [selectedMonthFilter, setSelectedMonthFilter] = useState<string>("เดือนปัจจุบัน");
  const [daysLimit, setDaysLimit] = useState<number>(30);
  const [selectedWeek, setSelectedWeek] = useState<string>("all");
  const [showShiftLegend, setShowShiftLegend] = useState<boolean>(false);
  
  // Modals / Overlays
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState<boolean>(false);
  const [showAiAuditModal, setShowAiAuditModal] = useState<boolean>(false);
  const [aiReportText, setAiReportText] = useState<string>("");
  const [generatingAiReport, setGeneratingAiReport] = useState<boolean>(false);

  // New Employee Form State
  const [newEmpName, setNewEmpName] = useState<string>("");
  const [newEmpDept, setNewEmpDept] = useState<string>("inter2");
  const [newEmpRole, setNewEmpRole] = useState<string>("Operator");
  const [newEmpGroupName, setNewEmpGroupName] = useState<string>("ทีม ก.");
  const [newEmpTargetOt, setNewEmpTargetOt] = useState<number>(48);

  // Edit Employee Form State
  const [showEditEmployeeModal, setShowEditEmployeeModal] = useState<boolean>(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [editEmpName, setEditEmpName] = useState<string>("");
  const [editEmpDept, setEditEmpDept] = useState<string>("inter2");
  const [editEmpRole, setEditEmpRole] = useState<string>("Operator");
  const [editEmpGroupName, setEditEmpGroupName] = useState<string>("ทีม ก.");
  const [editEmpTargetOt, setEditEmpTargetOt] = useState<number>(48);

  // Active shift management edit state
  const [isEditingShifts, setIsEditingShifts] = useState<boolean>(false);
  const [tempEmployees, setTempEmployees] = useState<Employee[]>([]);
  const [activeEditingCell, setActiveEditingCell] = useState<{ employeeId: string; dayIndex: number } | null>(null);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);

  // Sort and display filters for report
  const [reportSortBy, setReportSortBy] = useState<string>("OT Hours (High to Low)");

  // Fetch initial portal state
  const fetchPortalState = async () => {
    try {
      setLoading(true);
      setStateError(null);
      const res = await fetch("/api/portal-state");
      if (res.ok) {
        const data: AppState = await res.json();
        setState(data);
        setTempEmployees(data.employees);
      } else {
        const errData = await res.json().catch(() => ({}));
        setStateError(errData.error || "เกิดข้อผิดพลาดในการโหลดข้อมูลจากเซิร์ฟเวอร์");
      }
    } catch (err) {
      console.error("Error fetching state:", err);
      setStateError("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์หลังบ้านได้ กรุณาตรวจสอบว่าเซิร์ฟเวอร์กำลังรันอยู่");
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
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-600 font-medium">กำลังโหลดโปรทัลจัดการ OT และตารางกะ...</p>
      </div>
    );
  }

  const activeDeptId = currentUser?.deptId || "all";
  const filteredDeptsForStats = state.departments.filter(d => activeDeptId === "all" || d.id === activeDeptId);

  // Dynamically extract unique roles and groups for auto-suggestions
  const uniqueRoles = Array.from(new Set(state.employees.map(emp => emp.role))).filter(Boolean);
  const uniqueGroups = Array.from(new Set(state.employees.map(emp => emp.groupName))).filter(Boolean);

  // Filter logic based on search and dropdowns
  const filteredEmployees = state.employees.filter((emp) => {
    const matchesSearch = 
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      emp.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.role.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (selectedDeptFilter === "ทุกแผนก") return matchesSearch;
    
    const deptMap: { [key: string]: string } = {
      "INTER 2": "inter2",
      "INTER 3": "inter3",
      "INTER 5": "inter5",
      "INTER 7": "inter7",
      "Heavy Machine": "heavy",
      "ECC": "ecc"
    };
    const filterDeptId = deptMap[selectedDeptFilter];
    return matchesSearch && emp.deptId === filterDeptId;
  });

  // Handle adding new employee
  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmpName) {
      alert("กรุณากรอกชื่อพนักงาน");
      return;
    }
    try {
      const res = await fetch("/api/add-employee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: newEmpId || undefined,
          name: newEmpName,
          deptId: newEmpDept,
          role: newEmpRole,
          groupName: newEmpGroupName,
          targetOt: newEmpTargetOt
        })
      });
      if (res.ok) {
        setShowAddEmployeeModal(false);
        // Reset form
        setNewEmpId("");
        setNewEmpName("");
        setNewEmpRole("Operator");
        setNewEmpTargetOt(48);
        // Reload state
        await fetchPortalState();
        alert("เพิ่มพนักงานใหม่สำเร็จ!");
      }
    } catch (err) {
      console.error(err);
    }
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
      const res = await fetch("/api/export-employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: currentUser?.username })
      });
      if (res.ok) {
        const data = await res.json();
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data.employees, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `employees_backup_${new Date().toISOString().substring(0, 10)}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
      } else {
        const errData = await res.json();
        alert(errData.error || "เกิดข้อผิดพลาดในการส่งออกข้อมูล");
      }
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    }
  };

  const handleImportEmployees = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const employees = JSON.parse(event.target?.result as string);
        if (!Array.isArray(employees)) {
          alert("ข้อมูลไฟล์สำรองไม่ถูกต้อง (ต้องเป็นรายการอาร์เรย์พนักงาน)");
          return;
        }
        if (!window.confirm(`⚠️ คุณแน่ใจหรือไม่ว่าต้องการนำเข้าพนักงานจำนวน ${employees.length} คน? ข้อมูลรายชื่อและกะทำงานเดิมจะถูกล้างและแทนที่ทั้งหมด`)) {
          return;
        }
        const res = await fetch("/api/import-employees", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: currentUser?.username,
            employees
          })
        });
        if (res.ok) {
          alert("นำเข้าฐานข้อมูลพนักงานสำเร็จเรียบร้อยแล้ว!");
          await fetchPortalState();
        } else {
          const errData = await res.json();
          alert(errData.error || "เกิดข้อผิดพลาดในการนำเข้าข้อมูล");
        }
      } catch (err) {
        console.error(err);
        alert("รูปแบบไฟล์ JSON ไม่ถูกต้อง");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // Handle editing existing employee
  const handleEditEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee) return;
    if (!editEmpName) {
      alert("กรุณากรอกชื่อพนักงาน");
      return;
    }
    try {
      const res = await fetch("/api/edit-employee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingEmployee.id,
          name: editEmpName,
          deptId: editEmpDept,
          role: editEmpRole,
          groupName: editEmpGroupName,
          targetOt: editEmpTargetOt
        })
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
    setShowEditEmployeeModal(true);
  };

  // Handle shift changes in UI by showing custom picker
  const handleShiftCellClick = (employeeId: string, dayIndex: number) => {
    if (!isEditingShifts) return;
    setActiveEditingCell(prev => 
      prev && prev.employeeId === employeeId && prev.dayIndex === dayIndex
        ? null
        : { employeeId, dayIndex }
    );
  };

  const handleSelectShiftValue = (employeeId: string, dayIndex: number, newValue: string) => {
    setTempEmployees(prev => prev.map(emp => {
      if (emp.id === employeeId) {
        const newShifts = [...emp.shifts];
        while (newShifts.length <= dayIndex) {
          newShifts.push("O");
        }
        newShifts[dayIndex] = newValue;
        return { ...emp, shifts: newShifts };
      }
      return emp;
    }));
    setActiveEditingCell(null);
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
      }
    } catch (err) {
      console.error(err);
    }
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
  const getDailyShiftSummary = (dayIndex: number) => {
    let mCount = 0;
    let aCount = 0;
    let nCount = 0;
    
    const activeList = isEditingShifts ? tempEmployees : state.employees;
    
    activeList.forEach(emp => {
      const paddedShifts = getEmployeeShiftsForView(emp.shifts, daysLimit);
      const shift = paddedShifts[dayIndex];
      if (shift) {
        if (shift === "M" || shift.startsWith("M")) mCount++;
        if (shift === "A" || shift.startsWith("A")) aCount++;
        if (shift === "N" || shift.startsWith("N")) nCount++;
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
    const mgr = accounts.find(acc => acc.deptId === deptId && acc.role !== "ผู้ดูแลระบบ");
    if (mgr) {
      return {
        name: mgr.name,
        role: mgr.role,
        avatar: mgr.avatar
      };
    }
    const dept = state.departments.find(d => d.id === deptId);
    return {
      name: dept ? dept.manager : "ไม่มีข้อมูลหัวหน้าแผนก",
      role: dept ? dept.managerRole : "Supervisor",
      avatar: dept ? dept.managerImg : "https://lh3.googleusercontent.com/aida-public/AB6AXuAf5UhzQFkBl2tAqPIfYe5tF5JObtrReGu_lohxjpxav5OEjcmmCJhPclOvd2pYN5Q63ircrUY62HYEtYICs05VEFPgL0t4CQSbr1dUS_veJddqwvCz2hrMENO5DyK5fUo9Lx_K8EQj_RXIf9a91CYGwMUZftntpoCZ5n7RUAnxYNIsXz71ttH1VvWFLTpEggMdONt3b-WOccq3oi4S33bsL6DAyTg_90K2vzyRwxDzf3Isscur4MrcuQ"
    };
  };

  // Sort departments dynamically
  // Filter departments for report view
  const reportDepartments = state.departments.filter(dept => {
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

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
        {/* Animated background blobs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full filter blur-3xl animate-pulse delay-1000"></div>
        
        {/* Card wrapper */}
        <div className="w-full max-w-md bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 shadow-2xl relative z-10 text-white">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white mx-auto shadow-lg shadow-blue-500/20 mb-4">
              <Lock className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight">Enterprise OT Portal</h1>
            <p className="text-xs text-slate-300 mt-2 font-medium">เข้าสู่ระบบเพื่อจัดการเวลาการทำงานล่วงเวลา (OT)</p>
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

          <div className="mt-8 text-center text-[10px] text-slate-500 font-medium">
            <p>บัญชีผู้ใช้เริ่มต้นคือ: <strong>admin</strong> | รหัสผ่าน: <strong>admin123</strong></p>
            <p className="mt-1">ระบบรักษาความปลอดภัยระดับองค์กร (Enterprise Grade Security)</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden">
      {/* Left-edge hover trigger strip */}
      {!isFullScreen && isSidebarHidden && (
        <div 
          onMouseEnter={() => setIsSidebarHidden(false)}
          className="fixed left-0 top-0 h-full w-3.5 z-50 bg-transparent cursor-pointer"
        />
      )}

      {/* Sidebar navigation component */}
      {!isFullScreen && (
        <div 
          onMouseEnter={() => setIsSidebarHidden(false)}
          onMouseLeave={() => setIsSidebarHidden(true)}
          className={`fixed left-0 top-0 h-full w-[260px] z-40 transition-transform duration-300 ${
            isSidebarHidden ? "-translate-x-full" : "translate-x-0"
          }`}
        >
          <Sidebar 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            onLogout={handleLogout}
            currentUser={currentUser}
          />
        </div>
      )}

      {/* Main container area */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
        isSidebarHidden || isFullScreen ? "ml-0" : "ml-[260px]"
      }`}>
        {!isFullScreen && (
          <Navbar 
            title={
              activeTab === "dashboard" ? "แดชบอร์ดจัดการ OT อัจฉริยะ" : 
              activeTab === "reports" ? "รายงานวิเคราะห์ข้อมูลและประสิทธิภาพรายแผนก" :
              activeTab === "employees" ? "ฐานข้อมูลบุคลากรและขีดจำกัดโอที" :
              activeTab === "shifts" ? "การวางแผนและจัดตารางกะพนักงาน" :
              activeTab === "ot-records" ? "ประวัติ OT จากกะทำงาน" :
              activeTab === "profile" ? "การจัดการโปรไฟล์ส่วนตัว" :
              "การตั้งค่าระบบและกฎเกณฑ์"
            }
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            isSidebarHidden={isSidebarHidden}
            setIsSidebarHidden={setIsSidebarHidden}
            currentUser={currentUser}
            onOpenProfile={() => setActiveTab("profile")}
          />
        )}

        {/* Dynamic page container */}
        <main className={`flex-1 overflow-y-auto ${isFullScreen ? "p-4" : "mt-16 p-8"}`}>
          
          {/* ======================================= */}
          {/* VIEW: DASHBOARD */}
          {/* ======================================= */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
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
                    <option>กำหนดเอง...</option>
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
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => {
                      alert("ระบบได้สร้างไฟล์รายงานสรุปผู้บริหารเป็นรูปแบบ Excel/CSV เรียบร้อยและกำลังดาวน์โหลดในเบื้องหลัง...");
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
                  >
                    <Download className="w-4 h-4 text-slate-500" />
                    <span>ส่งออกรายงานรวม</span>
                  </button>
                </div>
              </div>

              {/* KPI Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* 1. Total OT Hours */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-50 to-transparent rounded-bl-full"></div>
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                      <Clock className="w-6 h-6" />
                    </div>
                    <span className="text-emerald-600 text-[10px] font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">+12% จากเดือนก่อน</span>
                  </div>
                  <div className="relative z-10">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">ชั่วโมง OT รวมเดือนนี้</p>
                    <div className="flex items-baseline gap-1">
                      <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                        {filteredDeptsForStats.reduce((acc, curr) => acc + curr.otHours, 0).toLocaleString()}
                      </h3>
                      <span className="text-xs font-bold text-slate-500">ชม.</span>
                    </div>
                  </div>
                </div>

                {/* 2. Total Budget Used */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-red-50 to-transparent rounded-bl-full"></div>
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-600 border border-red-100">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                    <span className="text-red-600 text-[10px] font-bold bg-red-50 px-2.5 py-1 rounded-full border border-red-100">+5% เกินงบประมาณ</span>
                  </div>
                  <div className="relative z-10">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">งบประมาณ / ค่าใช้จ่าย OT สะสม</p>
                    <div className="flex items-baseline gap-1">
                      <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                        ฿{(filteredDeptsForStats.reduce((acc, curr) => acc + curr.budgetUsed, 0) / 1000).toFixed(1)}K
                      </h3>
                      <span className="text-xs font-bold text-slate-500">THB</span>
                    </div>
                  </div>
                </div>

                {/* 3. Number of OT employees */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-emerald-50 to-transparent rounded-bl-full"></div>
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
                      <Users className="w-6 h-6" />
                    </div>
                    <span className="text-slate-500 text-[10px] font-bold bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100">จากพนักงาน 850 คน</span>
                  </div>
                  <div className="relative z-10">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">จำนวนพนักงานที่ได้รับ OT</p>
                    <div className="flex items-baseline gap-1">
                      <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                        {filteredDeptsForStats.reduce((acc, curr) => acc + curr.employeesCount, 0)}
                      </h3>
                      <span className="text-xs font-bold text-slate-500">คน</span>
                    </div>
                  </div>
                </div>

                {/* 4. Total Budget Utilization */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-50 to-transparent rounded-bl-full"></div>
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100">
                      <ShieldAlert className="w-6 h-6" />
                    </div>
                    <span className="text-amber-800 text-[10px] font-bold bg-amber-100 px-2.5 py-1 rounded-full border border-amber-200 flex items-center gap-1">
                      ขีดจำกัดความปลอดภัย
                    </span>
                  </div>
                  <div className="relative z-10">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">สัดส่วนการใช้งบสะสม</p>
                    <div className="flex items-baseline gap-1">
                      <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                        {Math.round(filteredDeptsForStats.reduce((acc, curr) => acc + curr.budgetUtilization, 0) / (filteredDeptsForStats.length || 1))}%
                      </h3>
                      <span className="text-xs font-bold text-slate-500">เฉลี่ย</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 6-Month Trend bar representation */}
                <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">แนวโน้มชั่วโมง OT (เปรียบเทียบ 6 เดือนย้อนหลัง)</h4>
                      <p className="text-xs text-slate-500">สรุปการขยายตัวและความก้าวหน้าของสถานภาพการผลิต</p>
                    </div>
                    <div className="flex gap-4 bg-slate-50 px-3.5 py-1.5 rounded-full border border-slate-100 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 bg-blue-600 rounded-full"></span>
                        <span className="font-semibold text-slate-700">ปีปัจจุบัน</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 bg-slate-300 rounded-full"></span>
                        <span className="font-semibold text-slate-500">ปีที่แล้ว</span>
                      </div>
                    </div>
                  </div>

                  {/* Visual simulated bar graphs */}
                  <div className="h-64 flex items-end justify-between gap-6 px-4 pt-4 relative">
                    {/* Grid lines */}
                    <div className="absolute inset-x-0 top-0 bottom-0 flex flex-col justify-between pointer-events-none pb-6">
                      <div className="w-full h-px bg-slate-100"></div>
                      <div className="w-full h-px bg-slate-100"></div>
                      <div className="w-full h-px bg-slate-100"></div>
                      <div className="w-full h-px bg-slate-100"></div>
                    </div>

                    {state.otTrendData.months.map((month, idx) => {
                      const curVal = state.otTrendData.currentYear[idx];
                      const lastVal = state.otTrendData.lastYear[idx];
                      return (
                        <div key={month} className="flex-1 flex flex-col items-center gap-2 relative z-10 h-full group">
                          <div className="flex-1 w-full flex items-end justify-center gap-1">
                            {/* Last Year bar */}
                            <div 
                              style={{ height: `${lastVal}%` }}
                              className="w-1/3 bg-slate-200 rounded-t-md hover:bg-slate-300 transition-colors shadow-sm"
                              title={`ปีที่แล้ว: ${lastVal} ชม.`}
                            ></div>
                            {/* Current Year bar */}
                            <div 
                              style={{ height: `${curVal}%` }}
                              className="w-1/3 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-md group-hover:opacity-90 transition-opacity shadow-sm"
                              title={`ปีปัจจุบัน: ${curVal} ชม.`}
                            ></div>
                          </div>
                          <span className="text-xs font-semibold text-slate-600">{month}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* OT by Department list meters */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">ปริมาณชั่วโมง OT แยกตามแผนก</h4>
                    <p className="text-xs text-slate-500 mb-6">สัดส่วนและปริมาณชั่วโมงสะสม</p>
                  </div>

                  <div className="space-y-5 flex-1">
                    {state.departments.slice(0, 4).map((dept) => {
                      // Normalize percentage
                      const maxHr = 600;
                      const percentage = Math.min(100, Math.round((dept.otHours / maxHr) * 100));
                      return (
                        <div key={dept.id} className="group cursor-pointer">
                          <div className="flex justify-between items-end mb-1">
                            <span className="text-xs font-bold text-slate-700 group-hover:text-blue-600 transition-colors">{dept.nameTh}</span>
                            <span className="text-xs font-extrabold text-slate-900 font-mono">{dept.otHours} ชม.</span>
                          </div>
                          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden shadow-inner">
                            <div 
                              style={{ width: `${percentage}%` }}
                              className="bg-gradient-to-r from-blue-600 to-blue-400 h-full rounded-full group-hover:opacity-90 transition-opacity"
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-4 border-t border-slate-100 mt-6 flex items-center gap-2">
                    <Info className="w-4 h-4 text-slate-400" />
                    <p className="text-[10px] text-slate-500 font-medium">ข้อมูลจำลองอัปเดตแบบเรียลไทม์ทุก 10 นาที</p>
                  </div>
                </div>

              </div>

              {/* Employee OT Contribution Cards List */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">วิเคราะห์การจัดสรร OT รายบุคคล (Employee Contribution)</h4>
                    <p className="text-xs text-slate-500">รายชื่อผู้ที่ทำ OT สูงสุดและพนักงานที่มีความเสี่ยงสะสมชั่วโมงทำงานเกินกฎเกณฑ์ความปลอดภัย</p>
                  </div>
                  <button 
                    onClick={() => setActiveTab("employees")}
                    className="text-blue-600 font-semibold text-xs hover:text-blue-700 hover:underline flex items-center gap-1 transition-colors"
                  >
                    <span>ดูตารางรายชื่อทั้งหมด</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {state.employees.slice(0, 4).map((emp) => {
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
                  })}
                </div>
              </div>

            </div>
          )}

          {/* ======================================= */}
          {/* VIEW: DEPARTMENT REPORTS */}
          {/* ======================================= */}
          {activeTab === "reports" && (
            <div className="space-y-6">
              {/* Header card with analytics label and selectors */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-800">รายงานข้อมูลและงบประมาณรายแผนก</h3>
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
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>ส่งออกรายงาน PDF</span>
                  </button>
                </div>
              </div>

              {/* Row: Main charts split */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Visual Chart representation: Spending correlation */}
                <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
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
                          const maxOt = 500;
                          const otHeight = Math.round((otHours / maxOt) * 100);
                          return (
                            <div key={dept.id} className="flex-1 flex flex-col items-center group relative h-full">
                              <div 
                                style={{ height: `${otHeight}%` }}
                                className="w-10 bg-blue-600 absolute bottom-0 rounded-t transition-all hover:bg-blue-700 shadow-sm"
                              ></div>
                              <span className="absolute -bottom-6 text-[10px] font-bold text-slate-500">{dept.name}</span>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Left axis (Hours) */}
                    <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[10px] font-bold text-slate-400 pb-6">
                      <span>{selectedDeptFilter !== "ทุกแผนก" && selectedDeptFilter !== "ทุกแผนกทำงาน" ? "100h" : "500h"}</span>
                      <span>{selectedDeptFilter !== "ทุกแผนก" && selectedDeptFilter !== "ทุกแผนกทำงาน" ? "50h" : "250h"}</span>
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
                          <span className="text-red-500">฿200k</span>
                          <span className="text-red-500">฿100k</span>
                          <span className="text-red-500">฿0</span>
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
                            <img 
                              className="w-9 h-9 rounded-full object-cover border border-slate-200"
                              src={managerInfo.avatar} 
                              alt={managerInfo.name}
                            />
                            <div>
                              <p className="text-xs font-bold text-slate-800">{managerInfo.name}</p>
                              <p className="text-[9px] text-slate-500 uppercase tracking-wider">{managerInfo.role}</p>
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

              {/* Row: Peak Heatmap & KPIs radar simulation */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Heatmap block */}
                <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
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
                  <div className="grid grid-cols-8 gap-1.5 pt-2">
                    <div></div>
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => (
                      <div key={d} className="text-center text-[10px] font-bold text-slate-500">{d}</div>
                    ))}
                    
                    <div className="text-[10px] font-bold text-slate-500 flex items-center">17:00-19:00</div>
                    <div className="h-8 bg-blue-100 rounded-sm"></div>
                    <div className="h-8 bg-blue-100 rounded-sm"></div>
                    <div className="h-8 bg-blue-300 rounded-sm"></div>
                    <div className="h-8 bg-blue-100 rounded-sm"></div>
                    <div className="h-8 bg-blue-500 rounded-sm"></div>
                    <div className="h-8 bg-blue-300 rounded-sm"></div>
                    <div className="h-8 bg-slate-100 rounded-sm"></div>

                    <div className="text-[10px] font-bold text-slate-500 flex items-center">19:00-21:00</div>
                    <div className="h-8 bg-blue-300 rounded-sm"></div>
                    <div className="h-8 bg-blue-500 rounded-sm"></div>
                    <div className="h-8 bg-blue-800 rounded-sm"></div>
                    <div className="h-8 bg-blue-500 rounded-sm"></div>
                    <div className="h-8 bg-blue-800 rounded-sm"></div>
                    <div className="h-8 bg-blue-500 rounded-sm"></div>
                    <div className="h-8 bg-slate-200 rounded-sm"></div>

                    <div className="text-[10px] font-bold text-slate-500 flex items-center">21:00-23:00</div>
                    <div className="h-8 bg-slate-100 rounded-sm"></div>
                    <div className="h-8 bg-blue-100 rounded-sm"></div>
                    <div className="h-8 bg-blue-300 rounded-sm"></div>
                    <div className="h-8 bg-blue-500 rounded-sm"></div>
                    <div className="h-8 bg-blue-300 rounded-sm"></div>
                    <div className="h-8 bg-blue-100 rounded-sm"></div>
                    <div className="h-8 bg-slate-100 rounded-sm"></div>
                  </div>
                </div>

                {/* Simulated Radar Chart KPIs */}
                <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">ตัวชี้วัดประสิทธิภาพหลัก (Key KPIs)</h4>
                    <p className="text-xs text-slate-500 mb-4">ดัชนีชี้วัดความคล่องตัวและความเสถียรของทรัพยากรการผลิต</p>
                  </div>

                  <div className="flex-1 flex items-center justify-center relative min-h-[180px]">
                    {/* Simulated beautiful SVG Radar spiderweb */}
                    <svg className="w-44 h-44 overflow-visible" viewBox="0 0 100 100">
                      <polygon points="50,10 88,38 74,82 26,82 12,38" fill="none" stroke="#e2e8f0" strokeWidth="0.5" />
                      <polygon points="50,20 78,41 68,74 32,74 22,41" fill="none" stroke="#e2e8f0" strokeWidth="0.5" />
                      <polygon points="50,30 69,44 62,66 38,66 31,44" fill="none" stroke="#e2e8f0" strokeWidth="0.5" />
                      
                      <line x1="50" y1="50" x2="50" y2="10" stroke="#e2e8f0" strokeWidth="0.5" />
                      <line x1="50" y1="50" x2="88" y2="38" stroke="#e2e8f0" strokeWidth="0.5" />
                      <line x1="50" y1="50" x2="74" y2="82" stroke="#e2e8f0" strokeWidth="0.5" />
                      <line x1="50" y1="50" x2="26" y2="82" stroke="#e2e8f0" strokeWidth="0.5" />
                      <line x1="50" y1="50" x2="12" y2="38" stroke="#e2e8f0" strokeWidth="0.5" />

                      {/* Actual polygon values overlay */}
                      <polygon points="50,15 80,41 68,75 32,75 20,41" fill="rgba(59, 130, 246, 0.12)" stroke="#2563eb" strokeWidth="1.5" />
                      <polygon points="50,25 70,45 60,80 40,80 30,45" fill="rgba(239, 68, 68, 0.08)" stroke="#ef4444" strokeWidth="1.2" />
                    </svg>

                    {/* Labels */}
                    <span className="absolute top-2 text-[8px] font-bold text-slate-500">อัตราการผลิต</span>
                    <span className="absolute bottom-2 left-6 text-[8px] font-bold text-slate-500">ความล้าสะสม</span>
                    <span className="absolute bottom-2 right-6 text-[8px] font-bold text-slate-500">ความคุ้มค่า</span>
                  </div>

                  <div className="flex gap-4 justify-center text-[10px] font-bold text-slate-600 mt-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 bg-blue-600 rounded-sm"></span>
                      <span>ฝ่ายผลิต</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 bg-red-500 rounded-sm"></span>
                      <span>ตรวจสอบคุณภาพ</span>
                    </div>
                  </div>
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
                            <div className="font-extrabold text-slate-800 font-mono">฿{dept.budgetUsed.toLocaleString()}</div>
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
            <div className="space-y-6">
              {/* Header block with employee database controls */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-800">ฐานข้อมูลและชั่วโมงการทำงานสะสมของพนักงาน</h3>
                  <p className="text-xs text-slate-500 mt-1">ตรวจสอบ ประเมินความเหนื่อยล้า และบริหารจัดการเป้าหมายชั่วโมงโอทีประจำเดือน</p>
                </div>
                <div className="flex flex-wrap items-center gap-2.5">
                  {(currentUser?.canBackup === 1 || ["HR", "HR Section Manager", "ผู้ดูแลระบบ"].includes(currentUser?.role || "")) && (
                    <>
                      {/* Export Button */}
                      <button 
                        onClick={handleExportEmployees}
                        className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                        title="สำรองข้อมูลรายชื่อพนักงานทั้งหมดเป็นไฟล์ JSON"
                      >
                        <Download className="w-3.5 h-3.5 text-blue-600" />
                        <span>ส่งออกข้อมูล (Export)</span>
                      </button>

                      {/* Import Button */}
                      <label 
                        className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                        title="นำเข้าไฟล์สำรองเพื่อกู้คืนฐานข้อมูลพนักงาน"
                      >
                        <Upload className="w-3.5 h-3.5 text-indigo-600" />
                        <span>นำเข้าข้อมูล (Import)</span>
                        <input 
                          type="file"
                          accept=".json"
                          onChange={handleImportEmployees}
                          className="hidden"
                        />
                      </label>
                    </>
                  )}
                  
                  <button 
                    onClick={() => setShowAddEmployeeModal(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>เพิ่มพนักงานใหม่</span>
                  </button>
                </div>
              </div>

              {/* Employee roster list */}
              <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-100">
                  <h4 className="text-sm font-bold text-slate-800">รายชื่อบุคลากรที่อยู่ภายใต้การวิเคราะห์ (Roster List)</h4>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">พนักงาน / รหัส</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">สังกัดแผนก</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">บทบาทหน้าที่ / ทีมย่อย</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">OT ที่ทำจริง</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">โควตาเป้าหมายสูงสุด</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">สัดส่วนที่ใช้ไป</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-center">สถานะความเสี่ยง</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-center">การจัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
                      {filteredEmployees.map((emp) => {
                        const isOver = emp.actualOt > emp.targetOt;
                        const dept = state.departments.find(d => d.id === emp.deptId);
                        return (
                          <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <EmployeeAvatar empId={emp.id} empName={emp.name} className="w-9 h-9" />
                                <div>
                                  <p className="font-bold text-slate-800">{emp.name}</p>
                                  <p className="text-[10px] text-slate-400 font-mono">{emp.id}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 font-bold text-slate-600">
                              {dept ? dept.nameTh : "ไม่ระบุ"}
                            </td>
                            <td className="px-6 py-4">
                              <p className="font-semibold text-slate-700">{emp.role}</p>
                              <p className="text-[10px] text-slate-400">{emp.groupName}</p>
                            </td>
                            <td className="px-6 py-4 text-right font-extrabold text-slate-900 font-mono">
                              {emp.actualOt} ชม.
                            </td>
                            <td className="px-6 py-4 text-right font-bold text-slate-500 font-mono">
                              {emp.targetOt} ชม.
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex-grow bg-slate-100 h-2 rounded-full overflow-hidden max-w-[120px]">
                                  <div 
                                    style={{ width: `${Math.min(100, emp.otPct)}%` }}
                                    className={`h-full rounded-full ${isOver ? 'bg-red-500' : 'bg-blue-600'}`}
                                  ></div>
                                </div>
                                <span className={`font-bold font-mono ${isOver ? 'text-red-500' : 'text-slate-700'}`}>{emp.otPct}%</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${
                                isOver 
                                  ? "bg-red-50 text-red-700 border-red-100 animate-pulse" 
                                  : "bg-emerald-50 text-emerald-700 border-emerald-100"
                              }`}>
                                {isOver ? "Over Limit ⚠️" : "Safe Zone ✅"}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => startEditEmployee(emp)}
                                  className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-xl transition-all cursor-pointer inline-flex items-center justify-center"
                                  title="แก้ไขข้อมูลพนักงาน"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                                  </svg>
                                </button>
                                {["HR", "HR Section Manager", "ผู้ดูแลระบบ"].includes(currentUser?.role || "") && (
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteEmployee(emp.id)}
                                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-xl transition-all cursor-pointer inline-flex items-center justify-center"
                                    title="ลบพนักงานออกจากระบบ"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                    </svg>
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
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
            <div className="space-y-6">
              {/* Header toolbar */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-800">ตารางการจัดกะทำงานและแผนงาน (Shift Planner)</h3>
                  <p className="text-xs text-slate-500 mt-1">แผนกผลิต A</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* Select Year */}
                  <select
                    value={(state?.shiftConfig?.currentMonth || "2026-07").split("-")[0]}
                    onChange={(e) => {
                      const newYear = e.target.value;
                      const currentMonthVal = (state?.shiftConfig?.currentMonth || "2026-07").split("-")[1];
                      updatePlannerMonth(`${newYear}-${currentMonthVal}`);
                    }}
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
                  >
                    {[2023, 2024, 2025, 2026, 2027, 2028].map(y => (
                      <option key={y} value={String(y)}>ปี {y}</option>
                    ))}
                  </select>

                  {/* Select Month */}
                  <select
                    value={(state?.shiftConfig?.currentMonth || "2026-07").split("-")[1]}
                    onChange={(e) => {
                      const newMonth = e.target.value;
                      const currentYearVal = (state?.shiftConfig?.currentMonth || "2026-07").split("-")[0];
                      updatePlannerMonth(`${currentYearVal}-${newMonth}`);
                    }}
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
                  >
                    {[
                      { val: "01", label: "มกราคม" },
                      { val: "02", label: "กุมภาพันธ์" },
                      { val: "03", label: "มีนาคม" },
                      { val: "04", label: "เมษายน" },
                      { val: "05", label: "พฤษภาคม" },
                      { val: "06", label: "มิถุนายน" },
                      { val: "07", label: "กรกฎาคม" },
                      { val: "08", label: "สิงหาคม" },
                      { val: "09", label: "กันยายน" },
                      { val: "10", label: "ตุลาคม" },
                      { val: "11", label: "พฤศจิกายน" },
                      { val: "12", label: "ธันวาคม" }
                    ].map(m => (
                      <option key={m.val} value={m.val}>{m.label}</option>
                    ))}
                  </select>

                  {/* Select Period (Week / Full Month) */}
                  <select
                    value={selectedWeek}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedWeek(val);
                      if (val === "all") {
                        setDaysLimit(30);
                      } else {
                        setDaysLimit(7);
                      }
                    }}
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
                  >
                    <option value="all">เต็มเดือน (ทั้งเดือน)</option>
                    {weeksList.map((w) => (
                      <option key={w.weekNum} value={String(w.weekNum)}>
                        สัปดาห์ที่ {w.weekNum} (วันที่ {w.startDay} - {w.endDay})
                      </option>
                    ))}
                  </select>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setShowShiftLegend(!showShiftLegend)}
                      className="flex items-center gap-1 px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
                    >
                      <span className="text-slate-500">💡</span>
                      <span className="hidden sm:inline">{showShiftLegend ? "ซ่อนรหัสกะ" : "แสดงรหัสกะ"}</span>
                    </button>
                    <button 
                      onClick={() => setIsFullScreen(!isFullScreen)}
                      className="flex items-center gap-1 px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
                    >
                      {isFullScreen ? <Minimize className="w-4 h-4 text-slate-500" /> : <Maximize className="w-4 h-4 text-slate-500" />}
                      <span className="hidden sm:inline">{isFullScreen ? "ออกเต็มจอ" : "เต็มจอ"}</span>
                    </button>
                  </div>

                  {isEditingShifts ? (
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          setIsEditingShifts(false);
                          setTempEmployees(state.employees);
                        }}
                        className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 transition-colors"
                      >
                        ยกเลิก
                      </button>
                      <button 
                        onClick={handleSaveShifts}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-500/10"
                      >
                        บันทึกการจัดกะ
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => {
                        setIsEditingShifts(true);
                        setTempEmployees(JSON.parse(JSON.stringify(state.employees)));
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/10"
                    >
                      <span>แก้ไขกะด่วน</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Shift Legend / Keys explanation matching image exactly */}
              {showShiftLegend && (
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-pulse"></span>
                      <span>สัญลักษณ์รหัสกะและตารางการจัดสีเวร (Shift Master Legend)</span>
                    </h4>
                    <div className="text-blue-600 flex items-center gap-1.5 text-xs font-bold">
                      <span className="w-2 h-2 bg-blue-600 rounded-full animate-ping"></span>
                      <span>รูปแบบหลักขององค์กร: 4-on-2-off</span>
                    </div>
                  </div>

                  <div className="overflow-x-auto pb-2">
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

              {/* Master Calendar Grid Canvas */}
              <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
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

                      {/* OT Column Header */}
                      <div className={`flex-shrink-0 p-2 border-l border-slate-200 flex flex-col justify-center items-center bg-blue-50/50 ${daysLimit === 30 ? "w-20" : "w-24"}`}>
                        <span className="text-[10px] font-bold text-slate-700 uppercase leading-tight">รวม OT</span>
                        <span className="text-[9px] font-semibold text-blue-600">ราย{daysLimit === 7 ? "สัปดาห์" : daysLimit === 14 ? " 2 สัปดาห์" : "เดือน"}</span>
                      </div>
                    </div>

                    <div className="bg-blue-50/40 px-4 py-2 border-b border-slate-200">
                      <span className="text-xs font-bold text-blue-700">รายชื่อบุคลากรและแผนการจัดกะทำงานทั้งหมด (All Employees)</span>
                    </div>

                    {/* Employee scheduler rows */}
                    <div className="divide-y divide-slate-100">
                      {(isEditingShifts ? tempEmployees : state.employees)
                        .filter(emp => activeDeptId === "all" || emp.deptId === activeDeptId)
                        .map((emp) => {
                        return (
                          <div 
                            key={emp.id} 
                            className={`flex hover:bg-slate-50/50 transition-colors group ${
                              activeEditingCell && activeEditingCell.employeeId === emp.id ? "relative z-30" : "relative z-0"
                            }`}
                          >
                            {/* Employee ID & Name head */}
                            <div className="w-56 flex-shrink-0 border-r border-slate-200 bg-white group-hover:bg-slate-50 flex items-center gap-2.5 px-3 py-1.5 sticky left-0 z-10 shadow-sm">
                              <EmployeeAvatar empId={emp.id} empName={emp.name} className="w-7 h-7" />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-slate-800 truncate">{emp.name}</p>
                                <p className="text-[9px] text-slate-400 font-mono font-semibold">{emp.id}</p>
                              </div>
                            </div>

                            {/* Shift Cells */}
                            <div className="flex">
                              {currentDays.map((day) => {
                                const dayIdx = day.n - 1;
                                const shift = emp.shifts[dayIdx] || "O";
                                const styleClass = getShiftStyle(shift);
                                const isActiveCell = activeEditingCell && activeEditingCell.employeeId === emp.id && activeEditingCell.dayIndex === dayIdx;

                                return (
                                  <div 
                                    key={dayIdx} 
                                    onClick={() => handleShiftCellClick(emp.id, dayIdx)}
                                    style={{ 
                                      width: daysLimit === 30 ? "35px" : daysLimit === 14 ? "48px" : "56px",
                                      height: daysLimit === 30 ? "40px" : daysLimit === 14 ? "48px" : "56px"
                                    }}
                                    className={`flex-shrink-0 p-1 border-r border-slate-200 flex items-center justify-center cursor-pointer select-none transition-all relative ${
                                      isEditingShifts ? "hover:scale-95 hover:shadow-inner bg-slate-50/50" : ""
                                    } ${
                                      isActiveCell ? "z-50" : "z-0"
                                    }`}
                                  >
                                    <div className={`w-full h-full border rounded-lg flex items-center justify-center font-extrabold ${
                                      daysLimit === 30 ? "text-[9px]" : "text-xs"
                                    } ${styleClass}`}>
                                      {shift === "⚠" ? (
                                        <div className="flex items-center justify-center text-red-600" title="กำลังพลทำงานต่อเนื่อง เกินขีดปลอดภัย!">
                                          ⚠️
                                        </div>
                                      ) : (
                                        shift
                                      )}
                                    </div>

                                    {/* Interactive Dropdown Popover Picker */}
                                    {isEditingShifts && activeEditingCell && activeEditingCell.employeeId === emp.id && activeEditingCell.dayIndex === dayIdx && (
                                      <div 
                                        className="absolute top-12 left-0 z-50 bg-white border border-slate-200 rounded-2xl shadow-2xl p-2.5 min-w-[280px] text-left"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <div className="text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">เลือกกะการทำงาน:</div>
                                        <div className="grid grid-cols-2 gap-1.5 max-h-[220px] overflow-y-auto pr-1">
                                          {SHIFT_OPTIONS.map((opt) => (
                                            <button
                                              key={opt.code}
                                              type="button"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleSelectShiftValue(emp.id, dayIdx, opt.code);
                                              }}
                                              className={`flex flex-col items-center justify-center p-1.5 border rounded-lg hover:opacity-90 active:scale-95 transition-all text-center ${getShiftStyle(opt.code)}`}
                                            >
                                              <span className="text-[11px] font-extrabold leading-none">{opt.code}</span>
                                              <span className="text-[8px] opacity-75 font-medium mt-0.5">{opt.desc}</span>
                                            </button>
                                          ))}
                                        </div>

                                        {/* Custom Shift Manual Input */}
                                        <div className="mt-2 pt-2 border-t border-slate-100 flex gap-1.5 items-center">
                                          <input
                                            type="text"
                                            maxLength={5}
                                            placeholder="กะกำหนดเอง (เช่น M7, N9)"
                                            id={`custom-shift-input-${emp.id}-${dayIdx}`}
                                            className="flex-1 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            onKeyDown={(e) => {
                                              if (e.key === "Enter") {
                                                const val = (e.target as HTMLInputElement).value.trim().toUpperCase();
                                                if (val) {
                                                  handleSelectShiftValue(emp.id, dayIdx, val);
                                                }
                                              }
                                            }}
                                          />
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const input = document.getElementById(`custom-shift-input-${emp.id}-${dayIdx}`) as HTMLInputElement;
                                              const val = input?.value.trim().toUpperCase();
                                              if (val) {
                                                handleSelectShiftValue(emp.id, dayIdx, val);
                                              }
                                            }}
                                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                                          >
                                            ตกลง
                                          </button>
                                        </div>

                                        <button 
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveEditingCell(null);
                                          }}
                                          className="mt-2 w-full py-1.5 text-center bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[10px] font-bold transition-colors"
                                        >
                                          ปิดเมนู
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>

                            {/* OT Column Cell */}
                            <div className={`flex-shrink-0 flex items-center justify-center border-l border-slate-200 bg-blue-50/20 font-mono text-xs font-bold ${daysLimit === 30 ? "w-20" : "w-24"}`}>
                              {(() => {
                                const periodOtHours = currentDays.reduce((acc, day) => {
                                  const shift = emp.shifts[day.n - 1] || "O";
                                  return acc + getShiftOtHours(shift);
                                }, 0);
                                const periodTargetOt = selectedWeek === "all" ? emp.targetOt : emp.targetOt / 4;
                                const otPercentage = Math.round((periodOtHours / periodTargetOt) * 100) || 0;
                                const isOver = otPercentage > 100;
                                
                                return (
                                  <div className="flex flex-col items-center">
                                    <span className={periodOtHours > 0 ? "text-blue-700" : "text-slate-400"}>{periodOtHours} ชม.</span>
                                    <span className={`text-[10px] px-1.5 rounded-full mt-0.5 ${isOver ? "bg-red-100 text-red-600" : periodOtHours > 0 ? "bg-blue-100 text-blue-600" : "text-transparent"}`}>
                                      {periodOtHours > 0 ? `${otPercentage}%` : "0%"}
                                    </span>
                                  </div>
                                );
                              })()}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Summary Row Footers */}
                    <div className="flex flex-col border-t-2 border-slate-200 sticky bottom-0 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                      {/* Row 1: Coverage */}
                      <div className="flex bg-slate-100 border-b border-slate-200">
                        <div className={`w-56 flex-shrink-0 border-r border-slate-200 font-bold text-slate-600 text-[11px] flex items-center ${daysLimit === 30 ? "p-2" : "p-3"}`}>
                          สรุปความคุ้มครอง (M/A/N)
                        </div>
                        
                        <div className="flex flex-1 text-[10px] font-extrabold text-slate-600 font-mono">
                          {currentDays.map((_, dayIdx) => {
                            const summary = getDailyShiftSummary(dayIdx);
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

                        <div className={`flex-shrink-0 border-l border-slate-200 bg-slate-200 ${daysLimit === 30 ? "w-20" : "w-24"}`}></div>
                      </div>

                      {/* Row 2: Daily OT Hours */}
                      <div className="flex bg-blue-50/60">
                        <div className={`w-56 flex-shrink-0 border-r border-slate-200 font-bold text-blue-800 text-[11px] flex items-center ${daysLimit === 30 ? "p-2" : "p-3"}`}>
                          สรุปชั่วโมง OT รายวัน (ชม.)
                        </div>
                        
                        <div className="flex flex-1 text-[10px] font-extrabold text-blue-700 font-mono">
                          {currentDays.map((_, dayIdx) => {
                            let dailyOt = 0;
                            const activeList = isEditingShifts ? tempEmployees : state.employees;
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

                        {/* Grand Total OT column */}
                        <div className={`flex-shrink-0 p-1 text-center border-l border-slate-200 flex flex-col justify-center items-center bg-blue-100 ${daysLimit === 30 ? "w-20" : "w-24"}`}>
                           {(() => {
                              let totalOt = 0;
                              const activeList = isEditingShifts ? tempEmployees : state.employees;
                              activeList.forEach(emp => {
                                 const periodShifts = getEmployeeShiftsForView(emp.shifts, daysLimit);
                                 totalOt += periodShifts.reduce((acc, shift) => acc + getShiftOtHours(shift), 0);
                              });
                              return (
                                 <div className="flex flex-col items-center">
                                   <span className="text-[10px] text-blue-800 font-extrabold">{totalOt}h</span>
                                 </div>
                              );
                           })()}
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>

              {/* Instructions if editing */}
              {isEditingShifts && (
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center gap-3 text-xs text-blue-700 shadow-sm animate-bounce">
                  <Info className="w-4 h-4 flex-shrink-0" />
                  <p><strong>💡 วิธีการแก้ไขกะด่วน:</strong> คุณสามารถคลิกที่รหัสกะของพนักงานเพื่อสลับเวร (พักผ่อน O &rarr; เช้า M &rarr; บ่าย A &rarr; ดึก N) และระบบจะคำนวณสถิติด้านล่างทันที!</p>
                </div>
              )}
            </div>
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
          {/* VIEW: SETTINGS */}
          {/* ======================================= */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              {/* Header card */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-extrabold text-slate-800">การตั้งค่ากฎเกณฑ์และการวิเคราะห์ของระบบ</h3>
                <p className="text-xs text-slate-500 mt-1">กำหนดเป้าหมาย ขีดจำกัดชั่วโมงโอทีความปลอดภัย และนโยบายการจัดตารางกะ</p>
              </div>

              {/* Grid configs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Labor laws parameters limits */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
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

                {/* User & Permissions Management (Visible only to Admin) */}
                {currentUser?.deptId === "all" && (
                  <div className="col-span-1 md:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">ระบบการจัดการบัญชีและสิทธิ์ผู้สวมบทบาท (Users & Permissions)</h4>
                      <p className="text-xs text-slate-500">ปรับเปลี่ยนสิทธิ์ความรับผิดชอบของหัวหน้างาน หรือรีเซ็ตรหัสผ่านของพนักงานอื่น</p>
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
                                <img 
                                  src={acc.avatar} 
                                  className="w-8 h-8 rounded-full object-cover border border-slate-100" 
                                  alt=""
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = "https://lh3.googleusercontent.com/aida-public/AB6AXuAf5UhzQFkBl2tAqPIfYe5tF5JObtrReGu_lohxjpxav5OEjcmmCJhPclOvd2pYN5Q63ircrUY62HYEtYICs05VEFPgL0t4CQSbr1dUS_veJddqwvCz2hrMENO5DyK5fUo9Lx_K8EQj_RXIf9a91CYGwMUZftntpoCZ5n7RUAnxYNIsXz71ttH1VvWFLTpEggMdONt3b-WOccq3oi4S33bsL6DAyTg_90K2vzyRwxDzf3Isscur4MrcuQ";
                                  }}
                                />
                                <div>
                                  <div className="font-bold text-slate-800">{acc.name}</div>
                                  <div className="text-[10px] text-slate-400 font-mono">{acc.username}</div>
                                </div>
                              </td>
                              <td className="p-4">
                                <select 
                                  value={acc.role === "ผู้ดูแลระบบ" ? "admin" : "supervisor"}
                                  onChange={(e) => {
                                    const nextRole = e.target.value === "admin" ? "ผู้ดูแลระบบ" : `Section Manager`;
                                    const nextDept = e.target.value === "admin" ? "all" : acc.deptId === "all" ? "inter2" : acc.deptId;
                                    handleUpdateAccountPermission(acc.username, nextRole, nextDept);
                                  }}
                                  className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700 font-medium"
                                >
                                  <option value="admin">ผู้ดูแลระบบสูงสุด (Admin)</option>
                                  <option value="supervisor">หัวหน้าแผนก (Supervisor)</option>
                                </select>
                              </td>
                              <td className="p-4">
                                <select
                                  disabled={acc.role === "ผู้ดูแลระบบ"}
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
                )}

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
          {/* VIEW: PERSONAL PROFILE SETTINGS */}
          {/* ======================================= */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              {/* Header card */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-800">จัดการข้อมูลโปรไฟล์ส่วนตัว</h3>
                  <p className="text-xs text-slate-500 mt-1">อัปเดตชื่อแสดงผล ลิงก์รูปภาพโปรไฟล์ และเปลี่ยนรหัสผ่านเพื่อความปลอดภัย</p>
                </div>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left card: Current Profile Preview */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col items-center justify-center text-center space-y-4">
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
                <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
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
      {/* OVERLAY / MODAL: ADD NEW EMPLOYEE */}
      {/* ======================================= */}
      {showAddEmployeeModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-slate-900">เพิ่มพนักงานเข้าสู่แผนภูมิระบบ</h3>
                <p className="text-xs text-slate-500">กรอกข้อมูลพื้นฐานพนักงานเพื่อจัดสรรกะและนโยบาย OT</p>
              </div>
              <button 
                onClick={() => setShowAddEmployeeModal(false)}
                className="p-1.5 hover:bg-slate-200/60 rounded-full text-slate-400"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddEmployee} className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* 1. รหัสพนักงาน */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">รหัสพนักงาน (เว้นว่างไว้จะทำการสุ่มรหัสให้อัตโนมัติ)</label>
                <input 
                  type="text"
                  value={newEmpId}
                  onChange={(e) => setNewEmpId(e.target.value)}
                  placeholder="เช่น T-1048"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* 2. ชื่อ - นามสกุล */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">ชื่อ - นามสกุล</label>
                <input 
                  type="text"
                  value={newEmpName}
                  onChange={(e) => setNewEmpName(e.target.value)}
                  placeholder="เช่น สมศักดิ์ มั่นใจ"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>

              {/* 3. ตำแหน่ง */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">ตำแหน่ง (พิมพ์ระบุเองหรือเลือกจากรายการ)</label>
                <input 
                  type="text"
                  list="roles-suggestions"
                  value={newEmpRole}
                  onChange={(e) => setNewEmpRole(e.target.value)}
                  placeholder="เช่น Technician"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:ring-2 focus:ring-blue-500/20"
                  required
                />
                <datalist id="roles-suggestions">
                  {uniqueRoles.map((role, idx) => (
                    <option key={idx} value={role} />
                  ))}
                </datalist>
              </div>

              {/* 4. แผนก */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">แผนก</label>
                <select 
                  value={newEmpDept}
                  onChange={(e) => setNewEmpDept(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="inter2">INTER 2</option>
                  <option value="inter3">INTER 3</option>
                  <option value="inter5">INTER 5</option>
                  <option value="inter7">INTER 7</option>
                  <option value="heavy">Heavy Machine</option>
                  <option value="ecc">ECC</option>
                </select>
              </div>

              {/* 5. ฝ่าย */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">ฝ่าย (พิมพ์ระบุเองหรือเลือกจากรายการ)</label>
                <input 
                  type="text"
                  list="groups-suggestions"
                  value={newEmpGroupName}
                  onChange={(e) => setNewEmpGroupName(e.target.value)}
                  placeholder="เช่น ทีม ก. (ช่างเทคนิคอาวุโส)"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:ring-2 focus:ring-blue-500/20"
                  required
                />
                <datalist id="groups-suggestions">
                  {uniqueGroups.map((group, idx) => (
                    <option key={idx} value={group} />
                  ))}
                </datalist>
              </div>

              <div className="pt-4 border-t border-slate-100 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddEmployeeModal(false)}
                  className="w-1/2 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 shadow-md shadow-blue-500/10"
                >
                  เพิ่มพนักงาน
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
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
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

            <form onSubmit={handleEditEmployee} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">ชื่อพนักงาน</label>
                <input 
                  type="text"
                  value={editEmpName}
                  onChange={(e) => setEditEmpName(e.target.value)}
                  placeholder="เช่น สมศักดิ์ มั่นใจ"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">แผนกสังกัดหลัก</label>
                <select 
                  value={editEmpDept}
                  onChange={(e) => setEditEmpDept(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700"
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
                <label className="block text-xs font-bold text-slate-600 mb-1.5">ตำแหน่งงานปฏิบัติการ (Role)</label>
                <input 
                  type="text"
                  value={editEmpRole}
                  onChange={(e) => setEditEmpRole(e.target.value)}
                  placeholder="เช่น Lead Operator / Senior Tech"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">ชื่อทีมย่อยสำหรับการจัดตารางกะ</label>
                <input 
                  type="text"
                  value={editEmpGroupName}
                  onChange={(e) => setEditEmpGroupName(e.target.value)}
                  placeholder="เช่น ทีม ก. (ช่างเทคนิคอาวุโส) หรือ ทีม ข. (โอเปอเรเตอร์)"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">โควตาความปลอดภัยสะสมสูงสุดต่อเดือน (ชั่วโมง)</label>
                <input 
                  type="number"
                  value={editEmpTargetOt}
                  onChange={(e) => setEditEmpTargetOt(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700"
                  required
                />
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
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">ชื่อผู้ใช้งาน (Username) <span className="text-red-500">*</span></label>
                <input 
                  type="text"
                  value={editAccountUsername}
                  onChange={(e) => setEditAccountUsername(e.target.value)}
                  placeholder="เช่น mfg_mgr, somchai"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:ring-2 focus:ring-blue-500/20"
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
                  placeholder="วาง URL ลิงก์รูปภาพโปรไฟล์ของคุณ"
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



    </div>
  );
}
