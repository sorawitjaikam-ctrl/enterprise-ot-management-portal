# Milestone 2 Explorer 1 Handoff Report: Responsive App Shell & Mobile Navigation Drawer

## 1. Observation

### 1.1 Direct Codebase & Layout Inspection
- **`src/components/Navbar.tsx` (Lines 1–234)**:
  - **Fixed Header Structure**: `<header className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs font-sans">` (Line 97).
  - **Row 1 (Top Header Bar)**:
    - Fixed container padding: `px-8 py-3` (Line 99). On a 375px mobile viewport, 64px padding leaves only 311px, causing immediate horizontal overflow.
    - Rigid brand column width: `min-w-[260px]` (Line 101). When combined with search input and user profile actions, it violently overflows the 375px–430px mobile screen.
    - Global Search Bar: `<div className="flex-1 max-w-xl relative">` (Line 119). Lacks responsive collapsible toggle for mobile viewports.
    - Action Buttons: Language selector, Notification bell, User avatar/badge, Logout button (Lines 131–179). Tap targets lack guaranteed 44x44px bounding boxes, and label text overflows on small screens.
  - **Row 2 (Horizontal Categorized Nav Bar)**:
    - Fixed horizontal bar with `px-8 py-2 overflow-x-auto border-t` (Line 183).
    - Takes up ~48px height. On desktop, total header is ~112px; on mobile screens (667px–844px height), having two stacked rows consumes over 20% of vertical screen estate.
  - **Critical Navigation & State Bugs Identified**:
    - **Tab ID Mismatch**: In `Navbar.tsx` Line 74, `{ id: "job-value", label: "Job Value", icon: TrendingUp }` is declared with a hyphen. However, in `App.tsx` (Lines 4389, 5050) and `Sidebar.tsx` (Line 31), the tab ID is `"job_value"` (with underscore). Clicking "Job Value" in Navbar currently results in a dead route.
    - **Missing 11th View**: `Navbar.tsx` completely omitted `reports` (Department Reports & Efficiency Analytics), which is present in `Sidebar.tsx` (Line 32) and `App.tsx` (Lines 4390, 5848).
    - **Unused Prop**: `onOpenCsvTemplateHub` is accepted in `NavbarProps` (Line 39) but is never rendered or accessible in the UI.
    - **Missing Props in Interface**: `App.tsx` (Line 4385) passes `isNavbarCollapsed` and `setIsNavbarCollapsed` into `<Navbar />`, but `NavbarProps` in `Navbar.tsx` (Lines 18–28) did not declare them, causing TypeScript diagnostic error `TS2322`.

- **`src/App.tsx` (Lines 4380–4420)**:
  - Header margin and padding: `<main className={`flex-1 overflow-y-auto transition-all duration-300 ${isFullScreen ? "p-4" : "mt-28 p-8"}`}>` (Line 4414).
  - Hardcoded `mt-28 p-8` assumes dual-row 112px desktop header and desktop padding. On mobile, `mt-28` leaves huge empty white space if the navbar is single-row (~56px), and `p-8` clips content cards.
  - All 11 functional views rendered in `App.tsx`:
    1. `dashboard` (Line 4419)
    2. `job_value` (Line 5050)
    3. `reports` (Line 5848)
    4. `employees` (Line 6415)
    5. `shifts` (Line 7233)
    6. `hr-editor` (Line 8303)
    7. `ot-records` (Line 8316)
    8. `leave-records` (Line 8326)
    9. `settings` (Line 8336)
    10. `admin-permissions` (Line 8573)
    11. `profile` (Line 8704)

- **`src/components/Sidebar.tsx` (Lines 1–146)**:
  - Fixed aside `w-[260px]` with dark slate theme (`bg-slate-900`).
  - Contains navigation items for `dashboard`, `job_value`, `reports`, `employees`, `leave-records`, `shifts`, `ot-records`, `admin-permissions`, `settings`, `profile`.

---

## 2. Logic Chain

### 2.1 Responsive Tier Strategy (Mobile, Tablet, Desktop)
From the observations above, the responsive header and navigation architecture must adapt cleanly across three standardized viewport tiers:

