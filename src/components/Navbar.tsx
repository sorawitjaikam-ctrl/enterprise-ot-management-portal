import React from "react";
import { Menu, Search, Bell, HelpCircle, Globe, ChevronDown } from "lucide-react";

interface NavbarProps {
  title: string;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSidebarHidden: boolean;
  setIsSidebarHidden: (val: boolean) => void;
  currentUser: any;
  onOpenProfile: () => void;
}

export default function Navbar({ 
  title, 
  searchQuery, 
  setSearchQuery, 
  isSidebarHidden,
  setIsSidebarHidden,
  currentUser,
  onOpenProfile
}: NavbarProps) {
  return (
    <header className={`fixed top-0 right-0 h-16 bg-white border-b border-slate-200 flex justify-between items-center px-8 z-30 shadow-sm transition-all duration-300 ${
      isSidebarHidden ? "left-0" : "left-[260px]"
    }`}>
      {/* Title & Search */}
      <div className="flex items-center gap-4 w-1/2">
        <button
          onClick={() => setIsSidebarHidden(!isSidebarHidden)}
          className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
          title={isSidebarHidden ? "แสดงเมนูแถบข้าง" : "ซ่อนเมนูแถบข้าง"}
        >
          <Menu className="w-5 h-5" />
        </button>
        <h2 className="font-bold text-slate-800 text-lg whitespace-nowrap">{title}</h2>
        
        {/* Search bar */}
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all shadow-inner"
            placeholder="ค้นหาพนักงาน รหัส หรือแผนก..."
          />
        </div>
      </div>

      {/* Toolbar / Actions */}
      <div className="flex items-center gap-4">
        {/* Language selector */}
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full hover:bg-slate-100 transition-colors shadow-sm text-xs font-semibold text-slate-600">
          <Globe className="w-3.5 h-3.5 text-slate-500" />
          <span>TH</span>
          <ChevronDown className="w-3 h-3 text-slate-400" />
        </button>

        <div className="h-6 w-px bg-slate-200"></div>

        {/* Support */}
        <button 
          onClick={() => alert("ระบบคู่มือและแจ้งปัญหาขัดข้องสำหรับโอเปอเรเตอร์")}
          className="p-2.5 hover:bg-slate-50 rounded-full transition-colors text-slate-500 hover:text-slate-700"
          title="ช่วยเหลือ"
        >
          <HelpCircle className="w-5 h-5" />
        </button>

        {/* Notifications */}
        <button 
          className="relative p-2.5 hover:bg-slate-50 rounded-full transition-colors text-slate-500 hover:text-slate-700"
          title="การแจ้งเตือน"
        >
          <Bell className="w-5 h-5" />
        </button>

        <div className="h-6 w-px bg-slate-200"></div>

        {/* Profile Info */}
        <button 
          onClick={onOpenProfile}
          className="flex items-center gap-3 hover:bg-slate-50 p-1.5 rounded-xl transition-colors text-left"
          title="ดูโปรไฟล์ของคุณ"
        >
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-slate-800 leading-tight">{currentUser.name}</p>
            <p className="text-[10px] text-slate-500 leading-none mt-0.5">{currentUser.role}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 overflow-hidden shadow-inner flex-shrink-0">
            <img 
              alt="Manager Avatar" 
              className="w-full h-full object-cover"
              src={currentUser.avatar}
            />
          </div>
        </button>
      </div>
    </header>
  );
}
