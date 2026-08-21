# Handoff Report — E2E Testing Explorer 3

**Track**: E2E Testing Track — PWA & Offline App Shell, Test Runner Architecture, Tier 3 Test Cases  
**Author**: Explorer 3  
**Date**: 2026-08-22  
**Handoff Type**: Hard (Investigation & Design Complete)  

---

## 1. Observation

1. **PWA Manifest & App Shell Baseline**:
   - `public/manifest.webmanifest` / `public/manifest.json`: Checked `public/` directory via `list_dir(C:\Users\ssrwj\Documents\antigravity\mysterious-einstein\public)`. Only `login-bg.jpg` exists. Manifest is absent.
   - `index.html:1-17`: Contains basic HTML shell (`viewport`, `charset`, `title`, Google Fonts). Missing `<link rel="manifest">`, `<meta name="theme-color">`, iOS `<meta name="apple-mobile-web-app-capable">`, `<meta name="apple-mobile-web-app-status-bar-style">`, `<link rel="apple-touch-icon">`, and `viewport-fit=cover`.
   - `public/sw.js` / `src/sw.ts`: Searched with `find_by_name` and `grep_search`. No Service Worker implementation exists.
   - `src/main.tsx:1-68`: Global error boundary and root render present. No Service Worker registration invocation exists.
   - `public/icons/`: Directory does not exist yet. Needs 192x192, 512x512, and maskable PWA icons.

2. **Test Runner Architecture Baseline**:
   - `package.json:6-12`: Scripts include `"dev"`, `"build"`, `"start"`, `"clean"`, `"lint"`. There is NO `"test"` script.
   - `node_modules`: Tested for `vitest`, `@testing-library/*`, `jsdom`. None are currently installed.
   - Node runtime: `node -v` output is `v24.16.0`.
   - Network connectivity: `npm ping` returned HTTP 200 `PONG 375ms`.
   - Build environment: Vite 6.2.3, React 19.0.1, TypeScript 5.8.2.

3. **Report Output**:
   - Written comprehensive architectural report to `C:\Users\ssrwj\Documents\antigravity\mysterious-einstein\.agents\e2e_explorer_3\report.md`.

---

## 2. Logic Chain

1. **PWA & Offline Readiness**:
   - *Premise*: Acceptance criteria §PWA & Installation and PROJECT.md §M1 require standards-compliant manifest, standalone mode, theme color `#0f172a`, root-scoped `/sw.js`, Cache-First static shell (`ot-portal-v1-shell`), and Network-First dynamic API caching (`ot-portal-v1-api`).
   - *Observation*: Neither manifest nor `/sw.js` exist in `public/` or `src/`.
   - *Inference*: PWA assets (`manifest.webmanifest`, `icons/`, `sw.js`, `serviceWorkerRegistration.ts`) must be created in Milestone M1, and Tier 3 tests must validate all fields, lifecycles, and caching behaviors.

2. **Test Runner Selection**:
   - *Premise*: Tests must run unit calculations, responsive DOM layouts, manifest schemas, and React workflow simulations lightning fast with `npm test` or `npx vitest run`.
   - *Comparison*:
     - Vitest 3 runs natively on Vite 6 pipeline, shares TypeScript and `@/*` alias configurations without duplicate transform pipelines, and executes suites in parallel in ~1 second.
     - Node 24 test runner lacks native JSX/React component DOM rendering without complex loaders.
   - *Inference*: `vitest` + `jsdom` + `@testing-library/react` (v16 supporting React 19) is the cleanest, fastest, and most maintainable harness.

3. **Tier 3 Test Suite Design**:
   - *Premise*: Tier 3 requires automated validation of PWA manifest, meta tags, Service Worker lifecycle, offline caching strategies, and install prompt behaviors.
   - *Inference*: 26 test cases grouped into 5 dedicated test files (`manifest-schema.test.ts`, `html-meta-tags.test.ts`, `service-worker-lifecycle.test.ts`, `offline-caching-strategy.test.ts`, `pwa-install-prompt.test.tsx`) fully cover all contract requirements.

4. **Directory Structure & Mock Infrastructure**:
   - *Premise*: Tiers 1-4 tests require unified mocks for browser APIs (`matchMedia`, `ResizeObserver`, `CacheStorage`, `serviceWorker`, `URL.createObjectURL`).
   - *Inference*: Placing global mocks in `tests/setup.ts` and domain mock fixtures in `tests/mocks/` provides clean test isolation.

---

## 3. Caveats

- **Network Dependency for Package Installation**: Running `npm install -D vitest @testing-library/react jsdom` requires npm registry access (verified working with `npm ping`).
- **PWA Service Worker in Dev vs Prod**: In development, Vite HMR can conflict with aggressive SW caching; `registerServiceWorker()` should conditionally register in production (`process.env.NODE_ENV === 'production'`) or enable unregistering during development.
- **Icon Generation**: SVG / PNG icon assets for 192x192 and 512x512 should be generated/placed into `public/icons/` during M1.

---

## 4. Conclusion

1. **Recommended Test Harness**: Configure **Vitest 3** with `jsdom` environment, `tests/setup.ts` polyfills, and `@testing-library/react` for React 19 component testing.
2. **Directory Architecture**: Adopt the clean 4-tier structure (`tests/tier1-calculations/`, `tests/tier2-responsive/`, `tests/tier3-pwa/`, `tests/tier4-workflows/`).
3. **PWA Assets**: Implement `public/manifest.webmanifest`, `public/icons/`, `public/sw.js` (Cache-First app shell, Network-First API), `index.html` PWA meta tags, and `src/serviceWorkerRegistration.ts`.
4. **Tier 3 Test Cases**: Implement the 26 proposed test cases across 5 test files in `tests/tier3-pwa/`.

---

## 5. Verification Method

To independently verify the findings and test runner recommendations:

1. **Inspect Report and Specifications**:
   - View `C:\Users\ssrwj\Documents\antigravity\mysterious-einstein\.agents\e2e_explorer_3\report.md`.
2. **Verify Baseline Gaps**:
   - Check `index.html` (`view_file(C:\Users\ssrwj\Documents\antigravity\mysterious-einstein\index.html)`).
   - Check `package.json` scripts (`view_file(C:\Users\ssrwj\Documents\antigravity\mysterious-einstein\package.json)`).
   - Check `public/` directory (`list_dir(C:\Users\ssrwj\Documents\antigravity\mysterious-einstein\public)`).
3. **Verify Test Runner Installation (when test writer runs)**:
   - Command: `npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom @types/jsdom`
   - Command: `npx vitest run tests/tier3-pwa`