```
+-------------------------------------------------------------------------------+
| Breakpoint Tier | Viewport Width | Header Layout      | Navigation Mechanism  |
+-----------------+----------------+--------------------+-----------------------+
| Mobile          | < 640px        | Single Row (~56px) | Hamburger Drawer Sheet|
|                 | (375px–639px)  | Expandable Search  | Tap Targets >= 44px   |
+-----------------+----------------+--------------------+-----------------------+
| Tablet          | 640px–1023px   | Adaptive Dual-Row  | Drawer + Scrollable   |
|                 | (sm / md)      | Inline Search      | Horizontal Pill Bar   |
+-----------------+----------------+--------------------+-----------------------+
| Desktop         | >= 1024px      | Full Dual-Row      | Full Categorized Nav  |
|                 | (lg / xl)      | Full Global Search | Pills + Profile Card  |
+-------------------------------------------------------------------------------+
```

### 2.2 Top Header (Navbar) Adaptation Design
1. **Row 1 Responsive Left Section (Brand & Trigger)**:
   - Mobile: Hamburger button (`Menu` icon) with `min-h-[44px] min-w-[44px]` tap target, compact Double A gradient badge (`w-8 h-8`), and active view title (`text-xs font-black truncate max-w-[140px]`).
   - Tablet & Desktop: Hamburger hidden (`lg:hidden` or dual mode), full Double A Terminal brand logo with subtitle `Port & Logistics OT`, vertical divider, and full view title.
2. **Row 1 Responsive Center Section (Search Experience)**:
   - Desktop (`>= 1024px`): Full inline search input (`max-w-xl`) with search icon and focus effects.
   - Tablet (`640px–1023px`): Compact inline search bar (`w-48 sm:w-64`).
   - Mobile (`< 640px`): Search icon button (`min-h-[44px] min-w-[44px]`) in the header actions. Tapping it toggles an animated search bar directly below the header with auto-focus input, search icon, and quick clear/close button.
3. **Row 1 Responsive Right Section (Actions & User Profile)**:
   - Mobile: Compact action icons with `min-h-[44px] min-w-[44px]` tap target: Search toggle, Notifications bell with unread pulse dot, and User avatar icon button. Language toggle and Logout are also cleanly accessible inside the Mobile Drawer.
   - Tablet & Desktop: Language selector (`TH` / `EN`), Notifications bell with count/pulse, full User Profile pill (avatar + name + role), CSV Template Hub download button, and Logout button.
4. **Row 2 (Category Pill Navigation)**:
   - Hidden on mobile (`hidden md:flex`) to save screen space, fully replacing it with the Mobile Navigation Drawer.
   - On Tablet & Desktop (`md:flex`): Smooth horizontal touch-scrollable pill bar (`overflow-x-auto scrollbar-none`), category color badges, collapsible toggles, active indicators, and corrected `job_value` + `reports` items.

### 2.3 Mobile Navigation Drawer / Sheet Architecture
1. **Visual Structure & Motion**:
   - **Backdrop Overlay**: Fixed full-screen `fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 transition-opacity duration-300`. Closes drawer when clicked.
   - **Slide-in Drawer Sheet**: Fixed left sheet `fixed top-0 left-0 bottom-0 w-[85vw] max-w-[340px] bg-slate-900 text-slate-100 z-50 flex flex-col shadow-2xl border-r border-slate-800 transition-transform duration-300 ease-out`.
2. **Drawer Components (Top to Bottom)**:
   - **Header**: Double A Terminal logo, title, and prominent Close button (`X` icon, `min-h-[44px] min-w-[44px]`).
   - **User Profile Card**: Avatar, full name, role badge, department, and direct tap to navigate to `"profile"` view.
   - **Categorized View Navigation List** (11 Functional Views):
     - **ภาพรวม & แผนงาน (Overview & Operations)**:
       - `dashboard`: หน้าแรก Dashboard (`LayoutDashboard` icon)
       - `shifts`: ตารางจัดกะพนักงาน (`Calendar` icon)
     - **การจัดการบุคลากร & ผลตอบแทน (Personnel & Compensation)**:
       - `employees`: รายชื่อพนักงานหน้าท่า (`Users` icon)
       - `job_value`: Job Value & ผลตอบแทน (`TrendingUp` icon)
       - `hr-editor`: จัดการข้อมูล & รายได้ (HR Direct) (`FileText` icon) [HR/Admin only]
     - **วันลา & ประวัติ OT (Leaves & OT Logs)**:
       - `leave-records`: บันทึกวันลาพนักงาน (`ClipboardList` icon)
       - `ot-records`: ประวัติ OT จากกะ (`Calendar` icon)
     - **รายงาน & วิเคราะห์ข้อมูล (Reports & Analytics)**:
       - `reports`: รายงานข้อมูลรายแผนก (`BarChart3` icon)
     - **บริหารจัดการระบบ (System Administration)**:
       - `admin-permissions`: สิทธิ์ผู้ใช้งาน (`ShieldCheck` icon) [HR/Admin only]
       - `settings`: ตั้งค่าระบบและกฎเกณฑ์ (`Settings` icon)
   - **Navigation Item Ergonomics**:
     - Height: `min-h-[48px]`, `px-3.5 py-3` with `gap-3`.
     - Active styling: `bg-blue-600 text-white font-bold shadow-md ring-1 ring-blue-400/40` with active indicator pip.
     - Inactive styling: `text-slate-300 hover:text-white hover:bg-slate-800/80 active:bg-slate-800`.
     - Auto-dismiss on tap: `setActiveTab(id); setIsMobileMenuOpen(false);`.
   - **Drawer Footer Actions**:
     - CSV Template Hub download button (`Download` / `FileSpreadsheet` icon).
     - Language selector toggle (TH / EN).
     - Logout button with high-contrast rose styling (`LogOut` icon, `min-h-[44px]`).
