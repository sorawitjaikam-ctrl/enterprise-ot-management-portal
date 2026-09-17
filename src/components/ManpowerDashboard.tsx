import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Users,
  Search,
  Filter,
  Download,
  Upload,
  Plus,
  RotateCcw,
  Check,
  X,
  AlertTriangle,
  FileSpreadsheet,
  Edit2,
  Trash2,
  BarChart3,
  Building2,
  Briefcase,
  Layers,
  ArrowUpDown,
  ShieldCheck,
  Info,
  Loader2,
  CheckCircle2,
  Cloud,
  Database
} from "lucide-react";
import { ManpowerPosition } from "../types";

// Standard canonical categories for level classification
const STANDARD_ROLE_CATEGORIES = [
  { id: 'crane', label: 'พนักงานขับเครน', level: 'staff' as const, patterns: [/เครน/i, /crane/i] },
  { id: 'heavy_op', label: 'ช่างขับจักรกลหนัก', level: 'staff' as const, patterns: [/ช่างขับจักรกล/i, /ขับจักรกล/i, /heavy machine operator/i, /operator/i, /คนขับจักรกล/i] },
  { id: 'heavy_sup', label: 'ผู้ควบคุมงานจักรกลหนัก', level: 'staff' as const, patterns: [/ควบคุมงานจักรกล/i, /ควบคุมจักรกล/i, /คุมจักรกล/i, /heavy supervisor/i] },
  { id: 'cargo_sup', label: 'ผู้ควบคุมงานขนถ่ายสินค้า', level: 'staff' as const, patterns: [/ขนถ่ายสินค้า/i, /ขนถ่าย/i, /cargo/i] },
  { id: 'deck', label: 'ช่างปากเรือ', level: 'staff' as const, patterns: [/ปากเรือ/i, /deck/i] },
  { id: 'om_spec', label: 'O&M Specialist', level: 'staff' as const, patterns: [/o&m spec/i, /specialist/i, /ช่างทุ่น/i] },
  { id: 'om_gen', label: 'O&M Generator', level: 'staff' as const, patterns: [/o&m gen/i, /generator/i, /เยนเนอเรเตอร์/i] },
  { id: 'om_mech', label: 'O&M Mechanical', level: 'staff' as const, patterns: [/o&m mech/i, /mechanical/i, /เครื่องกล/i, /ช่างกล/i] },
  { id: 'om_elec', label: 'O&M Electrical', level: 'staff' as const, patterns: [/o&m elec/i, /electrical/i, /ไฟฟ้า/i, /ช่างไฟ/i] },
  { id: 'control', label: 'เจ้าหน้าที่ศูนย์ควบคุม', level: 'staff' as const, patterns: [/ศูนย์ควบคุม/i, /control/i, /ควบคุมระบบ/i] },
  { id: 'eng', label: 'วิศวกร (Operation & Improvement)', level: 'eng' as const, patterns: [/engineer/i, /วิศวกร/i, /วิศว/i] },
  { id: 'mgr', label: 'ผู้จัดการ (Managers)', level: 'mgr' as const, patterns: [/ผู้จัดการ/i, /manager/i, /incharge/i, /incharged/i, /ฝ่ายปฏิบัติการ/i] },
  { id: 'maint_imp', label: 'Maintenance Improvement', level: 'mgr' as const, patterns: [/improvement/i, /ปรับปรุง/i, /maintenance/i] }
];

// Helper: Categorize role into level
function getRoleLevel(role: string, isMgr?: boolean, isEng?: boolean): 'mgr' | 'eng' | 'staff' {
  if (isMgr) return 'mgr';
  if (isEng) return 'eng';
  const r = (role || '').trim();
  for (const cat of STANDARD_ROLE_CATEGORIES) {
    for (const pat of cat.patterns) {
      if (pat.test(r)) return cat.level;
    }
  }
  if (/ผู้จัดการ|manager|incharge|ฝ่ายปฏิบัติการ/i.test(r)) return 'mgr';
  if (/engineer|วิศวกร|วิศว/i.test(r)) return 'eng';
  return 'staff';
}

// Photo resolver for intranet employee card
function getEmpPhotoUrl(empId?: string): string | null {
  if (!empId) return null;
  const cleanId = empId.toString().trim().replace(/^EMP-0*/i, '').replace(/\D/g, '');
  if (cleanId) {
    return `https://intranet.advanceagro.net/employeecard/empimages/${cleanId}.jpg`;
  }
  return null;
}

// Safe loader from local storage with mock-data purge
function getInitialPositions(): ManpowerPosition[] {
  const saved = localStorage.getItem("port_ops_manpower_masterList");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        // Purge obsolete dummy mock data (e.g. สุดหล่อ, placeholder workers)
        const hasMockData = parsed.some(p =>
          p && p.name && (
            p.name.includes("สุดหล่อ") ||
            p.name.includes("พนักงานขับเครนคนที่") ||
            p.name.includes("ช่างขับจักรกลคนที่") ||
            p.name.includes("ช่างเยนเนอเรเตอร์") ||
            p.name.includes("ช่างกลโรงงาน") ||
            p.name.includes("จนท.ขนถ่าย") ||
            p.name.includes("นายเชี่ยวชาญ ระบบ") ||
            p.name.includes("นายประสิทธิ์ ช่างทุ่น")
          )
        );
        if (hasMockData) {
          localStorage.removeItem("port_ops_manpower_masterList");
          return [];
        }
        return parsed;
      }
    } catch (e) {
      console.error("Failed to load saved positions:", e);
    }
  }
  return [];
}

function normalizeUnitToDeptId(unit?: string): string {
  if (!unit) return "inter2";
  const clean = String(unit).trim().toLowerCase().replace(/\s+/g, "");
  if (clean.includes("inter2")) return "inter2";
  if (clean.includes("inter3")) return "inter3";
  if (clean.includes("inter5")) return "inter5";
  if (clean.includes("inter7")) return "inter7";
  if (clean.includes("heavy")) return "heavy";
  if (clean.includes("ecc")) return "ecc";
  return clean;
}

export interface ManpowerDashboardProps {
  employees?: any[];
  onSyncEmployees?: (updatedEmployees: any[]) => void;
  onRefreshPortalState?: () => Promise<void>;
}

