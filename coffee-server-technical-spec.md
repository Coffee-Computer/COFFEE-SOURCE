# Coffee Server — Technical Implementation Spec

## Prerequisites / Setup
- **One-time:** `npm init` (or existing `package.json`), add `express` (and `ws` if WebSockets needed)
- **One-time:** `npm install` in the project folder
- After that: `node server.js` or `npm start` — no new folder, no extra downloads per run

## Architecture

| Layer | Role |
|-------|------|
| **COFFEE-SERVER** | Backend — Node/Express, file sidecar, API routes, static serving, distro page |
| **COFFEE-HOME** | Frontend — Dashboard UI (Coffee.OS interface) that sits on top of COFFEE-SERVER |

COFFEE-HOME is the "Umbrel-style" interface: stats, media vault, app store, system settings. Built with coffee-ui. Served by COFFEE-SERVER at `/` or `/home`. Demo: `COFFEE-PRO/coffee-server/TEST/SERVER-POC1.html`.

- **Main process** + **sidecars** (file first, drive later)
- Single command: `node server.js` or `npm start` to serve the project folder and API

## Browser ↔ Server
- **Endpoints only** — no direct calls into the browser
- All communication via HTTP routes

## File Sidecar
- **`/list`** — list directory contents (path sandboxed to `ROOT_DIR`)
- **`/read`** — read file contents
- **`/write`** — write file contents
- Uses Node `fs`; path sandboxing to prevent escape outside project root

## API Routes
- File: `/api/file/list`, `/api/file/read`, `/api/file/write`
- Drive: reserved for future sidecar

## COFFEE-HOME (Umbrel-Style Dashboard)
- **COFFEE-HOME** = the dashboard UI layer on top of COFFEE-SERVER
- Built with **coffee-ui** — stats, media vault, app grid, system
- Served by COFFEE-SERVER (static HTML/JS + API)
- **Access-code auth** — simple PIN or token to protect the dashboard
- Flow: user hits URL → auth gate → COFFEE-HOME (file browser, media, etc.)

## Testing & Deployment
- One command to run everything
- `express.static(PROJECT_ROOT)` for serving the Coffee project folder
- `ROOT_DIR` env/config for file sidecar root (defaults to project root)

## Distribution (like vm-agent)
- **LTS base** — `server.js` + `package.json` stable, rarely changes
- **Sidecars** = modular (file first, drive later) — add/update without touching base
- **GitHub download** — user downloads folder, runs `npm install`, then `node server.js`
- No separate dist/build step — just the source folder; Node runs it directly

## Implementation Strategy: Build Together
**Yes — server, key, distro as one unit.** Per cc-keypassideation, they're structural dependencies: the distro page and verification are baked into the "DNA." If we build the server without them, we'd have to retrofit later. Better to ship the server with `/distro` (or `/about-coffee`), distro manifest, and key-aware flow from day one. One coherent package.

## Key & Distro (from cc-keypassideation.md)
- **`coffee.key`** — User's portable identity (passport). Scoped sessions for distros; server never sees raw key.
- **`coffee.distro`** — Provider manifest. Every Coffee Server must serve a **distro page** at `/distro` or `/about-coffee`.
- **Distro page** — "Passport stamp" / verification. If missing or mangled, visitors know the site isn't built on core. Template: `COFFEE-SOURCE/COFFEE-DISTRO/distro.html`.
- **Access-code** — Simple PIN/token for dashboard (env or config) — separate from key/distro.
- Reference: `COFFEE-SOURCE/cc-keypassideation.md` — full key/distro, wire, sanitize flow.

## Reference
- `COFFEE-PRO/coffee-server/TEST/SERVER-POC1.html` — COFFEE-HOME demo (Coffee.OS dashboard UI)
- `COFFEE_VM/vm-agent/server.js` — patterns for Express, routes, static serving
- `COFFEE_VM/vm-agent/DISTRIBUTION_STRATEGY.md` — LTS + modular plugin pattern
- `COFFEE-SOURCE/cc-keypassideation.md` — coffee.key, coffee.distro, distro page, verification
- Coffee Source modules (COFFEE-FILE, COFFEE-GPU, etc.) for client-side integration
