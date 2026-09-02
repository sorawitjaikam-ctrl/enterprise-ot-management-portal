# Project: Radical Minimalism Product Design Overhaul

## Architecture
- **Framework**: React 18, Vite, TypeScript, Tailwind CSS, Lucide React Icons.
- **Backend & State**: Cloudflare D1 / SQLite backend API via `server.ts`, React local & cached app state (`AppState`).
- **Core Modules**:
  - `src/index.css` & `tailwind.config.js`: Global design tokens, strict 12-token maritime palette, typography scales, hairline borders (`1px solid #DCE4EA`), 8pt grid spacing.
  - `src/components/Navbar.tsx` & Navigation: Executive minimal header, folder-tabs navigation, notification bell, user profile menu.
  - `src/components/`: Minimalist reusable component system (`Button`, `Card`, `KPITile`, `Modal`, `Table`, `Badge/Tag`, `Input`, `PremiumShiftTimePickerModal`, `CircadianTimelineModal`, `ShiftRadialPicker`, `LiveSimulationHUD`, `CsvTemplateHubModal`).
  - `src/App.tsx`: 11 core portal views (Dashboard, Job Value, Reports, Employees, Shifts, HR Editor, OT Records, Leave Records, Settings, Admin Permissions, Profile).
  - `src/utils/`: High-precision calculation engines (`costSimulationEngine.ts`, `shiftRecommendation.ts`, `circadianEngine.ts`).
  - `tests/`: Automated test suites (40 files, 313 test cases across Tiers 1 through 5).

## Feature Inventory
| # | Feature | Description | Milestone | Source | Status |
|---|---------|-------------|-----------|--------|--------|
| 1 | Strict Monochromatic Maritime Palette | Enforce Navy `#0E3A66`, Supporting Blues `#17538F`, `#2E90CB`, `#9FCEE8`, `#E8F3FA`, Semantic Accents `#1E9C6E`, `#D99B14`, `#B3352C`, Neutrals `#333B41`..`#FFFFFF`; purged 250+ rogue hex codes | M1 | Survey | DONE |
| 2 | Typography Scale & Baseline Grid | Sans-serif only, max 3 font sizes and max 3 font weights (400, 500, 700) per view, 8pt grid alignment | M1 | Survey | DONE |
| 3 | Surface Elevation & Hairline Borders | Eliminated all gradients (`bg-gradient-*`), heavy box shadows (`shadow-2xl`, `shadow-xl`), enforced flat surfaces & hairline borders (`1px solid #DCE4EA`) | M1 | Survey | DONE |
| 4 | Iconography & Decorative Noise Purge | 0 emoji, removed Google Material Symbols, eliminated pulsing dots and sparkline decorations, functional Lucide vector icons only | M1 | Survey | DONE |
| 5 | Sub-Module Minimalist Theming | Restyled `CircadianTimelineModal`, `ShiftRadialPicker`, `LiveSimulationHUD`, `CsvTemplateHubModal` to clean white/navy minimal design | M1 | Survey | DONE |
| 6 | Top-5 Tasks Click-Friction Reduction | Reduced clicks by 50%–75% for (1) assign shift, (2) view OT summary, (3) filter department, (4) export CSV, (5) check compliance alerts | M2 | Survey | DONE |
| 7 | Navigation & App Shell Consolidation | Streamlined `Navbar.tsx`, unified filter toolbars, quick action triggers, removed unused `Sidebar.tsx` imports | M2 | Survey | DONE |
| 8 | View Section Count Reduction (>=20%) | Consolidated duplicate headers/panels across all 11 views, reducing total sections from 46 to 29 (-37.6%) | M3 | Survey | DONE |
| 9 | Micro-Copy Ruthless Brevity | Button labels <=4 words, section headers <=6 words, placeholders <5 words, eliminated redundant explanatory subtitles | M3 | Survey | DONE |
| 10 | Settings & Admin Deduplication | Removed redundant duplicate user accounts table in Settings View (keeping canonical table in Admin Permissions) | M3 | Survey | DONE |
| 11 | 10 Data Tables Hairline & Row Padding | Uniform table headers, hairline separators (`divide-[#DCE4EA]`), generous row padding across all 10 tables | M4 | Survey | DONE |
| 12 | Sticky/Frozen Columns on Mobile/Tablet | Frozen employee ID/name columns, horizontal touch scroll (`touch-pan-x`), responsive layout across 375px–1440px+ | M4 | Survey | DONE |
| 13 | Calculation Engine Invariance | Verified 100% mathematical integrity for OT formulas ($\text{hourlyRate} = \text{salary} / 240$, 1.5x, 3.0x, 1.0x), 36h limit, 6-day fatigue, 24h/overnight shifts | M5 | Survey | DONE |
| 14 | Build Integrity & 100% E2E Suite Pass | `npm run build` compiles with 0 errors, `npm run lint` passes with 0 errors, 100% E2E test suites pass (313/313 tests) | M5 | Survey | DONE |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| E2E | E2E Testing Track | Independent Opaque-Box Test Suite for Radical Minimalism (Tiers 1–4) & `TEST_READY.md` | none | DONE |
| M1 | Design System & Minimal Components | Global CSS, Palette Tokens, Hairline Borders, Typography Scale, Icon Cleanup, Component Primitives & Modal Theming | none | DONE |
| M2 | Navigation, Shell & Task Friction Reduction | Navbar, Filter Bars, Top-5 Task 1-2 Click Flows, Shell Consolidations | M1 | DONE |
| M3 | 11 Views Overhaul & Ruthless Brevity | All 11 Views Visual Overhaul, >=20% Section Reduction, Micro-Copy Brevity, Eliminating Noise | M1, M2 | DONE |
| M4 | 10 Data Tables Frozen Columns & Responsiveness | Table Styling, Frozen Columns, Mobile/Tablet Viewports, Touch-Pan Scrolling | M1, M3 | DONE |
| M5 | Full Integration, Calculation Precision & E2E Pass | Calculation Invariance Validation, 100% E2E Test Suite Execution, Forensic Integrity Audit, Clean Build Verification | M1, M2, M3, M4, E2E | DONE |

## Interface Contracts
- All global design tokens, calculation engine formulas, and responsive frozen column layouts are verified and active.
