import React from "react";
import { 
  Menu, 
  Search, 
  Bell, 
  HelpCircle, 
  Globe, 
  ChevronDown,
  LayoutDashboard, 
  BarChart3, 
  Users, 
  Calendar, 
  Settings, 
  ClipboardList, 
  FileText, 
  ShieldCheck 
} from "lucide-react";

interface NavbarProps {
  title: string;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSidebarHidden: boolean;
  setIsSidebarHidden: (val: boolean) => void;
  currentUser: any;
  onOpenProfile: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Navbar({ 
  title, 
  searchQuery, 
  setSearchQuery, 
  isSidebarHidden,
  setIsSidebarHidden,
  currentUser,
  onOpenProfile,
  activeTab,
  setActiveTab
}: NavbarProps) {
  const isHrOrFullAccess = ["HR", "HR Section Manager", "Operation Dir", "Operation Depart", "ผู้ดูแลระบบ", "Admin", "Co-admin", "Co-Admin"].includes(currentUser?.role || "");

  const topMenuItems = [
    { id: "dashboard",  label: "หน้าแรก Dashboard", icon: LayoutDashboard },
    { id: "reports",    label: "รายงานรายแผนก",     icon: BarChart3 },
    ...(isHrOrFullAccess ? [
      { id: "employees",  label: "รายชื่อพนักงาน",      icon: Users },
      { id: "leave-records", label: "บันทึกวันลา",      icon: FileText },
    ] : []),
    { id: "shifts",     label: "ตารางกะเทียบเรือ",    icon: Calendar },
    ...(isHrOrFullAccess ? [
      { id: "ot-records", label: "ประวัติ OT",         icon: ClipboardList },
      { id: "admin-permissions", label: "จัดการสิทธิ์ Admin", icon: ShieldCheck },
      { id: "settings", label: "การตั้งค่าระบบ",      icon: Settings },
    ] : []),
  ];

  return (
    <header className={`fixed top-0 right-0 bg-white border-b border-slate-200 z-30 shadow-sm transition-all duration-300 ${
      isSidebarHidden ? "left-0" : "left-[260px]"
    }`}>
      {/* Top Main Header Row */}
      <div className="h-16 flex justify-between items-center px-6 border-b border-slate-100">
        {/* Title & Search */}
        <div className="flex items-center gap-4 flex-1">
          {/* Manual Sidebar Toggle Button */}
          <button
            onClick={() => setIsSidebarHidden(!isSidebarHidden)}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm border border-slate-200"
            title={isSidebarHidden ? "กดเปิดเมนูด้านข้าง (Manual Open Sidebar)" : "กดซ่อนเมนูด้านข้าง (Manual Close Sidebar)"}
          >
            <Menu className="w-4 h-4 text-blue-600" />
            <span className="hidden sm:inline font-extrabold">{isSidebarHidden ? "เปิดเมนูข้าง" : "ซ่อนเมนูข้าง"}</span>
          </button>

          {/* Double A Logo when Sidebar is hidden */}
          {isSidebarHidden && (
            <div className="hidden md:flex items-center gap-2 mr-2">
              <div className="bg-white rounded-lg p-1 shadow-sm w-7 h-7 border border-slate-200 flex items-center justify-center">
                <img src="https://doubleapaper.com/DA-logo.png" alt="Double A" className="w-full h-full object-contain" />
              </div>
              <span className="text-xs font-extrabold text-slate-800 tracking-tight">Double A</span>
            </div>
          )}

          <h2 className="font-extrabold text-slate-800 text-base whitespace-nowrap hidden lg:block">{title}</h2>
          
          {/* Search bar */}
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all shadow-inner"
              placeholder="ค้นหาเรือสินค้า พนักงาน รหัสกะ..."
            />
          </div>

          {/* Live Berth Status Badge */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-[11px] font-extrabold text-emerald-700 shadow-sm flex-shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>⚓ การเข้าเทียบเรือหน้าท่า: ปกติ (Active)</span>
          </div>
        </div>

        {/* Toolbar / Actions */}
        <div className="flex items-center gap-3">
          {/* Language selector */}
          <button className="flex items-center gap-1 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-full hover:bg-slate-100 transition-colors shadow-sm text-xs font-semibold text-slate-600">
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            <span>TH</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          <div className="h-5 w-px bg-slate-200"></div>

          {/* Support */}
          <button 
            onClick={() => alert("ระบบคู่มือและแจ้งปัญหาขัดข้องสำหรับโอเปอเรเตอร์")}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500 hover:text-slate-700"
            title="ช่วยเหลือ"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Notifications */}
          <button 
            className="relative p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500 hover:text-slate-700"
            title="การแจ้งเตือน"
          >
            <Bell className="w-4 h-4" />
          </button>

          <div className="h-5 w-px bg-slate-200"></div>

          {/* Profile Info */}
          <button 
            onClick={onOpenProfile}
            className="flex items-center gap-2.5 hover:bg-slate-50 p-1 rounded-xl transition-colors text-left"
            title="ดูโปรไฟล์ของคุณ"
          >
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-800 leading-tight">{currentUser.name}</p>
              <p className="text-[10px] text-slate-500 leading-none mt-0.5">{currentUser.role}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 overflow-hidden shadow-inner flex-shrink-0">
              <img 
                alt="Manager Avatar" 
                className="w-full h-full object-cover"
                src={currentUser.avatar}
              />
            </div>
          </button>
        </div>
      </div>

      {/* Second Row: Top Navigation Menu Bar (Horizontal Tabs) */}
      <div className="bg-slate-50/90 px-6 py-1.5 flex items-center gap-1.5 overflow-x-auto border-t border-slate-100">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-2 flex-shrink-0 flex items-center gap-1">
          <span>📍 เมนูด้านบน:</span>
        </span>
        {topMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all duration-150 flex-shrink-0 cursor-pointer ${
                isActive
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 scale-[1.02]"
                  : "bg-white text-slate-600 hover:text-blue-600 hover:bg-blue-50 border border-slate-200/80 shadow-sm"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-slate-500"}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}
