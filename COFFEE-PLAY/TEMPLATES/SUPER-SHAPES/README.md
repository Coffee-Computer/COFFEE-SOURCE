# Super Shapez — tetromino template arc

**SUPER-SHAPES1-POC.html** stays the standalone Tailwind + RAF demo; **SUPER-SHAPES.html** is the **coffee.play** version using **`coffee.playTetrominoGame`** + **`drawTetrominoCell`**.

---

## The arc

1. **`SUPER-SHAPES1-POC.html`** — single-file **`Piece`** class, `drawSquare`, global `moveLeft` / touch hooks, **`requestAnimationFrame`** gravity loop.

2. **`SUPER-SHAPES.html`** — **`coffee.play`** with fixed canvas **`cols × rows × cellSize`** (default **10×20×30px**). **`step(dt, input)`** drives gravity from real **`performance.now()`** delta. One-shot **actions** + **`softDropHeld`** replace inline `Piece` movement.

---

## Logic API — `coffee.playTetrominoGame`

`create({ callbacks?, config?, pieces?, colors? })` → **`step`**, **`getState`**, **`reset`**, **`config`**.

| **`step(dtMs, input)`** | |
|-------------------------|---|
| **`input.actions`** | `moveLeft`, `moveRight`, `rotate`, `stepDown`, `hardDrop` — **booleans**, true only for frames where you want one step (edge-detect keys / tap). |
| **`input.softDropHeld`** | While true, extra downward steps every **50ms** (↓ hold or touch **D**). |

**Callbacks:** `onScore`, `onLines`, `onLevel`, `onGameOver(score, totalLines)`.

**`getState()`:** `board` (cell color strings), `piece` `{ matrix, color, x, y }`, `ghostY`, `vacant`, dimensions, `gameOver`, stats.

**Line clear** uses a standard **shift-down** loop (`y > 0`); the POC had an off-by-one at the top row — the module version clears the top row correctly.

---

## Shapes

**`drawTetrominoCell(ctx, { px, py, size, color, ghost? })`** — filled cell + stroke; **`ghost: true`** uses 30% alpha like the POC ghost piece.

---

## Scripts (from `TEMPLATES/SUPER-SHAPES/`)

```text
../../../COFFEE-DOT/coffee-dot.js
../../../COFFEE-CUP/coffee-cup.js
../../shapes/coffee-play-shapes.js
../../logic/coffee-play-tetromino-game.js
../../coffee-play.js
```

---

## Controls

| Input | Action |
|-------|--------|
| **← / →** | Move |
| **↑** | Rotate |
| **↓** (hold) | Soft drop (fast) |
| **Space** | Hard drop |
| **Touch** | L / ↻ / R tap; **D** hold = soft drop |

---

## More docs

- **`../../README.md`** — play stack + `logic/` / `shapes/`.  
- **`../../PLAY-SHAPES.md`** — building-block table.
