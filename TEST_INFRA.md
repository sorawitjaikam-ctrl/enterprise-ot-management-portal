# E2E Test Infra: Enterprise OT Management Portal

## Test Philosophy
- Opaque-box, requirement-driven. No dependency on implementation design.
- Methodology: Category-Partition + Boundary Value Analysis (BVA) + Pairwise Combinatorial Testing + Real-World Workload Testing.

## Feature Inventory & Test Mapping
| # | Feature | Source (requirement) | Tier 1 (Calc & Data) | Tier 2 (Responsive & Tables) | Tier 3 (PWA) | Tier 4 (Workflows) |
|---|---------|---------------------|:--------------------:|:----------------------------:|:------------:|:------------------:|
| 1 | Web App Manifest | ORIGINAL_REQUEST §R3 | - | - | 6 | - |
| 2 | HTML Meta Tags & Icons | ORIGINAL_REQUEST §R3 | - | - | 5 | - |
| 3 | Service Worker & Offline Caching | ORIGINAL_REQUEST §R3 | - | - | 10 | - |
| 4 | Client SW Lifecycle & Hook | ORIGINAL_REQUEST §R3 | - | - | 5 | - |
| 5 | Mobile 375px Viewport & Spacing | ORIGINAL_REQUEST §R1 | - | 5 | - | - |
| 6 | Tablet 768px Viewport & Grids | ORIGINAL_REQUEST §R1 | - | 5 | - | - |
| 7 | Mobile Nav Drawer & 11 Views | ORIGINAL_REQUEST §R1 | - | 5 | - | 5 |
| 8 | Shift Matrix Sticky Columns & Panning | ORIGINAL_REQUEST §R2 | - | 4 | - | 5 |
| 9 | Employee Roster Adaptive Columns | ORIGINAL_REQUEST §R2 | - | 4 | - | 5 |
| 10 | Touch Ergonomics (44px/48px) | ORIGINAL_REQUEST §R1 | - | 4 | - | - |
| 11 | Shift OT Hours Calculation | ORIGINAL_REQUEST §R4 | 7 | - | - | - |
| 12 | Monthly Payroll Breakdown | ORIGINAL_REQUEST §R4 | 7 | - | - | - |
| 13 | Plan vs Actual Diff Engine | ORIGINAL_REQUEST §R4 | 6 | - | - | 5 |
| 14 | Department 150k Budget Engine | ORIGINAL_REQUEST §R4 | 6 | - | - | - |
| 15 | 6 CSV Exports & Template Hub | ORIGINAL_REQUEST §R4 | 6 | - | - | 5 |
| 16 | 19 Modals Lifecycle & Scroll | ORIGINAL_REQUEST §R1 | - | - | - | 5 |
| 17 | Desktop 368px Summary Invariant | ORIGINAL_REQUEST §R2 | - | - | - | 5 |

## Test Architecture
- **Test Runner**: Vitest v4.1.11 with JSDOM environment, polyfills in `tests/setup.ts`.
- **Test Suites Structure**:
  - `tests/tier1-calculations/`: Unit & mathematical formula verification.
  - `tests/tier2-responsive/`: Viewport simulation (375px, 768px, 1024px), sticky tables, touch targets.
  - `tests/tier3-pwa/`: Manifest schema, HTML meta, Service worker, offline mock, install hook.
  - `tests/tier4-workflows/`: End-to-end user workflows, 19 modals, 368px desktop invariant.
  - `scripts/`: Standalone scripts (`verify-pwa.mjs`, `challenge-m1-pwa.mjs`, `challenger-sw-stress.mjs`).

## Acceptance Thresholds
- **Tier 1**: 32/32 tests pass (100%).
- **Tier 2**: 35+/35+ tests pass (100%).
- **Tier 3**: 46/46 tests pass (100%).
- **Tier 4**: 25/25 tests pass (100%).
- **Build**: `npm run build` zero TypeScript errors, clean bundle.
- **Integrity**: Clean Forensic Audit verdict with zero fabricated or hardcoded results.
