# coffee.play

Game API built on **coffee.cup** (logic) + **coffee.dot** (render). One-call setup.

## Usage

```js
coffee.play('#stage', {
  onUpdate: (game) => {
    if (!game.player) game.player = game.spawn({ name: 'Player', color: '#00ff88' });
    if (game.keys['w']) game.player.vy -= game.player.speed;
    // ...
  },
  onDraw: (ctx, game) => {
    // Custom overlay
  },
  onAnnounce: (msg) => console.log(msg)
});
```

## API (game object)

- `game.spawn(props)` — add entity
- `game.shoot(origin, targetX, targetY)` — add projectile
- `game.keys`, `game.mouse` — input
- `game.entities`, `game.projectiles` — state
- `game.player` — set by your game
- `game.announce(msg)` — calls onAnnounce
- `game.getDistance(a, b)`, `game.checkCollision(a, b)` — utils
- `game.canvas`, `game.ctx` — canvas refs

## Setup options

- `onUpdate(game)` — called each frame (input, AI, collision)
- `onDraw(ctx, game)` — called after DOT draw (overlay)
- `onAnnounce(msg)` — optional, for announcements
- `friction`, `gravity` — passed to CUP

## Stack

```
coffee.play
    ├── coffee.cup (logic)
    └── coffee.dot (render)
```

## Folder layout

| Path | Role |
|------|------|
| **`coffee-play.js`** | Core play API (root) |
| **`shapes/coffee-play-shapes.js`** | Canvas2D draw helpers (`coffee.playShapes`) |
| **`logic/coffee-play-maze-game.js`** | Headless maze / chase (`coffee.playMazeGame`) |
| **`logic/coffee-play-asteroids-game.js`** | Headless wrap / thrust shooter (`coffee.playAsteroidsGame`) |
| **`logic/coffee-play-platformer-game.js`** | Headless tile platformer (`coffee.playPlatformerGame`) |
| **`logic/coffee-play-tetromino-game.js`** | Headless falling blocks (`coffee.playTetrominoGame`) |
| **`logic/coffee-play-survival-game.js`** | Headless survival / pickups (`coffee.playSurvivalGame`) |
| **`logic/coffee-play-zomboni-game.js`** | Headless zombie waves / twin-stick lite (`coffee.playZomboniGame`) |
| **`logic/coffee-play-farm-game.js`** | Headless tile farm sim (`coffee.playFarmGame`) |
| **`logic/coffee-play-sweet-tooth-game.js`** | Headless candy match grid (`coffee.playSweetToothGame`) |
| **`logic/coffee-play-territory-game.js`** | Headless tile sandbox / mine-place (`coffee.playTerritoryGame`) |
| **`logic/coffee-play-lyfe-game.js`** | Headless life-sim / click-to-move (`coffee.playLyfeGame`) |
| **`logic/coffee-play-bouncy-game.js`** | Headless stacker physics (`coffee.playBouncyGame`) |
| **`TEMPLATES/`**, **`TEST/`**, **`PLAY-DEMO.html`** | Examples |

Load order for a template: **shapes → game logic module → `coffee-play.js`** (each logic file is independent; shapes first is convention).

## Reusable shapes (optional)

**`shapes/coffee-play-shapes.js`** — `coffee.playShapes.*` Canvas2D helpers (Pac / ghost / maze; **Shipz**; **Manny**; **Super Shapes**; **Stay Alive**; **Zomboni**; **myFARM**; **Sweet Tooth**; **Territory**; **LYFE**; **BOUNCY**). **No dependency** on cup/dot/play; use in raw RAF games too.

## Reusable maze / chase logic (optional)

**`logic/coffee-play-maze-game.js`** — **`coffee.playMazeGame`**: headless ASCII maze, pellets, Pac movement, simple ghost wander, power timer, score/lives, collisions. **No canvas** — you draw from **`getState()`** or wire **`step(dt, { wdr, wdc })`** into `coffee.play`.

