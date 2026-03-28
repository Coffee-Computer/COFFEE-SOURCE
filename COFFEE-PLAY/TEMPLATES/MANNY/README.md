# Manny — platformer template arc

Same pattern as **Circle-Dude** and **Shipz**: **`MANNY1-POC.html`** stays the standalone POC; **`MANNY.html`** is the **coffee.play** stack build with shared **logic** + **shapes**.

---

## The arc

1. **`MANNY1-POC.html`** — **proof of concept**  
   - Classes `Manny`, `Enemy`, manual **`requestAnimationFrame`**.  
   - Numeric **`levelData`** (tile types 1–5), Tailwind HUD + touch `ontouchstart` on globals.  
   - Camera follow, AABB tiles, mystery block score, stomp / death, goal flag.

2. **`MANNY.html`** — **Coffee-stack template**  
   - **`coffee.play`** + CUP keys (**lowercase** `arrowleft`, `arrowright`, `arrowup`, `w`, `a`, `d`, space).  
   - Rules in **`../../logic/coffee-play-platformer-game.js`** → **`coffee.playPlatformerGame`**.  
   - Tiles + hero + goomba in **`../../shapes/coffee-play-shapes.js`**.  
   - **Canvas height** = `rows × tileSize` (world height); width = viewport — synced each frame so it matches the POC layout.  
   - **Touch**: L / R / JUMP buttons merge into the keys object passed to **`step`** (no global `keys`).

---

## Tile legend (level matrix)

| Value | Meaning |
|------|---------|
| `0` | Empty |
| `1` | Ground |
| `2` | Brick |
| `3` | Mystery (? block) |
| `4` | Pipe |
| `5` | Goal pole |

---

## Scripts (from `TEMPLATES/MANNY/`)

```text
../../../COFFEE-DOT/coffee-dot.js
../../../COFFEE-CUP/coffee-cup.js
../../shapes/coffee-play-shapes.js
../../logic/coffee-play-platformer-game.js
../../coffee-play.js
```

---

## Logic API (summary)

`coffee.playPlatformerGame.create({ levelData, enemySpawns?, callbacks?, config? })`

| | |
|--|--|
| **`step(dt, { viewW, viewH, keys })`** | One simulation tick |
| **`getState()`** | `levelData`, `manny`, `enemies`, `cameraX`, `score`, `running`, `endTitle`, … |
| **`reset()`** | Clone level, respawn entities, clear overlay via your UI |

**Callbacks:** **`onScore(score, detail?)`**, **`onGameEnd(title, score)`** — titles match POC: `LEVEL CLEAR!`, `FELL OFF!`, `STOMPED!`.

---

## More docs

- **`../../README.md`** — `coffee.play` + `logic/` / `shapes/` layout.  
- **`../../PLAY-SHAPES.md`** — platformer row in the building-block table.
