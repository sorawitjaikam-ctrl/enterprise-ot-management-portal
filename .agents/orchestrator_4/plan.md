# Execution Plan: Executive Dashboard Refactoring

## Objective
Refactor the operational dashboard into an Executive Dashboard that prioritizes month-end budget forecasts, risk/fatigue alerts, and actionable triggers for C-level management, fulfilling Requirements R1 through R4 while preserving 100% of existing tests (91 tests across tier2 and tier4) and routing integrity.

## Requirements Breakdown
- **R1: Executive Mode vs Operational Mode**: Toggle or distinct layout separating high-level Executive view (forecasts & risks) from Operational view (daily tracking & raw hours). Integrated with `useUrlRouting`.
- **R2: Month-End Budget Forecast & Burn Rate**: Dynamic projections showing expected month-end OT budget burn rate, current trajectory vs. budget targets.
- **R3: Advanced Risk & Fatigue Radar**: Proactive Risk Radar highlighting departments/roles understaffed or at high risk of safety compliance violations.
- **R4: Strategic Action Hub**: One-click actionable triggers (e.g. batch approvals for OT requests, export board-ready summaries) prominently in Executive view.

## Execution Phases

### Phase 1: Survey & Codebase Exploration (3 Explorers)
- **Explorer 1 (`explorer_exec_ui`)**: Investigate `src/App.tsx`, dashboard view components, layout structure, and `useUrlRouting` implementation to map how views and modes are currently toggled and routed.
- **Explorer 2 (`explorer_exec_budget`)**: Investigate budget calculation, cost simulation engines (`costSimulationEngine.ts`, `shiftRecommendation.ts`, `types.ts`), current OT metrics, trajectory, and burn rate data sources.
- **Explorer 3 (`explorer_exec_risk_test`)**: Investigate fatigue alert models, compliance thresholds, risk indicators, action triggers, and run/verify the existing 91 test baseline across tier2 and tier4 suites.

### Phase 2: Synthesis & Task Specification
- Synthesize findings from Explorers into architectural blueprint and interface contracts.
- Define precise component structure, state management, and file write ownership for Worker.

### Phase 3: Implementation (Worker)
- Dispatch Worker to implement R1, R2, R3, R4 in `src/` following maritime design system and 0 emojis.
- Worker executes `npm run build` and `npx vitest run` to ensure clean build and passing tests.

### Phase 4: Rigorous Verification & Gate
- **Reviewers (2)**: Review correctness, code quality, design system compliance, mobile/desktop responsiveness, and routing.
- **Challengers (2)**: Empirically stress-test Executive/Operational toggle, routing edge cases, calculation boundary conditions, and action triggers.
- **Forensic Auditor (1)**: Run anti-cheat integrity checks to ensure genuine logic and zero facades.
- Evaluate gate in `GATE_STATUS.md`.

### Phase 5: Handoff & Reporting
- Update `PROJECT.md` and `progress.md`.
- Produce `handoff.md`.
- Send completion message to Sentinel.
