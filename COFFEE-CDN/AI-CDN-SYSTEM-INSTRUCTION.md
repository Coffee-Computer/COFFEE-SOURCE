# System instruction: Coffee Source via CDN

Use this as context for an AI when building pages that load **Coffee-Computer/COFFEE-SOURCE** from a CDN (or a local static mirror with the same folder layout).

## Entry scripts (pick one)

- **`COFFEE-CDN/import-map.js`** — Injects only an import map: bare specifier **`@coffee/`** resolves to the **repository root** (trailing slash). Use with `<script type="module">` and `import` / `import()` from paths like `@coffee/COFFEE-PKG/file.js`. Must run **before** module scripts that import `@coffee/`.

- **`COFFEE-CDN/load-all.js`** — Same import map, then loads **`COFFEE-BASE/coffee-base.js`**, a fixed list of **ES modules**, then a **curated ordered chain** of classic **`coffee-*.js`** at package roots (including **COFFEE-UI**). **One script tag** for “load the known browser stack.”

- **Cherry-pick classic `<script src>` from jsDelivr** — You do **not** have to use `import-map.js` if you only need a few IIFE packages. Use the same raw-Git pattern as the repo, e.g.  
  `https://cdn.jsdelivr.net/gh/Coffee-Computer/COFFEE-SOURCE@main/COFFEE-UI/coffee-ui.js`  
  Load **dependencies first** (order matters). This is how lightweight demos pull **only** UI + one feature script.

## Resolving the repo root (`base`)

The CDN scripts resolve **`base`** in order:

1. `data-coffee-cdn="https://…/"` on the **loader** `<script>` tag  
2. Else `window.COFFEE_CDN_BASE` (string, should end with `/`)  
3. Else default: `https://cdn.jsdelivr.net/gh/Coffee-Computer/COFFEE-SOURCE@main/`

Forks must set **`data-coffee-cdn`** or **`COFFEE_CDN_BASE`** to **their** tree root.

## After `load-all.js` finishes

- **`window.COFFEE_LOAD_ALL_PROMISE`** — Promise resolved when the classic chain completes; resolved value includes `{ base, esmResults }`.
- **`window` dispatches `coffee:cdn:ready`** with **`event.detail.base`**.

Gate app logic on the promise and/or this event so **`window.coffee`** (from COFFEE-UI) exists before calling **`coffee.button`**, **`coffee.row`**, etc.

**Robust pattern (avoids race + duplicate init):** register **`coffee:cdn:ready`** and **`COFFEE_LOAD_ALL_PROMISE.then(...)`**, and use a **`started`** flag so `init()` runs **once**. If the promise is missing (parse failure), guard before `.then`.

**`coffee:cdn:ready` is only emitted by `load-all.js`.** If the page uses **`import-map.js`** alone (or only cherry-picked `<script src>` URLs), **do not** wait on that event—use **`DOMContentLoaded`** / script order / dynamic `import()` completion instead.

**`load-all.js` pulls many packages.** Some scripts assume optional UI in the page and may **log errors** (e.g. missing DOM). That does not always break your app—verify only the APIs you use. For a **minimal surface**, cherry-pick `<script src>` instead of `load-all.js`.

## What **`window.coffee` is (and is not)

- **COFFEE-UI** extends **`window.coffee`** with **UI helpers** (`coffee.button`, `coffee.card`, `coffee.row`, `coffee.col`, …). These are **classic scripts**, not a single `import { Coffee, html } from 'coffee'` package.
- **`coffee.injectTheme('dark' | 'light')`** injects **`:root` CSS variables** only—it does **not** set **`document.body`** background/text. For a **page-level** light/dark chrome, toggle an explicit variable and set **`body`** styles (or your own classes). Don’t rely on **`body.style.background.includes('#111')`**-style hacks; browsers may use **`rgb()`** or leave shorthand empty.
- **`COFFEE-BASE/coffee-base.js`** is an **IIFE** that adds **`coffee.base`** when prerequisites (**coffee-que**, **coffee-wire**, **coffee-drive**, …) are loaded. It does **not** `export` a framework `Coffee` or tagged-template **`html`**.
- Do **not** assume **React-like** `Coffee.state`, `Coffee.mount`, or **`html`** template literals unless the repo **actually** provides that module under a real path—today the main UI story is **`coffee.*` DOM builders** on **`window.coffee`**.

