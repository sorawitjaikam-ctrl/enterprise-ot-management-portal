# Milestone 2 — Explorer 2 Handoff Report: Fluid Horizontal Category Navigation Pills & Main Container Spacing

## 1. Observation

### 1.1 Main Layout Container Spacing in `src/App.tsx`
- **File**: `src/App.tsx:4414`
  ```tsx
  <main className={`flex-1 overflow-y-auto transition-all duration-300 ${isFullScreen ? "p-4" : "mt-28 p-8"}`}>
  ```
- **Observed Deficiency**:
  - `mt-28` (112px / 7rem) and `p-8` (32px / 2rem) are static and hardcoded for non-fullscreen mode.
  - On mobile viewports (375px–430px), `p-8` deducts 64px of horizontal space (32px left + 32px right), leaving only 311px usable width. This crushes KPI cards, shift pickers, and tables.
  - On mobile/tablet, the desktop 2-row navbar (~108px high) collapses into a compact single-row header (~56px–64px high). A static `mt-28` leaves an awkward ~50px empty gap above the main content on mobile screens.
  - Conversely, when fullscreen is enabled (`isFullScreen === true`), `mt-28` is removed but padding is hardcoded to `p-4` without responsive stepping.

### 1.2 Fixed Header Dimensions in `src/components/Navbar.tsx`
- **File**: `src/components/Navbar.tsx:97-231`
  - **Top Row** (`Navbar.tsx:98-180`): `px-8 py-3 flex items-center justify-between gap-6` (Height: ~60px).
  - **Second Row** (`Navbar.tsx:183-230`): `bg-slate-100/70 px-8 py-2 flex items-center gap-3.5 overflow-x-auto border-t border-slate-200/80 shadow-inner` (Height: ~48px).
  - **Total Desktop Fixed Height**: ~108px (matching `lg:mt-28` = 112px with a 4px buffer).
  - **Mobile/Tablet Layout Requirement**: Mobile devices will hide Row 2 (relying on the hamburger drawer/sheet navigation), resulting in a compact single-row header of ~56px–64px (`h-14` or `h-16`).

### 1.3 Sub-Navigation Tabs and Filter Category Pills in Views (`src/App.tsx`)
1. **HR Web Direct Editor Department Filter Tabs** (`src/App.tsx:1195-1233`):
   ```tsx
   <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200/60">
     {/* 7 Department buttons */}
   </div>
   ```
   *Deficiency*: `flex-wrap` causes 7 department buttons to wrap into 3–4 stacked rows on 375px screens, consuming excessive vertical viewport space and disrupting scanability.
2. **Dashboard Chart Series Legend Filter Pills** (`src/App.tsx:4760-4805`):
   ```tsx
   <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
     {/* 3 interactive toggle filter pills */}
   </div>
   ```
   *Deficiency*: Uses `flex-wrap` which can cause multi-line wrapping and layout jitter on small mobile screens.
3. **Job Value Monthly Financial Chart Filter Tabs** (`src/App.tsx:5347-5380`):
   ```tsx
   <div className="flex flex-wrap items-center gap-2">
     <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1.5 text-xs font-bold border border-slate-200/60">...</div>
     <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 text-xs font-bold border border-slate-200/60">...</div>
   </div>
   ```
4. **Employees View Department Headcount Legend Pills** (`src/App.tsx:6631-6652`):
   ```tsx
   <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
     {/* 5 department headcount pills */}
   </div>
   ```
5. **Shifts View Toolbar & Mode Switcher** (`src/App.tsx:7239-7340`):
   ```tsx
   <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold h-10 items-center shadow-inner">
     {(["plan", "actual", "both"] as const).map(mode => ...)}
   </div>
   ```
6. **Shift Legend Code Badges Scroll Container** (`src/App.tsx:7489-7515`):
   ```tsx
   <div className="overflow-x-auto pb-2">
     <div className="flex gap-2.5 min-w-[900px] select-none">
       {/* 11 Shift Code Badges: M8, A8, N8, M12, A12, N12, M16, N16, D, OND, O */}
     </div>
   </div>
   ```
   *Deficiency*: Lacks momentum scrolling (`-webkit-overflow-scrolling: touch`), edge scroll padding, and custom scrollbar hiding utilities.

### 1.4 Global CSS Utilities in `src/index.css`
- **File**: `src/index.css:1-76`
  - Defines global scrollbars at lines 11-25 (`::-webkit-scrollbar` width/height 6px).
  - Lacks `.no-scrollbar` utility class for clean cross-browser horizontal scroll without visual clutter.
  - Lacks explicit momentum scrolling and touch action utilities.

---

## 2. Logic Chain

