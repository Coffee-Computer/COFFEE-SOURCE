# coffee.forge

Compile/parse/engine for generative art. Step 2 of COIL → FORGE → ART pipeline.

## Usage

```js
const preset = await coffee.coil.load('flow', 'default');
const runner = coffee.forge.create(preset);
const drawables = runner.step(width, height);
coffee.art.draw(ctx, drawables);
```

## API

- `coffee.forge.create(preset)` — create runner from preset
- `runner.step(w, h)` — produce drawables for this frame
- `runner.reset()` — reset state (particles, frame)
- `coffee.forge.register(name, engine)` — add engine
- `coffee.forge.engines` — param schemas for UI

## Drawable format (FORGE produces)

- `{ type: 'fill', x, y, w, h, style }`
- `{ type: 'line', x1, y1, x2, y2, strokeStyle, lineWidth }`
- `{ type: 'circle', x, y, r, fillStyle }`
- `{ type: 'rect', x, y, w, h, fillStyle, strokeStyle? }`

## Built-in engines

flow, fractal, orbit, glitch (from ART-POC1)

## Demos

- `FORGE-DEMO.html` — COIL + FORGE + ART pipeline
