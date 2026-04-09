# Dogfood app ideas (Coffee Source + CDN)

Small projects to **exercise real modules** and **`load-all.js` / jsDelivr cherry-picks** (see [`README.md`](./README.md), [`AI-CDN-SYSTEM-INSTRUCTION.md`](./AI-CDN-SYSTEM-INSTRUCTION.md)). Pick one row, ship a single HTML or tiny folder, and file gaps you hit.

| # | App idea | Modules to lean on | Notes |
|---|----------|-------------------|--------|
| 1 | **Personal command bar** — one input, fuzzy list of actions | COFFEE-UI, COFFEE-LIST, COFFEE-FILTER | Dogfood filter + list; `load-all` already pulls these. |
| 2 | **Markdown scratch pad** — split view: edit / preview | COFFEE-UI, COFFEE-MARKDOWN | Persist with `localStorage` first; later COFFEE-BASE + COFFEE-QUE + COFFEE-WIRE + COFFEE-DRIVE. |
| 3 | **Indexed “faux BaaS” CRM** — contacts table, add/remove | COFFEE-UI, COFFEE-BASE, COFFEE-QUE, COFFEE-WIRE, COFFEE-DRIVE | Matches `coffee.base` README load order. |
| 4 | **Task board (local)** — columns, drag optional | COFFEE-UI, COFFEE-TASK | Extend with COFFEE-BASE for sync-shaped storage. |
| 5 | **Habit / cadence tracker** | COFFEE-UI, COFFEE-CADENCE | Simple calendar + streak UI. |
| 6 | **Toast / notification lab** — try every feedback pattern | COFFEE-UI, COFFEE-TOAST | Good for theme + `coffee.msg` vs toast. |
| 7 | **Modal & form sandbox** | COFFEE-UI, COFFEE-MODAL, COFFEE-FORMS | Validates flagship + a11y flows. |
| 8 | **CLI-ish terminal pane** (mock FS) | COFFEE-UI, COFFEE-TERMINAL | Wire COFFEE-FILE later if you add real FS bridge. |
| 9 | **Mini code playground** | COFFEE-UI, COFFEE-MONACO | Lazy-load Monaco if `load-all` weight hurts. |
| 10 | **Graph explorer** — nodes from JSON | COFFEE-UI, COFFEE-GRAPH | Import static graph; edit in Monaco. |
| 11 | **Dot / graphviz-style diagram** | COFFEE-UI, COFFEE-DOT | Good for docs / architecture sketches. |
| 12 | **2D scene toy** — sprites, pan/zoom | COFFEE-UI, COFFEE-SCENE2D | Lighter than 3D for iteration. |
| 13 | **3D gallery** — declarative shapes, orbit | COFFEE-UI, COFFEE-SCENE3D + Three.js | Use jsDelivr Three + gh `coffee-scene3d.js`; see `TESTING/TEST4-3D.html`. |
| 14 | **Canvas draw pad** — save PNG | COFFEE-UI, COFFEE-DRAW, COFFEE-FILE | Export triggers download or FS helper. |
| 15 | **SVG icon composer** | COFFEE-UI, COFFEE-SVG | Export string; paste into COFFEE-BRAND-style ASCII art page. |
| 16 | **Pattern / tile generator** | COFFEE-UI, COFFEE-PATTERN | Wallpapers, CSS backgrounds. |
| 17 | **Shader thumbnail grid** | COFFEE-UI, COFFEE-SHADER or COFFEE-GPU | Start with one full-screen quad. |
| 18 | **Procedural “coil” art** | COFFEE-UI, COFFEE-COIL | Sliders bound to COFFEE-UI inputs. |
| 19 | **Shadow / preset visualizer** | COFFEE-UI, COFFEE-SHADOW | Swap JSON presets from `presets/`. |
| 20 | **Shade ramp editor** | COFFEE-UI, COFFEE-SHADE | Color tokens for themes. |
| 21 | **Pixel editor (micro)** | COFFEE-UI, COFFEE-PIX | 16×16 favicon lab. |
| 22 | **ASCII / brand splash** | COFFEE-UI, COFFEE-BRAND | One screen, `coffee-os-ascii` + `coffee.heading`. |
| 23 | **Shell layout demo** | COFFEE-UI, COFFEE-SHELL | App chrome without a full router. |
| 24 | **Screen / capture helper UI** | COFFEE-UI, COFFEE-SCREEN | Pair with COFFEE-CONTROL if camera APIs needed. |
| 25 | **Chat stub** — local transcripts only | COFFEE-UI, COFFEE-CHAT | Later: COFFEE-CONNECT, COFFEE-TRANSPORT, COFFEE-NOSTR / COFFEE-MASTO (Fediverse). |
| 26 | **Peer “room” ping** | COFFEE-UI, COFFEE-PEER | Smallest live collab proof. |
| 27 | **AI prompt + key config** (no server) | COFFEE-UI, COFFEE-AI | Use `coffee-ai-config` patterns; keep keys local. |
| 28 | **Rusty / WASM demo shell** | COFFEE-UI, COFFEE-RUSTY | One button “run wasm”; status via COFFEE-TOAST. |
| 29 | **Git status viewer** (read-only mock) | COFFEE-UI, COFFEE-GIT | Feed fake `coffee.git` data until wired to real repo. |
| 30 | **Distro passport viewer** | COFFEE-UI, COFFEE-DISTRO | Render manifest + links; aligns with server/distro story. |

## CDN strategy (quick)

- **Default dogfood:** `load-all.js` + `coffee:cdn:ready` / `COFFEE_LOAD_ALL_PROMISE` so every `coffee-*` root in the chain is available—easiest for tabs 1–12, 20–30.
- **Slim pages:** Three.js + `coffee-ui.js` + `coffee-scene3d.js` (gh) for 3D only; or `import-map.js` + `import()` for **true ESM** like `COFFEE-CASH/cash-core.js`, `COFFEE-POSIX/coffee-posix.js` (see `load-all.js` `ESM_SPECS`).
- **Dogfood outcome:** Each app should produce a short **“gaps” note** (missing API, wrong load order, doc typo)—feed into `COMMUNITY-STACK-GAPS*.md` if it’s structural.

## Modules referenced (alphabetical)

BASE, BRAND, CADENCE, CHAT, COIL, CONTEXT, CONTROL (often paired with UI), DISTRO, DOT, DRAW, DRIVE, FILE, FILTER, FORMS, GIT, GPU, GRAPH, LIST, MARKDOWN, MASTO (stretch), MODAL, MONACO, NOSTR (stretch), OMNI (stretch), PATTERN, PEER, PIX, POSIX, QUE, REQUEST, RUSTY, SCENE2D, SCENE3D, SCREEN, SHADE, SHADER, SHADOW, SHELL, SVG, TASK, TERMINAL, TOAST, TRANSPORT, UI (+ FLAGSHIP), WIRE—plus **COFFEE-CASH** for dataflow demos and **COFFEE-AI** for config UX.

Not every pair is wired yet; treat the table as a **backlog of experiments**, not guarantees.