### APIs that are easy to confuse (don’t invent these)

| Wrong / invented | Actual API (module) |
|------------------|----------------------|
| `coffee.filter(array, query, field)` | **COFFEE-FILTER** is **`coffee.filterCss`** (CSS `filter` strings for elements/canvas)—**not** text or array filtering. Use **`Array.prototype.filter`**, fuzzy libs, or your own helper. |
| `coffee.list(items, renderFn)` | **`coffee.list(items, { renderItem, onItemClick, emptyMessage, gap })`** — second arg is an **options object** (**COFFEE-LIST**). |
| `coffee.nebula.search(q)` | **`await coffee.nebula(q, opts?)`** — Wikipedia summary + DuckDuckGo instant answer. **`await coffee.nebula.wikiSearch(q, { limit, wiki, images, … })`** — MediaWiki full-text hits. Depends on **`coffee.request`** (**COFFEE-REQUEST**, included in **`load-all.js`**). |
| `coffee.markdown(md)` as a **callable** | **`coffee.markdown`** is an **object**. Use **`coffee.markdown.toHtml(md)`** or **`coffee.markdown.parse(md)`** (aliases). Optional: **`coffee.markdown.buildPreviewDocument`**, **`assignIframePreview`**, **`createPreviewSession`**. |
| `coffee.drive.get(key)` / `coffee.drive.put(key, string)` | **`coffee.drive` is a factory:** **`var store = coffee.drive('my-app')`**, then **`store.save({ id, … })`**, **`store.load(id)`**, **`store.list()`**, **`store.remove(id)`**, **`store.clear()`**, etc. IndexedDB uses **`keyPath: 'id'`** — persist **objects**, not opaque string blobs on `coffee.drive` itself. |
| `coffee.cadence.getStreak(…)` / habit “cadence” math | **`coffee.cadence`** is **`{ version, transportStrip }`** (**COFFEE-CADENCE**) — **music transport UI** on **`coffee.transport`**, **not** streaks or scheduling. Habit streaks = **your own** date logic (see **`TEST10-HABITTRACKER.html`**). |
| `coffee.modal({ title, content, actions, … })` (one object) | **Signature:** **`coffee.modal(content, { title, onClose, closeOnOverlay })`**. **First arg** = **string** or **HTMLElement** (the body). There are **no** `content` / `actions` / `maxWidth` keys on the second object — add **footer buttons** inside **`content`** (e.g. **`coffee.col([ form, coffee.row([…buttons]) ])`**). Returns **`{ close, element }`**. For confirms, use **`coffee.dialog(message, opts)`**. |
| `coffee.graph(container, opts)` or **`{ nodes, links }`** “network” data | **`coffee.graph` takes one object:** **`coffee.graph({ target, type, data, labels, roast, … })`**. **`target`** must be a **`<canvas>`** (or element id string). **`data`** = **array of numbers** (series values). **`type`:** **`'bar'`** \| **`'line'`**. **`labels`** = categories. **`roast`:** **`light` \| `medium` \| `dark` \| `espresso`** (palette). **Not** a force-directed / node–link graph — use another lib or custom drawing for that. |
| `coffee.dot('digraph { … }')` / Graphviz **DOT** → SVG | **`coffee.dot`** is **not** callable and **not** Graphviz. **COFFEE-DOT** exposes **`coffee.dot.create(canvas)`**, **`coffee.dot.draw`**, etc. — a **2D game canvas** renderer (entities, grid). For **Graphviz DOT** in the browser, add **Viz.js** (or **@hpcc-js/wasm**) separately — see **`TEST16-GRAPHVIZ.html`**. |
| `coffee.scene2d({ sprites, interactive, onClick })` / **`scene.update()`**, **`setPan`**, **`setZoom`** | **`coffee.scene2d({ shapes, background, custom, container, width, height })`** (**COFFEE-SCENE2D**). **`shapes`** are **geometry specs** (`type: 'rect' \| 'circle' \| 'line' \| 'arc' \| 'ellipse' \| 'path'`, plus coords/colors)—**not** emoji “sprites.” Returns a **wrapper**; **`wrapper.scene2d`** is **`{ canvas, ctx, shapes, render, width, height }`**. Call **`wrapper.scene2d.render()`** after mutating **`shapes`**. There is **no** built-in pan/zoom or `onClick`—use **`custom(ctx)`** for extra drawing (e.g. `fillText`) and **`canvas.addEventListener`** for input. See **`TEST17-SCENE2D.html`**. |
| `coffee.svg('circle', { cx, cy, r })` / **`coffee.svg('svg', …)`** as a **tag builder** | **`coffee.svg({ svg, width, height, onSelect })`** (**COFFEE-SVG**) — **one** options object. Pass an existing **`<svg>`** element (or omit to create). Returns an **engine** with **`setTool('select'\|'rect'\|'circle'\|'text')`**, **`getSelected()`**, **`updateSelected(prop, val)`**, **`setFillColor`**, **`clear`**, **`export`**, **`getSVG()`**, … — **not** a DOM factory. Users **draw by dragging** on the artboard. See **`TEST20-SVG.html`**. |
| **`coffee.pattern(opts)`** / **`coffee.pattern.toDataURL`** — visual **CSS** or **PNG** tiles | **`coffee.pattern`** is an **object** (**COFFEE-PATTERN**), **not** a function. Use **`coffee.pattern.emptyPianoRoll({ stepCount, notes })`**, **`emptyDrum({ stepCount, padIds })`**, **`clone(p)`**, **`isPianoRoll`**, **`isDrum`** — **sequencer** JSON for piano + drum machines (**no** audio engine here). See **`TEST21-PATTERN.html`**. |
| **`coffee.gpu(canvas, fragmentShaderString)`** / **`inst.render({ u_time })`** | **`coffee.gpu({ canvas?, container, shapes, camera, background, width, height, custom })`** (**COFFEE-GPU**) — **WebGPU** 3D (**`box`** / **`sphere`** meshes), **WGSL** pipeline built-in—**not** user GLSL fullscreen passes. Returns a **wrapper**; **`wrapper.gpu.stop()`** / **`wrapper.gpu.start()`** control the internal loop—**no** **`render(uniforms)`**. Requires **`navigator.gpu`**. See **`TEST22-SHADER.html`** (filename says “shader”; demo is **GPU** scenes). |
| **`session.execute('banner')`**, **`session.reset()`** (Coffee Shell) | **`coffee.shell.createSession` / `createSessionAsync`** returns **`{ mount, handleCommand, print, … }`** — use **`session.handleCommand('banner')`**, **`session.handleCommand('reset')`**, and **`session.mount()`** first. **`customCommands`** handlers are **`(ctx, args, raw)`**. See **`TEST28-SHELL.html`**. |

