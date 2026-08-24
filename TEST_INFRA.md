# E2E Test Infra: Enterprise OT Management Portal

## Test Philosophy
- Opaque-box, requirement-driven. No dependency on implementation design.
- Methodology: Category-Partition + BVA + Pairwise + Real-World Workload Testing.
- Target: 100% test pass rate with 0 TypeScript and 0 Vite bundle errors.

## Feature Inventory & Test Mapping
| # | Feature | Source | Tier 1 (Coverage) | Tier 2 (Boundary) | Tier 3 (Cross-Feature) | Tier 4 (Real-World) |
|---|---------|--------|:-----------------:|:-----------------:|:---------------------:|:-------------------:|
| 1 | 4-Tone Monochromatic Blue Palette | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ | ✓ |
| 2 | Minimalist Industrial Layout & Zero Clutter | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ | ✓ |
| 3 | 100% Emoji Elimination | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ | ✓ |
| 4 | Lucide Iconography & Text Fallbacks | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ | ✓ |
| 5 | Dynamic 24H Shift Engine (M1..M24, A, N, D, OND, OFF) | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ | ✓ |
| 6 | Shift Matrix Grid (Click, Sticky, Both View, Filters) | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ | ✓ |
| 7 | Labor Law Compliance & Notification Bell | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ | ✓ |
| 8 | Vessel & Crane Operational Schedule | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ | ✓ |
| 9 | Executive Analytics & OT Cost Formulas | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ | ✓ |
| 10 | CSV Hub & Data Export/Import | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ | ✓ |

## Test Architecture
- Test runner: Vitest (`npx vitest run`) + Vite Build (`npm run build`) + TypeScript (`npm run lint`).
- Test suite structure:
  - `tests/tier1-shifts/`: Shift calculations, time formulas, overnight splits.
  - `tests/tier2-responsive/`: Responsive layouts, sticky columns, touch targets, navbar actions.
  - `tests/tier3-compliance/`: Labor compliance rule enforcement (7-day OT, consecutive days, rest interval).
  - `tests/tier4-workflows/`: End-to-end full portal workflows, summary invariants (e.g. 368px summary block), CSV exports.
  - `tests/tier5-adversarial/`: Stress testing, adversarial shift transitions, circadian density limits.

## Coverage Thresholds
- Tier 1: >= 5 tests per feature
- Tier 2: >= 5 tests per feature
- Tier 3: Pairwise combination coverage
- Tier 4: >= 5 realistic workflow application scenarios
- Tier 5: Adversarial white-box edge tests
- Final criteria: 100% test pass rate + 0 compiler errors.
