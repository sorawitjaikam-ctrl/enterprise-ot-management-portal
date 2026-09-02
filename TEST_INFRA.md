# Test Infrastructure & Automated Verification Framework

## Architecture Overview
The Enterprise OT Management Portal features a comprehensive, multi-tiered automated test harness designed to guarantee 100% mathematical calculation invariance, strict Radical Minimalism design system token compliance, viewport ergonomics across mobile/tablet/desktop, and flawless lifecycle workflows.

```
tests/
├── setup.ts                                        # Global mocks, DOM polyfills (matchMedia, ResizeObserver, fetch)
├── mocks/
│   ├── mockData.ts                                 # Canonical test fixtures (employees, departments, shifts, vessels)
│   └── mockServiceWorker.ts                        # PWA ServiceWorker & CacheStorage mocks
├── tier1-calculations/                             # Calculation engines & design system token audit
│   ├── radical-minimalism-design-tokens.test.ts    # Palette, hairline borders, font rules, 0 emojis, micro-copy brevity
│   ├── shift-ot-hours.test.ts                      # 1..24h shifts, M/A/N prefixes, dynamic OT formulas
│   ├── cost-simulation-engine.test.ts              # Live paint simulation & hourly rate (salary/240)
│   ├── smart-shift-recommendations.test.ts         # Compliance rules (36h limit, rest periods, 6-day fatigue)
│   ├── budget-utilization.test.ts                  # Department budget ceiling calculations & pacing
│   ├── payroll-breakdown.test.ts                   # Monthly breakdown invariance (normal 1.5x, holiday 3.0x, OND)
│   ├── plan-actual-diff.test.ts                    # Plan vs Actual variance delta & variance badges
│   ├── circadian-engine.test.ts                    # Hourly headcount density & circadian fatigue bands
│   ├── csv-exports.test.ts                         # CSV template serialization & BOM generation
│   ├── challenger2-shift-engine-comprehensive-stress.test.ts # Deep shift engine & summary container stress
│   └── challenger2-r3-adversarial-stress.test.ts   # Boundary salary & rate stress vectors
├── tier2-responsive/                               # Viewport responsiveness & sticky layout invariants
│   ├── radical-minimalism-boundary-stress.test.tsx # Empty datasets, 100+ emp large rosters, 375/768/1440px viewports
│   ├── mobile-375px-layout.test.tsx                # iPhone SE (375px) drawer & compact header controls
│   ├── tablet-768px-layout.test.tsx                # iPad (768px) metrics grids & navigation bar
│   ├── shift-matrix-sticky.test.tsx                # Sticky worker column (left-0, z-10, w-56)
│   ├── roster-adaptive-columns.test.tsx            # Employee roster frozen column & touch horizontal scroll
│   ├── touch-ergonomics-44px.test.tsx              # Interactive tap targets and folder tabs navigation
│   ├── challenger1-deep-viewport-stress.test.tsx   # Multi-device rendering & modal touch ergonomics
│   ├── challenger2-navigation-invariants.test.tsx  # 11 views navigation routing & role-based filtering
│   └── challenger-m2-responsive-stress.test.tsx    # 10 device profiles stress & drawer state mechanics
├── tier3-pwa/                                      # PWA offline shell & manifest schemas
│   ├── manifest-schema.test.ts                     # W3C Web App Manifest compliance
│   ├── html-meta-tags.test.ts                      # Theme color (#0E3A66), iOS status bar, viewport-fit=cover
│   ├── service-worker-lifecycle.test.ts            # SW registration, skipWaiting, and lifecycle events
│   ├── offline-caching-strategy.test.ts            # App shell caching & Cache-First routing
│   ├── pwa-install-prompt.test.tsx                 # beforeinstallprompt capture & installation banners
│   └── challenger-m1-pwa-stress.test.tsx           # PWA standalone mode & asset binary existence
├── tier4-workflows/                                # Full user journeys & cross-feature integrations
│   ├── radical-minimalism-cross-features.test.tsx  # Dept filter + CSV export, shift modal + OT recalculation
│   ├── radical-minimalism-labor-law-lifecycle.test.ts # 31-day scheduling lifecycle, 36h OT limit, 6-day fatigue
│   ├── supervisor-shift-workflow.test.tsx          # Shift scheduler navigation, Plan/Actual toggle, dept switch
│   ├── employee-roster-workflow.test.tsx           # Employee search, multi-filter by dept/role, roster KPI
│   ├── csv-template-hub-workflow.test.tsx          # 5 standard CSV template multi-file download workflow
│   ├── modal-lifecycle-workflows.test.tsx          # 19 modals lifecycle, touch dismiss & backdrop blur
│   ├── interactive-shift-engine-workflows.test.tsx # Paint brush mode, undo/redo stack, hotkey navigation
│   ├── circadian-timeline-workflows.test.tsx       # 24H Gantt timeline modal & day/night band telemetry
│   ├── desktop-368px-invariants.test.tsx           # Exact 368px summary header container decomposition
│   ├── challenger2-shift-modal-deep-stress.test.tsx# 24H scheduler modal multi-day selection & steppers
│   └── challenger2-r3-modal-stress.test.tsx        # Circadian Gantt telemetry cards & role filtering
└── tier5-adversarial/                              # Multi-dimensional interaction stress
    └── shift-engine-stress.test.tsx                # 2D batch painting, reverse drag, hotkey cycles, shift swap
```