```
[Observation 1.1: Static mt-28 p-8 on <main>]
  + [Observation 1.2: Fixed Navbar is 108px on Desktop, but 56-64px on Mobile/Tablet]
  --> (Step 1): Fixed Navbar height is breakpoint-dependent:
        - Mobile (<640px): ~56px-64px (compact header)
        - Tablet (640px-1023px): ~64px-80px
        - Desktop (>=1024px): ~108px (2 full rows)
  --> (Step 2): The <main> top margin must dynamically align with header height:
        - Mobile: mt-16 (64px)
        - Tablet: sm:mt-20 (80px)
        - Desktop: lg:mt-28 (112px)
        - Fullscreen: mt-0
  --> (Step 3): The <main> padding must preserve maximum screen real estate on mobile:
        - Mobile (375px): p-3 (leaves 351px usable width vs 311px with p-8)
        - Tablet (768px): sm:p-4 or md:p-6 (leaves 720px-736px usable width)
        - Desktop (>=1024px): lg:p-8 (maintains existing 100% desktop fidelity)
        - Fullscreen: p-3 sm:p-4 lg:p-6

[Observation 1.3: Sub-nav & filter pill containers using flex-wrap]
  + [Observation 1.4: Missing .no-scrollbar and touch scrolling CSS utilities]
  --> (Step 4): Wrapping pills vertically degrades mobile UX and consumes precious vertical space.
  --> (Step 5): Horizontal swipeable pill containers (`overflow-x-auto no-scrollbar whitespace-nowrap shrink-0`) allow smooth touch gestures on iOS & Android.
  --> (Step 6): Adding `-webkit-overflow-scrolling: touch`, `scroll-px-3`, and `.no-scrollbar` in `src/index.css` eliminates scrollbar clipping while ensuring smooth inertial scrolling.

[Desktop Invariants Check: PROJECT.md §Desktop Invariants & SCOPE.md §Scope Boundaries]
  --> (Step 7): On desktop viewports (>=1024px / lg), all layout classes resolve to `lg:mt-28` and `lg:p-8`.
  --> (Step 8): The right-hand 368px summary block (`w-[368px]`), OT payroll calculation engine, and 6 CSV exports remain 100% unaffected.
```

---

## 3. Implementation Proposal & Code Specifications

### 3.1 CSS Utility Additions to `src/index.css`
Add cross-browser scrollbar hiding, touch momentum scrolling, and scroll snap rules to `src/index.css`:

```css
/* Touch-friendly horizontal scroll & no-scrollbar utilities */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}

.touch-pan-x {
  touch-action: pan-x;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-x: contain;
}

.touch-pan-y {
  touch-action: pan-y;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-y: contain;
}
```

### 3.2 Responsive `<main>` Container Spacing in `src/App.tsx`
Replace line 4414 in `src/App.tsx`:

```tsx
// Before (Line 4414):
<main className={`flex-1 overflow-y-auto transition-all duration-300 ${isFullScreen ? "p-4" : "mt-28 p-8"}`}>

// After:
<main className={`flex-1 overflow-y-auto transition-all duration-300 ${
  isFullScreen 
    ? "mt-0 p-3 sm:p-4 lg:p-6" 
    : "mt-16 sm:mt-20 lg:mt-28 p-3 sm:p-4 lg:p-8"
}`}>
```

### 3.3 Fluid Horizontal Category Navigation Pills Specification

#### A. Navbar Category Pills Row (`src/components/Navbar.tsx:183-230`)
- **Container**:
  ```tsx
  <div className="hidden lg:flex bg-slate-100/70 px-8 py-2 items-center gap-3.5 overflow-x-auto no-scrollbar touch-pan-x border-t border-slate-200/80 shadow-inner">
  ```
- **Category Badge & Items**: Add `shrink-0` to avoid pill shrinking; preserve active indicators and collapsibility.

#### B. HR Editor Department Filter Tabs (`src/App.tsx:1195-1233`)
Transform from `flex flex-wrap` to horizontal swipeable pill bar:
```tsx
<div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/60 overflow-x-auto no-scrollbar touch-pan-x scroll-smooth scroll-px-2 max-w-full">
  {isHrOrFullAccess && (
    <button
      type="button"
      onClick={() => setFilterDept("all")}
      className={`shrink-0 whitespace-nowrap px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
        filterDept === "all"
          ? "bg-white text-blue-700 shadow-sm font-extrabold"
          : "text-slate-600 hover:text-slate-900"
      }`}
    >
      ทุกแผนก (ทั้งหมด)
    </button>
  )}

  {["INTER 2", "INTER 3", "INTER 5", "INTER 7", "Heavy Machine", "ECC"].map(dept => {
    const deptIdVal = normalizeDeptId(dept);
    const managerDeptId = normalizeDeptId(currentUser?.deptId);
    const isAllowed = isHrOrFullAccess || managerDeptId === deptIdVal;
    if (!isAllowed) return null;

    return (
      <button
        key={dept}
        type="button"
        onClick={() => setFilterDept(dept)}
        className={`shrink-0 whitespace-nowrap px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
          filterDept === dept
            ? "bg-blue-600 text-white shadow-sm font-extrabold"
            : "bg-transparent text-slate-600 hover:bg-white/60"
        }`}
      >
        แผนก {dept}
      </button>
    );
  })}
</div>
```

