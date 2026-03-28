# coffee.brick

Headless 2D physics engine. No canvas, no deps. Universally applicable.

## Usage

```javascript
const world = coffee.brick.world({ width: 400, height: 300, gravity: 0.5, friction: 0.98, restitution: 0.7 });

world.addBody(100, 50, 'circle');
world.addBody(200, 80, 'box');

// Game loop
function loop() {
  world.step();
  const bodies = world.getBodies();
  // Draw bodies with scene2d, raw canvas, or anything
  requestAnimationFrame(loop);
}
```

## API

| Method | Description |
|--------|-------------|
| `coffee.brick.world(opts)` | Create world. opts: `width`, `height`, `gravity`, `friction`, `restitution` |
| `world.addBody(x, y, type, opts)` | Add body. type: `'box'` \| `'circle'`. opts: `vx`, `vy`, `radius`, `width`, `height`, `color` |
| `world.step()` | Advance physics one step |
| `world.getBodies()` | Return array of bodies |
| `world.clear()` | Remove all bodies |
| `world.settings` | `{ gravity, friction, restitution }` |
| `world.bounds` | `{ width, height }` |

## Body shape

Each body has: `x`, `y`, `vx`, `vy`, `type`, `radius` (circle), `width`, `height` (box), `color`.

## Demo

`BRICK-DEMO.html` — Coffee UI controls + raw canvas viewport. Click to spawn.
