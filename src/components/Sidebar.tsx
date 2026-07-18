import { 
  LayoutDashboard, 
  BarChart3, 
  Users, 
  Calendar, 
  Settings, 
  HelpCircle, 
  LogOut, 
  Factory,
  ClipboardList,
  FileText
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  currentUser: any;
}

export default function Sidebar({ activeTab, setActiveTab, onLogout, currentUser }: SidebarProps) {
  const isHrOrFullAccess = ["HR", "HR Section Manager", "Operation Dir", "Operation Depart", "ผู้ดูแลระบบ"].includes(currentUser?.role || "");

  const menuItems = [
    { id: "dashboard",  label: "หน้าแรก Dashboard",        icon: LayoutDashboard },
    { id: "reports",    label: "รายงานข้อมูลรายแผนก",      icon: BarChart3 },
    ...(isHrOrFullAccess ? [
      { id: "employees",  label: "รายชื่อพนักงาน",           icon: Users },
      { id: "leave-records", label: "บันทึกวันลา (Leave)",    icon: FileText },
    ] : []),
    { id: "shifts",     label: "จัดการตารางกะ (Shifts)",   icon: Calendar },
    ...(isHrOrFullAccess ? [
      { id: "ot-records", label: "ประวัติ OT จากกะทำงาน",   icon: ClipboardList },
    ] : []),
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
        <div className="space-y-1">
          {isHrOrFullAccess && (
            <button
              onClick={() => setActiveTab("settings")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors ${activeTab === 'settings' ? 'bg-blue-50 text-blue-600 font-semibold' : ''}`}
            >
              <Settings className="w-4 h-4 text-slate-400" />
              <span>การตั้งค่าระบบ</span>
            </button>
          )}
          <a
            href="#support"
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-left text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
          >
            <HelpCircle className="w-4 h-4 text-slate-400" />
            <span>ความช่วยเหลือ</span>
          </a>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4 text-red-400" />
            <span>ออกจากระบบ</span>
          </button>
        </div>

        {/* User profile footer */}
        <button
          onClick={() => setActiveTab("profile")}
          className={`w-full flex items-center gap-3 p-2 rounded-xl border transition-all text-left hover:bg-slate-100 ${
            activeTab === "profile" 
              ? "bg-blue-50 border-blue-200 text-blue-600 font-semibold" 
              : "bg-slate-50 border-slate-100 text-slate-600"
          }`}
          title="จัดการโปรไฟล์ส่วนตัว"
        >
          <div className="w-9 h-9 rounded-full overflow-hidden shadow-inner border border-slate-200 flex-shrink-0 bg-slate-200 flex items-center justify-center">
            {currentUser?.avatar ? (
              <img alt="Profile" className="w-full h-full object-cover" src={currentUser.avatar} />
            ) : (
              <span className="text-xs font-bold text-slate-500">{(currentUser?.name || "U")[0]}</span>
            )}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-xs font-semibold text-slate-900 truncate">{currentUser?.name || "ผู้ใช้งาน"}</p>
            <p className="text-[10px] text-slate-500 truncate font-medium">{currentUser?.role || "-"}</p>
          </div>
        </button>
      </div>
    </aside>
  );
}
