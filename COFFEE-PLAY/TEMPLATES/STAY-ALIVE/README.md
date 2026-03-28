# Stay Alive — survival template arc

**STAY-ALIVE1-POC.html** stays the Tailwind + RAF POC; **STAY-ALIVE.html** uses **`coffee.playSurvivalGame`** + **`drawSurvivalGrid` / `drawSurvivalPlayer` / `drawSurvivalLootIcon`**.

---

## The arc

1. **`STAY-ALIVE1-POC.html`** — global state, **`setTimeout`** respawns, DOM bars + inventory grid, full-screen canvas + camera on the player.

2. **`STAY-ALIVE.html`** — **`coffee.play`** full viewport; logic handles movement, decay, pickups, **`respawnQueue`** with **`performance.now()`** (no `setTimeout`). Inventory + craft stay in HTML; **`useItem`**, **`tryCraftBandage`**, **`useHotkeyConsumable`** are called from UI / **`E`** edge-detect.

---

## Logic API — `coffee.playSurvivalGame`

`create({ callbacks?, config?, items? })` → **`step`**, **`getState`**, **`reset`**, **`useItem(type)`**, **`tryCraftBandage()`**, **`useHotkeyConsumable()`**, **`config`**, **`items`**.

| **`step(dtMs, input)`** | `keys` (CUP lowercase + `arrowup`…), `viewW`, `viewH`, **`now`** (ms) for respawn timing |
|-------------------------|----------------------------------------------------------------------------------------|
| **`getState()`** | `player`, `camera`, `inventory`, `worldItems`, `items` (icons + stats), `active` |

**Callbacks**

- **`onLog(msg)`** — message line (pickup, craft, use, “Not enough Fiber!”).
- **`onStats({ hp, hunger, thirst })`** — bind to HUD bars.
- **`onInventory()`** — rebuild slots after pickup/use/craft/reset.
- **`onGameOver(cause)`** — `"You starved."` or `"Dehydration took you."` (same rule as POC: hunger ≤ 0 wins the message if both are empty).

**Config highlights:** `worldSize`, `initialLootCount`, `pickupRadius`, `respawnDelayMs`, decay rates, `bandageFiberCost`.

---

## Shapes

| Function | Role |
|----------|------|
| **`drawSurvivalGrid`** | World grid lines from camera |
| **`drawSurvivalPlayer`** | Green circle + white “nose” line (POC look) |
| **`drawSurvivalLootIcon`** | Emoji loot at screen position |

---

## Scripts (from `TEMPLATES/STAY-ALIVE/`)

```text
../../../COFFEE-DOT/coffee-dot.js
../../../COFFEE-CUP/coffee-cup.js
../../shapes/coffee-play-shapes.js
../../logic/coffee-play-survival-game.js
../../coffee-play.js
```

---

## Controls

- **WASD / arrows** — move  
- **E** (tap) — use **Berry** if any, else **Water** (matches POC)  
- **Click inventory slot** — use consumable (Berry / Water / Bandage)  
- **Craft Bandage** — 2 Fiber → 1 Bandage  

---

## More docs

- **`../../README.md`** — play stack + `logic/` / `shapes/`.  
- **`../../PLAY-SHAPES.md`** — building-block table.
