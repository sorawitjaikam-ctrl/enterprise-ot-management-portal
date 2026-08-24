import React, { useState, useEffect } from "react";
import { 
  Search, 
  AlertTriangle, 
  ShieldAlert, 
  Bell, 
  Globe, 
  ChevronDown,
  LayoutDashboard, 
  Users, 
  Calendar, 
  Settings, 
  ClipboardList, 
  FileText, 
  ShieldCheck,
  LogOut,
  TrendingUp,
  BarChart3,
  Menu,
  X,
  User,
  Download,
  CheckCircle2
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
  onOpenCsvTemplateHub,
  isNavbarCollapsed,
  setIsNavbarCollapsed,
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

  const [collapsedCategories, setCollapsedCategories] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("collapsedCategories");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const toggleCategory = (catName: string) => {
    setCollapsedCategories(prev => {
      const next = prev.includes(catName) ? prev.filter(name => name !== catName) : [...prev, catName];
      localStorage.setItem("collapsedCategories", JSON.stringify(next));
      return next;
    });
  };

  const handleTabSelect = (tabId: string) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
    setIsMobileSearchOpen(false);
  };

  // 11 Functional Views organized into categories
  const categories = [
    {
      name: "ภาพรวม & แผนงาน",
      color: "bg-blue-50/90 text-blue-900 border-blue-200/90",
      activeBadgeColor: "bg-blue-600 text-white",
      items: [
        { id: "dashboard", label: "หน้าแรก Dashboard", icon: LayoutDashboard },
        { id: "shifts", label: "ตารางจัดกะพนักงาน", icon: Calendar },
      ]
    },
    {
      name: "การจัดการบุคลากร",
      color: "bg-emerald-50/90 text-emerald-900 border-emerald-200/90",
      activeBadgeColor: "bg-emerald-600 text-white",
      items: [
        { id: "employees", label: "รายชื่อพนักงาน", icon: Users },
        { id: "job_value", label: "Job Value", icon: TrendingUp },
        ...(isHrOrFullAccess ? [{ id: "hr-editor", label: "จัดการข้อมูลพนักงาน & รายได้", icon: FileText }] : []),
      ]
    },
    {
      name: "วันลา & ประวัติ OT",
      color: "bg-amber-50/90 text-amber-900 border-amber-200/90",
      activeBadgeColor: "bg-amber-600 text-white",
      items: [
        { id: "leave-records", label: "บันทึกวันลา", icon: ClipboardList },
        { id: "ot-records", label: "ประวัติ OT จากกะ", icon: Calendar },
      ]
    },
    {
      name: "รายงาน & วิเคราะห์",
      color: "bg-indigo-50/90 text-indigo-900 border-indigo-200/90",
      activeBadgeColor: "bg-indigo-600 text-white",
      items: [
        { id: "reports", label: "รายงานข้อมูลรายแผนก", icon: BarChart3 },
      ]
    },
    ...(isHrOrFullAccess ? [{
      name: "บริหารจัดการระบบ",
      color: "bg-purple-50/90 text-purple-900 border-purple-200/90",
      activeBadgeColor: "bg-purple-600 text-white",
      items: [
        { id: "admin-permissions", label: "สิทธิ์ผู้ใช้งาน", icon: ShieldCheck },
        { id: "settings", label: "ตั้งค่าระบบ", icon: Settings },
      ]
    }] : [])
  ];

  return (
    <>
      {/* Fixed Main Header Bar */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs font-sans">
        
        {/* Row 1: Top Brand, Search & User Bar */}
        <div className="px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-4 lg:gap-6">
          
          {/* Left: Mobile Hamburger + Brand Logo */}
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            {/* Hamburger Button (Mobile / Tablet) */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="flex items-center justify-center w-11 h-11 min-h-[44px] min-w-[44px] rounded-xl text-slate-700 hover:bg-slate-100 active:bg-slate-200 transition-colors lg:hidden cursor-pointer shrink-0"
              aria-label="เปิดเมนูนำทาง"
              title="เปิดเมนูหลัก"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Brand Logo & Name */}
            <div 
              onClick={() => handleTabSelect("dashboard")}
              className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group select-none shrink-0"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-slate-950 via-blue-950 to-slate-900 text-white flex items-center justify-center font-black text-xs shadow-md border border-slate-800 group-hover:scale-105 transition-transform flex-shrink-0">
                <span className="tracking-tighter font-mono">DA</span>
              </div>
              <div className="hidden xs:block">
                <h1 className="text-xs sm:text-sm font-black tracking-tight text-slate-900 flex items-center gap-1.5 leading-none">
                  <span>Double A Terminal</span>
                </h1>
                <p className="text-[9px] sm:text-[10px] text-blue-600 font-extrabold uppercase tracking-wider mt-0.5">
                  Port & Logistics OT
                </p>
              </div>
            </div>
            
            {/* View Title Separator (Tablet / Desktop) */}
            <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block shrink-0"></div>
            <span className="text-xs font-extrabold text-slate-700 hidden sm:block truncate max-w-[200px] lg:max-w-xs">{title}</span>
          </div>

          {/* Center: Global Search Bar (Desktop / Tablet) */}
          <div className="hidden md:block flex-1 max-w-md lg:max-w-xl relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาพนักงาน รหัสกะ เรือสินค้า..."
              className="w-full pl-10 pr-4 py-2 bg-slate-100/80 border border-slate-200/80 rounded-2xl text-xs font-medium text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all shadow-inner"
            />
          </div>

          {/* Right: Actions, Profile & Logout */}
          <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
            
            {/* Mobile Search Toggle Button (< md) */}
            <button
              type="button"
              onClick={() => setIsMobileSearchOpen(prev => !prev)}
              className="flex md:hidden items-center justify-center w-11 h-11 min-h-[44px] min-w-[44px] rounded-xl text-slate-600 hover:bg-slate-100 active:bg-slate-200 transition-colors cursor-pointer"
              aria-label="ค้นหาข้อมูล"
              title="ค้นหา"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* PWA Offline Badge & Install Button */}
            <PWAOfflineBadge className="hidden lg:inline-flex" />
            <PWAInstallButton variant="navbar" className="hidden sm:inline-flex" />

            {/* CSV Template Hub Button (Quick Action on Desktop) */}
            {onOpenCsvTemplateHub && (
              <button
                type="button"
                onClick={onOpenCsvTemplateHub}
                className="hidden lg:flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80 rounded-2xl text-xs font-bold transition-all shadow-xs cursor-pointer min-h-[40px]"
                title="ดาวน์โหลดแบบฟอร์ม CSV แม่แบบ"
              >
                <Download className="w-3.5 h-3.5 text-blue-600" />
                <span>CSV แม่แบบ</span>
              </button>
            )}

            {/* Language Selector (Tablet / Desktop) */}
            <button 
              type="button" 
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-2xl text-xs font-bold text-slate-700 transition-all shadow-xs cursor-pointer min-h-[40px]"
            >
              <Globe className="w-3.5 h-3.5 text-blue-600" />
              <span>TH</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {/* Notifications Bell & Dropdown */}
            <div className="relative">
              <button 
                type="button" 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="flex items-center justify-center w-11 h-11 min-h-[44px] min-w-[44px] bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80 rounded-2xl transition-all relative shadow-xs cursor-pointer"
                title="การแจ้งเตือนข้อควรระวังและกฎหมายแรงงาน"
              >
                <Bell className="w-4 h-4" />
                {complianceNotifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 px-1.5 py-0.2 bg-rose-500 text-white rounded-full text-[10px] font-black shadow-md border-2 border-white animate-pulse">
                    {complianceNotifications.reduce((acc, curr) => acc + (curr.alerts?.length || 0), 0)}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown Panel */}
              {isNotificationsOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsNotificationsOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200/90 z-50 overflow-hidden font-sans animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-amber-400" />
                        <span className="text-xs font-black">การแจ้งเตือนข้อควรระวัง</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold">
                        {complianceNotifications.length} พนักงาน
                      </span>
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 p-2">
                      {complianceNotifications.length === 0 ? (
                        <div className="p-4 text-center text-xs text-slate-400 space-y-1">
                          <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto" />
                          <p className="font-bold text-slate-600">ไม่มีข้อควรระวัง</p>
                          <p className="text-[11px]">การจัดตารางกะถูกต้องตามกฎหมายแรงงานทั้งหมด</p>
                        </div>
                      ) : (
                        complianceNotifications.map((item, idx) => (
                          <div 
                            key={item.emp?.id || idx}
                            onClick={() => {
                              setIsNotificationsOpen(false);
                              if (onOpenComplianceModal) onOpenComplianceModal(item);
                            }}
                            className="p-2.5 hover:bg-rose-50/60 rounded-xl transition-colors cursor-pointer group space-y-1"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-black text-slate-800 group-hover:text-rose-700">
                                {item.emp?.name}
                              </span>
                              <span className="px-1.5 py-0.2 bg-rose-100 text-rose-800 rounded-md text-[10px] font-black">
                                {item.alerts?.length || 0} ข้อระวัง
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 space-y-0.5">
                              {item.alerts?.slice(0, 2).map((a: any, ai: number) => (
                                <p key={ai} className="truncate text-rose-600 font-medium">
                                  • {a.message || a.desc || "ข้อควรระวัง OT / การพักผ่อน"}
                                </p>
                              ))}
                              {(item.alerts?.length || 0) > 2 && (
                                <p className="text-[10px] text-slate-400 font-bold">
                                  + อีก {item.alerts.length - 2} รายการ (คลิกเพื่อดูทั้งหมด)
                                </p>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Profile Badge Button */}
            <button 
              onClick={onOpenProfile}
              className="flex items-center gap-2.5 p-1 sm:px-3 sm:py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-2xl transition-all text-left shadow-xs cursor-pointer group min-h-[44px]"
              title="ดูโปรไฟล์ของคุณ"
            >
              <div className="w-8 h-8 rounded-full bg-blue-600 border-2 border-white overflow-hidden shadow-sm flex-shrink-0 group-hover:scale-105 transition-transform flex items-center justify-center">
                {currentUser?.avatar ? (
                  <img 
                    alt="Manager Avatar" 
                    className="w-full h-full object-cover"
                    src={currentUser.avatar}
                  />
                ) : (
                  <span className="text-white text-xs font-black">
                    {(currentUser?.name || "U")[0]}
                  </span>
                )}
              </div>
              <div className="text-left hidden md:block pr-1">
                <p className="text-xs font-extrabold text-slate-800 leading-tight group-hover:text-blue-600 transition-colors truncate max-w-[110px]">{currentUser?.name || "ผู้ใช้งาน"}</p>
                <p className="text-[10px] font-bold text-slate-500 leading-none mt-0.5 truncate max-w-[110px]">{currentUser?.role || "-"}</p>
              </div>
            </button>

            {/* Logout Button (Tablet / Desktop) */}
            <button
              onClick={onLogout}
              className="hidden sm:flex items-center justify-center w-11 h-11 min-h-[44px] min-w-[44px] bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/80 rounded-2xl transition-all cursor-pointer shadow-xs hover:scale-105 active:scale-95"
              title="ออกจากระบบ"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Expandable Search Bar Dropdown (< md) */}
        {isMobileSearchOpen && (
          <div className="md:hidden px-4 py-2.5 bg-slate-100/95 border-t border-slate-200 flex items-center gap-2 animate-in slide-in-from-top-2 duration-200">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหาพนักงาน รหัสกะ เรือ..."
                className="w-full pl-9 pr-8 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => setIsMobileSearchOpen(false)}
              className="px-3 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
            >
              ปิด
            </button>
          </div>
        )}

        {/* Row 2: Categorized Navigation Menu Bar (Tablet / Desktop - Hidden on Mobile) */}
        <div className="hidden md:flex bg-slate-100/70 px-4 sm:px-6 lg:px-8 py-2 items-center gap-2.5 lg:gap-3.5 overflow-x-auto no-scrollbar touch-pan-x border-t border-slate-200/80 shadow-inner">
          {categories.map((cat) => {
            const isCollapsed = collapsedCategories.includes(cat.name);
            const hasActiveItem = cat.items.some(item => item.id === activeTab);

            return (
              <div key={cat.name} className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-slate-200/80 shadow-xs flex-shrink-0 transition-all duration-200">
                {/* Clickable Category Badge */}
                <button
                  type="button"
                  onClick={() => toggleCategory(cat.name)}
                  title={isCollapsed ? `คลิกเพื่อขยายหมวดหมู่ ${cat.name}` : `คลิกเพื่อซ่อน/หุบหมวดหมู่ ${cat.name}`}
                  className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider border flex items-center gap-1.5 transition-all cursor-pointer hover:opacity-85 select-none shrink-0 ${cat.color} ${hasActiveItem && isCollapsed ? 'ring-2 ring-blue-500/50 shadow-xs font-extrabold' : ''}`}
                >
                  <span>{cat.name}</span>
                  {hasActiveItem && isCollapsed && (
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse" />
                  )}
                  <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isCollapsed ? '-rotate-90 text-slate-400' : 'rotate-0 text-slate-500'}`} />
                </button>

                {/* Items in Category (Collapsible) */}
                {!isCollapsed && (
                  <div className="flex items-center gap-1 animate-in fade-in zoom-in-95 duration-150">
                    {cat.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleTabSelect(item.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all duration-150 flex-shrink-0 cursor-pointer ${
                            isActive
                              ? "bg-slate-900 text-white shadow-xs scale-[1.01]"
                              : "text-slate-600 hover:text-blue-600 hover:bg-blue-50/80"
                          }`}
                        >
                          <Icon className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-slate-400"}`} />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </header>

      {/* ========================================================================= */}
      {/* Mobile Navigation Drawer / Sheet (< lg / Mobile & Tablet)                */}
      {/* ========================================================================= */}
      {/* Backdrop Overlay */}
      <div 
        className={`fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
        aria-hidden={!isMobileMenuOpen}
      />

      {/* Drawer Sheet Content */}
      <aside 
        className={`fixed top-0 left-0 bottom-0 w-[85vw] max-w-[340px] bg-slate-900 text-slate-100 z-50 flex flex-col shadow-2xl border-r border-slate-800 transition-transform duration-300 ease-out transform ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="เมนูหลักสำหรับอุปกรณ์เคลื่อนที่"
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-700 text-white flex items-center justify-center font-black text-xs shadow-md border border-sky-400/30">
              <span className="tracking-tighter font-mono">DA</span>
            </div>
            <div>
              <h2 className="font-extrabold text-white leading-tight text-sm tracking-tight">Double A Terminal</h2>
              <p className="text-[10px] font-bold text-sky-400 tracking-wider uppercase">Port & Logistics OT</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(false)}
            className="w-11 h-11 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 active:bg-slate-700 transition-colors cursor-pointer"
            aria-label="ปิดเมนู"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* User Profile Card inside Drawer */}
        <div className="p-3 border-b border-slate-800">
          <button
            type="button"
            onClick={() => handleTabSelect("profile")}
            className={`w-full flex items-center gap-3 p-3 rounded-2xl border transition-all text-left cursor-pointer ${
              activeTab === "profile" 
                ? "bg-blue-600/20 border-sky-500/50 text-white" 
                : "bg-slate-800/60 border-slate-700 hover:bg-slate-800 text-slate-200"
            }`}
          >
            <div className="w-10 h-10 rounded-full overflow-hidden shadow-inner border border-slate-700 flex-shrink-0 bg-slate-800 flex items-center justify-center">
              {currentUser?.avatar ? (
                <img alt="Profile" className="w-full h-full object-cover" src={currentUser.avatar} />
              ) : (
                <span className="text-sm font-bold text-sky-400">{(currentUser?.name || "U")[0]}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{currentUser?.name || "ผู้ใช้งาน"}</p>
              <p className="text-[10px] text-sky-400 truncate font-medium">{currentUser?.role || "-"}</p>
            </div>
            <User className="w-4 h-4 text-slate-400 flex-shrink-0" />
          </button>
        </div>

        {/* Scrollable Navigation Views (11 Functional Views) */}
        <nav className="flex-1 overflow-y-auto overscroll-contain p-3 space-y-4 touch-pan-y">
          {categories.map((cat) => (
            <div key={cat.name} className="space-y-1.5">
              {/* Category Label */}
              <div className="px-2 pt-1 flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-slate-400">
                <span>{cat.name}</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">{cat.items.length}</span>
              </div>

              {/* View Items */}
              <div className="space-y-1">
                {cat.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleTabSelect(item.id)}
                      className={`w-full flex items-center gap-3 px-3.5 py-3 min-h-[48px] rounded-xl text-left text-sm font-bold transition-all duration-200 cursor-pointer ${
                        isActive
                          ? "bg-blue-600 text-white shadow-md ring-1 ring-blue-400/40"
                          : "text-slate-300 hover:text-white hover:bg-slate-800/80 active:bg-slate-800"
                      }`}
                    >
                      <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-white" : "text-slate-400"}`} />
                      <span className="flex-1 truncate">{item.label}</span>
                      {isActive && <CheckCircle2 className="w-4 h-4 text-sky-300 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Drawer Footer Actions */}
        <div className="p-3 border-t border-slate-800 space-y-2 bg-slate-950/40">
          <PWAInstallButton variant="sidebar" />

          {onOpenCsvTemplateHub && (
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenCsvTemplateHub();
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 min-h-[44px] rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-blue-400 shrink-0" />
              <span className="truncate">ดาวน์โหลดแม่แบบ CSV</span>
            </button>
          )}

          <button
            type="button"
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 min-h-[44px] rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-rose-400 shrink-0" />
            <span>ออกจากระบบ</span>
          </button>
        </div>
      </aside>
    </>
  );
}
