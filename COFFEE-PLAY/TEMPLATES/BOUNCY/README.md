# BOUNCY (coffee.play template)

**Free-form physics stacker**: move the ghost block horizontally, **click** (or tap) to drop. Boxes collide with each other and the floor, bounce, and friction; the **camera** eases up as the tower grows. After each drop, the next random block appears after a short delay (POC: **350ms**).

## Stack

| Piece | File |
|-------|------|
| Input + loop | `coffee.play` (`../../coffee-play.js`) |
| Headless rules | `coffee.playBouncyGame` (`../../logic/coffee-play-bouncy-game.js`) |
| Drawing | `coffee.playShapes` — `drawBouncySkyGradient`, `drawBouncyGround`, `drawBouncyStackBlock`, `drawBouncyDropGuide` |
| Prereqs | `coffee-dot.js`, `coffee-cup.js` |

Load order: **dot → cup → shapes → bouncy logic → play**.

## POC vs template

| | **`BOUNCY1-POC.html`** | **`BOUNCY.html`** |
|---|--------------------------|-------------------|
| Pointer X | `e.clientX` (window) | **`canvasToLocal`** so scaled full-viewport canvas matches buffer coords |
| Drop | `mousedown` / `touchstart` | Same + CUP `mousemove` for ghost X |
| Class | `Shape` + methods | Plain objects in logic |

## API sketch (`coffee.playBouncyGame.create`)

- **`step(dtMs, { viewW, viewH, now? })`** — optional preview spawn after delay, sync preview Y with camera, **sub-step** physics, cull far bodies, smooth **cameraY**.
- **`setPreviewX(canvasX)`** — horizontal center of the ghost (canvas buffer X).
- **`tryDrop()`** — commits preview to **`shapes`**, clears preview, schedules next preview (**`previewDelayMs`**).
- **`getState()`** — `shapes`, `preview`, `cameraY`, `groundY`, `viewW`, `viewH`, `previewYOffset`.
- **`reset()`** — clear tower, reset camera, new preview.

**`callbacks.onDrop(blockCount)`** — optional; fires after each successful drop.

**`config`** — `gravity`, `friction`, `bounce`, `groundY`, `slop`, `percent`, `subSteps`, `cameraLerp`, `previewDelayMs`, `colors`, random `minW`/`maxW`/`minH`/`maxH`, etc.

## Customize

Tune **`config`** for snappier bounces, faster camera, or different block palettes (`colors` array).