3. **Accessibility & Scroll Locking**:
   - `document.body.style.overflow = isMobileMenuOpen ? "hidden" : "unset"` to prevent background scroll jumping on iOS/Android.
   - `Escape` key listener to dismiss drawer or search overlay.

### 2.4 Main Container & Viewport Spacing Alignment
- Dynamic main container margin-top and padding in `App.tsx`:
  - `mt-16 sm:mt-20 lg:mt-28`:
    - Mobile (< 640px): `mt-16` (64px) matches the single-row 56px header + 8px air.
    - Tablet (640px–1023px): `mt-20` (80px) matches compact dual-row.
    - Desktop (>= 1024px): `mt-28` (112px) matches full dual-row header.
  - `p-3 sm:p-6 lg:p-8`:
    - Mobile: `p-3` maximizes screen width for tables and metric cards.
    - Tablet: `p-6`.
    - Desktop: `p-8`.

---

## 3. Caveats
1. **Scope Boundaries**:
   - This proposal covers `Navbar.tsx`, `Sidebar.tsx`, `App.tsx` layout shell wrapper, and `index.css` utility styles.
   - Core shift calculations (`getEmpMonthlyOtPayBreakdown`), CSV export routines, and desktop 368px summary widgets must remain 100% untouched to satisfy invariant rules.
   - Shift matrix frozen columns and Roster table sticky column adaptations are formally assigned to Milestone 3.
   - Detailed modal dialogues (19 modals) are formally assigned to Milestone 4.
2. **Backward Compatibility**:
   - Tab aliases: If any existing code or tests send `job-value`, `job_values`, or `scheduler`, the navigation handler should normalize aliases to canonical tab IDs (`job_value`, `shifts`, `employees`, etc.).

---

## 4. Conclusion & Implementation Proposal

### 4.1 Component Props & State Interface Contract

```typescript
// Interface for Navbar Props
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
}

// Navigation Item Structure
export interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  requiresAdmin?: boolean;
}

// Category Group Structure
export interface NavCategory {
  name: string;
  color: string;
  activeBadgeColor: string;
  items: NavItem[];
}
```

### 4.2 Complete Proposed Code Specification for `src/components/Navbar.tsx`