## Test Tiers & Execution Commands

| Tier | Focus | Test Command |
|---|---|---|
| **Tier 1** | Calculations, OT Invariance & Design Tokens | `npx vitest run tests/tier1-calculations` |
| **Tier 2** | Responsive Viewports & Sticky Columns | `npx vitest run tests/tier2-responsive` |
| **Tier 3** | PWA, Offline Caching & Meta Tags | `npx vitest run tests/tier3-pwa` |
| **Tier 4** | Workflows, Cross-Feature & Labor Law Lifecycle | `npx vitest run tests/tier4-workflows` |
| **Tier 5** | Adversarial Grid & Drag-Drop Stress | `npx vitest run tests/tier5-adversarial` |
| **Full Suite** | Complete Automated Verification (38 files, 293 tests) | `npm test` or `npx vitest run` |

## Acceptance Criteria Thresholds & Standards

1. **Strict Monochromatic Maritime Palette**:
   - Primary: `#0E3A66` (Navy)
   - Supporting Blues: `#17538F`, `#2E90CB`, `#9FCEE8`, `#E8F3FA`
   - Semantic Accents: `#1E9C6E` (Green), `#D99B14` (Yellow), `#B3352C` (Red)
   - Neutrals: `#333B41`, `#59656D`, `#6A7B87`, `#B4C1C9`, `#DCE4EA`, `#F3F6F8`, `#FFFFFF`
   - Zero rainbow colors.

2. **Typography Hierarchy**:
   - Sans-serif only (`font-sans`, Inter).
   - Maximum 3 font sizes per view (`text-xs`, `text-sm`, `text-lg` or `text-2xl` for KPI).
   - Maximum 3 font weights per view (400 `font-normal`, 500 `font-medium`, 700 `font-bold`).

3. **Surfaces & Elevation**:
   - Hairline borders: `1px solid #DCE4EA` (`border-[#DCE4EA]`).
   - Zero heavy box shadows (`shadow-2xl`, `shadow-xl`).
   - Zero gradient container backgrounds (`bg-gradient-*`).

4. **Zero-Emoji Enforcement**:
   - 0 emojis exist anywhere across 100% of frontend code, labels, tooltips, notifications, and export templates.
   - Clean Lucide React vector SVG icons used exclusively.

5. **Micro-Copy Ruthless Brevity**:
   - Button labels $\le 4$ words.
   - Section headers $\le 6$ words.
   - Input placeholders $< 5$ words.
   - Removal of redundant explanatory helper paragraphs.

6. **Mathematical & Layout Invariants**:
   - Hourly rate formula: $\text{hourlyRate} = \text{salary} / 240$.
   - Normal weekday OT multiplier: $1.5\times$.
   - Sunday / Holiday OT multiplier: $3.0\times$.
   - Holiday base work (OND / Sunday): $1.0\times$ for 8h.
   - Sticky employee identity column width: exactly $224\text{px}$ (`w-56`), `sticky left-0 z-10`.
   - Desktop summary column total width: exactly $368\text{px}$ ($56 + 64 + 80 + 96 + 72 = 368$).
