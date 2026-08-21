# Scope: Milestone 2 — Responsive App Shell, Navigation & Layout Adaptation

## Mission
Implement responsive app shell, mobile navigation drawer, fluid category pills, responsive main container margins/padding, and metrics cards re-stacking across mobile (375px–430px), tablet (768px–1024px), and desktop (>=1024px).

## Scope Boundaries & Write Ownership
- **Exclusive Write Ownership**:
  - `src/components/Navbar.tsx`
  - `src/components/Sidebar.tsx`
  - `src/App.tsx` (top navbar props/integration, main layout wrapper, metrics cards grid wrappers)
- **Do NOT touch**:
  - Calculation engine (`getEmpMonthlyOtPayBreakdown`, hourly rate math)
  - 6 CSV Export routines
  - Desktop 368px summary block invariants
  - Modals and detailed shift tables (deferred to M3/M4)
  - PWA manifest / sw files (owned by M1)

## Key Features in Milestone 2
1. **Top Header / Navbar responsive adaptation**:
   - Desktop: Full enterprise navbar with search, status indicators, action buttons, quick navigation.
   - Tablet/Mobile: Compact brand header with responsive search/filter collapsing and hamburger toggle button.
2. **Mobile Navigation Drawer / Sheet**:
   - Collapsible drawer / mobile menu with smooth transition to switch seamlessly between all 11 functional views (`dashboard`, `scheduler`, `roster`, `analytics`, `vessels`, `reports`, `departments`, `logs`, `job-values`, `rules`, `leaves`).
   - Active view highlights, category grouping, and touch-friendly tap targets (min 44x44px).
   - Auto-close on selection and overlay click.
3. **Fluid Horizontal Category Navigation Pills**:
   - Touch-scrollable category tabs with active tab indicators and no horizontal overflow/scrollbar clipping.
4. **Responsive Main Container Margins and Paddings**:
   - Header-aware dynamic spacing (`mt-16 sm:mt-20 lg:mt-28` or appropriate fluid spacing, `p-2 sm:p-4 lg:p-8`) preventing header clipping and content obstruction across mobile, tablet, and desktop.
5. **Metrics Cards Responsive Grid Re-stacking**:
   - Grid layout re-stacking from 1 column (mobile: `<640px`) to 2 columns (tablet: `640px–1023px`) to 4 columns (desktop: `>=1024px`) without clipping or horizontal scrollbars.
6. **Responsive Container Adaptations for 11 Functional Views**:
   - Outer container responsiveness across all views in `App.tsx` ensuring no overflow or layout distortion.
