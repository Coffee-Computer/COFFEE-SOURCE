# Dogfood app ideas (Coffee Source + CDN)

Small projects to **exercise real modules** and **`load-all.js` / jsDelivr cherry-picks** (see [`README.md`](./README.md), [`AI-CDN-SYSTEM-INSTRUCTION.md`](./AI-CDN-SYSTEM-INSTRUCTION.md)). Pick one row, ship a single HTML or tiny folder, and file gaps you hit.

**Coverage in `COFFEE-CDN/TESTING/`:** the **Dogfood test** column lists a primary **`TEST*.html`** per row **1–30** (see **TEST29**–**TEST35** for rows **24–30**). Extra ad-hoc `TEST*.html` files (e.g. calendars) may exist outside this table. Unrelated demos also exist (e.g. [`TEST2-CALENDAR.html`](./TESTING/TEST2-CALENDAR.html), [`TEST3-TODO.html`](./TESTING/TEST3-TODO.html), [`TEST-CALDENDAR-STYLIZED.html`](./TESTING/TEST-CALDENDAR-STYLIZED.html)) that are not mapped to this 30-row list.

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
| 15 | **SVG icon composer** | COFFEE-UI, COFFEE-SVG | [TEST20](TESTING/TEST20-SVG.html) | **`coffee.svg({ svg, width, height, onSelect })`** returns **`setTool`**, **`updateSelected`**, **`export`**, … — **not** `coffee.svg('circle', attrs)`. See **COFFEE-SVG/coffee-svg.js**. |
| 16 | **Sequencer pattern lab** (piano + drum JSON) | COFFEE-UI, COFFEE-PATTERN | [TEST21](TESTING/TEST21-PATTERN.html) | **`coffee.pattern`** is an **object** (`emptyPianoRoll`, `emptyDrum`, `clone`, …)—**not** `coffee.pattern(opts)` for CSS/PNG tiles. **COFFEE-PATTERN/coffee-pattern.js**. |
| 17 | **WebGPU 3D thumbnail grid** | COFFEE-UI, COFFEE-GPU | [TEST22](TESTING/TEST22-SHADER.html) | **`coffee.gpu({ container, shapes, camera, … })`** — **not** `coffee.gpu(canvas, glsl)` or **`inst.render()`**. Requires **WebGPU**. No **`COFFEE-SHADER`** package here; see **COFFEE-GPU/coffee-gpu.js**. |
| 18 | **Procedural “coil” art** | COFFEE-UI, COFFEE-COIL | [TEST23](TESTING/TEST23-FLOW.html) | **`coffee.coil`** + presets — **COFFEE-COIL/README**. (File name **`FLOW`** is historical; page title is **Coil**.) |
| 19 | **Shadow / preset visualizer** | COFFEE-UI, COFFEE-SHADOW | [TEST24](TESTING/TEST24-SHADOWN.html) | **`coffee.shadow`** — **COFFEE-SHADOW/coffee-shadow.js** + `presets/`. |
| 20 | **Shade ramp editor** | COFFEE-UI, COFFEE-SHADE | [TEST25](TESTING/TEST25-SHADE.html) | **`coffee.shade`** — **COFFEE-SHADE/README**. |
| 21 | **Pixel editor (micro)** | COFFEE-UI, COFFEE-PIX | [TEST26](TESTING/TEST26-PIX.html) | **`coffee.pix`** — **COFFEE-PIX/README** + **PIX-POC1**. |
| 22 | **ASCII / brand splash** | COFFEE-UI, COFFEE-BRAND | [TEST27](TESTING/TEST27-ASCII.html) | **`coffee-os-ascii`** (or **COFFEE-BRAND** exports) **+** **`coffee.heading`**. |
| 23 | **Virtual terminal + VFS** (shell) | COFFEE-UI, COFFEE-SHELL, COFFEE-DRIVE | [TEST28](TESTING/TEST28-SHELL.html) | **`coffee.shell.createSessionAsync`** → **`session.mount()`**, **`session.handleCommand(...)`** — **not** **`session.execute`**. Layout chrome is **`coffee.appShell`** (**COFFEE-UI**), different from **`coffee.shell`**. |
| 24 | **Screen / capture helper UI** | COFFEE-UI, COFFEE-SCREEN | [TEST29](TESTING/TEST29-SCREEN.html) | **`coffee.screen`** — pair **COFFEE-CONTROL** if camera needed. |
| 25 | **Chat stub** — local transcripts only | COFFEE-UI, COFFEE-CHAT | [TEST30](TESTING/TEST30-CHAT.html) | **`coffee.chat`** — **COFFEE-CHAT** README; later **CONNECT / TRANSPORT / NOSTR / MASTO**. |
| 26 | **Peer “room” ping** | COFFEE-UI, COFFEE-PEER | [TEST31](TESTING/TEST31-PEER.html) | **`coffee.peer`** — **COFFEE-PEER/README**. |
| 27 | **AI prompt + key config** (no server) | COFFEE-UI, COFFEE-AI | [TEST32](TESTING/TEST32-AI.html) | **`coffee.aiConfig`** / **`coffee-ai-config`** patterns — **COFFEE-AI/README**. |
| 28 | **Rusty / WASM demo shell** | COFFEE-UI, COFFEE-RUSTY | [TEST33](TESTING/TEST33-RUSTY.html) | **`coffee.rusty`** — **COFFEE-RUSTY/coffee-rusty.js** + **RUSTY-DEMO**. |
| 29 | **Git status viewer** (read-only mock) | COFFEE-UI, COFFEE-GIT | [TEST34](TESTING/TEST34-GIT.html) | **`coffee.git`** — **COFFEE-GIT/coffee-git.js**; mock data until real repo. |
| 30 | **Distro passport viewer** | COFFEE-UI, COFFEE-DISTRO | [TEST35](TESTING/TEST35-DISTRO.html) | **COFFEE-DISTRO** — **`../../COFFEE-DISTRO/distro-config.json`** then same-dir **`distro-config.json`**; align with **`cc-keypassideation`** / server distro. |

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
- **`coffee.svg({ svg: HTMLElement, width, height, onSelect })`** — interactive artboard; **`setTool('select'|'rect'|'circle'|'text')`**, **`updateSelected(prop, val)`**, **`export()`**, **`getSVG()`** — **COFFEE-SVG/coffee-svg.js**. **Not** a tag factory like `coffee.svg('rect', { … })`.

