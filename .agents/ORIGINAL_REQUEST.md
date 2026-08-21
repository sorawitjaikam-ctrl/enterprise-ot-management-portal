# Original User Request

## 2026-08-22T00:01:08+07:00

Enhance the Enterprise OT Management Portal with comprehensive Mobile & Tablet responsive UI/UX and Progressive Web App (PWA) capabilities for on-site port supervisors and field operators.

Working directory: C:\Users\ssrwj\Documents\antigravity\mysterious-einstein
Integrity mode: development

## Requirements

### R1. Mobile & Tablet Responsive Layout Adaptation
Ensure the entire web application (Navbar, Shift Scheduler, Analytics Dashboards, Employee Roster, and Modals) dynamically adapts across mobile (375px–430px) and tablet (768px–1024px) viewports with touch-friendly spacing and fluid navigation.

### R2. Touch-Optimized Table Panning & Sticky Frozen Columns
Preserve sticky left identity columns and sticky headers in the Shift Scheduler and Roster List during horizontal touch gestures on small screens, allowing smooth horizontal scrolling without layout distortion.

### R3. Progressive Web App (PWA) & Offline Shell Support
Provide a standards-compliant Web App Manifest, mobile viewport configurations, app icons, and Service Worker caching for fast launch and installability ("Add to Home Screen") on field devices.

### R4. Touch-Friendly Controls & Modal Experience
Ensure all interactive buttons, shift pickers, filters, and modal dialogues conform to mobile touch ergonomics (minimum 44x44px tap targets) with easy dismiss actions.

## Acceptance Criteria

### Responsive Layout & Viewports
- [ ] Application header, sidebar/navbar, and metrics cards re-stack neatly on tablet and mobile viewports without horizontal clipping.
- [ ] Shift scheduling matrix and employee roster table support touch scrolling with pinned sticky columns remaining readable.

### PWA & Installation
- [ ] Web App Manifest is correctly linked with appropriate metadata, theme color, display standalone mode, and icons.
- [ ] Service worker initializes properly and serves cached app shell assets for reliable on-field loading.

### Desktop & Feature Integrity
- [ ] Desktop layout, 368px aligned summary widgets, Plan/Actual/Diff calculations, and CSV exports remain 100% functional without regressions.
- [ ] `npm run build` compiles cleanly with zero TypeScript and build errors.
