# Dogfood app ideas (Coffee Source + CDN)

Small projects to **exercise real modules** and **`load-all.js` / jsDelivr cherry-picks** (see [`README.md`](./README.md), [`AI-CDN-SYSTEM-INSTRUCTION.md`](./AI-CDN-SYSTEM-INSTRUCTION.md)). Pick one row, ship a single HTML or tiny folder, and file gaps you hit.

**Coverage in `COFFEE-CDN/TESTING/`:** rows **1–14** have a primary dogfood HTML (links in the table). Rows **15–30** are still **backlog**—no dedicated `TEST*.html` in that folder yet. Unrelated demos also exist (e.g. [`TEST2-CALENDAR.html`](./TESTING/TEST2-CALENDAR.html), [`TEST3-TODO.html`](./TESTING/TEST3-TODO.html), [`TEST-CALDENDAR-STYLIZED.html`](./TESTING/TEST-CALDENDAR-STYLIZED.html)) that are not mapped to this 30-row list.

| # | App idea | Modules to lean on | Dogfood test (done) | Notes |
|---|----------|-------------------|---------------------|--------|
| 1 | **Personal command bar** — one input, fuzzy list of actions | COFFEE-UI, COFFEE-LIST, COFFEE-FILTER | [TEST5](TESTING/TEST5-COMMANDBAR.html), [TEST6](TESTING/TEST6-COMMANDSEARCH.html) | Text filter: **`Array.filter` / fuzzy** — **not** `coffee.filterCss` (CSS only). **`coffee.filterCss`** = image/canvas **CSS filters**. |
| 2 | **Markdown scratch pad** — split view: edit / preview | COFFEE-UI, COFFEE-MARKDOWN | [TEST7](TESTING/TEST7-MARKDOWN.html) | **`marked`** script **before** `coffee-markdown.js`. **`coffee.markdown.toHtml`**. |
| 3 | **Indexed “faux BaaS” CRM** — contacts table, add/remove | COFFEE-UI, COFFEE-BASE, COFFEE-QUE, COFFEE-WIRE, COFFEE-DRIVE | [TEST8](TESTING/TEST8-CRM.html) | Load **drive → wire → que** then **`coffee.base(projectKey)`** — see **COFFEE-BASE/README**. |
| 4 | **Task board (local)** — columns, drag optional | COFFEE-UI, COFFEE-TASK | [TEST9](TESTING/TEST9-TASKBOARD.html) | **`coffee.task.createStore(...)`** + **`coffee.task.date.toKey`** — no Kanban in module; board UI is yours. |
| 5 | **Habit / streak tracker** | COFFEE-UI, COFFEE-DRIVE | [TEST10](TESTING/TEST10-HABITTRACKER.html) | **Not** `coffee.cadence.getStreak` — **COFFEE-CADENCE** = music **`transportStrip`**. Streaks = **your date math** + **`coffee.drive('app').save/load`**. |
| 6 | **Toast / notification lab** — try every feedback pattern | COFFEE-UI, COFFEE-TOAST | [TEST11](TESTING/TEST11-TOAST.html) | **`coffee.toast(msg, type?, duration?)`** (string type); compare **`coffee.msg`** (UI). |
| 7 | **Modal & form sandbox** | COFFEE-UI, COFFEE-MODAL, COFFEE-FORMS | [TEST12](TESTING/TEST12-MODAL.html) | **`coffee.modal(content, { title, onClose })`** — **`coffee.form({ fields, onSubmit, … })`**. |
| 8 | **CLI-ish terminal pane** (mock FS) | COFFEE-UI, COFFEE-TERMINAL | [TEST13](TESTING/TEST13-CLI.html) | Expect terminal DOM; **`load-all`** may log if shell missing. Wire **COFFEE-FILE** later. |
| 9 | **Mini code playground** | COFFEE-UI, COFFEE-MONACO | [TEST14](TESTING/TEST14-CODEPLAYGROUND.html) | **`coffee.monaco`** / embed API — see **COFFEE-MONACO/README**. |
| 10 | **Chart explorer** — series from JSON | COFFEE-UI, COFFEE-GRAPH | [TEST15](TESTING/TEST15-GRAPHEXPLORE.html) | **`coffee.graph({ target: canvas, type: 'bar'\|'line', data: number[], labels, roast })`** — **not** node–link graphs. |
| 11 | **Graphviz DOT diagram** | COFFEE-UI, COFFEE-DRIVE (optional) | [TEST16](TESTING/TEST16-GRAPHVIZ.html) | **Graphviz:** **Viz.js** `new Viz().renderSVGElement(dot)` — **not** `coffee.dot(string)`. **COFFEE-DOT** = **`coffee.dot.create(canvas)`** 2D **game** renderer. |
| 12 | **2D scene toy** — shapes + `custom` draw | COFFEE-UI, COFFEE-SCENE2D | [TEST17](TESTING/TEST17-SCENE2D.html) | **`coffee.scene2d({ shapes, custom, … })`** — **not** sprite/pan-zoom APIs; see **COFFEE-SCENE2D/coffee-scene2d.js**. |
| 13 | **3D gallery** — declarative shapes, orbit | COFFEE-UI, COFFEE-SCENE3D + Three.js | [TEST4](TESTING/TEST4-3D.html), [TEST18](TESTING/TEST18-SCENE3D.html) | **`coffee.scene3d({ shapes, … })`** + **`THREE`** (and **OrbitControls** if orbit). **TEST4** = cherry-pick; **TEST18** = **`load-all.js`**. |
| 14 | **Canvas draw pad** — save PNG | COFFEE-UI, COFFEE-DRAW, COFFEE-FILE | [TEST19](TESTING/TEST19-DRAW.html) | **`coffee.draw({ brush, width, height, … })`**, append wrapper; **`coffee.file.save(blob, { suggestedName, … })`**. **`load-all.js`** must load **scene2d before draw**; **TEST19** preloads **`coffee-scene2d.js`** so **jsDelivr `@main`** works even if the remote **`load-all`** order is stale. |
| 15 | **SVG icon composer** | COFFEE-UI, COFFEE-SVG | — | **`coffee.svg`** API — see **COFFEE-SVG/README** + **SVG-POC1**. |
| 16 | **Pattern / tile generator** | COFFEE-UI, COFFEE-PATTERN | — | **`coffee.pattern`** — see **COFFEE-PATTERN/coffee-pattern.js** header. |
| 17 | **Shader thumbnail grid** | COFFEE-UI, COFFEE-SHADER or COFFEE-GPU | — | **`coffee.shader`** / **`coffee.gpu`** — read package **README** + **DEMO** HTML. |
| 18 | **Procedural “coil” art** | COFFEE-UI, COFFEE-COIL | — | **`coffee.coil`** + presets — **COFFEE-COIL/README**. |
| 19 | **Shadow / preset visualizer** | COFFEE-UI, COFFEE-SHADOW | — | **`coffee.shadow`** — **COFFEE-SHADOW/coffee-shadow.js** + `presets/`. |
| 20 | **Shade ramp editor** | COFFEE-UI, COFFEE-SHADE | — | **`coffee.shade`** — **COFFEE-SHADE/README**. |
| 21 | **Pixel editor (micro)** | COFFEE-UI, COFFEE-PIX | — | **`coffee.pix`** — **COFFEE-PIX/README** + **PIX-POC1**. |
| 22 | **ASCII / brand splash** | COFFEE-UI, COFFEE-BRAND | — | **`coffee-os-ascii`** (or **COFFEE-BRAND** exports) **+** **`coffee.heading`**. |
| 23 | **Shell layout demo** | COFFEE-UI, COFFEE-SHELL | — | **`coffee.shell`** / **`coffee.appShell`** — **COFFEE-SHELL** + **COFFEE-UI/ARCH**. |
| 24 | **Screen / capture helper UI** | COFFEE-UI, COFFEE-SCREEN | — | **`coffee.screen`** — pair **COFFEE-CONTROL** if camera needed. |
| 25 | **Chat stub** — local transcripts only | COFFEE-UI, COFFEE-CHAT | — | **`coffee.chat`** — **COFFEE-CHAT** README; later **CONNECT / TRANSPORT / NOSTR / MASTO**. |
| 26 | **Peer “room” ping** | COFFEE-UI, COFFEE-PEER | — | **`coffee.peer`** — **COFFEE-PEER/README**. |
| 27 | **AI prompt + key config** (no server) | COFFEE-UI, COFFEE-AI | — | **`coffee.aiConfig`** / **`coffee-ai-config`** patterns — **COFFEE-AI/README**. |
| 28 | **Rusty / WASM demo shell** | COFFEE-UI, COFFEE-RUSTY | — | **`coffee.rusty`** — **COFFEE-RUSTY/coffee-rusty.js** + **RUSTY-DEMO**. |
| 29 | **Git status viewer** (read-only mock) | COFFEE-UI, COFFEE-GIT | — | **`coffee.git`** — **COFFEE-GIT/coffee-git.js**; mock data until real repo. |
| 30 | **Distro passport viewer** | COFFEE-UI, COFFEE-DISTRO | — | **COFFEE-DISTRO** — manifest + page patterns; align with **`cc-keypassideation`** / server distro. |

