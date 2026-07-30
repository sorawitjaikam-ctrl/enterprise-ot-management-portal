import { 
  LayoutDashboard, 
  BarChart3, 
  Users, 
  Calendar, 
  Settings, 
  HelpCircle, 
  LogOut, 
  Ship,
  Anchor,
  ClipboardList,
  FileText,
  ShieldCheck
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  currentUser: any;
}

export default function Sidebar({ activeTab, setActiveTab, onLogout, currentUser }: SidebarProps) {
  const isHrOrFullAccess = ["HR", "HR Section Manager", "Operation Dir", "Operation Depart", "ผู้ดูแลระบบ", "Admin"].includes(currentUser?.role || "");

  const menuItems = [
    { id: "dashboard",  label: "หน้าแรก Dashboard",        icon: LayoutDashboard },
    { id: "reports",    label: "รายงานข้อมูลรายแผนก",      icon: BarChart3 },
    ...(isHrOrFullAccess ? [
      { id: "employees",  label: "รายชื่อพนักงานหน้าท่า",       icon: Users },
      { id: "leave-records", label: "บันทึกวันลา (Leave)",    icon: FileText },
    ] : []),
    { id: "shifts",     label: "จัดตารางกะเทียบเรือ (Shifts)", icon: Calendar },
    ...(isHrOrFullAccess ? [
      { id: "ot-records", label: "ประวัติ OT งานหน้าท่าเรือ",  icon: ClipboardList },
      { id: "admin-permissions", label: "จัดการสิทธิ์ Admin & ผู้ใช้", icon: ShieldCheck },
    ] : []),
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-[260px] bg-slate-900 border-r border-slate-800 flex flex-col py-6 px-4 z-40 shadow-xl text-slate-300">
      {/* Brand Logo */}
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20 flex-shrink-0">
          <Ship className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-extrabold text-white leading-tight text-sm tracking-tight">Double A Terminal</h1>
          <p className="text-[10px] font-bold text-sky-400 tracking-wider uppercase">Port & Logistics OT</p>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 space-y-1.5">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-left text-sm cursor-pointer ${
                isActive
                  ? "bg-blue-600/20 text-sky-400 font-extrabold border-l-4 border-sky-400 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "text-sky-400" : "text-slate-500"}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="mt-auto pt-6 border-t border-slate-800 space-y-4">
        <div className="space-y-1">
          {isHrOrFullAccess && (
            <button
              onClick={() => setActiveTab("settings")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors cursor-pointer ${activeTab === 'settings' ? 'bg-blue-600/20 text-sky-400 font-bold' : ''}`}
            >
              <Settings className="w-4 h-4 text-slate-500" />
              <span>การตั้งค่าระบบ</span>
            </button>
          )}
          <a
            href="#support"
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-left text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
          >
            <HelpCircle className="w-4 h-4 text-slate-500" />
            <span>คู่มือการใช้งานท่าเรือ</span>
          </a>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-sm text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-rose-400" />
            <span>ออกจากระบบ</span>
          </button>
        </div>

        {/* User profile footer */}
        <button
          onClick={() => setActiveTab("profile")}
          className={`w-full flex items-center gap-3 p-2.5 rounded-2xl border transition-all text-left cursor-pointer ${
            activeTab === "profile" 
              ? "bg-blue-600/20 border-sky-500/40 text-sky-300 font-bold" 
              : "bg-slate-850 border-slate-800 text-slate-300 hover:bg-slate-800"
          }`}
          title="จัดการโปรไฟล์ส่วนตัว"
        >
          <div className="w-9 h-9 rounded-full overflow-hidden shadow-inner border border-slate-700 flex-shrink-0 bg-slate-800 flex items-center justify-center">
            {currentUser?.avatar ? (
              <img alt="Profile" className="w-full h-full object-cover" src={currentUser.avatar} />
            ) : (
              <span className="text-xs font-bold text-sky-400">{(currentUser?.name || "U")[0]}</span>
            )}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-xs font-bold text-slate-100 truncate">{currentUser?.name || "ผู้ใช้งาน"}</p>
            <p className="text-[10px] text-sky-400 truncate font-mono font-medium">{currentUser?.role || "-"}</p>
          </div>
        </button>
      </div>
    </aside>
  );
}
