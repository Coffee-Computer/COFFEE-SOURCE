# Territory (coffee.play template)

Side-scrolling **tile sandbox**: procedural terrain + trees, AABB player with gravity, smoothed camera, **hold mouse** to mine or place within reach, **3-slot hotbar** (keys **1–3** or click slots).

## Stack

| Piece | File |
|-------|------|
| Input + loop | `coffee.play` (`../../coffee-play.js`) |
| Headless rules | `coffee.playTerritoryGame` (`../../logic/coffee-play-territory-game.js`) |
| Drawing | `coffee.playShapes` — `drawTerritorySky`, `drawTerritoryBlock`, `drawTerritoryPlayer`, `drawTerritoryCursorTile` (`../../shapes/coffee-play-shapes.js`) |
| Prereqs | `coffee-dot.js`, `coffee-cup.js` (relative to this folder) |

Load order: **dot → cup → shapes → territory logic → play**.

## POC vs template

| | **`TERRITORY1-POC.html`** | **`TERRITORY.html`** |
|---|---------------------------|----------------------|
| Loop | Manual `requestAnimationFrame` | `coffee.play` |
| Keys | `e.code` (`KeyA`, `Space`, …) | CUP lowercase (`a`, ` `, `arrowleft`, …) — logic accepts both styles |
| Mouse | `clientX/Y` (fullscreen ≈ canvas) | `canvasToLocal` each frame for scaled canvas |
| Rules | Inline | `coffee.playTerritoryGame` |

## API sketch (`coffee.playTerritoryGame.create`)

- **`step(dtMs, { keys, mouseCanvasX, mouseCanvasY, mouseDown, viewW, viewH })`** — physics, camera, interaction while mouse down.
- **`getState()`** — `world`, `camera`, `player`, `tileSize`, `worldWidth`, `worldHeight`.
- **`setSelectedSlot(i)`** — hotbar index.
- **`mouseWorldCell(canvasX, canvasY)`** — tile under cursor for highlight.
- **`reset()`** — regen world + respawn player.
- **`BLOCKS`**, **`blockData`**, **`config`** on the instance.

## Customize

Pass **`config`** (tile size, world size, gravity, reach, inventory seed) or **`blockData`** when calling `create({ ... })`.

**`callbacks.onInventory(inventory, selectedSlot, blockData)`** — fired after init and when mining/placing changes slots; **`blockData`** is passed as the third argument so the hotbar can render during `create()` before your instance variable is assigned.