---

## Key calls & schemas (copy-paste shapes — verify in source)

Use this section to avoid **wrong API stories** (e.g. `coffee.filter` for text, `coffee.dot` for Graphviz). Always confirm in **`coffee-*.js`** / **`README.md`**.

### 1 — Command bar
- `coffee.list(items, { renderItem, onItemClick, gap })` — **not** `coffee.list(items, fn)`.
- Fuzzy: `items.filter(x => x.title.toLowerCase().includes(q))` or your own.
- Optional web: `await coffee.nebula.wikiSearch(q, { limit, images: false })` (needs **`coffee.request`**).

### 2 — Markdown
- **`marked`** (npm CDN) **before** `coffee-markdown.js` (or `load-all` loads markdown **without** marked — add script first).
- `coffee.markdown.toHtml(md)`; `coffee.markdown.supported()`.

### 3 — CRM / faux BaaS
- Order: **COFFEE-DRIVE** → **COFFEE-WIRE** → **COFFEE-QUE** → **COFFEE-BASE**.
- `coffee.base(projectKey)` → `{ collection, add, … }` if deps wired — **COFFEE-BASE/coffee-base.js**.

### 4 — Task board
- `coffee.task.date.toKey(new Date())`, `coffee.task.createStore({ … })` — see **coffee-task.js** for store API.
- Persistence: **`coffee.drive('app').save({ id, … })`**, **not** `drive.get`/`put` on singleton.

