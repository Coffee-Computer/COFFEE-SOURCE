# coffee.art

Renderer for generative art drawables. Step 3 of COIL → FORGE → ART pipeline.

Consumes drawables from FORGE, draws to canvas.

## Usage

```js
const art = coffee.art.create(canvas);
art.draw(drawables);
```

## API

- `coffee.art.create(canvas)` — create renderer
- `art.draw(drawables)` — draw to canvas
- `coffee.art.draw(ctx, drawables)` — one-shot draw

## Drawable types

- `fill` — rect fill (background)
- `line` — line segment
- `circle` — filled circle
- `rect` — rect (fill and/or stroke)

## Pipeline

COIL (presets) → FORGE (engines) → drawables → ART (render)

## Demos

- `ART-DEMO.html` — Full demo: COIL + FORGE + ART, coffee-ui, param sliders, capture