#### C. Dashboard Legend Toggle Pills (`src/App.tsx:4760-4805`)
```tsx
<div className="flex items-center gap-2 text-xs font-bold overflow-x-auto no-scrollbar touch-pan-x py-1 max-w-full">
  {/* Add shrink-0 whitespace-nowrap to each button */}
  <button ... className={`shrink-0 whitespace-nowrap flex items-center gap-2 px-3 py-1.5 rounded-full ...`}>...</button>
  <button ... className={`shrink-0 whitespace-nowrap flex items-center gap-2 px-3 py-1.5 rounded-full ...`}>...</button>
  <button ... className={`shrink-0 whitespace-nowrap flex items-center gap-2 px-3.5 py-1.5 rounded-xl ...`}>...</button>
</div>
```

#### D. Shift Mode Switcher & Sub-toolbar (`src/App.tsx:7303-7371`)
- Segmented mode switcher: `flex bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold h-10 items-center shadow-inner shrink-0`.
- Sub-toolbar selects row:
  ```tsx
  <div className="bg-slate-50/90 px-4 sm:px-6 py-2.5 flex items-center gap-2.5 border-b border-slate-200/80 overflow-x-auto no-scrollbar touch-pan-x">
    {/* Selects with shrink-0 */}
  </div>
  ```

#### E. Shift Legend Code Badges Container (`src/App.tsx:7489-7515`)
```tsx
<div className="overflow-x-auto no-scrollbar touch-pan-x pb-2 scroll-px-2">
  <div className="flex gap-2.5 min-w-[860px] select-none">
    {/* 11 Shift Code Badges */}
  </div>
</div>
```

---

## 4. Caveats
1. **Coordination with Explorer 1 (Navbar & Drawer)**:
   - Explorer 1 is designing the mobile header bar (`h-14` / `h-16`) and mobile drawer sheet. The main container top margin `mt-16 sm:mt-20 lg:mt-28` aligns with the header height of 56px–64px on mobile, 80px on tablet, and 108px on desktop.
2. **Coordination with Explorer 3 (Grid Re-stacking & View Wrappers)**:
   - Explorer 3 is designing the metrics cards responsive grids (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`) and view wrappers (`w-full overflow-x-hidden max-w-full min-w-0`). The padding `p-3 sm:p-4 lg:p-8` integrates with their container widths.
3. **No Caveats on Desktop Invariants**:
   - The desktop layout (>=1024px) retains `lg:mt-28` and `lg:p-8`, guaranteeing zero regressions for the 368px summary block, CSV exports, or calculation routines.

---

## 5. Conclusion
The responsive spacing strategy (`mt-16 sm:mt-20 lg:mt-28` and `p-3 sm:p-4 lg:p-8`) alongside touch-optimized horizontal navigation pills (`overflow-x-auto no-scrollbar touch-pan-x shrink-0 whitespace-nowrap`) eliminates header clipping and horizontal cutoff on mobile (375px) and tablet (768px) devices while preserving 100% desktop fidelity.

---

## 6. Verification Method
1. **Static Build Verification**:
   - Run `npm run build` to confirm zero TypeScript diagnostic errors or JSX syntax regressions.
2. **Viewport Spacing Inspection**:
   - At **375px (Mobile)**: Verify `<main>` has 64px top margin (`mt-16`) and 12px padding (`p-3`). Header does not clip banner/cards; usable width is ~351px.
   - At **768px (Tablet)**: Verify `<main>` has 80px top margin (`sm:mt-20`) and 16px padding (`sm:p-4`).
   - At **>=1024px (Desktop)**: Verify `<main>` has 112px top margin (`lg:mt-28`) and 32px padding (`lg:p-8`). Verify right-hand summary widget is exactly 368px (`w-[368px]`).
3. **Horizontal Pill Scrolling Touch Test**:
   - Inspect HR Editor department pills, Dashboard toggle pills, Shift Legend badges, and mode switchers on 375px viewport to ensure smooth horizontal swipe without multi-line wrapping or visible clipping.
