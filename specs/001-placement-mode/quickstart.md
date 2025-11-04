# Quickstart: Placement Mode Foundations

## Prerequisites

- Bun v1.1+ installed (`curl -fsSL https://bun.sh/install | bash`)
- Node.js 20+ (for tooling parity) *(optional but recommended)*
- Modern browser (Chrome 124+, Firefox 125+, Safari 17+)

## Setup

```bash
# Install dependencies
git clone <repo-url>
cd line-train-sim/app
bun install

# Start development server with hot reload
bun run dev

# Run unit and integration tests
bun run test

# Launch Playwright touch/keyboard regression suite
bun run test:e2e

# Build production bundle
bun run build
```
# Sync locale bundles (optional example)

## Local Data Storage


- Primary persistence: IndexedDB via Dexie (`placementSimDB`).
- Preferences fallback: `localStorage` key `lts:preferences`.
- To reset local data, run in browser console:

```js
await indexedDB.deleteDatabase('placementSimDB');
localStorage.removeItem('lts:preferences');
```

## Touch & Keyboard Controls

- Touch: pinch-zoom, two-finger pan, long-press context menu.
- Keyboard: WASD/arrow pan, `+/-` zoom, `Shift` for multi-select, `Space` to toggle diagram preview.

## Add-on Sandbox

- Drop `.lts-addon.json` packages into `app/public/addons/`.
- Enable via Settings → Add-ons; each package must declare permitted event hooks (`onPlacementReady`, `onBeforePreview`, `onAfterPreview`, `onExecutionTick`).
- Sandboxed scripts execute in isolated Web Worker; no direct network or storage access.

## Internationalization

- Default locale: `en-US`; additional locales stored in `app/src/i18n/locales/*`.
- Use `bun run intl:extract` to update message catalogs from source.
- Place compiled translation files under `app/public/locales/` for offline availability.
