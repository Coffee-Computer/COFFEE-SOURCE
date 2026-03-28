# COFFEE-FILTER

Headless **CSS `filter` string** helpers for raster preview and **`CanvasRenderingContext2D.filter`** export. No DOM required for the string builders.

**Pairs with [`COFFEE-PIX`](../COFFEE-PIX/)** — use `coffee.pix` for pixel-level brightness / contrast / saturation, and **`coffee.filterCss.overlay()`** (or `filterCss`) for sepia, blur, grayscale, hue, etc. on top of the canvas element.

**Pairs with [`COFFEE-SHOT`](../COFFEE-SHOT/)** — `coffee.shot` uses `filterCss` so **object presets** become the same string for **`<video>.style.filter`** and **`ctx.filter`** on capture.

## API

| Call | Returns / does |
|------|----------------|
| **`coffee.filterCss(opts)`** | String from any of: `brightness`, `contrast`, `saturate` (%), `sepia`, `grayscale` (%), `blur` (px), `hueRotate` (deg), `invert` (%), `opacity` (0–1). Omitted keys skipped. Empty → `'none'`. |
| **`coffee.filterCss.overlay({ sepia, blur, grayscale })`** | Fixed trio (defaults 0). Same pattern as **Bright House** export. |
| **`coffee.filterCss.apply(el, opts)`** | `el.style.filter = filterCss(opts)` |
| **`coffee.filterCss.applyOverlay(el, o)`** | `el.style.filter = overlay(o)` |

## Load

```html
<script src="../COFFEE-CONTROL/TEST/coffee-control.js"></script>
<script src="../COFFEE-UI/coffee-ui.js"></script>
<script src="./coffee-filter.js"></script>
```

Paths relative to your app (see **Bright House** for flagship example).

## Demo

**`FILTER-DEMO.html`** — live string + sample image.

## CCE

Flagship apps using **`coffee.filterCss`** satisfy strict validation when the script is present and the API appears in the document.