Working demos: **`COFFEE-CDN/TESTING/TEST6-COMMANDSEARCH.html`** (actions + `wikiSearch`); **`COFFEE-CDN/TESTING/TEST7-MARKDOWN.html`** (markdown); **`COFFEE-CDN/TESTING/TEST9-TASKBOARD.html`** (**`coffee.drive`**); **`COFFEE-CDN/TESTING/TEST10-HABITTRACKER.html`** (habits + drive); **`COFFEE-CDN/TESTING/TEST12-MODAL.html`** (`coffee.modal` + theme toggle); **`COFFEE-CDN/TESTING/TEST15-GRAPHEXPLORE.html`** (**`coffee.graph`** bar/line + JSON); **`COFFEE-CDN/TESTING/TEST16-GRAPHVIZ.html`** (Graphviz via **Viz.js**, not **`coffee.dot`**); **`COFFEE-CDN/TESTING/TEST17-SCENE2D.html`** (**`coffee.scene2d`**); **`COFFEE-CDN/TESTING/TEST18-SCENE3D.html`** (**`coffee.scene3d`** + **`load-all.js`**); **`COFFEE-CDN/TESTING/TEST19-DRAW.html`** (**`coffee.draw`**); **`COFFEE-CDN/TESTING/TEST20-SVG.html`** (**`coffee.svg`** engine); **`COFFEE-CDN/TESTING/TEST21-PATTERN.html`** (**`coffee.pattern`** sequencer data); **`COFFEE-CDN/TESTING/TEST22-SHADER.html`** (**`coffee.gpu`** WebGPU 3D); **`COFFEE-CDN/TESTING/TEST23-FLOW.html`** (**`coffee.coil`** — filename **FLOW**); **`COFFEE-CDN/TESTING/TEST24-SHADOWN.html`** (**`coffee.shadow`**); **`COFFEE-CDN/TESTING/TEST25-SHADE.html`** (**`coffee.shade`**); **`COFFEE-CDN/TESTING/TEST26-PIX.html`** (**`coffee.pix`**); **`COFFEE-CDN/TESTING/TEST27-ASCII.html`** (ASCII splash + **`coffee.heading`**); **`COFFEE-CDN/TESTING/TEST28-SHELL.html`** (**`coffee.shell`**).

