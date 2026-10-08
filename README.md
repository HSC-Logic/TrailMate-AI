# TrailMate AI
**Explore More. Scroll Less.** An offline-first outdoor PWA for Sri Lanka and beyond.

This is a submission for the Hacktoberfest Open-Source AI Challenge Week 1: Touch Grass.

## Run
Node 24+ recommended.
```sh
npm ci
npm run dev
npm run typecheck
npm run lint
npm test
npm run build
npx playwright install chromium
npm run test:e2e
REAL_AI=1 npm run test:e2e -- --project=desktop --grep 'real CLIP'
```
Open the URL printed by Vite, under `/TrailMate-AI/`. Test offline on the production preview (`npm run preview`), not the development server. Real AI test downloads actual pinned weights; ordinary tests explicitly skip it. The green image fixture is synthetic, authored for plumbing verification, not an accuracy benchmark.

## What works
Three-step introduction, mobile dashboard, twenty curated missions, start/pause/resume/confirmed finish/cancel, timestamp timers across reloads, optional mission journal linkage, minimal screen-free session view, optional finish vibration, local journal CRUD/search/photo compression, schema-validated JSON backup/import, optional rounded location, native note sharing, weekly progress and milestones, light/dark/system theme, explicit AI provisioning/cache deletion and permanent local-data reset.

CLIP compares an image embedding against fifteen text embeddings. Top three results are raw cosine similarities, **not calibrated probabilities or species identification**. Unknown and manual category overrides are available. Inference is real local WASM CPU execution, lazy-loaded after explicit download. No remote AI calls.

## Offline and privacy
The service worker caches the app, JS chunks and local ONNX WASM assets. On first installation these require a connection. Settings verifies a controlling worker and cached index independently from every pinned model artifact. Download AI explicitly while online; partially downloaded files are retained for retry. Model preparation also runs text inference. Before a trip reload, use airplane mode and try an image. Do not infer offline readiness from registration alone.

Weights are 153,621,508 bytes combined (~154 MB decimal). Tokenizer/config add several MB; pinned runtime WASM is ~27 MB. Budget at least 250 MB persistent storage and additional memory for inference. No device-independent memory minimum is claimed. Low-memory devices can fail. Cache eviction/browser-data clearing removes readiness. Export journals regularly. Exact location is never retained; optional coordinates round to 0.1 degrees. Photos are JPEG-compressed to a 1280px maximum edge. EXIF is discarded by canvas conversion. Model requests contact Hugging Face; normal app hosting still receives web requests. User photos are never sent.

Timers use persisted wall-clock timestamps, not background polling. Device sleep can prevent vibration/live notifications. Changing the device clock can affect measured duration. Time and completion are user-reported, not verified by GPS or AI. Camera selection falls back to upload; permission prompts are never requested at startup.

## Deployment
GitHub Actions validates and deploys pushes to `main` to GitHub Pages. Select **GitHub Actions** in repository Settings → Pages. HashRouter avoids static-host deep-link 404s. Default base is `/TrailMate-AI/`; override `VITE_BASE=/AnotherRepo/ npm run build`, or `VITE_BASE=/ npm run build` for a custom domain. Add `public/CNAME` only for your domain. No deployment is claimed until an actual successful workflow and live URL exist.

## Architecture and credits
React + TypeScript + Vite + Tailwind 4; Lucide icons; Dexie IndexedDB; Workbox PWA; Transformers.js 4.3.1 / ONNX Runtime Web. No backend, tracking SDK or cloud AI service. Original landscape SVG and synthetic test fixture are included without external runtime images/fonts. Project code MIT; dependencies retain their own licenses.

Read [architecture](docs/ARCHITECTURE.md), [AI verification and licensing](docs/OPEN_SOURCE_AI.md), [offline testing](docs/OFFLINE_TESTING.md), [demo script](docs/DEMO_SCRIPT.md), and [submission draft](docs/DEVTO_SUBMISSION.md). Actual validation results belong in [validation](docs/VALIDATION.md). Mobile Safari/Firefox, real phones, outdoor field tests and accuracy benchmarks require separate verification.
