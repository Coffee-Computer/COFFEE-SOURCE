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

Working demos: **`COFFEE-CDN/TESTING/TEST6-COMMANDSEARCH.html`** (actions + `wikiSearch`); **`COFFEE-CDN/TESTING/TEST7-MARKDOWN.html`** (markdown); **`COFFEE-CDN/TESTING/TEST9-TASKBOARD.html`** (**`coffee.drive`**); **`COFFEE-CDN/TESTING/TEST10-HABITTRACKER.html`** (habits + drive); **`COFFEE-CDN/TESTING/TEST12-MODAL.html`** (`coffee.modal` + theme toggle).

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

### COFFEE-SCENE3D (3D)

- **Package directory:** **`COFFEE-SCENE3D`** (not `COFFEE-SCENE-3D`). **File:** **`coffee-scene3d.js`** (not `coffee-scene-3d.js`).
- **API:** **`coffee.scene3d({ shapes, camera, background, controls, container, … })`** returns a **wrapper element**; **`wrapper.scene3d`** is `{ scene, camera, renderer, THREE, controls }`. There is **no** `coffee.scene` or `coffee.mesh` in this package.
- **Three.js:** Load **`window.THREE`** *before* `coffee-scene3d.js` (e.g. `three@0.128` from npm CDN). Optional: **`OrbitControls`** on `THREE` if you use **`controls: 'orbit'`** (see **`COFFEE-SCENE3D/SCENE3D-DEMO.html`**).
- **`coffee.scene3d`** is a **classic IIFE**; prefer **`<script src="…/coffee-scene3d.js">`** (jsDelivr gh URL) rather than `import '@coffee/…/coffee-scene3d.js'` unless you know the file is valid as an ES module side-effect.

## ES modules vs classic

- **`@coffee/...`** in **`<script type="module">`** only works after the **import map** is on the page (from `import-map.js` or `load-all.js`).
- Many **`coffee-*.js`** files are **non-module** IIFEs: load with `<script src="...">` or via **`load-all.js`**; don’t `import` them unless they truly use `export`.

## `load-all.js` limits

- It loads **only** paths listed inside **`load-all.js`** (top-level **`coffee-*.js`** per package + listed ESM paths). It does **not** auto-discover every `.js` in the monorepo or deep paths (e.g. arbitrary `tools/` subtrees).
- Order matters for some dependencies; failures are often **logged** and **non-fatal**—check the console.

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
<script src="https://cdn.jsdelivr.net/gh/Coffee-Computer/COFFEE-SOURCE@main/COFFEE-UI/coffee-ui.js"></script>
<script src="https://cdn.jsdelivr.net/gh/Coffee-Computer/COFFEE-SOURCE@main/COFFEE-SCENE3D/coffee-scene3d.js"></script>
<script>
  coffee.injectTheme('dark');
  var el = coffee.scene3d({ shapes: [{ type: 'box', scale: 1, position: [0, 0, 0], color: '#4c9aff' }], width: 400, height: 300 });
  document.body.appendChild(el);
</script>
```

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
