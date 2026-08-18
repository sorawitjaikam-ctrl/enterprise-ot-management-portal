import React from "react";
import { 
  Search, 
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
  TrendingUp
} from "lucide-react";

interface NavbarProps {
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
  isNavbarCollapsed = false,
  setIsNavbarCollapsed
}: NavbarProps) {
  const isHrOrFullAccess = ["HR", "HR Section Manager", "Operation Dir", "Operation Depart", "ผู้ดูแลระบบ", "Admin", "Co-admin", "Co-Admin"].includes(currentUser?.role || "");

  const [collapsedCategories, setCollapsedCategories] = React.useState<string[]>(() => {
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

  const categories = [
    {
      name: "ภาพรวม & แผนงาน",
      color: "bg-blue-500/10 text-blue-700 border-blue-200/80",
      items: [
        { id: "dashboard", label: "หน้าแรก Dashboard", icon: LayoutDashboard },
        { id: "shifts", label: "ตารางจัดกะพนักงาน", icon: Calendar },
      ]
    },
    {
      name: "การจัดการบุคลากร",
      color: "bg-emerald-500/10 text-emerald-700 border-emerald-200/80",
      items: [
        { id: "employees", label: "รายชื่อพนักงาน", icon: Users },
        { id: "job_value", label: "Job Value", icon: TrendingUp },
        ...(isHrOrFullAccess ? [
          { id: "hr-editor", label: "จัดการข้อมูลพนักงาน & รายได้", icon: FileText }
        ] : [])
      ]
    },
    ...(isHrOrFullAccess ? [
      {
        name: "วันลา & ประวัติ OT",
        color: "bg-amber-500/10 text-amber-700 border-amber-200/80",
        items: [
          { id: "leave-records", label: "บันทึกวันลา", icon: FileText },
          { id: "ot-records", label: "ประวัติ OT", icon: ClipboardList }
        ]
      },
      {
        name: "บริหารจัดการระบบ",
        color: "bg-purple-500/10 text-purple-700 border-purple-200/80",
        items: [
          { id: "admin-permissions", label: "จัดการสิทธิ์ Admin", icon: ShieldCheck },
          { id: "settings", label: "การตั้งค่าระบบ", icon: Settings }
        ]
      }
    ] : [])
  ];

  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-slate-200 z-30 shadow-sm">
      {/* Top Main Header Row */}
      <div className="h-16 flex justify-between items-center px-8 border-b border-slate-100 gap-6">
        {/* Double A Brand Logo & Title */}
        <div className="flex items-center gap-5 flex-shrink-0">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveTab("dashboard")}>
            <div className="bg-slate-900 rounded-xl p-1.5 shadow-md flex items-center justify-center w-10 h-10 border border-slate-800 group-hover:scale-105 transition-transform">
              <img src="https://doubleapaper.com/DA-logo.png" alt="Double A" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="font-extrabold text-slate-900 leading-tight text-xs tracking-tight">Double A Terminal</h1>
              <p className="text-[9px] font-bold text-blue-600 tracking-wider uppercase">Port & Logistics OT</p>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-200 hidden md:block"></div>

          <h2 className="font-extrabold text-slate-800 text-sm whitespace-nowrap hidden lg:block">{title}</h2>
        </div>

        {/* Search Bar - Center / Expanded */}
        <div className="flex-1 max-w-md hidden md:block mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs font-semibold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all shadow-inner"
              placeholder="ค้นหาพนักงาน รหัสกะ เรือสินค้า..."
            />
          </div>
        </div>

        {/* Right Actions & Controls */}
        <div className="flex items-center gap-4 sm:gap-5 flex-shrink-0">
          {/* Language selector */}
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-2xl hover:bg-slate-100 transition-colors shadow-sm text-xs font-bold text-slate-600 cursor-pointer">
            <Globe className="w-3.5 h-3.5 text-blue-600" />
            <span>TH</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {/* Notifications */}
          <button 
            className="relative p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl transition-colors text-slate-600 hover:text-slate-900 cursor-pointer shadow-sm"
            title="การแจ้งเตือน"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white"></span>
          </button>

          <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

          {/* Profile Info Badge */}
          <button 
            onClick={onOpenProfile}
            className="flex items-center gap-3 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-2xl transition-all text-left shadow-sm cursor-pointer group"
            title="ดูโปรไฟล์ของคุณ"
          >
            <div className="w-8 h-8 rounded-full bg-blue-600 border-2 border-white overflow-hidden shadow-sm flex-shrink-0 group-hover:scale-105 transition-transform">
              <img 
                alt="Manager Avatar" 
                className="w-full h-full object-cover"
                src={currentUser?.avatar}
              />
            </div>
            <div className="text-left hidden sm:block pr-1">
              <p className="text-xs font-extrabold text-slate-800 leading-tight group-hover:text-blue-600 transition-colors">{currentUser?.name}</p>
              <p className="text-[10px] font-bold text-slate-500 leading-none mt-0.5">{currentUser?.role}</p>
            </div>
          </button>

          {/* Navbar Collapse / Expand Toggle Button */}
          {setIsNavbarCollapsed && (
            <button
              onClick={() => setIsNavbarCollapsed(prev => !prev)}
              className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/80 rounded-2xl transition-all text-xs font-extrabold cursor-pointer shadow-sm hover:scale-105 active:scale-95"
              title={isNavbarCollapsed ? "ขยายแถบเมนูนำทาง" : "ซ่อน/หุบแถบเมนูนำทาง"}
            >
              <ChevronDown className={`w-4 h-4 text-blue-600 transition-transform duration-300 ${isNavbarCollapsed ? 'rotate-0' : 'rotate-180'}`} />
              <span className="hidden sm:inline">{isNavbarCollapsed ? "แสดงเมนู" : "หุบเมนู"}</span>
            </button>
          )}

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="p-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/80 rounded-2xl transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
            title="ออกจากระบบ"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Second Row: Categorized Navigation Menu Bar */}
      {!isNavbarCollapsed && (
        <div className="bg-slate-100/70 px-8 py-2 flex items-center gap-3.5 overflow-x-auto border-t border-slate-200/80 shadow-inner animate-in slide-in-from-top-2 duration-200">
        {categories.map((cat) => {
          const isCollapsed = collapsedCategories.includes(cat.name);
          const hasActiveItem = cat.items.some(item => item.id === activeTab);

          return (
            <div key={cat.name} className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-slate-200/80 shadow-sm flex-shrink-0 transition-all duration-200">
              {/* Clickable Category Badge */}
              <button
                type="button"
                onClick={() => toggleCategory(cat.name)}
                title={isCollapsed ? `คลิกเพื่อขยายหมวดหมู่ ${cat.name}` : `คลิกเพื่อซ่อน/หุบหมวดหมู่ ${cat.name}`}
                className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider border flex items-center gap-1.5 transition-all cursor-pointer hover:opacity-85 select-none ${cat.color} ${hasActiveItem && isCollapsed ? 'ring-2 ring-blue-500/50 shadow-sm font-extrabold' : ''}`}
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
                        onClick={() => setActiveTab(item.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all duration-150 flex-shrink-0 cursor-pointer ${
                          isActive
                            ? "bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-[1.02]"
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
      )}
    </header>
  );
}
