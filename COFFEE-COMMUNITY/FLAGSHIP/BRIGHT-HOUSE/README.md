# Bright House (flagship)

Batch **photo editor** on the Coffee stack: **`coffee.pix`** (canvas pixel engine for brightness / contrast / saturation) + **`coffee.filterCss`** (shared **`filterCss.overlay()`** for sepia / blur / grayscale on preview + export) + **`coffee.control`** + **`coffee.ui`**, **`bright-house.css`** (no Tailwind). Polar cool tint stays as canvas background. Multi-image filmstrip, presets, PNG export.

| File | Role |
|------|------|
| **`BRIGHT-HOUSE-ALPHA.html`** | α entry — CCE meta, `coffee-pix.js`, `coffee-filter.js`, layout, app logic. |
| **`bright-house.css`** | Layout + editor chrome; uses **`--coffee-*`** tokens from `injectTheme()`. |
| **`../../../COFFEE-PIX/coffee-pix.js`** | Headless **`coffee.pix({ canvas })`** — `load`, `adjust`, `reset`. |
| **`../../../COFFEE-FILTER/coffee-filter.js`** | **`coffee.filterCss.overlay(state)`** — same string for `bhCanvas.style.filter` and export `ctx.filter`. |
| **`TEST/BRIGHT-HOUSE2-BATCH.html`** | Legacy Tailwind POC (reference only). |
| **`TEST/BRIGHT-HOUSE1-POC.html`** | Earlier single-image POC. |

### Pipeline

1. **`pix.load(Image)`** — decodes into the preview canvas (respects `maxDim`).
2. **`pix.adjust({ brightness, contrast, saturation })`** — **−100…+100** offsets mapped from the 0–200% sliders (100% = neutral), same contract as **`PIX-DEMO.html`**.
3. **Canvas `style.filter`** — **`coffee.filterCss.overlay({ sepia, blur, grayscale })`** + optional blue wash for Polar.
4. **Export** — offscreen canvas: **`ctx.filter = coffee.filterCss.overlay(state)`**, then `drawImage` the pix canvas (bitmap includes B/C/S).
5. **Compare** — hides the canvas to reveal **`#bh-original`** (unprocessed file).

## Run

Serve over **HTTP** (same-origin scripts). From Community homescreen:

`../FLAGSHIP/BRIGHT-HOUSE/BRIGHT-HOUSE-ALPHA.html`

## Registry

Listed in **`COMMUNITY-HOMESCREEN/devsumer-apps.json`**, homescreen `FALLBACK_APPS`, and **`COMMUNITY-DESKTOP/community-desktop-registry.json`** as **Bright House** / **BRIGHT.EXE**.

## Coffee parity (with Frugal / Speak)

- Loads **`coffee-control`**, **`coffee-ui`**, **`coffee-pix`**, **`coffee-filter`** (same depth as other flagships under `COFFEE-SOURCE`).
- **`coffee.injectTheme('dark'|'light')`** + **Light/Dark** toggle; accent **`#3b82f6`**.
- **`coffee.pix`** for core tonal adjustments; **`coffee.button`** / **`coffee.msg`** for chrome.
- **`coffee.pix.presets`** (`grayscale`, `sepia`, `invert`, `vintage`) are available on the API for future preset buttons; current presets use `adjust` + CSS unless you extend the UI.
