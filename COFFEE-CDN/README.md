# COFFEE-CDN

Small **browser entrypoints** for using Coffee Source from a static URL (for example [jsDelivr GitHub](https://www.jsdelivr.com/?docs=gh)). Nothing here is a build step: these files run in the page and wire up **import maps** and optional **best-effort full loads**.

## Files

| File | Role |
|------|------|
| [`import-map.js`](./import-map.js) | Injects a single [`<script type="importmap">`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/script/type/importmap) so bare `@coffee/` resolves to your CDN root. |
| [`load-all.js`](./load-all.js) | Same import map, then loads **COFFEE-BASE**, a fixed set of **ES modules**, and sequentially loads **every `COFFEE-*/coffee-*.js` at package root** listed in the file. |

## CDN base URL

Both scripts resolve the repo root **in this order**:

1. `data-coffee-cdn` on the **current** `<script>` tag (must end with `/` or a trailing slash is added).
2. `window.COFFEE_CDN_BASE` (string, should end with `/`).
3. Default: `https://cdn.jsdelivr.net/gh/Coffee-Computer/COFFEE-SOURCE@main/`

Forks should pass **their** raw tree root (same shape as the GitHub paths in this repo).

## `import-map.js` — map only

Use this when you only need **`import` / `import()`** from `@coffee/...` and you will load nothing else via these helpers.

Put it **before** any `<script type="module">` that imports `@coffee/`:

```html
<script
  src="https://cdn.jsdelivr.net/gh/Coffee-Computer/COFFEE-SOURCE@main/COFFEE-CDN/import-map.js"
  data-coffee-cdn="https://cdn.jsdelivr.net/gh/Coffee-Computer/COFFEE-SOURCE@main/"
></script>
<script type="module">
  import { something } from '@coffee/COFFEE-CASH/cash-core.js';
</script>
```

Or set the base first:

```html
<script>
  window.COFFEE_CDN_BASE = 'https://cdn.jsdelivr.net/gh/Coffee-Computer/COFFEE-SOURCE@main/';
</script>
<script src="…/COFFEE-CDN/import-map.js"></script>
```

The map is: **`@coffee/` → `{base}`** (so `@coffee/COFFEE-BASE/coffee-base.js` maps to `{base}COFFEE-BASE/coffee-base.js`).

## `load-all.js` — one tag, whole stack (best-effort)

Use this when you want **one script tag** to pull the **in-repo browser stack** the CDN helpers know about: import map plus scripts, without maintaining your own manifest in HTML.

```html
<script
  src="https://cdn.jsdelivr.net/gh/Coffee-Computer/COFFEE-SOURCE@main/COFFEE-CDN/load-all.js"
  data-coffee-cdn="https://cdn.jsdelivr.net/gh/Coffee-Computer/COFFEE-SOURCE@main/"
></script>
<script>
  window.COFFEE_LOAD_ALL_PROMISE.then(function (result) {
    console.log('CDN base', result.base);
    console.log('Global coffee (if exposed)', window.coffee);
  });
</script>
```

### Load order (as implemented)

1. Inject the same **`@coffee/`** import map as `import-map.js`.
2. Classic script: **`COFFEE-BASE/coffee-base.js`** (if it fails to load, a warning is logged and loading continues).
3. **Parallel** `import()` of the **ESM list** in `load-all.js` (CASH core/cli/context + domains, `COFFEE-POSIX/coffee-posix.js`, `community-coffee-title.js`). Failures are logged per module; the chain still continues.
4. **Sequential** classic `<script src>` for each path in **`CLASSIC_REST`**: every **`COFFEE-*/coffee-*.js` at package root** in the list, with **`COFFEE-UI/coffee-ui.js` before** `coffee-ui-flagship.js`. **`coffee-posix.js` is not** loaded again as classic because it is ESM-only in this flow.

### When it is “done”

- **`window.COFFEE_LOAD_ALL_PROMISE`** resolves with `{ base, esmResults }` (`esmResults` is the array from `Promise.allSettled` on the ESM imports).
- **`window.dispatchEvent(new CustomEvent('coffee:cdn:ready', { detail: { base } }))`** runs after the classic chain finishes.

Listen without touching the promise:

```html
<script>
  window.addEventListener('coffee:cdn:ready', function (e) {
    console.log('Ready, base =', e.detail.base);
  });
</script>
```

## Limitations (read before shipping)

- **Not every `.js` in the monorepo** is loaded. Only paths **hard-coded** in `load-all.js`: top-level `COFFEE-*/coffee-*.js` entries plus the ESM extras. Nested trees (for example `COFFEE-COMMUNITY/tools/*.js`, extra files under `FLAGSHIP/`, etc.) are **out of scope** unless you add them to the file.
- **Order is best-effort.** Some scripts may depend on others that are not in the list or may need a different order; watch the console for 404s and runtime errors.
- **Import maps** apply to **module** graphs. Classic scripts are loaded with **absolute `src=` URLs** (`base + path`); they do not need the map for resolution.
- **Multiple import maps** in one document have [browser rules](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/script/type/importmap); avoid injecting a second map for `@coffee/` on the same page.

## Changing behavior

- **New top-level `coffee-*.js` package:** add one line to `CLASSIC_REST` (and keep UI ordering if it depends on `coffee-ui.js`).
- **New true ES module** used with `import`: add to `ESM_SPECS` and **remove** any duplicate classic entry if one exists.

## Related

In-repo browser scripts assume they are served from a tree whose paths match this repository (e.g. `COFFEE-BASE/coffee-base.js` under the chosen `base`).