### COFFEE-MARKDOWN

- **`marked` (v4+)** must be on **`window`** **before** **`coffee-markdown.js`** runs. **`load-all.js`** includes **`COFFEE-MARKDOWN/coffee-markdown.js`** but **does not** load **`marked`** — add **`<script src="https://cdn.jsdelivr.net/npm/marked@…/marked.min.js">`** (npm CDN) **above** **`load-all.js`**, or load **`marked`** before a cherry-picked **`coffee-markdown.js`**.
- Without **`marked`**, **`coffee.markdown.toHtml`** throws; **`coffee.markdown.supported()`** is **`false`**.
- Output is **HTML** (treat user markdown as **untrusted** unless sanitized). For styled preview, pair with **github-markdown-css** or **`buildPreviewDocument`** (default links that stylesheet).

### COFFEE-DRIVE (IndexedDB helper)

- **Constructor pattern:** **`const store = coffee.drive('unique-app-name')`**. Wrong: treating **`coffee.drive`** as a singleton with **`.get` / `.put`** on it.
- **Rows:** **`await store.save({ id: 'row-1', title: '…', … })`** — `id` may be auto-generated if omitted. **`await store.load('row-1')`** returns the stored object or **`undefined`**.
- **Docs:** **`COFFEE-DRIVE/coffee-drive.js`** file header. **`load-all.js`** loads **COFFEE-DRIVE** so **`coffee.drive`** exists after **`coffee:cdn:ready`**.
- Demos without persistence can fall back to **`localStorage`** if **`typeof coffee.drive !== 'function'`** or **`store` is null`.

### COFFEE-CADENCE (music transport UI)

- **`coffee.cadence.transportStrip(container, transport)`** builds play/stop/BPM UI for a **`coffee.transport`** instance. Depends **COFFEE-UI** (after **`injectTheme`**) and **COFFEE-TRANSPORT**.
- The name **“cadence”** here means **musical timing / transport** — **do not** assume helpers for **habit tracking**, **cron**, or **`getStreak`**.

### COFFEE-MODAL

- **`coffee.modal(content, opts)`** — **`content`** first (DOM node or HTML string). **`opts`:** **`title`**, **`onClose`**, **`closeOnOverlay`** (default **true**).
- **Compose** actions/Cancel/submit rows **inside** `content`; optionally tweak width via **`modal.element.querySelector('.coffee-modal-box')`** after open.
- **`coffee.dialog(message, opts)`** wraps **`coffee.modal`** for OK/Cancel-style flows.
- **File:** **`COFFEE-MODAL/coffee-modal.js`**.

### COFFEE-GRAPH (canvas charts)

- **API:** **`coffee.graph({ target, type, data, labels, roast, animate, onClick, onHover, … })`** — see **`COFFEE-GRAPH/coffee-graph.js`**.
- **`target`:** required — **canvas** element or **`id`** of a **canvas**. Passing a **`<div>`** yields **`CoffeeGraph: Missing canvas (target)`**.
- **Charts only:** bar/line series. Do **not** confuse with **graph** meaning **nodes and edges** (DAGs, social graphs, etc.).
- **`coffee.graphPalettes`** — light / medium / dark / espresso **roast** colors.

### COFFEE-DOT (2D game canvas, not Graphviz)

- **`coffee.dot`** = **`{ create, draw, drawGrid, drawEntity, drawProjectile }`** — renders **game state** (entities, projectiles, camera) to a **`<canvas>`**. See **`COFFEE-DOT/coffee-dot.js`**.
- **Do not** confuse the package name **DOT** with **Graphviz DOT** language. There is **`coffee.dot.create(canvas)`**, **not** **`coffee.dot(sourceString)`**.
- **Graphviz diagrams:** use an external WASM build (e.g. **Viz.js**) in addition to **`load-all.js`**.

### COFFEE-SCENE2D (Canvas 2D)

- **File:** **`COFFEE-SCENE2D/coffee-scene2d.js`**. Included in **`load-all.js`**—do **not** invent a second filename.
- **API:** **`coffee.scene2d({ shapes, background, custom, container, width, height })`**. **`shapes`:** `{ type: 'rect'|'circle'|'line'|'arc'|'ellipse'|'path', … }` with geometry fields (`x`, `y`, `fill`, `stroke`, etc.)—see file header in **`coffee-scene2d.js`**.
- **`custom: (ctx) => {}`** receives **`ctx`** = **`{ canvas, ctx, width, height, shapes }`** (2D context). Use for text, overlays, or anything beyond built-in shape types.
- **Return value:** **wrapper** element; **`wrapper.scene2d.render()`** redraws after you change **`wrapper.scene2d.shapes`** (same array reference) or when you need a refresh.
- **Not included:** pan/zoom camera, `sprites` arrays, **`scene.update()`** (use **`render()`**), or declarative hit-testing—implement with **`canvas`** listeners and math.
- **Demo:** **`COFFEE-CDN/TESTING/TEST17-SCENE2D.html`**.

### COFFEE-DRAW (sketch pad)

- **Depends on** **`coffee.scene2d`**. **`load-all.js`** lists **`COFFEE-SCENE2D/coffee-scene2d.js` immediately before** **`COFFEE-DRAW/coffee-draw.js`** so scene2d is defined first. Older **`load-all`** builds loaded **draw before scene2d**, which made **`coffee.draw`** a permanent error stub—**preload** `<script src="…/COFFEE-SCENE2D/coffee-scene2d.js"></script>` **before** **`load-all.js`** if you pull **`@main`** from jsDelivr and hit that (see **`TEST19-DRAW.html`**).
- **API:** **`coffee.draw({ brush: { size, color, opacity, mode }, background, width, height, onStrokeComplete })`** — **one** options object; **append** the returned wrapper to the DOM. Methods live on **`wrapper.draw`** (**`setBrush`**, **`clear`**, **`undo`**, **`exportStrokes`**, …)—see **`COFFEE-DRAW/coffee-draw.js`**.
- **Not valid:** **`coffee.draw(container, opts)`**, **`pad.setColor`**, **`pad.toBlob`** — use **`wrapper.draw.setBrush`**, **`wrapper.scene2d.canvas.toBlob`**, etc.
- **Demo:** **`COFFEE-CDN/TESTING/TEST19-DRAW.html`**.

### COFFEE-SVG (vector artboard)

- **File:** **`COFFEE-SVG/coffee-svg.js`**. Included in **`load-all.js`**.
- **API:** **`coffee.svg({ svg: svgElement?, width, height, onSelect })`**. If **`svg`** is an existing **`<svg>`** in the DOM, that node becomes the **artboard**; otherwise the module creates one. **`onSelect`** is called when the selected shape changes (**`HTMLElement | null`**).
- **Return value:** an **object** (not a DOM node), e.g. **`setTool(tool)`** — **`'select'`** \| **`'rect'`** \| **`'circle'`** \| **`'text'`**; **`getTool()`**; **`setFillColor(color)`**; **`getSelected()`**; **`updateSelected(prop, val)`** — geometry (**`x`**, **`y`**, **`width`**, **`height`**, **`cx`**, **`cy`**, **`r`**, …), **`fill`**, **`text`**, **`fontSize`**, **`opacity`**; **`deleteSelected()`**; **`clear()`**; **`export()`** (opens serialized SVG in a new tab); **`getSVG()`** (root **`<svg>`** element).
- **Interaction:** pick a tool and **drag** on the artboard to create shapes; use **Select** and click to edit. Shapes live under **`[data-coffee-svg-shapes]`** inside the SVG.
- **Not included:** declarative **`coffee.svg(tagName, attrs)`** helpers, React-style trees, or Graphviz—this is a **small interactive editor**, not an SVG string templating API.
- **Demo:** **`COFFEE-CDN/TESTING/TEST20-SVG.html`**. Package README / **`SVG-POC1`** for more context.

### COFFEE-PATTERN (sequencer JSON)

- **File:** **`COFFEE-PATTERN/coffee-pattern.js`**. Included in **`load-all.js`**.
- **`coffee.pattern`** is a **plain object** — **do not** call **`coffee.pattern(...)`** as a function.
- **Methods:** **`emptyPianoRoll({ stepCount?, notes? })`** → **`{ kind: 'coffee.pattern.pianoRoll', stepCount, notes: [{ step, row, length? }, …] }`**; **`emptyDrum({ stepCount?, padIds? })`** → **`{ kind: 'coffee.pattern.drum', lanes: { [padId]: (0|1)[] }, … }`**; **`clone(p)`**; **`isPianoRoll(p)`** / **`isDrum(p)`**.
- **Purpose:** serializable **step patterns** for sequencers—**not** wallpaper generators, **not** **`toDataURL`**, **not** CSS **`background-image`**.
- **Demo:** **`COFFEE-CDN/TESTING/TEST21-PATTERN.html`**.

### COFFEE-COIL (generative coil art)

- **File:** **`COFFEE-COIL/coffee-coil.js`** (or package root **`coffee-*.js`** per **`load-all.js`**). **`coffee.coil`** + JSON presets under **`COFFEE-COIL/presets/`** — see **COFFEE-COIL/README**.
- **Demo:** **`COFFEE-CDN/TESTING/TEST23-FLOW.html`** (UI title **Coil**; filename **`FLOW`** is legacy).

### COFFEE-SHADOW (GPU shadow presets)

- **`coffee.shadow`** — **COFFEE-SHADOW/coffee-shadow.js** + JSON under **`presets/`**. Not the same as **COFFEE-SHADE** or **`coffee.shade`**.
- **Demo:** **`COFFEE-CDN/TESTING/TEST24-SHADOWN.html`**.

### COFFEE-SHADE (ramp editor)

- **`coffee.shade`** — **COFFEE-SHADE/README** and **`coffee-shade.js`**. Distinct from **`coffee.shadow`** (**COFFEE-SHADOW**).
- **Demo:** **`COFFEE-CDN/TESTING/TEST25-SHADE.html`**.

### COFFEE-PIX (micro pixel editor)

- **`coffee.pix`** — **COFFEE-PIX/README**; small canvas editor surface, not a CSS pattern tile API.
- **Demo:** **`COFFEE-CDN/TESTING/TEST26-PIX.html`**.

### COFFEE-BRAND / ASCII splash

- **COFFEE-BRAND** exports (e.g. **`coffee-os-ascii`**) plus **COFFEE-UI** **`coffee.heading`** for page chrome.
- **Demo:** **`COFFEE-CDN/TESTING/TEST27-ASCII.html`**.

### COFFEE-SHELL (virtual terminal + VFS)

- **File:** **`COFFEE-SHELL/coffee-shell.js`**. Included in **`load-all.js`**. **Not** the same as **`coffee.appShell`** (layout chrome in **COFFEE-UI**).
- **API:** **`coffee.shell.createSession(opts)`** (sync: **`localStorage`** / **`control`**) or **`coffee.shell.createSessionAsync(opts)`** (IndexedDB via **`coffee.drive`**). Options: **`outputEl`**, **`inputEl`**, **`pathDisplayEl`**, **`scrollEl`**, **`persistence`**, **`driveId`**, **`vfsRecordId`**, **`customCommands`**, … — see **`COFFEE-SHELL/README.md`**.
- **Session object:** **`{ mount, unmount, handleCommand, print, clearOutput, ctx, getBanner }`**. Call **`session.mount()`** after creation so the input listener is wired. Run commands with **`session.handleCommand('banner')`**, **`session.handleCommand('reset')`**, etc.—there is **no** **`session.execute`** or **`session.reset`**.
- **`customCommands[name]`** signature: **`function (ctx, args, raw)`** — use **`ctx.print(...)`** for output.
- **Demo:** **`COFFEE-CDN/TESTING/TEST28-SHELL.html`**.

### COFFEE-GPU (WebGPU 3D)

- **File:** **`COFFEE-GPU/coffee-gpu.js`**. Included in **`load-all.js`**. There is **no** separate **`COFFEE-SHADER`** package in the tree for this stack—**`coffee.gpu`** is the GPU entry point here.
- **API:** **`coffee.gpu({ canvas?, container, shapes, camera, background, width, height, custom })`**. **`shapes`:** **`{ type: 'box' \| 'sphere', position, scale, rotation, color, radius?, rotationSpeed? }`** — see **`coffee-gpu.js`**. **`camera`:** **`{ position, lookAt, up }`**. **`background`:** CSS color string or **`[r,g,b,a]`** 0–1.
- **Return value:** **wrapper** element (**`data-coffee="gpu"`**); **`wrapper.gpu`** exposes **`device`**, **`queue`**, **`canvas`**, etc., plus **`start()`** and **`stop()`** after async init. Rendering runs on an **internal** **`requestAnimationFrame`** loop—**do not** expect **`inst.render(...)`**.
- **Requirements:** **WebGPU** (**Chrome/Edge** with flag or **Safari Technology Preview**, etc.). If unsupported, an error **`<div>`** is shown instead of a scene.
- **Not included:** passing **GLSL** fragment shaders, **2D** shader thumbnails as in Three.js shadertoy clones—use **raw WebGL/WebGPU** elsewhere if you need that.
- **Demo:** **`COFFEE-CDN/TESTING/TEST22-SHADER.html`**.

### COFFEE-SCENE3D (3D)

- **Package directory:** **`COFFEE-SCENE3D`** (not `COFFEE-SCENE-3D`). **File:** **`coffee-scene3d.js`** (not `coffee-scene-3d.js`—that path **404s**).
- **API:** **`coffee.scene3d({ shapes, camera, lights, background, controls, custom, container, width, height })`** returns a **wrapper element**; **`wrapper.scene3d`** is **`{ scene, camera, renderer, THREE, controls }`**. There is **no** `coffee.scene` or `coffee.mesh` in this package.
- **Three.js:** Load **`window.THREE`** **before** any script that defines **`coffee.scene3d`**. Use the **same** Three.js **major** for **`OrbitControls`** (e.g. **`three@0.128.0`** + **`…/examples/js/controls/OrbitControls.js`** from the **same** version). **`controls: 'orbit'`** requires **`THREE.OrbitControls`** on **`window.THREE`**.
- **`container`:** Pass **`container: element`** (or a selector string) so the wrapper mounts **inside** your layout. For **full-viewport** pages, give the container **real size** (e.g. **`position: fixed; inset: 0`** or **`100vw` / `100vh`**) so the internal **`resize()`** loop gets **non-zero** **`getBoundingClientRect()`** on first paint; optionally defer the first build with **`requestAnimationFrame`** (see **`TEST18-SCENE3D.html`**).
- **`load-all.js`** already loads **`coffee-scene3d.js`** after **COFFEE-UI**—you still **must** include **Three + OrbitControls** in **separate** `<script>` tags **above** **`load-all.js`** if you need 3D. Do **not** add a second **`coffee-scene3d.js`** tag unless you are cherry-picking without **`load-all.js`**.
- **Init:** Gate on **`coffee:cdn:ready`** **and/or** **`COFFEE_LOAD_ALL_PROMISE`** with a **`started`** flag so **`coffee.scene3d`** exists and **`THREE`** is ready.
- **`coffee.scene3d`** is a **classic IIFE**; prefer **`<script src="…/coffee-scene3d.js">`** (jsDelivr gh URL) rather than `import '@coffee/…/coffee-scene3d.js'` unless you know the file is valid as an ES module side-effect.
- **Demos:** **`COFFEE-SCENE3D/SCENE3D-DEMO.html`**; **`COFFEE-CDN/TESTING/TEST4-3D.html`** (cherry-pick); **`COFFEE-CDN/TESTING/TEST18-SCENE3D.html`** (**`load-all.js`** + THREE).

## ES modules vs classic

- **`@coffee/...`** in **`<script type="module">`** only works after the **import map** is on the page (from `import-map.js` or `load-all.js`).
- Many **`coffee-*.js`** files are **non-module** IIFEs: load with `<script src="...">` or via **`load-all.js`**; don’t `import` them unless they truly use `export`.

## `load-all.js` limits

- It loads **only** paths listed inside **`load-all.js`** (top-level **`coffee-*.js`** per package + listed ESM paths). It does **not** auto-discover every `.js` in the monorepo or deep paths (e.g. arbitrary `tools/` subtrees).
- Order matters for some dependencies; failures are often **logged** and **non-fatal**—check the console. Example: **`coffee.draw`** must run **after** **`coffee-scene2d.js`** (see **`CLASSIC_REST`** in **`load-all.js`**).

## Editing CDN loader sources (for maintainers)

Inside **`/*.js` block comments** `/* ... */`, the substring **`*/`** **ends the comment**. Avoid glob prose like `COFFEE-*/file.js` in block comments—it **breaks parsing**. Use wording like “`COFFEE-* package`” / “top-level `coffee-*.js`” or line comments.

## Quick HTML patterns

**Import map only (local mirror):**

```html
<script src="/path/to/COFFEE-CDN/import-map.js" data-coffee-cdn="https://cdn.jsdelivr.net/gh/Coffee-Computer/COFFEE-SOURCE@main/"></script>
<script type="module">
  import something from '@coffee/COFFEE-CASH/cash-core.js';