```tsx
import React, { useState, useEffect } from "react";
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
  TrendingUp,
  BarChart3,
  Menu,
  X,
  User,
  Download,
  CheckCircle2
} from "lucide-react";

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
  setIsNavbarCollapsed
}: NavbarProps) {
  const isHrOrFullAccess = ["HR", "HR Section Manager", "Operation Dir", "Operation Depart", "ผู้ดูแลระบบ", "Admin", "Co-admin", "Co-Admin"].includes(currentUser?.role || "");

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

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
              className="flex items-center justify-center w-11 h-11 min-h-[44px] min-w-[44px] rounded-xl text-slate-700 hover:bg-slate-100 active:bg-slate-200 transition-colors lg:hidden cursor-pointer"
              aria-label="เปิดเมนูนำทาง"
              title="เปิดเมนูหลัก"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Brand Logo & Name */}
            <div 
              onClick={() => handleTabSelect("dashboard")}
              className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group select-none"
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
            <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block"></div>
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
          <div className="flex items-center gap-1 sm:gap-2.5">
            
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

            {/* CSV Template Hub Button (Optional Quick Action) */}
            {onOpenCsvTemplateHub && (
              <button
                type="button"
                onClick={onOpenCsvTemplateHub}
                className="hidden lg:flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80 rounded-2xl text-xs font-bold transition-all shadow-xs cursor-pointer"
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

            {/* Notifications Bell */}
            <button 
              type="button" 
              className="flex items-center justify-center w-11 h-11 min-h-[44px] min-w-[44px] bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/80 rounded-2xl transition-all relative shadow-xs cursor-pointer"
              title="การแจ้งเตือน"
            >
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 bg-blue-600 rounded-full absolute top-3 right-3 ring-2 ring-white animate-pulse"></span>
            </button>

            {/* Profile Badge Button */}
            <button 
              onClick={onOpenProfile}
              className="flex items-center gap-2.5 p-1 sm:px-3 sm:py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-2xl transition-all text-left shadow-xs cursor-pointer group min-h-[44px]"
              title="ดูโปรไฟล์ของคุณ"
            >
              <div className="w-8 h-8 rounded-full bg-blue-600 border-2 border-white overflow-hidden shadow-sm flex-shrink-0 group-hover:scale-105 transition-transform">
                {currentUser?.avatar ? (
                  <img 
                    alt="Manager Avatar" 
                    className="w-full h-full object-cover"
                    src={currentUser.avatar}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-xs font-black">
                    {(currentUser?.name || "U")[0]}
                  </div>
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
        <div className="hidden md:flex bg-slate-100/70 px-4 sm:px-6 lg:px-8 py-2 items-center gap-2.5 lg:gap-3.5 overflow-x-auto border-t border-slate-200/80 shadow-inner scrollbar-none">
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
                  className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider border flex items-center gap-1.5 transition-all cursor-pointer hover:opacity-85 select-none ${cat.color} ${hasActiveItem && isCollapsed ? 'ring-2 ring-blue-500/50 shadow-xs font-extrabold' : ''}`}
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
                : "bg-slate-800/60 border-slate-750 hover:bg-slate-800 text-slate-200"
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
        <nav className="flex-1 overflow-y-auto overscroll-contain p-3 space-y-4">
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
          {onOpenCsvTemplateHub && (
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenCsvTemplateHub();
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 min-h-[44px] rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-blue-400" />
              <span>ดาวน์โหลดแม่แบบ CSV (Templates)</span>
            </button>
          )}

          <button
            type="button"
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 min-h-[44px] rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-rose-400" />
            <span>ออกจากระบบ</span>
          </button>
        </div>
      </aside>
    </>
  );
}
```

### 4.3 Proposed Integration Edits in `src/App.tsx`
1. **Dynamic Main Container Margin & Padding**:
   ```tsx
   {/* In App.tsx Line 4414 */}
   <main className={`flex-1 overflow-y-auto transition-all duration-300 ${isFullScreen ? "p-2 sm:p-4" : "mt-16 sm:mt-20 lg:mt-28 p-3 sm:p-6 lg:p-8"}`}>
   ```
2. **Navbar Props Alignment**:
   ```tsx
   <Navbar 
     isNavbarCollapsed={isNavbarCollapsed}
     setIsNavbarCollapsed={setIsNavbarCollapsed}
     title={/* dynamic title */}
     searchQuery={searchQuery}
     setSearchQuery={setSearchQuery}
     currentUser={currentUser}
     onOpenProfile={() => setActiveTab("profile")}
     activeTab={activeTab}
     setActiveTab={setActiveTab}
     onLogout={handleLogout}
     onOpenCsvTemplateHub={() => setIsCsvTemplateHubOpen(true)}
   />
   ```

---

## 5. Verification Method

### 5.1 Compilation & Type Checking
- Command: `npm run lint` (runs `tsc --noEmit`).
- Verify that TypeScript errors on `NavbarProps` and `isNavbarCollapsed` are 100% resolved.
- Run `npm run build` to verify Vite bundle packaging.

### 5.2 Responsive Breakpoint Validation
- **Mobile Viewport (375px–430px)**:
  - Verify header height is ~56px (`h-14`) with no horizontal scrollbar on `body` or `header`.
  - Tap Hamburger button: drawer slides in smoothly, background scroll locks, all 11 views are displayed with >=44px tap heights.
  - Tap any view (e.g. `shifts`, `job_value`, `reports`): active view changes and drawer automatically closes.
  - Tap Search icon: mobile search input appears below header with auto-focus.
- **Tablet Viewport (768px–1023px)**:
  - Verify inline search is visible.
  - Category pill bar is touch-scrollable horizontally without clipping.
- **Desktop Viewport (>=1024px / 1280px / 1440px)**:
  - Verify full dual-row header layout, global search input, manager profile pill, and 368px summary widget alignment.