- **`parseAsciiMaze(rawLines)`** — `#` wall, `.` pellet, `o` power, `S` start, `G` ghost.
- **`readIntent(keys)`** — same arrow/WASD rules as CUP key names.
- **`create({ raw, callbacks?, config? })`** → **`step`**, **`getState`**, **`layoutForCanvas`**, **`reset`**, **`rows` / `cols` / `mazeWalls`**.

**`TEMPLATES/CIRCLE-DUDE/CIRCLE-DUDE.html`** uses **playMazeGame + playShapes + play**.

**`TEMPLATES/SHIPZ/SHIPZ.html`** uses **playAsteroidsGame + playShapes + play** (see **`TEMPLATES/SHIPZ/README.md`**).

**`TEMPLATES/MANNY/MANNY.html`** uses **playPlatformerGame + playShapes + play** (see **`TEMPLATES/MANNY/README.md`**).

**`TEMPLATES/SUPER-SHAPES/SUPER-SHAPES.html`** uses **playTetrominoGame + playShapes + play** (see **`TEMPLATES/SUPER-SHAPES/README.md`**).

**`TEMPLATES/STAY-ALIVE/STAY-ALIVE.html`** uses **playSurvivalGame + playShapes + play** (see **`TEMPLATES/STAY-ALIVE/README.md`**).

**`TEMPLATES/ZOMBONI/ZOMBONI.html`** uses **playZomboniGame + playShapes + play** (see **`TEMPLATES/ZOMBONI/README.md`**).

**`TEMPLATES/MY-FARM/MY-FARM.html`** uses **playFarmGame + playShapes + play** (see **`TEMPLATES/MY-FARM/README.md`**).

**`TEMPLATES/SWEET-TOOTH/SWEET-TOOTH.html`** uses **playSweetToothGame + playShapes + play** (see **`TEMPLATES/SWEET-TOOTH/README.md`**).

**`TEMPLATES/TERRITORY/TERRITORY.html`** uses **playTerritoryGame + playShapes + play** (see **`TEMPLATES/TERRITORY/README.md`**).

**`TEMPLATES/LYFE/LYFE.html`** uses **playLyfeGame + playShapes + play** (see **`TEMPLATES/LYFE/README.md`**).

**`TEMPLATES/BOUNCY/BOUNCY.html`** uses **playBouncyGame + playShapes + play** (see **`TEMPLATES/BOUNCY/README.md`**).

See **`PLAY-SHAPES.md`** — compares **`CIRCLE-DUDE.html`** vs **`CIRCLE-DUDE-POC1.html`**, plus building-block table.

## Demos

- `PLAY-DEMO.html` — combat game (WASD + shoot)
- `TEMPLATES/SHIPZ/SHIPZ.html` — asteroids-style (thrust + aim + fire)
- `TEMPLATES/MANNY/MANNY.html` — tile platformer (camera + stomp + goal)
- `TEMPLATES/SUPER-SHAPES/SUPER-SHAPES.html` — tetromino stacker (lines + levels)
- `TEMPLATES/STAY-ALIVE/STAY-ALIVE.html` — survival (stats, loot, craft)
- `TEMPLATES/ZOMBONI/ZOMBONI.html` — zombie waves (aim + shoot + reload)
- `TEMPLATES/MY-FARM/MY-FARM.html` — cozy farm grid (till, water, plant, harvest)
- `TEMPLATES/SWEET-TOOTH/SWEET-TOOTH.html` — candy match grid (swap, chains, juice)
- `TEMPLATES/TERRITORY/TERRITORY.html` — tile sandbox (mine / place, hotbar, camera)
- `TEMPLATES/LYFE/LYFE.html` — life sim (needs, money, click appliances / walk)
- `TEMPLATES/BOUNCY/BOUNCY.html` — stacker (physics blocks, camera, drop delay)
