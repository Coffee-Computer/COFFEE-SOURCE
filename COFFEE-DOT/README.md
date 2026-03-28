# coffee.dot

2D canvas render engine for games. Consumes state (entities, projectiles) and draws to canvas. No game logic.

## Usage

```js
const dot = coffee.dot.create(canvas);

// State from coffee.cup or mock
const state = { width, height, entities: [...], projectiles: [...] };
dot.draw(state);
```

## API

- `coffee.dot.create(canvas)` — create renderer
- `dot.draw(state, opts?)` — draw state to canvas
- `dot.resize(w, h)` — resize canvas
- `coffee.dot.draw(ctx, state, opts)` — one-shot draw with your ctx

## State format

```js
{
  width: number,
  height: number,
  camera?: { x, y },
  entities: [{ id, x, y, radius, color, name, ... }],
  projectiles: [{ x, y, color, owner, life, ... }]
}
```

## Demos

- `DOT-DEMO.html` — mock state, no CUP
- `../COFFEE-CUP/CUP-DEMO.html` — CUP + DOT integration
