# CoffeeGraph — AI Builder Guide

Architecture, implementation notes, and best practices for AI assistants working with CoffeeGraph.

---

## Overview

**CoffeeGraph** is a canvas-based charting library that extends `window.coffee`. It provides bar and line charts with animation, tooltips, click/hover callbacks, and responsive redraw. It is part of the Coffee stack (Control → UI → Graph) and is approved for use in CCE apps.

---

## Load Order

```
coffee-control.js  →  coffee-ui.js  →  coffee-graph.js
```

CoffeeGraph extends `window.coffee` and assumes `coffee.injectTheme`, `coffee.heading`, etc. exist. Load after Control and UI.

---

## API Reference

### `coffee.graph(config)`

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `target` | string \| HTMLCanvasElement | required | Canvas ID or element |
| `type` | `'bar'` \| `'line'` | `'bar'` | Chart type |
| `roast` | string | `'medium'` | Palette: `light`, `medium`, `dark`, `espresso` |
| `data` | number[] | `[]` | Values to plot |
| `labels` | string[] | `[]` | X-axis labels (optional) |
| `animate` | boolean | `true` | Enable entrance animation |
| `animateDuration` | number | `400` | Animation duration (ms) |
| `animateEasing` | string | `'easeOut'` | `linear`, `easeIn`, `easeOut`, `easeInOut` |
| `onClick` | `(point) => void` | — | Called when user clicks a bar/point |
| `onHover` | `(point, isEntering) => void` | — | Called when hover enters/leaves |

**Point shape:** `{ index, value, label }` — `label` is `labels[index]` or `undefined`.

---

## Architecture

### State

- **`_chartState` (WeakMap)** — Per-canvas state: `config`, `bounds`, `hoveredIndex`, `listeners`.
- **`coffee.graphPalettes`** — Roast palettes: `fill`, `stroke`, `accent`.

### Flow

1. **Init** — Resize canvas to `getBoundingClientRect`, set up WeakMap state.
2. **Animation** (if `animate`) — `requestAnimationFrame` loop, `progress` 0→1, `drawChart(canvas, config, { progress })`.
3. **Listeners** — After animation (or immediately if no animation): `mousemove`, `mouseleave`, `click`.
4. **Redraw on hover** — `drawChart(..., { hoveredIndex })`; bounds updated for hit-testing.

### Internal Functions

| Function | Purpose |
|----------|---------|
| `drawChart(canvas, config, opts)` | Main render. `opts`: `{ progress, hoveredIndex }`. Returns bounds. |
| `coffee._brewBar(...)` | Bar chart render. Accepts `progress`, `hoveredIndex`. |
| `coffee._brewLine(...)` | Line chart render. Accepts `progress`, `hoveredIndex`. |
| `hitTest(bounds, x, y)` | Rect (`w`/`h`) or circle (`r`) hit-test. Returns bound object or `null`. |
| `getCanvasCoords(canvas, clientX, clientY)` | Convert client coords to canvas coords (handles DPR). |

### Bounds Shape

- **Bar:** `{ x, y, w, h, index, value, label }` — rect for hit-test.
- **Line:** `{ x, y, r, index, value, label }` — circle (radius `r`) for hit-test.

---

## Implementation Best Practices

### 1. Adding a New Chart Type

1. Add a branch in `drawChart`:
   ```js
   } else if (type === 'pie') {
     bounds = coffee._brewPie(ctx, data, labels, padding, chartWidth, chartHeight, maxVal, roast, progress, hoveredIndex);
   }
   ```
2. Implement `coffee._brewPie(...)` with the same signature pattern: `(ctx, data, labels, padding, width, height, max, roast, progress, hoveredIndex)`.
3. Return an array of bounds objects for hit-testing.

### 2. Adding a New Roast

Extend `coffee.graphPalettes`:

```js
coffee.graphPalettes.mocha = { fill: '#...', stroke: '#...', accent: '#...' };
```

### 3. Modifying Animation

- `progress` is 0→1. Use it to lerp heights (bar) or path length (line).
- Easing lives in `ease(t, type)`. Add new types there if needed.

### 4. Hit-Testing

- **Rect:** bound must have `w` and `h`.
- **Circle:** bound must have `r` (no `w`/`h`).
- Bounds must include `index`, `value`, `label` for callbacks.

### 5. ResizeObserver

CoffeeGraph attaches a `ResizeObserver` to each canvas. On resize it redraws with current `hoveredIndex`. Do not remove this unless replacing with custom resize logic.

---

## Important Notes for AI Usage

### Do

- Use `coffee.graph()` as the only public entry point.
- Pass `target` as ID string or canvas element.
- Use `labels` for x-axis text when available.
- Wire `onClick` / `onHover` for interactivity.
- Keep `coffee-graph.js` self-contained; no external chart libs.

### Don't

- Don't add dependencies (Chart.js, D3, etc.). CoffeeGraph is vanilla Canvas.
- Don't change `drawChart` signature without updating `_brewBar` / `_brewLine` call sites.
- Don't remove `progress` or `hoveredIndex` from `drawChart` opts — animation and hover depend on them.
- Don't assume `labels.length === data.length`; handle mismatches gracefully (existing code does).

### CCE Validation

CoffeeGraph is an **approved** Coffee API. CCE apps may use `coffee.graph` without triggering strict validation. See `CCE-SPEC.md` and `cce-validate.js` for the approved list.

### File Layout

```
COFFEE-SOURCE/COFFEE-GRAPH/
├── coffee-graph.js        # Main library
├── COFFEE-GRAPH1-BASE.html
├── COFFEE-GRAPH2-DEMO.html
├── graph-upgrade.md       # Roadmap / ideas
└── AI-GRAPH-GUIDE.md      # This file
```

---

## Minimal Example

```html
<canvas id="myChart" width="400" height="300"></canvas>
<script>
  coffee.graph({
    target: 'myChart',
    type: 'bar',
    roast: 'dark',
    data: [12, 19, 3, 5, 2],
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    onClick: (p) => console.log('Clicked', p.label, p.value)
  });
</script>
```

---

## Future Ideas (see graph-upgrade.md)

- Multiple series / legend
- Y-axis labels
- Export (PNG/SVG)
- Pie/doughnut charts
