import React, { useState, useEffect } from "react";
import { 
  Search, 
  AlertTriangle, 
  Bell, 
  LogOut,
  Menu,
  X,
  User,
  CheckCircle2,
  Calendar,
  LayoutDashboard,
  Users,
  TrendingUp,
  ClipboardList,
  BarChart3,
  ShieldCheck,
  FileText,
  Settings
} from "lucide-react";
import { PWAInstallButton, PWAOfflineBadge } from "./PWAComponents";

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
  complianceNotifications = [],
  onOpenComplianceModal
}: NavbarProps) {
  const isHrOrFullAccess = ["HR", "HR Section Manager", "Operation Dir", "Operation Depart", "ผู้ดูแลระบบ", "Admin", "Co-admin", "Co-Admin"].includes(currentUser?.role || "");

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

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
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
    setIsMobileSearchOpen(false);
  };

  // Structured tab list with sequential numbering matching the editorial template
  const tabsList = [
    { id: "dashboard", num: "01", label: "ภาพรวม Dashboard", icon: LayoutDashboard },
    { id: "reports", num: "02", label: "รายงานรายแผนก", icon: BarChart3 },
    { id: "shifts", num: "03", label: "ตารางจัดกะพนักงาน", icon: Calendar },
    { id: "employees", num: "04", label: "รายชื่อพนักงาน", icon: Users },
    { id: "job_value", num: "05", label: "โครงสร้าง Job Value", icon: TrendingUp },
    { id: "leave-records", num: "06", label: "บันทึกวันลา", icon: ClipboardList },
    { id: "ot-records", num: "07", label: "ประวัติ OT จากกะ", icon: Calendar },
    ...(isHrOrFullAccess ? [
      { id: "hr-editor", num: "08", label: "ข้อมูล & รายได้", icon: FileText },
      { id: "admin-permissions", num: "09", label: "สิทธิ์ผู้ใช้งาน", icon: ShieldCheck },
      { id: "settings", num: "10", label: "ตั้งค่าระบบ", icon: Settings },
    ] : [])
  ];

  return (
    <>
      {/* Editorial Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-[#DCE4EA] font-sans">
        
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
                onClick={() => handleTabSelect("dashboard")}
                className="cursor-pointer select-none shrink-0"
              >
                <span className="eyebrow block tracking-wider">DOUBLE A TERMINAL · INTER STEVEDORING</span>
                <h1 className="text-base sm:text-lg font-bold text-[#0E3A66] leading-tight tracking-tight flex items-center gap-2">
                  <span className="text-balance">ระบบวางแผนและจัดการตารางกะพนักงาน</span>
                  <span className="hidden sm:inline-block border border-[#DCE4EA] rounded px-2 py-0.5 font-mono text-[11px] font-normal text-[#6A7B87] bg-[#F3F6F8] tabular-nums">
                    รอบเดือน ส.ค. 2569
                  </span>
                </h1>
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
                  className={`w-8 h-8 rounded border flex items-center justify-center transition-all cursor-pointer relative btn-press focus-ring active:scale-95 ${
                    complianceNotifications.length > 0
                      ? "bg-[#FCF3DE] text-[#D99B14] border-[#F3D98F]"
                      : "bg-[#F3F6F8] text-[#6A7B87] border-[#DCE4EA] hover:bg-[#E8F3FA]"
                  }`}
                  title="การแจ้งเตือนข้อควรระวัง"
                >
                  <Bell className="w-4 h-4" />
                  {complianceNotifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#B3352C] text-white text-[9px] font-bold rounded-full flex items-center justify-center tabular-nums">
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
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded border border-[#DCE4EA] shadow-md z-50 overflow-hidden font-sans">
                      <div className="p-3 bg-[#0E3A66] text-white flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-[#F3D98F]" />
                          <span className="text-xs font-bold">การแจ้งเตือนข้อควรระวัง ({complianceNotifications.length})</span>
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
                              key={item.emp?.id || idx}
                              onClick={() => {
                                setIsNotificationsOpen(false);
                                if (onOpenComplianceModal) onOpenComplianceModal(item);
                              }}
                              className="p-2.5 hover:bg-[#E8F3FA] rounded transition-colors cursor-pointer group"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-[#0E3A66]">
                                  {item.emp?.name}
                                </span>
                                <span className="tag t-r">
                                  {item.alerts?.length || 0} ข้อระวัง
                                </span>
                              </div>
                              <div className="text-[11px] text-[#59656D] mt-1 space-y-0.5">
                                {item.alerts?.slice(0, 2).map((a: any, ai: number) => (
                                  <p key={ai} className="truncate text-[#B3352C]">
                                    • {a.message || a.desc || "ข้อควรระวัง OT / การพักผ่อน"}
                                  </p>
                                ))}
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
                className="flex items-center gap-2 px-2 py-1 bg-[#F3F6F8] hover:bg-[#E8F3FA] active:scale-95 border border-[#DCE4EA] rounded transition-all text-left cursor-pointer btn-press focus-ring"
                title="ดูโปรไฟล์ของคุณ"
              >
                <div className="w-6 h-6 rounded-full bg-[#0E3A66] text-white flex items-center justify-center text-[10px] font-bold">
                  {(currentUser?.name || "U")[0]}
                </div>
                <div className="text-left hidden lg:block pr-1">
                  <p className="text-xs font-bold text-[#0E3A66] leading-tight truncate max-w-[100px]">{currentUser?.name || "ผู้ใช้งาน"}</p>
                </div>
              </button>

              {/* Logout button */}
              <button
                onClick={onLogout}
                className="flex items-center justify-center w-8 h-8 bg-[#F3F6F8] hover:bg-[#FBEAEA] active:scale-95 text-[#6A7B87] hover:text-[#B3352C] border border-[#DCE4EA] rounded transition-all cursor-pointer btn-press focus-ring"
                title="ออกจากระบบ"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>

        {/* Row 2: Folder-Style Tab Navigation (Desktop / Tablet) */}
        <div className="hidden md:block w-full px-4 sm:px-6 lg:px-8 overflow-x-auto no-scrollbar touch-pan-x">
          <nav className="folder-tabs" role="tablist">
            {tabsList.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={isActive}
                  className={`btn-press focus-ring ${isActive ? "active" : ""}`}
                  onClick={() => handleTabSelect(tab.id)}
                >
                  <span className="num">{tab.num}</span>
                  <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                    <Icon className="w-3.5 h-3.5 opacity-80" />
                    <span>{tab.label}</span>
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
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabSelect(tab.id)}
                className={`w-full flex items-center justify-between p-2.5 rounded text-xs font-semibold transition-all btn-press focus-ring ${
                  isActive
                    ? "bg-[#E8F3FA] text-[#0E3A66] border-l-3 border-[#0E3A66]"
                    : "text-[#59656D] hover:bg-[#F3F6F8] hover:text-[#0E3A66] active:scale-[0.99]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 text-[#6A7B87]" />
                  <span>{tab.label}</span>
                </div>
                <span className="font-mono text-[10px] text-[#6A7B87] tabular-nums">{tab.num}</span>
              </button>
            );
          })}
        </div>
      </aside>
    </>
  );
}