</script>
```

**Full stack, then classic app script:**

```html
<script src="https://cdn.jsdelivr.net/gh/Coffee-Computer/COFFEE-SOURCE@main/COFFEE-CDN/load-all.js"
        data-coffee-cdn="https://cdn.jsdelivr.net/gh/Coffee-Computer/COFFEE-SOURCE@main/"></script>
<script>
  (function () {
    var started = false;
    function init() {
      if (started) return;
      started = true;
      document.body.appendChild(coffee.button('OK', function () { console.log('ok'); }));
    }
    window.addEventListener('coffee:cdn:ready', init);
    var p = window.COFFEE_LOAD_ALL_PROMISE;
    if (p && typeof p.then === 'function') p.then(init).catch(init);
  })();
</script>
```

**Cherry-pick scripts (jsDelivr), e.g. UI + 3D:**

```html
<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"></script>
<script src="https://cdn.jsdelivr.net/gh/Coffee-Computer/COFFEE-SOURCE@main/COFFEE-UI/coffee-ui.js"></script>
<script src="https://cdn.jsdelivr.net/gh/Coffee-Computer/COFFEE-SOURCE@main/COFFEE-SCENE3D/coffee-scene3d.js"></script>
<div id="scene-mount"></div>
<script>
  coffee.injectTheme('dark');
  var mount = document.getElementById('scene-mount');
  coffee.scene3d({
    shapes: [{ type: 'box', scale: 1, position: [0, 1, 0], color: '#4c9aff' }],
    camera: { position: [0, 5, 10], lookAt: [0, 0, 0] },
    controls: 'orbit',
    container: mount,
    width: 400,
    height: 300
  });
