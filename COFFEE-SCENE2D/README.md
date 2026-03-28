# coffee.scene2d()

Declarative 2D scene. Load after coffee-ui. Raw Canvas 2D — no external deps.

## Usage

```html
<script src="coffee-ui.js"></script>
<script src="coffee-scene2d.js"></script>
```

```js
const view = coffee.scene2d({
  shapes: [
    { type: 'rect', x: 50, y: 50, width: 100, height: 60, fill: '#4c9aff' },
    { type: 'circle', x: 200, y: 100, radius: 40, fill: '#ef4444', stroke: '#fff', strokeWidth: 2 },
    { type: 'line', x1: 280, y1: 80, x2: 350, y2: 120, stroke: '#22c55e', strokeWidth: 3 },
    { type: 'ellipse', x: 400, y: 100, radiusX: 50, radiusY: 30, fill: '#f59e0b' },
    { type: 'arc', x: 100, y: 200, radius: 30, startAngle: 0, endAngle: Math.PI, fill: '#8b5cf6' }
  ],
  background: 'skyblue',
  custom: (ctx) => {
    ctx.ctx.font = '14px sans-serif';
    ctx.ctx.fillStyle = '#333';
    ctx.ctx.fillText('Custom draw', 50, 250);
  },
  width: 450,
  height: 300
});
document.getElementById('app').appendChild(view);
```

## Options

| Option | Default | Description |
|--------|---------|-------------|
| shapes | `[]` | `[{ type, ... }]` |
| background | `'#0a0a0a'` | Canvas background (hex or CSS color name) |
| custom | — | `(ctx) => {}` — escape hatch; ctx = `{ canvas, ctx, width, height, render }` |
| container | — | Selector or element to mount into |
| width | 400 | Canvas width |
| height | 300 | Canvas height |

## Shape types

- **rect** — `x`, `y`, `width`, `height`, `fill`, `stroke`, `strokeWidth`
- **circle** — `x`, `y`, `radius`, `fill`, `stroke`, `strokeWidth`
- **line** — `x1`, `y1`, `x2`, `y2`, `stroke`, `strokeWidth`
- **arc** — `x`, `y`, `radius`, `startAngle`, `endAngle` (radians), `fill`, `stroke`, `strokeWidth`
- **ellipse** — `x`, `y`, `radiusX`, `radiusY`, `fill`, `stroke`, `strokeWidth`
- **path** — `points` ([[x,y],[x,y],...]), `stroke`, `strokeWidth`, `fill`

## Escape hatch

`custom: (ctx) => {}` runs after the scene is built. Use raw Canvas 2D:

```js
custom: (ctx) => {
  ctx.ctx.beginPath();
  ctx.ctx.moveTo(0, 0);
  ctx.ctx.lineTo(ctx.width, ctx.height);
  ctx.ctx.stroke();
}
```

Or mutate later via `view.scene2d`:

```js
const view = coffee.scene2d({ shapes: [...] });
view.scene2d.ctx.fillRect(10, 10, 50, 50);
view.scene2d.render(); // re-draw if shapes changed
```
