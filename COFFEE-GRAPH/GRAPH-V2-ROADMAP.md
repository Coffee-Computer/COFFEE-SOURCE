# CoffeeGraph v2 — Roadmap

Planned improvements and enhancements for the next version of CoffeeGraph.

---

## High Impact

### 1. Y-Axis Labels

**Problem:** Grid lines exist but no value labels on the left. Users can't read values without hovering.

**Solution:** Add tick labels on the Y-axis (e.g. 0, max/4, max/2, 3max/4, max). Support configurable scale/formatter.

**API idea:**
```js
coffee.graph({
  // ...
  yAxisLabels: true,           // default true
  yAxisFormatter: (val) => val // optional: custom format (e.g. currency, %)
});
```

---

### 2. Data Refresh / Update API

**Problem:** No way to update data without re-calling `coffee.graph()`. Re-attaching listeners causes flicker and extra work.

**Solution:** Add `coffee.graph.update(target, { data, labels })` that re-renders without re-attaching listeners.

**API:**
```js
coffee.graph.update('barChart', {
  data: [20, 35, 10, 8, 25],
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
});
```

**Implementation:** Look up `_chartState` by canvas, merge new config, call `drawChart`, update `state.bounds`.

---

### 3. Retina / Device Pixel Ratio

**Problem:** Canvas can look blurry on high-DPI screens (e.g. retina displays).

**Solution:** Scale canvas `width`/`height` by `devicePixelRatio`, keep CSS size the same. Scale `ctx` before drawing.

**Implementation:**
```js
const dpr = window.devicePixelRatio || 1;
canvas.width = w * dpr;
canvas.height = h * dpr;
ctx.scale(dpr, dpr);
// Then draw using logical (w, h) coordinates
```

**Note:** `getCanvasCoords` already handles DPR for hit-testing; ensure consistency.

---

## Medium Impact

### 4. Export

**Problem:** No way to save charts as images.

**Solution:** Add `coffee.graph.pour(target)` or `coffee.graph.export(target)` returning a data URL or triggering download.

**API:**
```js
coffee.graph.pour('barChart');           // returns data URL
coffee.graph.pour('barChart', 'png');   // optional format
// Or: download as file
coffee.graph.pour('barChart', 'png', { download: 'chart.png' });
```

---

### 5. Custom Tooltip

**Problem:** Tooltip format is fixed.

**Solution:** Add `tooltipContent: (point) => string` for custom tooltip text.

**API:**
```js
coffee.graph({
  // ...
  tooltipContent: (p) => `${p.label}: $${p.value.toFixed(2)}`
});
```

---

### 6. Edge Data Handling

**Problem:** Empty arrays, single-point data, and all-zero series can cause division or layout issues.

**Solution:**
- `Math.max(...data, 1)` — already handles empty
- Guard `data.length` before division (e.g. `barWidth = data.length ? (width / data.length) * 0.8 : 0`)
- Single-point line: draw as single dot or short segment
- All zeros: show flat line/bars, Y-axis 0–1 or 0–10

---

## Bug Fixes

### 7. onClick Bounds Fix

**Problem:** In `onClick`, the handler uses `bounds` from the closure. After hover-redraw, `state.bounds` is updated but the closure still uses the old bounds. Hit-testing can be inconsistent.

**Solution:** Use `state.bounds` (or `_chartState.get(canvas).bounds`) in the click handler instead of the closure `bounds`.

```js
function onClick(e) {
  const s = _chartState.get(canvas);
  const { x, y } = getCanvasCoords(canvas, e.clientX, e.clientY);
  const hit = hitTest(s.bounds, x, y);  // use s.bounds, not bounds
  if (hit && config.onClick) config.onClick({ index: hit.index, value: hit.value, label: hit.label });
}
```

---

## Nice to Have

### 8. Multiple Series

**Problem:** Can't compare two series on one chart (e.g. Sales vs Projections).

**Solution:** Support `data: [[10,20,30], [5,15,25]]` and `seriesLabels: ['Sales', 'Projections']`. Add legend. Stack or overlap bars; multiple line paths.

**API idea:**
```js
coffee.graph({
  type: 'bar',
  data: [[12, 19, 3], [8, 15, 5]],
  seriesLabels: ['Actual', 'Target'],
  labels: ['Q1', 'Q2', 'Q3']
});
```

---

### 9. Pie Chart

**Problem:** No composition view.

**Solution:** Add `type: 'pie'` for pie/doughnut charts.

**API:**
```js
coffee.graph({
  type: 'pie',
  data: [30, 25, 20, 15, 10],
  labels: ['A', 'B', 'C', 'D', 'E']
});
```

**Implementation:** New `coffee._brewPie(...)` with same signature pattern. Bounds for hit-test: wedge angles or circle per slice.

---

## Implementation Priority

| # | Item              | Effort | Impact |
|---|-------------------|--------|--------|
| 1 | onClick bounds fix| Low    | High   |
| 2 | Y-axis labels     | Low    | High   |
| 3 | Retina support    | Low    | Medium |
| 4 | Data refresh API  | Medium | High   |
| 5 | Export            | Low    | Medium |
| 6 | Custom tooltip    | Low    | Medium |
| 7 | Edge data handling| Low   | Medium |
| 8 | Multiple series   | High   | Medium |
| 9 | Pie chart         | Medium | High   |

---

## File Layout (Post v2)

```
COFFEE-SOURCE/COFFEE-GRAPH/
├── coffee-graph.js
├── COFFEE-GRAPH1-BASE.html
├── COFFEE-GRAPH2-DEMO.html
├── graph-upgrade.md
├── AI-GRAPH-GUIDE.md
└── GRAPH-V2-ROADMAP.md   (this file)
```