export default function ManpowerDashboard({
  employees = [],
  onSyncEmployees,
  onRefreshPortalState
}: ManpowerDashboardProps = {}) {
  const [shiftMode, setShiftMode] = useState<"3T" | "2T">("3T");
  const [positions, setPositions] = useState<ManpowerPosition[]>(getInitialPositions);
  const [syncStatus, setSyncStatus] = useState<"synced" | "syncing" | "offline">("synced");
  const isFirstSync = useRef(true);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [unitFilter, setUnitFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [ocTypeFilter, setOcTypeFilter] = useState("ALL");
  const [levelFilter, setLevelFilter] = useState("ALL");
  const [roleTableLevelFilter, setRoleTableLevelFilter] = useState("ALL");

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState<ManpowerPosition | null>(null);
  const [isAddMode, setIsAddMode] = useState(false);

  // Form states in modal
  const [formId, setFormId] = useState("");
  const [formEmpId, setFormEmpId] = useState("");
  const [formName, setFormName] = useState("");
  const [formRole, setFormRole] = useState("");
  const [formUnit, setFormUnit] = useState("");
  const [formStatus, setFormStatus] = useState<"Active" | "Vacant">("Active");
  const [formOcType, setFormOcType] = useState<"OLD" | "NEW">("OLD");
  const [formLevel, setFormLevel] = useState<"staff" | "mgr" | "eng">("staff");

  // File input ref for trigger from empty state
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<number | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = window.setTimeout(() => setToastMessage(null), 3000);
  };

  // Load data from Cloudflare D1 Backend on mount
  useEffect(() => {
    let isMounted = true;
    const fetchPositions = async () => {
      try {
        setSyncStatus("syncing");
        const res = await fetch("/api/manpower");
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.success && Array.isArray(data.positions)) {
            if (data.positions.length > 0) {
              setPositions(data.positions);
              localStorage.setItem("port_ops_manpower_masterList", JSON.stringify(data.positions));
            } else {
              // If remote D1 is empty but localStorage has non-mock items, push them up
              const local = getInitialPositions();
              if (local.length > 0) {
                await fetch("/api/manpower/bulk", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ positions: local })
                });
              }
            }
            setSyncStatus("synced");
            return;
          }
        }
        if (isMounted) setSyncStatus("offline");
      } catch (err) {
        console.warn("Could not sync with /api/manpower:", err);
        if (isMounted) setSyncStatus("offline");
      }
    };

    fetchPositions();
    return () => {
      isMounted = false;
    };
  }, []);

  // Save to LocalStorage and debounced sync to Cloudflare D1
  useEffect(() => {
    localStorage.setItem("port_ops_manpower_masterList", JSON.stringify(positions));

    if (isFirstSync.current) {
      isFirstSync.current = false;
      return;
    }

    setSyncStatus("syncing");
    const timer = setTimeout(async () => {
      try {
        const res = await fetch("/api/manpower/bulk", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ positions })
        });
        if (res.ok) {
          setSyncStatus("synced");
          onRefreshPortalState?.();
        } else {
          setSyncStatus("offline");
        }
      } catch (err) {
        console.warn("Auto-sync to /api/manpower/bulk failed:", err);
        setSyncStatus("offline");
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [positions]);

  // Dynamic unit list derived directly from data
  const availableUnits = useMemo(() => {
    const unitsInMaster = Array.from(new Set(positions.map(p => (p.unit || "").trim()).filter(Boolean)));
    return unitsInMaster.length > 0
      ? unitsInMaster
      : ["INTER 2", "INTER 3", "INTER 5", "INTER 7", "Heavy Machine", "CONTROL", "Improvement", "Management"];
  }, [positions]);

  // Standard roles list for suggestions
  const standardRoleNames = useMemo(() => {
    const rolesInMaster = Array.from(new Set(positions.map(p => (p.role || "").trim()).filter(Boolean)));
    const defaultSuggestions = [
      "พนักงานขับเครน",
      "ช่างขับจักรกลหนัก",
      "ผู้ควบคุมงานจักรกลหนัก",
      "ผู้ควบคุมงานขนถ่ายสินค้า",
      "ช่างปากเรือ",
      "O&M Specialist",
      "O&M Generator",
      "O&M Mechanical",
      "O&M Electrical",
      "เจ้าหน้าที่ศูนย์ควบคุม",
      "Operation Engineer",
      "Improvement Engineer",
      "ผู้จัดการฝ่ายปฏิบัติการ",
      "ผู้จัดการแผนก",
      "Maintenance Improvement"
    ];
    return Array.from(new Set([...rolesInMaster, ...defaultSuggestions]));
  }, [positions]);

  // Dynamic computation for Unit Data
  const unitBreakdownData = useMemo(() => {
    return availableUnits.map(uKey => {
      const inUnit = positions.filter(p => (p.unit || "").trim() === uKey);
      const total = inUnit.length;
      const vacant = inUnit.filter(p => p.status === "Vacant").length;
      const active = total - vacant;

      const oldInUnit = inUnit.filter(p => p.ocType === "OLD").length;
      const newInUnit = inUnit.filter(p => p.ocType === "NEW").length;

      let quota2T = oldInUnit;
      let quota3T = total;
      if (oldInUnit === 0 && newInUnit === 0) {
        quota2T = total;
        quota3T = total;
      }

      const target = shiftMode === "2T" ? quota2T : quota3T;
      const diff = total - target;
      const fill = target > 0 ? Math.round((active / target) * 100) : (active > 0 ? 100 : 0);

      return {
        key: uKey,
        title: uKey,
        quota2T,
        quota3T,
        target,
        total,
        active,
        vacant,
        diff,
        fill
      };
    }).filter(u => u.total > 0 || u.target > 0);
  }, [positions, availableUnits, shiftMode]);

  // Dynamic computation for Role Data
  const roleBreakdownData = useMemo(() => {
    const presentRoleNames = Array.from(new Set(positions.map(p => (p.role || "").trim()).filter(Boolean)));
    const rows = presentRoleNames.map(rName => {
      const inRole = positions.filter(p => (p.role || "").trim() === rName);
      if (inRole.length === 0) return null;

      const level = getRoleLevel(rName, inRole.some(p => p.isMgr), inRole.some(p => p.isEng));

      const total = inRole.length;
      const vacant = inRole.filter(p => p.status === "Vacant").length;
      const active = total - vacant;

      const oldInRole = inRole.filter(p => p.ocType === "OLD").length;
      const newInRole = inRole.filter(p => p.ocType === "NEW").length;

      let quota2T = oldInRole;
      let quota3T = total;
      if (oldInRole === 0 && newInRole === 0) {
        quota2T = total;
        quota3T = total;
      }

      const target = shiftMode === "2T" ? quota2T : quota3T;
      const diff = total - target;
      const fill = target > 0 ? Math.round((active / target) * 100) : (active > 0 ? 100 : 0);

      return {
        id: rName,
        label: rName,
        level,
        quota2T,
        quota3T,
        target,
        total,
        active,
        vacant,
        diff,
        fill
      };
    }).filter(Boolean) as Array<{
      id: string;
      label: string;
      level: 'mgr' | 'eng' | 'staff';
      quota2T: number;
      quota3T: number;
      target: number;
      total: number;
      active: number;
      vacant: number;
      diff: number;
      fill: number;
    }>;

    // Apply level filter
    const filtered = roleTableLevelFilter === "ALL"
      ? rows
      : rows.filter(r => r.level === roleTableLevelFilter);

    // Sort descending by total, then vacant
    return filtered.sort((a, b) => b.total - a.total || b.vacant - a.vacant);
  }, [positions, shiftMode, roleTableLevelFilter]);

  // Overall KPI Metrics
  const kpiMetrics = useMemo(() => {
    const targetQuota = unitBreakdownData.reduce((acc, u) => acc + u.target, 0);
    const totalInSystem = positions.length;
    const vacantCount = positions.filter(p => p.status === "Vacant").length;
    const activeCount = totalInSystem - vacantCount;

    const fillRate = targetQuota > 0 ? ((activeCount / targetQuota) * 100).toFixed(1) : "0.0";
    const vacantRate = totalInSystem > 0 ? ((vacantCount / totalInSystem) * 100).toFixed(1) : "0.0";
    const activeRate = totalInSystem > 0 ? ((activeCount / totalInSystem) * 100).toFixed(1) : "0.0";
    const diff = totalInSystem - targetQuota;

    return {
      targetQuota,
      totalInSystem,
      activeCount,
      vacantCount,
      fillRate,
      vacantRate,
      activeRate,
      diff
    };
  }, [unitBreakdownData, positions]);

  // Filtered Roster
  const filteredRoster = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return positions.filter(p => {
      const matchUnit = unitFilter === "ALL" || p.unit === unitFilter;
      const matchStatus = statusFilter === "ALL" || p.status === statusFilter;
      const matchOcType = ocTypeFilter === "ALL" || p.ocType === ocTypeFilter;
      const pLevel = getRoleLevel(p.role, p.isMgr, p.isEng);
      const matchLevel = levelFilter === "ALL" || pLevel === levelFilter;

      const matchQ = !q ||
        p.name.toLowerCase().includes(q) ||
        p.role.toLowerCase().includes(q) ||
        p.unit.toLowerCase().includes(q) ||
        (p.empId && p.empId.toLowerCase().includes(q)) ||
        p.id.toLowerCase().includes(q);

      return matchUnit && matchStatus && matchOcType && matchLevel && matchQ;
    });
  }, [positions, searchQuery, unitFilter, statusFilter, ocTypeFilter, levelFilter]);

  // Inline sync handlers
  const handleSyncName = (id: string, newName: string) => {
    setPositions(prev => prev.map(p => {
      if (p.id !== id) return p;
      const trimmed = newName.trim();
      if (trimmed.toLowerCase().includes("vacant") || trimmed === "ว่าง" || !trimmed) {
        return { ...p, name: trimmed || "Vacant", status: "Vacant", empId: "", img: null };
      }
      return {
        ...p,
        name: trimmed,
        status: p.status === "Vacant" ? "Active" : p.status,
        img: p.empId ? getEmpPhotoUrl(p.empId) : p.img
      };
    }));
    showToast("บันทึกชื่อพนักงานเรียบร้อย");
  };

  const handleSyncRole = (id: string, newRole: string) => {
    setPositions(prev => prev.map(p => {
      if (p.id !== id) return p;
      const level = getRoleLevel(newRole);
      return {
        ...p,
        role: newRole.trim(),
        isMgr: level === "mgr",
        isEng: level === "eng"
      };
    }));
    showToast("บันทึกตำแหน่งงานเรียบร้อย");
  };

  const handleSyncUnit = (id: string, newUnit: string) => {
    setPositions(prev => prev.map(p => (p.id === id ? { ...p, unit: newUnit.trim() } : p)));
    showToast("บันทึกทุ่น/ฝ่ายเรียบร้อย");
  };

  const handleToggleOcType = (id: string) => {
    setPositions(prev => prev.map(p => {
      if (p.id !== id) return p;
      const nextType = p.ocType === "NEW" ? "OLD" : "NEW";
      return { ...p, ocType: nextType };
    }));
    showToast("สลับกรอบอัตรา (OC Type) เรียบร้อย");
  };

  const handleToggleStatus = (id: string) => {
    setPositions(prev => prev.map(p => {
      if (p.id !== id) return p;
      if (p.status === "Active") {
        return { ...p, status: "Vacant", name: "Vacant", empId: "", img: null };
      }
      return { ...p, status: "Active", name: p.name === "Vacant" ? "พนักงานใหม่" : p.name };
    }));
    showToast("สลับสถานะตำแหน่งเรียบร้อย");
  };

  // Open Edit Modal
  const handleOpenEditModal = (pos: ManpowerPosition) => {
    setEditingPosition(pos);
    setIsAddMode(false);
    setFormId(pos.id);
    setFormEmpId(pos.empId || "");
    setFormName(pos.name);
    setFormRole(pos.role);
    setFormUnit(pos.unit);
    setFormStatus(pos.status);
    setFormOcType(pos.ocType || "OLD");
    setFormLevel(pos.isMgr ? "mgr" : (pos.isEng ? "eng" : "staff"));
    setIsEditModalOpen(true);
  };

  // Open Add Modal
  const handleOpenAddModal = () => {
    const nextNum = positions.length + 1;
    const nextId = `POS-${String(nextNum).padStart(3, '0')}`;
    setEditingPosition(null);
    setIsAddMode(true);
    setFormId(nextId);
    setFormEmpId("");
    setFormName("");
    setFormRole("ช่างขับจักรกลหนัก");
    setFormUnit(availableUnits[0] || "INTER 2");
    setFormStatus("Active");
    setFormOcType("OLD");
    setFormLevel("staff");
    setIsEditModalOpen(true);
  };

  // Save Modal Form
  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    const isVacant = formStatus === "Vacant" || formName.toLowerCase().includes("vacant") || formName === "ว่าง" || !formName.trim();
    const finalName = isVacant ? "Vacant" : formName.trim();
    const finalEmpId = isVacant ? "" : formEmpId.trim();
    const finalImg = isVacant ? null : getEmpPhotoUrl(finalEmpId);

    const record: ManpowerPosition = {
      id: formId,
      empId: finalEmpId,
      name: finalName,
      role: formRole.trim(),
      unit: formUnit.trim(),
      status: isVacant ? "Vacant" : "Active",
      ocType: formOcType,
      isMgr: formLevel === "mgr",
      isEng: formLevel === "eng",
      img: finalImg
    };

    if (isAddMode) {
      setPositions(prev => [...prev, record]);
      showToast("เพิ่มตำแหน่งใหม่เรียบร้อย");
    } else {
      setPositions(prev => prev.map(p => (p.id === formId ? record : p)));
      showToast("บันทึกการแก้ไขเรียบร้อย");
    }

    // 100% Immediate synchronization with Employee Directory & Shift Matrix
    if (onSyncEmployees && employees) {
      let updatedEmployees = [...employees];
      const mappedDept = normalizeUnitToDeptId(formUnit);
      if (!isVacant) {
        const empId = finalEmpId || `EMP-${formId.replace(/\D/g, "") || Date.now().toString().slice(-4)}`;
        const existingIdx = updatedEmployees.findIndex(e => e.id === empId || e.name === finalName);
        if (existingIdx !== -1) {
          updatedEmployees[existingIdx] = {
            ...updatedEmployees[existingIdx],
            name: finalName,
            role: formRole.trim(),
            deptId: mappedDept,
            department: formUnit.trim(),
            employmentStatus: "Active"
          };
        } else {
          const defaultShifts = Array(31).fill("D");
          const newEmp: any = {
            id: empId,
            name: finalName,
            deptId: mappedDept,
            department: formUnit.trim(),
            role: formRole.trim(),
            targetOt: 48,
            actualOt: 0,
            otPct: 0,
            status: "On Track",
            groupName: "Group A",
            shifts: defaultShifts,
            planShifts: defaultShifts,
            salary: 20000,
            division: "ฝ่ายปฏิบัติการท่าเรือ",
            calendarType: "ปฏิทินกะ 4-on-2-off",
            employmentStatus: "Active"
          };
          updatedEmployees.push(newEmp);
        }
      } else if (finalEmpId) {
        const existingIdx = updatedEmployees.findIndex(e => e.id === finalEmpId);
        if (existingIdx !== -1) {
          updatedEmployees[existingIdx] = {
            ...updatedEmployees[existingIdx],
            employmentStatus: "Vacant"
          };
        }
      }
      onSyncEmployees(updatedEmployees);
    }

    setIsEditModalOpen(false);
  };

  // Delete Position
  const handleDeletePosition = (id: string) => {
    const targetPos = positions.find(p => p.id === id);
    if (window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบตำแหน่ง ${id}?`)) {
      setPositions(prev => prev.filter(p => p.id !== id));
      if (onSyncEmployees && employees && targetPos && targetPos.empId) {
        const updated = employees.filter(e => e.id !== targetPos.empId);
        onSyncEmployees(updated);
      }
      setIsEditModalOpen(false);
      showToast("ลบตำแหน่งเรียบร้อย");
    }
  };

  // Clear all data (local & remote Cloudflare D1)
  const handleClearAllData = async () => {
    if (window.confirm("คุณต้องการล้างข้อมูลตำแหน่งงานทั้งหมดในระบบ ใช่หรือไม่?\n(การดำเนินการนี้จะลบข้อมูลทั้งในเครื่องและ Cloudflare D1)")) {
      try {
        setSyncStatus("syncing");
        await fetch("/api/manpower?clearAll=true", { method: "DELETE" });
      } catch (err) {
        console.warn("Failed to clear backend data:", err);
      }
      setPositions([]);
      localStorage.removeItem("port_ops_manpower_masterList");
      setSyncStatus("synced");
      showToast("ล้างข้อมูลตำแหน่งงานทั้งหมดเรียบร้อยแล้ว");
    }
  };

  // Export CSV
  const handleExportCsv = () => {
    const headers = ["No", "Employee ID", "Name", "Role", "Unit", "OC Type", "Status", "Level"];
    const rows = positions.map((p, idx) => [
      idx + 1,
      p.status === "Vacant" ? "" : (p.empId || ""),
      `"${(p.name || "").replace(/"/g, '""')}"`,
      `"${(p.role || "").replace(/"/g, '""')}"`,
      `"${(p.unit || "").replace(/"/g, '""')}"`,
      p.ocType || "OLD",
      p.status,
      p.isMgr ? "Manager" : (p.isEng ? "Engineer" : "Staff")
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const today = new Date().toISOString().slice(0, 10);
    link.setAttribute("href", url);
    link.setAttribute("download", `Port_Manpower_Dashboard_${today}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("ส่งออกข้อมูล CSV (Excel UTF-8) สำเร็จ");
  };

  // Download Template
  const handleDownloadTemplate = () => {
    const headers = ["Employee ID", "Name", "Role", "Unit", "OC Type", "Status", "Level"];
    const samples = [
      ["688172", "คุณสมชาย สายตรวจ", "พนักงานขับเครน", "INTER 2", "OLD", "Active", "Staff"],
      ["", "Vacant", "ช่างขับจักรกลหนัก", "INTER 3", "NEW", "Vacant", "Staff"]
    ];
    const csvContent = "\uFEFF" + [headers.join(","), ...samples.map(r => r.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "Port_Manpower_Template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("ดาวน์โหลดแม่แบบเรียบร้อย");
  };

  // Handle CSV file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (!text) return;

        const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
        if (lines.length <= 1) {
          alert("ไฟล์ไม่มีข้อมูลหรือมีเพียงหัวตาราง");
          return;
        }

        const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, "").toLowerCase());
        const findIndex = (candidates: string[]) => {
          for (const c of candidates) {
            const idx = headers.findIndex(h => h.includes(c));
            if (idx >= 0) return idx;
          }
          return -1;
        };

        const idIdx = findIndex(["employee id", "รหัสพนักงาน", "id", "รหัส"]);
        const nameIdx = findIndex(["name", "ชื่อ", "fullname"]);
        const roleIdx = findIndex(["role", "ตำแหน่ง", "position"]);
        const unitIdx = findIndex(["unit", "ทุ่น", "ฝ่าย", "สังกัด", "department"]);
        const ocTypeIdx = findIndex(["oc type", "octype", "type", "กรอบ"]);
        const statusIdx = findIndex(["status", "สถานะ"]);
        const levelIdx = findIndex(["level", "ระดับ"]);

        let nextIdx = 1;
        const imported: ManpowerPosition[] = [];

        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(",").map(c => c.trim().replace(/^"|"$/g, ""));
          const name = nameIdx >= 0 ? cols[nameIdx] : "";
          const role = roleIdx >= 0 ? cols[roleIdx] : "พนักงานปฏิบัติการ";
          const unitRaw = unitIdx >= 0 ? cols[unitIdx] : "INTER 2";
          const empId = idIdx >= 0 ? cols[idIdx] : "";
          const statusRaw = statusIdx >= 0 ? cols[statusIdx] : "";
          const ocTypeRaw = ocTypeIdx >= 0 ? cols[ocTypeIdx].toUpperCase() : "OLD";
          const levelRaw = levelIdx >= 0 ? cols[levelIdx].toLowerCase() : "";

          if (!name && !role) continue;

          let unit = unitRaw;
          if (/inter\s*2/i.test(unitRaw)) unit = "INTER 2";
          else if (/inter\s*3/i.test(unitRaw)) unit = "INTER 3";
          else if (/inter\s*5/i.test(unitRaw)) unit = "INTER 5";
          else if (/inter\s*7/i.test(unitRaw)) unit = "INTER 7";
          else if (/heavy|จักรกล/i.test(unitRaw)) unit = "Heavy Machine";
          else if (/improve|ปรับปรุง/i.test(unitRaw)) unit = "Improvement";
          else if (/control|ศูนย์/i.test(unitRaw)) unit = "CONTROL";
          else if (/manage|ฝ่ายปฏิบัติการ/i.test(unitRaw)) unit = "Management";

          const isVacant = statusRaw.toLowerCase() === "vacant" || name.toLowerCase().includes("vacant") || name.includes("ว่าง") || !name;
          const status = isVacant ? "Vacant" : "Active";
          const ocType = ocTypeRaw.includes("NEW") || ocTypeRaw.includes("ใหม่") || ocTypeRaw.includes("3") ? "NEW" : "OLD";
          const isMgr = levelRaw.includes("mgr") || levelRaw.includes("manager") || role.includes("ผู้จัดการ");
          const isEng = levelRaw.includes("eng") || role.toLowerCase().includes("engineer") || role.includes("วิศวกร");

          const posId = `POS-${String(nextIdx++).padStart(3, '0')}`;
          const finalEmpId = isVacant ? "" : empId;

          imported.push({
            id: posId,
            empId: finalEmpId,
            name: name || (isVacant ? "Vacant" : "Unassigned"),
            role,
            unit,
            status,
            ocType,
            isMgr,
            isEng,
            img: isVacant ? null : getEmpPhotoUrl(finalEmpId)
          });
        }

        if (imported.length === 0) {
          alert("ไม่พบข้อมูลที่ตรงกับโครงสร้างคอลัมน์");
          return;
        }

        if (window.confirm(`พบข้อมูลพนักงานทั้งหมด ${imported.length} รายการ ต้องการแทนที่ข้อมูลปัจจุบันหรือไม่?`)) {
          setPositions(imported);
          showToast(`นำเข้าข้อมูล ${imported.length} รายการเรียบร้อย`);

          if (onSyncEmployees && employees) {
            let updatedEmployees = [...employees];
            for (const pos of imported) {
              const isV = pos.status === "Vacant" || !pos.name || pos.name.toLowerCase().includes("vacant") || pos.name === "ว่าง";
              if (!isV) {
                const empId = pos.empId || `EMP-${pos.id.replace(/\D/g, "")}`;
                const mappedDept = normalizeUnitToDeptId(pos.unit);
                const exIdx = updatedEmployees.findIndex(e => e.id === empId || e.name === pos.name);
                if (exIdx !== -1) {
                  updatedEmployees[exIdx] = {
                    ...updatedEmployees[exIdx],
                    name: pos.name,
                    role: pos.role,
                    deptId: mappedDept,
                    department: pos.unit,
                    employmentStatus: "Active"
                  };
                } else {
                  const defaultShifts = Array(31).fill("D");
                  updatedEmployees.push({
                    id: empId,
                    name: pos.name,
                    deptId: mappedDept,
                    department: pos.unit,
                    role: pos.role,
                    targetOt: 48,
                    actualOt: 0,
                    otPct: 0,
                    status: "On Track",
                    groupName: "Group A",
                    shifts: defaultShifts,
                    planShifts: defaultShifts,
                    salary: 20000,
                    division: "ฝ่ายปฏิบัติการท่าเรือ",
                    calendarType: "ปฏิทินกะ 4-on-2-off",
                    employmentStatus: "Active"
                  });
                }
              }
            }
            onSyncEmployees(updatedEmployees);
          }
        }
      } catch (err: any) {
        alert(`เกิดข้อผิดพลาดในการอ่านไฟล์: ${err?.message || err}`);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className="w-full max-w-full min-w-0 space-y-6 text-[#333B41]">
      
      {/* ========================================================================= */}
      {/* SECTION 1: HEADER & SHIFT MODE TOGGLE */}
      {/* ========================================================================= */}
      <div className="bg-white border border-[#DCE4EA] rounded-xl p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#E8F3FA] text-[#0E3A66] border border-[#9FCEE8]/50 uppercase tracking-wider">
              Workforce Intelligence
            </span>
            <span className="text-xs text-[#6A7B87]">· Double A Terminal Stevedoring</span>

            {/* Cloudflare D1 Sync Badge */}
            <div className="inline-flex items-center ml-1">
              {syncStatus === "syncing" && (
                <span className="inline-flex items-center gap-1 text-[11px] text-[#2E90CB] bg-[#E8F3FA] border border-[#9FCEE8]/70 px-2.5 py-0.5 rounded-full font-medium shadow-2xs">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>กำลังบันทึกไปยัง Cloudflare D1...</span>
                </span>
              )}
              {syncStatus === "synced" && (
                <span className="inline-flex items-center gap-1 text-[11px] text-[#1F6E43] bg-[#E8F8EE] border border-[#89D4A6]/70 px-2.5 py-0.5 rounded-full font-medium shadow-2xs" title="เชื่อมต่อฐานข้อมูล Cloudflare D1 เรียลไทม์">
                  <CheckCircle2 className="w-3 h-3 text-[#1F6E43]" />
                  <span>Cloudflare D1 ซิงค์แล้ว</span>
                </span>
              )}
              {syncStatus === "offline" && (
                <span className="inline-flex items-center gap-1 text-[11px] text-[#9E6A00] bg-[#FFF8E6] border border-[#F2C96D]/70 px-2.5 py-0.5 rounded-full font-medium shadow-2xs" title="ทำงานแบบ Local Cache ในเบราว์เซอร์">
                  <Database className="w-3 h-3 text-[#9E6A00]" />
                  <span>Local Storage (ออฟไลน์)</span>
                </span>
              )}
            </div>
          </div>
          <h2 className="text-xl font-bold text-[#0E3A66] tracking-tight mt-1.5 flex items-center gap-2">
            <span>โครงสร้างอัตรากำลังและกรอบตำแหน่ง (Manpower & OC Analytics)</span>
          </h2>
          <p className="text-xs text-[#6A7B87] mt-0.5">
            เปรียบเทียบกรอบอัตรากำลัง 2 ทีม (Base OC) กับ 3 ทีม (Full OC) และติดตามตำแหน่งงานว่างแบบเรียลไทม์
          </p>
        </div>

        {/* 3T vs 2T Shift Mode Toggle */}
        <div className="flex items-center gap-2 bg-[#F3F6F8] p-1.5 rounded-lg border border-[#DCE4EA] shrink-0">
          <button
            onClick={() => setShiftMode("3T")}
            className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
              shiftMode === "3T"
                ? "bg-[#0E3A66] text-white shadow-xs"
                : "text-[#6A7B87] hover:text-[#0E3A66] hover:bg-white/60"
            }`}
          >
            3 Teams (Full OC)
          </button>
          <button
            onClick={() => setShiftMode("2T")}
            className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
              shiftMode === "2T"
                ? "bg-[#0E3A66] text-white shadow-xs"
                : "text-[#6A7B87] hover:text-[#0E3A66] hover:bg-white/60"
            }`}
          >
            2 Teams (Base OC)
          </button>
        </div>
      </div>

      {/* Empty State Hero Banner when no positions exist */}
      {positions.length === 0 && (
        <div className="bg-gradient-to-br from-[#F8FAFC] via-white to-[#E8F3FA]/40 border-2 border-dashed border-[#9FCEE8] rounded-2xl p-8 text-center shadow-xs">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[#E8F3FA] border border-[#9FCEE8]/60 flex items-center justify-center text-[#17538F] mb-4 shadow-xs">
            <Database className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-[#0E3A66]">
            ยังไม่มีข้อมูลโครงสร้างอัตรากำลังในระบบ (Database Empty)
          </h3>
          <p className="text-xs text-[#6A7B87] max-w-md mx-auto mt-1.5 leading-relaxed">
            ระบบเชื่อมต่อฐานข้อมูล Cloudflare D1 เรียบร้อยแล้ว (Mock Data ถูกล้างออกแล้ว) คุณสามารถเริ่มต้นใช้งานได้ทันทีโดยการนำเข้าไฟล์ CSV หรือกดเพิ่มตำแหน่งงานแรก
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-5">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-[#17538F] text-white rounded-lg text-xs font-bold hover:bg-[#0E3A66] flex items-center gap-2 transition cursor-pointer shadow-xs"
            >
              <Upload className="w-4 h-4" />
              <span>นำเข้าไฟล์ CSV (Import CSV)</span>
            </button>
            <button
              onClick={handleDownloadTemplate}
              className="px-4 py-2 border border-[#DCE4EA] bg-white text-[#0E3A66] rounded-lg text-xs font-bold hover:bg-[#F3F6F8] flex items-center gap-2 transition cursor-pointer shadow-xs"
            >
              <FileSpreadsheet className="w-4 h-4 text-[#17538F]" />
              <span>ดาวน์โหลดแม่แบบ CSV (Template)</span>
            </button>
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 border border-[#2E90CB] bg-[#E8F3FA] text-[#0E3A66] rounded-lg text-xs font-bold hover:bg-[#D5EAF7] flex items-center gap-2 transition cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4 text-[#17538F]" />
              <span>+ เพิ่มตำแหน่งงานแรก</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: LIVE KPI OVERVIEW CARDS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        
        {/* Card 1: Target Quota (Full OC) */}
        <div className="bg-white border border-[#DCE4EA] rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between pb-1.5">
            <span className="text-xs font-semibold text-[#6A7B87] uppercase tracking-wider">
              {shiftMode === "3T" ? "Full OC Target" : "Base OC Target"}
            </span>
            <span className="w-2 h-2 rounded-full bg-[#2E90CB]"></span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-[#0E3A66]">
              {kpiMetrics.targetQuota}
            </span>
            <span className="text-xs text-[#6A7B87]">อัตรา</span>
          </div>
          <div className="mt-2 text-[11px] text-[#6A7B87]">
            กรอบ {shiftMode === "3T" ? "3 ทีม (OLD + NEW)" : "2 ทีม (OLD Base)"}
          </div>
        </div>

        {/* Card 2: Current Headcount */}
        <div className="bg-white border border-[#DCE4EA] rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between pb-1.5">
            <span className="text-xs font-semibold text-[#6A7B87] uppercase tracking-wider">Current</span>
            <span className="w-2 h-2 rounded-full bg-[#17538F]"></span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-[#0E3A66]">
              {kpiMetrics.totalInSystem}
            </span>
            <span className="text-xs text-[#6A7B87]">คน/ตำแหน่ง</span>
          </div>
          <div className="mt-2 text-[11px] text-[#6A7B87]">
            Diff: <strong className="font-mono text-[#0E3A66]">
              {kpiMetrics.diff > 0 ? `+${kpiMetrics.diff}` : kpiMetrics.diff}
            </strong> {kpiMetrics.diff === 0 ? "(100% Match)" : ""}
          </div>
        </div>

        {/* Card 3: Active Headcount */}
        <div className="bg-white border border-[#DCE4EA] rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between pb-1.5">
            <span className="text-xs font-semibold text-[#6A7B87] uppercase tracking-wider">Active</span>
            <span className="w-2 h-2 rounded-full bg-[#1E9C6E]"></span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-[#1E9C6E]">
              {kpiMetrics.activeCount}
            </span>
            <span className="text-xs text-[#6A7B87]">คน</span>
          </div>
          <div className="mt-2 text-[11px] text-[#6A7B87]">
            Active Rate: <strong className="font-mono text-[#333B41]">{kpiMetrics.activeRate}%</strong>
          </div>
        </div>

        {/* Card 4: Vacant Positions */}
        <div className="bg-white border border-[#DCE4EA] rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between pb-1.5">
            <span className="text-xs font-semibold text-[#6A7B87] uppercase tracking-wider">Vacant</span>
            <span className={`w-2 h-2 rounded-full ${kpiMetrics.vacantCount > 0 ? "bg-[#F43F5E]" : "bg-[#94A3B8]"}`}></span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl sm:text-3xl font-bold font-mono ${kpiMetrics.vacantCount > 0 ? "text-[#F43F5E]" : "text-[#6A7B87]"}`}>
              {kpiMetrics.vacantCount}
            </span>
            <span className="text-xs text-[#6A7B87]">ตำแหน่งว่าง</span>
          </div>
          <div className="mt-2 text-[11px] text-[#6A7B87]">
            Vacant Rate: <strong className="font-mono text-[#333B41]">{kpiMetrics.vacantRate}%</strong>
          </div>
        </div>

        {/* Card 5: Fill Rate */}
        <div className="bg-white border border-[#DCE4EA] rounded-xl p-4 shadow-xs col-span-2 md:col-span-1">
          <div className="flex items-center justify-between pb-1.5">
            <span className="text-xs font-semibold text-[#6A7B87] uppercase tracking-wider">Fill Rate</span>
            <span className="w-2 h-2 rounded-full bg-[#0E3A66]"></span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-[#0E3A66]">
              {kpiMetrics.fillRate}%
            </span>
            <span className="text-xs text-[#6A7B87]">Active / Target</span>
          </div>
          <div className="w-full bg-[#DCE4EA] rounded-full h-1.5 mt-2.5 overflow-hidden">
            <div
              className="bg-[#17538F] h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(parseFloat(kpiMetrics.fillRate), 100)}%` }}
            />
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* SECTION 3: VISUAL CHARTS (Unit Headcount & Role Breakdown) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Unit Headcount Comparison */}
        <div className="bg-white border border-[#DCE4EA] rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#DCE4EA]">
              <div>
                <h3 className="text-xs font-bold text-[#0E3A66] uppercase tracking-wider">
                  Unit Headcount (เปรียบเทียบตามทุ่น/ฝ่าย)
                </h3>
                <p className="text-[11px] text-[#6A7B87]">เรียงลำดับตามขนาดกรอบอัตราและยอดพนักงาน</p>
              </div>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-2 rounded-xs bg-[#CBD5E1]"></span> Target
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-2 rounded-xs bg-[#0E3A66]"></span> Active
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-2 rounded-xs bg-[#F43F5E]"></span> Vacant
                </span>
              </div>
            </div>

            {/* Vertical Bar Chart Rendering */}
            <div className="h-64 flex items-end justify-between gap-3 pt-4 px-2 overflow-x-auto">
              {unitBreakdownData.map(u => {
                const maxVal = Math.max(...unitBreakdownData.map(d => Math.max(d.target, d.active + d.vacant, 1)), 10);
                const targetH = Math.round((u.target / maxVal) * 100);
                const activeH = Math.round((u.active / maxVal) * 100);
                const vacantH = Math.round((u.vacant / maxVal) * 100);

                return (
                  <div
                    key={u.key}
                    onClick={() => setUnitFilter(u.key)}
                    className="flex-1 min-w-[50px] flex flex-col items-center gap-1 cursor-pointer group"
                    title={`${u.title}: Target ${u.target} | Active ${u.active} | Vacant ${u.vacant}`}
                  >
                    <div className="w-full flex items-end justify-center gap-1 h-44">
                      {/* Target Bar */}
                      <div
                        style={{ height: `${Math.max(targetH, 4)}%` }}
                        className="w-1/3 bg-[#CBD5E1] group-hover:bg-[#94A3B8] rounded-t-xs transition-all"
                      />
                      {/* Active Bar */}
                      <div
                        style={{ height: `${Math.max(activeH, 4)}%` }}
                        className="w-1/3 bg-[#0E3A66] group-hover:bg-[#17538F] rounded-t-xs transition-all"
                      />
                      {/* Vacant Bar */}
                      <div
                        style={{ height: `${Math.max(vacantH, 2)}%` }}
                        className={`w-1/3 rounded-t-xs transition-all ${u.vacant > 0 ? "bg-[#F43F5E]" : "bg-transparent"}`}
                      />
                    </div>
                    <span className="text-[11px] font-medium text-[#333B41] truncate max-w-[64px] text-center group-hover:text-[#0E3A66]">
                      {u.title}
                    </span>
                    <span className="text-[10px] font-mono text-[#6A7B87]">
                      {u.active}/{u.target}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Chart 2: Role Breakdown Horizontal Ranking */}
        <div className="bg-white border border-[#DCE4EA] rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#DCE4EA]">
              <div>
                <h3 className="text-xs font-bold text-[#0E3A66] uppercase tracking-wider">
                  Role Breakdown (ความต้องการรายตำแหน่ง)
                </h3>
                <p className="text-[11px] text-[#6A7B87]">แสดงจำนวนตำแหน่งงานที่มีในระบบ</p>
              </div>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-2 rounded-xs bg-[#CBD5E1]"></span> Target
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-2 rounded-xs bg-[#17538F]"></span> Active
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-2 rounded-xs bg-[#F43F5E]"></span> Vacant
                </span>
              </div>
            </div>

            {/* Horizontal Bar Chart Rendering (Top 7 or all) */}
            <div className="h-64 overflow-y-auto space-y-2.5 pr-2">
              {roleBreakdownData.slice(0, 8).map(r => {
                const maxRoleVal = Math.max(...roleBreakdownData.map(d => Math.max(d.target, d.total, 1)), 5);
                const targetW = Math.round((r.target / maxRoleVal) * 100);
                const activeW = Math.round((r.active / maxRoleVal) * 100);
                const vacantW = Math.round((r.vacant / maxRoleVal) * 100);

                return (
                  <div
                    key={r.id}
                    onClick={() => setSearchQuery(r.label)}
                    className="cursor-pointer group hover:bg-[#F3F6F8] p-1.5 rounded-lg transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-medium text-[#0E3A66] truncate group-hover:text-[#17538F]">
                        {r.label}
                      </span>
                      <span className="text-[11px] font-mono text-[#6A7B87]">
                        {r.active} คน / ว่าง {r.vacant} (กรอบ {r.target})
                      </span>
                    </div>
                    <div className="h-2 w-full bg-[#F3F6F8] rounded-full overflow-hidden flex gap-0.5">
                      <div style={{ width: `${targetW}%` }} className="bg-[#CBD5E1] h-full rounded-full" />
                      <div style={{ width: `${activeW}%` }} className="bg-[#17538F] h-full rounded-full" />
                      {r.vacant > 0 && (
                        <div style={{ width: `${vacantW}%` }} className="bg-[#F43F5E] h-full rounded-full" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* SECTION 4: BREAKDOWN TABLES (Unit & Role) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* 1. Unit Breakdown Table */}
        <div className="bg-white border border-[#DCE4EA] rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#DCE4EA]">
            <div>
              <h3 className="text-xs font-bold text-[#0E3A66] uppercase tracking-wider">
                Unit Manpower Breakdown (ตารางสรุปรายทุ่น/ฝ่าย)
              </h3>
              <p className="text-[11px] text-[#6A7B87]">* คลิกแถวเพื่อกรองรายชื่อพนักงานด้านล่าง</p>
            </div>
            <span className="text-xs font-mono font-semibold text-[#0E3A66]">
              โหมด {shiftMode === "3T" ? "3 Teams" : "2 Teams"}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#DCE4EA] text-[#6A7B87] text-[11px]">
                  <th className="py-2 px-2.5 font-semibold">ทุ่น / ฝ่าย</th>
                  <th className="py-2 px-2 text-center font-semibold">Target</th>
                  <th className="py-2 px-2 text-center font-semibold">Current</th>
                  <th className="py-2 px-2 text-center font-semibold">Active</th>
                  <th className="py-2 px-2 text-center font-semibold">Vacant</th>
                  <th className="py-2 px-2 text-center font-semibold">Diff</th>
                  <th className="py-2 px-2 text-center font-semibold">Fill Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F6F8]">
                {unitBreakdownData.map(u => (
                  <tr
                    key={u.key}
                    onClick={() => setUnitFilter(u.key)}
                    className="hover:bg-[#F3F6F8] transition-colors cursor-pointer"
                  >
                    <td className="py-2 px-2.5 font-medium text-[#0E3A66]">{u.title}</td>
                    <td className="py-2 px-2 text-center font-mono font-semibold text-[#6A7B87]">{u.target}</td>
                    <td className="py-2 px-2 text-center font-mono font-bold text-[#0E3A66]">{u.total}</td>
                    <td className="py-2 px-2 text-center font-mono font-bold text-[#1E9C6E]">{u.active}</td>
                    <td className={`py-2 px-2 text-center font-mono font-bold ${u.vacant > 0 ? "text-[#F43F5E]" : "text-[#94A3B8]"}`}>
                      {u.vacant}
                    </td>
                    <td className="py-2 px-2 text-center font-mono font-bold">
                      {u.diff > 0 ? `+${u.diff}` : u.diff}
                    </td>
                    <td className="py-2 px-2 text-center font-mono font-bold text-[#0E3A66]">{u.fill}%</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t-2 border-[#DCE4EA] font-bold">
                <tr>
                  <td className="py-2.5 px-2.5 text-[#0E3A66]">Total</td>
                  <td className="py-2.5 px-2 text-center font-mono text-[#6A7B87]">{kpiMetrics.targetQuota}</td>
                  <td className="py-2.5 px-2 text-center font-mono text-[#0E3A66]">{kpiMetrics.totalInSystem}</td>
                  <td className="py-2.5 px-2 text-center font-mono text-[#1E9C6E]">{kpiMetrics.activeCount}</td>
                  <td className={`py-2.5 px-2 text-center font-mono ${kpiMetrics.vacantCount > 0 ? "text-[#F43F5E]" : "text-[#94A3B8]"}`}>
                    {kpiMetrics.vacantCount}
                  </td>
                  <td className="py-2.5 px-2 text-center font-mono">
                    {kpiMetrics.diff > 0 ? `+${kpiMetrics.diff}` : kpiMetrics.diff}
                  </td>
                  <td className="py-2.5 px-2 text-center font-mono text-[#0E3A66]">{kpiMetrics.fillRate}%</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* 2. Role Breakdown Table */}
        <div className="bg-white border border-[#DCE4EA] rounded-xl p-5 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-[#DCE4EA]">
            <div>
              <h3 className="text-xs font-bold text-[#0E3A66] uppercase tracking-wider">
                Role Manpower Breakdown (แยกรายตำแหน่ง)
              </h3>
              <p className="text-[11px] text-[#6A7B87]">* คลิกตำแหน่งเพื่อค้นหาในตารางรายชื่อ</p>
            </div>
            
            {/* Role Table Level Filter */}
            <select
              value={roleTableLevelFilter}
              onChange={(e) => setRoleTableLevelFilter(e.target.value)}
              className="px-2.5 py-1 text-xs border border-[#DCE4EA] rounded-md text-[#333B41] font-medium bg-[#F3F6F8] focus:outline-none focus:border-[#2E90CB]"
            >
              <option value="ALL">All Levels (ทุกระดับ)</option>
              <option value="mgr">Manager (ผู้จัดการ)</option>
              <option value="eng">Engineer (วิศวกร)</option>
              <option value="staff">Staff (ปฏิบัติการ)</option>
            </select>
          </div>

          <div className="overflow-x-auto max-h-[340px]">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="sticky top-0 bg-white">
                <tr className="border-b border-[#DCE4EA] text-[#6A7B87] text-[11px]">
                  <th className="py-2 px-2 font-semibold">ตำแหน่งงาน</th>
                  <th className="py-2 px-1.5 text-center font-semibold">2T (OLD)</th>
                  <th className="py-2 px-1.5 text-center font-semibold">3T (Full)</th>
                  <th className="py-2 px-1.5 text-center font-semibold">Current</th>
                  <th className="py-2 px-1.5 text-center font-semibold">Active</th>
                  <th className="py-2 px-1.5 text-center font-semibold">Vacant</th>
                  <th className="py-2 px-1.5 text-center font-semibold">Fill</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F6F8]">
                {roleBreakdownData.map(r => (
                  <tr
                    key={r.id}
                    onClick={() => setSearchQuery(r.label)}
                    className="hover:bg-[#F3F6F8] transition-colors cursor-pointer"
                  >
                    <td className="py-2 px-2 font-medium text-[#0E3A66] flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${r.vacant > 0 ? "bg-[#F43F5E]" : "bg-[#CBD5E1]"}`} />
                      <span className="truncate">{r.label}</span>
                    </td>
                    <td className="py-2 px-1.5 text-center font-mono text-[#6A7B87]">{r.quota2T}</td>
                    <td className="py-2 px-1.5 text-center font-mono text-[#6A7B87]">{r.quota3T}</td>
                    <td className="py-2 px-1.5 text-center font-mono font-bold text-[#0E3A66]">{r.total}</td>
                    <td className="py-2 px-1.5 text-center font-mono font-bold text-[#1E9C6E]">{r.active}</td>
                    <td className={`py-2 px-1.5 text-center font-mono font-bold ${r.vacant > 0 ? "text-[#F43F5E]" : "text-[#94A3B8]"}`}>
                      {r.vacant}
                    </td>
                    <td className="py-2 px-1.5 text-center font-mono font-bold text-[#0E3A66]">{r.fill}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* SECTION 5: ACTION TOOLBAR (Upload / Export / Template / Add) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Upload Excel / CSV */}
        <label className="bg-white border-2 border-dashed border-[#DCE4EA] hover:border-[#2E90CB] rounded-xl p-5 flex flex-col items-center justify-center text-center transition cursor-pointer group">
          <input ref={fileInputRef} type="file" accept=".csv, .txt, .xlsx, .xls" onChange={handleFileUpload} className="hidden" />
          <Upload className="w-6 h-6 text-[#6A7B87] group-hover:text-[#2E90CB] transition-colors mb-1.5" />
          <span className="text-xs font-bold text-[#0E3A66]">Upload Headcount (CSV / Excel)</span>
          <span className="text-[11px] text-[#6A7B87] mt-0.5">คลิกเพื่ออัปโหลดไฟล์โครงสร้างอัตรากำลัง</span>
        </label>

        {/* Export & Template */}
        <div className="bg-white border border-[#DCE4EA] rounded-xl p-5 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-[#0E3A66] uppercase block mb-1">Export & Template</span>
            <p className="text-[11px] text-[#6A7B87]">ส่งออกข้อมูลพนักงานและดาวน์โหลดแบบฟอร์ม</p>
          </div>
          <div className="flex items-center gap-2 pt-3">
            <button
              onClick={handleExportCsv}
              className="flex-1 px-3 py-1.5 bg-[#0E3A66] text-white rounded-lg text-xs font-bold hover:bg-[#17538F] flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={handleDownloadTemplate}
              className="px-3 py-1.5 border border-[#DCE4EA] text-[#333B41] rounded-lg text-xs font-medium hover:bg-[#F3F6F8] transition cursor-pointer"
            >
              Template
            </button>
          </div>
        </div>

        {/* Add Person & Clear All */}
        <div className="bg-white border border-[#DCE4EA] rounded-xl p-5 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-[#0E3A66] uppercase block mb-1">Add Position / Clear</span>
            <p className="text-[11px] text-[#6A7B87]">เพิ่มตำแหน่งงานใหม่ หรือล้างข้อมูลทั้งหมดในระบบ</p>
          </div>
          <div className="flex items-center gap-2 pt-3">
            <button
              onClick={handleOpenAddModal}
              className="flex-1 px-3 py-1.5 bg-[#17538F] text-white rounded-lg text-xs font-bold hover:bg-[#0E3A66] flex items-center justify-center gap-1 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Position</span>
            </button>
            <button
              onClick={handleClearAllData}
              className="px-3 py-1.5 border border-[#E9A8A8] text-[#A61C1C] rounded-lg text-xs font-medium hover:bg-[#FDF3F3] transition cursor-pointer flex items-center gap-1"
              title="ล้างข้อมูลทั้งหมดในระบบ (Cloudflare D1 & Local Cache)"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">Clear</span>
            </button>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* SECTION 6: PERSONNEL ROSTER TABLE (Inline Editing & Quick Controls) */}
      {/* ========================================================================= */}
      <div className="bg-white border border-[#DCE4EA] rounded-xl p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-4 border-b border-[#DCE4EA]">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-bold text-[#0E3A66] uppercase tracking-wider">
              Personnel Roster ({filteredRoster.length} รายการ)
            </span>
            <span className="text-[11px] text-[#6A7B87]">
              * แก้ไขชื่อ ตำแหน่ง ทุ่น หรือคลิกสลับ OLD/NEW และ Active/Vacant ได้ทันที
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Level Filter */}
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="px-2.5 py-1.5 border border-[#DCE4EA] rounded-md text-xs text-[#333B41] font-medium bg-[#F3F6F8] focus:outline-none"
            >
              <option value="ALL">All Levels</option>
              <option value="mgr">Manager</option>
              <option value="eng">Engineer</option>
              <option value="staff">Staff</option>
            </select>

            {/* OC Type Filter */}
            <select
              value={ocTypeFilter}
              onChange={(e) => setOcTypeFilter(e.target.value)}
              className="px-2.5 py-1.5 border border-[#DCE4EA] rounded-md text-xs text-[#333B41] font-medium bg-[#F3F6F8] focus:outline-none"
            >
              <option value="ALL">All OC Types</option>
              <option value="OLD">OLD (2T Base)</option>
              <option value="NEW">NEW (+3T Expansion)</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 border border-[#DCE4EA] rounded-md text-xs text-[#333B41] font-medium bg-[#F3F6F8] focus:outline-none"
            >
              <option value="ALL">All Status</option>
              <option value="Active">Active</option>
              <option value="Vacant">Vacant</option>
            </select>

            {/* Unit Filter */}
            <select
              value={unitFilter}
              onChange={(e) => setUnitFilter(e.target.value)}
              className="px-2.5 py-1.5 border border-[#DCE4EA] rounded-md text-xs text-[#333B41] font-medium bg-[#F3F6F8] focus:outline-none"
            >
              <option value="ALL">All Units</option>
              {availableUnits.map(u => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#6A7B87] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหาชื่อ, ตำแหน่ง, รหัส..."
                className="pl-8 pr-3 py-1.5 border border-[#DCE4EA] rounded-md text-xs text-[#333B41] focus:outline-none focus:border-[#2E90CB] w-48 bg-[#F3F6F8]"
              />
            </div>
          </div>
        </div>

        {/* Roster Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs table-fixed">
            <thead>
              <tr className="border-b border-[#DCE4EA] text-[#6A7B87] text-[11px]">
                <th className="py-2 px-1.5 w-[4%] text-center font-semibold">No.</th>
                <th className="py-2 px-1.5 w-[5%] text-center font-semibold">Photo</th>
                <th className="py-2 px-2 w-[11%] font-semibold">Employee ID</th>
                <th className="py-2 px-2 w-[20%] font-semibold">ชื่อ - นามสกุล</th>
                <th className="py-2 px-2 w-[18%] font-semibold">ตำแหน่งงาน (Role)</th>
                <th className="py-2 px-2 w-[12%] font-semibold">ทุ่น / ฝ่าย (Unit)</th>
                <th className="py-2 px-1.5 w-[8%] text-center font-semibold">Level</th>
                <th className="py-2 px-1.5 w-[8%] text-center font-semibold">OC Type</th>
                <th className="py-2 px-1.5 w-[8%] text-center font-semibold">Status</th>
                <th className="py-2 px-1.5 w-[6%] text-center font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F6F8]">
              {filteredRoster.map((p, idx) => {
                const isVacant = p.status === "Vacant";
                const isNew = p.ocType === "NEW";
                const pLevel = getRoleLevel(p.role, p.isMgr, p.isEng);
                const photoUrl = isVacant ? null : (p.img || getEmpPhotoUrl(p.empId));

                return (
                  <tr key={p.id} className="hover:bg-[#F3F6F8] transition-colors">
                    <td className="py-2 px-1.5 text-center font-mono text-[#6A7B87]">{idx + 1}</td>
                    
                    {/* Photo */}
                    <td className="py-2 px-1.5 text-center">
                      <div
                        onClick={() => handleOpenEditModal(p)}
                        className="w-8 h-8 rounded-md border border-[#DCE4EA] overflow-hidden mx-auto bg-[#F3F6F8] flex items-center justify-center cursor-pointer hover:border-[#2E90CB]"
                      >
                        {photoUrl ? (
                          <img
                            src={photoUrl}
                            alt={p.name}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=E8F3FA&color=0E3A66&size=64`;
                            }}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-[9px] text-[#6A7B87] font-medium">--</span>
                        )}
                      </div>
                    </td>

                    {/* Employee ID */}
                    <td className="py-2 px-2 font-mono font-medium text-[#0E3A66]">
                      {isVacant ? <span className="text-[#94A3B8]">--</span> : (p.empId || <span className="text-[#94A3B8] italic text-[11px]">No ID</span>)}
                    </td>

                    {/* Name (Inline Edit) */}
                    <td className="py-2 px-2">
                      <input
                        type="text"
                        defaultValue={p.name}
                        onBlur={(e) => {
                          if (e.target.value !== p.name) handleSyncName(p.id, e.target.value);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                        }}
                        className="w-full px-2 py-1 text-xs border border-transparent hover:border-[#DCE4EA] focus:border-[#2E90CB] focus:bg-white rounded transition bg-transparent text-[#0E3A66] font-medium"
                      />
                    </td>

                    {/* Role (Inline Edit with Datalist) */}
                    <td className="py-2 px-2">
                      <input
                        type="text"
                        list="manpower-role-datalist"
                        defaultValue={p.role}
                        onBlur={(e) => {
                          if (e.target.value !== p.role) handleSyncRole(p.id, e.target.value);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                        }}
                        className="w-full px-1.5 py-1 text-xs border border-transparent hover:border-[#DCE4EA] focus:border-[#2E90CB] focus:bg-white rounded transition bg-transparent text-[#333B41] font-medium truncate"
                      />
                    </td>

                    {/* Unit (Inline Edit with Datalist) */}
                    <td className="py-2 px-2">
                      <input
                        type="text"
                        list="manpower-unit-datalist"
                        defaultValue={p.unit}
                        onBlur={(e) => {
                          if (e.target.value !== p.unit) handleSyncUnit(p.id, e.target.value);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                        }}
                        className="w-full px-1.5 py-1 text-[11px] font-mono font-semibold border border-transparent hover:border-[#DCE4EA] focus:border-[#2E90CB] focus:bg-white rounded transition bg-transparent text-[#0E3A66] truncate"
                      />
                    </td>

                    {/* Level Badge */}
                    <td className="py-2 px-1.5 text-center">
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                        pLevel === "mgr"
                          ? "bg-[#0E3A66] text-white"
                          : pLevel === "eng"
                          ? "bg-[#E8F3FA] text-[#0E3A66] border border-[#9FCEE8]"
                          : "bg-[#F3F6F8] text-[#6A7B87]"
                      }`}>
                        {pLevel === "mgr" ? "Manager" : (pLevel === "eng" ? "Engineer" : "Staff")}
                      </span>
                    </td>

                    {/* OC Type (1-Click Toggle Button) */}
                    <td className="py-2 px-1.5 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleOcType(p.id)}
                        title="คลิกเพื่อสลับระหว่าง OLD (2T) กับ NEW (+3T)"
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold cursor-pointer transition ${
                          isNew
                            ? "bg-[#E8F3FA] text-[#0E3A66] border border-[#9FCEE8] hover:bg-[#9FCEE8]/40"
                            : "bg-[#F3F6F8] text-[#6A7B87] hover:bg-[#DCE4EA]"
                        }`}
                      >
                        {p.ocType || "OLD"}
                      </button>
                    </td>

                    {/* Status (1-Click Toggle Button) */}
                    <td className="py-2 px-1.5 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(p.id)}
                        title="คลิกเพื่อสลับสถานะ Active ↔ Vacant"
                        className={`inline-block px-2.5 py-0.5 rounded text-[10.5px] font-semibold cursor-pointer transition ${
                          isVacant
                            ? "bg-[#F3F6F8] text-[#F43F5E] border border-[#F43F5E]/30 hover:bg-[#F43F5E]/10"
                            : "bg-[#0E3A66] text-white hover:bg-[#17538F]"
                        }`}
                      >
                        {p.status}
                      </button>
                    </td>

                    {/* Action */}
                    <td className="py-2 px-1.5 text-center">
                      <button
                        onClick={() => handleOpenEditModal(p)}
                        className="p-1 hover:bg-[#E8F3FA] text-[#17538F] hover:text-[#0E3A66] rounded transition cursor-pointer"
                        title="แก้ไขรายละเอียด"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Datalists for autocompletion */}
      <datalist id="manpower-role-datalist">
        {standardRoleNames.map(r => (
          <option key={r} value={r} />
        ))}
      </datalist>
      <datalist id="manpower-unit-datalist">
        {availableUnits.map(u => (
          <option key={u} value={u} />
        ))}
      </datalist>

      {/* ========================================================================= */}
      {/* SECTION 7: EDIT / ADD POSITION MODAL */}
      {/* ========================================================================= */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-[#DCE4EA] w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            <div className="px-5 py-4 border-b border-[#DCE4EA] flex items-center justify-between">
              <h3 className="font-bold text-sm text-[#0E3A66]">
                {isAddMode ? "เพิ่มกรอบตำแหน่งงานใหม่" : "แก้ไขข้อมูลตำแหน่ง / พนักงาน"}
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 text-[#6A7B87] hover:text-[#0E3A66] rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="p-5 space-y-4 text-xs">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#6A7B87] font-semibold mb-1">Position ID</label>
                  <input
                    type="text"
                    value={formId}
                    disabled
                    className="w-full px-3 py-1.5 border border-[#DCE4EA] rounded-md bg-[#F3F6F8] font-mono text-[#6A7B87]"
                  />
                </div>

                <div>
                  <label className="block text-[#6A7B87] font-semibold mb-1">Employee ID (รหัสพนักงาน)</label>
                  <input
                    type="text"
                    value={formEmpId}
                    disabled={formStatus === "Vacant"}
                    onChange={(e) => setFormEmpId(e.target.value)}
                    placeholder={formStatus === "Vacant" ? "ตำแหน่งว่าง" : "เช่น 688172"}
                    className="w-full px-3 py-1.5 border border-[#DCE4EA] rounded-md focus:outline-none focus:border-[#2E90CB] font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#6A7B87] font-semibold mb-1">ชื่อ - นามสกุล</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="เช่น คุณสมคิด ขำฉ่ำ หรือ Vacant"
                  required
                  className="w-full px-3 py-1.5 border border-[#DCE4EA] rounded-md focus:outline-none focus:border-[#2E90CB]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#6A7B87] font-semibold mb-1">ตำแหน่งงาน (Role)</label>
                  <input
                    type="text"
                    list="manpower-role-datalist"
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    required
                    className="w-full px-3 py-1.5 border border-[#DCE4EA] rounded-md focus:outline-none focus:border-[#2E90CB]"
                  />
                </div>

                <div>
                  <label className="block text-[#6A7B87] font-semibold mb-1">ทุ่น / ฝ่าย (Unit)</label>
                  <input
                    type="text"
                    list="manpower-unit-datalist"
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    required
                    className="w-full px-3 py-1.5 border border-[#DCE4EA] rounded-md focus:outline-none focus:border-[#2E90CB]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[#6A7B87] font-semibold mb-1">OC Type</label>
                  <select
                    value={formOcType}
                    onChange={(e) => setFormOcType(e.target.value as "OLD" | "NEW")}
                    className="w-full px-2.5 py-1.5 border border-[#DCE4EA] rounded-md font-mono"
                  >
                    <option value="OLD">OLD (2T Base)</option>
                    <option value="NEW">NEW (+3T Expansion)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#6A7B87] font-semibold mb-1">สถานะ</label>
                  <select
                    value={formStatus}
                    onChange={(e) => {
                      const next = e.target.value as "Active" | "Vacant";
                      setFormStatus(next);
                      if (next === "Vacant") {
                        setFormEmpId("");
                        setFormName("Vacant");
                      }
                    }}
                    className="w-full px-2.5 py-1.5 border border-[#DCE4EA] rounded-md"
                  >
                    <option value="Active">Active</option>
                    <option value="Vacant">Vacant</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#6A7B87] font-semibold mb-1">ระดับตำแหน่ง</label>
                  <select
                    value={formLevel}
                    onChange={(e) => setFormLevel(e.target.value as "staff" | "mgr" | "eng")}
                    className="w-full px-2.5 py-1.5 border border-[#DCE4EA] rounded-md"
                  >
                    <option value="staff">Staff (ปฏิบัติการ)</option>
                    <option value="mgr">Manager (ผู้จัดการ)</option>
                    <option value="eng">Engineer (วิศวกร)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[#DCE4EA]">
                {!isAddMode && editingPosition ? (
                  <button
                    type="button"
                    onClick={() => handleDeletePosition(editingPosition.id)}
                    className="px-3 py-1.5 text-[#F43F5E] hover:bg-[#F43F5E]/10 rounded-lg font-medium transition cursor-pointer flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>ลบตำแหน่ง</span>
                  </button>
                ) : <div />}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-3 py-1.5 border border-[#DCE4EA] rounded-lg text-[#6A7B87] hover:bg-[#F3F6F8] transition cursor-pointer"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-[#0E3A66] text-white rounded-lg font-bold hover:bg-[#17538F] transition cursor-pointer"
                  >
                    บันทึกข้อมูล
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0E3A66] text-white px-4 py-2.5 rounded-lg shadow-lg text-xs font-medium flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <Check className="w-4 h-4 text-[#1E9C6E]" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
}
