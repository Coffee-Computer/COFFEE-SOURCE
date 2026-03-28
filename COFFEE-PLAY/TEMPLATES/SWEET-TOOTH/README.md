# Sweet Tooth — candy matcher arc

**SWEET-TOOTH1-POC.html** stays the Tailwind + RAF POC; **SWEET-TOOTH.html** uses **`coffee.playSweetToothGame`** + **`drawSweetTooth*`** + **`coffee.play`**.

---

## The arc

1. **`SWEET-TOOTH1-POC.html`** — **`async processMatches`** + **`setTimeout`**, global grid, centered board.

2. **`SWEET-TOOTH.html`** — same rules, but combo timing is a **phase state machine** driven by **`step(..., { now })`**: **`pop_wait` (120ms)** → collapse → **`fall_wait` (180ms)** → chain or idle; invalid swap uses **`swap_revert_wait` (200ms)** like the POC.

---

## Logic API — `coffee.playSweetToothGame`

`create({ callbacks?, config?, candyTypes? })` → **`step`**, **`interactCanvas`**, **`getState`**, **`reset`**, **`candyTypes`**, **`config`**.

| | |
|--|--|
| **`step(dt, { now, viewW, viewH })`** | Animates **`offsetY`** / **`scale`**; advances phases when **`now >= phaseUntil`**. |
| **`interactCanvas(x, y, viewW, viewH, now)`** | Hit-test on centered grid: first tap selects, second adjacent tap swaps. Ignored while **`processing`**. |
| **`getState()`** | **`grid`**, **`selected`**, **`score`**, **`level`**, **`juice` (0–100)**), **`offset`** for drawing, dimensions. |
| **`reset()`** | New random grid (no starting matches), stats cleared. |

**Callbacks:** **`onScore(n)`**, **`onJuice({ juice, level })`**. Optional **`onSelect(cell|null)`**.

**Config:** `rows`, `cols`, `tileSize`, `popDelayMs`, `fallDelayMs`, `swapFailDelayMs`, `juicePerCell`, `scorePerCell`, `juiceLevelThreshold`, fall/scale animation speeds.

**Juice / level:** Same as POC: when **`juice >= 100`**, **`juice` resets to `0`** and **`level++`** (excess juice is not kept).

---

## Shapes

| | |
|--|--|
| **`drawSweetToothBoardBorder`** | Magenta frame |
| **`drawSweetToothCheckerCell`** | Light / dark tile tint |
| **`drawSweetToothPickHighlight`** | Cyan selection |
| **`drawSweetToothCandy`** | White-filled emoji, **`scale`** transform |

---

## Scripts (from `TEMPLATES/SWEET-TOOTH/`)

```text
../../../COFFEE-DOT/coffee-dot.js
../../../COFFEE-CUP/coffee-cup.js
../../shapes/coffee-play-shapes.js
../../logic/coffee-play-sweet-tooth-game.js
../../coffee-play.js
```

---

## Controls

Tap / click a candy, then an **orthogonal neighbor** to swap. Invalid swap animates revert delay; valid swap may start match clears and chains.

---

## More docs

- **`../../README.md`** — play stack + `logic/` / `shapes/`.  
- **`../../PLAY-SHAPES.md`** — building-block table.
