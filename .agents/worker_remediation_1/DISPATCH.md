## 2026-09-02T05:12:12Z

You are the Remediation & Full Overhaul Worker for the Radical Minimalism Overhaul of the Enterprise OT Management Portal.

Working Directory: C:\Users\ssrwj\Documents\antigravity\mysterious-einstein\.agents\worker_remediation_1
Original Request: C:\Users\ssrwj\Documents\antigravity\mysterious-einstein\.agents\ORIGINAL_REQUEST.md
Project Root: C:\Users\ssrwj\Documents\antigravity\mysterious-einstein
Project Plan: C:\Users\ssrwj\Documents\antigravity\mysterious-einstein\PROJECT.md
Survey Analysis UX: C:\Users\ssrwj\Documents\antigravity\mysterious-einstein\.agents\explorer_survey_ux\analysis.md
Survey Analysis Design: C:\Users\ssrwj\Documents\antigravity\mysterious-einstein\.agents\explorer_survey_design\analysis.md
Reviewer 2 Findings: C:\Users\ssrwj\Documents\antigravity\mysterious-einstein\.agents\reviewer_m1_2\handoff.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Your mission:
1. Read ORIGINAL_REQUEST.md, PROJECT.md, and the survey analysis files.
2. Fix the 5 TypeScript mock typing errors in `tests/`:
   - `tests/tier2-responsive/radical-minimalism-boundary-stress.test.tsx` (add `groupName: "Default"`)
   - `tests/tier4-workflows/radical-minimalism-cross-features.test.tsx` (add `groupName: "Default"`, fix parameter structure for `calculateHourlyStaffingDensity`)
   - `tests/tier4-workflows/radical-minimalism-labor-law-lifecycle.test.ts` (add `groupName: "Default"`, fix violation type check)
   - Verify that `npm run lint` (`tsc --noEmit`) passes with 0 errors.
3. Implement Milestone 2: Navigation & App Shell Overhaul:
   - `src/components/Navbar.tsx`: Executive minimal header, folder-tabs styling (`#0E3A66` active indicator, hairline `#DCE4EA` borders), notification bell, profile menu.
   - Streamline top-5 user tasks (assign shift, view OT summary, filter department, export CSV, check compliance alerts) into 1-2 click direct actions.
   - Remove unused `Sidebar.tsx` imports.
4. Implement Milestone 3: 11 Views Radical Minimalist Overhaul & Micro-Copy Ruthless Brevity in `src/App.tsx`:
   - Overhaul all 11 views: `dashboard`, `job_value`, `reports`, `employees`, `shifts`, `hr-editor`, `ot-records`, `leave-records`, `settings`, `admin-permissions`, `profile`.
   - Remove visual noise: gradient banners, sparkline decorations, animated pulsing/pinging dots, excessive badges, ornamental dividers.
   - Consolidate sections to achieve >=20% top-level section reduction across all views (e.g. merge redundant headers/toolbars, deduplicate user management table in Settings).
   - Enforce micro-copy rules: button label <= 4 words, section header <= 6 words, placeholder < 5 words, remove explanatory subtitles.
   - Purge all 250+ rogue hex codes in `App.tsx` (`#0b1a3a`, `#1d3ec7`, `#6d93fc`, `#a9cdfc`, `#ddebf7`, etc.) in favor of the strict 12-token maritime palette (`#0E3A66`, `#17538F`, `#2E90CB`, `#9FCEE8`, `#E8F3FA`, `#1E9C6E`, `#D99B14`, `#B3352C`, `#333B41`..`#FFFFFF`).
5. Implement Milestone 4: 10 Data Tables Frozen Columns & Responsive Mobile Layouts:
   - Verify hairline separators (`divide-[#DCE4EA]`), minimal header chrome, and generous row padding across all 10 tables.
   - Verify sticky left frozen columns (e.g. employee identity in Shift Matrix and Employee Roster) and horizontal touch scrolling (`touch-pan-x`) work cleanly on mobile (375px), tablet (768px), and desktop (1440px+).
6. Verification:
   - Verify `npm run lint` (`tsc --noEmit`) -> MUST pass with exit code 0 (0 errors).
   - Verify `npm run build` -> MUST pass with exit code 0.
   - Verify `npm test` -> MUST pass with 100% of test suites.
7. Write `progress.md` and `handoff.md` in your working directory. Send a message to parent when done.
