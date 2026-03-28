# SURF — architecture notes

**Status:** POC / exploratory. Layout and IA are settling; HTTP wiring can land incrementally. Nothing here is frozen.

### `surf-alpha.css`

- **Path:** `FLAGSHIP/SURF/surf-alpha.css` — SURF-only chrome (nav, stat cards, vault grid, Moo terminal, settings). **Not** in `coffee-alpha-shell.css` so we avoid shell `@import`/load-order timing issues; fonts load via `<link>` in **`SURF-ALPHA.html`** before Tailwind + this sheet.
- **Load order:** Google Fonts → Tailwind CDN → `surf-alpha.css` (last wins vs preflight).

### `surf-ai.js`

- **Path:** `FLAGSHIP/SURF/surf-ai.js` (sibling to `TEST/`).
- **Stack:** `coffee.request` → `coffee.drive` → `coffee.ai` → `coffee.context` → `coffee.bee` → **`coffee.surfAi`**.
- **BYOK:** Uses **`coffee.aiConfig`** (`ai-api-key-github|openai|gemini`, same as KATI/BEE-DEMO). Legacy **`surf.katiApiKey`** is read for Gemini until migrated on save. Load **`coffee-ai-config.js`** after **`coffee-ai.js`**.
- **Threads:** IndexedDB drive name **`surf-ai`** (via Bee / context).
- **API:** `coffee.surfAi.sendMessage(text)`, `refreshChatElement(el)`, `getBee()`, `ready()`.
- **Relay tab:** `coffee.serverStats.snapshot({ customBase })` from **`COFFEE-SERVER/lib/browser/coffee-server-stats.js`** — same probes as SERVER-DEMO; UI shows **offline / Inactive** when nothing answers.
- **Settings:** `coffee.aiConfig` with **`includeProviderModel: true`** — API keys + **provider / model** selects (same idea as BEE-DEMO / KATI).
- **Persona:** SURF AI system prompt (server / vault / relay); not KATI.

SURF is the **mobile-first, super-light** face for Coffee Server: status at a glance, **vault buckets on the go**, optional assistant, and escape hatches to full HTML POCs when the screen (or task) demands it.

---

## POCs in this folder

| File | Role |
|------|------|
| **`SURF-ALPHA.html`** | **Canonical flagship entry** (same folder as `surf-alpha.css` + `surf-ai.js`). Main shell: **Relay**, **Vault**, **Moo**, **SURF AI**, **Sidecar**, **Settings** — same behavior as the former monolithic POC; includes `cce:*` meta tags like other flagships. |
| **`TEST/SURF1-POC.html`** | **Redirect** → `../SURF-ALPHA.html` (keeps old bookmarks / paths working). |
| **`TEST/SURF2-DOCS.html`** | SURF lineage + **Docs** tab, sample doc list, overlay reader. Reference for scroll nav + doc UX. |

---

## Information architecture (SURF1 direction)

- **Relay** — Faux “backend” summary: CPU / storage / network (later: real data from `GET /api/metrics`, reachability from `/api/ping` + tunnel hints). Not the filesystem tree.
- **Moo** — `GET /api/moo/registry` + `POST /api/moo/invoke` via `coffee.moo` (Settings **API base** + optional Keyman `Authorization` per request); **terminal** for logs/results; optional **local** `AsyncFunction` eval (browser-only, same pattern as MOO1-POC).
- **Sidecar** — POC container grid from `GET /api/sidecar/poc/containers` (`sidecar-containers.js`); **`sidecar-internal.json`** when offline (not hardcoded in HTML). **`coffee.ollama`** for ensure + chat on **Ollama** cards; full UX still **SIDECAR2-POC** / `/sidecar2-poc`.
- **Vault** — **Single hub**, not four bottom tabs. Four **panels** map 1:1 to Coffee vault init layout (see `COFFEE-SERVER/lib/vault/default-layout.js` + `vault-paths.js` **BUCKETS**):
  - `documents/` · `media/` · `projects/` · `apps/`
- **KATI** — Assistant lane; can stay cloud (Gemini), move to **`/api/sidecar/ollama/*`**, or hybrid later.

**Naming sanity:** vault folder **`apps/`** = *your files on disk*. **Server Apps** (e.g. `server-apps.json` on SERVER-DEMO) = HTTP shortcuts to bundled POC HTML. Don’t conflate them in copy or routing.

---

## Planned client stack (when we wire it)

1. **`coffee-request.js`** — All API calls via `coffee.request()`; set `coffee.request.baseUrl` after discovery.
2. **`coffee-server-reachability.js`** (or equivalent) — Resolve the real Coffee Server origin when the HTML isn’t same-origin (see `COFFEE-SERVER/BROWSER-REACHABILITY.md`).
3. **Optional module** (e.g. `surf-api.js`) — Thin wrappers: `listVaultPath(relPath)`, `getMetrics()`, etc., so the HTML stays dumb.

**Vault drill-down (future):** bucket tap → `GET /api/file/list?path=<bucket>` → parse JSON → list UI → tap folder → deeper `path`; files → preview / raw URL / open full Vault POC in a new tab if needed. Add **`coffee.request.defaultHeaders`** when Keyman gates file APIs.

**Full apps on phone:** Allowed — `window.open(base + '/lib/.../POC.html', '_blank')` with the same base as the API.

---

## Bottom navigation UX

- **`nav-bar`** — `overflow-x: auto`, fixed-width items (`flex: 0 0 70px`), **`no-scrollbar`** class, safe-area padding.
- **`switchView`** — `el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })` so the active label stays visible when there are many tabs.

---

## What’s explicitly deferred

- Real metrics + file listing in SURF1 (stubs today).
- Wire `coffee.request.defaultHeaders` from pasted Keyman token when Vault listing ships; no in-app Keyman POC on mobile.
- Media library as its own product surface vs “just `media/` in Vault.”
- Whether **Docs** ships as a fourth tab in SURF1 or stays SURF2-only.

---

## Related repo docs / code

- Vault layout: `COFFEE-SERVER/lib/vault/default-layout.js`, `CE-FOLDER-MODEL.md` (if present).
- Bucket keys: `COFFEE-SERVER/lib/vault/helpers/vault-paths.js` (`BUCKETS`).
- File list API: `GET /api/file/list?path=…` in `COFFEE-SERVER/server.js`.
- Reachability: `COFFEE-SERVER/lib/browser/coffee-server-reachability.js`, `BROWSER-REACHABILITY.md`.

---

*Last touched: living doc — tighten when SURF graduates from “vibing” to shipped behavior.*
