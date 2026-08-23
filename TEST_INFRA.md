# E2E Test Infra: Enterprise OT Management Portal Redesign & Scheduling Engine

## Test Philosophy
- Requirement-driven, opaque-box & white-box multi-tier verification.
- 100% test pass rate across unit calculations, interaction workflows, responsive design, and stress tests.
- Zero TypeScript compile errors (`tsc --noEmit`) and clean production build (`npm run build`).

## Feature Inventory & Test Coverage Mapping
| # | Feature | Requirement | Tier 1 (Unit) | Tier 2 (Responsive) | Tier 3 (PWA/Infra) | Tier 4 (Workflows) | Tier 5 (Adversarial) |
|---|---------|-------------|:-------------:|:-------------------:|:------------------:|:------------------:|:--------------------:|
| 1 | Maritime Cockpit UI & 11 Views | ORIGINAL_REQUEST §R1 | - | ✓ | - | ✓ | ✓ |
| 2 | Drag-to-Paint & Range Selection | ORIGINAL_REQUEST §R2 | - | ✓ | - | ✓ | ✓ |
| 3 | Keyboard Hotkeys & Navigation | ORIGINAL_REQUEST §R2 | - | - | - | ✓ | ✓ |
| 4 | Radial / Speed-Dial Quick Picker | ORIGINAL_REQUEST §R2 | - | - | - | ✓ | ✓ |
| 5 | Drag-and-Drop Shift Swap | ORIGINAL_REQUEST §R2 | - | - | - | ✓ | ✓ |
| 6 | 24-Hour Continuous Timeline / Gantt | ORIGINAL_REQUEST §R3 | ✓ | ✓ | - | ✓ | ✓ |
| 7 | Live Overtime & Cost Simulation | ORIGINAL_REQUEST §R3 | ✓ | - | - | ✓ | ✓ |
| 8 | Calculation Engines & 6 CSV Exports | Baseline & ORIGINAL_REQUEST | ✓ | - | - | ✓ | ✓ |
| 9 | PWA & Offline Support | Baseline & ORIGINAL_REQUEST | - | - | ✓ | - | ✓ |

## Test Directory Architecture
- `tests/tier1-calculations/`:
  - `circadian-engine.test.ts`: 24-hour shift splits, midnight segment handling, and hourly density.
  - `cost-simulation-engine.test.ts`: Delta OT hours, monetary cost impact, 150k limit, and weekly compliance.
  - `shift-ot-hours.test.ts`, `payroll-breakdown.test.ts`, `budget-utilization.test.ts`, `plan-actual-diff.test.ts`, `csv-exports.test.ts`, `smart-shift-recommendations.test.ts`.
- `tests/tier2-responsive/`:
  - Viewport tests (375px mobile, 768px tablet, 1024px+ desktop), sticky table columns, touch panning.
- `tests/tier3-pwa/`:
  - Manifest validation, service worker caching, and offline state handling.
- `tests/tier4-workflows/`:
  - `interactive-shift-engine-workflows.test.tsx`: Drag-to-paint, hotkey entries, radial picker, and shift swapping workflows.
  - `circadian-timeline-workflows.test.tsx`: 24-hour visualizer and live simulation HUD workflows.
  - `supervisor-shift-workflow.test.tsx`, `employee-roster-workflow.test.tsx`, `modal-lifecycle-workflows.test.tsx`, `desktop-368px-invariants.test.tsx`, `csv-template-hub-workflow.test.tsx`.
