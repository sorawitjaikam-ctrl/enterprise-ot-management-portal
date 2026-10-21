import React, { useState, useEffect } from "react";
import { 
  Search, 
  AlertTriangle, 
  Bell, 
  LogOut,
  Menu,
  X,
  CheckCircle2,
  Calendar,
  LayoutDashboard,
  Users,
  TrendingUp,
  ClipboardList,
  BarChart3,
  ShieldCheck,
  Settings,
  Building2
} from "lucide-react";
import { PWAInstallButton, PWAOfflineBadge } from "./PWAComponents";

export type TabAccessMode = "open" | "coming_soon" | "hidden";

export const isStrictHrOrAdmin = (role?: string): boolean => {
  const normalized = (role || "").trim();
  return [
    "HR",
    "HR Section Manager",
    "ผู้ดูแลระบบ",
    "Admin",
    "admin",
    "Co-admin",
    "Co-Admin",
    "co_admin",
    "ผู้ช่วยดูแลระบบ"
  ].includes(normalized);
};

export const DEFAULT_ENABLED_TABS: Record<string, boolean> = {
  dashboard: false,
  reports: false,
  shifts: false,
  job_value: true,
  employees: false,
  manpower: false,
  "leave-records": false,
  "ot-records": false,
};

export const DEFAULT_GLOBAL_TAB_MODES: Record<string, TabAccessMode> = {
  dashboard: "coming_soon",
  reports: "coming_soon",
  shifts: "coming_soon",
  job_value: "open",
  employees: "coming_soon",
  manpower: "coming_soon",
  "leave-records": "coming_soon",
  "ot-records": "coming_soon",
};

export const OPERATIONAL_TABS_META = [
  { id: "dashboard", num: "01", label: "ภาพรวม Dashboard" },
  { id: "reports", num: "02", label: "รายงานรายแผนก" },
  { id: "shifts", num: "03", label: "ตารางจัดกะพนักงาน" },
  { id: "job_value", num: "04", label: "โครงสร้าง Job Value" },
  { id: "employees", num: "05", label: "รายชื่อพนักงาน" },
  { id: "manpower", num: "06", label: "โครงสร้างอัตรากำลัง" },
  { id: "leave-records", num: "07", label: "บันทึกวันลา" },
  { id: "ot-records", num: "08", label: "ประวัติ OT จากกะ" },
] as const;

export const getStoredEnabledTabs = (): Record<string, boolean> => {
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("enabledTabsConfig");
      if (raw) {
        return { ...DEFAULT_ENABLED_TABS, ...JSON.parse(raw) };
      }
    } catch {
      // ignore
    }
  }
  return { ...DEFAULT_ENABLED_TABS };
};

export const getStoredGlobalTabModes = (): Record<string, TabAccessMode> => {
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("globalTabModesConfig");
      if (raw) {
        return { ...DEFAULT_GLOBAL_TAB_MODES, ...JSON.parse(raw) };
      }
    } catch {
      // ignore
    }
  }
  return { ...DEFAULT_GLOBAL_TAB_MODES };
};

export const getStoredUserTabOverrides = (): Record<string, Record<string, TabAccessMode>> => {
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("userTabOverridesConfig");
      if (raw) {
        return JSON.parse(raw) || {};
      }
    } catch {
      // ignore
    }
  }
  return {};
};

