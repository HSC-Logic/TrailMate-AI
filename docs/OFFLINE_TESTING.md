# Reproducible offline verification
Use Node 24+ and a recent Chromium browser. HTTPS or localhost is required for service workers/Cache Storage. Private browsing/storage restrictions may prevent persistence.

```sh
npm ci
npm run build
npx playwright install chromium
npm run test:e2e
REAL_AI=1 npm run test:e2e -- --project=desktop --grep 'real CLIP'
```
Ordinary tests cover shell reload, missions and IndexedDB access on desktop/mobile viewports. They explicitly skip actual model provisioning. `REAL_AI=1` downloads the pinned model without intercepts/mocks, loads actual text inference, disconnects the Playwright browser, reloads, executes image inference, saves a journal observation, reloads again and opens missions. The synthetic green PNG proves execution only, not category accuracy.

## Manual phone check
1. Serve production build or verified Pages deployment. Open app and finish onboarding.
2. Settings: wait for shell cached/controlled. Reload if required.
3. Press Download AI for Offline Use. Keep browser open until AI ready. About 154 MB weights plus tokenizer and ~27 MB WASM. Do not infer success from worker registration.
4. Add an observation/photo. Start/pause a mission.
5. Disable Wi-Fi and mobile data. Reload the app. Confirm saved journal/photo, persisted paused session, resume/finish, progress.
6. Upload a new photo, run AI. Expect three finite cosine similarities and manual Unknown option. Check browser Network panel: no remote photo transmission.
7. Sleep device during a running session; reopen and check timestamp elapsed time. Changing clocks affects duration. Live vibration may not run during sleep.
8. Delete AI cache. In airplane mode inference must explain missing model, never invent labels. Reconnect and retry interrupted download; completed files should be retained.
9. Export/import backup in a fresh browser. Verify photos. Deny location; creation still works. Cancel camera selection; upload remains available.
10. Repeat on real Android/iOS devices and Firefox/Safari. Record browser/device/memory, actual downloads, inference time, storage quota behavior. Those environments remain unverified until exercised.

Partial download cache is intentionally retained. Browser cache eviction can remove individual files; Settings requires every artifact. IndexedDB backup is the user's responsibility. Development server does not prove service-worker offline behavior.
