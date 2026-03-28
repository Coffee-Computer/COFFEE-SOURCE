# myFARM — cozy farm template arc

**MY-FARM1-POC.html** stays the Tailwind + RAF POC; **MY-FARM.html** uses **`coffee.playFarmGame`** + **`drawFarm*`** helpers + **`coffee.play`**.

---

## The arc

1. **`MY-FARM1-POC.html`** — globals, **`handleInteract`** with **`getBoundingClientRect`**, centered grid, **`requestAnimationFrame`** loop.

2. **`MY-FARM.html`** — logic is headless; canvas clicks/touches convert to **canvas pixel space** (CSS scale aware) then **`interactCanvas(x, y, w, h, now)`**. Tool bar calls **`setTool`**. Growth runs in **`step`** with **`Date.now()`**.

---

## Logic API — `coffee.playFarmGame`

`create({ callbacks?, config?, crops? })` → **`step`**, **`interactCanvas`**, **`setTool`**, **`getState`**, **`reset`**, **`crops`**, **`config`**.

| Method | Role |
|--------|------|
| **`step(dt, { now })`** | Updates **`growth`** for watered, planted plots (`elapsed / crop.time`). |
| **`interactCanvas(x, y, viewW, viewH, now)`** | Hit-tests centered grid; applies **`currentTool`** (hoe / water / seed-*). |
| **`setTool(id)`** | `'hoe'`, `'water'`, `'seed-wheat'`, `'seed-carrot'`. Fires **`onToolChange`**. |
| **`reset()`** | Coins, grid, tool, HUD callbacks. |

**Callbacks:** **`onCoins(n)`**, **`onStatus(msg)`**, **`onToolChange(tool)`**.

**Default `crops`:** `wheat` (cost 2, sell 6, 5s), `carrot` (5 / 15 / 10s) — same as POC.

**Config:** `tileSize`, `gridRows`, `gridCols`, `startCoins`, `defaultTool`.

---

## Shapes

| | |
|--|--|
| **`drawFarmSoilTile`** | Grass vs tilled vs watered brown; rounded rect (`roundRect` or `arcTo` fallback). |
| **`drawFarmGrowingOverlay`** | Green sprout circle + yellow progress bar. |
| **`drawFarmMatureOverlay`** | Emoji + dashed harvest hint. |

---

## Scripts (from `TEMPLATES/MY-FARM/`)

```text
../../../COFFEE-DOT/coffee-dot.js
../../../COFFEE-CUP/coffee-cup.js
../../shapes/coffee-play-shapes.js
../../logic/coffee-play-farm-game.js
../../coffee-play.js
```

---

## Controls

- **Toolbar** — select tool (hoe, water, wheat seeds, carrot seeds).  
- **Canvas** — click / tap a tile to use the active tool (same rules as POC).  

---

## More docs

- **`../../README.md`** — play stack + `logic/` / `shapes/`.  
- **`../../PLAY-SHAPES.md`** — building-block table.
