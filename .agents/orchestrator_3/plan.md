# Plan: Radical Minimalism Product Design Overhaul

## 1. Survey Phase
- Spawn 3 parallel Explorers:
  - `explorer_survey_ux`: Audit all 11 views, modals, top-5 user tasks, section count baseline, and micro-copy across all files.
  - `explorer_survey_design`: Audit design tokens, CSS/Tailwind configs, color palette usages, typography scales, spacing, borders, shadows, and component library.
  - `explorer_survey_tables_calc`: Audit all 10 data tables (frozen columns, mobile scrolling), calculation engines (OT, salary, plan/actual diff), tests, and build status.
- Synthesize survey findings into `PROJECT.md` with full Feature Inventory and interface contracts.

## 2. E2E Testing Track
- Spawn E2E Testing Orchestrator / Test Writers to create/verify automated tests for:
  - Tier 1: Feature Coverage (all views, forms, modals, actions)
  - Tier 2: Boundary & Corner Cases (extremes, empty states, huge rosters)
  - Tier 3: Cross-Feature Combinations (filters + export, editing shifts + recalculations)
  - Tier 4: Real-World Scenarios (full shift cycle, compliance breach detection)
  - Publish `TEST_READY.md`.

## 3. Implementation Milestones
- **Milestone 1**: Design System Tokens, CSS Architecture & Minimalist Base Component Library
  - Palette alignment, Typography scale (max 3 font sizes, max 3 font weights), 8pt grid, hairline borders (`1px solid #DCE4EA`), no heavy shadows, no gradient containers.
  - Reusable minimalist primitives: Button, Card, Modal, Input/Select, Badge/Tag, KPITile, Table.
- **Milestone 2**: Navigation, App Shell, Global Layout & Top-5 Tasks Friction Reduction
  - Simplified Navbar, breadcrumbs, unified filter bars, quick-action flows, notification center.
  - Interactive click reduction for top-5 tasks.
- **Milestone 3**: 11 Views Radical Minimalist Overhaul & Micro-Copy Ruthless Brevity
  - Overhaul: Dashboard, Shift Matrix, Roster, Timesheet, Analytics, Leave, Overtime, Vessels, Compliance, Settings, Export/Import.
  - Strip decorative clutter, reduce section count by >=20% per view, enforce micro-copy rules (buttons <=4 words, headers <=6 words, placeholders <5 words).
- **Milestone 4**: 10 Data Tables Frozen Columns & Responsive Viewport Layouts
  - Hairline separators, generous row padding, frozen sticky headers & columns, mobile/tablet horizontal scroll & viewport optimization.
- **Milestone 5**: Full Integration, Calculation Integrity & E2E Test Suite Validation
  - Verify calculation invariance, run all test tiers (Tiers 1-5), audit forensic integrity, ensure clean `npm run build`.

## 4. Verification & Gate Enforcement
- Explorer -> Worker -> Reviewer -> Challenger -> Forensic Auditor cycle for each milestone.
- Pass 100% of E2E tests, zero integrity violations, clean build.
