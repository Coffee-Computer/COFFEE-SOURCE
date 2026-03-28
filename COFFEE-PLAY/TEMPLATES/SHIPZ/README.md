# Shipz — Asteroids-style template arc

Same **Coffee-fication** pattern as **Circle-Dude**: keep the POC as a reference, ship a **stack template** that uses shared **shapes** + **logic** + **`coffee.play`**.

---

## The arc

1. **`SHIPZ1-POC.html`** — **proof of concept**  
   - Single file: classes (`Ship`, `Asteroid`, `Bullet`, `Particle`), manual **`requestAnimationFrame`**.  
   - Tailwind for HUD; vanilla canvas loop.  
   - Mouse aim, click fire, WASD thrust / turn, touch aim + fire.  
   - **Keep it** when you want the original OOP layout or to diff behavior.

2. **`SHIPZ.html`** — **Coffee-stack template**  
   - **`coffee.play`** — CUP keys + mouse, resize, loop.  
   - Rules in **`../../logic/coffee-play-asteroids-game.js`** → **`coffee.playAsteroidsGame`**.  
   - Drawing in **`../../shapes/coffee-play-shapes.js`** → **`drawShip`**, **`drawAsteroidRock`**, **`drawBulletDot`**, **`drawParticle`**.  
   - No Tailwind; same cyan / black vibe as POC.  
   - **Touch**: listeners on `#stage` update aim + fire (CUP does not emit touch as mouse by default).

---

## Scripts (from `TEMPLATES/SHIPZ/`)

```text
../../../COFFEE-DOT/coffee-dot.js
../../../COFFEE-CUP/coffee-cup.js
../../shapes/coffee-play-shapes.js
../../logic/coffee-play-asteroids-game.js
../../coffee-play.js
```

Load order: **dot → cup → shapes → asteroids logic → play**.

---

## Logic API (summary)

`coffee.playAsteroidsGame.create({ callbacks?, config? })` returns:

| Method | Purpose |
|--------|---------|
| **`step(dtMs, input)`** | One tick. `input.bounds { w, h }`, `aimX` / `aimY`, `keys` (CUP lowercase), **`fireRequested`** (one-shot). |
| **`getState()`** | `ship`, `asteroids`, `bullets`, `particles`, `score`, `lives`, `gameOver` |
| **`reset()`** | New run (score, lives, level) |
| **`config`** | Merged constants (thrust, friction, `maxBullets`, etc.) |

Callbacks: **`onScore`**, **`onLives`**, **`onGameOver(finalScore)`**.

---

## More docs

- **`../../README.md`** — `coffee.play` + folder layout (`logic/`, `shapes/`).  
- **`../../PLAY-SHAPES.md`** — building-block table (maze vs asteroids draws).
