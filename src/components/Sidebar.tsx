import React from "react";
import { 
  LayoutDashboard, 
  BarChart3, 
  Users, 
  Calendar, 
  Settings, 
  Plus, 
  HelpCircle, 
  LogOut, 
  Factory,
  FileText
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenNewRequest: () => void;
}

export default function Sidebar({ activeTab, setActiveTab, onOpenNewRequest }: SidebarProps) {
  const menuItems = [
    { id: "dashboard", label: "หน้าแรก Dashboard", icon: LayoutDashboard },
    { id: "reports", label: "รายงานข้อมูลรายแผนก", icon: BarChart3 },
    { id: "employees", label: "รายชื่อพนักงาน", icon: Users },
    { id: "shifts", label: "จัดการตารางกะ (Shifts)", icon: Calendar },
    { id: "requests", label: "คำขอทำโอที (OT Requests)", icon: FileText },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-[260px] bg-white border-r border-slate-200 flex flex-col py-6 px-4 z-40 shadow-sm">
      {/* Brand Logo */}
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/20">
          <Factory className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-semibold text-slate-900 leading-tight text-base">Enterprise OT</h1>
          <p className="text-[11px] font-medium text-slate-500 tracking-wider uppercase">Management Portal</p>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-left text-sm ${
                isActive
                  ? "bg-blue-50 text-blue-600 font-semibold border-l-4 border-blue-600"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="mt-auto pt-6 border-t border-slate-100 space-y-4">
        {/* New Request Button */}
        <button
          onClick={onOpenNewRequest}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm shadow-blue-600/10"
        >
          <Plus className="w-4 h-4" />
          <span>ส่งคำขอทำโอที</span>
        </button>

        <div className="space-y-1">
          <button
            onClick={() => setActiveTab("settings")}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors ${activeTab === 'settings' ? 'bg-blue-50 text-blue-600 font-semibold' : ''}`}
          >
            <Settings className="w-4 h-4 text-slate-400" />
            <span>การตั้งค่าระบบ</span>
          </button>
          <a
            href="#support"
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-left text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
          >
            <HelpCircle className="w-4 h-4 text-slate-400" />
            <span>ความช่วยเหลือ</span>
          </a>
          <button
            onClick={() => alert("ระบบกำลังทำการออกจากระบบ...")}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4 text-red-400" />
            <span>ออกจากระบบ</span>
          </button>
        </div>

        {/* User profile footer */}
        <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl border border-slate-100">
          <div className="w-9 h-9 rounded-full overflow-hidden shadow-inner border border-slate-200">
            <img 
              alt="Profile" 
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAf5UhzQFkBl2tAqPIfYe5tF5JObtrReGu_lohxjpxav5OEjcmmCJhPclOvd2pYN5Q63ircrUY62HYEtYICs05VEFPgL0t4CQSbr1dUS_veJddqwvCz2hrMENO5DyK5fUo9Lx_K8EQj_RXIf9a91CYGwMUZftntpoCZ5n7RUAnxYNIsXz71ttH1VvWFLTpEggMdONt3b-WOccq3oi4S33bsL6DAyTg_90K2vzyRwxDzf3Isscur4MrcuQ"
            />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-xs font-semibold text-slate-900 truncate">คุณสิทธิศักดิ์ พ.</p>
            <p className="text-[10px] text-slate-500 truncate font-medium">ผู้ดูแลระบบ</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
