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
  onOpenCsvTemplateHub
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
      color: "bg-blue-50/80 text-blue-900 border-blue-200/80",
      items: [
        { id: "dashboard", label: "หน้าแรก Dashboard", icon: LayoutDashboard },
        { id: "shifts", label: "ตารางจัดกะพนักงาน", icon: Calendar },
      ]
    },
    {
      name: "การจัดการบุคลากร",
      color: "bg-emerald-50/80 text-emerald-900 border-emerald-200/80",
      items: [
        { id: "employees", label: "รายชื่อพนักงาน", icon: Users },
        { id: "job-value", label: "Job Value", icon: TrendingUp },
        ...(isHrOrFullAccess ? [{ id: "hr-editor", label: "จัดการข้อมูลพนักงาน & รายได้", icon: FileText }] : []),
      ]
    },
    {
      name: "วันลา & ประวัติ OT",
      color: "bg-amber-50/80 text-amber-900 border-amber-200/80",
      items: [
        { id: "leave-records", label: "บันทึกวันลา", icon: ClipboardList },
        { id: "ot-records", label: "ประวัติ OT จากกะ", icon: Calendar },
      ]
    },
    ...(isHrOrFullAccess ? [{
      name: "บริหารจัดการระบบ",
      color: "bg-purple-50/80 text-purple-900 border-purple-200/80",
      items: [
        { id: "admin-permissions", label: "สิทธิ์ผู้ใช้งาน", icon: ShieldCheck },
        { id: "settings", label: "ตั้งค่าระบบ", icon: Settings },
      ]
    }] : [])
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs font-sans">
      {/* Top Row: System Brand & Search & Profile Bar */}
      <div className="px-8 py-3 flex items-center justify-between gap-6">
        {/* Brand / Logo */}
        <div className="flex items-center gap-4 min-w-[260px]">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-slate-950 via-blue-950 to-slate-900 text-white flex items-center justify-center font-black text-xs shadow-md border border-slate-800">
            <span className="tracking-tighter font-mono">Double A</span>
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tight text-slate-900 flex items-center gap-1.5 leading-none">
              <span>Double A Terminal</span>
            </h1>
            <p className="text-[10px] text-blue-600 font-extrabold uppercase tracking-wider mt-0.5">
              Port & Logistics OT
            </p>
          </div>
          
          <div className="h-6 w-px bg-slate-200 mx-1 hidden md:block"></div>
          <span className="text-xs font-extrabold text-slate-700 hidden md:block">{title}</span>
        </div>

        {/* Global Search Bar */}
        <div className="flex-1 max-w-xl relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาพนักงาน รหัสกะ เรือสินค้า..."
            className="w-full pl-10 pr-4 py-2 bg-slate-100/70 border border-slate-200/80 rounded-2xl text-xs font-medium text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all shadow-inner"
          />
        </div>

        {/* Actions / Profile / Logout */}
        <div className="flex items-center gap-3">
          {/* Language Selector */}
          <button 
            type="button" 
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-2xl text-xs font-bold text-slate-700 transition-all shadow-sm"
          >
            <Globe className="w-3.5 h-3.5 text-blue-600" />
            <span>TH</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {/* Notifications */}
          <button 
            type="button" 
            className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/80 rounded-2xl transition-all relative shadow-sm cursor-pointer"
            title="การแจ้งเตือน"
          >
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 bg-blue-600 rounded-full absolute top-2 right-2 ring-2 ring-white animate-pulse"></span>
          </button>

          {/* Profile Badge */}
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
      <div className="bg-slate-100/70 px-8 py-2 flex items-center gap-3.5 overflow-x-auto border-t border-slate-200/80 shadow-inner">
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
                            ? "bg-slate-900 text-white shadow-sm scale-[1.01]"
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
  );
}
