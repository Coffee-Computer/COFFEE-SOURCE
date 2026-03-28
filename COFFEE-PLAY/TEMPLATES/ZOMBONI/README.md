# Zomboni — zombie wave shooter arc

**ZOMBONI1-POC.html** stays the Tailwind + RAF POC; **ZOMBONI.html** uses **`coffee.playZomboniGame`** + **`drawZomboni*`** shapes + **`coffee.play`**.

---

## The arc

1. **`ZOMBONI1-POC.html`** — globals, **`setTimeout`** reload, **`keys['mousedown']`** autofire (rate-limited), wave spawn at screen edges.

2. **`ZOMBONI.html`** — **`reloadEndAt`** + **`Date.now()`** instead of **`setTimeout`**; **`reset(canvasW, canvasH)`** on first frame so the player spawns in the real viewport; touch on canvas = aim + hold shoot (mouse still aims / fires).

---

## Logic API — `coffee.playZomboniGame`

`create({ callbacks?, config? })` → **`step`**, **`getState`**, **`reset(viewW?, viewH?)`**, **`config`**.

| **`step(dtMs, input)`** | |
|-------------------------|---|
| **`viewW` / `viewH`** | Playfield (canvas) size — used for bounds, spawns, bullets |
| **`aimX` / `aimY`** | Screen coords for player facing / shot direction |
| **`keys`** | CUP lowercase + **`arrow*`** for WASD movement |
| **`now`** | ms timestamp (**`Date.now()`**) for fire rate + reload end |
| **`shootHeld`** | While true, **`tryFire`** runs (still gated by **`fireRateMs`**) |
| **`reloadOnRelease`** | One frame when **R** goes pressed → released (matches POC **keyup R**) |

**Callbacks**

- **`onHud({ hp, score, wave, ammo, reloading })`** — bind bars + labels (called most steps while alive).
- **`onReloading(boolean)`** — show / hide “RELOADING…”.
- **`onScore(n)`** — score changed (kills + reset).
- **`onWave(w)`** — after **`startWave`**.
- **`onGameOver(waveNumber)`** — for “survived X waves” (same value POC showed).

---

## Shapes

| | |
|--|--|
| **`drawZomboniArenaGrid`** | `#111` fill is done in template; grid lines `#1a1a1a` / 60px |
| **`drawZomboniBullet`** | Yellow slug |
| **`drawZomboniEnemy`** | Filled circle + look-at-player red eyes |
| **`drawZomboniPlayer`** | Rotated gun rect + blue body + yellow head (POC layout) |
| **`drawParticle`** | Hit / death sparks |

---

## Scripts (from `TEMPLATES/ZOMBONI/`)

```text
../../../COFFEE-DOT/coffee-dot.js
../../../COFFEE-CUP/coffee-cup.js
../../shapes/coffee-play-shapes.js
../../logic/coffee-play-zomboni-game.js
../../coffee-play.js
```

---

## Controls

- **WASD** or **arrows** — move (diagonal normalized like POC)  
- **Mouse** — aim; **hold click** — shoot  
- **Touch** (canvas) — drag aim, hold = shoot  
- **R** (release) — start reload if allowed (POC: **keyup**)  
- Auto reload when mag hits **0** after a shot  

---

## More docs

- **`../../README.md`** — play stack + `logic/` / `shapes/`.  
- **`../../PLAY-SHAPES.md`** — building-block table.
