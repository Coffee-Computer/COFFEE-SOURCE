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

**`coffee:cdn:ready` is only emitted by `load-all.js`.** If the page uses **`import-map.js`** alone (or only cherry-picked `<script src>` URLs), **do not** wait on that event—use **`DOMContentLoaded`** / script order / dynamic `import()` completion instead.

## What **`window.coffee` is (and is not)

- **COFFEE-UI** extends **`window.coffee`** with **UI helpers** (`coffee.button`, `coffee.card`, `coffee.row`, `coffee.col`, …). These are **classic scripts**, not a single `import { Coffee, html } from 'coffee'` package.
- **`COFFEE-BASE/coffee-base.js`** is an **IIFE** that adds **`coffee.base`** when prerequisites (**coffee-que**, **coffee-wire**, **coffee-drive**, …) are loaded. It does **not** `export` a framework `Coffee` or tagged-template **`html`**.
- Do **not** assume **React-like** `Coffee.state`, `Coffee.mount`, or **`html`** template literals unless the repo **actually** provides that module under a real path—today the main UI story is **`coffee.*` DOM builders** on **`window.coffee`**.

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
  window.addEventListener('coffee:cdn:ready', function () {
    document.body.appendChild(coffee.button('OK', function () { console.log('ok'); }));
  });
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

Human-readable overview: **`COFFEE-CDN/README.md`**.
