# Project: Enterprise OT Management Portal Overhaul

## Architecture
- **Framework & Bundler**: React 18 + TypeScript + Vite + Tailwind CSS v4.
- **Backend & Persistence**: Node.js + Express (`server.ts`) with Cloudflare D1 integration and local fallback simulation (`db.json`).
- **Design System & Palette**: Monochromatic 4-tone industrial blue:
  - Deep Navy Blue (`#0b1a3a` / primary dark & headers)
  - Royal Cobalt Blue (`#1d3ec7` / active accents & primary actions)
  - Soft Cornflower Blue (`#6d93fc` / secondary accents & highlights)
  - Light Ice Blue (`#a9cdfc` / subtle backgrounds, borders & pill badges)
  - Crisp white (`#ffffff`) and neutral minimalist grays (`#f8fafc` / `#e2e8f0`).
- **Iconography**: 100% Lucide React SVG vector icons (Zero Emojis).
- **Core Modules**:
  - `src/App.tsx`: Central portal views (Dashboard, Shift Matrix, Crew Roster, Job Value, Reports, HR Editor, OT Records, Leave Records, Settings, Admin Permissions, User Profile) and modals.
  - `src/components/Navbar.tsx`: Executive navigation bar with touch-ergonomic actions, notification drawer, and language switch.
  - `src/components/PremiumShiftTimePickerModal.tsx`: Dynamic 24h shift time scheduler with 1..24h calculation, overnight handling, and drag/preset interactions.
  - `src/components/ShiftRadialPicker.tsx`: Fast radial shift selection modal.
  - `src/components/CircadianTimelineModal.tsx`: 24h circadian workload & staffing density visualizer.
  - `src/components/CsvTemplateHubModal.tsx`: RFC 4180 CSV export and template generation hub.
  - `src/utils/shiftRecommendation.ts`: Shift definitions, auto-pairing algorithms, rotating schedule generator, and labor law compliance auditing.
  - `src/utils/costSimulationEngine.ts`: OT salary formulas, department budget ceiling, and cost simulation.
  - `src/utils/circadianEngine.ts`: 24h time-segment splitting, circadian fatigue indexes, and staffing gap detectors.

## Code Layout
- `src/`: Core application source code
  - `src/components/`: Reusable modular components and overlays
  - `src/utils/`: Calculation engines, validators, export generators
  - `src/index.css`: Global styles, Tailwind v4 directives, custom utility classes
- `server.ts`: Backend API and persistence server
- `tests/`: Automated test suite (34 test files, 273 tests)
  - `tests/tier1-shifts/`: Shift computation unit tests
  - `tests/tier2-responsive/`: Responsive UI and touch target tests
  - `tests/tier3-compliance/`: Labor compliance rule tests
  - `tests/tier4-workflows/`: End-to-end user workflows
  - `tests/tier5-adversarial/`: Stress testing, edge cases, and adversarial oracles

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | 4-Tone Blue Palette & Minimalist Aesthetic | Refactor global styles and theme to strictly use #0b1a3a, #1d3ec7, #6d93fc, #a9cdfc | M1 | ORIGINAL_REQUEST §R1 |
| 2 | Executive Typography & Hairline Borders | Clean hairline borders, generous spacing, high contrast typography | M1 | ORIGINAL_REQUEST §R1 |
| 3 | 100% Codebase Emoji Elimination | Eliminate all emojis across all UI, tooltips, toasts, modals, options | M2 | ORIGINAL_REQUEST §R2 |
| 4 | Lucide Iconography Standardization | Replace emoji glyphs with crisp Lucide React SVG vector icons | M2 | ORIGINAL_REQUEST §R2 |
| 5 | Navbar Notification Title Fix | Fix `Navbar.tsx:263` title to `การแจ้งเตือน` to resolve failing tests | M3 | survey report 3 |
| 6 | 24H Dynamic Shift Calculation Engine | Dynamic 1..24h shifts (M1..M24, A1..A24, N1..N24, D, OND, OFF, 24h 08:00-08:00, overnight 20:00-08:00) | M3 | ORIGINAL_REQUEST §R3 |
| 7 | Shift Matrix Interaction Engine | Cell clicks, tooltip previews, sticky columns/headers, Plan/Actual/Both toggle | M3 | ORIGINAL_REQUEST §R3 |
| 8 | Labor Law Compliance & Bell Notifications | Rolling 7-day <=36h OT limit, <=6 consecutive workdays, rest >=11h, notification dropdown | M4 | ORIGINAL_REQUEST §R3 |
| 9 | Vessel & Crane Schedule Timeline | Plan vs Actual vessel timeline, tonnage calculation, crane deployment | M4 | ORIGINAL_REQUEST §R3 |
| 10 | Executive Analytics & OT Costing | OT salary breakdown (1.5x, 3.0x), department budget tracking, KPI cards | M4 | ORIGINAL_REQUEST §R3 |
| 11 | CSV Hub & Data Export/Import | 5 standardized RFC 4180 CSV export templates with UTF-8 BOM | M4 | ORIGINAL_REQUEST §R3 |
| 12 | Opaque-Box E2E Testing Suite (Tiers 1-4) | Comprehensive requirement-driven test verification across all features | M5 | ORIGINAL_REQUEST §R4 |
| 13 | Adversarial Coverage Hardening (Tier 5) | White-box stress tests, boundary conditions, edge cases | M5 | Project Orchestration Pattern |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Design System & 4-Tone Blue Palette | `src/index.css`, Tailwind styling, UI theme overhaul | none | DONE |
| M2 | 100% Emoji Elimination & Icon Standardization | All views, modals, toasts, tooltips, dropdowns, tests | M1 | DONE |
| M3 | 24H Shift Engine & Matrix Interaction | `PremiumShiftTimePickerModal.tsx`, `Navbar.tsx`, `App.tsx` matrix | M1, M2 | DONE |
| M4 | Compliance, Vessel, Analytics & CSV Modules | `shiftRecommendation.ts`, `costSimulationEngine.ts`, `CsvTemplateHubModal.tsx` | M3 | DONE |
| M5 | E2E Test Pass & Adversarial Hardening | Full test suite execution (Tiers 1-5, 273/273 pass), 0 TS/bundle errors | M4 | DONE |

## Verification Summary
- `npm run lint` (`tsc --noEmit`): 0 TypeScript errors (Exit code 0).
- `npm run build`: Production bundle built in 3.48s with 0 errors (Exit code 0).
- `npm test`: 34 test files, 273/273 tests passing (100% pass rate, Exit code 0).
- Emoji scan: 0 emojis across all source files, public files, server, and templates.
- Forensic integrity: CLEAN verdict, zero hardcoded facades.