### 16 — Pattern (sequencer)
- **`coffee.pattern.emptyPianoRoll`**, **`emptyDrum`**, **`clone`**, **`isPianoRoll`**, **`isDrum`** — **COFFEE-PATTERN/coffee-pattern.js**. **Not** a visual tile API or **`coffee.pattern()`** function.

### 17 — GPU (WebGPU 3D)
- **`coffee.gpu({ shapes, camera, container, … })`** — **`wrapper.gpu.start`**, **`stop`** — **COFFEE-GPU/coffee-gpu.js**. **Not** GLSL **`coffee.gpu(canvas, code)`** or **`render(uniforms)`**.

### 18 — Coil
- **`coffee.coil`** — **COFFEE-COIL/README**, presets under **COFFEE-COIL/presets/**.
- Dogfood: **[TEST23](TESTING/TEST23-FLOW.html)** (filename **FLOW**, page **Coil**).

### 19 — Shadow
- **`coffee.shadow`** — **COFFEE-SHADOW/coffee-shadow.js**, JSON presets.
- Dogfood: **[TEST24](TESTING/TEST24-SHADOWN.html)**.

### 20 — Shade
- **`coffee.shade`** — **COFFEE-SHADE/README**.
- Dogfood: **[TEST25](TESTING/TEST25-SHADE.html)**.

### 21 — Pix
- **`coffee.pix`** — **COFFEE-PIX/README**.
- Dogfood: **[TEST26](TESTING/TEST26-PIX.html)**.

### 22 — Brand / ASCII
- **COFFEE-BRAND** exports (e.g. **`coffee-os-ascii`**) + **COFFEE-UI** headings.
- Dogfood: **[TEST27](TESTING/TEST27-ASCII.html)**.

### 23 — Shell (terminal)
- **`coffee.shell.createSession` / `createSessionAsync`** — **`mount`**, **`handleCommand`**, **`ctx`**, **`getBanner`** — **COFFEE-SHELL/coffee-shell.js**. **`coffee.appShell`** = app chrome (**COFFEE-UI**), not the VFS terminal.
- Dogfood: **[TEST28](TESTING/TEST28-SHELL.html)**.

### 24 — Screen
- **`coffee.screen`** — **COFFEE-SCREEN**; **COFFEE-CONTROL** for camera if needed.
- Dogfood: **[TEST29](TESTING/TEST29-SCREEN.html)**.

### 25 — Chat
- **`coffee.chat`** — **COFFEE-CHAT** implementation docs.
- Dogfood: **[TEST30](TESTING/TEST30-CHAT.html)**.

### 26 — Peer
- **`coffee.peer`** — **COFFEE-PEER/README**.
- Dogfood: **[TEST31](TESTING/TEST31-PEER.html)**.

### 27 — AI
- **`coffee.ai`**, **`coffee-ai-config`** — **COFFEE-AI/README**, **coffee-ai-config.js**.
- Dogfood: **[TEST32](TESTING/TEST32-AI.html)**.

### 28 — Rusty
- **`coffee.rusty`** — **COFFEE-RUSTY/coffee-rusty.js** + demos.
- Dogfood: **[TEST33](TESTING/TEST33-RUSTY.html)**.

### 29 — Git
- **`coffee.git`** — **COFFEE-GIT/coffee-git.js**.
- Dogfood: **[TEST34](TESTING/TEST34-GIT.html)**.

### 30 — Distro
- **COFFEE-DISTRO** — manifest + HTML patterns; cross-link **cc-keypassideation** / server.
- Dogfood: **[TEST35](TESTING/TEST35-DISTRO.html)** (`distro-config` fetch paths above).

---

## CDN strategy (quick)

- **Default dogfood:** `load-all.js` + `coffee:cdn:ready` / `COFFEE_LOAD_ALL_PROMISE` so every `coffee-*` root in the chain is available—fill gaps in the **Dogfood test** column when you ship a new idea row.
- **Slim pages:** Three.js + `coffee-ui.js` + `coffee-scene3d.js` (gh) for 3D only; or `import-map.js` + `import()` for **true ESM** like `COFFEE-CASH/cash-core.js`, `COFFEE-POSIX/coffee-posix.js` (see `load-all.js` `ESM_SPECS`).
- **Extra deps:** **`marked`** (markdown), **Viz.js** (Graphviz), **Monaco loader** (editor) — load **before** the Coffee script that depends on them (or before `load-all` for marked).
- **Dogfood outcome:** Each app should produce a short **“gaps” note** (missing API, wrong load order, doc typo)—feed into `COMMUNITY-STACK-GAPS*.md` if it’s structural.

## Modules referenced (alphabetical)

BASE, BRAND, CADENCE, CHAT, COIL, CONTEXT, CONTROL (often paired with UI), DISTRO, DOT, DRAW, DRIVE, FILE, FILTER, FORMS, GIT, GPU, GRAPH, LIST, MARKDOWN, MASTO (stretch), MODAL, MONACO, NOSTR (stretch), OMNI (stretch), PATTERN, PEER, PIX, POSIX, QUE, REQUEST, RUSTY, SCENE2D, SCENE3D, SCREEN, SHADE, SHADER, SHADOW, SHELL, SVG, TASK, TERMINAL, TOAST, TRANSPORT, UI (+ FLAGSHIP), WIRE—plus **COFFEE-CASH** for dataflow demos and **COFFEE-AI** for config UX.

Not every pair is wired yet; treat the table as a **backlog of experiments**, not guarantees.
