# coffee.draw()

Interactive drawing canvas. Depends on **scene2d**. Optional **`coffee.plex`** (load before draw) for brush modes on live strokes and replay.

## Load order

```html
<script src="coffee-scene2d.js"></script>
<script src="coffee-plex.js"></script>  <!-- optional -->
<script src="coffee-draw.js"></script>
```

## Usage

```js
const view = coffee.draw({
  brush: { size: 10, color: '#000000', opacity: 1, mode: 'pen' },
  background: '#ffffff',
  width: 400,
  height: 300,
  onStrokeComplete: (stroke) => {}
});
document.getElementById('app').appendChild(view);
```

## Options

| Option | Default | Description |
|--------|---------|-------------|
| brush | `{ size: 4, color: '#000', opacity: 1, mode: 'pen' }` | Size (px), color, opacity **0–1**, mode (`pen`, `brush`, `sketch`, `marker`, `eraser` with plex) |
| background | `'#ffffff'` | Canvas background |
| width / height | 400 × 300 | Logical size |
| onStrokeComplete | — | Called when a stroke finishes (≥2 points) |

## Methods (`view.draw`)

| Method | Description |
|--------|-------------|
| `strokes()` | All finished strokes `{ points, size, color, opacity, mode }` |
| `getBrush()` | Current brush settings |
| `setBrush({ size?, color?, opacity?, mode? })` | Update brush for next strokes |
| `clear()` | Remove all strokes |
| `undo()` | Remove last stroke |
| `loadStrokes(arr)` | Replace from serialized array |
| `exportStrokes()` | Plain array for `JSON.stringify` / `coffee.save` |
| `getShapes()` | Paths + metadata for tooling |

## Flagship

**`KITE-ALPHA.html`** — full paint UI on this API + **plex**.