export const resolveTabAccessMode = (
  tabId: string,
  currentUser: any,
  restrictToJvOnly?: boolean,
  enabledTabs?: Record<string, boolean>,
  globalTabModes?: Record<string, TabAccessMode>,
  userTabOverrides?: Record<string, Record<string, TabAccessMode>>
): TabAccessMode => {
  if (tabId === "admin-permissions" || tabId === "settings" || tabId === "hr-editor") {
    return isStrictHrOrAdmin(currentUser?.role) ? "open" : "hidden";
  }

  // 1. Check explicit per-user override first (by username or name)
  const usernameKey = (currentUser?.username || "").trim();
  const nameKey = (currentUser?.name || "").trim();
  const overridesMap = userTabOverrides ?? getStoredUserTabOverrides();
  const userSpecific =
    (usernameKey && overridesMap[usernameKey]?.[tabId]) ||
    (nameKey && overridesMap[nameKey]?.[tabId]);

  if (userSpecific === "open" || userSpecific === "coming_soon" || userSpecific === "hidden") {
    return userSpecific;
  }

  // 2. HR and Admin roles see all tabs as open unless overridden per-user
  const isHrOrAdmin = isStrictHrOrAdmin(currentUser?.role);
  const effectiveRestrict =
    restrictToJvOnly ??
    (typeof window !== "undefined" ? localStorage.getItem("restrictToJvOnly") !== "false" : true);

  if (isHrOrAdmin || !effectiveRestrict) {
    return "open";
  }

  // 3. Check explicit globalTabModes or enabledTabs
  if (globalTabModes && globalTabModes[tabId]) {
    return globalTabModes[tabId];
  }
  if (enabledTabs && typeof enabledTabs[tabId] === "boolean") {
    return enabledTabs[tabId] ? "open" : "coming_soon";
  }

  const storedModes = getStoredGlobalTabModes();
  if (storedModes[tabId]) {
    return storedModes[tabId];
  }

  const storedEnabled = getStoredEnabledTabs();
  return storedEnabled[tabId] ? "open" : "coming_soon";
};

export interface NavbarProps {
  title: string;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  currentUser: any;
  onOpenProfile: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  onOpenCsvTemplateHub?: () => void;
  isNavbarCollapsed?: boolean;
  setIsNavbarCollapsed?: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
  complianceNotifications?: Array<{ emp: any; alerts: any[] }>;
  onOpenComplianceModal?: (item: { emp: any; alerts: any[] }) => void;
  restrictToJvOnly?: boolean;
  enabledTabs?: Record<string, boolean>;
  globalTabModes?: Record<string, TabAccessMode>;
  userTabOverrides?: Record<string, Record<string, TabAccessMode>>;
}