### 5 — Habits / streaks
- **No** `coffee.cadence.getStreak`. **COFFEE-CADENCE:** `coffee.cadence.transportStrip` (music).
- Streaks: **your own** date logic; **`coffee.drive`** or **`localStorage`**.

### 6 — Toast
- `coffee.toast(message, type?, duration?)` — **type** is a **string** (e.g. `'success'`, `'error'`), not `{ type: '…' }` (if loaded; **COFFEE-TOAST**).

### 7 — Modal + forms
- `coffee.modal(contentNode, { title, onClose, closeOnOverlay })` — **not** one merged `{ title, content }` object.
- `coffee.form({ fields: [{ name, type, label, required, … }], onSubmit })`.

### 8 — Terminal
- **COFFEE-TERMINAL** attaches to expected DOM; **load-all** may error if nodes missing — cherry-pick or stub DOM.

### 9 — Monaco
- **COFFEE-MONACO** — `coffee.frame` / monaco helpers per **README**; **vs/loader** from CDN.

### 10 — COFFEE-GRAPH (charts)
- `coffee.graph({ target: canvas, type: 'bar'|'line', data: number[], labels?: string[], roast?: 'light'|'medium'|'dark'|'espresso' })`.
- **`target`** = **`<canvas>`** or id — **not** a `<div>`. **Not** `{ nodes, links }`.

### 11 — Graphviz DOT (language)
- **Not** `coffee.dot(dotSource)` — **COFFEE-DOT** is **`coffee.dot.create(canvas)`**, **`coffee.dot.draw`**, … (game 2D).
- **Viz.js:** `viz = new Viz(); await viz.renderSVGElement(dotString)` → append `<svg>`.

### 12 — SCENE2D
- **`coffee.scene2d({ shapes, background, custom, container, width, height })`** — **COFFEE-SCENE2D/coffee-scene2d.js**; **`wrapper.scene2d.render()`**. No built-in sprites/pan-zoom API.

### 13 — SCENE3D
- `THREE` script **before** `coffee-scene3d.js`.
- `coffee.scene3d({ shapes: [{ type, position, … }], camera, controls: 'orbit'|false, container, width, height })`.
- `wrapper.scene3d` → `{ scene, camera, renderer, THREE }`.

