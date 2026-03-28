# COFFEE-SHOT

Headless **live preview + still capture** with **CSS `filter`** parity: same effect on `<video>` and on `CanvasRenderingContext2D.filter` when snapping.

**Depends on:** **`coffee.control`** for `coffee.camera()` and **`coffee.switchCamera()`** (selfie ↔ rear on phones). **`coffee.filterCss`** recommended so presets can be **objects**; without it, pass **filter strings** only.

## Load order

```html
<script src="../COFFEE-CONTROL/TEST/coffee-control.js"></script>
<script src="../COFFEE-FILTER/coffee-filter.js"></script>
<script src="./coffee-shot.js"></script>
```

## API

| Call | Description |
|------|-------------|
| **`coffee.shot.resolveFilter(input)`** | `string` → as-is; `object` + `coffee.filterCss` → built string; null/`'none'` → `'none'`. |
| **`coffee.shot.applyLive(videoEl, filter)`** | Sets `videoEl.style.filter` to match capture. |
| **`coffee.shot.capture(videoEl, opts)`** | Returns **data URL**. `opts.filter` = string or filterCss opts. Optional `maxWidth` / `maxHeight` / `maxDim`, `format` (`png`\|`jpeg`), `quality`. |
| **`coffee.shot.stopStream(stream)`** | `getTracks().forEach(stop)` — call on unload or when switching camera. |

## Flagship

**`COFFEE-COMMUNITY/FLAGSHIP/SNAP-SHOT/SNAP-SHOT-ALPHA.html`** — Y2K photobooth UI on this stack.

## Demo

**`SHOT-DEMO.html`** — minimal camera + snap + one filter toggle.

## CCE

Apps using **`coffee.shot`** must include it in the strict allowlist (see **`COFFEE-COMMUNITY/tools/cce-validate.js`**).