export default function Navbar({ 
  title, 
  searchQuery, 
  setSearchQuery, 
  currentUser,
  onOpenProfile,
  activeTab,
  setActiveTab,
  onLogout,
  isNavbarCollapsed,
  setIsNavbarCollapsed,
  complianceNotifications = [],
  onOpenComplianceModal,
  restrictToJvOnly,
  enabledTabs,
  globalTabModes,
  userTabOverrides
}: NavbarProps) {
  const isHrOrAdmin = isStrictHrOrAdmin(currentUser?.role);
  const isHrOrFullAccess = isHrOrAdmin || ["Operation Dir", "Operation Depart"].includes((currentUser?.role || "").trim());
  const effectiveRestrictToJvOnly = restrictToJvOnly ?? (typeof window !== "undefined" ? localStorage.getItem("restrictToJvOnly") !== "false" : true);
  const isJvOnlyLocked = !isHrOrAdmin && effectiveRestrictToJvOnly;

  const getTabMode = (tabId: string): TabAccessMode =>
    resolveTabAccessMode(tabId, currentUser, restrictToJvOnly, enabledTabs, globalTabModes, userTabOverrides);

  const getFirstAllowedTab = (): string => {
    for (const t of OPERATIONAL_TABS_META) {
      if (getTabMode(t.id) === "open") return t.id;
    }
    return "job_value";
  };

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const [hoveredTabId, setHoveredTabId] = useState<string | null>(null);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  // Handle ESC key to dismiss drawer or mobile search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMobileMenuOpen(false);
        setIsMobileSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleTabSelect = (tabId: string) => {
    if (getTabMode(tabId) !== "open") {
      setActiveTab(getFirstAllowedTab());
      setIsMobileMenuOpen(false);
      setIsMobileSearchOpen(false);
      return;
    }
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
    setIsMobileSearchOpen(false);
  };

  // Structured tab list with sequential numbering matching the editorial template
  const rawTabsList = [
    { id: "dashboard", num: "01", label: "ภาพรวม Dashboard", icon: LayoutDashboard },
    { id: "reports", num: "02", label: "รายงานรายแผนก", icon: BarChart3 },
    { id: "shifts", num: "03", label: "ตารางจัดกะพนักงาน", icon: Calendar },
    { id: "job_value", num: "04", label: "โครงสร้าง Job Value", icon: TrendingUp },
    { id: "employees", num: "05", label: "รายชื่อพนักงาน", icon: Users },
    { id: "manpower", num: "06", label: "โครงสร้างอัตรากำลัง", icon: Building2 },
    { id: "leave-records", num: "07", label: "บันทึกวันลา", icon: ClipboardList },
    { id: "ot-records", num: "08", label: "ประวัติ OT จากกะ", icon: Calendar },
    ...(isHrOrAdmin || (!isJvOnlyLocked && isHrOrFullAccess) ? [
      { id: "admin-permissions", num: "09", label: "สิทธิ์ผู้ใช้งาน", icon: ShieldCheck },
      { id: "settings", num: "10", label: "ตั้งค่าระบบ", icon: Settings },
    ] : [])
  ];

  // Filter out any tab whose mode is "hidden" (ซ่อนหัวข้อนี้ไปเลย)
  const tabsList = rawTabsList.filter((tab) => getTabMode(tab.id) !== "hidden");

  return (
    <>
      {/* Editorial Fixed Header */}
      <header 
        className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-[#DCE4EA] font-sans transition-all duration-300 shadow-2xs"
      >
        
        {/* Top Header Bar */}
        <div className="w-full px-4 sm:px-6 lg:px-8 pt-3 sm:pt-4 pb-2">
          <div className="flex items-center justify-between gap-4">
            
            {/* Left: Brand Identity & Eyebrow */}
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(true)}
                className="flex items-center justify-center w-9 h-9 rounded text-[#0E3A66] hover:bg-[#F3F6F8] active:scale-95 btn-press focus-ring lg:hidden cursor-pointer shrink-0 border border-[#DCE4EA] transition-all"
                aria-label="เปิดเมนูนำทาง"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div 
                onClick={() => handleTabSelect(getTabMode("dashboard") === "open" ? "dashboard" : getFirstAllowedTab())}
                className="cursor-pointer select-none shrink-0 flex items-center gap-2.5"
              >
                <div className="w-9 h-9 rounded-xl bg-[#1e2578] flex items-center justify-center p-1.5 border border-[#DCE4EA] shrink-0 shadow-2xs">
                  <img src="/marine-favicon.png" alt="MARINE link" className="w-full h-full object-contain" />
                </div>
                <div>
                  <span className="eyebrow block tracking-wider">DOUBLE A TERMINAL · MARINE LINK</span>
                  <h1 className="text-base sm:text-lg font-bold text-[#0E3A66] leading-tight tracking-tight flex items-center gap-2">
                    <span className="text-balance">ระบบวางแผนและจัดการตารางกะพนักงาน</span>
                    <span className="hidden sm:inline-block border border-[#DCE4EA] rounded px-2 py-0.5 font-mono text-[11px] font-normal text-[#6A7B87] bg-[#F3F6F8] tabular-nums">
                      รอบเดือน ส.ค. 2569
                    </span>
                  </h1>
                </div>
              </div>
            </div>

            {/* Center: Search input */}
            <div className="hidden md:block flex-1 max-w-sm lg:max-w-md relative">
              <Search className="w-3.5 h-3.5 text-[#6A7B87] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหาพนักงาน รหัสกะ เรือสินค้า..."
                className="w-full pl-8 pr-3 py-1.5 bg-[#F3F6F8] border border-[#DCE4EA] rounded text-xs text-[#333B41] placeholder-[#6A7B87] focus:outline-none focus:border-[#2E90CB] focus:bg-white focus-ring transition-all"
              />
            </div>

            {/* Right: Actions, Notifications, Profile & Logout */}
            <div className="flex items-center gap-2 shrink-0">
              
              <PWAOfflineBadge />
              <PWAInstallButton />


              {/* Notification Bell */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all cursor-pointer relative btn-press focus-ring active:scale-95 ${
                    complianceNotifications.length > 0
                      ? "bg-[#FCF3DE] text-[#D99B14] border-[#F3D98F] shadow-xs"
                      : "bg-[#F3F6F8] text-[#6A7B87] border-[#DCE4EA] hover:bg-[#E8F3FA] hover:text-[#0E3A66]"
                  }`}
                  title="การแจ้งเตือนข้อควรระวัง"
                >
                  <Bell className="w-4 h-4" />
                  {complianceNotifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#B3352C] text-white text-[9px] font-bold rounded-full flex items-center justify-center tabular-nums shadow-xs">
                      {complianceNotifications.length}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {isNotificationsOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setIsNotificationsOpen(false)} 
                    />
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl border border-[#DCE4EA] shadow-md z-50 overflow-hidden font-sans">
                      <div className="p-3.5 bg-[#0E3A66] text-white flex items-center justify-between border-b border-[#17538F]">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-[#F3D98F]" />
                          <span className="text-xs font-bold tracking-wide">การแจ้งเตือนข้อควรระวัง ({complianceNotifications.length})</span>
                        </div>
                      </div>

                      <div className="max-h-80 overflow-y-auto divide-y divide-[#DCE4EA] p-2">
                        {complianceNotifications.length === 0 ? (
                          <div className="p-4 text-center text-xs text-[#6A7B87] space-y-1">
                            <CheckCircle2 className="w-5 h-5 text-[#1E9C6E] mx-auto" />
                            <p className="font-bold text-[#333B41]">ไม่มีข้อควรระวัง</p>
                            <p className="text-[11px]">การจัดตารางกะถูกต้องตามเกณฑ์มาตรฐาน</p>
                          </div>
                        ) : (
                          complianceNotifications.map((item, idx) => (
                            <div 
                              key={idx}
                              onClick={() => {
                                setIsNotificationsOpen(false);
                                onOpenComplianceModal?.(item);
                              }}
                              className="p-3 hover:bg-[#F3F6F8] transition-colors cursor-pointer flex items-start gap-2.5 group"
                            >
                              <div className="p-1.5 rounded-lg bg-[#FCF3DE] text-[#D99B14] shrink-0 mt-0.5">
                                <AlertTriangle className="w-4 h-4" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold text-[#0E3A66] group-hover:text-[#17538F]">
                                  {item.emp?.name}
                                </p>
                                <p className="text-[11px] text-[#6A7B87]">
                                  {item.emp?.deptId} · {item.alerts?.[0]?.message || "มีข้อควรระวังในการจัดกะ"}
                                </p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Profile button */}
              <button 
                onClick={onOpenProfile}
                className="flex items-center gap-2 px-2.5 py-1 bg-[#F3F6F8] hover:bg-[#E8F3FA] active:scale-95 border border-[#DCE4EA] hover:border-[#9FCEE8] rounded-lg transition-all text-left cursor-pointer btn-press focus-ring"
                title="ดูโปรไฟล์ของคุณ"
              >
                <div className="w-6 h-6 rounded-full bg-[#0E3A66] text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                  {(currentUser?.name || "U")[0]}
                </div>
                <div className="text-left hidden lg:block pr-1">
                  <p className="text-xs font-bold text-[#0E3A66] leading-tight truncate max-w-[100px]">{currentUser?.name || "ผู้ใช้งาน"}</p>
                </div>
              </button>

              {/* Logout button */}
              <button
                onClick={onLogout}
                className="flex items-center justify-center w-8 h-8 bg-[#F3F6F8] hover:bg-[#FBEAEA] active:scale-95 text-[#6A7B87] hover:text-[#B3352C] border border-[#DCE4EA] hover:border-[#F4B8B4] rounded-lg transition-all cursor-pointer btn-press focus-ring"
                title="ออกจากระบบ"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>

        {/* Row 2: Folder-Style Tab Navigation (Desktop / Tablet) */}
        <div 
          className="hidden md:block w-full px-4 sm:px-6 lg:px-8 overflow-x-auto no-scrollbar touch-pan-x"
        >
          <nav className="folder-tabs" role="tablist">
            {tabsList.map((tab) => {
              const Icon = tab.icon;
              const tabMode = getTabMode(tab.id);
              const isTabLocked = tabMode === "coming_soon";
              const isActive = activeTab === tab.id;
              const isHovered = hoveredTabId === tab.id;
              // Active tab always has full title. Inactive tabs show icon/logo only, and expand on hover (or when locked to show Coming Soon)
              const isExpanded = isActive || isHovered || isTabLocked;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={isActive}
                  aria-disabled={isTabLocked}
                  title={isTabLocked ? `${tab.num} · ${tab.label} (Coming Soon)` : `${tab.num} · ${tab.label}`}
                  onMouseEnter={() => setHoveredTabId(tab.id)}
                  onMouseLeave={() => setHoveredTabId(null)}
                  style={{ flex: "0 0 auto" }}
                  className={`btn-press focus-ring transition-all duration-200 ${
                    isTabLocked
                      ? "opacity-45 cursor-not-allowed select-none px-2.5 bg-[#F8FAFC] text-[#64748B]"
                      : isActive
                      ? "active px-3.5"
                      : isHovered
                      ? "px-3"
                      : "px-2.5"
                  }`}
                  onClick={() => handleTabSelect(tab.id)}
                >
                  <span className="num">{tab.num}</span>
                  <Icon className="w-3.5 h-3.5 opacity-85 shrink-0" />
                  <span 
                    className={`transition-all duration-200 ease-out whitespace-nowrap overflow-hidden inline-flex items-center gap-1.5 ${
                      isExpanded 
                        ? "max-w-[240px] opacity-100 ml-1" 
                        : "max-w-0 opacity-0 w-0 m-0 pointer-events-none"
                    }`}
                  >
                    <span>{tab.label}</span>
                    {isTabLocked && (
                      <span className="px-1.5 py-0.5 rounded bg-[#E2E8F0] text-[#475569] font-mono text-[9px] font-bold uppercase tracking-wider shrink-0">
                        Coming Soon
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

      </header>

      {/* ========================================================================= */}
      {/* Mobile Navigation Drawer / Sheet                                         */}
      {/* ========================================================================= */}
      <div 
        className={`fixed inset-0 bg-[#0E3A66]/40 backdrop-blur-xs z-50 transition-opacity duration-200 ${
          isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
        aria-hidden={!isMobileMenuOpen}
      />

      <aside 
        className={`fixed top-0 left-0 bottom-0 w-[80vw] max-w-[300px] bg-white text-[#333B41] z-50 flex flex-col shadow-lg border-r border-[#DCE4EA] transition-transform duration-200 ease-out transform ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="เมนูหลักสำหรับอุปกรณ์เคลื่อนที่"
      >
        <div className="p-4 border-b border-[#DCE4EA] flex items-center justify-between">
          <div>
            <span className="eyebrow block">DOUBLE A TERMINAL</span>
            <h2 className="font-bold text-[#0E3A66] text-sm">เมนูนำทางระบบ</h2>
          </div>
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-1 rounded text-[#6A7B87] hover:text-[#0E3A66] hover:bg-[#F3F6F8]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {tabsList.map((tab) => {
            const Icon = tab.icon;
            const tabMode = getTabMode(tab.id);
            const isTabLocked = tabMode === "coming_soon";
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                aria-disabled={isTabLocked}
                onClick={() => handleTabSelect(tab.id)}
                className={`w-full flex items-center justify-between p-2.5 rounded text-xs font-semibold transition-all btn-press focus-ring ${
                  isTabLocked
                    ? "opacity-45 cursor-not-allowed select-none text-[#64748B] bg-[#F8FAFC]"
                    : isActive
                    ? "bg-[#E8F3FA] text-[#0E3A66] border-l-3 border-[#0E3A66]"
                    : "text-[#59656D] hover:bg-[#F3F6F8] hover:text-[#0E3A66] active:scale-[0.99]"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className="w-4 h-4 text-[#6A7B87] shrink-0" />
                  <span className="truncate">{tab.label}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {isTabLocked && (
                    <span className="px-1.5 py-0.5 rounded bg-[#E2E8F0] text-[#475569] font-mono text-[9px] font-bold uppercase tracking-wider">
                      Coming Soon
                    </span>
                  )}
                  <span className="font-mono text-[10px] text-[#6A7B87] tabular-nums">{tab.num}</span>
                </div>
              </button>
            );
          })}
        </div>
      </aside>
    </>
  );
}
