# coffee.cup

Game logic framework (headless). State, physics, collision, input. `step(dt)` → state. No rendering.

## Usage

```js
const cup = coffee.cup.create({ width: 800, height: 600 });

const player = cup.spawn({ name: 'Player', color: '#00ff88' });
cup.shoot(player, targetX, targetY);

// Game loop
loop() {
  // Input logic
  if (cup.keys['w']) player.vy -= player.speed;
  // ...
  const state = cup.step(dt);
  coffee.dot.draw(state);  // or your renderer
}
```

## API

- `coffee.cup.create(opts)` — create instance
- `cup.spawn(props)` — add entity
- `cup.shoot(origin, targetX, targetY)` — add projectile
- `cup.step(dt)` — step simulation, returns state
- `cup.getState()` — read-only snapshot
- `cup.keys`, `cup.mouse` — input
- `cup.getDistance(a, b)`, `cup.checkCollision(a, b)` — utils

## State format

```js
{
  width: number,
  height: number,
  entities: [...],
  projectiles: [...]
}
```

## Demos

- `CUP-DEMO.html` — CUP + DOT integration (playable)
