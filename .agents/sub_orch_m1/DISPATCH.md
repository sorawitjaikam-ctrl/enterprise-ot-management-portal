# Dispatch Record for Sub-Orchestrator Milestone 1: Design System & Minimal Components

## Mission
Execute Milestone 1 of the Radical Minimalism Product Design Overhaul:
1. Global CSS & Design Tokens (`src/index.css`, `tailwind.config.js`, `index.html`):
   - Strict 12-token maritime palette (`#0E3A66`, `#17538F`, `#2E90CB`, `#9FCEE8`, `#E8F3FA`, `#1E9C6E`, `#D99B14`, `#B3352C`, `#333B41`..`#FFFFFF`). Purge 250+ legacy rogue hex codes.
   - Hairline borders (`1px solid #DCE4EA` / `border-[#DCE4EA]`).
   - Eliminate all container gradients (`bg-gradient-*`), heavy box shadows (`shadow-2xl`, `shadow-xl`), and neon glow rings.
   - Enforce typography scale (max 3 font weights 400/500/700, max 3 font sizes per view) and 8pt grid spacing.
   - Iconography: remove Google Material Symbols link from `index.html` and references in code, ensure 0 emoji, use clean Lucide SVG icons.
2. Minimalist Sub-Module & Modal Theming:
   - Restyle `CircadianTimelineModal.tsx`, `ShiftRadialPicker.tsx`, `LiveSimulationHUD.tsx`, `CsvTemplateHubModal.tsx`, and all modals into clean white/navy minimal surfaces.
3. Minimalist Component Primitives:
   - Provide clean reusable component patterns (Card, KPITile, TableRow, Modal, Button, Tag, Input).
4. Run full iteration loop: Explorer -> Worker -> Reviewers (2) -> Challengers (2) -> Forensic Auditor (`teamwork_preview_auditor`).
5. Ensure `npm run build` passes with 0 errors and `npm run lint` passes with 0 errors.

## Working Directory
`C:\Users\ssrwj\Documents\antigravity\mysterious-einstein\.agents\sub_orch_m1`

## References
- `C:\Users\ssrwj\Documents\antigravity\mysterious-einstein\PROJECT.md`
- `C:\Users\ssrwj\Documents\antigravity\mysterious-einstein\.agents\ORIGINAL_REQUEST.md`
- Survey analysis: `C:\Users\ssrwj\Documents\antigravity\mysterious-einstein\.agents\explorer_survey_design\analysis.md`