</script>
```

**`load-all.js` + Three.js (3D):** put **`three.min.js`** and **`OrbitControls.js`** **before** **`load-all.js`**. Do **not** reference **`coffee-scene-3d.js`** (wrong name). Use **`coffee.scene3d({ …, container: el, … })`** for full-page views when possible.

**`load-all.js` + markdown (remember `marked` first):**

```html
<script src="https://cdn.jsdelivr.net/npm/marked@12.0.0/marked.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/Coffee-Computer/COFFEE-SOURCE@main/COFFEE-CDN/load-all.js"
        data-coffee-cdn="https://cdn.jsdelivr.net/gh/Coffee-Computer/COFFEE-SOURCE@main/"></script>
<script>
  window.addEventListener('coffee:cdn:ready', function () {
    document.getElementById('out').innerHTML = coffee.markdown.toHtml('# Hello\n\n**Coffee**');
  });
</script>
<div id="out"></div>
```

**`load-all.js` + `coffee.drive` (factory + single document row):**

```html
<script src="https://cdn.jsdelivr.net/gh/Coffee-Computer/COFFEE-SOURCE@main/COFFEE-CDN/load-all.js"
        data-coffee-cdn="https://cdn.jsdelivr.net/gh/Coffee-Computer/COFFEE-SOURCE@main/"></script>
<script>
  window.addEventListener('coffee:cdn:ready', async function () {
    var store = coffee.drive('my-demo');
    await store.save({ id: 'settings', theme: 'dark' });
    var row = await store.load('settings');
    console.log(row && row.theme);
  });
</script>
```

Human-readable overview: **`COFFEE-CDN/README.md`**.
