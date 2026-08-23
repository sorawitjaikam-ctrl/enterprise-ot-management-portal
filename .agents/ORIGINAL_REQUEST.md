# Original User Request

## 2026-08-23T12:23:44Z

Redesign the Enterprise OT Management Portal with a bespoke, human-crafted industrial maritime aesthetic (moving away from generic AI templates) and engineer a state-of-the-art interactive shift scheduling and rapid data entry system with drag-to-paint, hotkey entry, timeline circadian views, and live budget feedback.

Working directory: C:\Users\ssrwj\Documents\antigravity\mysterious-einstein
Integrity mode: development

## Requirements

### R1. Bespoke Industrial Maritime UI/UX Design Overhaul
Re-engineer the portal visual language away from generic template layouts:
- Modern industrial maritime cockpit design system: tactile control bars, high-contrast terminal indicators, refined typography, custom glassmorphism surfaces, and distinct status badges.
- Micro-interactions: Fluid state transitions, tactile press states, dynamic ocean radar/telemetry accents, and polished empty/loading states.
- Clean visual hierarchy across all 11 application views.

### R2. Advanced Interactive Shift Entry & Scheduling Engine
Build a fluid and intuitive shift scheduling workflow:
- Drag-to-Paint & Range Selection: Click-and-drag across multiple consecutive days or workers to mass-assign shifts effortlessly.
- Keyboard Hotkeys: Rapid single-key shift input (M for M12/M8, N for N12/N8, D for Day, O for Off, etc.) with arrow-key grid navigation.
- Radial / Floating Quick Picker: One-touch quick picker with instant complementary pair suggestions.
- Drag-and-Drop Shift Swap: Seamlessly swap shifts between paired colleagues with immediate validation.

### R3. Circadian & Timeline Shift Visualizer
Provide alternative high-utility visualization modes for shift planning:
- 24-Hour Timeline / Gantt Matrix view showing day/night circadian coverage across 24 hours.
- Live Overtime & Cost Simulation: Instant real-time calculation of overtime cost and weekly safety limits as shifts are being painted or edited.

### R4. Comprehensive Automated Verification & Integrity
- Unit & integration tests for drag-fill logic, hotkey events, schedule generation, and cost simulation.
- npm test runs and passes all test suites (100%).
- npm run build compiles with 0 TypeScript and bundle errors.

## Acceptance Criteria

### Design & Aesthetic
- [ ] Application exhibits a distinctive, custom-crafted industrial maritime interface with zero generic template feel.
- [ ] Navbar, Dashboard, Shift Scheduler, and Modals have unified tactile design and responsive fluid layout.

### Shift Scheduling & Rapid Entry
- [ ] Drag-to-paint allows multi-day and multi-cell shift assignment with instant feedback.
- [ ] Keyboard navigation and hotkey entry operates smoothly on the calendar matrix.
- [ ] Live overtime and labor law safety compliance recalculates in real-time during shift edits.

### Build & Test Integrity
- [ ] All automated tests pass cleanly with 100% success rate.
- [ ] npm run build compiles cleanly with zero TypeScript errors.
