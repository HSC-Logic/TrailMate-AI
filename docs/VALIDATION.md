# Validation record — 2026-10-08
Environment: macOS Apple Silicon, Node 26.8.2, production Vite preview under `/TrailMate-AI/`, headless Chromium 156. Desktop 1440×1000, mobile 390×844 (viewport simulation, not a physical phone).

- TypeScript: passed.
- ESLint: passed.
- Production build / Workbox precache: passed.
- Vitest: 11 unit/integration tests passed (mission transitions, persistence, transactional imports/exports, schema validation, cosine math, partial-cache refusal). AI cache unit test uses explicit mocks; does not claim inference.
- Playwright: 13 passed, 1 deliberately skipped in the final full suite (15.0 seconds). Two viewport variants of CRUD, session lifecycle/reload, offline shell/journal/missions, denied location and missing AI, backup/import/delete/theme, and keyboard focus. Real model case runs on desktop only; mobile real AI is skipped.
- Real CLIP: actual pinned q8 image/text ONNX models downloaded, text inference initialized, browser disconnected, app reloaded, image inference produced three cosine values, observation saved/reloaded, missions accessed. No model/network mocks in this test. Synthetic fixture verifies plumbing, **not nature recognition accuracy**.
- npm audit after upgrading Transformers.js/Vitest: zero reported vulnerabilities.
- Desktop/mobile production screenshots captured and visually reviewed: `docs/desktop.png`, `docs/mobile.png`.

## Important fixes found by validation
Reload tests originally interrupted IndexedDB writes by reloading immediately after clicks; tests now await saved UI state. Transformers.js 4.3.1 tokenizer registry probes `main` despite a revision option, breaking offline startup; adapter constructs the CLIP tokenizer from pinned cached JSON instead. Duplicate active mission starts are transaction-guarded. Modal focus is initialized once before paint, preserving typing focus through rerenders.

## Unverified
Live GitHub Pages deployment, GitHub Actions execution, physical Android/iOS, Firefox/Safari, old/low-memory devices, real camera permission flow, forced storage quota exhaustion, GPU inference (not implemented), measured memory/performance, species accuracy and outdoor testing in Sri Lanka. Model conversion card lacks a distinct license field; upstream MIT provenance and that limitation are documented. No invented screenshots, calibrated probabilities or field results.

## Reproduce
`npm ci && npm run typecheck && npm run lint && npm test && npm run build`
Then `npx playwright install chromium` and `REAL_AI=1 npm run test:e2e`.
