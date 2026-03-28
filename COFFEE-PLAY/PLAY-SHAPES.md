# coffee.playShapes + template comparison

## What this is

**`shapes/coffee-play-shapes.js`** — dependency-free Canvas2D helpers on **`coffee.playShapes`**. Use with **`coffee.play`**, a raw **`requestAnimationFrame`** loop (like **CIRCLE-DUDE-POC1**), or anything that has a `ctx`.

Load **before** your game script:

```html
<!-- From COFFEE-PLAY root -->
<script src="./shapes/coffee-play-shapes.js"></script>
<!-- From TEMPLATES/CIRCLE-DUDE/ -->
<script src="../../shapes/coffee-play-shapes.js"></script>
```

## CIRCLE-DUDE.html vs CIRCLE-DUDE-POC1.html

| | **CIRCLE-DUDE.html** | **CIRCLE-DUDE-POC1.html** |
|---|----------------------|---------------------------|
| **Loop** | `coffee.play` → CUP keys + `onUpdate` / `onDraw` | Manual `requestAnimationFrame` |
| **Maze** | ASCII `RAW[]` → walls + pellet list | Numeric `mapTemplate` (mutates on eat) |
| **Coords** | Normalized cell centers (`r,c` + `0.5`) | Pixel `x,y` + fixed `TILE_SIZE` |
| **Entities** | Plain objects + functions | `class Entity` / `Pacman` / `Ghost` |
| **Ghost AI** | Random valid turns | Greedy toward Pac + 20% random |
| **UX** | Full-screen canvas, WASD + **touch D-pad** (≤768px), power pellets | Framed canvas, touch D-pad, overlay replay |
| **Reuse** | Wired to **`coffee.playShapes`** | Good source for **AI + tile map** patterns |

They solve the same game with different architectures. **POC1** is stronger for **OOP + bigger maze + tunnel + greedy ghosts**. **CIRCLE-DUDE** is stronger for **Coffee stack** (play/cup) and **power mode**.

## How to incorporate / learn / extract

1. **Drawing** — Use **`coffee.playShapes`** in both HTML files so Pac/Ghost/pellets/walls stay **one implementation**.
2. **Logic** — **`logic/coffee-play-maze-game.js`** for ASCII Pac-ish chase; future optional **`logic/coffee-play-grid.js`** for POC1-style `Entity` / tunnel on a pixel grid.
3. **Data** — Convert ASCII ↔ numeric matrix with a tiny `parseAsciiMaze()` / `exportNumericMap()` when you want POC1 maps inside play.

## Roadmap (library of “building blocks”)

| Layer | Idea |
|-------|------|
| **Shapes** (done) | `shapes/coffee-play-shapes.js` — maze, **Shipz**, **Manny**, **Super Shapes**, **Stay Alive**, **Zomboni**, **myFARM**, **Sweet Tooth**, **Territory**, **LYFE**, **BOUNCY** |
| **Maze chase logic** (done) | `logic/coffee-play-maze-game.js` — `coffee.playMazeGame` |
| **Asteroids-style logic** (done) | `logic/coffee-play-asteroids-game.js` — `coffee.playAsteroidsGame` (`TEMPLATES/SHIPZ/`) |
| **Platformer logic** (done) | `logic/coffee-play-platformer-game.js` — `coffee.playPlatformerGame` (`TEMPLATES/MANNY/`) |
| **Tetromino / stacker** (done) | `logic/coffee-play-tetromino-game.js` — `coffee.playTetrominoGame` (`TEMPLATES/SUPER-SHAPES/`) |
| **Survival / pickups** (done) | `logic/coffee-play-survival-game.js` — `coffee.playSurvivalGame` (`TEMPLATES/STAY-ALIVE/`) |
| **Zombie wave shooter** (done) | `logic/coffee-play-zomboni-game.js` — `coffee.playZomboniGame` (`TEMPLATES/ZOMBONI/`) |
| **Farm / cozy sim** (done) | `logic/coffee-play-farm-game.js` — `coffee.playFarmGame` (`TEMPLATES/MY-FARM/`) |
| **Candy / match grid** (done) | `logic/coffee-play-sweet-tooth-game.js` — `coffee.playSweetToothGame` (`TEMPLATES/SWEET-TOOTH/`) |
| **Tile sandbox / mine-place** (done) | `logic/coffee-play-territory-game.js` — `coffee.playTerritoryGame` (`TEMPLATES/TERRITORY/`) |
| **Life sim / needs** (done) | `logic/coffee-play-lyfe-game.js` — `coffee.playLyfeGame` (`TEMPLATES/LYFE/`) |
| **Stacker / AABB physics** (done) | `logic/coffee-play-bouncy-game.js` — `coffee.playBouncyGame` (`TEMPLATES/BOUNCY/`) |
| **Grid kinematics** | Extra: POC1 `Entity` pixel grid + tunnel → optional `coffee-play-grid-entity.js` |
| **AI snippets** | `greedyChase(entity, target, opts)` (from POC1 ghosts) |
| **Maze IO** | ASCII done; optional `number[][]` importer |

Keep **shapes** dumb (draw only). Keep **rules** in your game or a future **`coffee-play-grid`** file so you don’t force OOP on `coffee.play` demos.
