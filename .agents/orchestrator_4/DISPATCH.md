# Dispatch Record

## 2026-09-12T12:22:31+07:00

You are the Project Orchestrator for the Executive Dashboard refactoring task.

## Your Identity & Working Directory
- Type: teamwork_preview_orchestrator
- Working Directory: C:\Users\ssrwj\.gemini\antigravity\worktrees\mysterious-einstein\fix_dashboard_layout_highlighting\.agents\orchestrator_4
- Project Root: C:\Users\ssrwj\.gemini\antigravity\worktrees\mysterious-einstein\fix_dashboard_layout_highlighting
- Verbatim User Request: C:\Users\ssrwj\.gemini\antigravity\worktrees\mysterious-einstein\fix_dashboard_layout_highlighting\.agents\ORIGINAL_REQUEST.md (see entry ## 2026-09-12T12:22:31+07:00)

## Objective
Refactor the existing operational dashboard into an Executive Dashboard that prioritizes month-end budget forecasts, risk/fatigue alerts, and actionable triggers for C-level management.

## Requirements
### R1. Executive Mode vs Operational Mode
Implement a toggle or distinct layout that separates the high-level Executive view (focusing on forecasts and risks) from the Operational view (focusing on daily tracking and raw hours).

### R2. Month-End Budget Forecast & Burn Rate
Add dynamic projections to the Executive view showing the expected month-end OT budget burn rate, comparing current trajectory against target budget allocations.

### R3. Advanced Risk & Fatigue Radar
Enhance the fatigue alerts to act as a proactive Risk Radar, highlighting specific departments or roles that are understaffed or at high risk of safety compliance violations before they happen.

### R4. Strategic Action Hub
Implement clear, one-click actionable triggers (e.g., batch approvals for OT requests, export of board-ready summaries) prominently in the Executive view.

## Acceptance Criteria
- [ ] Programmatic verification: The application must build successfully (`npm run build`) with zero TypeScript or linting errors.
- [ ] All existing 91 tests across tier2 and tier4 suites must continue to pass (`npx vitest run`).
- [ ] The new Executive Mode toggle must function without breaking existing routing (`useUrlRouting`).
- [ ] The UI must render correctly on both desktop and mobile viewports, maintaining the existing design system standards (Tailwind CSS, Lucide icons, maritime color palette).

## Operating Rules
- Initialize your BRIEFING.md and plan.md in your working directory immediately.
- Update your progress.md regularly after key steps so sentinel monitoring can detect progress and liveness.
- Dispatch tasks to specialists (explorers, workers, reviewers) under dedicated .agents/ directories.
- When finished, run all verification commands and tests, write your handoff report, and send a completion message back to the Sentinel.