### 14 — Draw + file
- **`coffee.draw({ brush, width, height, … })`** — append returned node; **`wrapper.draw.setBrush`**, **`wrapper.draw.clear`**, etc. (**not** `(container, opts)`).
- **`coffee.file.save(blob, { suggestedName, types })`** — see **COFFEE-FILE/coffee-file.js**.

### 15 — SVG
- **`coffee.svg`** — **COFFEE-SVG/README**.

### 16 — Pattern
- **`coffee.pattern`** — **COFFEE-PATTERN/coffee-pattern.js**.

### 17 — Shader / GPU
- **`coffee.shader`** / **`coffee.gpu`** — read **COFFEE-SHADER**, **COFFEE-GPU** demos.

### 18 — Coil
- **`coffee.coil`** — **COFFEE-COIL/README**, presets under **COFFEE-COIL/presets/**.

### 19 — Shadow
- **`coffee.shadow`** — **COFFEE-SHADOW/coffee-shadow.js**, JSON presets.

### 20 — Shade
- **`coffee.shade`** — **COFFEE-SHADE/README**.

### 21 — Pix
- **`coffee.pix`** — **COFFEE-PIX/README**.

### 22 — Brand / ASCII
- **COFFEE-BRAND** exports (e.g. **`coffee-os-ascii`**) + **COFFEE-UI** headings.

### 23 — Shell
- **`coffee.shell`** / **`coffee.appShell`** — **COFFEE-SHELL**, **COFFEE-UI**.

### 24 — Screen
- **`coffee.screen`** — **COFFEE-SCREEN**; **COFFEE-CONTROL** for camera if needed.

### 25 — Chat
- **`coffee.chat`** — **COFFEE-CHAT** implementation docs.

### 26 — Peer
- **`coffee.peer`** — **COFFEE-PEER/README**.

### 27 — AI
- **`coffee.ai`**, **`coffee-ai-config`** — **COFFEE-AI/README**, **coffee-ai-config.js**.

### 28 — Rusty
- **`coffee.rusty`** — **COFFEE-RUSTY/coffee-rusty.js** + demos.

### 29 — Git
- **`coffee.git`** — **COFFEE-GIT/coffee-git.js**.

### 30 — Distro
- **COFFEE-DISTRO** — manifest + HTML patterns; cross-link **cc-keypassideation** / server.

---

## CDN strategy (quick)

- **Default dogfood:** `load-all.js` + `coffee:cdn:ready` / `COFFEE_LOAD_ALL_PROMISE` so every `coffee-*` root in the chain is available—**TEST pages cover rows 1–14**; rows **15–30** still need new HTML when you pick them up.
- **Slim pages:** Three.js + `coffee-ui.js` + `coffee-scene3d.js` (gh) for 3D only; or `import-map.js` + `import()` for **true ESM** like `COFFEE-CASH/cash-core.js`, `COFFEE-POSIX/coffee-posix.js` (see `load-all.js` `ESM_SPECS`).
- **Extra deps:** **`marked`** (markdown), **Viz.js** (Graphviz), **Monaco loader** (editor) — load **before** the Coffee script that depends on them (or before `load-all` for marked).
- **Dogfood outcome:** Each app should produce a short **“gaps” note** (missing API, wrong load order, doc typo)—feed into `COMMUNITY-STACK-GAPS*.md` if it’s structural.

## Modules referenced (alphabetical)

BASE, BRAND, CADENCE, CHAT, COIL, CONTEXT, CONTROL (often paired with UI), DISTRO, DOT, DRAW, DRIVE, FILE, FILTER, FORMS, GIT, GPU, GRAPH, LIST, MARKDOWN, MASTO (stretch), MODAL, MONACO, NOSTR (stretch), OMNI (stretch), PATTERN, PEER, PIX, POSIX, QUE, REQUEST, RUSTY, SCENE2D, SCENE3D, SCREEN, SHADE, SHADER, SHADOW, SHELL, SVG, TASK, TERMINAL, TOAST, TRANSPORT, UI (+ FLAGSHIP), WIRE—plus **COFFEE-CASH** for dataflow demos and **COFFEE-AI** for config UX.

Not every pair is wired yet; treat the table as a **backlog of experiments**, not guarantees.
