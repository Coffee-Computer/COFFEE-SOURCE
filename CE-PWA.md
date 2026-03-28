# Coffee Community Edition — mini PWA (`COFFEE-SOURCE`)

Scoped installable app (CAFE-style) for everything under **`COFFEE-SOURCE/`**, separate from the root **`coffee-os-service-worker.js`**.

## Files

| File | Role |
|------|------|
| `coffee-ce-pwa-manifest.json` | Web App Manifest (`scope` = this folder). |
| `coffee-ce-service-worker.js` | SW registered with `scope: /COFFEE-SOURCE/` (from repo root). |

## Caching behavior

- **Network-first** for same-origin requests under `COFFEE-SOURCE` (HTML, CSS, JS, MJS, JSON, images, etc.): always try **live** first; on success, **refresh** the cache; if offline, **fall back** to cache.
- **`/api/*`**: **fetch only** — never served from cache (vault, ping, CRM, …).
- **Other origins** (fonts, CDNs): not handled by this SW (browser default).

## Registration

**Community splash** (`COFFEE-COMMUNITY/COMMUNITY-SPLASH/COMMUNITY-SPLASH-SCREEN.html`) registers the worker and links the manifest. **Download Community Edition** uses `beforeinstallprompt` like the main hub splash.

## Serve

Use **HTTP** from repo root (e.g. `npm start` in **COFFEE-SERVER**) so paths resolve as:

`/COFFEE-SOURCE/...`

Bump **`VERSION`** in `coffee-ce-service-worker.js` when changing fetch/install logic.
